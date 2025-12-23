'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { ProductCarouselPayload } from '@/lib/concierge/types'
import type { SortBy } from '@/lib/concierge/providers/types'
import { ReadyBadge } from './ProductBadge'
import { EmptyState, type EmptyStateSuggestion } from './EmptyState'
import { SortControls } from './SortControls'

interface ProductCarouselProps {
  payload: ProductCarouselPayload
  disabled?: boolean
  onAction: (action: { type: string; data?: unknown }) => void
}

export function ProductCarousel({ payload, onAction, disabled }: ProductCarouselProps) {
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set())
  const currentFilters = useMemo(() => ({ ...(payload.filters ?? {}) }), [payload.filters])
  const currentSort: SortBy = payload.sortBy ?? 'featured'

  const handleSortChange = (sortBy: SortBy) => {
    onAction({
      type: 'filter_change',
      data: { filters: { ...currentFilters }, sortBy },
    })
  }

  const handleSuggestionClick = (suggestion: EmptyStateSuggestion) => {
    onAction({
      type: 'apply-filters',
      data: suggestion,
    })
  }

  // Show empty state if no products
  if (!payload.products || payload.products.length === 0) {
    return (
      <section className="border border-border-subtle bg-surface-base shadow-sm">
        <EmptyState
          currentFilters={currentFilters}
          onSuggestionClick={handleSuggestionClick}
        />
      </section>
    )
  }

  return (
    <section id="results" className="space-y-0 border border-border-subtle bg-surface-base">
      {/* Sort Controls */}
      <SortControls
        currentSort={currentSort}
        onSortChange={handleSortChange}
        disabled={disabled}
      />

      {/* Products Grid */}
      <div className="grid gap-3 p-4">
        {payload.products.map((product, productIndex) => (
          <article
            key={product.id ?? `${product.title ?? 'product'}-${productIndex}`}
            data-testid="product-card"
            className="flex items-start gap-3 border border-border-subtle bg-surface-base px-3 py-3"
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden bg-neutral-50 ring-1 ring-border-subtle">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title || 'Product image'}
                  fill
                  sizes="64px"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[11px] text-text-secondary">
                  GlowGlitch
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-text-primary">{product.title}</p>
                <p className="text-xs text-text-secondary">${product.price.toLocaleString()}</p>
                <ReadyBadge product={product} />
                {product.description ? (
                  <p className="text-xs text-text-secondary">{product.description}</p>
                ) : null}
                {product.shippingPromise ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-secondary">
                    {product.shippingPromise}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                {product.tags?.map((tag, tagIndex) => (
                  <span
                    key={`${product.id ?? product.title ?? 'product'}-${tag}-${tagIndex}`}
                    className="inline-flex items-center border border-border-subtle px-2 py-1 text-[11px] uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setShortlistedIds(prev => new Set(prev).add(product.id))
                    onAction({
                      type: 'shortlist-product',
                      data: { product },
                    })
                  }}
                  className={`inline-flex items-center gap-2 border px-3 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${shortlistedIds.has(product.id)
                    ? 'border-accent-primary bg-neutral-50 text-text-primary'
                    : 'border-border-subtle bg-surface-base text-text-primary hover:border-accent-secondary'
                    }`}
                >
                  {shortlistedIds.has(product.id) ? (
                    <>
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Saved ✓
                    </>
                  ) : (
                    'Save to shortlist'
                  )}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onAction({
                      type: 'view-product',
                      data: { product },
                    })
                  }
                  className="inline-flex items-center gap-2 border border-border-subtle bg-surface-base px-3 py-2.5 text-xs font-semibold text-text-primary transition hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-secondary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  View details
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {/* Footer CTA removed - individual product actions provide better UX */}
    </section>
  )
}
