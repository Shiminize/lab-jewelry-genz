/**
 * Product Catalog Type Definitions
 * Comprehensive schema for GlowGlitch jewelry e-commerce platform
 * Follows PRD specifications for lab-grown diamond jewelry
 */

// Base product category types
export type ProductCategory = 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'jewelry'

export type ProductSubcategory = 
  // Rings
  | 'engagement-rings' | 'wedding-bands' | 'fashion-rings' | 'eternity-rings'
  // Necklaces
  | 'pendants' | 'chains' | 'chokers' | 'statement-necklaces'
  // Earrings
  | 'studs' | 'hoops' | 'drops' | 'climbers'
  // Bracelets
  | 'tennis-bracelets' | 'bangles' | 'chain-bracelets' | 'charm-bracelets'
  // Jewelry & Accessories
  | 'accessories'

// Material specifications
export interface Material {
  id: string
  type: 'gold' | 'silver' | 'platinum' | 'rose-gold' | 'white-gold'
  name: string // e.g., "14K Yellow Gold"
  purity?: string // e.g., "14K", "18K", "925 Sterling"
  priceMultiplier: number
  description: string
  sustainability: {
    recycled: boolean
    ethicallySourced: boolean
    carbonNeutral: boolean
  }
}

// Gemstone specifications
export interface Gemstone {
  id: string
  type: 'diamond' | 'emerald' | 'ruby' | 'sapphire' | 'other'
  isLabGrown: boolean
  carat: number
  color: string // GIA color grade (D-Z) or color name
  clarity: string // GIA clarity grade (FL, IF, VVS1, etc.)
  cut: string // Round, Princess, Emerald, etc.
  certification: {
    agency: 'GIA' | 'IGI' | 'GCAL' | 'Other'
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
  value: string // e.g., "6", "18 inches", "Medium"
  measurement: {
    unit: 'mm' | 'inches' | 'cm'
    value: number
  }
  availability: boolean
  priceAdjustment: number // Additional cost for size
}

// 3D model and media assets
export interface ProductMedia {
  primary: string // Main product image URL
  gallery: string[] // Additional high-res images
  thumbnail: string // Small preview image
  model3D: {
    glb: string // GLB file path for 3D viewer
    textures: string[] // Texture file paths
    animations?: string[] // Animation file paths
  }
  videos?: string[] // Product video URLs
  ar?: {
    usdz: string // iOS AR Quick Look
    glb: string // Android AR
  }
}

// Customization options available for product
export interface CustomizationOptions {
  materials: Material[]
  gemstones?: Gemstone[]
  sizes: SizeOption[]
  engraving: {
    available: boolean
    maxCharacters?: number
    fonts?: string[]
    positions?: string[] // "inside", "outside", "back"
    pricePerCharacter?: number
  }
  personalizations?: {
    birthstones?: boolean
    initials?: boolean
    dates?: boolean
  }
}

// SEO and marketing metadata
export interface ProductSEO {
  slug: string // URL-friendly identifier
  metaTitle: string
  metaDescription: string
  keywords: string[]
  openGraph: {
    title: string
    description: string
    image: string
  }
}

// Inventory tracking
export interface InventoryStatus {
  sku: string // Unique product identifier
  quantity: number
  reserved: number // Items in carts but not purchased
  available: number // Actually available for sale
  lowStockThreshold: number
  restockDate?: Date
  isCustomMade: boolean // Made-to-order vs ready-made
  leadTime?: {
    min: number // Minimum days
    max: number // Maximum days
  }
}

// Pricing structure
export interface ProductPricing {
  basePrice: number // Starting price in USD
  originalPrice?: number // Original price if on sale
  currency: 'USD' | 'CAD' | 'GBP' | 'EUR' | 'AUD'
  priceRange?: {
    min: number
    max: number
  }
  discounts?: {
    type: 'percentage' | 'fixed'
    value: number
    validUntil?: Date
    conditions?: string[] // e.g., "first-time-buyer"
  }
}

// Product quality and certifications
export interface QualityCertifications {
  hallmarks: string[] // Official metal purity marks
  gemCertificates: string[] // GIA, IGI certificate numbers
  sustainabilityCerts: string[] // B-Corp, Carbon Neutral, etc.
  qualityAssurance: {
    warrantyPeriod: number // Years
    returnPolicy: number // Days
    careInstructions: string[]
  }
}

// Creator attribution for creator program
export interface CreatorAttribution {
  creatorId?: string
  collaborationType?: 'design' | 'inspiration' | 'promotion'
  commissionRate?: number
  exclusiveDesign?: boolean
}

// Main product interface
export interface Product {
  _id: string
  name: string
  description: string
  category: ProductCategory
  subcategory: ProductSubcategory
  
  // Pricing and availability
  pricing: ProductPricing
  inventory: InventoryStatus
  
  // Media and 3D assets
  media: ProductMedia
  
  // Customization capabilities
  customization: CustomizationOptions
  
  // Marketing and SEO
  seo: ProductSEO
  
  // Quality and certifications
  certifications: QualityCertifications
  
  // Creator program integration
  creator?: CreatorAttribution
  
  // Product metadata
  metadata: {
    featured: boolean
    bestseller: boolean
    newArrival: boolean
    limitedEdition: boolean
    status: 'active' | 'inactive' | 'discontinued' | 'coming-soon'
    collections?: string[] // "Signature", "Bridal", "Everyday"
    tags: string[] // "sustainable", "minimalist", "vintage"
    difficulty?: 'beginner' | 'intermediate' | 'advanced' // For customization
    sustainabilityImpact?: {
      carbonOffset?: number // kg CO2
      oceanPlasticRemoved?: number // pounds
      treesPlanted?: number
      artisansFunded?: number
    }
  }
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  
  // Analytics (for optimization)
  analytics?: {
    views: number
    customizations: number
    purchases: number
    conversionRate: number
    averageTimeOnPage: number
  }
}

// Product search and filtering types
export interface ProductFilters {
  category?: ProductCategory[]
  subcategory?: ProductSubcategory[]
  priceRange?: {
    min: number
    max: number
  }
  materials?: string[] // Material IDs
  gemstones?: string[] // Gemstone types
  sizes?: string[] // Size IDs
  collections?: string[]
  tags?: string[]
  inStock?: boolean
  onSale?: boolean
  featured?: boolean
  newArrival?: boolean
  customizable?: boolean
}

export interface ProductSearchParams {
  query?: string
  filters?: ProductFilters
  sortBy?: 'price' | 'name' | 'popularity' | 'newest' | 'rating'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ProductSearchResult {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    applied: ProductFilters
    available: {
      categories: { value: ProductCategory; count: number }[]
      priceRange: { min: number; max: number }
      materials: { id: string; name: string; count: number }[]
      // ... other filter options with counts
    }
  }
}

// Product recommendation types
export interface ProductRecommendation {
  type: 'similar' | 'complementary' | 'recently-viewed' | 'trending' | 'personalized'
  products: Product[]
  reason?: string // Why this was recommended
  confidence?: number // 0-1 recommendation confidence
}

// Product review and rating types
export interface ProductReview {
  _id: string
  productId: string
  userId: string
  rating: number // 1-5 stars
  title: string
  content: string
  verified: boolean // Verified purchase
  helpful: number // Helpful votes
  media?: {
    images: string[]
    videos?: string[]
  }
  createdAt: Date
  response?: {
    content: string
    createdAt: Date
    author: 'brand' | 'creator'
  }
}

export interface ProductRating {
  average: number
  count: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

// Export all types for easy importing
export type {
  ProductCategory,
  ProductSubcategory,
  Material,
  Gemstone,
  SizeOption,
  ProductMedia,
  CustomizationOptions,
  ProductSEO,
  InventoryStatus,
  ProductPricing,
  QualityCertifications,
  CreatorAttribution,
  Product,
  ProductFilters,
  ProductSearchParams,
  ProductSearchResult,
  ProductRecommendation,
  ProductReview,
  ProductRating
}