/**
 * Customizer State Service - Phase 2 Architecture Refactor  
 * Manages overall customizer state, bridge service integration, and mode switching
 * Follows CLAUDE_RULES separation of concerns and error-first patterns
 */

'use client'

import type { ProductVariant, Material } from '@/types/customizer'
import { MaterialCustomizationService } from './material-customization.service'

export interface CustomizerMode {
  type: 'bridge' | 'legacy'
  productId?: string
  initialMaterialId?: string
  useBridgeService?: boolean
}

export interface CustomizerState {
  mode: CustomizerMode
  isLoading: boolean
  currentFrame: number
  viewerError: Error | null
  currentViewerMode: 'sequences' | 'threejs' | 'ar'
  selectedVariant: ProductVariant | null
  performance: {
    initStartTime: number
    loadTime?: number
    lastActionTime: number
  }
}

export interface CustomizerActions {
  setLoading: (loading: boolean) => void
  setViewerError: (error: Error | null) => void
  setCurrentFrame: (frame: number) => void
  setViewerMode: (mode: 'sequences' | 'threejs' | 'ar') => void
  setSelectedVariant: (variant: ProductVariant | null) => void
  recordPerformanceMetric: (action: string, durationMs: number) => void
}

export interface CustomizerServiceConfig {
  mode: CustomizerMode
  onVariantChange?: (variant: ProductVariant) => void
  onPriceChange?: (price: number) => void
  onError?: (error: Error) => void
  performanceTarget?: number
}

/**
 * Main service class for customizer state management
 * Integrates with bridge service and legacy modes
 */
export class CustomizerStateService {
  private state: CustomizerState
  private materialService: MaterialCustomizationService | null = null
  private config: CustomizerServiceConfig
  private errorHandlers: Array<(error: Error) => void> = []

  constructor(config: CustomizerServiceConfig) {
    this.config = config
    this.state = this.initializeState(config.mode)

    // Register error handler
    if (config.onError) {
      this.errorHandlers.push(config.onError)
    }
  }

  /**
   * Initialize state based on mode
   */
  private initializeState(mode: CustomizerMode): CustomizerState {
    return {
      mode,
      isLoading: true,
      currentFrame: 0,
      viewerError: null,
      currentViewerMode: 'sequences',
      selectedVariant: null,
      performance: {
        initStartTime: performance.now(),
        lastActionTime: performance.now()
      }
    }
  }

  /**
   * Get current state (read-only)
   */
  public getState(): Readonly<CustomizerState> {
    return { ...this.state }
  }

  /**
   * Initialize material service when materials are available
   */
  public initializeMaterialService(
    initialMaterial: Material,
    availableMaterials: Material[]
  ): void {
    try {
      this.materialService = new MaterialCustomizationService(initialMaterial, availableMaterials)
      console.log(`✅ Material service initialized with ${availableMaterials.length} materials`)
    } catch (error) {
      this.handleError(new Error(`Failed to initialize material service: ${error}`))
    }
  }

  /**
   * Handle loading state changes with performance tracking
   */
  public setLoading(loading: boolean): void {
    const wasLoading = this.state.isLoading
    this.state.isLoading = loading

    // Track load completion time
    if (wasLoading && !loading && !this.state.performance.loadTime) {
      this.state.performance.loadTime = performance.now() - this.state.performance.initStartTime
      console.log(`✅ Customizer loaded in ${this.state.performance.loadTime.toFixed(1)}ms`)
      
      // Check performance compliance
      const target = this.config.performanceTarget || 2000 // <2s initialization per CLAUDE_RULES
      if (this.state.performance.loadTime > target) {
        console.warn(`⚠️ Load time exceeded target: ${this.state.performance.loadTime.toFixed(1)}ms > ${target}ms`)
      }
    }

    this.updateLastAction()
  }

  /**
   * Handle viewer errors with recovery patterns
   */
  public setViewerError(error: Error | null): void {
    this.state.viewerError = error
    this.updateLastAction()

    if (error) {
      this.handleError(error)
    }
  }

  /**
   * Update current frame with validation
   */
  public setCurrentFrame(frame: number): void {
    if (frame >= 0) {
      this.state.currentFrame = frame
      this.updateLastAction()
    }
  }

  /**
   * Change viewer mode with performance tracking
   */
  public setViewerMode(mode: 'sequences' | 'threejs' | 'ar'): void {
    const startTime = performance.now()
    const previousMode = this.state.currentViewerMode
    
    this.state.currentViewerMode = mode
    this.updateLastAction()

    const switchTime = performance.now() - startTime
    console.log(`🔄 Viewer mode changed from ${previousMode} to ${mode} in ${switchTime.toFixed(1)}ms`)
  }

  /**
   * Update selected variant with validation
   */
  public setSelectedVariant(variant: ProductVariant | null): void {
    this.state.selectedVariant = variant
    this.updateLastAction()

    // Notify callback
    if (variant && this.config.onVariantChange) {
      try {
        this.config.onVariantChange(variant)
      } catch (error) {
        this.handleError(new Error(`Variant change callback failed: ${error}`))
      }
    }
  }

  /**
   * Change material using integrated material service
   */
  public async changeMaterial(
    materialId: string,
    basePrice?: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.materialService) {
      const error = 'Material service not initialized'
      this.handleError(new Error(error))
      return { success: false, error }
    }

    try {
      const result = await this.materialService.changeMaterial(materialId, {
        basePrice,
        notifyPriceChange: this.config.onPriceChange,
        notifyVariantChange: this.config.onVariantChange
      })

      this.updateLastAction()

      if (!result.success) {
        this.handleError(new Error(result.error || 'Material change failed'))
      }

      return result

    } catch (error) {
      const errorMessage = `Material change failed: ${error}`
      this.handleError(new Error(errorMessage))
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get material service (if initialized)
   */
  public getMaterialService(): MaterialCustomizationService | null {
    return this.materialService
  }

  /**
   * Record performance metric for monitoring
   */
  public recordPerformanceMetric(action: string, durationMs: number): void {
    const target = this.config.performanceTarget || 300 // Default CLAUDE_RULES target

    if (durationMs > target) {
      console.warn(`⚠️ Performance: ${action} took ${durationMs.toFixed(1)}ms (target: ${target}ms)`)
    } else {
      console.log(`✅ Performance: ${action} completed in ${durationMs.toFixed(1)}ms`)
    }

    this.updateLastAction()
  }

  /**
   * Reset customizer to initial state
   */
  public reset(): void {
    const mode = this.state.mode
    this.state = this.initializeState(mode)
    
    if (this.materialService) {
      this.materialService.reset()
    }

    console.log('🔄 Customizer state reset')
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    initTime?: number
    loadTime?: number
    timeSinceLastAction: number
    isPerformanceCompliant: boolean
  } {
    const now = performance.now()
    const initTime = this.state.performance.loadTime
    const timeSinceLastAction = now - this.state.performance.lastActionTime
    const target = this.config.performanceTarget || 2000

    return {
      initTime,
      loadTime: this.state.performance.loadTime,
      timeSinceLastAction,
      isPerformanceCompliant: !initTime || initTime <= target
    }
  }

  /**
   * Add error handler
   */
  public addErrorHandler(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler)
  }

  /**
   * Remove error handler
   */
  public removeErrorHandler(handler: (error: Error) => void): void {
    const index = this.errorHandlers.indexOf(handler)
    if (index > -1) {
      this.errorHandlers.splice(index, 1)
    }
  }

  /**
   * Private: Handle errors with all registered handlers
   */
  private handleError(error: Error): void {
    console.error('🚨 Customizer error:', error)
    
    this.errorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    })
  }

  /**
   * Private: Update last action timestamp
   */
  private updateLastAction(): void {
    this.state.performance.lastActionTime = performance.now()
  }
}

/**
 * Factory function to create CustomizerStateService instances
 */
export function createCustomizerStateService(config: CustomizerServiceConfig): CustomizerStateService {
  return new CustomizerStateService(config)
}

/**
 * Utility to determine customizer mode from props
 * Pure bridge service mode only - legacy mode eliminated per CLAUDE_RULES
 */
export function determineCustomizerMode(props: {
  productId?: string
  useBridgeService?: boolean
  initialMaterialId?: string
}): CustomizerMode {
  // Always use bridge service - legacy mode eliminated
  return {
    type: 'bridge',
    productId: props.productId || 'ring-001',
    initialMaterialId: props.initialMaterialId || '18k-rose-gold',
    useBridgeService: true
  }
}