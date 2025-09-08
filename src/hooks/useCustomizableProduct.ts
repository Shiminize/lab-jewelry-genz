/**
 * useCustomizableProduct - Bridge Service Integration Hook
 * Manages dynamic customizable product data from the bridge service API
 * Replaces hardcoded RING_VARIANTS with real-time API data
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { assetCache } from '@/services/AssetCacheService'
import type { ProductVariant, Material } from '@/types/customizer'

interface AssetInfo {
  available: boolean
  assetPaths: string[]
  lastGenerated?: string
  frameCount?: number
}

interface CustomizableProductData {
  productId: string
  jewelryType: string
  baseModel: string
  materialId?: string
  assets: AssetInfo
  assetGeneration: {
    supported: boolean
    estimatedTime: string
    qualityLevels: string[]
    standardFrameCount: number
  }
  dataSource: 'scalable-customization-service' | 'seed-data-compatible'
}

interface UseCustomizableProductOptions {
  productId: string
  initialMaterialId?: string
  enableRealTimeAssets?: boolean
}

interface UseCustomizableProductResult {
  // Product data
  productData: CustomizableProductData | null
  availableMaterials: Material[]
  currentVariant: ProductVariant | null
  
  // Loading states
  isLoading: boolean
  isLoadingAssets: boolean
  error: string | null
  
  // Actions
  changeMaterial: (materialId: string) => Promise<void>
  refreshAssets: () => Promise<void>
  
  // Legacy compatibility
  selectedVariantId: string
  selectedVariant: ProductVariant | null
}

// Default materials for fallback (CLAUDE_RULES compliant)
const DEFAULT_MATERIALS: Material[] = [
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

export function useCustomizableProduct({
  productId,
  initialMaterialId = '18k-rose-gold',
  enableRealTimeAssets = true
}: UseCustomizableProductOptions): UseCustomizableProductResult {
  
  // State management
  const [productData, setProductData] = useState<CustomizableProductData | null>(null)
  const [currentMaterialId, setCurrentMaterialId] = useState(initialMaterialId)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAssets, setIsLoadingAssets] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch assets from bridge service API
  const fetchAssets = useCallback(async (materialId?: string): Promise<CustomizableProductData | null> => {
    try {
      const url = `/api/products/customizable/${productId}/assets${materialId ? `?materialId=${materialId}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found or not customizable')
        }
        throw new Error(`API request failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch assets')
      }

      return result.data
    } catch (error) {
      console.error('Failed to fetch customizable product assets:', error)
      throw error
    }
  }, [productId])

  // Generate variant from API data
  const createVariantFromApiData = useCallback((
    data: CustomizableProductData, 
    materialId: string
  ): ProductVariant => {
    const material = DEFAULT_MATERIALS.find(m => m.id === materialId) || DEFAULT_MATERIALS[0]
    const primaryAssetPath = data.assets.assetPaths[0] || '/images/products/3d-sequences/default'
    
    return {
      id: `${data.baseModel}-${materialId}`,
      name: `${data.baseModel} - ${material.displayName}`,
      assetPath: primaryAssetPath,
      imageCount: data.assets.frameCount || data.assetGeneration.standardFrameCount,
      material,
      description: `Customizable ${data.jewelryType} in ${material.displayName}`,
      modelPath: `/models/${data.baseModel}.glb`
    }
  }, [])

  // Initialize product data
  useEffect(() => {
    let isMounted = true

    async function loadProductData() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await fetchAssets(currentMaterialId)
        
        if (!isMounted) return

        if (data) {
          setProductData(data)
        } else {
          throw new Error('No product data received')
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unknown error occurred')
          console.error('Failed to load customizable product:', error)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProductData()

    return () => {
      isMounted = false
    }
  }, [productId, currentMaterialId, fetchAssets])

  // Optimized material change with cache-first approach
  const changeMaterial = useCallback(async (materialId: string) => {
    if (materialId === currentMaterialId) return
    
    const switchStartTime = performance.now()
    
    try {
      setError(null)
      
      // Check cache first for instant switching
      const cachedAsset = assetCache.getCachedAsset(productId, materialId)
      if (cachedAsset && productData) {
        // Instant update from cache
        const updatedData: CustomizableProductData = {
          ...productData,
          materialId,
          assets: {
            available: true,
            assetPaths: cachedAsset.assetPaths,
            frameCount: productData.assets.frameCount
          }
        }
        setProductData(updatedData)
        setCurrentMaterialId(materialId)
        
        const switchTime = performance.now() - switchStartTime

        return
      }
      
      // Fallback to fetching if not cached
      setIsLoadingAssets(true)
      const data = await fetchAssets(materialId)
      
      if (data) {
        setProductData(data)
        setCurrentMaterialId(materialId)
      }
      
      const switchTime = performance.now() - switchStartTime

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change material')
      console.error('Failed to change material:', error)
    } finally {
      setIsLoadingAssets(false)
    }
  }, [currentMaterialId, productId, productData, fetchAssets])

  // Refresh current assets
  const refreshAssets = useCallback(async () => {
    try {
      setIsLoadingAssets(true)
      const data = await fetchAssets(currentMaterialId)
      if (data) {
        setProductData(data)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh assets')
    } finally {
      setIsLoadingAssets(false)
    }
  }, [currentMaterialId, fetchAssets])

  // Memoized computed values
  const currentVariant = useMemo(() => {
    if (!productData) return null
    return createVariantFromApiData(productData, currentMaterialId)
  }, [productData, currentMaterialId, createVariantFromApiData])

  const availableMaterials = useMemo(() => {
    // For now, return all default materials
    // In the future, this could come from the API
    return DEFAULT_MATERIALS
  }, [])

  // Legacy compatibility
  const selectedVariantId = currentVariant?.id || `${productId}-${currentMaterialId}`
  const selectedVariant = currentVariant

  return {
    // Product data
    productData,
    availableMaterials,
    currentVariant,
    
    // Loading states
    isLoading,
    isLoadingAssets,
    error,
    
    // Actions
    changeMaterial,
    refreshAssets,
    
    // Legacy compatibility
    selectedVariantId,
    selectedVariant
  }
}