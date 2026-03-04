'use client'

import { useEntitlements } from '@/hooks/useEntitlements'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Plan } from '@/lib/entitlements'

const PLANS: { id: Plan; label: string; price: string; features: string[] }[] = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    features: ['Player access', 'Up to 5 local stacks', 'Share via URL link'],
  },
  {
    id: 'starter',
    label: 'Starter',
    price: '$5/mo',
    features: ['Everything in Free', 'Unlimited local stacks', 'Fade out timer'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$10/mo',
    features: ['Everything in Starter', 'Cloud stacks (sync)', 'Public share pages'],
  },
]

const isMock = process.env.NEXT_PUBLIC_PAYMENTS_MODE !== 'stripe'

export default function BillingPage() {
  const { plan, planLabel, mockActivate, mockReset } = useEntitlements()

  async function handleUpgrade(targetPlan: Plan) {
    if (isMock) {
      mockActivate(targetPlan)
      return
    }

    // Stripe mode — call checkout endpoint
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId:
          targetPlan === 'starter'
            ? process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      }),
    })

    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      alert('Stripe checkout is not configured yet.')
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

      {isMock && (
        <div className="mt-8 rounded-xl border border-surface-border bg-surface-raised p-5">
          <h3 className="mb-2 text-sm font-semibold text-white">Dev Controls</h3>
          <p className="mb-3 text-xs text-gray-500">
            These mock controls update your local plan for testing. They do not charge any card.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => mockActivate('free')}>
              → Free
            </Button>
            <Button variant="ghost" size="sm" onClick={() => mockActivate('starter')}>
              → Starter
            </Button>
            <Button variant="ghost" size="sm" onClick={() => mockActivate('pro')}>
              → Pro
            </Button>
            <Button variant="danger" size="sm" onClick={mockReset}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
