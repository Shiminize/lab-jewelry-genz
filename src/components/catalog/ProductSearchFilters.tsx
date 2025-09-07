'use client'

import React from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import type { ProductCategory, ProductSubcategory } from '@/types/product'

interface ProductSearchFiltersProps {
  showFilters: boolean
  onToggleFilters: () => void
  selectedCategories: ProductCategory[]
  selectedSubcategories: ProductSubcategory[]
  priceRange: { min?: number; max?: number }
  selectedMaterials: string[]
  onlyInStock: boolean
  onlyFeatured: boolean
  sortBy: 'popularity' | 'price' | 'name' | 'newest'
  sortOrder: 'asc' | 'desc'
  onCategoryChange: (categories: ProductCategory[]) => void
  onSubcategoryChange: (subcategories: ProductSubcategory[]) => void
  onPriceRangeChange: (range: { min?: number; max?: number }) => void
  onMaterialChange: (materials: string[]) => void
  onStockFilterChange: (inStock: boolean) => void
  onFeaturedFilterChange: (featured: boolean) => void
  onSortChange: (sortBy: 'popularity' | 'price' | 'name' | 'newest', order: 'asc' | 'desc') => void
  onClearFilters: () => void
  className?: string
}

// Available filter options
const categories: ProductCategory[] = ['rings', 'necklaces', 'earrings', 'bracelets', 'watches']
const materials = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Pearl', 'Gemstone']

export function ProductSearchFilters({
  showFilters,
  onToggleFilters,
  selectedCategories,
  selectedSubcategories,
  priceRange,
  selectedMaterials,
  onlyInStock,
  onlyFeatured,
  sortBy,
  sortOrder,
  onCategoryChange,
  onSubcategoryChange,
  onPriceRangeChange,
  onMaterialChange,
  onStockFilterChange,
  onFeaturedFilterChange,
  onSortChange,
  onClearFilters,
  className
}: ProductSearchFiltersProps) {
  const activeFilterCount = selectedCategories.length + 
    selectedMaterials.length + 
    (priceRange.min || priceRange.max ? 1 : 0) + 
    (onlyInStock ? 1 : 0) + 
    (onlyFeatured ? 1 : 0)

  return (
    <div className={cn('space-y-token-md', className)}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onToggleFilters}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border border-border rounded-token-md',
            'hover:bg-muted transition-colors aurora-interactive-shadow',
            showFilters && 'bg-muted'
          )}
        >
          <Filter size={18} />
          <BodyText size="sm">Filters</BodyText>
          {activeFilterCount > 0 && (
            <span className="bg-accent text-background text-xs px-2 py-1 rounded-token-lg">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown 
            size={16} 
            className={cn(
              'transition-transform', 
              showFilters && 'rotate-180'
            )} 
          />
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-muted hover:text-foreground text-sm transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="bg-muted border border-border rounded-token-md p-6 mb-6 shadow-[0_2px_8px_color-mix(in_srgb,var(--nebula-purple)_20%,transparent)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Categories */}
            <div>
              <H3 className="mb-3">Category</H3>
              <div className="space-y-token-sm">
                {categories.map((category) => (
                  <label key={category} className="flex items-center space-x-token-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onCategoryChange([...selectedCategories, category])
                        } else {
                          onCategoryChange(selectedCategories.filter(c => c !== category))
                        }
                      }}
                      className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                    />
                    <MutedText className="capitalize">{category}</MutedText>
                  </label>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <H3 className="mb-3">Material</H3>
              <div className="space-y-token-sm">
                {materials.map((material) => (
                  <label key={material} className="flex items-center space-x-token-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(material)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onMaterialChange([...selectedMaterials, material])
                        } else {
                          onMaterialChange(selectedMaterials.filter(m => m !== material))
                        }
                      }}
                      className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                    />
                    <MutedText>{material}</MutedText>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <H3 className="mb-3">Price Range</H3>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Min price"
                  value={priceRange.min || ''}
                  onChange={(e) => onPriceRangeChange({
                    ...priceRange,
                    min: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:ring-2 focus:ring-cta focus:border-cta"
                />
                <input
                  type="number"
                  placeholder="Max price"
                  value={priceRange.max || ''}
                  onChange={(e) => onPriceRangeChange({
                    ...priceRange,
                    max: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:ring-2 focus:ring-cta focus:border-cta"
                />
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <H3 className="mb-3">Options</H3>
              <div className="space-y-3">
                <label className="flex items-center space-x-token-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => onStockFilterChange(e.target.checked)}
                    className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                  />
                  <MutedText>In Stock Only</MutedText>
                </label>
                <label className="flex items-center space-x-token-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyFeatured}
                    onChange={(e) => onFeaturedFilterChange(e.target.checked)}
                    className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
                  />
                  <MutedText>Featured Only</MutedText>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}