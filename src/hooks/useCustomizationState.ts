/**
 * useCustomizationState - Shared State Management Hook
 * CLAUDE_RULES.md compliant: hook layer for business logic orchestration
 * Single source of truth for customization state across all components
 */

'use client'

import { useState, useCallback, useEffect, useTransition, useDeferredValue } from 'react'
import { customizationService } from '@/services/CustomizationService'
import { assetCache } from '@/services/AssetCacheService'
import type { 
  Material, 
  MaterialId, 
  AssetPaths, 
  CustomizationVariant 
} from '@/services/CustomizationService'

export interface CustomizationState {
  // Core state
  selectedMaterial: MaterialId
  materials: Material[]
  currentPrice: number
  
  // Asset state
  assets: AssetPaths | null
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // 3D viewer state
  rotationState: {
    currentFrame: number
    isRotating: boolean
    totalFrames: number
  }
}

export interface CustomizationActions {
  // Material actions
  changeMaterial: (materialId: MaterialId) => Promise<void>
  
  // Asset actions
  refreshAssets: () => Promise<void>
  
  // Rotation actions
  setFrame: (frame: number) => void
  nextFrame: () => void
  previousFrame: () => void
  setAutoRotate: (enabled: boolean) => void
  
  // Utility actions
  reset: () => void
  clearError: () => void
}

export interface UseCustomizationStateOptions {
  productId?: string
  initialMaterialId?: MaterialId
  onVariantChange?: (variant: CustomizationVariant) => void
  onPriceChange?: (price: number) => void
  enableServerValidation?: boolean
}

export interface UseCustomizationStateReturn {
  state: CustomizationState
  actions: CustomizationActions
  isPending: boolean
}

const DEFAULT_MATERIAL_ID: MaterialId = '18k-rose-gold'

/**
 * useCustomizationState - Shared customization state management
 */
export function useCustomizationState(
  options: UseCustomizationStateOptions = {}
): UseCustomizationStateReturn {
  const {
    productId = 'ring-001',
    initialMaterialId = DEFAULT_MATERIAL_ID,
    onVariantChange,
    onPriceChange,
    enableServerValidation = true
  } = options

  // React 18 Concurrent Features
  const [isPending, startTransition] = useTransition()
  const [materialIdState, setMaterialIdState] = useState(initialMaterialId)
  const deferredMaterialId = useDeferredValue(materialIdState)

  // Core state management
  const [state, setState] = useState<CustomizationState>({
    selectedMaterial: deferredMaterialId,
    materials: customizationService.getMaterials(),
    currentPrice: customizationService.calculatePrice(deferredMaterialId),
    assets: null,
    isLoading: true,
    error: null,
    rotationState: {
      currentFrame: 0,
      isRotating: false,
      totalFrames: 36
    }
  })

  // Asset fetching with cache integration
  const fetchAssets = useCallback(async (materialId: MaterialId) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Check cache first
      const cachedAsset = assetCache.getCachedAsset(productId, materialId)
      if (cachedAsset) {
        setState(prev => ({
          ...prev,
          assets: {
            available: true,
            assetPaths: cachedAsset.assetPaths
          },
          isLoading: false,
          error: null
        }))
        return
      }
      
      // Fetch from service
      const assets = await customizationService.fetchAssets(productId, materialId)
      
      // Update rotation state with actual frame count from assets
      const actualFrameCount = assets.totalValidFrames || assets.frameCount || 36
      
      setState(prev => ({
        ...prev,
        assets,
        isLoading: false,
        error: assets.available ? null : 'Assets not available',
        rotationState: {
          ...prev.rotationState,
          totalFrames: actualFrameCount,
          // Clamp current frame if it exceeds new total
          currentFrame: Math.min(prev.rotationState.currentFrame, actualFrameCount - 1)
        }
      }))
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load assets'
      }))
    }
  }, [productId])

  // Material change with server validation
  const changeMaterial = useCallback(async (materialId: MaterialId) => {
    const startTime = performance.now()
    
    // Start concurrent transition for non-blocking UI
    startTransition(() => {
      setMaterialIdState(materialId)
    })
    
    // Update state immediately for responsive UI
    setState(prev => ({
      ...prev,
      selectedMaterial: materialId,
      rotationState: {
        ...prev.rotationState,
        isRotating: false // Stop rotation when switching
      }
    }))
    
    try {
      // Server-side price validation
      let validatedPrice = customizationService.calculatePrice(materialId)
      
      if (enableServerValidation) {
        const priceResult = await customizationService.validatePriceWithServer(productId, materialId)
        if (priceResult.success) {
          validatedPrice = priceResult.validatedPrice
        }
      }
      
      // Update price
      setState(prev => ({ ...prev, currentPrice: validatedPrice }))
      
      // Notify callbacks
      const variant = customizationService.createVariant(materialId, validatedPrice)
      onVariantChange?.(variant)
      onPriceChange?.(validatedPrice)
      
      // Fetch assets
      await fetchAssets(materialId)
      
      // Performance tracking
      const switchTime = performance.now() - startTime
      if (switchTime > 100) {
        console.warn(`Material switch took ${switchTime}ms (>100ms CLAUDE_RULES target)`)
      }
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to change material'
      }))
    }
  }, [productId, onVariantChange, onPriceChange, enableServerValidation, fetchAssets])

  // Rotation actions
  const setFrame = useCallback((frame: number) => {
    setState(prev => ({
      ...prev,
      rotationState: {
        ...prev.rotationState,
        currentFrame: Math.max(0, Math.min(frame, prev.rotationState.totalFrames - 1))
      }
    }))
  }, [])

  const nextFrame = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotationState: {
        ...prev.rotationState,
        currentFrame: (prev.rotationState.currentFrame + 1) % prev.rotationState.totalFrames
      }
    }))
  }, [])

  const previousFrame = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotationState: {
        ...prev.rotationState,
        currentFrame: prev.rotationState.currentFrame === 0 
          ? prev.rotationState.totalFrames - 1 
          : prev.rotationState.currentFrame - 1
      }
    }))
  }, [])

  const setAutoRotate = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      rotationState: {
        ...prev.rotationState,
        isRotating: enabled
      }
    }))
  }, [])

  // Utility actions
  const refreshAssets = useCallback(async () => {
    await fetchAssets(state.selectedMaterial)
  }, [fetchAssets, state.selectedMaterial])

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedMaterial: DEFAULT_MATERIAL_ID,
      currentPrice: customizationService.calculatePrice(DEFAULT_MATERIAL_ID),
      assets: null,
      error: null,
      rotationState: {
        currentFrame: 0,
        isRotating: false,
        totalFrames: 36
      }
    }))
    setMaterialIdState(DEFAULT_MATERIAL_ID)
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Initialize assets on mount and material change
  useEffect(() => {
    const initializeAssets = async () => {
      await fetchAssets(state.selectedMaterial)
      
      // Prefetch other materials for performance
      const otherMaterials = state.materials
        .map(m => m.id)
        .filter(id => id !== state.selectedMaterial)
      
      if (otherMaterials.length > 0) {
        assetCache.prefetchMaterials(productId, otherMaterials, 'high')
          .catch(() => {
            // Silent prefetch failure
          })
      }
    }
    
    initializeAssets()
  }, [productId, state.selectedMaterial, state.materials, fetchAssets])

  // Actions object
  const actions: CustomizationActions = {
    changeMaterial,
    refreshAssets,
    setFrame,
    nextFrame,
    previousFrame,
    setAutoRotate,
    reset,
    clearError
  }

  return {
    state,
    actions,
    isPending
  }
}

export default useCustomizationState