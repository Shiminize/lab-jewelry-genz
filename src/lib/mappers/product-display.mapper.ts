/**
 * Product Display Mapper
 * Server-side data transformation following CLAUDE_RULES.md patterns
 * Optimized for <50ms transformation performance
 */

import type { ProductListDTO, ProductDisplayDTO } from '@/types/product-dto'

/**
 * Transform ProductListDTO to ProductDisplayDTO for UI consumption
 * CLAUDE_RULES.md compliant: Server-side only, material-only focus, performance optimized
 * 
 * @param product ProductListDTO from database/API
 * @returns ProductDisplayDTO optimized for UI components
 */
export function mapToProductDisplayDTO(product: ProductListDTO): ProductDisplayDTO {
  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    slug: product.slug,
    
    // Unified pricing structure
    basePrice: product.pricing.basePrice,
    currency: product.pricing.currency,
    
    // Unified image structure (compatible with legacy ProductBase)
    primaryImage: product.primaryImage,
    images: {
      primary: product.primaryImage,
      gallery: [product.primaryImage] // Fallback to primary if gallery not available
    },
    
    // Material specifications (CLAUDE_RULES.md material-only compliance)
    materialSpecs: product.materialSpecs,
    
    // Simplified inventory for UI
    inventory: {
      available: product.inventory.available,
      quantity: product.inventory.quantity
    },
    
    // Metadata for UI logic
    metadata: {
      featured: product.metadata.featured,
      bestseller: product.metadata.bestseller,
      newArrival: product.metadata.newArrival,
      tags: product.metadata.tags.filter(tag => 
        // Material-only tags filter
        ['lab-grown', 'moissanite', 'lab-diamond', 'lab-emerald', 'lab-ruby', 'lab-sapphire', 'customizable'].includes(tag)
      )
    },
    
    // Creator attribution (if available)
    creator: product.creator,
    
    // SEO for routing
    seo: {
      slug: product.slug
    }
  }
}

/**
 * Transform multiple ProductListDTO to ProductDisplayDTO array
 * Optimized for batch operations with performance monitoring
 * 
 * @param products Array of ProductListDTO from database
 * @returns Array of ProductDisplayDTO for UI
 */
export function mapToProductDisplayDTOArray(products: ProductListDTO[]): ProductDisplayDTO[] {
  const startTime = Date.now()
  
  const result = products.map(mapToProductDisplayDTO)
  
  const transformTime = Date.now() - startTime
  
  // Performance monitoring (CLAUDE_RULES.md <50ms target for material extraction services)
  if (transformTime > 50 && products.length > 10) {
    console.warn(`Product mapping performance warning: ${transformTime}ms for ${products.length} products (target: <50ms)`)
  }
  
  return result
}

/**
 * Legacy ProductBase to ProductDisplayDTO transformer
 * For backward compatibility during migration phase
 * 
 * @param product Legacy ProductBase object
 * @returns ProductDisplayDTO
 */
export function mapLegacyProductToDisplayDTO(product: any): ProductDisplayDTO {
  return {
    _id: product._id,
    name: product.name,
    description: product.description || '',
    category: product.category,
    subcategory: product.subcategory || 'accessories',
    slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    
    basePrice: product.basePrice,
    originalPrice: product.originalPrice,
    currency: 'USD',
    
    primaryImage: product.images?.primary || '/images/placeholder-product.jpg',
    images: {
      primary: product.images?.primary || '/images/placeholder-product.jpg',
      gallery: product.images?.gallery || []
    },
    
    // Default material specs for legacy products
    materialSpecs: {
      primaryMetal: {
        type: '14k-gold',
        purity: '14K', 
        displayName: '14K Gold'
      }
    },
    
    inventory: {
      available: true,
      isCustomMade: true
    },
    
    metadata: {
      featured: true,
      bestseller: false,
      newArrival: true,
      tags: ['lab-grown', 'customizable'] // Material-only tags
    }
  }
}

/**
 * Validate ProductDisplayDTO structure
 * CLAUDE_RULES.md compliant: TypeScript strict mode validation
 * 
 * @param product Object to validate
 * @returns boolean indicating if valid ProductDisplayDTO
 */
export function validateProductDisplayDTO(product: unknown): product is ProductDisplayDTO {
  if (!product || typeof product !== 'object') return false
  
  const p = product as ProductDisplayDTO
  
  return Boolean(
    p._id &&
    p.name &&
    typeof p.basePrice === 'number' &&
    p.primaryImage &&
    p.images?.primary &&
    Array.isArray(p.images.gallery) &&
    p.materialSpecs?.primaryMetal &&
    typeof p.inventory?.available === 'boolean' &&
    p.metadata &&
    Array.isArray(p.metadata.tags)
  )
}

/**
 * Performance optimized mapper for featured products
 * Specialized for homepage featured products with <50ms target
 * 
 * @param products Featured products from repository
 * @returns Optimized ProductDisplayDTO array
 */
export function mapFeaturedProductsToDisplayDTO(products: ProductListDTO[]): ProductDisplayDTO[] {
  // Limit to reasonable number for homepage performance
  const limitedProducts = products.slice(0, 6)
  
  return mapToProductDisplayDTOArray(limitedProducts)
}