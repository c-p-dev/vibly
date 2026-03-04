'use client'

import { useState } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useEntitlements } from '@/hooks/useEntitlements'
import { PaywallModal } from '@/components/ui/PaywallModal'
import { Button } from '@/components/ui/Button'
import { useSessionTimer } from '@/hooks/useSessionTimer'
import { cn } from '@/lib/utils'

const TIMER_PRESETS = [15, 30, 45, 60]

interface PlayerControlsProps {
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onFadeStart?: () => void
  canStart: boolean
}

export function PlayerControls({ onPlay, onPause, onStop, onFadeStart, canStart }: PlayerControlsProps) {
  const { sessionState, timer, setTimer } = usePlayerStore()
  const { canUseFadeOut } = useEntitlements()
  const [paywallFeature, setPaywallFeature] = useState<'fadeOut' | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  const { formatted: timerFormatted } = useSessionTimer({
    onFadeStart,
    onSessionEnd: onStop,
  })

  const isPlaying = sessionState === 'playing'
  const isPaused = sessionState === 'paused'
  const isActive = isPlaying || isPaused

  function handleFadeToggle() {
    if (!canUseFadeOut) {
      setPaywallFeature('fadeOut')
      return
    }
    setTimer({ fadeOut: !timer.fadeOut })
  }

  function handleTimerSelect(minutes: number | null) {
    setTimer({ durationMinutes: minutes })
    setShowCustom(false)
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4 space-y-4">
      {/* Main controls */}
      <div className="flex items-center gap-3">
        {!isActive ? (
          <Button
            variant="primary"
            size="lg"
            onClick={onPlay}
            disabled={!canStart}
            className="flex-1"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Start Session
          </Button>
        ) : (
          <>
            {isPlaying ? (
              <Button variant="secondary" size="lg" onClick={onPause} className="flex-1">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </Button>
            ) : (
              <Button variant="primary" size="lg" onClick={onPlay} className="flex-1">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Resume
              </Button>
            )}
            <Button variant="ghost" size="lg" onClick={onStop}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop
            </Button>
          </>
        )}

        {/* Timer display */}
        {timerFormatted && (
          <div className="flex-shrink-0 rounded-lg bg-surface px-3 py-2 font-mono text-sm font-medium text-brand-400">
            {timerFormatted}
          </div>
        )}
      </div>

      {/* Timer settings */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Timer</span>
          {timer.durationMinutes !== null && (
            <button
              className="text-xs text-gray-500 hover:text-gray-300"
              onClick={() => handleTimerSelect(null)}
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <TimerChip
            label="Off"
            active={timer.durationMinutes === null}
            onClick={() => handleTimerSelect(null)}
          />
          {TIMER_PRESETS.map((m) => (
            <TimerChip
              key={m}
              label={`${m}m`}
              active={timer.durationMinutes === m}
              onClick={() => handleTimerSelect(m)}
            />
          ))}
          <TimerChip
            label="Custom"
            active={showCustom || (timer.durationMinutes !== null && !TIMER_PRESETS.includes(timer.durationMinutes))}
            onClick={() => setShowCustom((v) => !v)}
          />
        </div>

        {showCustom && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={480}
              value={timer.customMinutes}
              onChange={(e) => setTimer({ customMinutes: Number(e.target.value) })}
              className="w-20 rounded-lg bg-surface border border-surface-border px-3 py-1.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              placeholder="30"
            />
            <span className="text-sm text-gray-400">minutes</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleTimerSelect(timer.customMinutes)}
            >
              Set
            </Button>
          </div>
        )}

        {/* Fade out toggle */}
        <button
          onClick={handleFadeToggle}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors w-full',
            canUseFadeOut
              ? timer.fadeOut
                ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                : 'text-gray-400 hover:text-white hover:bg-surface-hover border border-transparent'
              : 'text-gray-600 border border-transparent cursor-pointer'
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          Fade out at end
          {!canUseFadeOut && (
            <span className="ml-auto text-xs bg-surface-raised border border-surface-border rounded px-1.5 py-0.5">
              Starter+
            </span>
          )}
        </button>
      </div>

      <PaywallModal
        isOpen={paywallFeature === 'fadeOut'}
        onClose={() => setPaywallFeature(null)}
        feature="fadeOut"
      />
    </div>
  )
}

function TimerChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-brand-600 text-white'
          : 'bg-surface border border-surface-border text-gray-400 hover:text-white hover:border-surface-hover'
      )}
    >
      {label}
    </button>
  )
}
