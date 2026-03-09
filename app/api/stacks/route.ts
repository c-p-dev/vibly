import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'
import { canSaveMoreCloudStacks } from '@/lib/entitlements'
import type { Plan } from '@/lib/entitlements'
import type { StackConfig } from '@/types/stack'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const service = createServiceRoleClient()

  // Get plan
  const { data: entitlement } = await service
    .from('entitlements')
    .select('plan')
    .eq('user_id', user.id)
    .single()
  const plan = (entitlement?.plan ?? 'free') as Plan

  // Count existing cloud stacks
  const { count } = await service
    .from('stacks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const currentCount = count ?? 0
  if (!canSaveMoreCloudStacks(plan, currentCount)) {
    return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 403 })
  }

  // Parse body
  const body = await request.json() as { name: string; description?: string; config: StackConfig }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'NAME_REQUIRED' }, { status: 400 })
  }

  const { data, error } = await service
    .from('stacks')
    .insert({
      user_id: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      is_public: false,
      config: body.config,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ stack: data })
}
