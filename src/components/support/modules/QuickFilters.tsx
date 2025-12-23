'use client'

import type { QuickFiltersPayload } from '@/lib/concierge/types'

interface QuickFiltersProps {
  payload: QuickFiltersPayload
  onAction: (action: { type: string; data?: unknown }) => void
}

export function QuickFilters({ payload, onAction }: QuickFiltersProps) {
  const handleClick = (filterPayload: Record<string, unknown>) => {
    onAction({
      type: 'submit-product-filters',
      data: filterPayload,
    })
  }

  return (
    <div className="w-full rounded-3xl border border-border-subtle bg-surface-base p-4 shadow-soft">
      <p className="mb-3 text-sm text-text-primary">{payload.prompt}</p>
      <div className="flex flex-wrap gap-2">
        {payload.filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => handleClick(filter.payload)}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle/70 bg-neutral-50 px-3 py-2 text-xs font-semibold text-text-primary shadow-soft transition hover:border-text-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
