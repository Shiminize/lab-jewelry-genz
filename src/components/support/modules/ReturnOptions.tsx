'use client'

import type { ReturnOptionsPayload } from '@/lib/concierge/types'

interface ReturnOptionsProps {
  payload: ReturnOptionsPayload
  disabled?: boolean
  onAction: (action: { type: string; data?: unknown }) => void
}

export function ReturnOptions({ payload, onAction, disabled }: ReturnOptionsProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-border-subtle bg-surface-base p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-secondary">Choose an option</p>
      <div className="grid gap-2">
        {payload.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onAction({ type: 'submit-return-option', data: { selection: { option: option.id } } })}
            className="rounded-2xl border border-border-subtle bg-surface-base px-4 py-3 text-left transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <p className="text-sm font-semibold text-text-primary">{option.label}</p>
            {option.description ? <p className="text-xs text-text-secondary">{option.description}</p> : null}
          </button>
        ))}
      </div>
    </section>
  )
}
