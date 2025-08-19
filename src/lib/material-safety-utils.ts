/**
 * Material Safety Utils - Phase 2 Type Safety Implementation
 * Provides runtime type validation, safe property access, and defensive programming utilities
 */

import type { 
  Material, 
  SafeProductVariant, 
  ValidationResult, 
  MaterialSafetyUtils,
  SafeDefaults,
  TypeGuards,
  TypeSafetyConfig
} from '@/types/customizer-enhanced'

// Safe defaults for fallback scenarios
export const SAFE_DEFAULTS: SafeDefaults = {
  FALLBACK_MATERIAL: {
    id: 'platinum-default',
    name: 'Platinum',
    description: 'Premium white metal',
    priceMultiplier: 1.0,
    color: '#cccccc',
    properties: {
      metalness: 1.0,
      roughness: 0.1,
      color: '#cccccc'
    }
  } as const,
  
  FALLBACK_VARIANT: {
    id: 'default-variant',
    name: 'Default Ring',
    assetPath: '/images/products/3d-sequences/default-sequence',
    imageCount: 36,
    material: {} as Material, // Will be populated with FALLBACK_MATERIAL
    description: 'Default customizable ring'
  } as SafeProductVariant,
  
  DEFAULT_MATERIAL_PROPERTIES: {
    metalness: 1.0,
    roughness: 0.1
  } as const
}

// Populate the fallback variant with the fallback material
;(SAFE_DEFAULTS.FALLBACK_VARIANT as any).material = SAFE_DEFAULTS.FALLBACK_MATERIAL

// Configuration for type safety behavior
export const TYPE_SAFETY_CONFIG: TypeSafetyConfig = {
  strictMode: process.env.NODE_ENV === 'development',
  enableRuntimeChecks: true,
  throwOnInvalidData: false,
  logValidationWarnings: true,
  fallbackToDefaults: true
} as const

// Type guards for runtime validation
export const typeGuards: TypeGuards = {
  isMaterial(obj: unknown): obj is Material {
    if (!obj || typeof obj !== 'object') return false
    
    const material = obj as Record<string, unknown>
    return (
      typeof material.id === 'string' &&
      typeof material.name === 'string' &&
      typeof material.description === 'string' &&
      typeof material.priceMultiplier === 'number' &&
      typeof material.color === 'string' &&
      material.properties !== null &&
      typeof material.properties === 'object'
    )
  },

  isProductVariant(obj: unknown): obj is SafeProductVariant {
    if (!obj || typeof obj !== 'object') return false
    
    const variant = obj as Record<string, unknown>
    return (
      typeof variant.id === 'string' &&
      typeof variant.name === 'string' &&
      typeof variant.assetPath === 'string' &&
      typeof variant.imageCount === 'number' &&
      variant.material !== null &&
      typeGuards.isMaterial(variant.material)
    )
  },

  isValidMaterialProperty(obj: Material, prop: string): prop is keyof Material['properties'] {
    return prop === 'metalness' || prop === 'roughness' || prop === 'color'
  },

  hasRequiredMaterialProperties(material: unknown): material is Material {
    if (!typeGuards.isMaterial(material)) return false
    
    const props = material.properties
    return (
      typeof props.metalness === 'number' &&
      typeof props.roughness === 'number' &&
      props.metalness >= 0 && props.metalness <= 1 &&
      props.roughness >= 0 && props.roughness <= 1
    )
  }
}

// Validation functions
function validateMaterial(material: unknown): ValidationResult<Material> {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!material || typeof material !== 'object') {
    errors.push('Material must be a valid object')
    return { isValid: false, data: null, errors, warnings }
  }
  
  const m = material as Record<string, unknown>
  
  // Check required fields
  if (typeof m.id !== 'string' || !m.id.trim()) {
    errors.push('Material ID is required and must be a non-empty string')
  }
  
  if (typeof m.name !== 'string' || !m.name.trim()) {
    errors.push('Material name is required and must be a non-empty string')
  }
  
  if (typeof m.description !== 'string') {
    errors.push('Material description is required and must be a string')
  }
  
  if (typeof m.priceMultiplier !== 'number' || m.priceMultiplier < 0) {
    errors.push('Material priceMultiplier must be a non-negative number')
  }
  
  if (typeof m.color !== 'string' || !m.color.trim()) {
    errors.push('Material color is required and must be a non-empty string')
  }
  
  // Check properties object
  if (!m.properties || typeof m.properties !== 'object') {
    errors.push('Material properties object is required')
  } else {
    const props = m.properties as Record<string, unknown>
    
    if (typeof props.metalness !== 'number' || props.metalness < 0 || props.metalness > 1) {
      errors.push('Material properties.metalness must be a number between 0 and 1')
    }
    
    if (typeof props.roughness !== 'number' || props.roughness < 0 || props.roughness > 1) {
      errors.push('Material properties.roughness must be a number between 0 and 1')
    }
    
    if (props.color && typeof props.color !== 'string') {
      warnings.push('Material properties.color should be a string if provided')
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, data: null, errors, warnings }
  }
  
  return { 
    isValid: true, 
    data: material as Material, 
    errors: [], 
    warnings 
  }
}

// Safe property accessor
function getMaterialProperty<K extends keyof Material['properties']>(
  material: Material, 
  property: K
): Material['properties'][K] {
  if (!typeGuards.isMaterial(material)) {
    if (TYPE_SAFETY_CONFIG.logValidationWarnings) {
      console.warn('[MaterialSafety] Invalid material object, using default property value')
    }
    return SAFE_DEFAULTS.DEFAULT_MATERIAL_PROPERTIES[property as keyof typeof SAFE_DEFAULTS.DEFAULT_MATERIAL_PROPERTIES] as Material['properties'][K]
  }
  
  const value = material.properties?.[property]
  if (value === undefined || value === null) {
    if (TYPE_SAFETY_CONFIG.logValidationWarnings) {
      console.warn(`[MaterialSafety] Property ${property} is undefined, using default`)
    }
    return SAFE_DEFAULTS.DEFAULT_MATERIAL_PROPERTIES[property as keyof typeof SAFE_DEFAULTS.DEFAULT_MATERIAL_PROPERTIES] as Material['properties'][K]
  }
  
  return value
}

// Material creation with defaults
function createSafeMaterial(partial: Partial<Material>): Material {
  const defaults = SAFE_DEFAULTS.FALLBACK_MATERIAL
  
  return {
    id: partial.id ?? defaults.id,
    name: partial.name ?? defaults.name,
    description: partial.description ?? defaults.description,
    priceMultiplier: partial.priceMultiplier ?? defaults.priceMultiplier,
    color: partial.color ?? defaults.color,
    properties: {
      metalness: partial.properties?.metalness ?? defaults.properties.metalness,
      roughness: partial.properties?.roughness ?? defaults.properties.roughness,
      color: partial.properties?.color ?? partial.color ?? defaults.properties.color
    }
  }
}

// Material properties merger
function mergeMaterialProperties(
  base: Material, 
  override: Partial<Material['properties']>
): Material {
  if (!typeGuards.isMaterial(base)) {
    if (TYPE_SAFETY_CONFIG.logValidationWarnings) {
      console.warn('[MaterialSafety] Base material is invalid, using fallback')
    }
    base = SAFE_DEFAULTS.FALLBACK_MATERIAL
  }
  
  return {
    ...base,
    properties: {
      ...base.properties,
      ...override
    }
  }
}

// Main utility object
export const materialSafetyUtils: MaterialSafetyUtils = {
  validateMaterial,
  getMaterialProperty,
  createSafeMaterial,
  mergeMaterialProperties
}

// Export individual functions for convenience
export { 
  createSafeMaterial,
  validateMaterial,
  getMaterialProperty,
  mergeMaterialProperties
}

// Safe accessors with fallback
export function safeGetMaterialName(material: unknown): string {
  if (typeGuards.isMaterial(material)) {
    return material.name || SAFE_DEFAULTS.FALLBACK_MATERIAL.name
  }
  return SAFE_DEFAULTS.FALLBACK_MATERIAL.name
}

export function safeGetMaterialColor(material: unknown): string {
  if (typeGuards.isMaterial(material)) {
    return material.color || SAFE_DEFAULTS.FALLBACK_MATERIAL.color
  }
  return SAFE_DEFAULTS.FALLBACK_MATERIAL.color
}

export function safeGetPriceMultiplier(material: unknown): number {
  if (typeGuards.isMaterial(material) && typeof material.priceMultiplier === 'number') {
    return material.priceMultiplier
  }
  return SAFE_DEFAULTS.FALLBACK_MATERIAL.priceMultiplier
}

// Variant safety utilities
export function safeGetVariant(variants: unknown[], variantId: string): SafeProductVariant {
  if (!Array.isArray(variants)) {
    if (TYPE_SAFETY_CONFIG.logValidationWarnings) {
      console.warn('[MaterialSafety] Variants is not an array, using fallback variant')
    }
    return SAFE_DEFAULTS.FALLBACK_VARIANT
  }
  
  const variant = variants.find((v: any) => v?.id === variantId)
  
  if (!variant || !typeGuards.isProductVariant(variant)) {
    if (TYPE_SAFETY_CONFIG.logValidationWarnings) {
      console.warn(`[MaterialSafety] Variant ${variantId} not found or invalid, using fallback`)
    }
    return SAFE_DEFAULTS.FALLBACK_VARIANT
  }
  
  return variant
}

// Error handling utilities
export function withMaterialSafety<T>(
  operation: () => T,
  fallback: T,
  context: string = 'unknown'
): T {
  try {
    return operation()
  } catch (error) {
    if (TYPE_SAFETY_CONFIG.logValidationWarnings) {
      console.warn(`[MaterialSafety] Error in ${context}:`, error)
    }
    
    if (TYPE_SAFETY_CONFIG.throwOnInvalidData && TYPE_SAFETY_CONFIG.strictMode) {
      throw error
    }
    
    return fallback
  }
}