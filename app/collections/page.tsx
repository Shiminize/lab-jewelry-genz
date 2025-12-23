// price sanitation: enabled so re-runs are detectable

import Image from 'next/image'
import Link from 'next/link'

import { Section, SectionContainer } from '@/components/layout/Section'
import { Typography } from '@/components/ui'
import type { CatalogPreviewProduct, CatalogTone } from '@/config/catalogDefaults'
import { getCatalogProducts, searchCatalogProducts } from '@/services/neon'

import { CatalogClient } from './CatalogClient'
import type { SortKey } from './CatalogClient'

interface CatalogPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

const toneLabels: Record<CatalogTone, string> = {
  volt: 'Volt',
  cyan: 'Cyan',
  magenta: 'Magenta',
  lime: 'Lime',
}

const canonicalCategoryOrder = ['Rings', 'Earrings', 'Bracelets', 'Necklaces', 'Collections', 'Diamond Classics']

const sortOptions: Array<{ key: SortKey; label: string; helper: string }> = [
  { key: 'featured', label: 'Featured Picks', helper: 'Curated order from our merchandising team.' },
  { key: 'price-asc', label: 'Price: Low → High', helper: 'Great for gift budgets.' },
  { key: 'price-desc', label: 'Price: High → Low', helper: 'Spotlight statement pieces first.' },
  { key: 'name-asc', label: 'Name: A → Z', helper: 'Browse alphabetically.' },
  { key: 'customizer', label: 'Customizer Ready First', helper: 'Pieces you can personalize immediately.' },
  { key: 'limited', label: 'Limited Drop Spotlight', helper: 'Prioritize limited availability capsules.' },
]

const availabilityOptions = [
  {
    value: 'ready',
    label: 'Ready to Ship',
    helper: 'Ships within 3-5 business days.',
  },
  {
    value: 'made',
    label: 'Made to Order',
    helper: 'Crafted once your order is placed.',
  },
] as const

type AvailabilityValue = (typeof availabilityOptions)[number]['value']

type AvailabilityFilter = AvailabilityValue | 'any'

const availabilityAliasToValue: Record<string, AvailabilityValue> = {
  ready: 'ready',
  'ready-to-ship': 'ready',
  made: 'made',
  'made-to-order': 'made',
}

const categorySlugToLabel: Record<string, string> = {
  ring: 'Rings',
  necklace: 'Necklaces',
  earring: 'Earrings',
  bracelet: 'Bracelets',
}

const categoryAliasToSlug: Record<string, string> = {
  ring: 'ring',
  rings: 'ring',
  necklace: 'necklace',
  necklaces: 'necklace',
  earring: 'earring',
  earrings: 'earring',
  bracelet: 'bracelet',
  bracelets: 'bracelet',
}

function normalizeCategoryInput(value: string | null): string | undefined {
  if (!value) return undefined
  const slug = value.trim().toLowerCase()
  if (!slug) return undefined
  if (categorySlugToLabel[slug]) {
    return slug
  }
  return categoryAliasToSlug[slug]
}

interface SanitizeResult {
  sanitizedParams: URLSearchParams
  swaps: { price: boolean }
}

function sanitizeFilters(params: URLSearchParams): SanitizeResult {
  const sanitized = new URLSearchParams(params.toString())
  let priceSwapped = false

  const clampPrice = (value: number) => Math.min(100000, Math.max(1, value))
  const parsePrice = (raw: string | null): number | undefined => {
    if (!raw) return undefined
    const value = Number(raw)
    if (!Number.isFinite(value)) return undefined
    return clampPrice(value)
  }

  let minPrice = parsePrice(sanitized.get('min_price'))
  let maxPrice = parsePrice(sanitized.get('max_price'))

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    priceSwapped = true
    ;[minPrice, maxPrice] = [maxPrice, minPrice]
  }

  if (minPrice !== undefined) {
    sanitized.set('min_price', String(minPrice))
  } else {
    sanitized.delete('min_price')
  }

  if (maxPrice !== undefined) {
    sanitized.set('max_price', String(maxPrice))
  } else {
    sanitized.delete('max_price')
  }

  const rawMetalValues = sanitized.getAll('metal')
  sanitized.delete('metal')
  if (rawMetalValues.length > 0) {
    const normalizedMetals = rawMetalValues
      .flatMap((entry) => entry.split(','))
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
    const uniqueMetals = Array.from(new Set(normalizedMetals))
    if (uniqueMetals.length > 0) {
      sanitized.set('metal', uniqueMetals.join(','))
    }
  }

  const rawAvailabilityValues = params.getAll('availability')
  sanitized.delete('availability')
  if (rawAvailabilityValues.length > 0) {
    const lastValue = rawAvailabilityValues[rawAvailabilityValues.length - 1]
    const normalized = lastValue?.trim().toLowerCase()
    const resolved = normalized ? availabilityAliasToValue[normalized] : undefined
    if (resolved) {
      sanitized.set('availability', resolved)
    }
  }

  const categorySlug = normalizeCategoryInput(sanitized.get('category'))
  if (categorySlug) {
    sanitized.set('category', categorySlug)
  } else {
    sanitized.delete('category')
  }

  return {
    sanitizedParams: sanitized,
    swaps: { price: priceSwapped },
  }
}

interface ProductWithIndex {
  product: CatalogPreviewProduct
  index: number
}

// tie-breaker: slug → sku → _id → title (fallback to name)
function productTieBreakerKey(product: CatalogPreviewProduct & { sku?: string; _id?: string; title?: string; name?: string }): string {
  const fromSlug = typeof product.slug === 'string' ? product.slug : undefined
  const fromSku = typeof product.sku === 'string' ? product.sku : undefined
  const fromId = typeof product._id === 'string' ? product._id : undefined
  const fromTitle = typeof product.title === 'string' ? product.title : undefined
  const fromName = typeof product.name === 'string' ? product.name : undefined

  return (fromSlug ?? fromSku ?? fromId ?? fromTitle ?? fromName ?? '').toLowerCase()
}

function compareByTieBreaker(a: CatalogPreviewProduct, b: CatalogPreviewProduct): number {
  return productTieBreakerKey(a).localeCompare(productTieBreakerKey(b), 'en', { sensitivity: 'base' })
}

function resolveSortKey(raw: string | string[] | undefined): SortKey {
  const value = Array.isArray(raw) ? raw[0] : raw
  const allowed = sortOptions.map((option) => option.key)
  return allowed.includes(value as SortKey) ? (value as SortKey) : 'featured'
}

function parseTone(raw: string | string[] | undefined, available: CatalogTone[]): CatalogTone | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return undefined
  return available.includes(value as CatalogTone) ? (value as CatalogTone) : undefined
}

function parseCategory(raw: string | string[] | undefined, categories: string[]): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return undefined
  const slug = normalizeCategoryInput(value)
  const candidate = slug ? categorySlugToLabel[slug] : value
  return categories.includes(candidate) ? candidate : undefined
}

function parseNumberParam(raw: string | string[] | undefined): number | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseListParam(raw: string | string[] | undefined): string[] {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return []
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function sortProducts(items: ProductWithIndex[], sortKey: SortKey): ProductWithIndex[] {
  const next = [...items]
  switch (sortKey) {
    case 'price-asc':
      return next.sort((a, b) => {
        const diff = a.product.price - b.product.price
        if (diff !== 0) return diff
        return compareByTieBreaker(a.product, b.product)
      })
    case 'price-desc':
      return next.sort((a, b) => {
        const diff = b.product.price - a.product.price
        if (diff !== 0) return diff
        return compareByTieBreaker(a.product, b.product)
      })
    case 'name-asc':
      return next.sort((a, b) => {
        const diff = a.product.name.localeCompare(b.product.name, 'en', { sensitivity: 'base' })
        if (diff !== 0) return diff
        return compareByTieBreaker(a.product, b.product)
      })
    case 'customizer':
      return next.sort((a, b) => {
        const aReady = a.product.variantId ? 0 : 1
        const bReady = b.product.variantId ? 0 : 1
        if (aReady !== bReady) return aReady - bReady
        const nameDiff = a.product.name.localeCompare(b.product.name, 'en', { sensitivity: 'base' })
        if (nameDiff !== 0) return nameDiff
        return compareByTieBreaker(a.product, b.product)
      })
    case 'limited':
      return next.sort((a, b) => {
        const aLimited = a.product.limitedDrop ? 0 : 1
        const bLimited = b.product.limitedDrop ? 0 : 1
        if (aLimited !== bLimited) return aLimited - bLimited
        const aWeight = typeof a.product.sortWeight === 'number' ? a.product.sortWeight : Number.MAX_SAFE_INTEGER
        const bWeight = typeof b.product.sortWeight === 'number' ? b.product.sortWeight : Number.MAX_SAFE_INTEGER
        if (aWeight !== bWeight) return aWeight - bWeight
        return compareByTieBreaker(a.product, b.product)
      })
    case 'featured':
    default:
      return next.sort((a, b) => {
        const aWeight = typeof a.product.sortWeight === 'number' ? a.product.sortWeight : Number.MAX_SAFE_INTEGER
        const bWeight = typeof b.product.sortWeight === 'number' ? b.product.sortWeight : Number.MAX_SAFE_INTEGER
        if (aWeight !== bWeight) return aWeight - bWeight
        return compareByTieBreaker(a.product, b.product)
      })
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const urlSearchParams = new URLSearchParams()
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value
          .filter((entry): entry is string => typeof entry === 'string')
          .forEach((entry) => urlSearchParams.append(key, entry))
      } else if (typeof value === 'string') {
        urlSearchParams.set(key, value)
      }
    })
  }

  const { sanitizedParams, swaps } = sanitizeFilters(urlSearchParams)

  if (swaps.price) {
    console.info('[catalog] price range swapped', {
      min: sanitizedParams.get('min_price'),
      max: sanitizedParams.get('max_price'),
    })
  }

  const rawSearch = sanitizedParams.get('q')
  const searchTerm = rawSearch ? rawSearch.trim().slice(0, 80) : undefined
  const allProducts = searchTerm ? await searchCatalogProducts(searchTerm, 60) : await getCatalogProducts(60)
  const indexedProducts: ProductWithIndex[] = allProducts.map((product, index) => ({ product, index }))

  const categories = Array.from(new Set(allProducts.map((product) => product.category))).filter(Boolean)
  const orderedCategories = [
    ...canonicalCategoryOrder.filter((canonical) => categories.includes(canonical)),
    ...categories.filter((category) => !canonicalCategoryOrder.includes(category)).sort((a, b) => a.localeCompare(b)),
  ]

  const toneValues = Array.from(new Set(allProducts.map((product) => product.tone)))

  const availabilityParam = sanitizedParams.get('availability') ?? undefined
  const selectedAvailability: AvailabilityFilter = availabilityParam === 'ready' || availabilityParam === 'made' ? availabilityParam : 'any'
  const selectedCategory = parseCategory(sanitizedParams.get('category') ?? undefined, orderedCategories)
  const selectedTone = parseTone(sanitizedParams.get('tone') ?? undefined, toneValues)
  const selectedSortKey = resolveSortKey(sanitizedParams.get('sort') ?? undefined)
  const selectedView = sanitizedParams.get('view') ?? undefined
  const viewMode: 'grid' | 'list' = selectedView === 'list' ? 'list' : 'grid'

  const minPrice = allProducts.reduce((acc, product) => Math.min(acc, product.price), Number.MAX_SAFE_INTEGER)
  const maxPrice = allProducts.reduce((acc, product) => Math.max(acc, product.price), 0)
  const priceRange = {
    min: Number.isFinite(minPrice) ? minPrice : 0,
    max: Number.isFinite(maxPrice) ? maxPrice : 0,
  }

  const selectedMinPrice = parseNumberParam(sanitizedParams.get('min_price') ?? undefined)
  const selectedMaxPrice = parseNumberParam(sanitizedParams.get('max_price') ?? undefined)

  const metalValues = Array.from(
    new Set(
      allProducts
        .map((product) => product.metal)
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b))
  const metalSlugToLabel = new Map(metalValues.map((metal) => [metal.toLowerCase(), metal]))
  const requestedMetalSlugs = parseListParam(sanitizedParams.get('metal') ?? undefined)
    .map((value) => value.toLowerCase())
    .filter(Boolean)
  const metalSelections = requestedMetalSlugs
    .map((slug) => metalSlugToLabel.get(slug))
    .filter((value): value is string => typeof value === 'string' && value.length > 0)

  const metalsSet = new Set(requestedMetalSlugs)
  
  // New filters: Limited Edition and Bestseller
  const selectedLimitedDrop = sanitizedParams.get('limited') === 'true'
  const selectedBestseller = sanitizedParams.get('bestseller') === 'true'
  
  // Gemstone filter aggregation
  const gemstoneValues = Array.from(
    new Set(
      allProducts
        .flatMap((product) => {
          const productWithGems = product as any
          const gems = productWithGems.gemstones
          if (Array.isArray(gems)) {
            return gems.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          }
          return []
        })
    )
  ).sort((a, b) => a.localeCompare(b))
  
  const requestedGemstones = parseListParam(sanitizedParams.get('gemstone') ?? undefined)
    .map((value) => value.toLowerCase())
    .filter(Boolean)
  const gemstonesSet = new Set(requestedGemstones)
  
  // Materials filter aggregation
  const materialValues = Array.from(
    new Set(
      allProducts
        .flatMap((product) => {
          const productWithMaterials = product as any
          const materials = productWithMaterials.materials
          if (Array.isArray(materials)) {
            return materials.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          }
          return []
        })
    )
  ).sort((a, b) => a.localeCompare(b))
  
  const requestedMaterials = parseListParam(sanitizedParams.get('material') ?? undefined)
    .map((value) => value.toLowerCase())
    .filter(Boolean)
  const materialsSet = new Set(requestedMaterials)
  
  // Tags filter aggregation
  const tagValues = Array.from(
    new Set(
      allProducts
        .flatMap((product) => {
          const productWithTags = product as any
          const tags = productWithTags.tags
          if (Array.isArray(tags)) {
            return tags.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          }
          return []
        })
    )
  ).sort((a, b) => a.localeCompare(b))
  
  const requestedTags = parseListParam(sanitizedParams.get('tag') ?? undefined)
    .map((value) => value.toLowerCase())
    .filter(Boolean)
  const tagsSet = new Set(requestedTags)

  const filteredProducts = indexedProducts.filter(({ product }) => {
    if (selectedCategory && product.category !== selectedCategory) {
      return false
    }
    if (selectedTone && product.tone !== selectedTone) {
      return false
    }
    if (typeof selectedMinPrice === 'number' && product.price < selectedMinPrice) {
      return false
    }
    if (typeof selectedMaxPrice === 'number' && product.price > selectedMaxPrice) {
      return false
    }

    if (selectedAvailability === 'ready' && product.readyToShip !== true) {
      return false
    }

    if (selectedAvailability === 'made' && product.readyToShip === true) {
      return false
    }

    if (metalsSet.size > 0) {
      const productMetal = typeof product.metal === 'string' ? product.metal.toLowerCase() : ''
      if (!metalsSet.has(productMetal)) {
        return false
      }
    }
    
    // Limited Edition filter
    if (selectedLimitedDrop && product.limitedDrop !== true) {
      return false
    }
    
    // Bestseller filter (assuming metadata.bestseller exists)
    if (selectedBestseller) {
      const productWithMetadata = product as any
      if (productWithMetadata.bestseller !== true) {
        return false
      }
    }
    
    // Gemstone filter
    if (gemstonesSet.size > 0) {
      const productWithGems = product as any
      const productGemstones = Array.isArray(productWithGems.gemstones)
        ? productWithGems.gemstones.map((g: string) => g.toLowerCase())
        : []
      if (!productGemstones.some((gem: string) => gemstonesSet.has(gem))) {
        return false
      }
    }
    
    // Materials filter
    if (materialsSet.size > 0) {
      const productWithMaterials = product as any
      const productMaterials = Array.isArray(productWithMaterials.materials)
        ? productWithMaterials.materials.map((m: string) => m.toLowerCase())
        : []
      if (!productMaterials.some((material: string) => materialsSet.has(material))) {
        return false
      }
    }
    
    // Tags filter
    if (tagsSet.size > 0) {
      const productWithTags = product as any
      const productTags = Array.isArray(productWithTags.tags)
        ? productWithTags.tags.map((t: string) => t.toLowerCase())
        : []
      if (!productTags.some((tag: string) => tagsSet.has(tag))) {
        return false
      }
    }

    return true
  })

  const sortedProducts = sortProducts(filteredProducts, selectedSortKey).map(({ product }) => product)
  const resultCount = sortedProducts.length

  const priceSelection = {
    min: typeof selectedMinPrice === 'number' ? selectedMinPrice : undefined,
    max: typeof selectedMaxPrice === 'number' ? selectedMaxPrice : undefined,
  }

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedTone ? 1 : 0) +
    (priceSelection.min !== undefined || priceSelection.max !== undefined ? 1 : 0) +
    (selectedAvailability === 'any' ? 0 : 1) +
    metalSelections.length +
    (selectedLimitedDrop ? 1 : 0) +
    (selectedBestseller ? 1 : 0) +
    requestedGemstones.length +
    requestedMaterials.length +
    requestedTags.length

  const toneOptions = toneValues.map((tone) => ({
    value: tone,
    label: toneLabels[tone],
  }))

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections' },
    { label: 'Jewelries' },
  ]

  return (
    <div className="bg-app pb-24">
      <div className="px-4 pb-10 pt-16 sm:px-8 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="text-center">
            <Typography
              as="h1"
              variant="heading"
              className="font-heading text-[clamp(2.75rem,6vw,4.5rem)] font-semibold leading-tight text-ink"
              data-testid="catalog-hero-heading"
            >
              Jewelries <span className="text-body-muted">[{resultCount}]</span>
            </Typography>
            <Typography
              variant="body"
              className="mt-2 text-lg text-body-muted"
              data-testid="catalog-hero-body"
            >
              Curate by category, tone, or price—filters apply instantly.
            </Typography>
          </div>
        </div>
        <SectionContainer size="gallery" bleed className="mt-8 mb-10 px-4 sm:px-6 lg:px-10 xl:px-0">
          <div className="overflow-hidden rounded-2xl border border-border-subtle/70 bg-surface-base/85 shadow-soft">
            <div className="relative aspect-[21/9]">
              <Image
                src="/images/catalog/Sora/collections/collections_hero_trio_21x9_ribbon.webp"
                alt="Ring, necklace, and earrings arranged on stone blocks with a deep green ribbon accent."
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </SectionContainer>
      </div>

      <Section variant="transparent" spacing="compact">
        <CatalogClient
          products={sortedProducts}
          resultCount={resultCount}
          categories={orderedCategories}
          tones={toneOptions}
          selectedCategory={selectedCategory}
          selectedTone={selectedTone}
          sortOptions={sortOptions}
          selectedSortKey={selectedSortKey}
          viewMode={viewMode}
          priceRange={priceRange}
          selectedPrice={priceSelection}
          availabilityOptions={availabilityOptions}
          selectedAvailability={selectedAvailability}
          metalOptions={metalValues}
          selectedMetals={metalSelections}
          activeFilterCount={activeFilterCount + (searchTerm ? 1 : 0)}
          searchTerm={searchTerm}
          selectedLimitedDrop={selectedLimitedDrop}
          selectedBestseller={selectedBestseller}
          gemstoneOptions={gemstoneValues}
          selectedGemstones={requestedGemstones}
          materialOptions={materialValues}
          selectedMaterials={requestedMaterials}
          tagOptions={tagValues}
          selectedTags={requestedTags}
        />
      </Section>
    </div>
  )
}

interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string }>
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
      {items.map((item, index) => {
        const showSeparator = index < items.length - 1
        const content = item.href ? (
          <Link href={item.href} prefetch={false} className="hover:text-text-primary">
            {item.label}
          </Link>
        ) : (
          <span>{item.label}</span>
        )

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {content}
            {showSeparator ? <span className="text-text-muted">/</span> : null}
          </span>
        )
      })}
    </nav>
  )
}
