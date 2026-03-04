import { create } from 'zustand'
import type { LayerConfig, StackConfig } from '@/types/stack'
import { nanoid } from 'nanoid'

interface MainVideo {
  url: string
  videoId: string | null
  volume: number
}

interface TimerSettings {
  durationMinutes: number | null
  fadeOut: boolean
  customMinutes: number
}

export type SessionState = 'idle' | 'playing' | 'paused' | 'stopped'

interface PlayerState {
  mainVideo: MainVideo
  layers: LayerConfig[]
  layerGroupVolume: number
  timer: TimerSettings
  sessionState: SessionState
  sessionStartedAt: number | null

  setMainUrl: (url: string, videoId: string | null) => void
  setMainVolume: (v: number) => void
  addLayer: (videoId: string) => void
  removeLayer: (id: string) => void
  updateLayer: (id: string, patch: Partial<LayerConfig>) => void
  setLayerGroupVolume: (v: number) => void
  setTimer: (t: Partial<TimerSettings>) => void
  startSession: () => void
  pauseSession: () => void
  stopSession: () => void
  loadStackConfig: (config: StackConfig) => void
  reset: () => void
}

const DEFAULT_TIMER: TimerSettings = {
  durationMinutes: null,
  fadeOut: false,
  customMinutes: 30,
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  mainVideo: { url: '', videoId: null, volume: 80 },
  layers: [],
  layerGroupVolume: 60,
  timer: DEFAULT_TIMER,
  sessionState: 'idle',
  sessionStartedAt: null,

  setMainUrl: (url, videoId) =>
    set((s) => ({ mainVideo: { ...s.mainVideo, url, videoId } })),

  setMainVolume: (v) =>
    set((s) => ({ mainVideo: { ...s.mainVideo, volume: v } })),

  addLayer: (videoId) =>
    set((s) => ({
      layers: [
        ...s.layers,
        { id: nanoid(), videoId, volume: 50, muted: false },
      ],
    })),

  removeLayer: (id) =>
    set((s) => ({ layers: s.layers.filter((l) => l.id !== id) })),

  updateLayer: (id, patch) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })),

  setLayerGroupVolume: (v) => set({ layerGroupVolume: v }),

  setTimer: (t) => set((s) => ({ timer: { ...s.timer, ...t } })),

  startSession: () =>
    set({ sessionState: 'playing', sessionStartedAt: Date.now() }),

  pauseSession: () => set({ sessionState: 'paused' }),

  stopSession: () =>
    set({ sessionState: 'stopped', sessionStartedAt: null }),

  loadStackConfig: (config) =>
    set({
      mainVideo: { url: '', videoId: config.mainVideoId, volume: config.mainVolume },
      layers: config.layers,
      layerGroupVolume: config.layerGroupVolume,
      timer: {
        durationMinutes: config.timer.durationMinutes,
        fadeOut: config.timer.fadeOut,
        customMinutes: config.timer.durationMinutes ?? 30,
      },
      sessionState: 'idle',
      sessionStartedAt: null,
    }),

  reset: () =>
    set({
      mainVideo: { url: '', videoId: null, volume: 80 },
      layers: [],
      layerGroupVolume: 60,
      timer: DEFAULT_TIMER,
      sessionState: 'idle',
      sessionStartedAt: null,
    }),
}))
