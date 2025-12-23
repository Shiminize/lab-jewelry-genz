'use client'

import type { SortBy } from '@/lib/concierge/providers/types'

interface SortControlsProps {
  currentSort: SortBy
  onSortChange: (sortBy: SortBy) => void
  disabled?: boolean
}

export function SortControls({ currentSort, onSortChange, disabled }: SortControlsProps) {
  const sortOptions: Array<{ value: SortBy; label: string }> = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price Low' },
    { value: 'price-desc', label: 'Price High' },
  ]

  return (
    <div className="flex items-center gap-2 border-t border-border-subtle bg-neutral-50 px-4 py-2">
      <div className="flex gap-1 flex-wrap w-full">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            disabled={disabled}
            className={`
              inline-flex items-center gap-1 border px-3 py-1.5 text-xs font-medium transition
              ${currentSort === option.value
                ? 'border-text-primary bg-text-primary text-surface-base shadow-soft'
                : 'border-border-subtle bg-surface-base text-text-secondary hover:border-text-primary hover:text-text-primary'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
