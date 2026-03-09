'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

// Singleton promise — load the YT IFrame API script only once
let apiPromise: Promise<void> | null = null

function loadYTApi(): Promise<void> {
  if (apiPromise) return apiPromise

  apiPromise = new Promise<void>((resolve) => {
    if (typeof window === 'undefined') return
    if (window.YT?.Player) {
      resolve()
      return
    }

    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)
  })

  return apiPromise
}

interface UseYouTubePlayerOptions {
  videoId: string | null
  volume: number
  nativeControls?: boolean
  autoPlayOnLoad?: boolean
  onError?: (code: number) => void
  onReady?: () => void
}

export function useYouTubePlayer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseYouTubePlayerOptions
) {
  const playerRef = useRef<YT.Player | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!options.videoId) return

    let cancelled = false

    loadYTApi().then(() => {
      if (cancelled || !containerRef.current || !optionsRef.current.videoId) return

      // Hot-swap: if a player already exists, just load the new video into it
      if (playerRef.current) {
        try {
          if (optionsRef.current.autoPlayOnLoad) {
            playerRef.current.loadVideoById(optionsRef.current.videoId!)
          } else {
            playerRef.current.cueVideoById(optionsRef.current.videoId!)
          }
          playerRef.current.setVolume(optionsRef.current.volume)
        } catch { /* ignore */ }
        return
      }

      // Create an inner mount element for YouTube to replace.
      // YouTube's IFrame API replaces the element you hand it with an <iframe>,
      // so we give it a fresh child div — not containerRef.current itself —
      // so React's reference to the container stays valid.
      const mount = document.createElement('div')
      containerRef.current.appendChild(mount)

      playerRef.current = new window.YT.Player(mount, {
        videoId: optionsRef.current.videoId!,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: optionsRef.current.nativeControls ? 1 : 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
          iv_load_policy: 3,
          fs: 0,
        },
        events: {
          onReady: (e: YT.PlayerEvent) => {
            e.target.setVolume(optionsRef.current.volume)
            optionsRef.current.onReady?.()
          },
          onStateChange: (e: YT.OnStateChangeEvent) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING)
          },
          onError: (e: YT.OnErrorEvent) => {
            optionsRef.current.onError?.(e.data)
          },
        },
      })
    })

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.videoId])

  // Destroy player only on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch { /* ignore */ }
        playerRef.current = null
      }
    }
  }, [])

  // Update volume without re-creating player
  useEffect(() => {
    if (playerRef.current) {
      try { playerRef.current.setVolume(options.volume) } catch { /* ignore */ }
    }
  }, [options.volume])

  const play = useCallback(() => {
    try { playerRef.current?.playVideo() } catch { /* ignore */ }
  }, [])

  const pause = useCallback(() => {
    try { playerRef.current?.pauseVideo() } catch { /* ignore */ }
  }, [])

  const stop = useCallback(() => {
    try { playerRef.current?.stopVideo() } catch { /* ignore */ }
  }, [])

  const setVolume = useCallback((v: number) => {
    try { playerRef.current?.setVolume(v) } catch { /* ignore */ }
  }, [])

  return { play, pause, stop, setVolume, isPlaying, playerRef }
}
