import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'
import type { Plan } from '@/lib/entitlements'

const COOLDOWN_MINUTES = 30

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

function getIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check plan — paid users always allowed
  if (user) {
    const service = createServiceRoleClient()
    const { data: entitlement } = await service
      .from('entitlements')
      .select('plan')
      .eq('user_id', user.id)
      .single()
    const plan = (entitlement?.plan ?? 'free') as Plan
    if (plan !== 'free') {
      return NextResponse.json({ canPlay: true, remainingMs: null, cooldownMs: 0 })
    }
  }

  // Free tier — check session history
  const service = createServiceRoleClient()
  const ip = getIp(request)
  const ipHash = hashIp(ip)

  const { data: sessions } = await service
    .from('free_sessions')
    .select('started_at, duration_minutes')
    .or(user ? `ip_hash.eq.${ipHash},user_id.eq.${user.id}` : `ip_hash.eq.${ipHash}`)
    .order('started_at', { ascending: false })
    .limit(1)

  const last = sessions?.[0]
  if (!last) {
    return NextResponse.json({ canPlay: true, remainingMs: null, cooldownMs: 0 })
  }

  const sessionStart = new Date(last.started_at).getTime()
  const sessionEnd = sessionStart + last.duration_minutes * 60 * 1000
  const cooldownEnd = sessionStart + COOLDOWN_MINUTES * 60 * 1000
  const now = Date.now()

  if (now < sessionEnd) {
    // Still in session
    return NextResponse.json({ canPlay: true, remainingMs: sessionEnd - now, cooldownMs: 0 })
  }

  if (now < cooldownEnd) {
    // In cooldown
    return NextResponse.json({ canPlay: false, remainingMs: 0, cooldownMs: cooldownEnd - now })
  }

  return NextResponse.json({ canPlay: true, remainingMs: null, cooldownMs: 0 })
}
