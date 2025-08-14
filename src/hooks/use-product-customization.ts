/**
 * Product Customization Hook
 * CLAUDE_RULES.md compliant React hook for 3D customizer data management
 * Integrates with seed product API endpoints
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProductCustomization, CustomizationOptions, PriceCalculation } from '@/lib/schemas/product-customization'

interface UseProductCustomizationOptions {
  productId: string
  initialCustomization?: Partial<CustomizationOptions>
}

interface UseProductCustomizationReturn {
  // Data state
  product: ProductCustomization | null
  customization: CustomizationOptions
  pricing: PriceCalculation | null
  
  // Loading states
  isLoading: boolean
  isLoadingPrice: boolean
  isSaving: boolean
  
  // Error states
  error: string | null
  priceError: string | null
  
  // Actions
  updateCustomization: (updates: Partial<CustomizationOptions>) => void
  saveDesign: (name?: string, isPublic?: boolean) => Promise<{ success: boolean; designId?: string; error?: string }>
  shareDesign: (includePrice?: boolean) => Promise<{ success: boolean; shareUrl?: string; error?: string }>
  resetCustomization: () => void
  
  // Computed values
  hasChanges: boolean
  isCustomizationValid: boolean
}

/**
 * Hook for managing product customization data and state
 */
export function useProductCustomization({ 
  productId, 
  initialCustomization 
}: UseProductCustomizationOptions): UseProductCustomizationReturn {
  
  // Core state
  const [product, setProduct] = useState<ProductCustomization | null>(null)
  const [customization, setCustomization] = useState<CustomizationOptions>({
    material: null,
    stoneQuality: null,
    size: null,
    engraving: ''
  })
  const [pricing, setPricing] = useState<PriceCalculation | null>(null)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Error states
  const [error, setError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  
  // Track initial state for change detection
  const [initialState, setInitialState] = useState<CustomizationOptions>({
    material: null,
    stoneQuality: null,
    size: null,
    engraving: ''
  })

  // Load product data
  useEffect(() => {
    if (!productId) return

    const loadProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/products/${productId}/customize`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'Failed to load product')
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error?.message || 'API returned unsuccessful response')
        }
        
        setProduct(data.data)
        
        // Apply initial customization if provided
        if (initialCustomization) {
          setCustomization(prev => ({ ...prev, ...initialCustomization }))
          setInitialState(prev => ({ ...prev, ...initialCustomization }))
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
        console.error('Product customization loading error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId, initialCustomization])

  // Calculate pricing when customization changes
  const calculatePricing = useCallback(async () => {
    if (!product || !customization) return

    try {
      setIsLoadingPrice(true)
      setPriceError(null)
      
      // Calculate price locally for better performance (meets CLAUDE_RULES <300ms target)
      const basePrice = product.pricing.basePrice
      
      const materialCost = customization.material 
        ? (product.pricing.materialUpgrades[customization.material.id] || 0)
        : 0
      
      const stoneCost = customization.stoneQuality
        ? (product.pricing.stoneUpgrades[customization.stoneQuality.id] || 0)
        : 0
      
      const engravingCost = customization.engraving ? product.pricing.engravingCost : 0
      
      const total = basePrice + materialCost + stoneCost + engravingCost
      const savings = product.product.originalPrice ? product.product.originalPrice - total : undefined
      
      const newPricing: PriceCalculation = {
        basePrice,
        materialCost,
        stoneCost,
        engravingCost,
        total,
        savings,
        financing: {
          monthlyPayment: Math.round(total / 4),
          term: 4,
          provider: 'Sezzle'
        }
      }
      
      setPricing(newPricing)
      
    } catch (err) {
      setPriceError(err instanceof Error ? err.message : 'Failed to calculate price')
      console.error('Price calculation error:', err)
    } finally {
      setIsLoadingPrice(false)
    }
  }, [product, customization])

  // Trigger price calculation when customization changes
  useEffect(() => {
    calculatePricing()
  }, [calculatePricing])

  // Update customization
  const updateCustomization = useCallback((updates: Partial<CustomizationOptions>) => {
    setCustomization(prev => ({ ...prev, ...updates }))
  }, [])

  // Save design
  const saveDesign = useCallback(async (name?: string, isPublic: boolean = false) => {
    if (!product || isSaving) return { success: false, error: 'Cannot save at this time' }

    try {
      setIsSaving(true)
      
      const response = await fetch(`/api/products/${productId}/customize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          customization,
          name,
          isPublic
        })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to save design')
      }
      
      return { 
        success: true, 
        designId: data.data.design.id 
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save design'
      console.error('Save design error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsSaving(false)
    }
  }, [product, productId, customization, isSaving])

  // Share design
  const shareDesign = useCallback(async (includePrice: boolean = true) => {
    if (!product) return { success: false, error: 'No product loaded' }

    try {
      const response = await fetch(`/api/products/${productId}/customize/share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          customization,
          shareOptions: {
            includePrice
          }
        })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to generate share link')
      }
      
      return { 
        success: true, 
        shareUrl: data.data.shareableUrl 
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate share link'
      console.error('Share design error:', err)
      return { success: false, error: errorMessage }
    }
  }, [product, productId, customization])

  // Reset customization
  const resetCustomization = useCallback(() => {
    setCustomization(initialState)
  }, [initialState])

  // Computed values
  const hasChanges = JSON.stringify(customization) !== JSON.stringify(initialState)
  
  const isCustomizationValid = Boolean(
    customization.material || 
    customization.stoneQuality || 
    customization.size ||
    customization.engraving
  )

  return {
    // Data state
    product,
    customization,
    pricing,
    
    // Loading states
    isLoading,
    isLoadingPrice,
    isSaving,
    
    // Error states
    error,
    priceError,
    
    // Actions
    updateCustomization,
    saveDesign,
    shareDesign,
    resetCustomization,
    
    // Computed values
    hasChanges,
    isCustomizationValid
  }
}

/**
 * Hook for loading all customizable products
 */
export function useCustomizableProducts(category?: string) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        if (category) params.set('category', category)
        
        const response = await fetch(`/api/products/customizable?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to load products')
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error?.message || 'API returned unsuccessful response')
        }
        
        setProducts(data.data)
        
        // Extract available categories from headers
        const availableCategories = response.headers.get('X-Available-Categories')
        if (availableCategories) {
          setCategories(JSON.parse(availableCategories))
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products')
        console.error('Products loading error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [category])

  return {
    products,
    categories,
    isLoading,
    error
  }
}