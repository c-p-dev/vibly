'use client'

import { useState, useEffect } from 'react'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { useEntitlements } from '@/hooks/useEntitlements'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import type { Plan } from '@/lib/entitlements'

export default function AccountPage() {
  const { user } = useSupabaseUser()
  const { plan, planLabel } = useEntitlements()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const row = data as { display_name?: string | null } | null
        if (row?.display_name) setDisplayName(row.display_name)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('profiles')
      .update({ display_name: displayName.trim() || null })
      .eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-white">Account</h1>

      <div className="space-y-6">
        {/* Profile */}
        <section className="rounded-2xl border border-surface-border bg-surface-raised p-6">
          <h2 className="mb-5 text-base font-semibold text-white">Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user.email ?? ''}
                readOnly
                className="w-full rounded-lg bg-surface border border-surface-border px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Display name
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
                className="w-full rounded-lg bg-surface border border-surface-border px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              {saved && <span className="text-sm text-green-400">Saved!</span>}
            </div>
          </form>
        </section>

        {/* Plan */}
        <section className="rounded-2xl border border-surface-border bg-surface-raised p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Plan</h2>
            <Badge variant={plan as Plan}>{planLabel}</Badge>
          </div>

          <div className="space-y-3 text-sm text-gray-400 mb-5">
            {plan === 'free' && (
              <>
                <PlanFeature included label="Player access" />
                <PlanFeature included label="Up to 5 local stacks" />
                <PlanFeature label="Fade out timer" />
                <PlanFeature label="Cloud stacks" />
                <PlanFeature label="Public share pages" />
              </>
            )}
            {plan === 'starter' && (
              <>
                <PlanFeature included label="Player access" />
                <PlanFeature included label="Unlimited local stacks" />
                <PlanFeature included label="Fade out timer" />
                <PlanFeature label="Cloud stacks" />
                <PlanFeature label="Public share pages" />
              </>
            )}
            {plan === 'pro' && (
              <>
                <PlanFeature included label="Player access" />
                <PlanFeature included label="Unlimited local stacks" />
                <PlanFeature included label="Fade out timer" />
                <PlanFeature included label="Cloud stacks" />
                <PlanFeature included label="Public share pages" />
              </>
            )}
          </div>

          <Link href="/account/billing">
            <Button variant="secondary" size="sm">
              {plan === 'free' ? 'Upgrade plan' : 'Manage billing'}
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
}

function PlanFeature({ label, included = false }: { label: string; included?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {included ? (
        <svg className="h-4 w-4 text-brand-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
      <span className={included ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
    </div>
  )
}
