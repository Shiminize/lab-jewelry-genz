/**
 * Product Data Processor
 * Transforms seed product data into 3D customizer format
 * CLAUDE_RULES.md compliant data transformation utilities
 */

import { ProductCustomization, Material, StoneQuality } from '@/lib/schemas/product-customization'

// Material mapping from seed data to 3D properties
const MATERIAL_3D_PROPERTIES = {
  'Recycled Sterling Silver': {
    color: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.1
  },
  'Recycled 14k Gold': {
    color: '#FFD700',
    metalness: 0.8,
    roughness: 0.15
  },
  'Sterling Silver': {
    color: '#C0C0C0',
    metalness: 0.9,
    roughness: 0.1
  },
  '14k Recycled Gold': {
    color: '#FFD700',
    metalness: 0.8,
    roughness: 0.15
  },
  'Rose Gold': {
    color: '#E8B4A4',
    metalness: 0.8,
    roughness: 0.12
  },
  'White Gold': {
    color: '#F5F5F5',
    metalness: 0.85,
    roughness: 0.08
  },
  'Titanium': {
    color: '#B8B8B8',
    metalness: 0.7,
    roughness: 0.25
  },
  'Eco-friendly Ceramic': {
    color: '#FFFFFF',
    metalness: 0.0,
    roughness: 0.05
  }
} as const

// Material price multipliers (base = 1.0)
const MATERIAL_PRICE_MULTIPLIERS = {
  'Recycled Sterling Silver': 1.0,
  'Sterling Silver': 1.0,
  'Recycled 14k Gold': 1.8,
  '14k Recycled Gold': 1.8,
  'Rose Gold': 1.9,
  'White Gold': 2.1,
  'Lab-grown Diamond Accent': 2.5,
  'Titanium': 0.8,
  'Eco-friendly Ceramic': 0.6
} as const

// Stone quality properties
const STONE_3D_PROPERTIES = {
  'Lab-created diamonds': {
    sparkle: 1.0,
    clarity: 'VVS',
    color: 'D-F'
  },
  'Lab diamonds': {
    sparkle: 1.0,
    clarity: 'VVS',
    color: 'D-F'
  },
  'Moissanite': {
    sparkle: 1.2,
    clarity: 'VVS',
    color: 'Colorless'
  },
  'Colored lab sapphires': {
    sparkle: 0.8,
    clarity: 'VS',
    color: 'Various'
  },
  'Recycled gemstones': {
    sparkle: 0.9,
    clarity: 'VS-SI',
    color: 'Various'
  },
  'Birthstones': {
    sparkle: 0.7,
    clarity: 'SI',
    color: 'Month-specific'
  }
} as const

// Stone price multipliers
const STONE_PRICE_MULTIPLIERS = {
  'None': 1.0,
  'Lab-created diamonds': 1.4,
  'Lab diamonds': 1.4,
  'Moissanite': 1.2,
  'Colored lab sapphires': 1.3,
  'Recycled gemstones': 1.1,
  'Birthstones': 1.15,
  'No stones': 1.0
} as const

// Standard ring sizes
const RING_SIZES = [
  { id: 'size-3', name: 'Size 3', value: 3, isHalfSize: false },
  { id: 'size-3.5', name: 'Size 3.5', value: 3.5, isHalfSize: true },
  { id: 'size-4', name: 'Size 4', value: 4, isHalfSize: false },
  { id: 'size-4.5', name: 'Size 4.5', value: 4.5, isHalfSize: true },
  { id: 'size-5', name: 'Size 5', value: 5, isHalfSize: false },
  { id: 'size-5.5', name: 'Size 5.5', value: 5.5, isHalfSize: true },
  { id: 'size-6', name: 'Size 6', value: 6, isHalfSize: false },
  { id: 'size-6.5', name: 'Size 6.5', value: 6.5, isHalfSize: true },
  { id: 'size-7', name: 'Size 7', value: 7, isHalfSize: false },
  { id: 'size-7.5', name: 'Size 7.5', value: 7.5, isHalfSize: true },
  { id: 'size-8', name: 'Size 8', value: 8, isHalfSize: false },
  { id: 'size-8.5', name: 'Size 8.5', value: 8.5, isHalfSize: true },
  { id: 'size-9', name: 'Size 9', value: 9, isHalfSize: false },
  { id: 'size-9.5', name: 'Size 9.5', value: 9.5, isHalfSize: true },
  { id: 'size-10', name: 'Size 10', value: 10, isHalfSize: false },
  { id: 'size-10.5', name: 'Size 10.5', value: 10.5, isHalfSize: true },
  { id: 'size-11', name: 'Size 11', value: 11, isHalfSize: false },
  { id: 'size-11.5', name: 'Size 11.5', value: 11.5, isHalfSize: true },
  { id: 'size-12', name: 'Size 12', value: 12, isHalfSize: false },
  { id: 'size-12.5', name: 'Size 12.5', value: 12.5, isHalfSize: true },
  { id: 'size-13', name: 'Size 13', value: 13, isHalfSize: false }
]

/**
 * Transform seed product data into 3D customizer format
 */
export function processProductForCustomizer(seedProduct: any): ProductCustomization {
  // Process available materials
  const availableMaterials: Material[] = (seedProduct.customization?.materials || []).map((materialName: string, index: number) => {
    const properties = MATERIAL_3D_PROPERTIES[materialName as keyof typeof MATERIAL_3D_PROPERTIES]
    const priceMultiplier = MATERIAL_PRICE_MULTIPLIERS[materialName as keyof typeof MATERIAL_PRICE_MULTIPLIERS] || 1.0

    return {
      id: `material-${index}`,
      name: materialName,
      priceMultiplier,
      description: getSustainabilityMessage(materialName),
      sustainability: seedProduct.sustainability?.materials || '',
      properties: properties ? {
        metalness: properties.metalness,
        roughness: properties.roughness,
        color: properties.color
      } : undefined
    }
  })

  // Process available stones
  const availableStones: StoneQuality[] = (seedProduct.customization?.stone_options || []).map((stoneName: string, index: number) => {
    const properties = STONE_3D_PROPERTIES[stoneName as keyof typeof STONE_3D_PROPERTIES]
    const priceMultiplier = STONE_PRICE_MULTIPLIERS[stoneName as keyof typeof STONE_PRICE_MULTIPLIERS] || 1.0

    return {
      id: `stone-${index}`,
      name: stoneName === 'None' ? 'No Stone' : stoneName,
      priceMultiplier,
      description: getStoneDescription(stoneName),
      certification: stoneName.includes('Lab') ? 'IGI Certified' : undefined,
      properties: properties ? {
        clarity: properties.clarity,
        color: properties.color,
        sparkle: properties.sparkle
      } : undefined
    }
  })

  // Filter sizes based on product availability
  const productSizeRange = seedProduct.customization?.sizes || 'US 4-12 (including half sizes)'
  const availableSizes = filterSizesByRange(productSizeRange)

  // Calculate pricing structure
  const materialUpgrades: Record<string, number> = {}
  const stoneUpgrades: Record<string, number> = {}
  
  availableMaterials.forEach((material) => {
    materialUpgrades[material.id] = Math.round(seedProduct.base_price * (material.priceMultiplier - 1))
  })
  
  availableStones.forEach((stone) => {
    stoneUpgrades[stone.id] = Math.round(seedProduct.base_price * (stone.priceMultiplier - 1))
  })

  return {
    product: {
      id: seedProduct.id,
      name: seedProduct.name,
      description: seedProduct.description,
      category: seedProduct.category,
      basePrice: seedProduct.base_price,
      originalPrice: seedProduct.original_price,
      keyFeatures: seedProduct.key_features || [],
      socialAppeal: seedProduct.social_appeal,
      targetEmotion: seedProduct.target_emotion,
      modelPath: '/Ringmodel.glb' // Use the available model for all products
    },
    availableMaterials,
    availableStones,
    availableSizes,
    sustainability: {
      materials: seedProduct.sustainability?.materials,
      packaging: seedProduct.sustainability?.packaging,
      carbonNeutral: seedProduct.sustainability?.carbon_neutral,
      certifications: seedProduct.sustainability?.certifications
    },
    pricing: {
      basePrice: seedProduct.base_price,
      materialUpgrades,
      stoneUpgrades,
      engravingCost: 75, // Standard engraving cost
      specialOptionsCosts: {}
    },
    metadata: {
      category: seedProduct.category,
      tags: seedProduct.key_features,
      genZAppeal: seedProduct.social_appeal,
      instagramability: seedProduct.social_appeal
    }
  }
}

/**
 * Get sustainability messaging for materials
 */
function getSustainabilityMessage(materialName: string): string {
  if (materialName.includes('Recycled')) {
    return 'Made from 100% recycled metals, reducing mining waste by 95%'
  }
  if (materialName.includes('Lab-grown')) {
    return 'Ethically created in controlled environments with minimal environmental impact'
  }
  if (materialName.includes('Eco-friendly')) {
    return 'Sustainable materials with zero conflict sourcing'
  }
  return 'Responsibly sourced with ethical supply chain practices'
}

/**
 * Get stone description with Gen Z appeal
 */
function getStoneDescription(stoneName: string): string {
  switch (stoneName) {
    case 'Lab-created diamonds':
    case 'Lab diamonds':
      return 'Chemically identical to mined diamonds but created ethically in weeks, not centuries'
    case 'Moissanite':
      return 'More brilliant than diamonds with rainbow fire that catches every light'
    case 'Colored lab sapphires':
      return 'Vibrant lab-created sapphires in your favorite colors'
    case 'Recycled gemstones':
      return 'Vintage stones with stories, given new life in your design'
    case 'Birthstones':
      return 'Your personal stone with meaning that goes beyond beauty'
    case 'None':
      return 'Clean minimalist design focused on metal craftsmanship'
    default:
      return 'Beautiful stone option for your custom design'
  }
}

/**
 * Filter available sizes based on product size range
 */
function filterSizesByRange(sizeRange: string) {
  // Parse size range like "US 4-12 (including half sizes)"
  const match = sizeRange.match(/US (\d+(?:\.\d)?)-(\d+(?:\.\d)?)/)
  
  if (!match) {
    return RING_SIZES // Return all sizes if can't parse
  }
  
  const minSize = parseFloat(match[1])
  const maxSize = parseFloat(match[2])
  const includeHalfSizes = sizeRange.includes('half sizes') || sizeRange.includes('quarter sizes')
  
  return RING_SIZES.filter(size => {
    if (size.value < minSize || size.value > maxSize) {
      return false
    }
    if (size.isHalfSize && !includeHalfSizes) {
      return false
    }
    return true
  })
}

/**
 * Calculate total price for customization
 */
export function calculateCustomizationPrice(
  basePrice: number,
  materialMultiplier: number = 1,
  stoneMultiplier: number = 1,
  engravingCost: number = 0
): number {
  const materialCost = Math.round(basePrice * (materialMultiplier - 1))
  const stoneCost = Math.round(basePrice * (stoneMultiplier - 1))
  return basePrice + materialCost + stoneCost + engravingCost
}

/**
 * Generate shareable URL for customization
 */
export function generateShareableUrl(productId: string, customization: any): string {
  const params = new URLSearchParams({
    product: productId,
    ...(customization.material && { material: customization.material.id }),
    ...(customization.stoneQuality && { stone: customization.stoneQuality.id }),
    ...(customization.size && { size: customization.size.id }),
    ...(customization.engraving && { engraving: customization.engraving })
  })
  
  return `/customizer?${params.toString()}`
}