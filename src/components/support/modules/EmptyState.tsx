'use client'

export interface EmptyStateSuggestion {
  label: string
  slug?: string
  filters: Record<string, unknown>
}

interface EmptyStateProps {
  currentFilters: Record<string, unknown>
  onSuggestionClick: (suggestion: EmptyStateSuggestion) => void
}

/**
 * Empty State Component
 * Shows explicit alternative suggestions when no results found
 * NEVER silently relaxes filters - only suggests explicit changes
 */
export function EmptyState({ currentFilters, onSuggestionClick }: EmptyStateProps) {
  const suggestions = generateSuggestions(currentFilters)

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {/* Icon */}
      <div className="mb-4 text-text-muted">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>

      {/* Message */}
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        No products found
      </h3>
      <p className="text-sm text-text-secondary mb-6 max-w-sm">
        We couldn&apos;t find any products matching your criteria. Try one of these suggestions:
      </p>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="w-full max-w-md space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 rounded-lg border border-border-subtle hover:border-accent-primary hover:bg-neutral-50 transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">
                {suggestion.label}
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(suggestion.filters).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-block px-2 py-0.5 text-xs rounded bg-neutral-100 text-text-secondary"
                  >
                    {formatParamDisplay(key, value)}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Fallback */}
      {suggestions.length === 0 && (
        <button
          onClick={() =>
            onSuggestionClick({
              label: 'Browse all ready-to-ship products',
              slug: 'ready-to-ship',
              filters: { readyToShip: true, featured: true },
            })
          }
          className="px-4 py-2 rounded-lg bg-accent-primary text-surface-base transition hover:bg-accent-primary/88"
        >
          Browse all ready-to-ship products
        </button>
      )}
    </div>
  )
}

/**
 * Generate contextual suggestions based on current filters
 * NEVER relaxes existing filters - only suggests explicit alternatives
 */
function generateSuggestions(filters: Record<string, unknown>): EmptyStateSuggestion[] {
  const suggestions: EmptyStateSuggestion[] = []

  const baseReadyToShip = {
    readyToShip: true,
    featured: true,
  }

  const baseGift = {
    readyToShip: true,
    featured: true,
    tags: ['gift'],
  }

  const currentCategory = typeof filters.category === 'string' ? filters.category : undefined

  // Helper to build suggestions with sanitized filter sets
  const buildSuggestion = (
    label: string,
    slug: string,
    overrides: Record<string, unknown>,
    type: 'ready' | 'gift' = 'ready'
  ) => {
    const base = type === 'gift' ? baseGift : baseReadyToShip
    const finalFilters: Record<string, unknown> = {
      ...base,
      ...(type === 'ready' && currentCategory ? { category: currentCategory } : {}),
      ...overrides,
    }

    if (Array.isArray(finalFilters.tags)) {
      const cleanedTags = (finalFilters.tags as unknown[]).filter((tag) => tag !== '__none__')
      if (cleanedTags.length > 0) {
        finalFilters.tags = cleanedTags
      } else {
        delete finalFilters.tags
      }
    }

    suggestions.push({
      label,
      slug,
      filters: finalFilters,
    })
  }

  // Price-based suggestions
  if (typeof filters.priceLt === 'number') {
    const currentMax = filters.priceLt

    if (currentMax < 300) {
      buildSuggestion('Try rings under $500', 'gifts-under-300', { category: 'ring', priceLt: 500 }, 'gift')
    }

    if (currentMax < 500) {
      buildSuggestion('Try rings under $1000', 'gifts-under-300', { category: 'ring', priceLt: 1000 }, 'gift')
    }

    // Reset price ceiling entirely
    buildSuggestion('See all ready-to-ship rings', 'ready-to-ship', { category: 'ring' })
  }

  // Category swaps
  if (currentCategory) {
    const otherCategories = ['ring', 'necklace', 'earring', 'bracelet'].filter(
      (cat) => cat !== currentCategory
    )

    otherCategories.slice(0, 2).forEach((category) => {
      buildSuggestion(`Try ready-to-ship ${category}s`, 'ready-to-ship', { category })
    })
  }

  // Generic category suggestions when none selected
  if (!currentCategory) {
    buildSuggestion('Try ready-to-ship rings', 'ready-to-ship', { category: 'ring' })
    buildSuggestion('Try ready-to-ship necklaces', 'ready-to-ship', { category: 'necklace' })
  }

  // Ready-to-ship baseline suggestion
  if (!filters.readyToShip) {
    buildSuggestion('Try ready-to-ship products', 'ready-to-ship', {})
  }

  return suggestions.slice(0, 3)
}

/**
 * Format param key-value for display
 */
function formatParamDisplay(key: string, value: unknown): string {
  if (key === 'priceLt') return `Under $${value}`
  if (key === 'priceMax') return `Max $${value}`
  if (key === 'priceMin') return `Min $${value}`
  if (key === 'category') return String(value)
  if (key === 'readyToShip') return 'Ready to ship'
  if (key === 'featured') return 'Curated'
  if (key === 'tags') return Array.isArray(value) ? value.join(', ') : String(value)
  return `${key}: ${value}`
}
