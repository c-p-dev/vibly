'use client'

import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { YouTubePlayer, type YouTubePlayerHandle } from './YouTubePlayer'
import { VolumeSlider } from '@/components/ui/VolumeSlider'
import type { LayerConfig } from '@/types/stack'
import { cn } from '@/lib/utils'

export interface LayerPlayerHandle {
  play: () => void
  pause: () => void
  stop: () => void
  setVolume: (v: number) => void
}

interface LayerPlayerProps {
  layer: LayerConfig
  onUpdate: (patch: Partial<LayerConfig>) => void
  onRemove: () => void
}

export const LayerPlayer = forwardRef<LayerPlayerHandle, LayerPlayerProps>(
function LayerPlayer({
  layer,
  onUpdate,
  onRemove,
}, ref) {
  const playerRef = useRef<YouTubePlayerHandle>(null)
  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null)

  useEffect(() => {
    if (layer.label) return
    let cancelled = false
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${layer.videoId}&format=json`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const title = data?.title as string | undefined
        if (title) {
          setFetchedTitle(title)
          onUpdate({ label: title })
        }
      })
      .catch(() => {/* ignore */})
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer.videoId])

  useImperativeHandle(ref, () => ({
    play:      () => playerRef.current?.play(),
    pause:     () => playerRef.current?.pause(),
    stop:      () => playerRef.current?.stop(),
    setVolume: (v) => playerRef.current?.setVolume(v),
  }))

  const effectiveVolume = layer.muted ? 0 : layer.volume

  return (
    <div className={cn(
      'relative rounded-xl border bg-surface-raised transition-colors',
      layer.muted ? 'border-surface-border opacity-60' : 'border-surface-border'
    )}>
      <div className="flex gap-3 p-3">
        {/* Mini player */}
        <div className="w-36 flex-shrink-0">
          <YouTubePlayer
            ref={playerRef}
            videoId={layer.videoId}
            volume={effectiveVolume}
            className="h-20"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-gray-200" title={layer.label || fetchedTitle || layer.videoId}>
              {layer.label || fetchedTitle || layer.videoId}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Mute toggle */}
              <button
                onClick={() => onUpdate({ muted: !layer.muted })}
                className={cn(
                  'rounded-lg p-1.5 text-xs transition-colors',
                  layer.muted
                    ? 'bg-surface text-gray-500 hover:text-yellow-400'
                    : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                )}
                aria-label={layer.muted ? 'Unmute layer' : 'Mute layer'}
                title={layer.muted ? 'Unmute' : 'Mute'}
              >
                {layer.muted ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Remove */}
              <button
                onClick={onRemove}
                className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 hover:bg-surface-hover transition-colors"
                aria-label="Remove layer"
                title="Remove layer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <VolumeSlider
            value={layer.volume}
            onChange={(v) => onUpdate({ volume: v })}
            label={`Layer volume for ${layer.videoId}`}
            showValue
            disabled={layer.muted}
          />

          {layer.muted && (
            <p className="text-xs text-gray-600">Muted</p>
          )}
        </div>
      </div>
    </div>
  )
})
