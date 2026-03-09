'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useEntitlements } from '@/hooks/useEntitlements'
import type { StackConfig } from '@/types/stack'

interface SaveStackModalProps {
  isOpen: boolean
  onClose: () => void
  config: StackConfig
  onSaved?: (stackId: string, stackName: string) => void
}

export function SaveStackModal({ isOpen, onClose, config, onSaved }: SaveStackModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const { plan, isSignedIn } = useEntitlements()

  const stackLimit = plan === 'pro' ? 20 : plan === 'starter' ? 5 : 1

  async function handleSave() {
    if (!name.trim()) { setError('Stack name is required'); return }
    if (!isSignedIn) { setError('Sign in to save stacks.'); return }

    setSaving(true)
    setError('')

    const res = await fetch('/api/stacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, config }),
    })
    const json = await res.json() as { stack?: { id: string }; error?: string }
    setSaving(false)

    if (!res.ok) {
      if (json.error === 'LIMIT_REACHED') {
        setError(`You've reached the ${plan} plan limit of ${stackLimit} stack${stackLimit !== 1 ? 's' : ''}. Upgrade to save more.`)
      } else {
        setError('Failed to save. Please try again.')
      }
      return
    }

    setName('')
    setDescription('')
    onClose()
    if (json.stack?.id) onSaved?.(json.stack.id, name.trim())
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Stack">
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg bg-brand-600/10 border border-brand-600/20 px-3 py-2">
          <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <span className="text-xs text-brand-300">
            Saving to cloud · {plan === 'free' ? '1 stack max' : `up to ${stackLimit} stacks on ${plan}`}
          </span>
        </div>

        <div>
          <label htmlFor="stack-name" className="block text-sm font-medium text-gray-300 mb-1.5">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="stack-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="My lofi focus stack"
            className="w-full rounded-lg bg-surface border border-surface-border px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            maxLength={80}
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="stack-desc" className="block text-sm font-medium text-gray-300 mb-1.5">
            Description <span className="text-gray-500">(optional)</span>
          </label>
          <input
            id="stack-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="My go-to morning focus setup..."
            className="w-full rounded-lg bg-surface border border-surface-border px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            maxLength={160}
          />
        </div>

        {!isSignedIn && (
          <p className="text-sm text-amber-400">You must be signed in to save stacks.</p>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving || !isSignedIn}>
            {saving ? 'Saving…' : 'Save Stack'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
