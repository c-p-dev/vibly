'use client'

import { Modal } from './Modal'
import { Button } from './Button'
import { FEATURE_LABELS, PLAN_UPGRADE_MAP, getPlanLabel } from '@/lib/entitlements'
import Link from 'next/link'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  feature: 'cloudStacks' | 'fadeOut' | 'publicShare'
}

export function PaywallModal({ isOpen, onClose, feature }: PaywallModalProps) {
  const requiredPlan = PLAN_UPGRADE_MAP[feature]
  const featureLabel = FEATURE_LABELS[feature]
  const planLabel = getPlanLabel(requiredPlan)
  const mode = process.env.NEXT_PUBLIC_PAYMENTS_MODE || 'mock'
  const isMock = mode === 'mock'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Required">
      <div className="space-y-5">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/20 border border-brand-600/30">
            <svg className="h-7 w-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Copy */}
        <div className="text-center">
          <p className="text-white font-medium">
            {featureLabel} requires{' '}
            <span className="text-brand-400">{planLabel}</span>
          </p>
          <p className="mt-1.5 text-sm text-gray-400">
            Upgrade your plan to unlock this feature and more.
          </p>
        </div>

        {/* Plan highlights */}
        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-2">
          {requiredPlan === 'starter' && (
            <>
              <PlanFeature label="Unlimited local stacks" />
              <PlanFeature label="Fade out timer" />
            </>
          )}
          {requiredPlan === 'pro' && (
            <>
              <PlanFeature label="Everything in Starter" />
              <PlanFeature label="Cloud stacks (sync across devices)" />
              <PlanFeature label="Public shareable stack pages" />
            </>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Not now
          </Button>
          <Link href="/account/billing" className="flex-1" onClick={onClose}>
            <Button variant="primary" className="w-full">
              {isMock ? 'Try for free (mock)' : `Upgrade to ${planLabel}`}
            </Button>
          </Link>
        </div>

        {isMock && (
          <p className="text-center text-xs text-gray-600">
            Development mode — upgrades are simulated
          </p>
        )}
      </div>
    </Modal>
  )
}

function PlanFeature({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <svg className="h-4 w-4 flex-shrink-0 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {label}
    </div>
  )
}
