'use client'

import { useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { YT_ERRORS } from '@/lib/youtube'
import { cn } from '@/lib/utils'

export interface YouTubePlayerHandle {
  play: () => void
  pause: () => void
  stop: () => void
  setVolume: (v: number) => void
}

interface YouTubePlayerProps {
  videoId: string | null
  volume: number
  isMain?: boolean
  nativeControls?: boolean
  onError?: (code: number) => void
  onReady?: () => void
  className?: string
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  function YouTubePlayer({ videoId, volume, isMain = false, nativeControls = false, onError, onReady, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [errorCode, setErrorCode] = useState<number | null>(null)

    const handleError = (code: number) => {
      setErrorCode(code)
      onError?.(code)
    }

    const { play, pause, stop, setVolume, isPlaying } = useYouTubePlayer(containerRef, {
      videoId,
      volume,
      nativeControls,
      onError: handleError,
      onReady,
    })

    useImperativeHandle(ref, () => ({ play, pause, stop, setVolume }))

    if (!videoId) {
      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-xl bg-surface border border-surface-border text-gray-500 text-sm',
            isMain ? 'aspect-video' : 'h-24',
            className
          )}
        >
          <span>No video</span>
        </div>
      )
    }

    if (errorCode !== null) {
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-xl bg-surface border border-red-900/40 text-center p-4',
            isMain ? 'aspect-video' : 'h-24',
            className
          )}
        >
          <svg className="h-6 w-6 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-400 font-medium">
            {YT_ERRORS[errorCode] ?? 'Playback error'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Try a different video URL</p>
        </div>
      )
    }

    if (nativeControls) {
      // Fully interactive iframe — YouTube handles play/pause/timeline/volume UI
      return (
        <div
          className={cn(
            'relative overflow-hidden rounded-xl bg-black',
            isMain ? 'aspect-video' : 'h-24',
            className
          )}
        >
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        </div>
      )
    }

    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl bg-black',
          isMain ? 'aspect-video' : 'h-24',
          className
        )}
      >
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />

        {/* Click overlay — blocks accidental iframe focus */}
        <div className="absolute inset-0" />

        {/* Play / Pause button */}
        <button
          onClick={isPlaying ? pause : play}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-150',
            isPlaying
              ? 'opacity-0 group-hover:opacity-100'
              : 'opacity-100'
          )}
        >
          <span className={cn(
            'flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm ring-1 ring-white/10 transition-transform group-hover:scale-110',
            isMain ? 'h-14 w-14' : 'h-9 w-9'
          )}>
            {isPlaying ? (
              <svg className={cn('text-white', isMain ? 'h-6 w-6' : 'h-4 w-4')} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className={cn('text-white', isMain ? 'h-6 w-6' : 'h-4 w-4')} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </button>
      </div>
    )
  }
)
