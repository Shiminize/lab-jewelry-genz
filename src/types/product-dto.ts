/**
 * Product Data Transfer Objects (DTOs)
 * Unified type system for product data across all layers
 * Single source of truth following CLAUDE_RULES.md
 */

import { Types } from 'mongoose'

// Base product category types (shared with existing system)
export type ProductCategory = 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'jewelry'

export type ProductSubcategory = 
  | 'engagement-rings' | 'wedding-bands' | 'fashion-rings' | 'eternity-rings'
  | 'pendants' | 'chains' | 'chokers' | 'statement-necklaces'
  | 'studs' | 'hoops' | 'drops' | 'climbers'
  | 'tennis-bracelets' | 'bangles' | 'chain-bracelets' | 'charm-bracelets'
  | 'accessories'

// Unified asset structure (replaces both 'media' and 'images')
export interface ProductAssets {
  primary: string
  gallery: string[]
  thumbnail: string
  model3D?: {
    glb: string
    textures: string[]
    animations?: string[]
  }
  videos?: string[]
  ar?: {
    usdz: string
    glb: string
  }
}

// Simplified pricing for DTOs
export interface ProductPricing {
  basePrice: number
  currency: string
  priceRange?: {
    min: number
    max: number
  }
}

// Simplified inventory for client use
export interface ProductInventory {
  sku: string
  quantity: number
  reserved: number
  available: number
  lowStockThreshold: number
  isCustomMade: boolean
  leadTime?: {
    min: number
    max: number
  }
}

// Material specifications (unified from multiple sources)
export interface MaterialSpec {
  id: string
  type: 'gold' | 'silver' | 'platinum' | 'rose-gold' | 'white-gold'
  name: string
  purity?: string
  priceMultiplier: number
  description: string
  sustainability: {
    recycled: boolean
    ethicallySourced: boolean
    carbonNeutral: boolean
  }
}

// Gemstone specifications (unified)
export interface GemstoneSpec {
  id: string
  type: 'diamond' | 'emerald' | 'ruby' | 'sapphire' | 'other'
  isLabGrown: boolean
  carat: number
  color: string
  clarity: string
  cut: string
  certification?: {
    agency: string
    certificateNumber?: string
  }
  priceMultiplier: number
  sustainability: {
    labGrown: boolean
    conflictFree: boolean
    traceable: boolean
  }
}

// Size specifications
export interface SizeOption {
  id: string
  category: ProductCategory
  value: string
  measurement: {
    unit: 'mm' | 'inches' | 'cm'
    value: number
  }
  availability: boolean
  priceAdjustment: number
}

// Customization options for products
export interface ProductCustomization {
  materials: MaterialSpec[]
  gemstones?: GemstoneSpec[]
  sizes: SizeOption[]
  engraving: {
    available: boolean
    maxCharacters?: number
    fonts?: string[]
    positions?: string[]
    pricePerCharacter?: number
  }
}

// SEO and metadata
export interface ProductSEO {
  slug: string
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  openGraph?: {
    title: string
    description: string
    image: string
  }
}

// Quality and certifications
export interface ProductCertifications {
  hallmarks?: string[]
  gemCertificates?: string[]
  sustainabilityCerts?: string[]
  qualityAssurance?: {
    warrantyPeriod: number
    returnPolicy: number
    careInstructions: string[]
  }
}

// Product metadata for business logic
export interface ProductMetadata {
  featured: boolean
  bestseller: boolean
  newArrival: boolean
  limitedEdition: boolean
  status: 'active' | 'inactive' | 'out-of-stock' | 'discontinued'
  collections: string[]
  tags: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  sustainabilityImpact?: {
    carbonOffset?: number
    oceanPlasticRemoved?: number
    treesPlanted?: number
    artisansFunded?: number
  }
}

// Analytics data (read-only for clients)
export interface ProductAnalytics {
  views: number
  customizations: number
  purchases: number
  conversionRate: number
  averageTimeOnPage: number
}

// Creator attribution
export interface CreatorAttribution {
  creatorId: string
  collaborationType: 'design' | 'marketing' | 'both'
  commissionRate: number
  exclusiveDesign: boolean
  profile?: {
    handle: string
    name: string
    followers: number
    specialty: string
    bio: string
  }
}

/**
 * ProductDTO - Data Transfer Object for API responses
 * This is what clients receive from the API
 */
export interface ProductDTO {
  _id: string
  name: string
  description: string
  category: ProductCategory
  subcategory: ProductSubcategory
  assets: ProductAssets // Unified property name
  pricing: ProductPricing
  inventory: ProductInventory
  customization: ProductCustomization
  seo: ProductSEO
  certifications: ProductCertifications
  metadata: ProductMetadata
  analytics?: ProductAnalytics
  creator?: CreatorAttribution
}

// Material specifications for ProductListDTO (simplified for listings)
export type MetalType = 'silver' | '14k-gold' | '18k-gold' | 'platinum'
export type StoneType = 'lab-diamond' | 'moissanite' | 'lab-emerald' | 'lab-ruby' | 'lab-sapphire'

export interface ProductListMaterialSpecs {
  primaryMetal: {
    type: MetalType
    purity: string // "925", "14K", "18K", "PLAT"
    displayName: string // "925 Silver", "14K Gold"
  }
  primaryStone?: {
    type: StoneType
    carat: number
    displayName: string // "1.5CT Lab Diamond"
  }
}

/**
 * ProductListDTO - Simplified DTO for product listings
 * Used in catalog/search results for performance
 */
export interface ProductListDTO {
  _id: string
  name: string
  description: string
  category: ProductCategory
  subcategory: ProductSubcategory
  slug: string // SEO-friendly URL slug for navigation
  primaryImage: string // Direct access to primary image
  pricing: {
    basePrice: number
    currency: string
  }
  inventory: {
    available: boolean
    quantity?: number
  }
  metadata: {
    featured: boolean
    bestseller: boolean
    newArrival: boolean
    tags: string[]
  }
  materialSpecs: ProductListMaterialSpecs
  creator?: {
    handle: string
    name: string
  }
}

/**
 * ProductCreateDTO - DTO for creating new products
 * Used in admin panel and API endpoints
 */
export interface ProductCreateDTO {
  name: string
  description: string
  category: ProductCategory
  subcategory: ProductSubcategory
  basePrice: number
  images: {
    primary: string
    gallery?: string[]
    thumbnail?: string
  }
  materials?: string[]
  gemstones?: Partial<GemstoneSpec>[]
  customizable?: boolean
  featured?: boolean
  tags?: string[]
}

/**
 * ProductUpdateDTO - DTO for updating products
 * All fields optional for partial updates
 */
export interface ProductUpdateDTO extends Partial<ProductCreateDTO> {
  _id?: string
  metadata?: Partial<ProductMetadata>
  inventory?: Partial<ProductInventory>
}

/**
 * Product Search Parameters
 */
export interface ProductSearchParams {
  query?: string
  page?: number
  limit?: number
  sortBy?: 'popularity' | 'price' | 'name' | 'newest'
  sortOrder?: 'asc' | 'desc'
  filters?: {
    category?: ProductCategory[]
    subcategory?: ProductSubcategory[]
    priceRange?: {
      min?: number
      max?: number
    }
    // Enhanced material filtering
    metals?: MetalType[]
    stones?: StoneType[]
    caratRange?: {
      min?: number
      max?: number
    }
    materialTags?: string[]
    // Legacy filters (backward compatibility)
    materials?: string[]
    gemstones?: string[]
    tags?: string[]
    inStock?: boolean
    featured?: boolean
    sizes?: string[]
    collections?: string[]
    onSale?: boolean
    newArrival?: boolean
    customizable?: boolean
    creatorExclusive?: boolean
    creatorTier?: string
  }
}

/**
 * Product Search Result
 */
export interface ProductSearchResult {
  products: ProductListDTO[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    applied: ProductSearchParams['filters']
    available: {
      categories: ProductCategory[]
      priceRange: {
        min: number
        max: number
      }
      materials: string[]
    }
  }
}

/**
 * Type guards for runtime validation
 */
export const isProductDTO = (obj: any): obj is ProductDTO => {
  return Boolean(
    obj && 
    typeof obj._id === 'string' &&
    typeof obj.name === 'string' &&
    obj.assets && 
    typeof obj.assets.primary === 'string'
  )
}

export const isValidMetalType = (type: any): type is MetalType => {
  return typeof type === 'string' && ['silver', '14k-gold', '18k-gold', 'platinum'].includes(type)
}

export const isValidStoneType = (type: any): type is StoneType => {
  return typeof type === 'string' && ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire'].includes(type)
}

export const isValidMaterialSpecs = (obj: any): obj is ProductListMaterialSpecs => {
  return Boolean(
    obj &&
    obj.primaryMetal &&
    isValidMetalType(obj.primaryMetal.type) &&
    typeof obj.primaryMetal.purity === 'string' &&
    typeof obj.primaryMetal.displayName === 'string' &&
    (obj.primaryStone === undefined || (
      obj.primaryStone &&
      isValidStoneType(obj.primaryStone.type) &&
      typeof obj.primaryStone.carat === 'number' &&
      typeof obj.primaryStone.displayName === 'string'
    ))
  )
}

export const isProductListDTO = (obj: any): obj is ProductListDTO => {
  return Boolean(
    obj &&
    typeof obj._id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.primaryImage === 'string' &&
    isValidMaterialSpecs(obj.materialSpecs)
  )
}

/**
 * Helper functions for creating material specifications
 * 
 * Examples:
 * ```typescript
 * // Silver ring with moissanite
 * const specs1 = createMaterialSpecs('silver', { type: 'moissanite', carat: 1.5 })
 * 
 * // 18K gold necklace without stones
 * const specs2 = createMaterialSpecs('18k-gold')
 * 
 * // Platinum engagement ring with lab diamond
 * const specs3 = createMaterialSpecs('platinum', { type: 'lab-diamond', carat: 2.0 })
 * ```
 */
export const createMetalSpec = (type: MetalType): ProductListMaterialSpecs['primaryMetal'] => {
  const metalSpecs: Record<MetalType, { purity: string; displayName: string }> = {
    'silver': { purity: '925', displayName: '925 Silver' },
    '14k-gold': { purity: '14K', displayName: '14K Gold' },
    '18k-gold': { purity: '18K', displayName: '18K Gold' },
    'platinum': { purity: 'PLAT', displayName: 'Platinum' }
  }
  
  return {
    type,
    ...metalSpecs[type]
  }
}

export const createStoneSpec = (type: StoneType, carat: number): ProductListMaterialSpecs['primaryStone'] => {
  const stoneNames: Record<StoneType, string> = {
    'lab-diamond': 'Lab Diamond',
    'moissanite': 'Moissanite',
    'lab-emerald': 'Lab Emerald',
    'lab-ruby': 'Lab Ruby',
    'lab-sapphire': 'Lab Sapphire'
  }
  
  return {
    type,
    carat,
    displayName: `${carat}CT ${stoneNames[type]}`
  }
}

export const createMaterialSpecs = (
  metalType: MetalType,
  stone?: { type: StoneType; carat: number }
): ProductListMaterialSpecs => {
  return {
    primaryMetal: createMetalSpec(metalType),
    primaryStone: stone ? createStoneSpec(stone.type, stone.carat) : undefined
  }
}

/**
 * ProductDisplayDTO - Unified Interface for UI Components
 * Eliminates ProductBase vs ProductListDTO conflicts
 * CLAUDE_RULES.md compliant: Material-only focus, TypeScript strict mode
 * 
 * This interface serves as the single source of truth for all UI components,
 * ensuring consistent data structure and eliminating runtime type errors.
 */
export interface ProductDisplayDTO {
  // Core identification
  _id: string
  name: string
  description: string
  category: ProductCategory
  subcategory: ProductSubcategory
  slug: string
  
  // Pricing (unified structure)
  basePrice: number
  originalPrice?: number // For displaying discounts
  currency: string
  
  // Images (unified structure compatible with both systems)
  primaryImage: string
  images: {
    primary: string
    gallery: string[]
  }
  
  // Material specifications (CLAUDE_RULES.md material-only compliance)
  materialSpecs: ProductListMaterialSpecs
  
  // Inventory status (simplified for UI)
  inventory: {
    available: boolean
    quantity?: number
    isCustomMade?: boolean
  }
  
  // Metadata for UI logic
  metadata: {
    featured: boolean
    bestseller: boolean
    newArrival: boolean
    tags: string[] // Material-only tags only
  }
  
  // Creator attribution (if applicable)
  creator?: {
    handle: string
    name: string
  }
  
  // SEO and routing
  seo?: {
    slug: string
    metaTitle?: string
    metaDescription?: string
  }
}

/**
 * Type guard for ProductDisplayDTO
 * CLAUDE_RULES.md compliant: TypeScript strict mode, no any types
 */
export const isProductDisplayDTO = (obj: unknown): obj is ProductDisplayDTO => {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    typeof (obj as ProductDisplayDTO)._id === 'string' &&
    typeof (obj as ProductDisplayDTO).name === 'string' &&
    typeof (obj as ProductDisplayDTO).basePrice === 'number' &&
    typeof (obj as ProductDisplayDTO).primaryImage === 'string' &&
    (obj as ProductDisplayDTO).images &&
    typeof (obj as ProductDisplayDTO).images.primary === 'string' &&
    Array.isArray((obj as ProductDisplayDTO).images.gallery) &&
    (obj as ProductDisplayDTO).materialSpecs &&
    isValidMaterialSpecs((obj as ProductDisplayDTO).materialSpecs)
  )
}

/**
 * Helper function to transform ProductListDTO to ProductDisplayDTO
 * Server-side only transformation following CLAUDE_RULES.md patterns
 */
export const transformToProductDisplayDTO = (product: ProductListDTO): ProductDisplayDTO => {
  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    slug: product.slug,
    basePrice: product.pricing.basePrice,
    currency: product.pricing.currency,
    primaryImage: product.primaryImage,
    images: {
      primary: product.primaryImage,
      gallery: [product.primaryImage] // Fallback to primary if gallery not available
    },
    materialSpecs: product.materialSpecs,
    inventory: {
      available: product.inventory.available,
      quantity: product.inventory.quantity
    },
    metadata: {
      featured: product.metadata.featured,
      bestseller: product.metadata.bestseller,
      newArrival: product.metadata.newArrival,
      tags: product.metadata.tags
    },
    creator: product.creator,
    seo: {
      slug: product.slug
    }
  }
}

/**
 * Helper function to transform legacy ProductBase to ProductDisplayDTO
 * For backward compatibility during migration
 */
export const transformProductBaseToDisplayDTO = (product: any): ProductDisplayDTO => {
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
    materialSpecs: {
      primaryMetal: {
        type: '14k-gold' as MetalType,
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
      tags: ['lab-grown', 'customizable']
    }
  }
}