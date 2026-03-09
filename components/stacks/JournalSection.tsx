'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { useEntitlements } from '@/hooks/useEntitlements'
import Link from 'next/link'

interface JournalEntry {
  id: string
  stack_id: string
  user_id: string
  body: string
  is_private: boolean
  created_at: string
}

interface GroupedEntries {
  dateLabel: string
  entries: JournalEntry[]
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function groupByDate(entries: JournalEntry[]): GroupedEntries[] {
  const map = new Map<string, JournalEntry[]>()
  for (const e of entries) {
    const key = new Date(e.created_at).toDateString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return Array.from(map.entries()).map(([, group]) => ({
    dateLabel: formatDateLabel(group[0].created_at),
    entries: group,
  }))
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

interface JournalSectionProps {
  stackId: string
  /** If true, only shows public entries with no form (for public share pages) */
  readOnly?: boolean
}

export function JournalSection({ stackId, readOnly = false }: JournalSectionProps) {
  const { user } = useSupabaseUser()
  const { canUseJournals } = useEntitlements()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [body, setBody] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch entries
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('journals')
      .select('*')
      .eq('stack_id', stackId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEntries(data as JournalEntry[])
      })
  }, [stackId])

  // Realtime: subscribe to new public entries
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`journals:${stackId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'journals', filter: `stack_id=eq.${stackId}` },
        (payload) => {
          const newEntry = payload.new as JournalEntry
          if (!newEntry.is_private) {
            setEntries((prev) => {
              if (prev.some((e) => e.id === newEntry.id)) return prev
              return [newEntry, ...prev]
            })
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [stackId])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed || !user) return

    setSubmitting(true)
    setError(null)

    const optimistic: JournalEntry = {
      id: `optimistic-${Date.now()}`,
      stack_id: stackId,
      user_id: user.id,
      body: trimmed,
      is_private: isPrivate,
      created_at: new Date().toISOString(),
    }
    setEntries((prev) => [optimistic, ...prev])
    setBody('')

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: insertError } = await (supabase as any)
      .from('journals')
      .insert({ stack_id: stackId, user_id: user.id, body: trimmed, is_private: isPrivate })
      .select()
      .single()

    if (insertError) {
      setEntries((prev) => prev.filter((e) => e.id !== optimistic.id))
      setBody(trimmed)
      setError('Failed to save entry. Please try again.')
    } else if (data) {
      setEntries((prev) =>
        prev.map((e) => (e.id === optimistic.id ? (data as JournalEntry) : e))
      )
    }
    setSubmitting(false)
  }, [body, isPrivate, stackId, user])

  const handleDelete = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    const supabase = createClient()
    await supabase.from('journals').delete().eq('id', id)
  }, [])

  const visibleEntries = readOnly ? entries.filter((e) => !e.is_private) : entries
  const grouped = groupByDate(visibleEntries)

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-base font-semibold text-white">
        Journal
        {visibleEntries.length > 0 && (
          <span className="ml-2 text-gray-500 font-normal text-sm">({visibleEntries.length})</span>
        )}
      </h2>

      {/* Entry list grouped by date */}
      {grouped.length === 0 ? (
        <p className="text-sm text-gray-600 mb-6">
          {readOnly ? 'No public journal entries yet.' : 'No entries yet. Start writing about your experience.'}
        </p>
      ) : (
        <div className="space-y-6 mb-6">
          {grouped.map((group) => (
            <div key={group.dateLabel}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-400">
                {group.dateLabel}
              </p>
              <div className="space-y-3">
                {group.entries.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-surface-border bg-surface-raised p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {entry.is_private ? (
                          <span title="Private" className="text-xs text-gray-600">🔒 Private</span>
                        ) : (
                          <span title="Public" className="text-xs text-gray-500">🌐 Public</span>
                        )}
                        <span className="text-xs text-gray-600">{timeAgo(entry.created_at)}</span>
                      </div>
                      {user && entry.user_id === user.id && (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                      {entry.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write form — only for non-readOnly and journal-entitled users */}
      {!readOnly && (
        <>
          {!user ? (
            <div className="rounded-xl border border-surface-border bg-surface-raised p-4 text-center">
              <p className="text-sm text-gray-400 mb-3">Sign in to add journal entries</p>
              <Link
                href="/auth"
                className="inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Sign in
              </Link>
            </div>
          ) : !canUseJournals ? (
            <div className="rounded-xl border border-surface-border bg-surface-raised p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Journals are available on Starter and Pro</p>
              <p className="text-xs text-gray-600 mb-3">Track what happened during each session — private or public.</p>
              <Link
                href="/account/billing"
                className="inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Upgrade to Starter
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What happened during this session? How did it feel? Note any changes…"
                maxLength={1000}
                rows={3}
                className="w-full resize-none rounded-lg bg-surface border border-surface-border px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-600">{body.length}/1000</span>
                  {/* Private / Public toggle */}
                  <button
                    type="button"
                    onClick={() => setIsPrivate((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <span>{isPrivate ? '🔒' : '🌐'}</span>
                    <span>{isPrivate ? 'Private' : 'Public'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {error && <span className="text-xs text-red-400">{error}</span>}
                  <button
                    type="submit"
                    disabled={submitting || !body.trim()}
                    className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving…' : 'Add entry'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}
