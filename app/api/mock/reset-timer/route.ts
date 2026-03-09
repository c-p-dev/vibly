import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_PAYMENTS_MODE !== 'mock') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = createServiceRoleClient()

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
  const ipHash = createHash('sha256').update(ip).digest('hex')

  // Delete all free_sessions for this user (by user_id) or IP
  const query = service.from('free_sessions')
  if (user) {
    await query.delete().or(`user_id.eq.${user.id},ip_hash.eq.${ipHash}`)
  } else {
    await query.delete().eq('ip_hash', ipHash)
  }

  return NextResponse.json({ ok: true })
}
