'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStackStore } from '@/store/stackStore'
import { useEntitlements } from '@/hooks/useEntitlements'
import { StackCard } from '@/components/stacks/StackCard'
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
  const { localStacks, deleteStack, _hasHydrated } = useStackStore()
  const { loadStackConfig } = usePlayerStore()
  const { canUseCloudStacks, isSignedIn, user } = useEntitlements()
  const [showPaywall, setShowPaywall] = useState(false)
  const [cloudStacks, setCloudStacks] = useState<CloudStack[]>([])
  const [cloudLoading, setCloudLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (!canUseCloudStacks || !user) return
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
  }, [canUseCloudStacks, user])

  function handleLoad(stack: Stack) {
    loadStackConfig(stack.config)
    router.push('/player')
  }

  function handleShare(stack: Stack) {
    const url = buildShareUrl(stack.config)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(stack.id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  if (!_hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-gray-400">Loading stacks…</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Stacks</h1>
        <Link href="/player">
          <Button variant="primary" size="sm">
            + New Stack
          </Button>
        </Link>
      </div>

      {/* ── Local Stacks ── */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-base font-semibold text-white">Local Stacks</h2>
          <span className="text-xs text-gray-500">{localStacks.length} stack{localStacks.length !== 1 ? 's' : ''}</span>
        </div>

        {localStacks.length === 0 ? (
          <EmptyState
            title="No local stacks yet"
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
            {localStacks.map((stack) => (
              <div key={stack.id} className="relative">
                {copied === stack.id && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 rounded-full bg-brand-600 px-3 py-1 text-xs text-white shadow">
                    Link copied!
                  </div>
                )}
                <StackCard
                  stack={stack}
                  onLoad={() => handleLoad(stack)}
                  onDelete={() => deleteStack(stack.id)}
                  onShare={() => handleShare(stack)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Cloud Stacks ── */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-base font-semibold text-white">Cloud Stacks</h2>
          <span className="rounded-full border border-brand-600/30 bg-brand-600/10 px-2 py-0.5 text-xs text-brand-400">
            Pro
          </span>
        </div>

        {!isSignedIn ? (
          <EmptyState
            title="Sign in to access cloud stacks"
            description="Cloud stacks sync across all your devices and are never lost when you clear browser data."
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            }
            action={
              <Link href="/auth">
                <Button variant="secondary" size="sm">Sign in</Button>
              </Link>
            }
          />
        ) : !canUseCloudStacks ? (
          <EmptyState
            title="Cloud stacks require Pro"
            description="Upgrade to Pro to sync your stacks to the cloud and access them from any device."
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            action={
              <Button variant="primary" size="sm" onClick={() => setShowPaywall(true)}>
                Upgrade to Pro
              </Button>
            }
          />
        ) : cloudLoading ? (
          <div className="text-sm text-gray-400">Loading cloud stacks…</div>
        ) : cloudStacks.length === 0 ? (
          <EmptyState
            title="No cloud stacks yet"
            description="Save a stack as 'cloud' from the player to sync it across devices."
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
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
              return (
                <StackCard
                  key={cs.id}
                  stack={stack}
                  onLoad={() => handleLoad(stack)}
                  isCloud
                />
              )
            })}
          </div>
        )}
      </section>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="cloudStacks"
      />
    </div>
  )
}
