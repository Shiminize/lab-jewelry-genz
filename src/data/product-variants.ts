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
    assetPath: '/images/products/3d-sequences/solitaire-platinum',
    imageCount: 36,
    material: MATERIALS[0], // Platinum
    description: 'Timeless solitaire setting in premium platinum'
  },
  {
    id: 'solitaire-white-gold',
    name: 'Classic Solitaire - 18K White Gold',
    assetPath: '/images/products/3d-sequences/solitaire-white-gold',
    imageCount: 36,
    material: MATERIALS[1], // 18K White Gold
    description: 'Elegant solitaire in classic white gold'
  },
  {
    id: 'solitaire-yellow-gold',
    name: 'Classic Solitaire - 18K Yellow Gold',
    assetPath: '/images/products/3d-sequences/solitaire-yellow-gold',
    imageCount: 36,
    material: MATERIALS[2], // 18K Yellow Gold
    description: 'Warm and radiant yellow gold solitaire'
  },
  {
    id: 'solitaire-rose-gold',
    name: 'Classic Solitaire - 18K Rose Gold',
    assetPath: '/images/products/3d-sequences/solitaire-rose-gold',
    imageCount: 36,
    material: MATERIALS[3], // 18K Rose Gold
    description: 'Romantic rose gold with modern appeal'
  },
  {
    id: 'halo-platinum',
    name: 'Halo Setting - Platinum',
    assetPath: '/images/products/3d-sequences/halo-platinum',
    imageCount: 36,
    material: MATERIALS[0], // Platinum
    description: 'Stunning halo design maximizes brilliance'
  },
  {
    id: 'vintage-rose-gold',
    name: 'Vintage Style - Rose Gold',
    assetPath: '/images/products/3d-sequences/vintage-rose-gold',
    imageCount: 36,
    material: MATERIALS[3], // 18K Rose Gold
    description: 'Art deco inspired vintage styling'
  }
,
  {
    id: 'ringmodel-platinum',
    name: 'Ring Model - Platinum',
    assetPath: '/images/products/3d-sequences/ringmodel-platinum',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === 'platinum') || MATERIALS[0],
    description: 'Custom ring model in platinum'
  },
  {
    id: 'ringmodel-yellow-gold',
    name: 'Ring Model - Yellow Gold',
    assetPath: '/images/products/3d-sequences/ringmodel-yellow-gold',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-yellow-gold') || MATERIALS[0],
    description: 'Custom ring model in yellow gold'
  },
  {
    id: 'ringmodel-rose-gold',
    name: 'Ring Model - Rose Gold',
    assetPath: '/images/products/3d-sequences/ringmodel-rose-gold',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-rose-gold') || MATERIALS[0],
    description: 'Custom ring model in rose gold'
  },
  {
    id: 'ringmodel-white-gold',
    name: 'Ring Model - White Gold',
    assetPath: '/images/products/3d-sequences/ringmodel-white-gold',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-white-gold') || MATERIALS[0],
    description: 'Custom ring model in white gold'
  },
  {
    id: 'doji-diamond-ring-rose-gold',
    name: 'Doji Diamond Ring - Rose Gold',
    assetPath: '/images/products/3d-sequences/doji_diamond_ring-rose-gold-sequence',
    imageCount: 36,
    material: MATERIALS.find(m => m.id === '18k-rose-gold') || MATERIALS[3],
    description: 'Doji Diamond Ring in 18K Rose Gold'
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

// Default variant for preview
export const DEFAULT_VARIANT = RING_VARIANTS[10] // Doji Diamond Ring - Rose Gold