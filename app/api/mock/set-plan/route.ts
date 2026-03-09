import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'
import type { Plan } from '@/lib/entitlements'

const VALID_PLANS: Plan[] = ['free', 'starter', 'pro']

export async function POST(request: Request) {
  // Allow in any non-production environment for testing
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_PAYMENTS_MODE !== 'mock') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const plan = body.plan as Plan

  if (!VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const serviceClient = createServiceRoleClient()
  const { error } = await serviceClient.from('entitlements').upsert({
    user_id: user.id,
    plan,
    status: 'active',
    updated_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, plan })
}
