'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useEntitlements } from '@/hooks/useEntitlements'
import { useStackStore } from '@/store/stackStore'
import type { StackConfig } from '@/types/stack'

interface SaveStackModalProps {
  isOpen: boolean
  onClose: () => void
  config: StackConfig
  onSaved?: (stackId: string) => void
}

export function SaveStackModal({ isOpen, onClose, config, onSaved }: SaveStackModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const { saveStack, localStacks } = useStackStore()
  const { canSaveMoreLocalStacks } = useEntitlements()

  function handleSave() {
    if (!name.trim()) {
      setError('Stack name is required')
      return
    }

    if (!canSaveMoreLocalStacks(localStacks.length)) {
      setError('You have reached the free plan limit of 5 stacks. Upgrade to save more.')
      return
    }

    const stack = saveStack(name.trim(), config, description.trim() || undefined)
    setName('')
    setDescription('')
    setError('')
    onClose()
    onSaved?.(stack.id)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Stack">
      <div className="space-y-4">
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

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave}>
            Save Stack
          </Button>
        </div>
      </div>
    </Modal>
  )
}
