'use client'

import { useEffect } from 'react'
import { useStackStore } from '@/store/stackStore'

// Rehydrate persisted Zustand stores after mount (prevents SSR hydration mismatch)
export function StoreHydration() {
  useEffect(() => {
    useStackStore.persist.rehydrate()
  }, [])

  return null
}
