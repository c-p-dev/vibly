'use client'

import { useEntitlements } from '@/hooks/useEntitlements'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Plan } from '@/lib/entitlements'

const mode = process.env.NEXT_PUBLIC_PAYMENTS_MODE || 'mock'
const isMock = mode === 'mock'
const isDev = process.env.NODE_ENV !== 'production'

const PLANS: { id: Plan; label: string; price: string; features: string[] }[] = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    features: ['1 cloud stack', 'Ads', '5 min session (10 min if signed in)'],
  },
  {
    id: 'starter',
    label: 'Starter',
    price: '$5/mo',
    features: ['5 cloud stacks', 'No ads', 'Journals & session notes', 'Unlimited sessions'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$10/mo',
    features: ['Everything in Starter', '20 cloud stacks', 'Public share pages'],
  },
]

export default function BillingPage() {
  const { plan, planLabel, mockActivate, mockReset, loadFromSupabase, user } = useEntitlements()

  async function handleDevSetPlan(targetPlan: Plan) {
    // Always write to Supabase in dev so server-side checks see the updated plan
    const res = await fetch('/api/mock/set-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: targetPlan }),
    })
    if (res.ok) {
      mockActivate(targetPlan) // also update localStorage for immediate UI refresh
      if (user?.id) loadFromSupabase(user.id) // re-read from Supabase
    }
  }

  async function handleUpgrade(targetPlan: Plan) {
    if (isMock) {
      handleDevSetPlan(targetPlan)
      return
    }

    // real payments mode — call checkout endpoint
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: targetPlan }),
    })

    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      const json = await res.json().catch(() => ({})) as { error?: string }
      alert(json.error ?? 'Checkout failed. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-gray-400">
          Current plan:{' '}
          <Badge variant={plan as Plan} className="ml-1">{planLabel}</Badge>
        </p>
      </div>

      {isMock && (
        <div className="mb-6 rounded-xl border border-yellow-700/40 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-400">
          <strong>Development mode:</strong> Payments are simulated. Changes are stored locally.
        </div>
      )}

      {/* Plan cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = plan === p.id

          return (
            <div
              key={p.id}
              className={cn(
                'flex flex-col rounded-2xl border p-6 transition-colors',
                isCurrent
                  ? 'border-brand-600/60 bg-brand-600/10'
                  : 'border-surface-border bg-surface-raised hover:border-surface-hover'
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-semibold text-white">{p.label}</h2>
                {isCurrent && <Badge variant={p.id as Plan}>Current</Badge>}
              </div>
              <p className="mb-5 text-2xl font-bold text-white">{p.price}</p>

              <ul className="mb-6 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                p.id !== 'free' && isMock ? (
                  <Button variant="ghost" size="sm" onClick={mockReset}>
                    Reset to Free (mock)
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" disabled>
                    Current plan
                  </Button>
                )
              ) : (
                <Button
                  variant={p.id === 'pro' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpgrade(p.id)}
                >
                  {isMock ? `Activate ${p.label} (mock)` : `Upgrade to ${p.label}`}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {isDev && (
        <div className="mt-8 rounded-xl border border-yellow-700/40 bg-yellow-900/10 p-5">
          <h3 className="mb-2 text-sm font-semibold text-yellow-400">Dev Controls</h3>
          <p className="mb-3 text-xs text-gray-500">
            Updates your plan in Supabase for testing. Does not charge any card.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleDevSetPlan('free')}>
              → Free
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDevSetPlan('starter')}>
              → Starter
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDevSetPlan('pro')}>
              → Pro
            </Button>
            <Button variant="danger" size="sm" onClick={mockReset}>
              Reset local
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fetch('/api/mock/reset-timer', { method: 'POST' })}>
              Reset session timer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
