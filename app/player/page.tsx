'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { extractVideoId } from '@/lib/youtube'
import { decodeStackFromParam, buildShareUrl } from '@/lib/share'
import { YouTubePlayer, type YouTubePlayerHandle } from '@/components/player/YouTubePlayer'
import { LayerPlayer, type LayerPlayerHandle } from '@/components/player/LayerPlayer'
import { PlayerControls } from '@/components/player/PlayerControls'
import { VolumeSlider } from '@/components/ui/VolumeSlider'
import { Button } from '@/components/ui/Button'
import { SaveStackModal } from '@/components/stacks/SaveStackModal'
import type { StackConfig } from '@/types/stack'

function PlayerPageInner() {
  const searchParams = useSearchParams()
  const {
    mainVideo, layers, layerGroupVolume,
    setMainUrl, setMainVolume, addLayer,
    removeLayer, updateLayer, setLayerGroupVolume,
    startSession, pauseSession, stopSession,
    loadStackConfig,
  } = usePlayerStore()

  const mainPlayerRef = useRef<YouTubePlayerHandle>(null)
  const layerPlayerRefs = useRef<Map<string, LayerPlayerHandle>>(new Map())

  const [mainUrlInput, setMainUrlInput] = useState('')
  const [mainUrlError, setMainUrlError] = useState('')
  const [layerUrlInput, setLayerUrlInput] = useState('')
  const [layerUrlError, setLayerUrlError] = useState('')
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  // Load stack from URL query param on mount
  useEffect(() => {
    const stackParam = searchParams.get('stack')
    if (stackParam) {
      const config = decodeStackFromParam(stackParam)
      if (config) {
        loadStackConfig(config)
        if (config.mainVideoId) {
          setMainUrlInput(`https://www.youtube.com/watch?v=${config.mainVideoId}`)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep mainUrlInput in sync when videoId is set from a loaded stack
  useEffect(() => {
    if (mainVideo.videoId && !mainUrlInput) {
      setMainUrlInput(`https://www.youtube.com/watch?v=${mainVideo.videoId}`)
    }
  }, [mainVideo.videoId, mainUrlInput])

  function handleMainUrlChange(url: string) {
    setMainUrlInput(url)
    setMainUrlError('')
    const videoId = extractVideoId(url)
    setMainUrl(url, videoId)
    if (url && !videoId) {
      setMainUrlError('Could not extract a valid YouTube video ID from this URL.')
    }
  }

  function handleAddLayer() {
    const videoId = extractVideoId(layerUrlInput)
    if (!videoId) {
      setLayerUrlError('Could not extract a valid YouTube video ID.')
      return
    }
    addLayer(videoId)
    setLayerUrlInput('')
    setLayerUrlError('')
  }

  const allPlay = useCallback(() => {
    mainPlayerRef.current?.setVolume(mainVideo.volume)
    mainPlayerRef.current?.play()
    layerPlayerRefs.current.forEach((ref, id) => {
      const layer = layers.find((l) => l.id === id)
      if (layer) {
        const vol = layer.muted ? 0 : Math.round((layer.volume * layerGroupVolume) / 100)
        ref.setVolume(vol)
      }
      ref.play()
    })
    startSession()
  }, [startSession, mainVideo.volume, layers, layerGroupVolume])

  const allPause = useCallback(() => {
    mainPlayerRef.current?.pause()
    layerPlayerRefs.current.forEach((ref) => ref.pause())
    pauseSession()
  }, [pauseSession])

  const allStop = useCallback(() => {
    mainPlayerRef.current?.stop()
    layerPlayerRefs.current.forEach((ref) => ref.stop())
    stopSession()
  }, [stopSession])

  function handleFadeStart() {
    // Gradually reduce all volumes over 10 seconds
    const steps = 20
    const intervalMs = 500
    let step = 0
    const ticker = setInterval(() => {
      step++
      const factor = Math.max(0, 1 - step / steps)
      mainPlayerRef.current?.setVolume(Math.round(mainVideo.volume * factor))
      layerPlayerRefs.current.forEach((ref) => ref.setVolume(Math.round(30 * factor)))
      if (step >= steps) clearInterval(ticker)
    }, intervalMs)
  }

  function handleShare() {
    const config: StackConfig = {
      mainVideoId: mainVideo.videoId ?? '',
      mainVolume: mainVideo.volume,
      layerGroupVolume,
      layers,
      timer: { durationMinutes: null, fadeOut: false },
    }
    const url = buildShareUrl(config)
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    })
  }

  const canStart = !!mainVideo.videoId

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Main video */}
          <section className="rounded-2xl border border-surface-border bg-surface-raised p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Main Track
            </h2>

            <div className="mb-4 space-y-2">
              <input
                type="url"
                value={mainUrlInput}
                onChange={(e) => handleMainUrlChange(e.target.value)}
                placeholder="Paste a YouTube URL (e.g. lofi hip hop radio)"
                className="w-full rounded-lg bg-surface border border-surface-border px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {mainUrlError && (
                <p className="text-xs text-red-400">{mainUrlError}</p>
              )}
            </div>

            <YouTubePlayer
              ref={mainPlayerRef}
              videoId={mainVideo.videoId}
              volume={mainVideo.volume}
              isMain
              nativeControls
            />

            <div className="mt-4">
              <VolumeSlider
                value={mainVideo.volume}
                onChange={setMainVolume}
                label="Main track volume"
                showValue
              />
            </div>
          </section>

          {/* Layers */}
          <section className="rounded-2xl border border-surface-border bg-surface-raised p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Layers
              </h2>
              <span className="text-xs text-gray-600">{layers.length > 0 ? `${layers.length} layer${layers.length !== 1 ? 's' : ''}` : ''}</span>
            </div>

            {/* Group controls — shown when layers exist */}
            {layers.length > 0 && (
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-surface border border-surface-border px-4 py-3">
                <span className="flex-shrink-0 text-xs font-medium text-gray-400 w-16">Group vol</span>
                <div className="flex-1">
                  <VolumeSlider
                    value={layerGroupVolume}
                    onChange={(v) => {
                      setLayerGroupVolume(v)
                      layerPlayerRefs.current.forEach((ref, id) => {
                        const layer = layers.find((l) => l.id === id)
                        if (layer) {
                          ref.setVolume(layer.muted ? 0 : Math.round((layer.volume * v) / 100))
                        }
                      })
                    }}
                    label="Layer group volume"
                    showValue
                  />
                </div>
                <div className="flex-shrink-0 flex items-center gap-1.5">
                  <button
                    onClick={() => layerPlayerRefs.current.forEach((ref) => ref.play())}
                    title="Play all layers"
                    className="flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs text-gray-400 hover:text-green-400 hover:border-green-800 hover:bg-green-950/40 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Play all
                  </button>
                  <button
                    onClick={() => layerPlayerRefs.current.forEach((ref) => ref.stop())}
                    title="Stop all layers"
                    className="flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:border-red-900 hover:bg-red-950/40 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    Stop all
                  </button>
                </div>
              </div>
            )}

            {/* Add layer input */}
            <div className="mb-4 flex gap-2">
              <input
                type="url"
                value={layerUrlInput}
                onChange={(e) => { setLayerUrlInput(e.target.value); setLayerUrlError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLayer()}
                placeholder="Add a layer URL (subliminal, rain, ambience…)"
                className="flex-1 rounded-lg bg-surface border border-surface-border px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Button variant="secondary" size="sm" onClick={handleAddLayer} disabled={!layerUrlInput}>
                Add
              </Button>
            </div>
            {layerUrlError && (
              <p className="mb-3 text-xs text-red-400">{layerUrlError}</p>
            )}

            {layers.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-surface-border py-8 text-center">
                <p className="text-sm text-gray-500">No layers added yet.</p>
                <p className="mt-1 text-xs text-gray-600">
                  Add subliminals, rain, or ambient audio to layer underneath.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {layers.map((layer) => (
                  <LayerPlayer
                    key={layer.id}
                    ref={(handle) => {
                      if (handle) layerPlayerRefs.current.set(layer.id, handle)
                      else layerPlayerRefs.current.delete(layer.id)
                    }}
                    layer={layer}
                    groupVolume={layerGroupVolume}
                    onUpdate={(patch) => updateLayer(layer.id, patch)}
                    onRemove={() => removeLayer(layer.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column — controls + actions */}
        <div className="space-y-4">
          <PlayerControls
            onPlay={allPlay}
            onPause={allPause}
            onStop={allStop}
            onFadeStart={handleFadeStart}
            canStart={canStart}
          />

          {/* Save & Share */}
          <div className="rounded-xl border border-surface-border bg-surface-raised p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Stack
            </h3>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setSaveModalOpen(true)}
              disabled={!canStart}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Stack
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleShare}
              disabled={!canStart}
            >
              {shareCopied ? (
                <>
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Link copied!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Copy share link
                </>
              )}
            </Button>
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-surface-border bg-surface/50 p-4 text-xs text-gray-500 space-y-1.5">
            <p className="font-medium text-gray-400">Tips</p>
            <p>• Click <strong className="text-gray-300">Start Session</strong> to begin playback.</p>
            <p>• Some videos block embedding — try a different URL if you see an error.</p>
            <p>• Use low layer volumes (10–30) for subliminals.</p>
          </div>
        </div>
      </div>

      <SaveStackModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        config={{
          mainVideoId: mainVideo.videoId ?? '',
          mainVolume: mainVideo.volume,
          layerGroupVolume,
          layers,
          timer: { durationMinutes: null, fadeOut: false },
        }}
      />
    </div>
  )
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center text-gray-400">
        Loading player…
      </div>
    }>
      <PlayerPageInner />
    </Suspense>
  )
}
