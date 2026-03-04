'use client'

import type { Stack } from '@/types/stack'
import { Button } from '@/components/ui/Button'
import { getThumbnailUrl } from '@/lib/youtube'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface StackCardProps {
  stack: Stack
  onLoad: () => void
  onDelete?: () => void
  onShare?: () => void
  isCloud?: boolean
}

export function StackCard({ stack, onLoad, onDelete, onShare, isCloud }: StackCardProps) {
  const thumb = stack.config.mainVideoId
    ? getThumbnailUrl(stack.config.mainVideoId)
    : null

  const layerCount = stack.config.layers.length

  return (
    <div className="group relative rounded-xl border border-surface-border bg-surface-raised hover:border-brand-600/40 transition-colors">
      {/* Thumbnail */}
      {thumb && (
        <div className="relative h-32 overflow-hidden rounded-t-xl">
          <Image
            src={thumb}
            alt={stack.name}
            fill
            className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-transparent" />
          {isCloud && (
            <div className="absolute top-2 right-2">
              <span className="rounded-full bg-brand-600/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
                Cloud
              </span>
            </div>
          )}
        </div>
      )}

      <div className={cn('p-4', !thumb && 'pt-4')}>
        <div className="mb-3">
          <h3 className="font-semibold text-white truncate">{stack.name}</h3>
          {stack.description && (
            <p className="mt-0.5 text-sm text-gray-400 truncate">{stack.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-600">
            {layerCount} layer{layerCount !== 1 ? 's' : ''} · {new Date(stack.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onLoad} className="flex-1">
            Load
          </Button>
          {onShare && (
            <Button variant="ghost" size="sm" onClick={onShare} aria-label="Share stack">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete stack">
              <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
