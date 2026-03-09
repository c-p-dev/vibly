import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 1).toISOString()

  const { data, error } = await supabase
    .from('listening_sessions')
    .select('started_at, duration_seconds, stack_name')
    .gte('started_at', startDate)
    .lt('started_at', endDate)
    .order('started_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by local date (YYYY-MM-DD)
  const byDate = new Map<string, { totalSeconds: number; stacks: Set<string> }>()
  for (const row of data ?? []) {
    const date = row.started_at.slice(0, 10)
    const entry = byDate.get(date) ?? { totalSeconds: 0, stacks: new Set<string>() }
    entry.totalSeconds += row.duration_seconds
    if (row.stack_name) entry.stacks.add(row.stack_name)
    byDate.set(date, entry)
  }

  const sessions = Array.from(byDate.entries()).map(([date, { totalSeconds, stacks }]) => ({
    date,
    totalSeconds,
    stacks: Array.from(stacks),
  }))

  return NextResponse.json({ sessions })
}
