'use client'

import type { CsatsPromptPayload } from '@/lib/concierge/types'

interface CsatPromptProps {
  payload: CsatsPromptPayload
  disabled?: boolean
  onAction: (action: { type: string; data?: unknown }) => void
}

export function CsatPrompt({ payload, onAction, disabled }: CsatPromptProps) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-base p-4 shadow-soft">
      <p className="text-sm font-semibold text-text-primary">{payload.question}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onAction({
              type: 'submit-csat',
              data: { response: { rating: 'great' } },
            })
          }
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-text-primary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          👍 Great
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onAction({
              type: 'submit-csat',
              data: { response: { rating: 'needs_follow_up' } },
            })
          }
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-text-primary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          👎 Needs follow-up
        </button>
      </div>
    </section>
  )
}
