'use client'

import type { OrderTimelinePayload } from '@/lib/concierge/types'

interface OrderTimelineProps {
  payload: OrderTimelinePayload
  onAction: (action: { type: string; data?: unknown }) => void
}

export function OrderTimeline({ payload, onAction }: OrderTimelineProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-base p-4 shadow-sm">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-secondary">Order {payload.reference}</p>
        <p className="mt-1 text-sm font-semibold text-text-primary">{payload.headline}</p>
      </header>
      <ol className="space-y-3">
        {payload.entries.map((entry, index) => (
          <li key={index} className="flex items-start gap-3">
            <span
              className={`mt-1 inline-flex h-3 w-3 rounded-full ${
                entry.status === 'complete'
                  ? 'bg-accent-secondary'
                  : entry.status === 'current'
                    ? 'bg-accent-primary'
                    : 'bg-border-subtle'
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-text-primary">{entry.label}</p>
              {entry.date ? <p className="text-xs text-text-secondary">Target · {entry.date}</p> : null}
            </div>
          </li>
        ))}
      </ol>
      {payload.actions ? (
        <div className="flex flex-wrap gap-2">
          {payload.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction({ type: action.id })}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-base px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-1"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
