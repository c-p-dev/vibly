'use client'

import { useEffect } from 'react'
import { useEntitlementsStore } from '@/store/entitlementsStore'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import {
  canUseCloudStacks,
  canUsePublicShare,
  canUseJournals,
  canSaveMoreLocalStacks,
  canSaveMoreCloudStacks,
  getMaxLayers,
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
    canUsePublicShare: canUsePublicShare(plan),
    canUseJournals: canUseJournals(plan),
    canSaveMoreLocalStacks: (count: number) => canSaveMoreLocalStacks(plan, count),
    canSaveMoreCloudStacks: (count: number) => canSaveMoreCloudStacks(plan, count),
    maxLayers: getMaxLayers(plan),
    mockActivate,
    mockReset,
    loadFromSupabase,
    isPaid: plan !== 'free',
    isSignedIn: !!user,
    user,
  }
}
