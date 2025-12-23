/**
 * Unified filter normalization for Aurora Concierge
 * 
 * Consolidates normalization logic from services.ts and catalogProvider.ts
 * to provide a single source of truth for filter handling.
 * 
 * Supports multiple legacy formats for backwards compatibility:
 * - priceMax, budgetMax, priceBand.max
 * - priceMin, budgetMin
 */

function numberCandidates(values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }
  return undefined
}

type SortBy = 'featured' | 'newest' | 'price-asc' | 'price-desc'

export interface NormalizedFilters {
  category?: string
  metal?: string
  materials?: string[]
  stone?: string
  readyToShip?: boolean
  tags?: string[]
  priceMin?: number
  priceMax?: number
  priceLt?: number
  featured?: boolean
  limit?: number
  offset?: number
  q?: string
  sortBy?: SortBy
}

/**
 * Normalize product filters from various input formats
 * 
 * @param raw - Raw filter object from user input or API
 * @returns Normalized filter object with consistent field names
 */
export function normalizeFilters(raw: Record<string, unknown> = {}): NormalizedFilters {
  const normalized: NormalizedFilters = {}

  // Price max: Support priceMax, budgetMax, and priceBand.max
  const priceCeiling = numberCandidates([
    raw.priceLt,
    raw.priceMax,
    raw.budgetMax,
    typeof raw.priceBand === 'object' && raw.priceBand !== null
      ? (raw.priceBand as Record<string, unknown>).max
      : undefined,
  ])

  // Price min: Support priceMin and budgetMin
  const priceMin = numberCandidates([
    raw.priceMin,
    raw.budgetMin,
    typeof raw.priceBand === 'object' && raw.priceBand !== null
      ? (raw.priceBand as Record<string, unknown>).min
      : undefined,
  ])

  // Category
  if (typeof raw.category === 'string') {
    normalized.category = raw.category.toLowerCase()
  }

  // Metal
  if (typeof raw.metal === 'string') {
    normalized.metal = raw.metal.toLowerCase()
  }

  if (Array.isArray(raw.materials)) {
    const materials = raw.materials
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => value.trim().toLowerCase())

    if (materials.length > 0) {
      normalized.materials = Array.from(new Set(materials))
    }
  }

  // Ready to ship
  if (typeof raw.readyToShip !== 'undefined') {
    normalized.readyToShip = Boolean(raw.readyToShip)
  }

  // Tags
  if (Array.isArray(raw.tags)) {
    normalized.tags = Array.from(
      new Set(
        raw.tags
          .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
          .map((tag) => tag.toLowerCase())
      )
    )
  }

  const ensureTags = () => {
    if (!normalized.tags) {
      normalized.tags = []
    }
    return normalized.tags
  }

  if (typeof raw.stone === 'string' && raw.stone.trim().length > 0) {
    normalized.stone = raw.stone
    const slug = raw.stone.trim().toLowerCase().replace(/\s+/g, '-')
    const tags = ensureTags()
    if (!tags.includes(slug)) {
      tags.push(slug)
    }
  }

  // Price range
  if (priceMin !== undefined) {
    normalized.priceMin = Math.max(1, Math.min(100000, priceMin))
  }
  if (priceCeiling !== undefined) {
    const clamped = Math.max(1, Math.min(100000, priceCeiling))
    normalized.priceMax = clamped
    normalized.priceLt = clamped
  }

  if (typeof raw.featured === 'boolean') {
    normalized.featured = Boolean(raw.featured)
  }

  if (typeof raw.sortBy === 'string') {
    const lowered = raw.sortBy.toLowerCase() as SortBy
    const allowed: SortBy[] = ['featured', 'newest', 'price-asc', 'price-desc']
    if (allowed.includes(lowered)) {
      normalized.sortBy = lowered
    }
  }

  // Pagination
  const limit = numberCandidates([raw.limit])
  normalized.limit = limit !== undefined ? Math.max(1, Math.min(50, limit)) : 20

  const offset = numberCandidates([raw.offset])
  normalized.offset = offset !== undefined ? Math.max(0, Math.min(5000, offset)) : 0

  // Search query
  if (typeof raw.q === 'string') {
    normalized.q = raw.q
  }

  return normalized
}

/**
 * Normalize product response from various provider formats
 * 
 * @param product - Raw product object from provider
 * @returns Normalized product with consistent field names
 */
export function normalizeProductResponse(product: Record<string, unknown>) {
  const price = numberCandidates([product.price]) ?? 0
  const image = typeof product.image === 'string' && product.image.length > 0
    ? product.image
    : typeof product.imageUrl === 'string' && product.imageUrl.length > 0
      ? product.imageUrl
      : undefined

  const tags = Array.isArray(product.tags)
    ? product.tags.filter((tag): tag is string => typeof tag === 'string')
    : undefined

  // Normalize title field (handle both 'title' and 'name' from different seed sources)
  const title = typeof product.title === 'string' && product.title.length > 0
    ? product.title
    : typeof product.name === 'string' && product.name.length > 0
      ? product.name
      : 'Untitled Product'

  const slug = typeof product.slug === 'string' && product.slug.length > 0
    ? product.slug
    : typeof product.handle === 'string' && product.handle.length > 0
      ? product.handle
      : undefined

  return {
    ...product,
    id: String(product.id || ''),
    title,
    price,
    image,
    imageUrl: typeof product.imageUrl === 'string' ? product.imageUrl : image,
    readyToShip: 'readyToShip' in product ? Boolean(product.readyToShip) : undefined,
    tags,
    slug,
  }
}
