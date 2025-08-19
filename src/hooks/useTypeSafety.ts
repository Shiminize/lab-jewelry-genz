/**
 * Type Safety Hooks - Phase 2 Enhanced Type Safety
 * React hooks for runtime type validation and safe property access
 */

import { useCallback, useMemo } from 'react'
import { 
  typeGuards,
  materialSafetyUtils,
  safeGetMaterialName,
  safeGetMaterialColor,
  safeGetPriceMultiplier,
  safeGetVariant,
  withMaterialSafety,
  SAFE_DEFAULTS
} from '@/lib/material-safety-utils'
import type { 
  Material, 
  SafeProductVariant,
  ValidationResult,
  SafeEventHandlers,
  SafePriceBreakdown
} from '@/types/customizer-enhanced'

/**
 * Hook for safe material operations
 */
export function useSafeMaterial(material: unknown) {
  const validatedMaterial = useMemo((): Material => {
    const validation = materialSafetyUtils.validateMaterial(material)
    
    if (validation.isValid && validation.data) {
      return validation.data
    }
    
    // Log warnings in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[useSafeMaterial] Invalid material, using fallback:', validation.errors)
    }
    
    return SAFE_DEFAULTS.FALLBACK_MATERIAL
  }, [material])

  const safeAccessors = useMemo(() => ({
    getName: () => safeGetMaterialName(validatedMaterial),
    getColor: () => safeGetMaterialColor(validatedMaterial),
    getPriceMultiplier: () => safeGetPriceMultiplier(validatedMaterial),
    getMetalness: () => materialSafetyUtils.getMaterialProperty(validatedMaterial, 'metalness'),
    getRoughness: () => materialSafetyUtils.getMaterialProperty(validatedMaterial, 'roughness'),
    getPropertyColor: () => materialSafetyUtils.getMaterialProperty(validatedMaterial, 'color')
  }), [validatedMaterial])

  const operations = useMemo(() => ({
    validate: (mat: unknown): ValidationResult<Material> => 
      materialSafetyUtils.validateMaterial(mat),
    
    merge: (overrides: Partial<Material['properties']>): Material =>
      materialSafetyUtils.mergeMaterialProperties(validatedMaterial, overrides),
    
    create: (partial: Partial<Material>): Material =>
      materialSafetyUtils.createSafeMaterial(partial)
  }), [validatedMaterial])

  return {
    material: validatedMaterial,
    isValid: typeGuards.isMaterial(material),
    ...safeAccessors,
    ...operations
  }
}

/**
 * Hook for safe variant operations
 */
export function useSafeVariant(variants: unknown[], selectedVariantId: string) {
  const safeVariant = useMemo((): SafeProductVariant => {
    return withMaterialSafety(
      () => safeGetVariant(variants, selectedVariantId),
      SAFE_DEFAULTS.FALLBACK_VARIANT,
      'useSafeVariant'
    )
  }, [variants, selectedVariantId])

  const variantOperations = useMemo(() => ({
    getById: (id: string): SafeProductVariant => 
      safeGetVariant(variants, id),
    
    getImageCount: (): number => 
      safeVariant.imageCount || 36,
    
    getAssetPath: (): string => 
      safeVariant.assetPath || '/images/products/3d-sequences/default-sequence',
    
    getMaterial: (): Material => 
      safeVariant.material,
    
    hasModelPath: (): boolean => 
      Boolean(safeVariant.modelPath),
    
    getModelPath: (): string | undefined => 
      safeVariant.modelPath
  }), [safeVariant, variants])

  return {
    variant: safeVariant,
    isValid: typeGuards.isProductVariant(safeVariant),
    ...variantOperations
  }
}

/**
 * Hook for safe price calculations
 */
export function useSafePriceCalculation(
  basePrice: number = 1000,
  material: unknown,
  stoneMultiplier: number = 1.0
) {
  const { getPriceMultiplier } = useSafeMaterial(material)
  
  const priceBreakdown = useMemo((): SafePriceBreakdown => {
    return withMaterialSafety(
      () => {
        const materialMultiplier = getPriceMultiplier()
        const totalPrice = Math.round(basePrice * materialMultiplier * stoneMultiplier)
        const originalPrice = basePrice
        const savings = Math.max(0, originalPrice - totalPrice)
        
        return {
          basePrice,
          materialMultiplier,
          stoneMultiplier,
          totalPrice,
          savings,
          currency: 'USD'
        }
      },
      {
        basePrice,
        materialMultiplier: 1.0,
        stoneMultiplier: 1.0,
        totalPrice: basePrice,
        savings: 0,
        currency: 'USD'
      },
      'useSafePriceCalculation'
    )
  }, [basePrice, getPriceMultiplier, stoneMultiplier])

  return priceBreakdown
}

/**
 * Hook for safe event handlers with validation
 */
export function useSafeEventHandlers() {
  const handleMaterialChange = useCallback((material: Material) => {
    if (!typeGuards.isMaterial(material)) {
      console.warn('[useSafeEventHandlers] Invalid material in handleMaterialChange')
      return
    }
    
    // Additional processing can be added here
    return material
  }, [])

  const handleVariantChange = useCallback((variant: SafeProductVariant) => {
    if (!typeGuards.isProductVariant(variant)) {
      console.warn('[useSafeEventHandlers] Invalid variant in handleVariantChange')
      return
    }
    
    return variant
  }, [])

  const handlePriceChange = useCallback((breakdown: SafePriceBreakdown) => {
    if (typeof breakdown.totalPrice !== 'number' || breakdown.totalPrice < 0) {
      console.warn('[useSafeEventHandlers] Invalid price breakdown')
      return
    }
    
    return breakdown
  }, [])

  const handleError = useCallback((error: Error, context: string) => {
    console.error(`[useSafeEventHandlers] Error in ${context}:`, error)
    
    // Could integrate with error reporting service here
    return { error, context, timestamp: new Date().toISOString() }
  }, [])

  const safeEventHandlers: SafeEventHandlers = {
    onMaterialChange: handleMaterialChange,
    onVariantChange: handleVariantChange,
    onPriceChange: handlePriceChange,
    onViewerStateChange: (state) => {
      // Validate viewer state if needed
      return state
    },
    onError: handleError
  }

  return safeEventHandlers
}

/**
 * Hook for safe data validation with detailed results
 */
export function useDataValidation() {
  const validateAndProcess = useCallback(<T>(
    data: unknown,
    validator: (data: unknown) => ValidationResult<T>,
    fallback: T,
    context: string = 'unknown'
  ): { data: T; validation: ValidationResult<T> } => {
    const validation = validator(data)
    
    if (validation.isValid && validation.data) {
      return { data: validation.data, validation }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[useDataValidation] Validation failed in ${context}:`, {
        errors: validation.errors,
        warnings: validation.warnings
      })
    }
    
    return { 
      data: fallback, 
      validation: {
        ...validation,
        data: fallback
      }
    }
  }, [])

  const batchValidate = useCallback(<T>(
    items: unknown[],
    validator: (item: unknown) => ValidationResult<T>,
    context: string = 'batch'
  ): { validItems: T[]; invalidCount: number; errors: string[] } => {
    const validItems: T[] = []
    const errors: string[] = []
    let invalidCount = 0
    
    items.forEach((item, index) => {
      const validation = validator(item)
      
      if (validation.isValid && validation.data) {
        validItems.push(validation.data)
      } else {
        invalidCount++
        errors.push(...validation.errors.map(err => `Item ${index}: ${err}`))
      }
    })
    
    if (process.env.NODE_ENV === 'development' && invalidCount > 0) {
      console.warn(`[useDataValidation] ${invalidCount} invalid items in ${context}:`, errors)
    }
    
    return { validItems, invalidCount, errors }
  }, [])

  return {
    validateAndProcess,
    batchValidate,
    typeGuards
  }
}