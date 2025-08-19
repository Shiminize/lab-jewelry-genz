/**
 * Database Customizer Hook - Phase 3C
 * React hook for database-driven product customization with type safety
 * Integrates with ProductCustomizationService API endpoints
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ProductVariant, Material } from '@/types/customizer'
import { typeGuards } from '@/lib/material-safety-utils'

// Hook configuration
interface DatabaseCustomizerConfig {
  baseUrl?: string
  enableCaching?: boolean
  performanceTracking?: boolean
  retryAttempts?: number
  timeoutMs?: number
}

// API Response types
interface VariantsApiResponse {
  success: boolean
  variants: ProductVariant[]
  productInfo: {
    id: string
    name: string
    basePrice: number
    isCustomizable: boolean
  }
  metadata: {
    generatedCount: number
    cached: boolean
    processingTimeMs: number
    errors: string[]
    warnings: string[]
  }
  performance: {
    databaseQueryMs: number
    variantGenerationMs: number
    totalResponseMs: number
  }
}

interface PriceApiResponse {
  success: boolean
  pricing: {
    basePrice: number
    materialAdjustment: number
    customizationAdjustments: number
    totalPrice: number
    finalPrice: number
    quantity: number
  }
  breakdown: {
    material: {
      name: string
      multiplier: number
      adjustment: number
      percentage: number
    }
    customizations: Array<{
      option: string
      value: string
      adjustment: number
    }>
  }
  metadata: {
    productId: string
    calculationTimeMs: number
    cached: boolean
    errors: string[]
    warnings: string[]
  }
}

// Hook state interface
interface DatabaseCustomizerState {
  // Data
  variants: ProductVariant[]
  availableMaterials: Material[]
  selectedVariant: ProductVariant | null
  currentPrice: number
  
  // Product info
  productInfo: {
    id: string
    name: string
    basePrice: number
    isCustomizable: boolean
  } | null
  
  // Loading states
  isLoadingVariants: boolean
  isLoadingPrice: boolean
  isInitialized: boolean
  
  // Error handling
  error: string | null
  warnings: string[]
  
  // Performance tracking
  performanceMetrics: {
    variantLoadTime: number
    priceCalculationTime: number
    apiResponseTimes: number[]
    cacheHitRate: number
  }
  
  // Metadata
  metadata: {
    variantsGenerated: number
    lastUpdated: Date | null
    apiCallsCount: number
    cached: boolean
  }
}

// Hook return interface
interface DatabaseCustomizerHook extends DatabaseCustomizerState {
  // Actions
  loadVariants: (productId: string) => Promise<boolean>
  selectVariant: (variantId: string) => void
  selectMaterial: (materialId: string) => void
  calculatePrice: (materialId: string, customizations?: any, quantity?: number) => Promise<void>
  clearError: () => void
  
  // Utilities
  getVariantById: (id: string) => ProductVariant | null
  getMaterialById: (id: string) => Material | null
  isPerformant: boolean
  healthCheck: () => { status: 'healthy' | 'degraded' | 'error'; details: any }
}

// Default configuration
const DEFAULT_CONFIG: Required<DatabaseCustomizerConfig> = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  enableCaching: true,
  performanceTracking: true,
  retryAttempts: 2,
  timeoutMs: 10000
}

/**
 * Main database customizer hook
 */
export function useDatabaseCustomizer(config: DatabaseCustomizerConfig = {}): DatabaseCustomizerHook {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const abortControllerRef = useRef<AbortController | null>(null)
  const apiCallCountRef = useRef(0)
  const cacheHitsRef = useRef(0)

  // Main state
  const [state, setState] = useState<DatabaseCustomizerState>({
    variants: [],
    availableMaterials: [],
    selectedVariant: null,
    currentPrice: 0,
    productInfo: null,
    isLoadingVariants: false,
    isLoadingPrice: false,
    isInitialized: false,
    error: null,
    warnings: [],
    performanceMetrics: {
      variantLoadTime: 0,
      priceCalculationTime: 0,
      apiResponseTimes: [],
      cacheHitRate: 0
    },
    metadata: {
      variantsGenerated: 0,
      lastUpdated: null,
      apiCallsCount: 0,
      cached: false
    }
  })

  // Load variants from database API
  const loadVariants = useCallback(async (productId: string): Promise<boolean> => {
    if (!productId) {
      setState(prev => ({ ...prev, error: 'Product ID is required' }))
      return false
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setState(prev => ({ 
      ...prev, 
      isLoadingVariants: true, 
      error: null, 
      warnings: []
    }))

    const startTime = performance.now()
    apiCallCountRef.current++

    try {
      const response = await fetch(
        `${mergedConfig.baseUrl}/api/customizer/products/${productId}/variants`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current.signal,
        }
      )

      const responseTime = performance.now() - startTime

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API request failed: ${response.status}`)
      }

      const data: VariantsApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.metadata?.errors?.[0] || 'Failed to load variants')
      }

      // Validate variants using type guards
      const validVariants = data.variants.filter(variant => {
        if (!typeGuards.isProductVariant(variant)) {
          console.warn('[useDatabaseCustomizer] Invalid variant received:', variant)
          return false
        }
        return true
      })

      // Extract unique materials
      const materialsMap = new Map<string, Material>()
      validVariants.forEach(variant => {
        if (typeGuards.isMaterial(variant.material)) {
          materialsMap.set(variant.material.id, variant.material)
        }
      })
      const availableMaterials = Array.from(materialsMap.values())

      // Track cache performance
      if (data.metadata.cached) {
        cacheHitsRef.current++
      }

      setState(prev => ({
        ...prev,
        variants: validVariants,
        availableMaterials,
        selectedVariant: validVariants[0] || null,
        productInfo: data.productInfo,
        isLoadingVariants: false,
        isInitialized: true,
        warnings: data.metadata.warnings,
        performanceMetrics: {
          ...prev.performanceMetrics,
          variantLoadTime: responseTime,
          apiResponseTimes: [...prev.performanceMetrics.apiResponseTimes, responseTime].slice(-10),
          cacheHitRate: cacheHitsRef.current / apiCallCountRef.current
        },
        metadata: {
          variantsGenerated: data.metadata.generatedCount,
          lastUpdated: new Date(),
          apiCallsCount: apiCallCountRef.current,
          cached: data.metadata.cached
        }
      }))

      return true

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return false // Request was cancelled
      }

      const responseTime = performance.now() - startTime
      
      setState(prev => ({
        ...prev,
        isLoadingVariants: false,
        error: error.message || 'Failed to load variants',
        performanceMetrics: {
          ...prev.performanceMetrics,
          variantLoadTime: responseTime,
          apiResponseTimes: [...prev.performanceMetrics.apiResponseTimes, responseTime].slice(-10)
        },
        metadata: {
          ...prev.metadata,
          apiCallsCount: apiCallCountRef.current
        }
      }))

      return false
    }
  }, [mergedConfig.baseUrl])

  // Select variant by ID
  const selectVariant = useCallback((variantId: string) => {
    setState(prev => {
      const variant = prev.variants.find(v => v.id === variantId)
      if (!variant) {
        return { ...prev, error: `Variant ${variantId} not found` }
      }

      return {
        ...prev,
        selectedVariant: variant,
        error: null
      }
    })
  }, [])

  // Select variant by material ID
  const selectMaterial = useCallback((materialId: string) => {
    setState(prev => {
      const variant = prev.variants.find(v => v.material.id === materialId)
      if (!variant) {
        return { ...prev, error: `Material ${materialId} not found` }
      }

      return {
        ...prev,
        selectedVariant: variant,
        error: null
      }
    })
  }, [])

  // Calculate price for specific configuration
  const calculatePrice = useCallback(async (
    materialId: string,
    customizations: any = {},
    quantity: number = 1
  ) => {
    if (!state.productInfo?.id) {
      setState(prev => ({ ...prev, error: 'Product not loaded' }))
      return
    }

    setState(prev => ({ ...prev, isLoadingPrice: true, error: null }))

    const startTime = performance.now()
    apiCallCountRef.current++

    try {
      const response = await fetch(
        `${mergedConfig.baseUrl}/api/customizer/products/${state.productInfo.id}/price`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            materialId,
            customizations,
            quantity
          }),
          signal: abortControllerRef.current?.signal,
        }
      )

      const responseTime = performance.now() - startTime

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Price calculation failed: ${response.status}`)
      }

      const data: PriceApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.metadata?.errors?.[0] || 'Price calculation failed')
      }

      if (data.metadata.cached) {
        cacheHitsRef.current++
      }

      setState(prev => ({
        ...prev,
        currentPrice: data.pricing.finalPrice,
        isLoadingPrice: false,
        performanceMetrics: {
          ...prev.performanceMetrics,
          priceCalculationTime: responseTime,
          apiResponseTimes: [...prev.performanceMetrics.apiResponseTimes, responseTime].slice(-10),
          cacheHitRate: cacheHitsRef.current / apiCallCountRef.current
        },
        metadata: {
          ...prev.metadata,
          apiCallsCount: apiCallCountRef.current,
          lastUpdated: new Date()
        }
      }))

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return
      }

      const responseTime = performance.now() - startTime
      
      setState(prev => ({
        ...prev,
        isLoadingPrice: false,
        error: error.message || 'Price calculation failed',
        performanceMetrics: {
          ...prev.performanceMetrics,
          priceCalculationTime: responseTime,
          apiResponseTimes: [...prev.performanceMetrics.apiResponseTimes, responseTime].slice(-10)
        },
        metadata: {
          ...prev.metadata,
          apiCallsCount: apiCallCountRef.current
        }
      }))
    }
  }, [state.productInfo?.id, mergedConfig.baseUrl])

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, warnings: [] }))
  }, [])

  // Utility functions
  const getVariantById = useCallback((id: string): ProductVariant | null => {
    return state.variants.find(variant => variant.id === id) || null
  }, [state.variants])

  const getMaterialById = useCallback((id: string): Material | null => {
    return state.availableMaterials.find(material => material.id === id) || null
  }, [state.availableMaterials])

  // Performance check
  const isPerformant = state.performanceMetrics.apiResponseTimes.length > 0
    ? state.performanceMetrics.apiResponseTimes.every(time => time < 300)
    : true

  // Health check
  const healthCheck = useCallback(() => {
    const avgResponseTime = state.performanceMetrics.apiResponseTimes.length > 0
      ? state.performanceMetrics.apiResponseTimes.reduce((a, b) => a + b, 0) / state.performanceMetrics.apiResponseTimes.length
      : 0

    const status = state.error 
      ? 'error' 
      : (!isPerformant || avgResponseTime > 500)
        ? 'degraded'
        : 'healthy'

    return {
      status,
      details: {
        apiCallsCount: state.metadata.apiCallsCount,
        cacheHitRate: state.performanceMetrics.cacheHitRate,
        avgResponseTime,
        isInitialized: state.isInitialized,
        variantsCount: state.variants.length,
        hasError: !!state.error,
        warnings: state.warnings
      }
    }
  }, [state, isPerformant])

  // Auto-calculate price when variant changes
  useEffect(() => {
    if (state.selectedVariant && state.productInfo?.id) {
      calculatePrice(state.selectedVariant.material.id)
    }
  }, [state.selectedVariant, state.productInfo?.id, calculatePrice])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    loadVariants,
    selectVariant,
    selectMaterial,
    calculatePrice,
    clearError,
    getVariantById,
    getMaterialById,
    isPerformant,
    healthCheck
  }
}

export default useDatabaseCustomizer