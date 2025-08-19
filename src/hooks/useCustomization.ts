'use client'

/**
 * Product Customization Hook
 * Manages customization state, pricing calculations, and SKU generation
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface CustomizationOptions {
  material?: string
  gemstone?: string
  size?: string
  finish?: string
  engraving?: string
}

interface ProductForCustomization {
  id: string
  price: {
    base: number
    currency: string
  }
  customization: {
    materials?: Array<{
      id: string
      name: string
      priceModifier: number
    }>
    gemstones?: Array<{
      id: string
      name: string
      priceModifier: number
    }>
    sizes?: Array<{
      value: string
      label: string
      priceModifier: number
    }>
    finishes?: Array<{
      id: string
      name: string
      priceModifier: number
    }>
    engraving?: {
      enabled: boolean
      priceModifier: number
    }
  }
}

export function useCustomization(
  product: ProductForCustomization,
  initialCustomization: CustomizationOptions = {}
) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Customization state
  const [customization, setCustomization] = useState<CustomizationOptions>(initialCustomization)
  
  // Update URL when customization changes
  const updateURL = useCallback((newCustomization: CustomizationOptions) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update or remove parameters
    Object.entries(newCustomization).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Update URL without triggering navigation
    const newURL = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState(null, '', newURL)
  }, [searchParams])
  
  // Update customization
  const updateCustomization = useCallback((
    key: keyof CustomizationOptions,
    value: string | undefined
  ) => {
    setCustomization(prev => {
      const newCustomization = { ...prev, [key]: value }
      updateURL(newCustomization)
      return newCustomization
    })
  }, [updateURL])
  
  // Reset customization
  const resetCustomization = useCallback(() => {
    const defaultCustomization: CustomizationOptions = {
      material: product.customization.materials?.[0]?.id,
      gemstone: product.customization.gemstones?.[0]?.id,
      size: product.customization.sizes?.[0]?.value,
      finish: product.customization.finishes?.[0]?.id,
      engraving: ''
    }
    
    setCustomization(defaultCustomization)
    updateURL(defaultCustomization)
  }, [product.customization, updateURL])
  
  // Calculate custom price
  const customPrice = useMemo(() => {
    let price = product.price.base
    
    // Add material price modifier
    if (customization.material) {
      const material = product.customization.materials?.find(m => m.id === customization.material)
      if (material) {
        price += material.priceModifier
      }
    }
    
    // Add gemstone price modifier
    if (customization.gemstone) {
      const gemstone = product.customization.gemstones?.find(g => g.id === customization.gemstone)
      if (gemstone) {
        price += gemstone.priceModifier
      }
    }
    
    // Add size price modifier
    if (customization.size) {
      const size = product.customization.sizes?.find(s => s.value === customization.size)
      if (size) {
        price += size.priceModifier
      }
    }
    
    // Add finish price modifier
    if (customization.finish) {
      const finish = product.customization.finishes?.find(f => f.id === customization.finish)
      if (finish) {
        price += finish.priceModifier
      }
    }
    
    // Add engraving price modifier
    if (customization.engraving && customization.engraving.trim() !== '') {
      const engravingOption = product.customization.engraving
      if (engravingOption?.enabled) {
        price += engravingOption.priceModifier
      }
    }
    
    return Math.max(0, price) // Ensure price doesn't go negative
  }, [product, customization])
  
  // Generate custom SKU
  const customSKU = useMemo(() => {
    const baseSKU = product.id.slice(-8).toUpperCase()
    const parts = [baseSKU]
    
    if (customization.material) {
      parts.push(customization.material.slice(-3).toUpperCase())
    }
    
    if (customization.gemstone) {
      parts.push(customization.gemstone.slice(-3).toUpperCase())
    }
    
    if (customization.size) {
      parts.push(customization.size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
    }
    
    if (customization.finish) {
      parts.push(customization.finish.slice(-2).toUpperCase())
    }
    
    if (customization.engraving && customization.engraving.trim() !== '') {
      parts.push('ENG')
    }
    
    return parts.join('-')
  }, [product.id, customization])
  
  // Validate customization
  const isValidCustomization = useMemo(() => {
    // Check if all required options are selected
    const hasRequiredMaterial = !product.customization.materials || customization.material
    const hasRequiredGemstone = !product.customization.gemstones || customization.gemstone
    const hasRequiredSize = !product.customization.sizes || customization.size
    const hasRequiredFinish = !product.customization.finishes || customization.finish
    
    // Validate engraving length if provided
    const isEngravingValid = !customization.engraving || 
      customization.engraving.length <= (product.customization.engraving?.maxLength || 50)
    
    return hasRequiredMaterial && hasRequiredGemstone && hasRequiredSize && hasRequiredFinish && isEngravingValid
  }, [product.customization, customization])
  
  // Get customization summary for display
  const customizationSummary = useMemo(() => {
    const summary: Array<{ label: string; value: string }> = []
    
    if (customization.material) {
      const material = product.customization.materials?.find(m => m.id === customization.material)
      if (material) {
        summary.push({ label: 'Material', value: material.name })
      }
    }
    
    if (customization.gemstone) {
      const gemstone = product.customization.gemstones?.find(g => g.id === customization.gemstone)
      if (gemstone) {
        summary.push({ label: 'Gemstone', value: gemstone.name })
      }
    }
    
    if (customization.size) {
      const size = product.customization.sizes?.find(s => s.value === customization.size)
      if (size) {
        summary.push({ label: 'Size', value: size.label })
      }
    }
    
    if (customization.finish) {
      const finish = product.customization.finishes?.find(f => f.id === customization.finish)
      if (finish) {
        summary.push({ label: 'Finish', value: finish.name })
      }
    }
    
    if (customization.engraving && customization.engraving.trim() !== '') {
      summary.push({ label: 'Engraving', value: customization.engraving })
    }
    
    return summary
  }, [product.customization, customization])
  
  // Price breakdown for transparency
  const priceBreakdown = useMemo(() => {
    const breakdown = [
      { label: 'Base Price', amount: product.price.base }
    ]
    
    if (customization.material) {
      const material = product.customization.materials?.find(m => m.id === customization.material)
      if (material && material.priceModifier !== 0) {
        breakdown.push({
          label: `${material.name} Premium`,
          amount: material.priceModifier
        })
      }
    }
    
    if (customization.gemstone) {
      const gemstone = product.customization.gemstones?.find(g => g.id === customization.gemstone)
      if (gemstone && gemstone.priceModifier !== 0) {
        breakdown.push({
          label: `${gemstone.name} Premium`,
          amount: gemstone.priceModifier
        })
      }
    }
    
    if (customization.size) {
      const size = product.customization.sizes?.find(s => s.value === customization.size)
      if (size && size.priceModifier !== 0) {
        breakdown.push({
          label: `Size ${size.label} Adjustment`,
          amount: size.priceModifier
        })
      }
    }
    
    if (customization.finish) {
      const finish = product.customization.finishes?.find(f => f.id === customization.finish)
      if (finish && finish.priceModifier !== 0) {
        breakdown.push({
          label: `${finish.name} Finish`,
          amount: finish.priceModifier
        })
      }
    }
    
    if (customization.engraving && customization.engraving.trim() !== '') {
      const engravingOption = product.customization.engraving
      if (engravingOption?.enabled && engravingOption.priceModifier !== 0) {
        breakdown.push({
          label: 'Engraving',
          amount: engravingOption.priceModifier
        })
      }
    }
    
    return breakdown
  }, [product, customization])
  
  return {
    customization,
    updateCustomization,
    resetCustomization,
    customPrice,
    customSKU,
    isValidCustomization,
    customizationSummary,
    priceBreakdown
  }
}