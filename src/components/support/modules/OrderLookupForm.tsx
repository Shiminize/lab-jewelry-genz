'use client'

import { useState } from 'react'
import type { OrderLookupPayload } from '@/lib/concierge/types'

interface OrderLookupFormProps {
  payload: OrderLookupPayload
  disabled?: boolean
  onAction: (action: { type: string; data?: unknown }) => void
}

export function OrderLookupForm({ payload, onAction, disabled }: OrderLookupFormProps) {
  const [mode, setMode] = useState<OrderLookupPayload['mode']>(payload.mode)
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const canSubmit =
    (mode === 'orderId' && orderId.trim().length >= 5) ||
    (mode === 'emailZip' && email.includes('@') && postalCode.trim().length >= 3)

  return (
    <section className="space-y-3 rounded-2xl border border-border-subtle bg-surface-base p-4 shadow-sm">
      <div className="flex gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-secondary">
        <button
          type="button"
          onClick={() => setMode('orderId')}
          className={`rounded-full px-3 py-1 ${
            mode === 'orderId'
              ? 'bg-text-primary text-surface-base'
              : 'border border-border-subtle bg-surface-base text-text-secondary'
          }`}
          disabled={disabled}
        >
          Order number
        </button>
        <button
          type="button"
          onClick={() => setMode('emailZip')}
          className={`rounded-full px-3 py-1 ${
            mode === 'emailZip'
              ? 'bg-text-primary text-surface-base'
              : 'border border-border-subtle bg-surface-base text-text-secondary'
          }`}
          disabled={disabled}
        >
          Email + postal code
        </button>
      </div>

      {mode === 'orderId' ? (
        <label className="text-sm font-semibold text-text-primary">
          Order number
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
            placeholder="GG-12345"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            disabled={disabled}
            autoFocus={mode === 'orderId'}
          />
        </label>
      ) : (
        <div className="grid gap-3 text-sm font-semibold text-text-primary">
          <label>
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={disabled}
              autoFocus={mode === 'emailZip'}
            />
          </label>
          <label>
            Postal code
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary"
              placeholder="ZIP / Postal code"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              disabled={disabled}
            />
          </label>
        </div>
      )}

      <p className="text-xs text-text-secondary">
        Tip: Order numbers look like GG-12345. Email + postal code also works.
      </p>

      <button
        type="button"
        onClick={() =>
          onAction({
            type: 'submit-order-lookup',
            data: {
              details: mode === 'orderId' ? { orderId } : { email, postalCode },
            },
          })
        }
        disabled={disabled || !canSubmit}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-accent-primary px-4 py-2 text-sm font-semibold text-surface-base shadow-soft transition hover:bg-accent-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        Check status
      </button>
    </section>
  )
}
