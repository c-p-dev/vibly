'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEntitlements } from '@/hooks/useEntitlements'

interface SessionStatus {
  canPlay: boolean
  remainingMs: number | null
  cooldownMs: number
}

interface UseFreeTierSessionReturn {
  onSessionStart: () => Promise<void>
  remainingMs: number | null
}

/**
 * Manages free-tier session limits.
 * Countdown only ticks while isPlaying is true — pausing freezes it.
 */
export function useFreeTierSession(isPlaying: boolean): UseFreeTierSessionReturn {
  const { isPaid } = useEntitlements()
  const router = useRouter()
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const remainingMsRef = useRef<number | null>(null)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const [isCountingDown, setIsCountingDown] = useState(false)

  useEffect(() => { remainingMsRef.current = remainingMs }, [remainingMs])

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // React to play/pause while a session is active
  useEffect(() => {
    if (isPaid || !isCountingDown) return

    if (isPlaying) {
      const left = remainingMsRef.current ?? 0
      if (left <= 0) return

      if (intervalRef.current) clearInterval(intervalRef.current)
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)

      const endTime = Date.now() + left

      intervalRef.current = setInterval(() => {
        const timeLeft = endTime - Date.now()
        if (timeLeft <= 0) {
          setRemainingMs(0)
          remainingMsRef.current = 0
          clearInterval(intervalRef.current!)
          router.push('/limit')
        } else {
          setRemainingMs(timeLeft)
          remainingMsRef.current = timeLeft
        }
      }, 1000)

      redirectTimerRef.current = setTimeout(() => {
        clearInterval(intervalRef.current!)
        router.push('/limit')
      }, left)
    } else {
      // Paused/stopped — freeze countdown
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isCountingDown, isPaid])

  // On mount: restore in-progress session or redirect if in cooldown
  useEffect(() => {
    if (isPaid) return
    fetch('/api/session/status')
      .then((r) => r.ok ? r.json() as Promise<SessionStatus> : null)
      .then((status) => {
        if (!status) return
        if (!status.canPlay) { router.push('/limit'); return }
        if (status.remainingMs && status.remainingMs > 0) {
          setRemainingMs(status.remainingMs)
          remainingMsRef.current = status.remainingMs
          setIsCountingDown(true)
          // Interval starts when isPlaying becomes true
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid])

  const onSessionStart = useCallback(async () => {
    if (isPaid) return
    try {
      const statusRes = await fetch('/api/session/status')
      if (statusRes.ok) {
        const status = await statusRes.json() as SessionStatus
        if (!status.canPlay) { router.push('/limit'); return }
        if (status.remainingMs && status.remainingMs > 0) {
          setRemainingMs(status.remainingMs)
          remainingMsRef.current = status.remainingMs
          setIsCountingDown(true)
          return
        }
      }
      const res = await fetch('/api/session/start', { method: 'POST' })
      if (!res.ok) return
      const { durationMs } = await res.json() as { durationMs: number | null }
      if (!durationMs) return

      setRemainingMs(durationMs)
      remainingMsRef.current = durationMs
      setIsCountingDown(true)
    } catch {
      // Silently fail
    }
  }, [isPaid, router])

  return { onSessionStart, remainingMs }
}
