'use client'

import React from 'react'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

interface SearchFilters {
  category: string[]
  subcategory: string[]
  materials: string[]
  gemstones: string[]
  priceMin?: number
  priceMax?: number
  inStock: boolean
  featured: boolean
  newArrival: boolean
  rating?: number
  tags: string[]
}

interface FacetData {
  categories: Array<{ _id: string; count: number }>
  subcategories: Array<{ _id: string; count: number }>
  materials: Array<{ _id: string; count: number }>
  gemstones: Array<{ _id: string; count: number }>
  priceRanges: Array<{ _id: string; count: number }>
  ratings: Array<{ _id: number; count: number }>
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters
  facets: FacetData | null
  isVisible: boolean
  onToggle: () => void
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
  className?: string
}

export function AdvancedSearchFilters({
  filters,
  facets,
  isVisible,
  onToggle,
  onFiltersChange,
  onClearFilters,
  className
}: AdvancedSearchFiltersProps) {
  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleArrayFilter = (field: keyof Pick<SearchFilters, 'category' | 'subcategory' | 'materials' | 'gemstones' | 'tags'>, value: string) => {
    const currentArray = filters[field]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilters({ [field]: newArray })
  }

  const activeFilterCount = Object.values(filters).flat().filter(Boolean).length

  return (
    <div className={cn('space-y-token-md', className)}>
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onToggle}
          className={cn(
            'flex items-center gap-2',
            isVisible && 'bg-muted'
          )}
        >
          <FunnelIcon className="w-4 h-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="bg-cta text-background text-xs px-2 py-0.5 rounded-token-lg">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted hover:text-foreground"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isVisible && (
        <div className="bg-background border border-border rounded-token-md p-6 space-y-6 shadow-[0_8px_24px_color-mix(in_srgb,var(--nebula-purple)_15%,transparent)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Categories */}
            <div>
              <H3 className="mb-3">Categories</H3>
              <div className="space-y-token-sm max-h-48 overflow-y-auto">
                {facets?.categories.map(({ _id, count }) => (
                  <label key={_id} className="flex items-center space-x-token-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(_id)}
                      onChange={() => toggleArrayFilter('category', _id)}
                      className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <MutedText className="capitalize">{_id}</MutedText>
                      <MutedText size="sm" className="text-muted/60">({count})</MutedText>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <H3 className="mb-3">Materials</H3>
              <div className="space-y-token-sm max-h-48 overflow-y-auto">
                {facets?.materials.map(({ _id, count }) => (
                  <label key={_id} className="flex items-center space-x-token-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.materials.includes(_id)}
                      onChange={() => toggleArrayFilter('materials', _id)}
                      className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <MutedText>{_id}</MutedText>
                      <MutedText size="sm" className="text-muted/60">({count})</MutedText>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Gemstones */}
            <div>
              <H3 className="mb-3">Gemstones</H3>
              <div className="space-y-token-sm max-h-48 overflow-y-auto">
                {facets?.gemstones.map(({ _id, count }) => (
                  <label key={_id} className="flex items-center space-x-token-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.gemstones.includes(_id)}
                      onChange={() => toggleArrayFilter('gemstones', _id)}
                      className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <MutedText>{_id}</MutedText>
                      <MutedText size="sm" className="text-muted/60">({count})</MutedText>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <H3 className="mb-3">Price Range</H3>
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={filters.priceMin || ''}
                  onChange={(e) => updateFilters({
                    priceMin: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.priceMax || ''}
                  onChange={(e) => updateFilters({
                    priceMax: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="border-t pt-6">
            <H3 className="mb-3">Additional Options</H3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-token-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => updateFilters({ inStock: e.target.checked })}
                  className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                />
                <MutedText>In Stock Only</MutedText>
              </label>
              
              <label className="flex items-center space-x-token-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => updateFilters({ featured: e.target.checked })}
                  className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                />
                <MutedText>Featured Items</MutedText>
              </label>

              <label className="flex items-center space-x-token-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.newArrival}
                  onChange={(e) => updateFilters({ newArrival: e.target.checked })}
                  className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                />
                <MutedText>New Arrivals</MutedText>
              </label>
            </div>
          </div>

          {/* Rating Filter */}
          {facets?.ratings && facets.ratings.length > 0 && (
            <div className="border-t pt-6">
              <H3 className="mb-3">Minimum Rating</H3>
              <div className="flex flex-wrap gap-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <label key={rating} className="flex items-center space-x-token-sm cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating}
                      onChange={() => updateFilters({ rating })}
                      className="w-4 h-4 text-cta bg-background border-border focus:ring-cta focus:ring-2"
                    />
                    <MutedText>{rating}+ Stars</MutedText>
                  </label>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ rating: undefined })}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}