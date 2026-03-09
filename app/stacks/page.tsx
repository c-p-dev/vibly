'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEntitlements } from '@/hooks/useEntitlements'
import { StackCard } from '@/components/stacks/StackCard'
import { JournalSection } from '@/components/stacks/JournalSection'
import { EmptyState } from '@/components/stacks/EmptyState'
import { Button } from '@/components/ui/Button'
import { PaywallModal } from '@/components/ui/PaywallModal'
import { buildShareUrl } from '@/lib/share'
import { usePlayerStore } from '@/store/playerStore'
import type { Stack } from '@/types/stack'
import type { Database } from '@/types/supabase'
import { createClient } from '@/lib/supabase'

type CloudStack = Database['public']['Tables']['stacks']['Row']

export default function StacksPage() {
  const router = useRouter()
  const { loadStackConfig } = usePlayerStore()
  const { plan, isSignedIn, user } = useEntitlements()
  const [showPaywall, setShowPaywall] = useState(false)
  const [cloudStacks, setCloudStacks] = useState<CloudStack[]>([])
  const [cloudLoading, setCloudLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<string | null>(null)

  const stackLimit = plan === 'pro' ? 20 : plan === 'starter' ? 5 : 1
  const canUseJournals = plan === 'starter' || plan === 'pro'

  useEffect(() => {
    if (!isSignedIn || !user) return
    setCloudLoading(true)
    const supabase = createClient()
    supabase
      .from('stacks')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setCloudStacks(data ?? [])
        setCloudLoading(false)
      })
  }, [isSignedIn, user])

  function handleLoad(stack: Stack, cloudId: string) {
    loadStackConfig(stack.config)
    router.push(`/player?stackId=${cloudId}&stackName=${encodeURIComponent(stack.name)}`)
  }

  function handleShare(stack: Stack) {
    const url = buildShareUrl(stack.config)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(stack.id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  async function handleDelete(cloudId: string) {
    const res = await fetch(`/api/stacks/${cloudId}`, { method: 'DELETE' })
    if (res.ok) setCloudStacks((prev) => prev.filter((s) => s.id !== cloudId))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stacks</h1>
          {isSignedIn && (
            <p className="mt-0.5 text-xs text-gray-500">
              {cloudStacks.length} / {stackLimit} stack{stackLimit !== 1 ? 's' : ''}
              {plan === 'free' && (
                <button
                  onClick={() => setShowPaywall(true)}
                  className="ml-2 text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Upgrade for more &rarr;
                </button>
              )}
            </p>
          )}
        </div>
        <Link href="/player">
          <Button variant="primary" size="sm">+ New Stack</Button>
        </Link>
      </div>

      {!isSignedIn ? (
        <EmptyState
          title="Sign in to access your stacks"
          description="All stacks are saved to the cloud so you can access them from any device."
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          }
          action={
            <Link href="/auth">
              <Button variant="primary" size="sm">Sign in</Button>
            </Link>
          }
        />
      ) : cloudLoading ? (
        <div className="text-sm text-gray-400">Loading stacks&hellip;</div>
      ) : cloudStacks.length === 0 ? (
        <EmptyState
          title="No stacks yet"
          description="Go to the player, build your setup, and save it as a stack."
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          }
          action={
            <Link href="/player">
              <Button variant="primary" size="sm">Open Player</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cloudStacks.map((cs) => {
            const stack: Stack = {
              id: cs.id,
              name: cs.name,
              description: cs.description ?? undefined,
              config: cs.config,
              isPublic: cs.is_public,
              publicSlug: cs.public_slug ?? undefined,
              createdAt: cs.created_at,
            }
            const isExpanded = expandedComments === cs.id
            return (
              <div key={cs.id} className="flex flex-col gap-2">
                {copied === cs.id && (
                  <div className="rounded-full bg-brand-600 px-3 py-1 text-center text-xs text-white shadow">
                    Link copied!
                  </div>
                )}
                <StackCard
                  stack={stack}
                  onLoad={() => handleLoad(stack, cs.id)}
                  onDelete={() => handleDelete(cs.id)}
                  onShare={() => handleShare(stack)}
                  isCloud
                />
                {canUseJournals && (
                  <>
                    <button
                      onClick={() => setExpandedComments(isExpanded ? null : cs.id)}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-left px-1"
                    >
                      {isExpanded ? 'Hide journal' : 'Journal'}
                    </button>
                    {isExpanded && (
                      <div className="rounded-xl border border-surface-border bg-surface-raised px-4 pb-4">
                        <JournalSection stackId={cs.id} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="cloudStacks"
      />
    </div>
  )
}
