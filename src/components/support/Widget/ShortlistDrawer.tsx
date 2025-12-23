'use client'


import type { ProductSummary } from '@/lib/concierge/types'

interface ShortlistDrawerProps {
  items: ProductSummary[]
  isOpen: boolean
  disabled?: boolean
  onAction: (action: { type: string; data?: unknown }) => void
  onClose: () => void
}

export function ShortlistDrawer({ items, isOpen, disabled, onAction, onClose }: ShortlistDrawerProps) {
  if (!isOpen || typeof document === 'undefined') {
    return null
  }

  const hasItems = items && items.length > 0

  // Render inline (not portal) to allow absolute positioning relative to the widget container
  return (
    <div
      className={`
        fixed inset-0 z-[120] flex items-end justify-end sm:z-30 sm:inset-auto sm:bottom-20 sm:right-[500px] sm:h-[min(640px,88vh)] sm:w-[400px]
        ${!isOpen ? 'pointer-events-none' : ''}
      `}
    >
      {/* Mobile Backdrop */}
      <button
        type="button"
        aria-label="Close saved items"
        className={`
          absolute inset-0 bg-neutral-900/20 transition-opacity sm:hidden
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`
          relative m-4 w-[min(520px,calc(100vw-1.5rem))] max-w-[520px] overflow-hidden border border-border-subtle bg-surface-base shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 sm:translate-y-0 sm:translate-x-4 sm:opacity-0'}
          sm:absolute sm:inset-0 sm:m-0 sm:h-full sm:w-full
          sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]
        `}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-text-muted">Saved Items</p>
            <p className="text-sm text-text-secondary">
              {items.length} item{items.length === 1 ? '' : 's'} saved
            </p>
          </div>
          <div className="flex gap-2">
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAction({ type: 'shortlist-share' })}
                disabled={disabled || !hasItems}
                className="inline-flex items-center justify-center border border-border-subtle bg-surface-base px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-accent-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Share
              </button>
              <button
                type="button"
                onClick={() => onAction({ type: 'shortlist-copy-link' })}
                disabled={disabled || !hasItems}
                className="inline-flex items-center justify-center border border-border-subtle bg-neutral-50 px-3 py-2 text-[11px] font-semibold text-text-secondary transition hover:border-accent-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                title="Copy a link to reopen these items later"
              >
                Copy link
              </button>
            </div>
            <button
              type="button"
              onClick={() => onAction({ type: 'shortlist-escalate' })}
              disabled={disabled || !hasItems}
              className="inline-flex items-center justify-center border border-accent-primary/60 bg-accent-primary px-3 py-2 text-xs font-semibold text-surface-base transition hover:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Invite stylist
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center border border-border-subtle bg-neutral-50 px-3 py-2 text-xs font-semibold text-text-secondary transition hover:border-text-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4 sm:max-h-[calc(100%-80px)]">
          {!hasItems ? (
            <div className="border border-border-subtle bg-neutral-50 px-4 py-6 text-sm text-text-secondary">
              No items saved yet. Tap “Save to shortlist” on any product to collect them here.
            </div>
          ) : null}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 border border-border-subtle bg-surface-base px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-primary">{item.title}</span>
                {item.description ? (
                  <span className="text-xs text-text-secondary line-clamp-2">{item.description}</span>
                ) : null}
                <span className="text-xs font-semibold text-text-primary">
                  ${item.price?.toLocaleString?.() ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                {item.shippingPromise ? (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent-secondary">
                    {item.shippingPromise}
                  </span>
                ) : null}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onAction({
                      type: 'shortlist-view-links',
                      data: {
                        productId: item.id,
                        title: item.title,
                        slug: item.slug,
                      },
                    })
                  }
                  className="inline-flex items-center justify-center border border-border-subtle px-3 py-1.5 text-[11px] font-semibold text-text-secondary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Open PDP/collection
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onAction({ type: 'view-product', data: { product: item } })}
                  className="inline-flex items-center justify-center border border-border-subtle px-3 py-1.5 text-[11px] font-semibold text-text-primary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  View details
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onAction({ type: 'shortlist-remove', data: { productId: item.id } })}
                  className="inline-flex items-center justify-center border border-border-subtle px-3 py-1.5 text-[11px] font-semibold text-text-secondary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-neutral-50 px-5 py-3 text-sm text-text-secondary">
          <div>
            <p className="text-xs font-semibold text-text-primary">Share or clear saved items</p>
            <p className="text-[11px] text-text-secondary">
              We’ll attach them to stylist tickets automatically.
            </p>
          </div>
          <button
            type="button"
            disabled={disabled || !hasItems}
            onClick={() => onAction({ type: 'shortlist-clear' })}
            className="inline-flex items-center justify-center border border-border-subtle bg-surface-base px-3 py-2 text-[11px] font-semibold text-text-secondary transition hover:border-text-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-subtle focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove all
          </button>
          <button
            type="button"
            disabled={disabled || !hasItems}
            onClick={() => onAction({ type: 'shortlist-checkout' })}
            className="inline-flex items-center justify-center border border-accent-primary/70 bg-neutral-50 px-3 py-2 text-[11px] font-semibold text-text-primary transition hover:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Go to checkout
          </button>
        </div>
      </div>
    </div>
  )
}
