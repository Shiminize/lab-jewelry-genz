import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import {
  defaultCatalogProductDetails,
  defaultCatalogProducts,
  type CatalogFallbackDetail,
  type CatalogPreviewProduct,
  type CatalogTone,
} from '@/config/catalogDefaults'
import { Prisma } from '@prisma/client'

export interface CatalogProductDetail extends CatalogPreviewProduct {
  description?: string
  mediaGallery?: string[]
  materials?: string[]
  gemstones?: string[]
  inspiration?: string
  highlights?: string[]
}

const FALLBACK_TONES: CatalogTone[] = ['volt', 'cyan', 'magenta', 'lime']

// Helper to Map Prisma Product to CatalogPreviewProduct
function mapPrismaToPreview(doc: any, index: number): CatalogPreviewProduct {
  const meta = (doc.metadata as Record<string, any>) || {}

  // Determine Tone (fallback to cycle)
  const tone = (meta.accentTone as CatalogTone) || FALLBACK_TONES[index % FALLBACK_TONES.length]

  return {
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    price: doc.basePrice,
    tone: tone,
    heroImage: doc.heroImage,
    tagline: meta.tagline || (doc.description ? doc.description.slice(0, 96) : undefined),
    variantId: meta.variantId,
    sortWeight: meta.sortWeight || meta.collectionOrder,
    limitedDrop: meta.limitedDrop === true,
    readyToShip: meta.readyToShip === true,
    metal: meta.primaryMetal || (doc.materials && doc.materials[0])
  }
}

// Helper to Map Prisma Product to CatalogProductDetail
function mapPrismaToDetail(doc: any, index: number): CatalogProductDetail {
  const preview = mapPrismaToPreview(doc, index)
  const meta = (doc.metadata as Record<string, any>) || {}

  return {
    ...preview,
    description: doc.description,
    mediaGallery: doc.gallery,
    materials: doc.materials,
    gemstones: doc.gemstones,
    inspiration: doc.story || meta.inspiration,
    highlights: meta.highlights,
  }
}

export async function getCatalogProducts(limit = 12): Promise<CatalogPreviewProduct[]> {
  try {
    const products = await prisma.product.findMany({
      take: limit,
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' }
      // Note: Ideally sort by 'sortWeight' if we add it to schema, or store in metadata.
      // For now, simple creation order or metadata sort in memory could work.
    })

    if (!products || products.length === 0) {
      return defaultCatalogProducts
    }

    return products.map((p, i) => mapPrismaToPreview(p, i))
  } catch (error) {
    console.warn('Falling back to default catalog products', error)
    return defaultCatalogProducts
  }
}

export async function searchCatalogProducts(query: string, limit = 60): Promise<CatalogPreviewProduct[]> {
  const trimmed = query?.trim()
  if (!trimmed) {
    return getCatalogProducts(limit)
  }

  try {
    const products = await prisma.product.findMany({
      take: limit,
      where: {
        status: 'active',
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { category: { contains: trimmed, mode: 'insensitive' } },
          { description: { contains: trimmed, mode: 'insensitive' } },
          // Simple text search. Full text search requires Postgres extension logic.
        ]
      }
    })

    if (products.length === 0) {
      // Fallback logic
      return defaultCatalogProducts.filter(p =>
        p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        p.category.toLowerCase().includes(trimmed.toLowerCase())
      ).slice(0, limit)
    }

    return products.map((p, i) => mapPrismaToPreview(p, i))
  } catch (error) {
    console.warn('Falling back to default catalog search', error)
    return defaultCatalogProducts.slice(0, limit) // Simple fallback
  }
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogProductDetail | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug }
    })

    if (!product) {
      // Search Fallback
      const fallback = defaultCatalogProductDetails[slug]
      return fallback ? { ...fallback, tone: 'volt' } : null // Simple cast
    }

    return mapPrismaToDetail(product, 0)
  } catch (error) {
    console.warn(`Falling back to default catalog product for slug ${slug}`, error)
    const fallback = defaultCatalogProductDetails[slug]
    return fallback ? { ...fallback, tone: 'volt' } : null
  }
}

export interface HomepageDisplayEntries {
  collection: CatalogProductDetail[]
  spotlight: CatalogProductDetail[]
}

async function fetchHomepageDisplayEntriesRaw(): Promise<HomepageDisplayEntries | null> {
  try {
    const products = await prisma.product.findMany({
      take: 9, // 3 for collection (if needed), 6 for spotlight
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' }
    })

    if (!products || products.length === 0) {
      return null
    }

    const details = products.map((p, i) => mapPrismaToDetail(p, i))

    return {
      collection: details.slice(0, 3),
      spotlight: details.slice(0, 6)
    }
  } catch (error) {
    console.error('Failed to fetch homepage display entries', error)
    return null
  }
}

export const getHomepageDisplayEntries = unstable_cache(
  fetchHomepageDisplayEntriesRaw,
  ['homepage-display-entries'],
  { revalidate: 3600, tags: ['products'] }
)
