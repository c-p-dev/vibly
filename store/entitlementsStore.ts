import { create } from 'zustand'
import type { Plan } from '@/lib/entitlements'

const DEV_OVERRIDE_KEY = 'vibly-dev-plan'

interface EntitlementsState {
  plan: Plan
  status: 'active' | 'canceled' | 'past_due'
  isLoading: boolean

  setPlan: (plan: Plan) => void
  loadFromSupabase: (userId: string) => Promise<void>
  mockActivate: (plan: Plan) => void
  mockReset: () => void
}

export const useEntitlementsStore = create<EntitlementsState>()((set) => ({
  plan: 'free',
  status: 'active',
  isLoading: false,

  setPlan: (plan) => set({ plan }),

  loadFromSupabase: async (userId) => {
    set({ isLoading: true })
    try {
      // Check dev localStorage override first
      const devPlan =
        typeof window !== 'undefined'
          ? (localStorage.getItem(DEV_OVERRIDE_KEY) as Plan | null)
          : null
      if (devPlan && ['free', 'starter', 'pro'].includes(devPlan)) {
        set({ plan: devPlan, isLoading: false })
        return
      }

      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data } = await supabase
        .from('entitlements')
        .select('plan, status')
        .eq('user_id', userId)
        .single()

      const row = data as { plan?: Plan; status?: string } | null
      set({
        plan: (row?.plan as Plan) ?? 'free',
        status: (row?.status as EntitlementsState['status']) ?? 'active',
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  mockActivate: (plan) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEV_OVERRIDE_KEY, plan)
    }
    set({ plan, status: 'active' })
  },

  mockReset: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEV_OVERRIDE_KEY)
    }
    set({ plan: 'free', status: 'active' })
  },
}))
