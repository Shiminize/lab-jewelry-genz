/**
 * Enhanced Customizer Types - Phase 2 Type Safety Implementation
 * Provides robust type definitions with non-nullable required fields and utility types
 */

// Base types with strict requirements
export interface Material {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly priceMultiplier: number
  readonly color: string
  readonly properties: {
    readonly metalness: number
    readonly roughness: number
    readonly color?: string
  }
}

export interface StoneQuality {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly priceMultiplier: number
  readonly grade: 'premium' | 'signature' | 'classic'
}

export interface RingSize {
  readonly id: string
  readonly size: number
  readonly name: string
  readonly isAvailable: boolean
}

// Safe customization options with non-nullable defaults
export interface SafeCustomizationOptions {
  readonly material: Material
  readonly stoneQuality: StoneQuality | null
  readonly size: RingSize | null
  readonly engraving: string
}

// Enhanced ProductVariant with guaranteed material
export interface SafeProductVariant {
  readonly id: string
  readonly name: string
  readonly assetPath: string
  readonly modelPath?: string
  readonly imageCount: number
  readonly material: Material
  readonly description: string
}

// Utility types for type safety
export type MaterialProperty = keyof Material['properties']
export type CustomizationOptionType = 'material' | 'stoneQuality' | 'size'

// Type guards for runtime validation
export interface TypeGuards {
  isMaterial(obj: unknown): obj is Material
  isProductVariant(obj: unknown): obj is SafeProductVariant
  isValidMaterialProperty(obj: Material, prop: string): prop is MaterialProperty
  hasRequiredMaterialProperties(material: unknown): material is Material
}

// Safe defaults for fallback scenarios
export interface SafeDefaults {
  readonly FALLBACK_MATERIAL: Material
  readonly FALLBACK_VARIANT: SafeProductVariant
  readonly DEFAULT_MATERIAL_PROPERTIES: Material['properties']
}

// Enhanced props interfaces with better type safety
export interface SafeProductCustomizerProps {
  readonly initialVariantId?: string
  readonly layout?: 'stacked' | 'side-by-side'
  readonly className?: string
  readonly showControls?: boolean
  readonly autoRotate?: boolean
  readonly onVariantChange?: (variant: SafeProductVariant) => void
  readonly onPriceChange?: (price: number) => void
  readonly onMaterialChange?: (material: Material) => void
}

// Material selection handlers with guaranteed types
export interface SafeMaterialHandlers {
  readonly handleMaterialSelect: (material: Material) => void
  readonly handleVariantSelect: (variantId: string) => void
  readonly getMaterialById: (id: string) => Material | null
  readonly getVariantById: (id: string) => SafeProductVariant | null
}

// Enhanced viewer interaction state
export interface SafeViewerState {
  readonly currentFrame: number
  readonly isInteracting: boolean
  readonly isLoading: boolean
  readonly viewerError: Error | null
  readonly currentMode: 'sequences' | 'threejs' | 'ar'
}

// Price calculation types with safe operations
export interface SafePriceBreakdown {
  readonly basePrice: number
  readonly materialMultiplier: number
  readonly stoneMultiplier: number
  readonly totalPrice: number
  readonly savings: number
  readonly currency: string
}

// Validation result types
export interface ValidationResult<T> {
  readonly isValid: boolean
  readonly data: T | null
  readonly errors: string[]
  readonly warnings: string[]
}

// Material utility functions interface
export interface MaterialSafetyUtils {
  validateMaterial(material: unknown): ValidationResult<Material>
  getMaterialProperty<K extends MaterialProperty>(material: Material, property: K): Material['properties'][K]
  createSafeMaterial(partial: Partial<Material>): Material
  mergeMaterialProperties(base: Material, override: Partial<Material['properties']>): Material
}

// Advanced type utilities
export type RequiredMaterial = Required<Material>
export type PartialMaterial = Partial<Material>
export type MaterialWithDefaults = Material & { readonly _defaults: true }

// Runtime type checking utilities
export type TypePredicate<T> = (obj: unknown) => obj is T
export type SafeAccessor<T, K extends keyof T> = (obj: T, key: K) => NonNullable<T[K]>

// Event handler types with enhanced safety
export interface SafeEventHandlers {
  onMaterialChange: (material: Material) => void
  onVariantChange: (variant: SafeProductVariant) => void
  onPriceChange: (breakdown: SafePriceBreakdown) => void
  onViewerStateChange: (state: SafeViewerState) => void
  onError: (error: Error, context: string) => void
}

// Configuration interface for type safety settings
export interface TypeSafetyConfig {
  readonly strictMode: boolean
  readonly enableRuntimeChecks: boolean
  readonly throwOnInvalidData: boolean
  readonly logValidationWarnings: boolean
  readonly fallbackToDefaults: boolean
}