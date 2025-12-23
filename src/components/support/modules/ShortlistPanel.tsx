'use client'

import type { ShortlistPanelPayload } from '@/lib/concierge/types'

interface ShortlistPanelProps {
  payload: ShortlistPanelPayload
  disabled?: boolean
  onAction: (action: { type: string; data?: unknown }) => void
}

export function ShortlistPanel({ payload, onAction, disabled }: ShortlistPanelProps) {
  const { items } = payload

  if (!items || items.length === 0) {
    return (
      <section className="w-full rounded-2xl border border-border-subtle bg-surface-base p-4 text-sm text-text-secondary shadow-sm">
        No items saved yet. Try “Save to shortlist” on a product.
      </section>
    )
  }

  return (
    <section className="w-full border border-border-subtle bg-surface-base p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">
            {payload.title ?? 'My shortlist'}
          </p>
          <p className="text-sm text-text-primary">
            {items.length} item{items.length === 1 ? '' : 's'} saved
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 border border-border-subtle/70 bg-neutral-50 px-3 py-3"
          >
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-semibold text-text-primary">{item.title}</span>
              {item.description ? (
                <span className="text-xs text-text-secondary line-clamp-2">{item.description}</span>
              ) : null}
              <span className="text-xs font-semibold text-text-primary">
                ${item.price?.toLocaleString?.() ?? '—'}
              </span>
              {item.shippingPromise ? (
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-secondary">
                  {item.shippingPromise}
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAction({ type: 'view-product', data: { product: item } })}
                className="inline-flex h-8 items-center justify-center border border-border-subtle px-3 text-[11px] font-semibold text-text-primary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                View
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAction({ type: 'shortlist-remove', data: { productId: item.id } })}
                className="inline-flex h-8 items-center justify-center border border-border-subtle px-3 text-[11px] font-semibold text-text-secondary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Primary Actions */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAction({ type: 'shortlist-escalate' })}
          className="inline-flex w-full items-center justify-center gap-2 border border-accent-primary bg-accent-primary px-4 py-3 text-xs font-semibold text-surface-base transition hover:bg-accent-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {payload.ctaLabel ?? 'Invite stylist to review'}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction({ type: 'shortlist-open-drawer' })}
            className="inline-flex items-center justify-center gap-2 border border-border-subtle bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-text-primary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            View full list
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction({ type: 'shortlist-checkout' })}
            className="inline-flex items-center justify-center gap-2 border border-border-subtle bg-surface-base px-4 py-2.5 text-xs font-semibold text-text-primary transition hover:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Utility Actions */}
      <div className="mt-6 flex items-center justify-center gap-6 border-t border-border-subtle pt-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAction({ type: 'shortlist-share' })}
          className="text-[11px] font-semibold uppercase tracking-widest text-text-muted transition hover:text-text-primary disabled:opacity-40"
        >
          Share
        </button>
        <button
          type="button"
          disabled={disabled || items.length === 0}
          onClick={() => onAction({ type: 'shortlist-clear' })}
          className="text-[11px] font-semibold uppercase tracking-widest text-text-muted transition hover:text-accent-secondary disabled:opacity-40"
        >
          Clear All
        </button>
      </div>
    </section>
  )
}
