'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Diamond, Filter, Gem, Search as SearchIcon, Sparkle, Tag, X } from 'lucide-react'


import { SectionContainer } from '@/components/layout/Section'
import { Typography, Button } from '@/components/ui'
import { ProductCardWithCart } from '@/components/products/ProductCardWithCart'
import { cn } from '@/lib/utils'
import type { CatalogPreviewProduct, CatalogTone } from '@/config/catalogDefaults'

// --- Types ---

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'customizer' | 'limited'

interface SortOption {
  key: SortKey
  label: string
  helper: string
}

interface AvailabilityOption {
  value: 'ready' | 'made'
  label: string
  helper: string
}

type AvailabilityChoice = 'any' | AvailabilityOption['value']

interface CatalogClientProps {
  products: CatalogPreviewProduct[]
  resultCount: number
  categories: string[]
  tones: Array<{ value: CatalogTone; label: string }>
  selectedCategory?: string
  selectedTone?: CatalogTone
  sortOptions: ReadonlyArray<SortOption>
  selectedSortKey: SortKey
  viewMode: 'grid' | 'list'
  priceRange: { min: number; max: number }
  selectedPrice: { min?: number; max?: number }
  availabilityOptions: ReadonlyArray<AvailabilityOption>
  selectedAvailability: AvailabilityChoice | AvailabilityChoice[]
  metalOptions: string[]
  selectedMetals: string[]
  activeFilterCount: number
  searchTerm?: string
  selectedLimitedDrop?: boolean
  selectedBestseller?: boolean
  gemstoneOptions: string[]
  selectedGemstones: string[]
  materialOptions: string[]
  selectedMaterials: string[]
  tagOptions: string[]
  selectedTags: string[]
}

// --- Constants & Helpers ---

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Rings: Diamond,
  Earrings: Sparkle,
  Necklaces: Gem,
  Bracelets: Tag,
  Collections: Gem,
  'Diamond Classics': Sparkle,
}

// --- Main Component ---

export function CatalogClient({
  products,
  resultCount,
  categories,
  tones,
  selectedCategory,
  selectedTone,
  sortOptions,
  selectedSortKey,
  viewMode,
  priceRange,
  selectedPrice,
  availabilityOptions,
  selectedAvailability,
  metalOptions,
  selectedMetals,
  activeFilterCount,
  searchTerm,
  selectedLimitedDrop,
  selectedBestseller,
  gemstoneOptions,
  selectedGemstones,
  materialOptions,
  selectedMaterials,
  tagOptions,
  selectedTags,
}: CatalogClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // -- State --
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchTerm ?? '')

  // Sync search value if URL changes
  useEffect(() => {
    setSearchValue(searchTerm ?? '')
  }, [searchTerm])

  // -- Handlers --

  const updateQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      const query = params.toString()
      router.replace(query ? `${pathname ?? ''}?${query}` : pathname ?? '', { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const buildHref = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      const query = params.toString()
      return query ? `${pathname ?? ''}?${query}` : pathname ?? ''
    },
    [pathname, searchParams],
  )

  const toggleListFilter = (key: string, currentValues: string[], valueToToggle: string) => {
    const next = currentValues.includes(valueToToggle)
      ? currentValues.filter((v) => v !== valueToToggle)
      : [...currentValues, valueToToggle]
    updateQuery({ [key]: next.length > 0 ? next.join(',') : undefined })
  }

  const clearAllFilters = () => {
    router.replace(pathname ?? '')
  }

  // Active filter summary for mobile trigger
  const totalActiveFilters = activeFilterCount + (searchTerm ? 1 : 0)

  // -- Renderers --

  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn('flex flex-col gap-6', isMobile ? 'p-6' : 'pr-8')}>
      {/* Header (Mobile Only) */}
      {isMobile && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-serif font-medium text-text-primary">Filters</h2>
          <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 -mr-2 text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Sort */}
      <FilterGroup title="Sort By" defaultOpen>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <label key={option.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                value={option.key}
                checked={selectedSortKey === option.key}
                onChange={() => updateQuery({ sort: option.key })}
                className="w-4 h-4 border-border-strong bg-transparent text-text-primary focus:ring-accent-primary focus:ring-offset-0"
              />
              <span className={cn("text-sm group-hover:text-text-primary transition-colors", selectedSortKey === option.key ? "text-text-primary font-medium" : "text-text-secondary")}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <Separator />

      {/* Category */}
      <FilterGroup title="Category" defaultOpen>
        <div className="space-y-2">
          <Link
            href={buildHref({ category: undefined })}
            className={cn("flex items-center gap-2 text-sm hover:text-text-primary transition-colors", !selectedCategory ? "text-text-primary font-medium" : "text-text-secondary")}
          >
            <div className={cn("w-4 h-4 border border-current flex items-center justify-center", !selectedCategory ? "bg-text-primary text-surface-base" : "bg-transparent text-transparent")}>
              {!selectedCategory && <div className="w-2 h-2 bg-current" />}
            </div>
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={buildHref({ category: cat })}
              className={cn("flex items-center gap-2 text-sm hover:text-text-primary transition-colors", selectedCategory === cat ? "text-text-primary font-medium" : "text-text-secondary")}
            >
              <div className={cn("w-4 h-4 border border-current flex items-center justify-center", selectedCategory === cat ? "bg-text-primary text-surface-base" : "bg-transparent text-transparent")}>
                {selectedCategory === cat && <div className="w-2 h-2 bg-current" />}
              </div>
              {cat}
            </Link>
          ))}
        </div>
      </FilterGroup>

      <Separator />

      {/* Price */}
      <FilterGroup title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={String(priceRange.min)}
            className="w-full min-w-0 bg-surface-panel border border-border-subtle p-2 text-sm text-text-primary focus:border-text-primary focus:outline-none placeholder:text-text-muted"
            value={selectedPrice.min ?? ''}
            onChange={(e) => {
              // Controlled component requires onChange
            }}
            onBlur={(e) => updateQuery({ min_price: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && updateQuery({ min_price: e.currentTarget.value })}
          />
          <span className="text-text-muted">-</span>
          <input
            type="number"
            placeholder={String(priceRange.max)}
            className="w-full min-w-0 bg-surface-panel border border-border-subtle p-2 text-sm text-text-primary focus:border-text-primary focus:outline-none placeholder:text-text-muted"
            value={selectedPrice.max ?? ''}
            onChange={(e) => {
              // Controlled component requires onChange
            }}
            onBlur={(e) => updateQuery({ max_price: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && updateQuery({ max_price: e.currentTarget.value })}
          />
        </div>
      </FilterGroup>

      <Separator />

      {/* Availability */}
      <FilterGroup title="Availability">
        <label className="flex items-center gap-3 cursor-pointer group mb-2">
          {/* Custom Switch Look */}
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={normalizedAvailability(selectedAvailability) === 'ready'}
              onChange={(e) => updateQuery({ availability: e.target.checked ? 'ready' : undefined })}
            />
            <div className="w-9 h-5 bg-border-subtle peer-checked:bg-text-primary transition-colors"></div>
            <div className="absolute top-[2px] left-[2px] bg-white w-4 h-4 transition-transform peer-checked:translate-x-full shadow-sm"></div>
          </div>
          <span className="text-sm text-text-secondary group-hover:text-text-primary">Ready to Ship Only</span>
        </label>
      </FilterGroup>

      <Separator />

      {/* Metals */}
      {metalOptions.length > 0 && (
        <>
          <FilterGroup title="Metal">
            <div className="space-y-2">
              {metalOptions.map(metal => (
                <label key={metal} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-border-strong bg-transparent text-text-primary focus:ring-accent-primary rounded-none"
                    checked={selectedMetals.includes(metal.toLowerCase()) || selectedMetals.includes(metal)}
                    onChange={() => toggleListFilter('metal', selectedMetals, metal.toLowerCase())}
                  />
                  <span className={cn("text-sm group-hover:text-text-primary transition-colors", selectedMetals.includes(metal.toLowerCase()) ? "text-text-primary" : "text-text-secondary")}>
                    {metal}
                  </span>
                </label>
              ))}
            </div>
          </FilterGroup>
          <Separator />
        </>
      )}

      {/* Tones (Colors) */}
      {tones.length > 0 && (
        <>
          <FilterGroup title="Tone">
            <div className="flex flex-wrap gap-2">
              {tones.map(tone => (
                <button
                  key={tone.value}
                  onClick={() => updateQuery({ tone: selectedTone === tone.value ? undefined : tone.value })}
                  className={cn(
                    "px-3 py-1 text-xs uppercase tracking-wider border transition-all",
                    selectedTone === tone.value
                      ? "border-text-primary bg-text-primary text-surface-base"
                      : "border-border-subtle text-text-secondary hover:border-text-primary hover:text-text-primary"
                  )}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </FilterGroup>
          <Separator />
        </>
      )}

      {/* Other Attributes */}
      <FilterGroup title="More Filters">
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 border-border-strong bg-transparent rounded-none"
              checked={!!selectedLimitedDrop}
              onChange={(e) => updateQuery({ limited: e.target.checked ? 'true' : undefined })}
            />
            <span className="text-sm text-text-secondary group-hover:text-text-primary">Limited Edition</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 border-border-strong bg-transparent rounded-none"
              checked={!!selectedBestseller}
              onChange={(e) => updateQuery({ bestseller: e.target.checked ? 'true' : undefined })}
            />
            <span className="text-sm text-text-secondary group-hover:text-text-primary">Bestsellers</span>
          </label>
        </div>
      </FilterGroup>

      <div className="pt-8 mt-auto">
        <Button
          variant="outline"
          tone="ink"
          className="w-full justify-center rounded-none border-text-primary text-text-primary hover:bg-text-primary hover:text-surface-base"
          onClick={clearAllFilters}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  )

  return (
    <SectionContainer size="gallery" bleed className="px-4 sm:px-6 lg:px-10 xl:px-0 min-h-[600px]">

      {/* Mobile Trigger Bar */}
      <div className="lg:hidden sticky top-[5.5rem] z-30 bg-surface-base/95 backdrop-blur border-b border-border-subtle -mx-4 px-4 py-3 mb-6 flex items-center justify-between">
        <div className="text-sm font-medium text-text-primary">
          {resultCount} Result{resultCount !== 1 ? 's' : ''}
        </div>
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-border-subtle px-4 py-2 hover:border-text-primary transition-colors"
        >
          <Filter className="w-3 h-3" />
          Filter {totalActiveFilters > 0 && `(${totalActiveFilters})`}
        </button>
      </div>

      <div className="flex items-start gap-8 lg:gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-10 scrollbar-hide">
          {/* Search Input in Sidebar for Desktop? Maybe. For now stick to filters. */}
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-text-muted mb-4">Refine</div>
            <div className="h-px bg-border-subtle w-full" />
          </div>
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Desktop Result Count & Active Chips */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <span className="text-sm text-text-secondary">{resultCount} products found</span>
            {/* Could add active filter chips here if desired, keeping it minimal for now */}
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="py-20 text-center">
              <Typography variant="heading" className="mb-4">No matches found</Typography>
              <Typography variant="body" className="text-text-secondary mb-8">Try adjusting your filters or search terms.</Typography>
              <Button onClick={clearAllFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className={cn(
              "grid gap-x-px gap-y-px bg-border-subtle border border-border-subtle", // Grid lines effect
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" : "grid-cols-1"
            )}>
              {products.map((product) => (
                <div key={product.slug} className="bg-surface-base">
                  <ProductCardWithCart
                    {...product}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Portal */}
      <MobileDrawer isOpen={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)}>
        <FilterSidebar isMobile />
      </MobileDrawer>

    </SectionContainer>
  )
}

// --- Sub-components ---

function FilterGroup({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="py-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 group"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-text-primary group-hover:text-text-muted transition-colors">{title}</span>
        <span className="text-text-secondary text-lg leading-none">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="pt-2 pb-4 animate-in slide-in-from-top-1 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

function Separator() {
  return <div className="h-px bg-border-subtle w-full my-2" />
}

function MobileDrawer({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-xs h-full bg-surface-base border-l border-border-subtle shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {children}
      </div>
    </div>,
    document.body
  )
}

function normalizedAvailability(val: AvailabilityChoice | AvailabilityChoice[]): AvailabilityChoice {
  if (Array.isArray(val)) {
    if (val.includes('ready')) return 'ready'
    if (val.includes('made')) return 'made'
    return 'any'
  }
  return val
}
