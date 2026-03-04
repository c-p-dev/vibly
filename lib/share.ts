import LZString from 'lz-string'
import type { StackConfig } from '@/types/stack'

export function encodeStackToParam(config: StackConfig): string {
  const json = JSON.stringify(config)
  return LZString.compressToEncodedURIComponent(json)
}

export function decodeStackFromParam(param: string): StackConfig | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(param)
    if (!json) return null
    return JSON.parse(json) as StackConfig
  } catch {
    return null
  }
}

export function buildShareUrl(config: StackConfig): string {
  const param = encodeStackToParam(config)
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/player?stack=${param}`
}
