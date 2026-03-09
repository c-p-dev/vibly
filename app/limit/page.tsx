'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function LimitPageInner() {
  const router = useRouter()
  const { user } = useSupabaseUser()
  const [cooldownMs, setCooldownMs] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real cooldown from server on mount (survives page reloads)
  useEffect(() => {
    fetch('/api/session/status')
      .then((r) => r.ok ? r.json() : null)
      .then((status) => {
        if (!status) { setLoading(false); return }
        if (status.canPlay && !(status.remainingMs > 0)) {
          // Cooldown already expired — go back to player
          router.push('/player')
          return
        }
        const ms = status.cooldownMs > 0 ? status.cooldownMs : 0
        setCooldownMs(ms)
        setRemaining(ms)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  // Countdown tick
  useEffect(() => {
    if (cooldownMs === null || remaining === null) return
    const startedAt = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt
      const left = Math.max(0, cooldownMs - elapsed)
      setRemaining(left)
      if (left === 0) {
        clearInterval(interval)
        router.push('/player')
      }
    }, 500)
    return () => clearInterval(interval)
  }, [cooldownMs, router])

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center text-gray-400">
        Checking session…
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Animated blob */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl animate-blob" />
      </div>

      <div className="relative z-10 max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised border border-surface-border">
            <svg className="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Session limit reached</h1>
        <p className="text-gray-400 mb-6">
          Free sessions are limited. You can play again in:
        </p>

        <div className="mb-8 rounded-2xl border border-surface-border bg-surface-raised px-8 py-6">
          <span className="text-5xl font-mono font-bold text-brand-400">
            {remaining !== null ? formatTime(remaining) : '—'}
          </span>
          <p className="mt-2 text-xs text-gray-500">The player will open automatically when ready.</p>
        </div>

        {/* Upgrade CTAs */}
        <div className="space-y-3">
          {!user && (
            <div className="rounded-xl border border-brand-600/30 bg-brand-600/10 p-4">
              <p className="text-sm font-medium text-brand-300 mb-1">
                Sign up free → get 10 minutes per session
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Creating an account doubles your session time at no cost.
              </p>
              <Link
                href="/auth"
                className="inline-block rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                Create free account →
              </Link>
            </div>
          )}

          <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
            <p className="text-sm font-medium text-white mb-1">Upgrade to Starter</p>
            <p className="text-xs text-gray-500 mb-3">
              Unlimited sessions, 5 cloud stacks, and journals — $5/mo.
            </p>
            <Link
              href="/account/billing"
              className="inline-block rounded-lg border border-surface-border bg-surface px-5 py-2 text-sm font-medium text-gray-300 hover:bg-surface-hover transition-colors"
            >
              View plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LimitPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center text-gray-400">Loading…</div>}>
      <LimitPageInner />
    </Suspense>
  )
}
