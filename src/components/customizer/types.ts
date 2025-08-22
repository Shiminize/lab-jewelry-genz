/**
 * 3D Customizer Types - CLAUDE_RULES.md Compliant
 * Streamlined types for 5-component architecture
 * Focused on material-only customization with lab-grown gems
 */

// CLAUDE_RULES: Material-only focus enforcement (lines 209-213)
export type MaterialId = 'platinum' | '18k-white-gold' | '18k-yellow-gold' | '18k-rose-gold'

export type JewelryType = 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'pendants'

// Core product interface - streamlined for single responsibility
export interface CustomizableProduct {
  id: string
  name: string
  basePrice: number
  jewelryType: JewelryType
  baseModel: string
  description: string
  // CLAUDE_RULES: Material-only focus
  availableMaterials: MaterialId[]
  defaultMaterial: MaterialId
}

// Material configuration with PBR properties
export interface Material {
  id: MaterialId
  name: string
  displayName: string
  priceModifier: number
  // CLAUDE_RULES: Scientifically accurate PBR properties (line 37-41)
  pbrProperties: {
    metalness: number
    roughness: number
    reflectivity: number
    color: string
  }
}

// Asset information for image sequences
export interface AssetInfo {
  available: boolean
  assetPaths: string[]
  frameCount: number
  lastGenerated: string
}

// Rotation state for 36-frame sequences
export interface RotationState {
  currentFrame: number
  isRotating: boolean
  totalFrames: number
}

// Customizer state - simplified with stable dependencies
export interface CustomizerState {
  product: CustomizableProduct | null
  selectedMaterial: MaterialId
  rotationState: RotationState
  assets: AssetInfo | null
  isLoading: boolean
  error: string | null
}

// Props interfaces for components
export interface ProductCustomizerProps {
  productId?: string
  initialMaterialId?: MaterialId
  onVariantChange?: (variant: { materialId: MaterialId; price: number }) => void
  onPriceChange?: (price: number) => void
  className?: string
}

export interface ImageViewerProps {
  assetPath: string
  currentFrame: number
  totalFrames: number
  onFrameChange: (frame: number) => void
  isLoading: boolean
  error: string | null
  className?: string
}

export interface MaterialControlsProps {
  materials: Material[]
  selectedMaterial: MaterialId
  onMaterialChange: (materialId: MaterialId) => void
  isDisabled?: boolean
  className?: string
}

export interface ViewerControlsProps {
  currentFrame: number
  totalFrames: number
  onFrameChange: (frame: number) => void
  onNext: () => void
  onPrevious: () => void
  onAutoRotate: (enabled: boolean) => void
  isAutoRotating: boolean
  className?: string
}

// API response interfaces
export interface AssetResponse {
  success: boolean
  data: {
    productId: string
    materialId: MaterialId
    assets: AssetInfo
  }
  error?: {
    code: string
    message: string
  }
}

// Events for component communication
export interface CustomizerEvents {
  onMaterialSwitch: (materialId: MaterialId, switchTime: number) => void
  onRotationStart: (startFrame: number) => void
  onRotationEnd: (endFrame: number) => void
  onImageLoad: (framePath: string, loadTime: number) => void
  onError: (error: string, context: string) => void
}