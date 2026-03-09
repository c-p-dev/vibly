import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'
import type { Plan } from '@/lib/entitlements'

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

function getIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Paid users don't need session tracking
  if (user) {
    const service = createServiceRoleClient()
    const { data: entitlement } = await service
      .from('entitlements')
      .select('plan')
      .eq('user_id', user.id)
      .single()
    const plan = (entitlement?.plan ?? 'free') as Plan
    if (plan !== 'free') {
      return NextResponse.json({ ok: true, durationMs: null })
    }
  }

  const ip = getIp(request)
  const ipHash = hashIp(ip)
  // Signed-in free users get 10 min promo, anonymous get 5 min
  const durationMinutes = user ? 10 : 5

  const service = createServiceRoleClient()
  await service.from('free_sessions').insert({
    ip_hash: ipHash,
    user_id: user?.id ?? null,
    duration_minutes: durationMinutes,
  })

  return NextResponse.json({ ok: true, durationMs: durationMinutes * 60 * 1000 })
}
