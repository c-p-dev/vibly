export interface LayerConfig {
  id: string
  videoId: string
  volume: number
  muted: boolean
  label?: string
}

export interface StackConfig {
  mainVideoId: string
  mainVolume: number
  layerGroupVolume: number
  layers: LayerConfig[]
  timer: {
    durationMinutes: number | null
    fadeOut: boolean
  }
}

export interface Stack {
  id: string
  name: string
  description?: string
  config: StackConfig
  isPublic?: boolean
  publicSlug?: string
  createdAt: string
}
