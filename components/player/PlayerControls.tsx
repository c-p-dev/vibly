'use client'

import { usePlayerStore } from '@/store/playerStore'
import { Button } from '@/components/ui/Button'

interface PlayerControlsProps {
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  canStart: boolean
  remainingMs?: number | null
}

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PlayerControls({ onPlay, onPause, onStop, canStart, remainingMs }: PlayerControlsProps) {
  const { sessionState } = usePlayerStore()

  const isPlaying = sessionState === 'playing'
  const isPaused = sessionState === 'paused'
  const isActive = isPlaying || isPaused
  const showTimer = remainingMs !== null && remainingMs !== undefined && isActive

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
      {showTimer && (
        <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 text-sm ${remainingMs! <= 60000 ? 'bg-red-950/40 border border-red-900/50' : 'bg-surface border border-surface-border'}`}>
          <span className="text-xs text-gray-400">Session time remaining</span>
          <span className={`font-mono font-semibold ${remainingMs! <= 60000 ? 'text-red-400' : 'text-white'}`}>
            {formatTime(remainingMs!)}
          </span>
        </div>
      )}
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
      </div>
    </div>
  )
}
