/**
 * Material Customization Service - Phase 2 Architecture Refactor
 * Separates business logic from presentation logic following CLAUDE_RULES
 * Handles material switching, pricing, and customization state management
 */

'use client'

import type { ProductVariant, Material } from '@/types/customizer'

export interface MaterialCustomizationState {
  selectedMaterial: Material
  availableMaterials: Material[]
  isChangingMaterial: boolean
  lastChangeTime: number
  error: string | null
}

export interface MaterialChangeOptions {
  notifyPriceChange?: (price: number) => void
  notifyVariantChange?: (variant: ProductVariant) => void
  basePrice?: number
}

export interface MaterialCustomizationResult {
  success: boolean
  newMaterial?: Material
  newPrice?: number
  error?: string
  performanceMs?: number
}

/**
 * Service class for material customization business logic
 * Follows CLAUDE_RULES separation of concerns and performance requirements
 */
export class MaterialCustomizationService {
  private state: MaterialCustomizationState
  private performanceTarget = 100 // <100ms material changes per CLAUDE_RULES

  constructor(initialMaterial: Material, availableMaterials: Material[]) {
    this.state = {
      selectedMaterial: initialMaterial,
      availableMaterials,
      isChangingMaterial: false,
      lastChangeTime: 0,
      error: null
    }
  }

  /**
   * Get current customization state (read-only)
   */
  public getState(): Readonly<MaterialCustomizationState> {
    return { ...this.state }
  }

  /**
   * Change material with performance tracking and error handling
   */
  public async changeMaterial(
    newMaterialId: string,
    options: MaterialChangeOptions = {}
  ): Promise<MaterialCustomizationResult> {
    const startTime = performance.now()

    // Prevent duplicate changes
    if (this.state.selectedMaterial.id === newMaterialId) {
      return { success: true, newMaterial: this.state.selectedMaterial }
    }

    // Prevent rapid changes (debouncing)
    const timeSinceLastChange = startTime - this.state.lastChangeTime
    if (timeSinceLastChange < 50) { // 50ms debounce
      return { success: false, error: 'Material change too rapid' }
    }

    try {
      this.state.isChangingMaterial = true
      this.state.error = null

      // Find new material
      const newMaterial = this.state.availableMaterials.find(m => m.id === newMaterialId)
      if (!newMaterial) {
        throw new Error(`Material not found: ${newMaterialId}`)
      }

      // Update state
      this.state.selectedMaterial = newMaterial
      this.state.lastChangeTime = performance.now()

      // Calculate new price if basePrice provided
      let newPrice: number | undefined
      if (options.basePrice) {
        newPrice = Math.round(options.basePrice * newMaterial.priceMultiplier)
      }

      // Notify callbacks
      if (newPrice && options.notifyPriceChange) {
        options.notifyPriceChange(newPrice)
      }

      const performanceMs = performance.now() - startTime

      // Performance compliance check
      if (performanceMs > this.performanceTarget) {
        console.warn(`⚠️ Material change exceeded performance target: ${performanceMs.toFixed(1)}ms > ${this.performanceTarget}ms`)
      } else {

      }

      return {
        success: true,
        newMaterial,
        newPrice,
        performanceMs
      }

    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: this.state.error
      }
    } finally {
      this.state.isChangingMaterial = false
    }
  }

  /**
   * Get material by ID with validation
   */
  public getMaterialById(id: string): Material | null {
    return this.state.availableMaterials.find(m => m.id === id) || null
  }

  /**
   * Calculate price for material combination
   */
  public calculatePrice(basePrice: number, materialId?: string): number {
    const material = materialId 
      ? this.getMaterialById(materialId)
      : this.state.selectedMaterial

    if (!material) {
      console.warn(`Material not found for price calculation: ${materialId}`)
      return basePrice
    }

    return Math.round(basePrice * material.priceMultiplier)
  }

  /**
   * Validate material availability
   */
  public isMaterialAvailable(materialId: string): boolean {
    return this.state.availableMaterials.some(m => m.id === materialId)
  }

  /**
   * Get materials sorted by price multiplier
   */
  public getMaterialsSortedByPrice(): Material[] {
    return [...this.state.availableMaterials].sort((a, b) => a.priceMultiplier - b.priceMultiplier)
  }

  /**
   * Get premium materials (price multiplier > 1.0)
   */
  public getPremiumMaterials(): Material[] {
    return this.state.availableMaterials.filter(m => m.priceMultiplier > 1.0)
  }

  /**
   * Reset to initial state
   */
  public reset(initialMaterial?: Material): void {
    if (initialMaterial && this.isMaterialAvailable(initialMaterial.id)) {
      this.state.selectedMaterial = initialMaterial
    }
    this.state.isChangingMaterial = false
    this.state.error = null
    this.state.lastChangeTime = 0
  }

  /**
   * Clear any existing errors
   */
  public clearError(): void {
    this.state.error = null
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): {
    target: number
    lastChangeTime: number
    timeSinceLastChange: number
  } {
    return {
      target: this.performanceTarget,
      lastChangeTime: this.state.lastChangeTime,
      timeSinceLastChange: performance.now() - this.state.lastChangeTime
    }
  }
}

/**
 * Factory function to create MaterialCustomizationService instances
 */
export function createMaterialCustomizationService(
  initialMaterial: Material,
  availableMaterials: Material[]
): MaterialCustomizationService {
  return new MaterialCustomizationService(initialMaterial, availableMaterials)
}

/**
 * Hook-like interface for React components (without actual React hooks)
 * This allows easy integration while maintaining service separation
 */
export interface MaterialCustomizationHookResult {
  service: MaterialCustomizationService
  state: MaterialCustomizationState
  changeMaterial: (materialId: string, options?: MaterialChangeOptions) => Promise<MaterialCustomizationResult>
  calculatePrice: (basePrice: number, materialId?: string) => number
  reset: (initialMaterial?: Material) => void
}

export function useMaterialCustomizationService(
  initialMaterial: Material,
  availableMaterials: Material[]
): MaterialCustomizationHookResult {
  const service = createMaterialCustomizationService(initialMaterial, availableMaterials)

  return {
    service,
    state: service.getState(),
    changeMaterial: (materialId, options) => service.changeMaterial(materialId, options),
    calculatePrice: (basePrice, materialId) => service.calculatePrice(basePrice, materialId),
    reset: (initialMaterial) => service.reset(initialMaterial)
  }
}