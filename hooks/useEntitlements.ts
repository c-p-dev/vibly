'use client'

import { useEffect } from 'react'
import { useEntitlementsStore } from '@/store/entitlementsStore'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import {
  canUseCloudStacks,
  canUseFadeOut,
  canUsePublicShare,
  canSaveMoreLocalStacks,
  getPlanLabel,
} from '@/lib/entitlements'

export function useEntitlements() {
  const { plan, status, isLoading, loadFromSupabase, mockActivate, mockReset } =
    useEntitlementsStore()
  const { user } = useSupabaseUser()

  useEffect(() => {
    if (user?.id) {
      loadFromSupabase(user.id)
    }
  }, [user?.id, loadFromSupabase])

  return {
    plan,
    status,
    isLoading,
    planLabel: getPlanLabel(plan),
    canUseCloudStacks: canUseCloudStacks(plan),
    canUseFadeOut: canUseFadeOut(plan),
    canUsePublicShare: canUsePublicShare(plan),
    canSaveMoreLocalStacks: (count: number) => canSaveMoreLocalStacks(plan, count),
    mockActivate,
    mockReset,
    isPaid: plan !== 'free',
    isSignedIn: !!user,
    user,
  }
}
