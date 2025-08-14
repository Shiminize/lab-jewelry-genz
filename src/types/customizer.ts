export interface Material {
  id: string
  name: string
  description: string
  priceMultiplier: number
  color: string
  properties?: {
    metalness?: number
    roughness?: number
  }
}

export interface StoneQuality {
  id: string
  name: string
  description: string
  priceMultiplier: number
  grade: 'premium' | 'signature' | 'classic'
}

export interface RingSize {
  id: string
  size: number
  name: string
  isAvailable: boolean
}

export interface CustomizationOptions {
  material: Material | null
  stoneQuality: StoneQuality | null
  size: RingSize | null
  engraving: string
}

export interface ProductBase {
  _id: string
  name: string
  basePrice: number
  originalPrice?: number
  category: 'rings' | 'necklaces' | 'earrings' | 'bracelets'
  images: {
    primary: string
    gallery: string[]
  }
}

// CSS 3D Image Sequence Types
export interface ProductVariant {
  id: string
  name: string
  assetPath: string  // Path to folder containing image sequence (e.g., /products/rings/ring-solitaire-gold/)
  imageCount?: number  // Number of images in sequence (default: 36)
  material: Material
  description?: string
}

export interface ImageSequenceData {
  basePath: string
  imageCount: number
  imageFormat: 'webp' | 'jpg' | 'png'
  frameRate?: number  // FPS for auto-rotation
}

export interface ViewerInteraction {
  currentFrame: number
  isInteracting: boolean
  isLoading: boolean
  preloadedImages: Set<number>
}

export interface CSS3DViewerProps {
  variants: ProductVariant[]
  selectedVariantId: string
  onVariantChange?: (variantId: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  autoRotate?: boolean
  showControls?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
}

export interface PriceBreakdown {
  basePrice: number
  materialCost: number
  stoneCost: number
  engravingCost: number
  total: number
  savings?: number
}

// Additional interfaces for CustomizerPreviewSection CLAUDE_RULES.md compliance
export interface SettingOption {
  id: string
  name: string
  description: string
  priceMultiplier: number
  style?: string
  complexity?: 'simple' | 'medium' | 'complex'
}

export interface CustomizationSelectHandlers {
  handleOptionSelect: (type: 'material' | 'stone' | 'setting', option: Material | StoneQuality | SettingOption) => void
}

export interface QuickSelectorProps {
  label: string
  options: Material[] | StoneQuality[] | SettingOption[]
  selected: Material | StoneQuality | SettingOption | null
  onSelect: (option: Material | StoneQuality | SettingOption) => void
  type: 'material' | 'stone' | 'setting'
}