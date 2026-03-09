import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'
import type { StackConfig } from '@/types/stack'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const service = createServiceRoleClient()
  const { data, error } = await service
    .from('stacks')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  return NextResponse.json({ stack: data })
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const service = createServiceRoleClient()

  // Verify ownership
  const { data: existing } = await service
    .from('stacks')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const body = await req.json() as { config: StackConfig }
  if (!body.config) return NextResponse.json({ error: 'CONFIG_REQUIRED' }, { status: 400 })

  const { data, error } = await service
    .from('stacks')
    .update({ config: body.config, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json({ stack: data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const service = createServiceRoleClient()
  const { error } = await service
    .from('stacks')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
