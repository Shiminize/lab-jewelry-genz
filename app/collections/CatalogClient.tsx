'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ChevronDown, Diamond, Gem, LayoutGrid, List, Search as SearchIcon, SlidersHorizontal, Sparkle, Tag, X } from 'lucide-react'

import { SectionContainer } from '@/components/layout/Section'
import { ProductCard, Typography, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { CatalogPreviewProduct, CatalogTone } from '@/config/catalogDefaults'
import { FilterPill } from './components/FilterPill'

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

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Rings: Diamond,
  Earrings: Sparkle,
  Necklaces: Gem,
  Bracelets: Tag,
  Collections: Gem,
  'Diamond Classics': Sparkle,
}

const toneBadgeClass: Record<CatalogTone, string> = {
  volt: 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
  cyan: 'border-accent-secondary/40 text-accent-secondary hover:border-accent-secondary/70',
  magenta: 'border-accent-primary/40 text-accent-primary hover:border-accent-primary/70',
  lime: 'border-accent-secondary/40 text-accent-secondary hover:border-accent-secondary/70',
}

const formatTokenLabel = (value: string, options: string[]) => {
  const lowered = value.toLowerCase()
  const match = options.find((option) => option.toLowerCase() === lowered)
  if (match) {
    return match
  }
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const PRICE_MIN = 1
const PRICE_MAX = 100000

function coercePricePair(
  rawMin: number | undefined,
  rawMax: number | undefined,
): { min?: number; max?: number; swapped: boolean } {
  const isValidNumber = (value: number | undefined): value is number => typeof value === 'number' && Number.isFinite(value)
  const clamp = (value: number) => Math.min(PRICE_MAX, Math.max(PRICE_MIN, value))

  let min = isValidNumber(rawMin) ? clamp(rawMin) : undefined
  let max = isValidNumber(rawMax) ? clamp(rawMax) : undefined
  let swapped = false

  if (min !== undefined && max !== undefined && min > max) {
    swapped = true
    ;[min, max] = [max, min]
  }

  return { min, max, swapped }
}

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

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [draftMinPrice, setDraftMinPrice] = useState<number | undefined>(selectedPrice.min)
  const [draftMaxPrice, setDraftMaxPrice] = useState<number | undefined>(selectedPrice.max)
  const normalizedSelectedAvailability = useMemo<AvailabilityChoice>(() => {
    if (Array.isArray(selectedAvailability)) {
      const firstMatch = selectedAvailability.find((value): value is AvailabilityOption['value'] => value === 'ready' || value === 'made')
      return firstMatch ?? 'any'
    }
    return selectedAvailability
  }, [selectedAvailability])

  const [draftAvailability, setDraftAvailability] = useState<AvailabilityChoice>(normalizedSelectedAvailability)
  const [draftMetals, setDraftMetals] = useState<string[]>(selectedMetals)
  const [searchValue, setSearchValue] = useState(searchTerm ?? '')
  
  // New filter dropdown state
  type RefineDetailKey = 'category' | 'price' | 'metal' | 'availability' | 'tone' | 'gemstone' | 'material' | 'tag'
  const [activeDetail, setActiveDetail] = useState<RefineDetailKey | null>(null)
  
  // Draft state for new filters
  const [draftGemstones, setDraftGemstones] = useState<string[]>(selectedGemstones)
  const [draftMaterials, setDraftMaterials] = useState<string[]>(selectedMaterials)
  const [draftTags, setDraftTags] = useState<string[]>(selectedTags)

  const filterShellClass =
    'space-y-5 rounded-[32px] border border-border-subtle/60 bg-white/85 px-4 py-6 shadow-[0_28px_60px_rgba(22,26,30,0.08)] backdrop-blur-md md:px-6'
  const toolbarButtonClass =
    'inline-flex min-h-[46px] items-center gap-3 rounded-full border border-border-subtle/70 bg-surface-panel px-5 text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-text-secondary transition hover:text-text-primary hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base'

  const handleDetailToggle = (key: RefineDetailKey) => {
    setActiveDetail((prev) => (prev === key ? null : key))
  }

  const CategoryFilterControl = () => (
    <div className="relative flex-shrink-0">
      <FilterPill
        label="Category"
        count={selectedCategory ? 1 : 0}
        active={!!selectedCategory || activeDetail === 'category'}
        onClick={() => handleDetailToggle('category')}
        aria-expanded={activeDetail === 'category'}
        aria-controls="category-panel"
      />
    </div>
  )

  const PriceFilterControl = () => (
    <div className="relative flex-shrink-0">
      <FilterPill
        label="Price"
        count={(selectedPrice.min !== undefined ? 1 : 0) + (selectedPrice.max !== undefined ? 1 : 0)}
        active={selectedPrice.min !== undefined || selectedPrice.max !== undefined || activeDetail === 'price'}
        onClick={() => handleDetailToggle('price')}
        aria-expanded={activeDetail === 'price'}
        aria-controls="price-panel"
      />
    </div>
  )

  const MetalFilterControl = () => (
    <div className="relative flex-shrink-0">
      <FilterPill
        label="Metal"
        count={selectedMetals.length}
        active={selectedMetals.length > 0 || activeDetail === 'metal'}
        onClick={() => handleDetailToggle('metal')}
        aria-expanded={activeDetail === 'metal'}
        aria-controls="metal-panel"
      />
    </div>
  )

  const AvailabilityFilterControl = () => (
    <div className="relative flex-shrink-0">
      <FilterPill
        label="Availability"
        count={normalizedSelectedAvailability !== 'any' ? 1 : 0}
        active={normalizedSelectedAvailability !== 'any' || activeDetail === 'availability'}
        onClick={() => handleDetailToggle('availability')}
        aria-expanded={activeDetail === 'availability'}
        aria-controls="availability-panel"
      />
    </div>
  )

  const ToneFilterControl = () => (
    <div className="relative flex-shrink-0">
      <FilterPill
        label="Tone"
        count={selectedTone ? 1 : 0}
        active={!!selectedTone || activeDetail === 'tone'}
        onClick={() => handleDetailToggle('tone')}
        aria-expanded={activeDetail === 'tone'}
        aria-controls="tone-panel"
      />
    </div>
  )

  const GemstoneFilterControl = () => {
    if (gemstoneOptions.length === 0) {
      return null
    }
    return (
      <div className="relative flex-shrink-0">
        <FilterPill
          label="Gemstone"
          count={selectedGemstones.length}
          active={selectedGemstones.length > 0 || activeDetail === 'gemstone'}
          onClick={() => handleDetailToggle('gemstone')}
          aria-expanded={activeDetail === 'gemstone'}
          aria-controls="gemstone-panel"
        />
      </div>
    )
  }

  const MaterialFilterControl = () => {
    if (materialOptions.length === 0) {
      return null
    }
    return (
      <div className="relative flex-shrink-0">
        <FilterPill
          label="Material"
          count={selectedMaterials.length}
          active={selectedMaterials.length > 0 || activeDetail === 'material'}
          onClick={() => handleDetailToggle('material')}
          aria-expanded={activeDetail === 'material'}
          aria-controls="material-panel"
        />
      </div>
    )
  }

  const TagFilterControl = () => {
    if (tagOptions.length === 0) {
      return null
    }
    return (
      <div className="relative flex-shrink-0">
        <FilterPill
          label="Tag"
          count={selectedTags.length}
          active={selectedTags.length > 0 || activeDetail === 'tag'}
          onClick={() => handleDetailToggle('tag')}
          aria-expanded={activeDetail === 'tag'}
          aria-controls="tag-panel"
        />
      </div>
    )
  }

  const renderCategoryPanel = () => (
    <>
      <Typography variant="eyebrow" className="text-[0.68rem] uppercase tracking-[0.32em] text-text-muted">
        Category
      </Typography>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={buildHref({ category: undefined })}
          prefetch={false}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
            !selectedCategory
              ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
              : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
          )}
        >
          All Capsules
        </Link>
        {categories.map((category) => {
          const Icon = categoryIcons[category] ?? SlidersHorizontal
          const isActive = category === selectedCategory
          return (
            <Link
              key={category}
              href={buildHref({ category: isActive ? undefined : category })}
              prefetch={false}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                isActive
                  ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
                  : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{category}</span>
            </Link>
          )
        })}
      </div>
    </>
  )

  const renderPricePanel = () => (
    <>
      <Typography variant="eyebrow" className="text-[0.68rem] uppercase tracking-[0.32em] text-text-muted">
        Price range
      </Typography>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col flex-1">
          <label htmlFor="price-min-inline" className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Min
          </label>
          <input
            id="price-min-inline"
            type="number"
            min={priceRange.min}
            max={draftMaxPrice ?? priceRange.max}
            value={draftMinPrice ?? ''}
            placeholder={String(priceRange.min)}
            onChange={(event) => setDraftMinPrice(event.target.value ? Number(event.target.value) : undefined)}
            className="w-full rounded-xl border border-border-subtle bg-surface-panel px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          />
        </div>
        <span className="hidden text-text-muted sm:block">–</span>
        <div className="flex flex-col flex-1">
          <label htmlFor="price-max-inline" className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Max
          </label>
          <input
            id="price-max-inline"
            type="number"
            min={draftMinPrice ?? priceRange.min}
            max={priceRange.max}
            value={draftMaxPrice ?? ''}
            placeholder={String(priceRange.max)}
            onChange={(event) => setDraftMaxPrice(event.target.value ? Number(event.target.value) : undefined)}
            className="w-full rounded-xl border border-border-subtle bg-surface-panel px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={resetPriceFilter}
          className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary hover:border-border-strong hover:text-text-primary"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={applyPriceFilter}
          className="rounded-full bg-gradient-to-r from-holo-purple to-cyber-pink px-6 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm"
        >
          Apply
        </button>
      </div>
    </>
  )

  const renderMetalPanel = () => (
    <>
      <Typography variant="eyebrow" className="text-[0.68rem] uppercase tracking-[0.32em] text-text-muted">
        Metal
      </Typography>
      <div className="mt-3 flex flex-wrap gap-2">
        {metalOptions.map((metal) => {
          const active = draftMetals.includes(metal)
          return (
            <button
              key={metal}
              type="button"
              onClick={() => toggleDraftMetal(metal)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                active
                  ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
                  : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
              )}
            >
              {metal}
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={resetMetalFilter}
          className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary hover:border-border-strong hover:text-text-primary"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={applyMetalFilter}
          className="rounded-full bg-gradient-to-r from-holo-purple to-cyber-pink px-6 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm"
        >
          Apply
        </button>
      </div>
    </>
  )

  const renderAvailabilityPanel = () => (
    <>
      <Typography variant="eyebrow" className="text-[0.68rem] uppercase tracking-[0.32em] text-text-muted">
        Availability
      </Typography>
      <div className="mt-3 flex flex-col gap-3" role="group" aria-label="Availability options">
        {availabilityOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-border-subtle px-4 py-3">
            <input
              type="radio"
              name="availability-filter-inline"
              value={option.value}
              checked={draftAvailability === option.value}
              onChange={() => setDraftAvailability(option.value)}
              className="h-4 w-4 accent-accent-primary"
            />
            <div>
              <p className="text-sm font-semibold text-text-primary">{option.label}</p>
              <p className="text-xs text-text-secondary">{option.helper}</p>
            </div>
          </label>
        ))}
        <label className="flex items-center gap-3 rounded-2xl border border-border-subtle px-4 py-3">
          <input
            type="radio"
            name="availability-filter-inline"
            value="any"
            checked={draftAvailability === 'any'}
            onChange={() => setDraftAvailability('any')}
            className="h-4 w-4 accent-accent-primary"
          />
          <div>
            <p className="text-sm font-semibold text-text-primary">Show all</p>
            <p className="text-xs text-text-secondary">See every capsule regardless of fulfillment speed.</p>
          </div>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={resetAvailabilityFilter}
          className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary hover:border-border-strong hover:text-text-primary"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={applyAvailabilityFilter}
          className="rounded-full bg-gradient-to-r from-holo-purple to-cyber-pink px-6 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm"
        >
          Apply
        </button>
      </div>
    </>
  )

  const renderTonePanel = () => (
    <>
      <Typography variant="eyebrow" className="text-[0.68rem] uppercase tracking-[0.32em] text-text-muted">
        Tone
      </Typography>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={buildHref({ tone: undefined })}
          prefetch={false}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
            !selectedTone
              ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
              : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
          )}
        >
          All Tones
        </Link>
        {tones.map((tone) => {
          const isActive = tone.value === selectedTone
          return (
            <Link
              key={tone.value}
              href={buildHref({ tone: isActive ? undefined : tone.value })}
              prefetch={false}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                isActive
                  ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
                  : cn('border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary', toneBadgeClass[tone.value]),
              )}
            >
              {tone.label}
            </Link>
          )
        })}
      </div>
    </>
  )

  const renderGemstonePanel = () => {
    if (gemstoneOptions.length === 0) {
      return <p className="text-sm text-text-muted">No gemstones available for this collection.</p>
    }
    return (
      <>
        <Typography variant="eyebrow" className="text-[0.68rem] uppercase tracking-[0.32em] text-text-muted">
          Gemstone
        </Typography>
        <div className="mt-3 flex flex-wrap gap-2">
          {gemstoneOptions.map((gemstone) => {
            const normalized = gemstone.toLowerCase()
            const active = draftGemstones.includes(normalized)
            return (
              <button
                key={gemstone}
                type="button"
                onClick={() => toggleDraftGemstone(normalized)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                  active
                    ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
                    : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
                )}
              >
                {gemstone}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={resetGemstoneFilter}
            className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary hover:border-border-strong hover:text-text-primary"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={applyGemstoneFilter}
            className="rounded-full bg-gradient-to-r from-holo-purple to-cyber-pink px-6 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm"
          >
            Apply
          </button>
        </div>
      </>
    )
  }

  const renderMaterialPanel = () => {
    if (materialOptions.length === 0) {
      return <p className="text-sm text-text-muted">Materials sync soon—nothing to refine yet.</p>
    }
    return (
      <>
        <Typography variant="eyebrow" className="text-[0.68rem] uppercase tracking-[0.32em] text-text-muted">
          Material
        </Typography>
        <div className="mt-3 flex flex-wrap gap-2">
          {materialOptions.map((material) => {
            const normalized = material.toLowerCase()
            const active = draftMaterials.includes(normalized)
            return (
              <button
                key={material}
                type="button"
                onClick={() => toggleDraftMaterial(normalized)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                  active
                    ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
                    : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
                )}
              >
                {material}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={resetMaterialFilter}
            className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary hover:border-border-strong hover:text-text-primary"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={applyMaterialFilter}
            className="rounded-full bg-gradient-to-r from-holo-purple to-cyber-pink px-6 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm"
          >
            Apply
          </button>
        </div>
      </>
    )
  }

  const renderTagPanel = () => {
    if (tagOptions.length === 0) {
      return <p className="text-sm text-text-muted">Tags will appear once styling data syncs.</p>
    }
    return (
      <>
        <Typography variant="eyebrow" className="text-[0.68rem] uppercase tracking-[0.32em] text-text-muted">
          Tags & themes
        </Typography>
        <div className="mt-3 flex flex-wrap gap-2">
          {tagOptions.map((tag) => {
            const normalized = tag.toLowerCase()
            const active = draftTags.includes(normalized)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleDraftTag(normalized)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                  active
                    ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
                    : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={resetTagFilter}
            className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary hover:border-border-strong hover:text-text-primary"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={applyTagFilter}
            className="rounded-full bg-gradient-to-r from-holo-purple to-cyber-pink px-6 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm"
          >
            Apply
          </button>
        </div>
      </>
    )
  }

  const renderDetailPanel = () => {
    switch (activeDetail) {
      case 'category':
        return renderCategoryPanel()
      case 'price':
        return renderPricePanel()
      case 'metal':
        return renderMetalPanel()
      case 'availability':
        return renderAvailabilityPanel()
      case 'tone':
        return renderTonePanel()
      case 'gemstone':
        return renderGemstonePanel()
      case 'material':
        return renderMaterialPanel()
      case 'tag':
        return renderTagPanel()
      default:
        return <p className="text-sm text-text-muted">Choose a filter above to see options.</p>
    }
  }

  useEffect(() => {
    if (activeDetail === 'price' || isFilterOpen) {
      setDraftMinPrice(selectedPrice.min)
      setDraftMaxPrice(selectedPrice.max)
    }
    if (activeDetail === 'availability' || isFilterOpen) {
      setDraftAvailability(normalizedSelectedAvailability)
    }
    if (activeDetail === 'metal' || isFilterOpen) {
      setDraftMetals(selectedMetals)
    }
    if (activeDetail === 'gemstone' || isFilterOpen) {
      setDraftGemstones(selectedGemstones)
    }
    if (activeDetail === 'material' || isFilterOpen) {
      setDraftMaterials(selectedMaterials)
    }
    if (activeDetail === 'tag' || isFilterOpen) {
      setDraftTags(selectedTags)
    }
  }, [
    activeDetail,
    isFilterOpen,
    normalizedSelectedAvailability,
    selectedGemstones,
    selectedMaterials,
    selectedMetals,
    selectedPrice.max,
    selectedPrice.min,
    selectedTags,
  ])

  useEffect(() => {
    setSearchValue(searchTerm ?? '')
  }, [searchTerm])
  
  const normalizedSearchTerm = searchTerm?.trim() ?? ''
  const hasSearchApplied = normalizedSearchTerm.length > 0

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

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = searchValue.trim()
      updateQuery({ q: trimmed.length > 0 ? trimmed : undefined })
    },
    [searchValue, updateQuery],
  )

  const handleSearchClear = useCallback(() => {
    if (!searchValue && !searchTerm) return
    setSearchValue('')
    updateQuery({ q: undefined })
  }, [searchTerm, searchValue, updateQuery])

  const clearFiltersHref = useMemo(() => {
    return buildHref({
      category: undefined,
      tone: undefined,
      min_price: undefined,
      max_price: undefined,
      availability: undefined,
      metal: undefined,
      q: undefined,
    })
  }, [buildHref])

  const availabilitySelections = useMemo<AvailabilityOption['value'][]>(() => {
    if (Array.isArray(selectedAvailability)) {
      return selectedAvailability.filter((value): value is AvailabilityOption['value'] => value === 'ready' || value === 'made')
    }
    if (selectedAvailability === 'ready' || selectedAvailability === 'made') {
      return [selectedAvailability]
    }
    return []
  }, [selectedAvailability])

  const activeFilters = useMemo(() => {
    const tags: Array<{ label: string; href: string; tone?: CatalogTone }> = []

    if (normalizedSearchTerm) {
      tags.push({
        label: `Search: “${normalizedSearchTerm}”`,
        href: buildHref({ q: undefined }),
      })
    }

    if (selectedCategory) {
      tags.push({
        label: selectedCategory,
        href: buildHref({ category: undefined }),
      })
    }

    if (selectedTone) {
      tags.push({
        label: tones.find((tone) => tone.value === selectedTone)?.label ?? selectedTone,
        tone: selectedTone,
        href: buildHref({ tone: undefined }),
      })
    }

    if (typeof selectedPrice.min === 'number') {
      const hasMax = typeof selectedPrice.max === 'number'
      const label = hasMax
        ? `Price $${selectedPrice.min} – $${selectedPrice.max}`
        : `Price ≥ $${selectedPrice.min}`
      tags.push({
        label,
        href: buildHref({ min_price: undefined, max_price: hasMax ? undefined : searchParams?.get('max_price') ?? undefined }),
      })
    } else if (typeof selectedPrice.max === 'number') {
      tags.push({
        label: `Price ≤ $${selectedPrice.max}`,
        href: buildHref({ max_price: undefined }),
      })
    }

    const firstAvailability = availabilitySelections[0]
    if (firstAvailability) {
      const option = availabilityOptions.find((item) => item.value === firstAvailability)
      tags.push({
        label: option?.label ?? (firstAvailability === 'ready' ? 'Ready to Ship' : 'Made to Order'),
        href: buildHref({ availability: undefined }),
      })
    }

    if (selectedMetals.length > 0) {
      selectedMetals.forEach((metal) => {
        const without = selectedMetals.filter((item) => item !== metal)
        tags.push({
          label: metal,
          href: buildHref({
            metal: without.length > 0 ? without.join(',') : undefined,
          }),
        })
      })
    }

    if (selectedGemstones.length > 0) {
      selectedGemstones.forEach((gemstone) => {
        const remainder = selectedGemstones.filter((value) => value !== gemstone)
        tags.push({
          label: `Gemstone: ${formatTokenLabel(gemstone, gemstoneOptions)}`,
          href: buildHref({ gemstone: remainder.length > 0 ? remainder.join(',') : undefined }),
        })
      })
    }

    if (selectedMaterials.length > 0) {
      selectedMaterials.forEach((material) => {
        const remainder = selectedMaterials.filter((value) => value !== material)
        tags.push({
          label: `Material: ${formatTokenLabel(material, materialOptions)}`,
          href: buildHref({ material: remainder.length > 0 ? remainder.join(',') : undefined }),
        })
      })
    }

    if (selectedTags.length > 0) {
      selectedTags.forEach((tag) => {
        const remainder = selectedTags.filter((value) => value !== tag)
        tags.push({
          label: `Tag: ${formatTokenLabel(tag, tagOptions)}`,
          href: buildHref({ tag: remainder.length > 0 ? remainder.join(',') : undefined }),
        })
      })
    }

    if (selectedLimitedDrop) {
      tags.push({
        label: 'Limited Edition',
        href: buildHref({ limited: undefined }),
      })
    }

    if (selectedBestseller) {
      tags.push({
        label: 'Bestseller',
        href: buildHref({ bestseller: undefined }),
      })
    }

    return tags
  }, [
    availabilityOptions,
    buildHref,
    availabilitySelections,
    gemstoneOptions,
    materialOptions,
    selectedBestseller,
    normalizedSearchTerm,
    selectedCategory,
    selectedGemstones,
    selectedLimitedDrop,
    selectedMaterials,
    selectedMetals,
    selectedPrice.max,
    selectedPrice.min,
    selectedTags,
    selectedTone,
    tagOptions,
    tones,
    searchParams,
  ])

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateQuery({ sort: event.target.value as SortKey })
  }

  const handleViewToggle = (nextView: 'grid' | 'list') => {
    if (nextView === viewMode) return
    updateQuery({ view: nextView === 'grid' ? undefined : nextView })
  }

  const toggleMetal = (value: string) => {
    setDraftMetals((prev) => {
      const exists = prev.includes(value)
      if (exists) {
        return prev.filter((item) => item !== value)
      }
      return [...prev, value]
    })
  }

  const applyFilters = () => {
    const updates: Record<string, string | undefined> = {}

    const { min, max } = coercePricePair(draftMinPrice, draftMaxPrice)

    updates.min_price = typeof min === 'number' ? String(min) : undefined
    updates.max_price = typeof max === 'number' ? String(max) : undefined
    updates.availability = draftAvailability === 'any' ? undefined : draftAvailability
    updates.metal = draftMetals.length > 0 ? draftMetals.join(',') : undefined
    updates.material = draftMaterials.length > 0 ? draftMaterials.join(',') : undefined
    updates.tag = draftTags.length > 0 ? draftTags.join(',') : undefined

    setDraftMinPrice(min)
    setDraftMaxPrice(max)
    updateQuery(updates)
    setIsFilterOpen(false)
  }

  const resetFilters = () => {
    setDraftMinPrice(undefined)
    setDraftMaxPrice(undefined)
    setDraftAvailability('any')
    setDraftMetals([])
    setDraftMaterials([])
    setDraftTags([])
    updateQuery({
      min_price: undefined,
      max_price: undefined,
      availability: undefined,
      metal: undefined,
      material: undefined,
      tag: undefined,
    })
    setIsFilterOpen(false)
  }

  const viewToggleButtonClass = (mode: 'grid' | 'list') =>
    cn(
      'inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle/80 bg-surface-base text-text-secondary transition hover:border-border-strong hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
      mode === viewMode && 'border-text-primary/50 text-text-primary shadow-soft',
    )


  const emptyStateSuggestions = useMemo(() => {
    const suggestions: Array<{ label: string; href: string; ariaLabel: string }> = []

    if (normalizedSearchTerm) {
      suggestions.push({
        label: 'Clear search',
        href: buildHref({ q: undefined }),
        ariaLabel: 'Clear search term',
      })
    }

    if (typeof selectedPrice.max === 'number') {
      suggestions.push({
        label: 'Clear max price',
        href: buildHref({ max_price: undefined }),
        ariaLabel: 'Clear maximum price filter',
      })
    }

    if (availabilitySelections.includes('made')) {
      suggestions.push({
        label: 'Show ready-to-ship',
        href: buildHref({ availability: 'ready' }),
        ariaLabel: 'Switch availability filter to ready to ship',
      })
    }

    if (selectedMetals.length > 0) {
      suggestions.push({
        label: 'Show all metals',
        href: buildHref({ metal: undefined }),
        ariaLabel: 'Remove metal filter',
      })
    }

    suggestions.push({
      label: 'See all rings',
      href: buildHref({ category: 'ring', metal: undefined }),
      ariaLabel: 'Show all rings and clear metal filter',
    })

    return suggestions.slice(0, 4)
  }, [availabilitySelections, buildHref, normalizedSearchTerm, selectedMetals, selectedPrice.max])

  const maxPriceParam = searchParams?.get('max_price') ?? null
  const minPriceParam = searchParams?.get('min_price') ?? null
  const metalParam = searchParams?.get('metal') ?? null

  const under300Active = maxPriceParam === '299'
  const readyChipActive = availabilitySelections.includes('ready')
  const metalSlugs = useMemo(() => {
    if (!metalParam) return []
    return metalParam
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  }, [metalParam])
  const goldActive = metalSlugs.length === 1 && metalSlugs[0] === 'gold'
  const silverActive = metalSlugs.length === 1 && metalSlugs[0] === 'silver'

  const pillChipBase =
    'inline-flex min-h-[50px] items-center gap-3 rounded-full border border-border-subtle/70 bg-surface-base px-7 text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-text-secondary transition hover:border-border-strong hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base'
  const primaryChipClass = (active: boolean) =>
    cn(pillChipBase, active && 'border-text-primary/40 bg-neutral-50 text-text-primary shadow-soft')
  const categoryChipClass = (active: boolean) =>
    cn(
      'flex min-h-[50px] items-center gap-3 rounded-full border border-border-subtle/70 bg-surface-base px-7 text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-text-secondary transition hover:border-border-strong hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
      active && 'border-text-primary/40 bg-neutral-50 text-text-primary shadow-soft',
    )
  const isGridView = viewMode === 'grid'
  const productGridClass = isGridView
    ? 'grid w-full gap-x-[var(--catalog-gap-x)] gap-y-[var(--catalog-gap-y)] sm:grid-cols-2 xl:grid-cols-3'
    : 'flex w-full flex-col gap-[var(--catalog-gap-y)]'

  const toggleUnder300 = () => {
    if (under300Active) {
      updateQuery({ max_price: undefined })
      return
    }

    const updates: Record<string, string | undefined> = { max_price: '299' }
    const minPriceNumber = typeof selectedPrice.min === 'number' ? selectedPrice.min : minPriceParam ? Number(minPriceParam) : undefined
    if (typeof minPriceNumber === 'number' && Number.isFinite(minPriceNumber) && minPriceNumber > 299) {
      updates.min_price = undefined
    }
    updateQuery(updates)
  }

  const toggleReadyChip = () => {
    updateQuery({ availability: readyChipActive ? undefined : 'ready' })
  }

  const toggleMetalChip = (slug: 'gold' | 'silver', isActive: boolean) => {
    if (isActive) {
      updateQuery({ metal: undefined })
    } else {
      updateQuery({ metal: slug })
    }
  }
  
  // Apply/Reset handlers for new dropdowns
  const applyPriceFilter = () => {
    const { min, max } = coercePricePair(draftMinPrice, draftMaxPrice)
    updateQuery({
      min_price: typeof min === 'number' ? String(min) : undefined,
      max_price: typeof max === 'number' ? String(max) : undefined,
    })
    setDraftMinPrice(min)
    setDraftMaxPrice(max)
    setActiveDetail(null)
  }
  
  const resetPriceFilter = () => {
    setDraftMinPrice(undefined)
    setDraftMaxPrice(undefined)
    updateQuery({
      min_price: undefined,
      max_price: undefined,
    })
    setActiveDetail(null)
  }
  
  const applyMetalFilter = () => {
    updateQuery({
      metal: draftMetals.length > 0 ? draftMetals.join(',') : undefined,
    })
    setActiveDetail(null)
  }
  
  const resetMetalFilter = () => {
    setDraftMetals([])
    updateQuery({ metal: undefined })
    setActiveDetail(null)
  }
  
  const toggleDraftMetal = (value: string) => {
    setDraftMetals((prev) => {
      const exists = prev.includes(value)
      if (exists) {
        return prev.filter((item) => item !== value)
      }
      return [...prev, value]
    })
  }
  
  const applyAvailabilityFilter = () => {
    updateQuery({
      availability: draftAvailability === 'any' ? undefined : draftAvailability,
    })
    setActiveDetail(null)
  }
  
  const resetAvailabilityFilter = () => {
    setDraftAvailability('any')
    updateQuery({ availability: undefined })
    setActiveDetail(null)
  }
  
  // Gemstone filter handlers
  const toggleDraftGemstone = (value: string) => {
    setDraftGemstones((prev) => {
      const exists = prev.includes(value)
      if (exists) {
        return prev.filter((item) => item !== value)
      }
      return [...prev, value]
    })
  }
  
  const applyGemstoneFilter = () => {
    updateQuery({
      gemstone: draftGemstones.length > 0 ? draftGemstones.join(',') : undefined,
    })
    setActiveDetail(null)
  }
  
  const resetGemstoneFilter = () => {
    setDraftGemstones([])
    updateQuery({ gemstone: undefined })
    setActiveDetail(null)
  }
  
  // Material filter handlers
  const toggleDraftMaterial = (value: string) => {
    setDraftMaterials((prev) => {
      const exists = prev.includes(value)
      if (exists) {
        return prev.filter((item) => item !== value)
      }
      return [...prev, value]
    })
  }
  
  const applyMaterialFilter = () => {
    updateQuery({
      material: draftMaterials.length > 0 ? draftMaterials.join(',') : undefined,
    })
    setActiveDetail(null)
  }
  
  const resetMaterialFilter = () => {
    setDraftMaterials([])
    updateQuery({ material: undefined })
    setActiveDetail(null)
  }
  
  // Tag filter handlers
  const toggleDraftTag = (value: string) => {
    setDraftTags((prev) => {
      const exists = prev.includes(value)
      if (exists) {
        return prev.filter((item) => item !== value)
      }
      return [...prev, value]
    })
  }
  
  const applyTagFilter = () => {
    updateQuery({
      tag: draftTags.length > 0 ? draftTags.join(',') : undefined,
    })
    setActiveDetail(null)
  }
  
  const resetTagFilter = () => {
    setDraftTags([])
    updateQuery({ tag: undefined })
    setActiveDetail(null)
  }

  return (
    <>
      <div className="pb-12 pt-0 md:pb-20 lg:pb-24">
        <div className="space-y-12">
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1600px]">
          <div className={filterShellClass}>
          {/* Toolbar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-wrap items-center gap-3 lg:max-w-md">
              <Link
                href={clearFiltersHref}
                prefetch={false}
                className={cn(toolbarButtonClass, 'flex-1 justify-between bg-surface-base text-text-primary shadow-soft sm:flex-none sm:min-w-[220px]')}
              >
                <span>{selectedCategory ?? 'All Capsules'}</span>
                <span className="rounded-full bg-surface-panel px-2 py-0.5 text-xs font-medium text-text-secondary">
                  {resultCount}
                </span>
              </Link>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-text-muted">
                {activeFilterCount > 0 ? `${activeFilterCount} active` : 'No filters applied'}
              </span>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
                <label htmlFor="catalog-search" className="sr-only">
                  Search catalog
                </label>
                <input
                  id="catalog-search"
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search rings, tones, styles..."
                  autoComplete="off"
                  spellCheck={false}
                  className="h-[46px] w-full rounded-full border border-border-subtle/70 bg-neutral-50 pl-11 pr-12 text-sm font-medium text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-1"
                />
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden />
                {searchValue && (
                  <button
                    type="button"
                    onClick={handleSearchClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-text-muted hover:text-text-primary"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                <div className="flex items-center gap-1 rounded-full border border-border-subtle/70 bg-surface-panel p-1">
                  <button
                    type="button"
                    className={viewToggleButtonClass('grid')}
                    onClick={() => handleViewToggle('grid')}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={viewToggleButtonClass('list')}
                    onClick={() => handleViewToggle('list')}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative min-w-[190px]">
                  <label className="sr-only" htmlFor="catalog-sort">
                    Sort products
                  </label>
                  <select
                    id="catalog-sort"
                    value={selectedSortKey}
                    onChange={handleSortChange}
                    className="h-[46px] w-full appearance-none rounded-full border border-border-subtle/70 bg-neutral-50 px-5 pr-10 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-text-primary"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-primary/70" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Path Links + Toggles */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 text-[0.72rem] leading-tight text-text-secondary">
              <Typography variant="eyebrow" className="text-[0.68rem] text-text-muted">
                Quick paths
              </Typography>
              {[
                {
                  type: 'link' as const,
                  label: 'Gifts Under $300',
                  node: (
                    <Link href={buildHref({ max_price: '299', tag: 'gift' })} prefetch={false} className="text-accent-primary hover:text-text-primary underline-offset-4 hover:underline">
                      Gifts Under $300
                    </Link>
                  ),
                },
                {
                  type: 'link' as const,
                  label: 'Ready to Ship Gold',
                  node: (
                    <Link href={buildHref({ availability: 'ready', metal: 'gold' })} prefetch={false} className="text-accent-primary hover:text-text-primary underline-offset-4 hover:underline">
                      Ready to Ship Gold
                    </Link>
                  ),
                },
                {
                  type: 'toggle' as const,
                  label: 'Under $300',
                  active: under300Active,
                  onClick: toggleUnder300,
                },
                {
                  type: 'toggle' as const,
                  label: 'Ready to Ship',
                  active: readyChipActive,
                  onClick: toggleReadyChip,
                },
                {
                  type: 'toggle' as const,
                  label: 'Gold',
                  active: goldActive,
                  onClick: () => toggleMetalChip('gold', goldActive),
                },
                {
                  type: 'toggle' as const,
                  label: 'Silver',
                  active: silverActive,
                  onClick: () => toggleMetalChip('silver', silverActive),
                },
                {
                  type: 'toggle' as const,
                  label: 'Limited Edition',
                  active: selectedLimitedDrop === true,
                  onClick: () => updateQuery({ limited: selectedLimitedDrop ? undefined : 'true' }),
                },
                {
                  type: 'toggle' as const,
                  label: 'Bestseller',
                  active: selectedBestseller === true,
                  onClick: () => updateQuery({ bestseller: selectedBestseller ? undefined : 'true' }),
                },
              ].map((item, index) => (
                <Fragment key={`${item.type}-${item.label}`}>
                  {index > 0 && (
                    <span className="text-text-muted" aria-hidden="true">
                      ·
                    </span>
                  )}
                  {item.type === 'link' ? (
                    item.node
                  ) : (
                    <button
                      type="button"
                      onClick={item.onClick}
                      aria-pressed={item.active}
                      className={cn(
                        'text-[0.72rem] font-semibold text-text-secondary transition hover:text-text-primary',
                        item.active && 'text-text-primary',
                      )}
                    >
                      {item.label}
                    </button>
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Refinement Controls */}
          <div className="mt-5 rounded-[24px] border border-border-subtle/60 bg-surface-panel/40 p-4">
            <Typography variant="eyebrow" className="text-[0.68rem] uppercase tracking-[0.32em] text-text-muted">
              Refine details
            </Typography>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CategoryFilterControl />
              <PriceFilterControl />
              <MetalFilterControl />
              <AvailabilityFilterControl />
              <ToneFilterControl />
              <GemstoneFilterControl />
              <MaterialFilterControl />
              <TagFilterControl />
              <div className="flex-shrink-0">
                <FilterPill label="More Filters" onClick={() => setIsFilterOpen(true)} />
              </div>
            </div>
            <div className="mt-4 rounded-[20px] border border-border-subtle bg-white/90 px-4 py-5">
              {renderDetailPanel()}
            </div>
          </div>


          {/* Row 4: Active Filters (Only shows when filters applied) */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border-subtle/60 pt-4">
              <Typography variant="eyebrow" className="text-body-muted">
                Active
              </Typography>
              {activeFilters.map((filter) => (
                <Link
                  key={`${filter.label}-${filter.href}`}
                  href={filter.href}
                  prefetch={false}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-full border border-border-subtle/80 px-4 text-sm font-medium text-text-secondary transition hover:border-border-strong hover:text-text-primary',
                    filter.tone && toneBadgeClass[filter.tone]
                  )}
                >
                  {filter.label}
                  <span aria-hidden>×</span>
                </Link>
              ))}
              <Link
                href={clearFiltersHref}
                prefetch={false}
                className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary hover:text-text-primary"
              >
                Clear all
              </Link>
            </div>
          )}
          </div>
        </div>
      </div>

      <SectionContainer size="gallery" bleed className="space-y-10 px-4 sm:px-6 lg:px-10 xl:px-0">
        <div className="pt-[50px]">
          {products.length === 0 ? (
            <div className="rounded-[32px] border border-border-subtle bg-surface-base px-10 py-16 text-center shadow-soft">
              <Typography variant="title" className="text-brand-ink">
                    {hasSearchApplied ? `No results for “${normalizedSearchTerm}”` : 'No capsules match these filters yet'}
                  </Typography>
                  <Typography variant="body" className="mt-4 text-body">
                    {hasSearchApplied
                      ? 'Try a broader term or clear search to explore the full capsule library.'
                      : 'Remove a filter or reset the view to see all merchandising-ready capsules while data finishes syncing.'}
                  </Typography>
                  {emptyStateSuggestions.length > 0 ? (
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      {emptyStateSuggestions.map((suggestion) => (
                        <Link
                          key={`${suggestion.label}-${suggestion.href}`}
                          href={suggestion.href}
                          prefetch={false}
                          aria-label={suggestion.ariaLabel}
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-border-subtle/80 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-ink transition hover:border-border-strong hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
                        >
                          {suggestion.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className={productGridClass}>
                  {products.map((product) => (
                    <div key={product.slug} className="w-full">
                      <ProductCard
                        slug={product.slug}
                        name={product.name}
                        category={product.category}
                        price={product.price}
                        tone={product.tone}
                        heroImage={product.heroImage}
                        tagline={product.tagline}
                        detailsHref={`/products/${product.slug}`}
                        customizeHref={product.variantId ? `/customizer?product=${product.slug}` : null}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionContainer>
        </div>
      </div>
      {isFilterOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="hidden flex-1 bg-black/40 md:block" onClick={() => setIsFilterOpen(false)} aria-hidden="true" />
          <div className="relative ml-auto flex h-full w-full flex-col bg-surface-base p-6 shadow-soft transition md:w-[420px]">
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-text-secondary hover:text-text-primary"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
            <Typography variant="title" className="pr-10 text-text-primary">
              Filters
            </Typography>
            <div className="mt-6 flex-1 space-y-8 overflow-y-auto pr-2">
              <FilterSection title="Price">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <label htmlFor="price-min" className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Min
                    </label>
                    <input
                      id="price-min"
                      type="number"
                      min={priceRange.min}
                      max={draftMaxPrice ?? priceRange.max}
                      value={draftMinPrice ?? ''}
                      placeholder={String(priceRange.min)}
                      onChange={(event) => setDraftMinPrice(event.target.value ? Number(event.target.value) : undefined)}
                      className="mt-1 w-36 rounded-xl border border-border-subtle bg-surface-panel px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                  <span className="mt-6 text-text-muted">–</span>
                  <div className="flex flex-col">
                    <label htmlFor="price-max" className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Max
                    </label>
                    <input
                      id="price-max"
                      type="number"
                      min={draftMinPrice ?? priceRange.min}
                      max={priceRange.max}
                      value={draftMaxPrice ?? ''}
                      placeholder={String(priceRange.max)}
                      onChange={(event) => setDraftMaxPrice(event.target.value ? Number(event.target.value) : undefined)}
                      className="mt-1 w-36 rounded-xl border border-border-subtle bg-surface-panel px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Availability" helper="Choose fulfillment speed to refine capsules.">
                <div className="flex flex-col gap-3">
                  <div
                    role="group"
                    aria-label="Availability options"
                    className="inline-flex w-full rounded-full border border-border-subtle bg-surface-panel p-1"
                  >
                    {([
                      { value: 'any' as AvailabilityChoice, label: 'Any' },
                      ...availabilityOptions.map((option) => ({ value: option.value, label: option.label })),
                    ]).map((segment) => {
                      const isActive = draftAvailability === segment.value
                      return (
                        <button
                          key={segment.value}
                          type="button"
                          onClick={() => setDraftAvailability(segment.value)}
                          aria-pressed={isActive}
                          className={cn(
                            'flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-1',
                            isActive
                              ? 'bg-surface-base text-text-primary shadow-soft'
                              : 'text-text-secondary hover:text-text-primary'
                          )}
                        >
                          {segment.label}
                        </button>
                      )
                    })}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {draftAvailability === 'ready'
                      ? availabilityOptions.find((option) => option.value === 'ready')?.helper ?? 'Ships within 3-5 business days.'
                      : draftAvailability === 'made'
                        ? availabilityOptions.find((option) => option.value === 'made')?.helper ?? 'Crafted once your order is placed.'
                        : 'Show capsules regardless of fulfillment timing.'}
                  </div>
                  <span className="sr-only" aria-live="polite">
                    Availability set to
                    {draftAvailability === 'ready'
                      ? ' Ready to ship'
                      : draftAvailability === 'made'
                        ? ' Made to order'
                        : ' Any'}
                  </span>
                </div>
              </FilterSection>

              {metalOptions.length > 0 ? (
                <FilterSection title="Metal">
                  <div className="flex flex-wrap gap-2">
                    {metalOptions.map((metal) => {
                      const active = draftMetals.includes(metal)
                      return (
                        <button
                          key={metal}
                          type="button"
                          onClick={() => toggleMetal(metal)}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                            active
                              ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
                              : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
                          )}
                        >
                          {metal}
                        </button>
                      )
                    })}
                  </div>
                </FilterSection>
              ) : null}
              
              {materialOptions.length > 0 ? (
                <FilterSection title="Materials" helper="Filter by specific material composition">
                  <div className="flex flex-wrap gap-2">
                    {materialOptions.map((material) => {
                      const active = draftMaterials.includes(material.toLowerCase())
                      return (
                        <button
                          key={material}
                          type="button"
                          onClick={() => toggleDraftMaterial(material.toLowerCase())}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                            active
                              ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
                              : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
                          )}
                        >
                          {material}
                        </button>
                      )
                    })}
                  </div>
                </FilterSection>
              ) : null}
              
              {tagOptions.length > 0 ? (
                <FilterSection title="Tags & Themes" helper="Filter by style, occasion, or collection">
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => {
                      const active = draftTags.includes(tag.toLowerCase())
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleDraftTag(tag.toLowerCase())}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition',
                            active
                              ? 'border-accent-primary/40 bg-surface-base text-text-primary shadow-soft'
                              : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary',
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </FilterSection>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="ghost" tone="ink" onClick={resetFilters}>
                Reset
              </Button>
              <Button variant="primary" tone="magenta" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

interface FilterSectionProps {
  title: string
  helper?: string
  children: ReactNode
}

function FilterSection({ title, helper, children }: FilterSectionProps) {
  return (
    <section>
      <Typography variant="eyebrow" className="text-xs font-semibold uppercase tracking-[0.28em] text-text-secondary">
        {title}
      </Typography>
      {helper ? <p className="mt-1 text-xs text-text-secondary">{helper}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  )
}
