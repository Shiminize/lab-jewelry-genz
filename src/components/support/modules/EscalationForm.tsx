'use client'

import { useState } from 'react'
import type { EscalationFormPayload } from '@/lib/concierge/types'

interface EscalationFormProps {
  payload: EscalationFormPayload
  disabled?: boolean
  onAction: (action: { type: string; data?: unknown }) => void
}

export function EscalationForm({ payload, onAction, disabled }: EscalationFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [timePreference, setTimePreference] = useState('Anytime')

  const canSubmit = email.includes('@')

  return (
    <section className="space-y-3 rounded-2xl border border-border-subtle bg-surface-base p-4 shadow-sm">
      <header>
        <p className="text-sm font-semibold text-text-primary">{payload.heading}</p>
        <p className="mt-1 text-xs text-text-secondary">{payload.description}</p>
      </header>

      <div className="grid gap-3 text-sm font-semibold text-text-primary">
        <label>
          First name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
            disabled={disabled}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
            disabled={disabled}
            required
          />
        </label>
        <label>
          Preferred time
          <select
            value={timePreference}
            onChange={(event) => setTimePreference(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
            disabled={disabled}
          >
            <option value="Anytime">Anytime</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </label>
        <label>
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Share vision, sizing updates, or deadlines."
            rows={3}
            className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
            disabled={disabled}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() =>
          onAction({
            type: 'submit-escalation',
            data: {
              escalation: {
                name,
                email,
                notes,
                timePreference,
              },
            },
          })
        }
        disabled={disabled || !canSubmit}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-accent-primary px-4 py-2 text-sm font-semibold text-surface-base shadow-soft transition hover:bg-accent-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {payload.submitLabel}
      </button>
    </section>
  )
}
