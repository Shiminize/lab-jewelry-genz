/**
 * Product Variants for CSS 3D Image Sequence Viewer
 * Mock data following CLAUDE_RULES design system standards
 */

import type { ProductVariant, Material } from '@/types/customizer'

// Materials with design system colors
const MATERIALS: Material[] = [
  {
    id: 'platinum',
    name: 'Platinum',
    description: 'Premium white metal',
    priceMultiplier: 1.0,
    color: 'hsl(var(--muted))'
  },
  {
    id: '18k-white-gold',
    name: '18K White Gold',
    description: 'Classic elegance',
    priceMultiplier: 0.85,
    color: 'hsl(var(--background))'
  },
  {
    id: '18k-yellow-gold',
    name: '18K Yellow Gold',
    description: 'Timeless warmth',
    priceMultiplier: 0.8,
    color: 'hsl(var(--accent))'
  },
  {
    id: '18k-rose-gold',
    name: '18K Rose Gold',
    description: 'Modern romance',
    priceMultiplier: 0.8,
    color: 'hsl(var(--cta))'
  },
  {
    id: '14k-gold',
    name: '14K Gold',
    description: 'Accessible luxury',
    priceMultiplier: 0.7,
    color: 'hsl(var(--accent))'
  }
]

// Ring variants with CSS 3D image sequences
export const RING_VARIANTS: ProductVariant[] = [
  {
    id: 'solitaire-platinum',
    name: 'Classic Solitaire - Platinum',
    assetPath: '/images/products/3d-sequences/solitaire-platinum-sequence',
    imageCount: 36,
    material: MATERIALS[0], // Platinum
    description: 'Timeless solitaire setting in premium platinum'
  },
  {
    id: 'solitaire-white-gold',
    name: 'Classic Solitaire - 18K White Gold',
    assetPath: '/images/products/3d-sequences/solitaire-white-gold-sequence',
    imageCount: 36,
    material: MATERIALS[1], // 18K White Gold
    description: 'Elegant solitaire in classic white gold'
  },
  {
    id: 'solitaire-yellow-gold',
    name: 'Classic Solitaire - 18K Yellow Gold',
    assetPath: '/images/products/3d-sequences/solitaire-yellow-gold-sequence',
    imageCount: 36,
    material: MATERIALS[2], // 18K Yellow Gold
    description: 'Warm and radiant yellow gold solitaire'
  },
  {
    id: 'solitaire-rose-gold',
    name: 'Classic Solitaire - 18K Rose Gold',
    assetPath: '/images/products/3d-sequences/solitaire-rose-gold-sequence',
    imageCount: 36,
    material: MATERIALS[3], // 18K Rose Gold
    description: 'Romantic rose gold with modern appeal'
  },
  {
    id: 'halo-platinum',
    name: 'Halo Setting - Platinum',
    assetPath: '/images/products/3d-sequences/halo-platinum-sequence',
    imageCount: 36,
    material: MATERIALS[0], // Platinum
    description: 'Stunning halo design maximizes brilliance'
  },
  {
    id: 'vintage-rose-gold',
    name: 'Vintage Style - Rose Gold',
    assetPath: '/images/products/3d-sequences/vintage-rose-gold-sequence',
    imageCount: 36,
    material: MATERIALS[3], // 18K Rose Gold
    description: 'Art deco inspired vintage styling'
  },
  // Real ring model variants with generated image sequences
  {
    id: 'ringmodel-platinum',
    name: 'Classic Ring - Platinum',
    assetPath: '/images/products/3d-sequences/ringmodel-platinum-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === 'platinum') || MATERIALS[0],
    description: 'Elegant platinum ring with timeless design'
  },
  {
    id: 'ringmodel-white-gold',
    name: 'Classic Ring - White Gold',
    assetPath: '/images/products/3d-sequences/ringmodel-white-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-white-gold') || MATERIALS[1],
    description: 'Classic white gold ring with sophisticated appeal'
  },
  {
    id: 'ringmodel-yellow-gold',
    name: 'Classic Ring - Yellow Gold',
    assetPath: '/images/products/3d-sequences/ringmodel-yellow-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-yellow-gold') || MATERIALS[2],
    description: 'Warm yellow gold ring with traditional elegance'
  },
  {
    id: 'ringmodel-rose-gold',
    name: 'Classic Ring - Rose Gold',
    assetPath: '/images/products/3d-sequences/ringmodel-rose-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-rose-gold') || MATERIALS[3],
    description: 'Modern rose gold ring with romantic charm'
  },
  // BACKUP: toy_car variants as fallback examples
  {
    id: 'toy-car-platinum',
    name: 'Designer Ring - Platinum',
    assetPath: '/images/products/3d-sequences/toy_car-platinum-sequence',
    modelPath: '/models/toy_car.glb',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === 'platinum') || MATERIALS[0],
    description: 'Contemporary designer ring in platinum'
  },
  {
    id: 'toy-car-white-gold',
    name: 'Designer Ring - White Gold',
    assetPath: '/images/products/3d-sequences/toy_car-white-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-white-gold') || MATERIALS[1],
    description: 'Contemporary designer ring in white gold'
  },
  {
    id: 'toy-car-yellow-gold',
    name: 'Designer Ring - Yellow Gold',
    assetPath: '/images/products/3d-sequences/toy_car-yellow-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-yellow-gold') || MATERIALS[2],
    description: 'Contemporary designer ring in yellow gold'
  },
  {
    id: 'toy-car-rose-gold',
    name: 'Designer Ring - Rose Gold',
    assetPath: '/images/products/3d-sequences/toy_car-rose-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-rose-gold') || MATERIALS[3],
    description: 'Contemporary designer ring in rose gold'
  },
  {
    id: 'doji-diamond-ring-rose-gold',
    name: 'Doji Diamond Ring - Rose Gold',
    assetPath: '/images/products/3d-sequences/doji_diamond_ring-rose-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-rose-gold') || MATERIALS[3],
    description: 'Doji Diamond Ring in 18K Rose Gold'
  },
  {
    id: 'black-stone-ring-platinum',
    name: 'Black Stone Ring - Platinum',
    assetPath: '/images/products/3d-sequences/Black_Stone_Ring-platinum-sequence',
    imageCount: 12, // Reduced count since only 12 images exist (0-11)
    material: MATERIALS.find(m => m.id === 'platinum') || MATERIALS[0],
    description: 'Elegant black stone ring in platinum setting'
  },
  {
    id: 'black-stone-ring-white-gold',
    name: 'Black Stone Ring - White Gold',
    assetPath: '/images/products/3d-sequences/Black_Stone_Ring-white-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-white-gold') || MATERIALS[1],
    description: 'Elegant black stone ring in white gold'
  },
  {
    id: 'black-stone-ring-yellow-gold',
    name: 'Black Stone Ring - Yellow Gold',
    assetPath: '/images/products/3d-sequences/Black_Stone_Ring-yellow-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-yellow-gold') || MATERIALS[2],
    description: 'Elegant black stone ring in yellow gold'
  },
  {
    id: 'black-stone-ring-rose-gold',
    name: 'Black Stone Ring - Rose Gold',
    assetPath: '/images/products/3d-sequences/Black_Stone_Ring-rose-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-rose-gold') || MATERIALS[3],
    description: 'Elegant black stone ring in rose gold'
  }
]

// Placeholder image paths for development (will be replaced with real sequences)
export const PLACEHOLDER_IMAGES = {
  ring: '/images/jewelry-placeholder.webp',
  necklace: '/images/necklace-placeholder.webp',
  earrings: '/images/earrings-placeholder.webp',
  bracelet: '/images/bracelet-placeholder.webp'
}

// Helper function to get variant by ID
export function getVariantById(id: string): ProductVariant | undefined {
  return RING_VARIANTS.find(variant => variant.id === id)
}

// Helper function to get variants by material
export function getVariantsByMaterial(materialId: string): ProductVariant[] {
  return RING_VARIANTS.filter(variant => variant.material.id === materialId)
}

// Default variant for preview - using real ring model  
export const DEFAULT_VARIANT = RING_VARIANTS.find(v => v.id === 'doji-diamond-ring-rose-gold') || RING_VARIANTS[6]