import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json() as {
    stackId?: string | null
    stackName?: string | null
    durationSeconds: number
  }

  // Ignore sessions shorter than 5 seconds
  if (!body.durationSeconds || body.durationSeconds < 5) {
    return NextResponse.json({ ok: true })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('listening_sessions')
    .insert({
      user_id: user.id,
      stack_id: body.stackId ?? null,
      stack_name: body.stackName ?? null,
      duration_seconds: Math.round(body.durationSeconds),
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
