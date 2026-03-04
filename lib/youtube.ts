export function extractVideoId(input: string): string | null {
  if (!input) return null
  const trimmed = input.trim()

  // Raw 11-char video ID
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    const hostname = url.hostname.replace(/^(www\.|m\.)/, '')

    if (hostname === 'youtu.be') {
      return url.pathname.slice(1).split('?')[0] || null
    }

    if (hostname === 'youtube.com') {
      const path = url.pathname
      if (path.startsWith('/embed/') || path.startsWith('/shorts/') || path.startsWith('/live/')) {
        return path.split('/')[2] || null
      }
      return url.searchParams.get('v')
    }
  } catch {
    return null
  }

  return null
}

export function getEmbedUrl(videoId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${origin}&rel=0&modestbranding=1`
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

// YT error codes for embed restrictions
export const YT_ERRORS: Record<number, string> = {
  2: 'Invalid video ID or URL.',
  5: 'The video cannot be played in your browser.',
  100: 'Video not found or set to private.',
  101: 'The video owner has disabled embedding.',
  150: 'The video owner has disabled embedding.',
}
