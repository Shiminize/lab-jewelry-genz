'use client'

import type { ConciergeIntent, IntentChooserPayload } from '@/lib/concierge/types'

interface IntentChooserProps {
  payload: IntentChooserPayload
  onAction: (action: { type: string; data?: Record<string, unknown> }) => void
  disabled?: boolean
}

const DEFAULT_OPTIONS: Array<{
  intent: ConciergeIntent
  label: string
  description?: string
  payload?: Record<string, unknown>
}> = [
  {
    intent: 'find_product',
    label: 'Shop products',
    description: 'I’ll start with ready-to-ship picks and your budget.',
  },
  {
    intent: 'track_order',
    label: 'Track an order',
    description: 'Use your order number or email + postal code.',
  },
  {
    intent: 'stylist_contact',
    label: 'Talk to a stylist',
    description: 'Get a human immediately for sizing or changes.',
  },
]

export function IntentChooser({ payload, onAction, disabled }: IntentChooserProps) {
  const options = payload.options && payload.options.length > 0 ? payload.options : DEFAULT_OPTIONS

  return (
    <section className="space-y-3 rounded-2xl border border-border-subtle bg-surface-base p-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-secondary">
          {payload.headline ?? 'Let me get this right'}
        </p>
        {payload.description ? (
          <p className="mt-1 text-sm text-text-secondary">{payload.description}</p>
        ) : (
          <p className="mt-1 text-sm text-text-secondary">
            Choose what you need and I’ll jump to the right flow—no retyping required.
          </p>
        )}
        {payload.emphasizeHuman ? (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            Prefer a human right now? Pick “Talk to a stylist” and I’ll connect you.
          </p>
        ) : null}
      </div>
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option.intent}
            type="button"
            disabled={disabled}
            onClick={() =>
              onAction({
                type: 'intent-chooser-select',
                data: { intent: option.intent, payload: option.payload, source: 'intent-chooser' },
              })
            }
            className="flex items-start justify-between gap-3 rounded-2xl border border-border-subtle bg-surface-base px-3 py-2.5 text-left text-sm font-semibold text-text-primary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.description ? (
                <span className="text-xs font-normal text-text-secondary">{option.description}</span>
              ) : null}
            </div>
            <span aria-hidden className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Go
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
