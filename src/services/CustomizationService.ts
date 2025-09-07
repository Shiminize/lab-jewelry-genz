/**
 * CustomizationService - Single Source of Truth for All Customizer Components
 * CLAUDE_RULES.md compliant: service layer for complex features
 * Consolidates material management across ProductCustomizer, CustomizationPanel, and CustomizerPreviewSection
 */

import { validateMaterialId } from '@/lib/security'
import type { Material, MaterialId } from '@/components/customizer/types'

// Single source of truth for available materials
export const CUSTOMIZATION_MATERIALS: Material[] = [
  {
    id: 'platinum',
    name: 'platinum',
    displayName: 'Platinum',
    priceModifier: 0,
    color: 'rgb(229, 228, 226)',
    pbrProperties: {
      metalness: 0.9,
      roughness: 0.05,
      reflectivity: 0.8,
      color: 'rgb(229, 228, 226)'
    }
  },
  {
    id: '18k-white-gold',
    name: '18k-white-gold',
    displayName: '18K White Gold',
    priceModifier: -200,
    color: 'rgb(248, 248, 255)',
    pbrProperties: {
      metalness: 0.85,
      roughness: 0.08,
      reflectivity: 0.75,
      color: 'rgb(248, 248, 255)'
    }
  },
  {
    id: '18k-yellow-gold',
    name: '18k-yellow-gold',
    displayName: '18K Yellow Gold',
    priceModifier: -300,
    color: 'rgb(255, 215, 0)',
    pbrProperties: {
      metalness: 0.88,
      roughness: 0.06,
      reflectivity: 0.82,
      color: 'rgb(255, 215, 0)'
    }
  },
  {
    id: '18k-rose-gold',
    name: '18k-rose-gold',
    displayName: '18K Rose Gold',
    priceModifier: -250,
    color: 'rgb(232, 180, 184)',
    pbrProperties: {
      metalness: 0.86,
      roughness: 0.07,
      reflectivity: 0.78,
      color: 'rgb(232, 180, 184)'
    }
  }
]

export interface AssetPaths {
  available: boolean
  assetPaths: string[]
  totalValidFrames?: number // Optional field for actual frame count per material
}

export interface PriceValidationResult {
  success: boolean
  validatedPrice: number
  error?: string
}

export interface CustomizationVariant {
  materialId: MaterialId
  price: number
}

/**
 * CustomizationService - Unified service for all customizer components
 */
export class CustomizationService {
  private static instance: CustomizationService
  private basePrice: number = 1500

  private constructor() {}

  static getInstance(): CustomizationService {
    if (!CustomizationService.instance) {
      CustomizationService.instance = new CustomizationService()
    }
    return CustomizationService.instance
  }

  /**
   * Get all available materials (single source of truth)
   */
  getMaterials(): Material[] {
    return CUSTOMIZATION_MATERIALS
  }

  /**
   * Get material by ID with validation
   */
  getMaterial(materialId: MaterialId): Material | null {
    const validId = validateMaterialId(materialId)
    if (!validId) return null
    
    return CUSTOMIZATION_MATERIALS.find(m => m.id === validId) || null
  }

  /**
   * Calculate price for material selection
   */
  calculatePrice(materialId: MaterialId): number {
    const material = this.getMaterial(materialId)
    if (!material) return this.basePrice
    
    return this.basePrice + material.priceModifier
  }

  /**
   * Server-side price validation with CSRF protection
   */
  async validatePriceWithServer(productId: string, materialId: MaterialId): Promise<PriceValidationResult> {
    try {
      // Get CSRF token
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                        document.cookie.split('; ').find(row => row.startsWith('csrf-token='))?.split('=')[1]
      
      const response = await fetch('/api/products/validate-price', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          productId,
          materialId: validateMaterialId(materialId)
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        return {
          success: true,
          validatedPrice: result.data.validatedPrice
        }
      }
      
      throw new Error('Server validation failed')
    } catch (error) {
      // Fallback to client calculation
      return {
        success: false,
        validatedPrice: this.calculatePrice(materialId),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Fetch assets for material with error handling
   */
  async fetchAssets(productId: string, materialId: MaterialId): Promise<AssetPaths> {
    try {
      const validMaterialId = validateMaterialId(materialId)
      if (!validMaterialId) {
        throw new Error('Invalid material ID')
      }

      const response = await fetch(
        `/api/products/customizable/${productId}/assets?materialId=${validMaterialId}`,
        { cache: 'no-store' }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data.assets.available) {
        return data.data.assets
      }
      
      throw new Error('Assets not available')
    } catch (error) {
      // Return fallback asset paths
      return {
        available: false,
        assetPaths: []
      }
    }
  }

  /**
   * Create customization variant data
   */
  createVariant(materialId: MaterialId, validatedPrice?: number): CustomizationVariant {
    return {
      materialId: validateMaterialId(materialId) || '18k-rose-gold',
      price: validatedPrice || this.calculatePrice(materialId)
    }
  }

  /**
   * Check if material supports prismatic shadows (Phase 3 compatibility)
   */
  supportsPrismaticShadows(materialId: MaterialId): boolean {
    const material = this.getMaterial(materialId)
    if (!material) return false
    
    const name = material.displayName.toLowerCase()
    return name.includes('gold') || name.includes('platinum')
  }

  /**
   * Get Aurora focus class for material (Phase 3 compatibility)  
   */
  getAuroraFocusClass(materialId: MaterialId): string {
    const material = this.getMaterial(materialId)
    if (!material) return 'focus:aurora-focus-default'
    
    const name = material.displayName.toLowerCase()
    if (name.includes('gold') && !name.includes('rose') && !name.includes('white')) {
      return 'focus:aurora-focus-gold'
    }
    if (name.includes('rose') && name.includes('gold')) {
      return 'focus:aurora-focus-rose-gold'
    }
    if (name.includes('platinum') || name.includes('white')) {
      return 'focus:aurora-focus-platinum'
    }
    return 'focus:aurora-focus-default'
  }

  /**
   * Get prismatic shadow class for material (Phase 3 compatibility)
   */
  getPrismaticShadowClass(materialId: MaterialId): string {
    const material = this.getMaterial(materialId)
    if (!material) return ''
    
    const name = material.displayName.toLowerCase()
    if (name.includes('gold') && !name.includes('rose') && !name.includes('white')) {
      return 'prismatic-shadow-gold prismatic-shadow-gold'
    }
    if (name.includes('rose') && name.includes('gold')) {
      return 'prismatic-shadow-rose-gold prismatic-shadow-rose-gold'
    }
    if (name.includes('white') && name.includes('gold')) {
      return 'prismatic-shadow-white-gold prismatic-shadow-white-gold'
    }
    if (name.includes('platinum')) {
      return 'prismatic-shadow-platinum prismatic-shadow-platinum'
    }
    return ''
  }

  /**
   * Get material-specific checkmark color class
   */
  getCheckmarkColorClass(materialId: MaterialId): string {
    const material = this.getMaterial(materialId)
    if (!material) return ''
    
    const name = material.displayName.toLowerCase()
    if (name.includes('gold') && !name.includes('rose') && !name.includes('white')) {
      return 'checkmark-gold'
    }
    if (name.includes('rose') && name.includes('gold')) {
      return 'checkmark-rose-gold'
    }
    if (name.includes('white') && name.includes('gold')) {
      return 'checkmark-white-gold'
    }
    if (name.includes('platinum')) {
      return 'checkmark-platinum'
    }
    return ''
  }
}

// Export singleton instance
export const customizationService = CustomizationService.getInstance()

// Export types for external use
export type { Material, MaterialId, AssetPaths, PriceValidationResult, CustomizationVariant }