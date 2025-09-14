'use client'

import React, { useState } from 'react'
import { ChevronDown, Filter, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { H4, BodyText, MutedText } from '../foundation/Typography'
import { cn } from '../../lib/utils'
import { filterData } from './ProductFiltersData'

export interface FilterOptions {
  priceRange: [number, number]
  categories: string[]
  materials: string[]
  stoneTypes: string[]
  stoneQualities: string[]
  sizes: string[]
  inStock: boolean
}

interface ProductFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
  isLoading?: boolean
  className?: string
}

// Filter data imported from ProductFiltersData.tsx

export function ProductFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  isLoading = false,
  className 
}: ProductFiltersProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'categories', 'price', 'materials', 'stones'
  ])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const updateFilter = <K extends keyof FilterOptions>(
    key: K, 
    value: FilterOptions[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = <K extends keyof Pick<FilterOptions, 'categories' | 'materials' | 'stoneTypes' | 'stoneQualities' | 'sizes'>>(
    key: K, 
    value: string
  ) => {
    const currentValues = filters[key] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    updateFilter(key, newValues as FilterOptions[K])
  }

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.materials.length > 0 ||
    filters.stoneTypes.length > 0 ||
    filters.stoneQualities.length > 0 ||
    filters.sizes.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000 ||
    filters.inStock

  const FilterSection = ({ 
    title, 
    id, 
    children 
  }: { 
    title: string
    id: string
    children: React.ReactNode 
  }) => {
    const isExpanded = expandedSections.includes(id)
    
    return (
      <div className="border-b border-border pb-6 mb-6 last:border-b-0 last:mb-0">
        <button
          className="flex items-center justify-between w-full mb-4"
          onClick={() => toggleSection(id)}
        >
          <H4 level="h4">{title}</H4>
          <ChevronDown 
            size={16} 
            className={cn(
              'transition-transform',
              isExpanded ? 'rotate-180' : ''
            )} 
          />
        </button>
        {isExpanded && children}
      </div>
    )
  }

  const CheckboxFilter = ({ 
    items, 
    selectedItems, 
    onToggle 
  }: { 
    items: Array<{ id: string; name: string; count: number }>
    selectedItems: string[]
    onToggle: (id: string) => void 
  }) => (
    <div className="space-y-token-sm">
      {items.map(item => (
        <label key={item.id} className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={() => onToggle(item.id)}
            className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
          />
          <div className="flex-1 flex items-center justify-between">
            <BodyText size="sm">{item.name}</BodyText>
            <MutedText size="sm">({item.count})</MutedText>
          </div>
        </label>
      ))}
    </div>
  )

  const PriceRangeFilter = () => (
    <div className="space-y-token-md">
      <div className="flex space-x-token-md">
        <div>
          <MutedText size="sm" className="mb-1">Min Price</MutedText>
          <Input
            type="number"
            placeholder="$0"
            value={filters.priceRange[0] || ''}
            onChange={(e) => updateFilter('priceRange', [
              Number(e.target.value) || 0,
              filters.priceRange[1]
            ])}
            className="w-24"
          />
        </div>
        <div>
          <MutedText size="sm" className="mb-1">Max Price</MutedText>
          <Input
            type="number"
            placeholder="$10,000"
            value={filters.priceRange[1] || ''}
            onChange={(e) => updateFilter('priceRange', [
              filters.priceRange[0],
              Number(e.target.value) || 10000
            ])}
            className="w-24"
          />
        </div>
      </div>
      <div className="space-y-token-sm">
        {[
          { label: 'Under $1,000', range: [0, 1000] as [number, number] },
          { label: '$1,000 - $2,500', range: [1000, 2500] as [number, number] },
          { label: '$2,500 - $5,000', range: [2500, 5000] as [number, number] },
          { label: '$5,000 - $10,000', range: [5000, 10000] as [number, number] },
          { label: 'Over $10,000', range: [10000, 50000] as [number, number] },
        ].map(({ label, range }) => (
          <button
            key={label}
            className="block w-full text-left px-2 py-1 text-sm text-muted hover:text-foreground hover:bg-muted/20 rounded-sm"
            onClick={() => updateFilter('priceRange', range)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )

  const filtersContent = (
    <div className="space-y-6">
      <FilterSection title="Categories" id="categories">
        <CheckboxFilter
          items={filterData.categories}
          selectedItems={filters.categories}
          onToggle={(id) => toggleArrayFilter('categories', id)}
        />
      </FilterSection>

      <FilterSection title="Price Range" id="price">
        <PriceRangeFilter />
      </FilterSection>

      <FilterSection title="Materials" id="materials">
        <CheckboxFilter
          items={filterData.materials}
          selectedItems={filters.materials}
          onToggle={(id) => toggleArrayFilter('materials', id)}
        />
      </FilterSection>

      <FilterSection title="Stone Type" id="stones">
        <CheckboxFilter
          items={filterData.stoneTypes}
          selectedItems={filters.stoneTypes}
          onToggle={(id) => toggleArrayFilter('stoneTypes', id)}
        />
      </FilterSection>

      <FilterSection title="Stone Quality" id="quality">
        <CheckboxFilter
          items={filterData.stoneQualities}
          selectedItems={filters.stoneQualities}
          onToggle={(id) => toggleArrayFilter('stoneQualities', id)}
        />
      </FilterSection>

      <FilterSection title="Availability" id="availability">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
            className="w-4 h-4 text-cta bg-background border-border rounded-sm focus:ring-cta focus:ring-2"
          />
          <BodyText size="sm">In Stock Only</BodyText>
        </label>
      </FilterSection>

      {hasActiveFilters && (
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            <X size={16} className="mr-2" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-6">
        <Button
          variant="outline"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="w-full"
        >
          <SlidersHorizontal size={16} className="mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-cta text-background text-xs rounded-token-lg">
              {filters.categories.length + filters.materials.length + filters.stoneTypes.length + filters.stoneQualities.length + (filters.inStock ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop sidebar */}
      <div className={cn('hidden lg:block', className)}>
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <H4 level="h4" className="flex items-center">
              <Filter size={16} className="mr-2" />
              Filters
            </H4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Clear All
              </Button>
            )}
          </div>
          {filtersContent}
        </div>
      </div>

      {/* Mobile filter modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-foreground/50" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 max-h-[80vh] bg-background rounded-t-lg p-6 overflow-y-auto shadow-token-modal">
            <div className="flex items-center justify-between mb-6">
              <H4 level="h4">Filters</H4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
            {filtersContent}
            <div className="flex space-x-token-md pt-6 border-t border-border mt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={onClearFilters}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}