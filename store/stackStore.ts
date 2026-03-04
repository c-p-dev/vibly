import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Stack, StackConfig } from '@/types/stack'
import { nanoid } from 'nanoid'

interface StackState {
  localStacks: Stack[]
  _hasHydrated: boolean

  saveStack: (name: string, config: StackConfig, description?: string) => Stack
  updateStack: (id: string, patch: Partial<Omit<Stack, 'id' | 'createdAt'>>) => void
  deleteStack: (id: string) => void
  getStack: (id: string) => Stack | undefined
  setHasHydrated: (v: boolean) => void
}

export const useStackStore = create<StackState>()(
  persist(
    (set, get) => ({
      localStacks: [],
      _hasHydrated: false,

      saveStack: (name, config, description) => {
        const stack: Stack = {
          id: nanoid(),
          name,
          description,
          config,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ localStacks: [...s.localStacks, stack] }))
        return stack
      },

      updateStack: (id, patch) =>
        set((s) => ({
          localStacks: s.localStacks.map((st) =>
            st.id === id ? { ...st, ...patch } : st
          ),
        })),

      deleteStack: (id) =>
        set((s) => ({
          localStacks: s.localStacks.filter((st) => st.id !== id),
        })),

      getStack: (id) => get().localStacks.find((st) => st.id === id),

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'vibly-stacks',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
