export type Plan = 'free' | 'starter' | 'pro'

export const PLAN_LIMITS = {
  free: {
    maxLocalStacks: 0,
    maxCloudStacks: 1,
    maxLayers: 2,
    cloudStacks: true,
    publicShare: false,
    journals: false,
    ads: true,
    sessionMinutesAnon: 5,
    sessionMinutesSignedIn: 10,
    label: 'Free',
  },
  starter: {
    maxLocalStacks: 0,
    maxCloudStacks: 5,
    maxLayers: Infinity,
    cloudStacks: true,
    publicShare: false,
    journals: true,
    ads: false,
    sessionMinutesAnon: Infinity,
    sessionMinutesSignedIn: Infinity,
    label: 'Starter',
  },
  pro: {
    maxLocalStacks: 0,
    maxCloudStacks: 20,
    maxLayers: Infinity,
    cloudStacks: true,
    publicShare: true,
    journals: true,
    ads: false,
    sessionMinutesAnon: Infinity,
    sessionMinutesSignedIn: Infinity,
    label: 'Pro',
  },
} as const

export function canUseCloudStacks(plan: Plan): boolean {
  return PLAN_LIMITS[plan].cloudStacks
}

export function canUsePublicShare(plan: Plan): boolean {
  return PLAN_LIMITS[plan].publicShare
}

export function canUseJournals(plan: Plan): boolean {
  return PLAN_LIMITS[plan].journals
}

export function getMaxLayers(plan: Plan): number {
  return PLAN_LIMITS[plan].maxLayers
}

export function canSaveMoreLocalStacks(plan: Plan, currentCount: number): boolean {
  if (plan !== 'free') return false
  return currentCount < PLAN_LIMITS[plan].maxLocalStacks
}

export function canSaveMoreCloudStacks(plan: Plan, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan].maxCloudStacks
}

export function getPlanLabel(plan: Plan): string {
  return PLAN_LIMITS[plan].label
}

export const PLAN_UPGRADE_MAP: Record<string, 'starter' | 'pro'> = {
  cloudStacks: 'starter',
  journals: 'starter',
  publicShare: 'pro',
}

export const FEATURE_LABELS: Record<string, string> = {
  cloudStacks: 'Cloud Stacks',
  journals: 'Journals',
  publicShare: 'Public Share Pages',
}
