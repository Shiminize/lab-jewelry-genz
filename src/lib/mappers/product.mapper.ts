/**
 * Product Mapper Functions
 * Transforms between MongoDB documents, internal types, and DTOs
 * Ensures type safety and consistency across all layers
 */

import { 
  ProductDTO, 
  ProductListDTO, 
  ProductAssets,
  ProductPricing,
  ProductInventory,
  ProductCustomization,
  MaterialSpec,
  GemstoneSpec,
  SizeOption,
  ProductSEO,
  ProductCertifications,
  ProductMetadata,
  ProductAnalytics,
  CreatorAttribution,
  ProductListMaterialSpecs,
  MetalType,
  StoneType,
  createMaterialSpecs
} from '@/types/product-dto'
import { Product } from '@/types/product'

/**
 * Maps a full Product document to ProductDTO
 * Handles the transformation from 'media' to 'assets'
 */
export function mapProductToDTO(product: any): ProductDTO {
  // Handle both 'media' and 'images' properties for backwards compatibility
  const assets = mapToAssets(product)
  
  return {
    _id: product._id?.toString() || product.id || '',
    name: product.name || '',
    description: product.description || '',
    category: product.category || 'jewelry',
    subcategory: product.subcategory || 'accessories',
    assets,
    pricing: mapToPricing(product),
    inventory: mapToInventory(product),
    customization: mapToCustomization(product),
    seo: mapToSEO(product),
    certifications: mapToCertifications(product),
    metadata: mapToMetadata(product),
    analytics: product.analytics ? mapToAnalytics(product.analytics) : undefined,
    creator: product.creator ? mapToCreator(product.creator) : undefined
  }
}

/**
 * Maps a Product to simplified ProductListDTO for catalog views
 * Optimized for performance with minimal data and enhanced material filtering
 */
export function mapProductToListDTO(product: any): ProductListDTO {
  // Get primary image from either media or images property
  const primaryImage = getPrimaryImage(product)
  
  return {
    _id: product._id?.toString() || product.id || '',
    name: product.name || '',
    description: product.description || '',
    category: product.category || 'jewelry',
    subcategory: product.subcategory || 'accessories',
    slug: product.seo?.slug || generateSlug(product.name),
    primaryImage,
    pricing: {
      basePrice: product.pricing?.basePrice || product.basePrice || 0,
      currency: product.pricing?.currency || product.currency || 'USD'
    },
    inventory: {
      available: isProductAvailable(product),
      quantity: product.inventory?.available || product.inventory?.quantity
    },
    metadata: {
      featured: product.metadata?.featured || false,
      bestseller: product.metadata?.bestseller || false,
      newArrival: product.metadata?.newArrival || false,
      tags: prioritizeTags(product, 3)
    },
    materialSpecs: generateMaterialSpecs(product),
    creator: product.creator?.profile ? {
      handle: product.creator.profile.handle,
      name: product.creator.profile.name
    } : undefined
  }
}

/**
 * Helper function to map assets from various source formats
 */
function mapToAssets(product: any): ProductAssets {
  // Check for 'media' property (new format)
  if (product.media) {
    return {
      primary: product.media.primary || '/images/placeholder-product.jpg',
      gallery: product.media.gallery || [],
      thumbnail: product.media.thumbnail || product.media.primary || '/images/placeholder-product.jpg',
      model3D: product.media.model3D,
      videos: product.media.videos,
      ar: product.media.ar
    }
  }
  
  // Check for 'images' property (MongoDB format)
  if (product.images) {
    // Handle array format (MongoDB schema)
    if (Array.isArray(product.images)) {
      const primaryImage = product.images.find((img: any) => img.isPrimary) || product.images[0]
      return {
        primary: primaryImage?.url || '/images/placeholder-product.jpg',
        gallery: product.images.map((img: any) => img.url),
        thumbnail: primaryImage?.url || '/images/placeholder-product.jpg',
        model3D: product.assets3D ? {
          glb: product.assets3D[0]?.modelUrl,
          textures: product.assets3D[0]?.textureUrls || []
        } : undefined
      }
    }
    
    // Handle object format (seed data)
    return {
      primary: product.images.primary || '/images/placeholder-product.jpg',
      gallery: product.images.gallery || [],
      thumbnail: product.images.thumbnail || product.images.primary || '/images/placeholder-product.jpg',
      model3D: product.images.model3D
    }
  }
  
  // Fallback
  return {
    primary: '/images/placeholder-product.jpg',
    gallery: [],
    thumbnail: '/images/placeholder-product.jpg'
  }
}

/**
 * Helper function to get primary image from various formats
 */
function getPrimaryImage(product: any): string {
  // Try media.primary
  if (product.media?.primary) {
    return product.media.primary
  }
  
  // Try images array (MongoDB)
  if (Array.isArray(product.images)) {
    const primary = product.images.find((img: any) => img.isPrimary)
    if (primary?.url) return primary.url
    if (product.images[0]?.url) return product.images[0].url
  }
  
  // Try images object
  if (product.images?.primary) {
    return product.images.primary
  }
  
  // Fallback
  return '/images/placeholder-product.jpg'
}

/**
 * Maps pricing data
 */
function mapToPricing(product: any): ProductPricing {
  return {
    basePrice: product.pricing?.basePrice || product.basePrice || 0,
    currency: product.pricing?.currency || product.currency || 'USD',
    priceRange: product.pricing?.priceRange || {
      min: product.minPrice || product.basePrice || 0,
      max: product.maxPrice || (product.basePrice || 0) * 2
    }
  }
}

/**
 * Maps inventory data
 */
function mapToInventory(product: any): ProductInventory {
  // Handle both nested and flat inventory structures
  const inventory = product.inventory || {}
  
  return {
    sku: inventory.sku || product.sku || generateSKU(product),
    quantity: inventory.quantity || inventory.available || 100,
    reserved: inventory.reserved || 0,
    available: inventory.available || inventory.quantity || 100,
    lowStockThreshold: inventory.lowStockThreshold || 10,
    isCustomMade: inventory.isCustomMade !== undefined ? inventory.isCustomMade : true,
    leadTime: inventory.leadTime || { min: 7, max: 14 }
  }
}

/**
 * Maps customization options
 */
function mapToCustomization(product: any): ProductCustomization {
  const customization = product.customization || {}
  
  return {
    materials: customization.materials || [],
    gemstones: customization.gemstones,
    sizes: customization.sizes || [],
    engraving: customization.engraving || {
      available: false
    }
  }
}

/**
 * Maps SEO data
 */
function mapToSEO(product: any): ProductSEO {
  const seo = product.seo || {}
  
  return {
    slug: seo.slug || generateSlug(product.name),
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    keywords: seo.keywords || [],
    openGraph: seo.openGraph
  }
}

/**
 * Maps certifications
 */
function mapToCertifications(product: any): ProductCertifications {
  const certifications = product.certifications || {}
  
  return {
    hallmarks: certifications.hallmarks,
    gemCertificates: certifications.gemCertificates,
    sustainabilityCerts: certifications.sustainabilityCerts,
    qualityAssurance: certifications.qualityAssurance
  }
}

/**
 * Maps metadata
 */
function mapToMetadata(product: any): ProductMetadata {
  const metadata = product.metadata || {}
  
  return {
    featured: metadata.featured || false,
    bestseller: metadata.bestseller || false,
    newArrival: metadata.newArrival || false,
    limitedEdition: metadata.limitedEdition || false,
    status: metadata.status || 'active',
    collections: metadata.collections || [],
    tags: metadata.tags || [],
    difficulty: metadata.difficulty,
    sustainabilityImpact: metadata.sustainabilityImpact
  }
}

/**
 * Maps analytics data
 */
function mapToAnalytics(analytics: any): ProductAnalytics {
  return {
    views: analytics.views || 0,
    customizations: analytics.customizations || 0,
    purchases: analytics.purchases || 0,
    conversionRate: analytics.conversionRate || 0,
    averageTimeOnPage: analytics.averageTimeOnPage || 0
  }
}

/**
 * Maps creator attribution
 */
function mapToCreator(creator: any): CreatorAttribution {
  return {
    creatorId: creator.creatorId || '',
    collaborationType: creator.collaborationType || 'design',
    commissionRate: creator.commissionRate || 0.3,
    exclusiveDesign: creator.exclusiveDesign || false,
    profile: creator.profile
  }
}

/**
 * Prioritizes and limits tags for list display
 * Shows business tags (featured, bestseller) and sustainability tags first
 */
function prioritizeTags(product: any, limit: number = 3): string[] {
  const allTags = product.metadata?.tags || product.tags || []
  if (!Array.isArray(allTags) || allTags.length === 0) return []
  
  // Define priority order
  const businessTags = ['featured', 'bestseller', 'new-arrival', 'limited-edition']
  const sustainabilityTags = ['eco-friendly', 'recycled', 'lab-grown', 'ethical', 'sustainable']
  const categoryTags = ['rings', 'necklaces', 'earrings', 'bracelets']
  
  const prioritized: string[] = []
  const remaining: string[] = []
  
  // First, add business tags
  allTags.forEach(tag => {
    const lowerTag = tag.toLowerCase()
    if (businessTags.includes(lowerTag)) {
      prioritized.push(tag)
    } else if (sustainabilityTags.includes(lowerTag)) {
      prioritized.push(tag)
    } else if (!categoryTags.includes(lowerTag)) {
      // Skip basic category tags, add others to remaining
      remaining.push(tag)
    }
  })
  
  // Add remaining tags if we have space
  const available = limit - prioritized.length
  if (available > 0) {
    prioritized.push(...remaining.slice(0, available))
  }
  
  return prioritized.slice(0, limit)
}

/**
 * Checks if product is available
 */
function isProductAvailable(product: any): boolean {
  // Check inventory
  if (product.inventory) {
    const available = product.inventory.available || product.inventory.quantity || 0
    const reserved = product.inventory.reserved || 0
    if (available - reserved <= 0) return false
  }
  
  // Check status
  if (product.metadata?.status && product.metadata.status !== 'active') {
    return false
  }
  
  return true
}

/**
 * Generates a SKU from product data
 */
function generateSKU(product: any): string {
  const category = (product.category || 'GEN').substring(0, 3).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `GG-${category}-${random}`
}

/**
 * Generates a URL-friendly slug
 */
function generateSlug(name?: string): string {
  if (!name) return ''
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Generates material specifications from product data
 * CLAUDE_RULES compliant: Uses pre-computed materialSpecs from migration
 */
function generateMaterialSpecs(product: any): ProductListMaterialSpecs {
  // Priority 1: Use pre-computed materialSpecs (post-migration)
  if (product.materialSpecs) {
    return product.materialSpecs
  }
  
  // Priority 2: Fallback to legacy extraction (for backward compatibility)
  const primaryMetal = extractPrimaryMetal(product)
  const primaryStone = extractPrimaryStone(product)
  
  return createMaterialSpecs(primaryMetal, primaryStone)
}

/**
 * Extracts primary metal type from product data
 */
function extractPrimaryMetal(product: any): MetalType {
  // Check customization materials first
  if (product.customization?.materials?.length > 0) {
    const material = product.customization.materials[0]
    return mapToStandardMetalType(material.type || material.id)
  }
  
  // Check materials array (MongoDB format)
  if (product.materials?.length > 0) {
    return mapToStandardMetalType(product.materials[0])
  }
  
  // Check legacy format
  if (product.material) {
    return mapToStandardMetalType(product.material)
  }
  
  // Default fallback based on category
  return getDefaultMetalForCategory(product.category)
}

/**
 * Extracts primary stone from product data
 * CLAUDE_RULES fix: Proper carat extraction without fallback
 */
function extractPrimaryStone(product: any): { type: StoneType; carat: number } | undefined {
  // Check customization gemstones first
  if (product.customization?.gemstones?.length > 0) {
    const gemstone = product.customization.gemstones[0]
    const stoneType = mapToStandardStoneType(gemstone.type, gemstone.isLabGrown)
    
    // CRITICAL FIX: Only return if we have valid carat data
    if (stoneType && gemstone.carat && gemstone.carat > 0) {
      return {
        type: stoneType,
        carat: gemstone.carat
      }
    }
  }
  
  // Check gemstones array (MongoDB format)
  if (product.gemstones?.length > 0) {
    const gemstone = product.gemstones[0]
    const stoneType = mapToStandardStoneType(gemstone.type, gemstone.isLabGrown)
    if (stoneType) {
      return {
        type: stoneType,
        carat: gemstone.carat || 1.0
      }
    }
  }
  
  return undefined
}

/**
 * Maps various metal naming conventions to standard MetalType
 */
function mapToStandardMetalType(metalValue: string): MetalType {
  if (!metalValue || typeof metalValue !== 'string') return 'silver'
  
  const metal = metalValue.toLowerCase()
  
  // Direct mapping
  if (['silver', '14k-gold', '18k-gold', 'platinum'].includes(metal)) {
    return metal as MetalType
  }
  
  // Handle various naming conventions
  if (metal.includes('silver') || metal.includes('925')) return 'silver'
  if (metal.includes('14k') || metal.includes('14-k')) return '14k-gold'
  if (metal.includes('18k') || metal.includes('18-k')) return '18k-gold'
  if (metal.includes('platinum') || metal.includes('plat')) return 'platinum'
  if (metal.includes('gold')) return '14k-gold' // Default gold type
  
  return 'silver' // Safe fallback
}

/**
 * Maps various stone naming conventions to standard StoneType
 * Now supports composite logic for type + isLabGrown properties
 */
function mapToStandardStoneType(stoneValue: string, isLabGrown?: boolean): StoneType | null {
  if (!stoneValue || typeof stoneValue !== 'string') return null
  
  const stone = stoneValue.toLowerCase()
  
  // Direct mapping (existing logic preserved)
  if (['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire'].includes(stone)) {
    return stone as StoneType
  }
  
  // Composite logic: handle type + isLabGrown properties (seed data format)
  if (isLabGrown === true) {
    if (stone.includes('diamond')) return 'lab-diamond'
    if (stone.includes('emerald')) return 'lab-emerald'
    if (stone.includes('ruby')) return 'lab-ruby'
    if (stone.includes('sapphire')) return 'lab-sapphire'
    // Handle "other" type which is often moissanite in our seed data
    if (stone === 'other') return 'moissanite'
  }
  
  // Handle various naming conventions (existing logic preserved)
  if (stone.includes('diamond') && stone.includes('lab')) return 'lab-diamond'
  if (stone.includes('moissanite') || stone.includes('silicon')) return 'moissanite'
  if (stone.includes('emerald') && stone.includes('lab')) return 'lab-emerald'
  if (stone.includes('ruby') && stone.includes('lab')) return 'lab-ruby'
  if (stone.includes('sapphire') && stone.includes('lab')) return 'lab-sapphire'
  
  return null
}

/**
 * Returns default metal type based on product category
 */
function getDefaultMetalForCategory(category: string): MetalType {
  if (!category) return 'silver'
  
  const cat = category.toLowerCase()
  
  // Engagement rings typically use precious metals
  if (cat.includes('ring') || cat.includes('engagement')) return '14k-gold'
  if (cat.includes('necklace') || cat.includes('pendant')) return 'silver'
  if (cat.includes('earring')) return 'silver'
  if (cat.includes('bracelet')) return 'silver'
  
  return 'silver' // Safe default
}

/**
 * Maps an array of products to DTOs
 */
export function mapProductArrayToDTO(products: any[]): ProductDTO[] {
  return products.map(mapProductToDTO)
}

/**
 * Maps an array of products to list DTOs
 */
export function mapProductArrayToListDTO(products: any[]): ProductListDTO[] {
  return products.map(mapProductToListDTO)
}