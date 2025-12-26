import { conciergeApiHeaders, conciergeDataMode, conciergeEndpoints } from './config'
import type { ConciergeDataMode } from './config'
import { catalog as stubCatalog } from './stubs/products'
import { normalizeFilters as unifiedNormalizeFilters } from './intent/normalizer'

type ProductFilters = Record<string, unknown>

type Product = {
  id: string
  title: string
  price: number
  image?: string
  tags?: string[]
  shippingPromise?: string
  category?: string
  readyToShip?: boolean
  metal?: string
  slug?: string
}

export interface ProductCatalogProvider {
  getProducts(filters: ProductFilters, requestId?: string): Promise<Product[]>
  getByIds?(ids: string[], requestId?: string): Promise<Product[]>
}

function createStubProvider(): ProductCatalogProvider {
  return {
    async getProducts(filters) {
      const { default: fallback } = await import('./stubs/products')
      return fallback(filters)
    },
  }
}

async function fetchRemoteProducts(filters: ProductFilters, requestId?: string): Promise<Product[]> {
  const endpoint = conciergeEndpoints.products
  if (!endpoint) {
    throw new Error('CONCIERGE_PRODUCTS_ENDPOINT not configured')
  }
  const headers = new Headers(conciergeApiHeaders)
  if (requestId) {
    headers.set('x-request-id', requestId)
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(filters),
  })
  if (!response.ok) {
    throw new Error(`Remote catalog request failed: ${response.status}`)
  }
  return (await response.json()) as Product[]
}



import { localDbProvider } from './providers/localdb';

async function fetchLocalDbProducts(filters: ProductFilters): Promise<Product[]> {
  try {
    // Adapter to map ProductFilters to the type expected by localDbProvider
    const query = { ...filters };
    if (query.priceBand && typeof query.priceBand === 'object') {
      const band = query.priceBand as { max?: number };
      if (band.max) query.priceMax = band.max;
    }

    // Call the verified provider
    const products = await localDbProvider.listProducts(query);

    // Map back to the local Product type if necessary (though they should align)
    return products.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.imageUrl, // Map imageUrl to image
      tags: p.tags,
      shippingPromise: p.shippingPromise,
      category: p.category,
      readyToShip: p.readyToShip,
      metal: (p as any).metal, // Pass through if exists
      slug: p.slug
    }));

  } catch (error) {
    console.error('[catalogProvider] localDbProvider error:', error);
    throw error;
  }
}

export function getProductCatalogProvider(mode: ConciergeDataMode): ProductCatalogProvider {
  switch (mode) {
    case 'remoteApi':
      return {
        getProducts: (filters, requestId) => fetchRemoteProducts(filters, requestId),
      }
    case 'localDb':
      return {
        getProducts: (filters) => fetchLocalDbProducts(filters),
      }
    case 'stub':
    default:
      return createStubProvider()
  }
}

// Legacy type kept for backwards compatibility
export type NormalizedFilters = {
  category?: string
  readyToShip?: boolean
  metal?: string
  priceBand?: { max?: number }
  tags?: string[]
  priceMax?: number
  priceMin?: number
  priceLt?: number
}

// Use unified normalizer from intent/normalizer.ts
function normalizeFilters(filters: ProductFilters): NormalizedFilters {
  return unifiedNormalizeFilters(filters) as NormalizedFilters
}

function matches(product: Product, filters: NormalizedFilters): boolean {
  if (filters.category && product.category && filters.category !== product.category) {
    return false
  }
  if (filters.readyToShip && product.readyToShip === false) {
    return false
  }
  if (filters.metal && product.metal && filters.metal !== product.metal) {
    return false
  }

  // Support both priceMax and priceBand.max for backwards compatibility
  const maxPrice = filters.priceMax ?? filters.priceBand?.max
  if (maxPrice && product.price > maxPrice) {
    return false
  }

  // Support priceMin
  if (filters.priceMin && product.price < filters.priceMin) {
    return false
  }

  if (filters.tags?.length && product.tags) {
    const hasTag = filters.tags.some((tag) => product.tags?.includes(tag))
    if (!hasTag) {
      return false
    }
  }
  return true
}
