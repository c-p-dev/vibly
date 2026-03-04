'use client'

import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '@/store/playerStore'

interface UseSessionTimerOptions {
  onFadeStart?: () => void
  onSessionEnd?: () => void
}

export function useSessionTimer({ onFadeStart, onSessionEnd }: UseSessionTimerOptions = {}) {
  const { sessionState, sessionStartedAt, timer, stopSession } = usePlayerStore()
  const [remaining, setRemaining] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fadeStartedRef = useRef(false)

  useEffect(() => {
    if (sessionState !== 'playing' || !timer.durationMinutes || !sessionStartedAt) {
      setRemaining(null)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    fadeStartedRef.current = false
    const totalMs = timer.durationMinutes * 60 * 1000
    const FADE_LEAD_MS = 10000 // start fade 10s before end

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - sessionStartedAt
      const rem = totalMs - elapsed

      if (rem <= 0) {
        setRemaining(0)
        clearInterval(intervalRef.current!)
        stopSession()
        onSessionEnd?.()
        return
      }

      setRemaining(rem)

      if (!fadeStartedRef.current && rem <= FADE_LEAD_MS && timer.fadeOut) {
        fadeStartedRef.current = true
        onFadeStart?.()
      }
    }, 500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [sessionState, sessionStartedAt, timer.durationMinutes, timer.fadeOut, stopSession, onFadeStart, onSessionEnd])

  const formatRemaining = (): string => {
    if (remaining === null) return ''
    const totalSec = Math.ceil(remaining / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return { remaining, formatted: formatRemaining() }
}
