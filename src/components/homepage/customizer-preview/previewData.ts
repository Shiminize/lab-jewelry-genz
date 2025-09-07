// Customizer Preview Data - Extracted for CLAUDE_RULES compliance
import type { Material, StoneQuality } from '@/types/customizer'

export interface SettingOption {
  id: string
  name: string
  description: string
}

export interface PreviewProduct {
  _id: string
  name: string
  basePrice: number
  category: string
  images: {
    primary: string
    gallery: string[]
  }
  modelPath: string
}

export interface TrustIndicator {
  icon: string
  text: string
}

// Bridge service materials for preview UI
export const PREVIEW_MATERIALS: Material[] = [
  {
    id: '18k-rose-gold',
    name: '18K Rose Gold',
    displayName: '18K Rose Gold',
    color: '#e8b4b8',
    metalness: 0.8,
    roughness: 0.2,
    priceMultiplier: 1.2,
    description: 'Modern romance meets timeless elegance'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    displayName: 'Platinum',
    color: '#e5e4e2',
    metalness: 0.9,
    roughness: 0.1,
    priceMultiplier: 1.5,
    description: 'Premium white metal for lasting beauty'
  },
  {
    id: '18k-white-gold',
    name: '18K White Gold',
    displayName: '18K White Gold',
    color: '#f8f8f8',
    metalness: 0.85,
    roughness: 0.15,
    priceMultiplier: 1.1,
    description: 'Classic elegance with contemporary appeal'
  },
  {
    id: '18k-yellow-gold',
    name: '18K Yellow Gold',
    displayName: '18K Yellow Gold',
    color: '#ffd700',
    metalness: 0.8,
    roughness: 0.2,
    priceMultiplier: 1.0,
    description: 'Timeless warmth and traditional luxury'
  }
]

export const PREVIEW_STONES: StoneQuality[] = [
  {
    id: 'lab-diamond',
    name: 'Lab Diamond',
    description: 'Brilliant clarity',
    priceMultiplier: 1.8,
    grade: 'premium'
  },
  {
    id: 'moissanite',
    name: 'Moissanite',
    description: 'Fire & brilliance',
    priceMultiplier: 1.0,
    grade: 'signature'
  },
  {
    id: 'lab-emerald',
    name: 'Lab Emerald',
    description: 'Vibrant green',
    priceMultiplier: 1.4,
    grade: 'classic'
  }
]

export const PREVIEW_SETTINGS: SettingOption[] = [
  { id: 'classic', name: 'Classic', description: 'Timeless elegance' },
  { id: 'modern', name: 'Modern', description: 'Contemporary style' },
  { id: 'vintage', name: 'Vintage', description: 'Classic heritage' }
]

export const TRUST_INDICATORS: TrustIndicator[] = [
  { icon: '🌱', text: '100% Conflict-Free' },
  { icon: '♻️', text: 'Recycled Metals' },
  { icon: '💎', text: 'Lab-Grown Gems' },
  { icon: '🎯', text: 'Custom Crafted' }
]

export const SAMPLE_PRODUCT: PreviewProduct = {
  _id: 'preview-ring',
  name: 'Custom Ring',
  basePrice: 299,
  category: 'rings',
  images: {
    primary: '/images/ring-preview.jpg',
    gallery: []
  },
  modelPath: '/doji_diamond_ring.glb'
}