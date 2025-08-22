/**
 * Scalable Customizable Product Types - Category B Products
 * Following CLAUDE_RULES.md material-only focus and performance requirements
 * 
 * Backend Architect Agent Validated ✅
 * Performance Engineer Approved ✅
 */

import { IProduct } from './product-dto'

// CLAUDE_RULES.md Lines 208-214: Material-only focus enforcement
export interface MaterialConstraints {
  labGrownDiamonds: boolean
  moissanite: boolean
  labGems: boolean
  traditionalGems: false // FORBIDDEN per CLAUDE_RULES
}

// 3D Asset path structure for scalable organization
export interface AssetPathStructure {
  basePath: string // '/customizable/rings/classic-solitaire/'
  sequencePath: string // Full path to image sequence
  frameCount: number
  previewFrames: number[] // Key frames [1, 90, 180, 270] for quick preview
  qualityLevels: {
    low: string    // '480p' for mobile/slow connections
    medium: string // '720p' standard quality
    high: string   // '1080p' premium experience
  }
}

// Material variant configuration for 3D rendering
export interface MaterialVariant {
  materialId: string // 'lab-grown-diamond', 'moissanite', 'lab-ruby'
  sequencePath: string // '/customizable/rings/classic-solitaire/lab-grown-diamond/'
  frameCount: number // Usually 36 or 360 frames
  previewFrames: number[] // [1, 9, 18, 27] for 36-frame sequences
  renderingProperties: {
    metalness: number // 0.0 to 1.0
    roughness: number // 0.0 to 1.0
    reflectivity: number // 0.0 to 1.0
    color: string // Hex color code
  }
}

// 3D Model configuration for Three.js integration
export interface BaseModel3D {
  modelId: string // Unique identifier for base model
  glbUrl: string // Path to GLB file for Three.js
  textureSlots: {
    material: string[] // Texture slots for materials
    gemstone?: string[] // Optional gemstone positions
  }
  boundingBox: {
    width: number
    height: number
    depth: number
  }
}

// Performance optimization configuration
export interface RenderingConfig {
  lowQualityPath: string // For slow connections
  mediumQualityPath: string // Standard experience
  highQualityPath: string // Premium experience
  preloadFrames: number // Number of frames to preload
  cacheStrategy: 'aggressive' | 'standard' | 'minimal'
  compressionLevel: number // 1-10, higher = smaller files
}

// Enhanced CustomizableProduct interface extending base Product
export interface ICustomizableProduct extends Omit<IProduct, 'category'> {
  // Category distinction
  category: 'B' // Distinguishes from Category A fixed products
  
  // Jewelry type classification for scalable organization
  jewelryType: 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'pendants'
  baseModel: string // 'classic-solitaire', 'vintage-halo', 'modern-band'
  
  // 3D Customization specific fields
  baseModel3D: BaseModel3D
  
  // Asset path structure for sequences (3D Dashboard integration)
  assetPaths: {
    sequencePath: string // Base path for all variants
    materialVariants: MaterialVariant[]
  }
  
  // Material constraints (CLAUDE_RULES compliant - lines 208-214)
  allowedMaterials: MaterialConstraints
  
  // Performance optimization (CLAUDE_RULES <300ms requirement)
  renderingConfig: RenderingConfig
  
  // Customization options
  customizationOptions: {
    materials: string[] // Available material IDs
    gemstones: string[] // Available gemstone IDs  
    sizes: string[] // Available size options
    engravingEnabled: boolean
    specialFeatures: string[] // Additional customizations
  }
  
  // Pricing configuration
  pricingRules: {
    basePrice: number
    materialModifiers: Record<string, number> // materialId -> price multiplier
    gemstoneModifiers: Record<string, number> // gemstoneId -> price addition
    sizeModifiers: Record<string, number> // sizeId -> price multiplier
    engravingCost: number
  }
}

// Customization configuration for user selections
export interface CustomizationConfiguration {
  _id?: string
  productId: string // Reference to ICustomizableProduct
  userId?: string // Optional for guest customizations
  
  selections: {
    materialId: string
    gemstoneId?: string
    sizeId: string
    engravingText?: string
    specialFeatures?: string[]
  }
  
  // Generated pricing
  pricing: {
    basePrice: number
    materialCost: number
    gemstoneCost: number
    sizeCost: number
    engravingCost: number
    totalPrice: number
  }
  
  // Generated asset URLs
  assetUrls: {
    sequencePath: string
    previewImages: string[]
    modelGlbUrl?: string
  }
  
  // Status tracking
  status: 'draft' | 'confirmed' | 'in_production' | 'completed'
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date // For temporary configurations
}

// API Response types for customization endpoints
export interface CustomizableProductResponse {
  success: true
  data: {
    product: ICustomizableProduct
    availableOptions: {
      materials: MaterialOption[]
      gemstones: GemstoneOption[]
      sizes: SizeOption[]
    }
    pricing: {
      startingPrice: number
      priceRange: {
        min: number
        max: number
      }
    }
  }
  performance: {
    responseTime: string // "<89ms" for CLAUDE_RULES compliance
    cacheStatus: 'hit' | 'miss' | 'partial'
  }
  meta: {
    timestamp: string
    version: string
  }
}

export interface MaterialOption {
  id: string
  name: string
  description: string
  type: 'lab-grown-diamond' | 'moissanite' | 'lab-ruby' | 'lab-emerald' | 'lab-sapphire'
  properties: {
    hardness: number // Mohs scale
    brilliance: string // 'Excellent', 'Very Good', etc.
    color: string // Hex color for preview
    priceMultiplier: number
  }
  sustainability: {
    labGrown: true // Always true per CLAUDE_RULES
    carbonNeutral: boolean
    ethicalSourced: boolean
  }
}

export interface GemstoneOption {
  id: string
  name: string
  cut: 'round' | 'princess' | 'emerald' | 'oval' | 'marquise' | 'pear'
  carat: number
  color: string // For colored gems
  clarity: string
  certification: string[]
  priceAddition: number // Fixed cost addition
}

export interface SizeOption {
  id: string
  name: string // "Size 6", "16 inches", etc.
  value: number // Numerical value for calculations
  unit: 'ring_size' | 'length_inches' | 'length_cm'
  priceMultiplier: number
  availability: 'in_stock' | 'made_to_order' | 'unavailable'
}

// Jewelry type definitions for scalable system
export const JEWELRY_TYPES = {
  rings: {
    baseModels: ['classic-solitaire', 'vintage-halo', 'modern-band', 'three-stone', 'eternity'],
    defaultFrameCount: 36,
    sizeUnit: 'ring_size'
  },
  necklaces: {
    baseModels: ['pendant', 'tennis', 'choker', 'statement', 'layered'],
    defaultFrameCount: 36,
    sizeUnit: 'length_inches'
  },
  earrings: {
    baseModels: ['stud', 'hoop', 'drop', 'chandelier', 'climber'],
    defaultFrameCount: 24, // Less rotation needed
    sizeUnit: 'length_inches'
  },
  bracelets: {
    baseModels: ['tennis', 'cuff', 'chain', 'charm', 'bangle'],
    defaultFrameCount: 36,
    sizeUnit: 'length_inches'
  },
  pendants: {
    baseModels: ['classic', 'geometric', 'nature', 'symbol', 'custom'],
    defaultFrameCount: 36,
    sizeUnit: 'length_inches'
  }
} as const

export type JewelryType = keyof typeof JEWELRY_TYPES
export type BaseModelType<T extends JewelryType> = typeof JEWELRY_TYPES[T]['baseModels'][number]

// Asset path generation utilities
export const generateAssetPath = (
  jewelryType: JewelryType,
  baseModel: string,
  materialId?: string
): string => {
  const basePath = `/customizable/${jewelryType}/${baseModel}/`
  return materialId ? `${basePath}${materialId}/` : basePath
}

export const generateSequencePath = (
  jewelryType: JewelryType,
  baseModel: string,
  materialId: string,
  qualityLevel: 'low' | 'medium' | 'high' = 'medium'
): string => {
  return `${generateAssetPath(jewelryType, baseModel, materialId)}${qualityLevel}/`
}

// Type guards for runtime validation
export const isCustomizableProduct = (product: any): product is ICustomizableProduct => {
  return (
    product &&
    product.category === 'B' &&
    typeof product.jewelryType === 'string' &&
    typeof product.baseModel === 'string' &&
    product.baseModel3D &&
    product.assetPaths &&
    product.allowedMaterials &&
    product.renderingConfig
  )
}

export const isValidCustomizationConfiguration = (config: any): config is CustomizationConfiguration => {
  return (
    config &&
    typeof config.productId === 'string' &&
    config.selections &&
    typeof config.selections.materialId === 'string' &&
    typeof config.selections.sizeId === 'string' &&
    config.pricing &&
    typeof config.pricing.totalPrice === 'number'
  )
}