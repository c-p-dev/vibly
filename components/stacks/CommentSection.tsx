'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

interface Comment {
  id: string
  stack_id: string
  user_id: string | null
  author_name: string | null
  body: string
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function CommentSection({ stackId }: { stackId: string }) {
  const { user } = useSupabaseUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [authorName, setAuthorName] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameLoadedRef = useRef(false)

  // Load display name for signed-in users
  useEffect(() => {
    if (!user || nameLoadedRef.current) return
    nameLoadedRef.current = true
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const row = data as { display_name?: string | null } | null
        if (row?.display_name) setAuthorName(row.display_name)
      })
  }, [user])

  // Fetch initial comments
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('comments')
      .select('*')
      .eq('stack_id', stackId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setComments(data as Comment[])
      })
  }, [stackId])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`comments:${stackId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `stack_id=eq.${stackId}` },
        (payload) => {
          setComments((prev) => {
            // Avoid duplicates from optimistic insert
            if (prev.some((c) => c.id === (payload.new as Comment).id)) return prev
            return [...prev, payload.new as Comment]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [stackId])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedBody = body.trim()
    if (!trimmedBody) return

    setSubmitting(true)
    setError(null)

    const optimistic: Comment = {
      id: `optimistic-${Date.now()}`,
      stack_id: stackId,
      user_id: user?.id ?? null,
      author_name: authorName.trim() || null,
      body: trimmedBody,
      created_at: new Date().toISOString(),
    }
    setComments((prev) => [...prev, optimistic])
    setBody('')

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: insertError } = await (supabase as any)
      .from('comments')
      .insert({
        stack_id: stackId,
        user_id: user?.id ?? null,
        author_name: authorName.trim() || null,
        body: trimmedBody,
      })
      .select()
      .single()

    if (insertError) {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      setBody(trimmedBody)
      setError('Failed to post. Please try again.')
    } else if (data) {
      // Replace optimistic with real record
      setComments((prev) =>
        prev.map((c) => (c.id === optimistic.id ? (data as Comment) : c))
      )
    }

    setSubmitting(false)
  }, [body, authorName, stackId, user])

  const handleDelete = useCallback(async (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id))
    const supabase = createClient()
    await supabase.from('comments').delete().eq('id', id)
  }, [])

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-base font-semibold text-white">
        Comments {comments.length > 0 && <span className="text-gray-500 font-normal">({comments.length})</span>}
      </h2>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-600 mb-6">Be the first to comment.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-surface-border bg-surface-raised p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-medium text-gray-300">
                  {c.author_name || 'Anonymous'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">{timeAgo(c.created_at)}</span>
                  {user && c.user_id === user.id && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                      aria-label="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400 whitespace-pre-wrap break-words">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Post form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={50}
            disabled={!!(user && authorName)}
            className="w-40 flex-shrink-0 rounded-lg bg-surface border border-surface-border px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience with this stack…"
            maxLength={500}
            rows={2}
            className="flex-1 resize-none rounded-lg bg-surface border border-surface-border px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center justify-between">
          {error ? (
            <p className="text-xs text-red-400">{error}</p>
          ) : (
            <span className="text-xs text-gray-600">{body.length}/500</span>
          )}
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
