export type Plan = 'free' | 'starter' | 'pro'

export const PLAN_LIMITS = {
  free: {
    maxLocalStacks: 5,
    fadeOut: false,
    cloudStacks: false,
    publicShare: false,
    label: 'Free',
  },
  starter: {
    maxLocalStacks: Infinity,
    fadeOut: true,
    cloudStacks: false,
    publicShare: false,
    label: 'Starter',
  },
  pro: {
    maxLocalStacks: Infinity,
    fadeOut: true,
    cloudStacks: true,
    publicShare: true,
    label: 'Pro',
  },
} as const

export function canUseCloudStacks(plan: Plan): boolean {
  return PLAN_LIMITS[plan].cloudStacks
}

export function canUseFadeOut(plan: Plan): boolean {
  return PLAN_LIMITS[plan].fadeOut
}

export function canUsePublicShare(plan: Plan): boolean {
  return PLAN_LIMITS[plan].publicShare
}

export function canSaveMoreLocalStacks(plan: Plan, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan].maxLocalStacks
}

export function getPlanLabel(plan: Plan): string {
  return PLAN_LIMITS[plan].label
}

export const PLAN_UPGRADE_MAP: Record<string, 'starter' | 'pro'> = {
  cloudStacks: 'pro',
  fadeOut: 'starter',
  publicShare: 'pro',
}

export const FEATURE_LABELS: Record<string, string> = {
  cloudStacks: 'Cloud Stacks',
  fadeOut: 'Fade Out Timer',
  publicShare: 'Public Share Pages',
}
