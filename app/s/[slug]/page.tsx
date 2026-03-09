import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { encodeStackToParam } from '@/lib/share'
import { getThumbnailUrl } from '@/lib/youtube'
import type { StackConfig } from '@/types/stack'
import Image from 'next/image'
import { JournalSection } from '@/components/stacks/JournalSection'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PublicStackPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: rawStack } = await supabase
    .from('stacks')
    .select('*')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()

  if (!rawStack) notFound()

  const stack = rawStack as {
    id: string; name: string; description: string | null
    config: StackConfig; is_public: boolean; public_slug: string | null
    user_id: string; created_at: string; updated_at: string
  }

  const config = stack.config as StackConfig
  const encodedStack = encodeStackToParam(config)
  const thumb = config.mainVideoId ? getThumbnailUrl(config.mainVideoId) : null

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-raised">
        {/* Thumbnail */}
        {thumb && (
          <div className="relative h-48">
            <Image
              src={thumb}
              alt={stack.name}
              fill
              className="object-cover opacity-60"
              sizes="(max-width: 768px) 100vw, 672px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/60 to-transparent" />
          </div>
        )}

        <div className="p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full border border-brand-600/30 bg-brand-600/10 px-2 py-0.5 text-xs text-brand-400">
              Public Stack
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">{stack.name}</h1>
          {stack.description && (
            <p className="mt-2 text-gray-400">{stack.description}</p>
          )}

          {/* Config summary */}
          <div className="mt-5 rounded-xl bg-surface border border-surface-border p-4 text-sm space-y-2">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-gray-500">Main track:</span>
              <code className="font-mono text-xs text-brand-300">{config.mainVideoId}</code>
              <span className="text-gray-500">vol {config.mainVolume}</span>
            </div>
            {config.layers.length > 0 && (
              <div>
                <p className="text-gray-500 mb-1">Layers ({config.layers.length}):</p>
                {config.layers.map((layer) => (
                  <div key={layer.id} className="flex items-center gap-2 pl-3 text-gray-400">
                    <span className="font-mono text-xs">{layer.videoId}</span>
                    <span className="text-gray-600">vol {layer.volume}</span>
                    {layer.muted && <span className="text-yellow-600">muted</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/player?stack=${encodedStack}`}
              className="flex-1 rounded-xl bg-brand-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              Load in Player →
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-xl border border-surface-border bg-surface px-5 py-3 text-center text-sm font-medium text-gray-300 hover:bg-surface-raised transition-colors"
            >
              Create your own
            </Link>
          </div>
        </div>
      </div>

      <JournalSection stackId={stack.id} readOnly />

      <p className="mt-6 text-center text-xs text-gray-600">
        Shared via <Link href="/" className="text-gray-500 hover:text-gray-300">Vibly</Link>
        {' '}· Not medical advice
      </p>
    </div>
  )
}
