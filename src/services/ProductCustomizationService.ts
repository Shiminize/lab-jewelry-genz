/**
 * ProductCustomizationService - Phase 3B Database Integration
 * Bridges MongoDB products with 3D customizer frontend components
 * Transforms database products into ProductVariant format with type safety
 */

import type { IProduct } from '@/lib/schemas/product.schema'
import type { ProductVariant, Material } from '@/types/customizer'
import type { 
  CustomizerRenderingAssets, 
  CustomizerMaterialProperties, 
  CustomizerOption,
  VariantGenerationConfig 
} from '@/lib/schemas/product-customizer-enhancement'
import { typeGuards, createSafeMaterial } from '@/lib/material-safety-utils'
import { SAFE_DEFAULTS } from '@/lib/material-safety-utils'

// Service configuration
interface CustomizationServiceConfig {
  baseUrl: string
  defaultImagePath: string
  fallbackAssetPath: string
  enableCaching: boolean
  cacheExpiration: number // minutes
  performanceTracking: boolean
}

// Variant generation result
interface VariantGenerationResult {
  variants: ProductVariant[]
  generatedCount: number
  errors: string[]
  warnings: string[]
  processingTimeMs: number
}

// Price calculation result
interface PriceCalculationResult {
  basePrice: number
  materialAdjustment: number
  finalPrice: number
  breakdown: {
    material: string
    adjustment: number
    percentage: number
  }[]
}

// Asset resolution result
interface AssetResolutionResult {
  imageSequencePath: string
  modelPath?: string
  thumbnailUrl: string
  isGenerated: boolean
  quality: 'low' | 'medium' | 'high'
}

export class ProductCustomizationService {
  private config: CustomizationServiceConfig
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private performanceMetrics: { [key: string]: number[] } = {}

  constructor(config: Partial<CustomizationServiceConfig> = {}) {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      defaultImagePath: '/images/products/3d-sequences',
      fallbackAssetPath: '/images/products/3d-sequences/default-sequence',
      enableCaching: true,
      cacheExpiration: 30, // 30 minutes
      performanceTracking: process.env.NODE_ENV === 'development',
      ...config
    }
  }

  /**
   * Transform database product into customizer variants
   * Main method that bridges MongoDB products with frontend customizer
   */
  public async generateVariantsFromProduct(product: IProduct): Promise<VariantGenerationResult> {
    const startTime = performance.now()
    const result: VariantGenerationResult = {
      variants: [],
      generatedCount: 0,
      errors: [],
      warnings: [],
      processingTimeMs: 0
    }

    try {
      // Validate product has customizer capabilities
      if (!this.validateProductForCustomization(product)) {
        result.errors.push('Product does not support customization')
        return result
      }

      // Extract material options from product schema
      const materialOptions = this.extractMaterialOptions(product)
      if (materialOptions.length === 0) {
        result.warnings.push('No material options found, using default materials')
      }

      // Generate variants for each material combination
      for (const materialOption of materialOptions) {
        for (const materialValue of materialOption.options) {
          try {
            const variant = await this.createVariantFromMaterial(
              product, 
              materialOption, 
              materialValue
            )
            
            if (variant) {
              result.variants.push(variant)
              result.generatedCount++
            }
          } catch (error) {
            result.errors.push(`Failed to create variant for ${materialValue.label}: ${error}`)
          }
        }
      }

      // Apply variant generation configuration if available
      if (product.variantGeneration?.enabled && product.variantGeneration.maxVariants) {
        result.variants = result.variants.slice(0, product.variantGeneration.maxVariants)
      }

      // Cache the results if caching is enabled
      if (this.config.enableCaching) {
        this.setCacheEntry(`variants_${product._id}`, result.variants)
      }

    } catch (error) {
      result.errors.push(`Variant generation failed: ${error}`)
    }

    result.processingTimeMs = performance.now() - startTime
    this.trackPerformance('generateVariantsFromProduct', result.processingTimeMs)

    return result
  }

  /**
   * Create a single ProductVariant from a database product and material option
   */
  private async createVariantFromMaterial(
    product: IProduct,
    materialOption: CustomizerOption,
    materialValue: any
  ): Promise<ProductVariant | null> {
    try {
      // Create safe material object with validation
      const material = this.createMaterialFromOption(materialValue, product)
      if (!material) {
        return null
      }

      // Resolve asset paths for this material
      const assets = await this.resolveAssets(product, materialValue, material)

      // Generate variant ID based on product and material
      const variantId = this.generateVariantId(product, material)

      // Create the ProductVariant
      const variant: ProductVariant = {
        id: variantId,
        name: this.generateVariantName(product, material),
        assetPath: assets.imageSequencePath,
        modelPath: assets.modelPath,
        imageCount: this.getImageCountForMaterial(product, materialValue),
        material: material,
        description: this.generateVariantDescription(product, material)
      }

      // Validate the created variant
      if (!typeGuards.isProductVariant(variant)) {
        console.warn(`Generated variant failed validation: ${variantId}`)
        return null
      }

      return variant
    } catch (error) {
      console.error('Error creating variant from material:', error)
      return null
    }
  }

  /**
   * Create a safe Material object from customizer option value
   */
  private createMaterialFromOption(materialValue: any, product: IProduct): Material | null {
    try {
      // Extract material properties from the customizer enhancement
      const materialProps = materialValue.materialProperties as CustomizerMaterialProperties

      const material = createSafeMaterial({
        id: materialValue.value || `material_${Date.now()}`,
        name: materialValue.label || 'Unknown Material',
        description: materialValue.description || '',
        priceMultiplier: this.calculatePriceMultiplier(materialValue, product),
        color: materialProps?.color || materialValue.hexColor || SAFE_DEFAULTS.MATERIAL_COLOR,
        properties: {
          metalness: materialProps?.metalness ?? 1.0,
          roughness: materialProps?.roughness ?? 0.1,
          reflectivity: materialProps?.reflectivity ?? 0.9,
          color: materialProps?.color || materialValue.hexColor || SAFE_DEFAULTS.MATERIAL_COLOR
        }
      })

      return material
    } catch (error) {
      console.error('Error creating material from option:', error)
      return null
    }
  }

  /**
   * Resolve asset paths for a specific material variant
   */
  private async resolveAssets(
    product: IProduct, 
    materialValue: any, 
    material: Material
  ): Promise<AssetResolutionResult> {
    const result: AssetResolutionResult = {
      imageSequencePath: this.config.fallbackAssetPath,
      thumbnailUrl: '',
      isGenerated: false,
      quality: 'medium'
    }

    try {
      // Check if product has customizer-specific assets
      if (product.customizerAssets?.imageSequences) {
        const materialAsset = product.customizerAssets.imageSequences.find(
          seq => seq.materialId === material.id
        )
        
        if (materialAsset) {
          result.imageSequencePath = materialAsset.basePath
          result.quality = materialAsset.quality
          result.isGenerated = materialAsset.isGenerated
        }
      }

      // Check for 3D model assets
      if (product.customizerAssets?.models3D) {
        const model3D = product.customizerAssets.models3D.find(
          model => model.materialId === material.id
        )
        
        if (model3D) {
          result.modelPath = model3D.glbPath
        }
      }

      // Check for thumbnail assets
      if (product.customizerAssets?.thumbnails) {
        const thumbnail = product.customizerAssets.thumbnails.find(
          thumb => thumb.materialId === material.id && thumb.size === 'medium'
        )
        
        if (thumbnail) {
          result.thumbnailUrl = thumbnail.url
        }
      }

      // Fallback to rendering assets from option value
      if (!result.imageSequencePath || result.imageSequencePath === this.config.fallbackAssetPath) {
        if (materialValue.renderingAssets?.imageSequencePath) {
          result.imageSequencePath = materialValue.renderingAssets.imageSequencePath
        } else {
          // Generate path based on product and material
          result.imageSequencePath = this.generateAssetPath(product, material)
        }
      }

      // Set thumbnail if not found
      if (!result.thumbnailUrl) {
        if (materialValue.renderingAssets?.thumbnailUrl) {
          result.thumbnailUrl = materialValue.renderingAssets.thumbnailUrl
        } else {
          result.thumbnailUrl = this.generateThumbnailPath(product, material)
        }
      }

    } catch (error) {
      console.error('Error resolving assets:', error)
    }

    return result
  }

  /**
   * Calculate price multiplier for material option
   */
  private calculatePriceMultiplier(materialValue: any, product: IProduct): number {
    try {
      // Use price modifier from the option
      if (typeof materialValue.priceModifier === 'number') {
        // Convert absolute price modifier to multiplier
        const basePrice = product.basePrice || 1000
        return 1.0 + (materialValue.priceModifier / basePrice)
      }

      // Use material type mapping for standard materials
      const materialTypeMultipliers: { [key: string]: number } = {
        'platinum': 1.2,
        'white-gold': 1.0,
        'yellow-gold': 0.95,
        'rose-gold': 0.95,
        'silver': 0.7,
        'titanium': 0.8
      }

      const materialId = materialValue.value?.toLowerCase() || ''
      for (const [type, multiplier] of Object.entries(materialTypeMultipliers)) {
        if (materialId.includes(type.replace('-', '')) || materialId.includes(type)) {
          return multiplier
        }
      }

      return 1.0 // Default multiplier
    } catch (error) {
      console.error('Error calculating price multiplier:', error)
      return 1.0
    }
  }

  /**
   * Extract material options from product customization options
   */
  private extractMaterialOptions(product: IProduct): CustomizerOption[] {
    try {
      // Check enhanced customizer options first
      if (product.customizerOptions && Array.isArray(product.customizerOptions)) {
        const materialOptions = product.customizerOptions.filter(
          (option: any) => option.type === 'material'
        )
        if (materialOptions.length > 0) {
          return materialOptions as CustomizerOption[]
        }
      }

      // Fallback to basic customization options
      if (product.customizationOptions && Array.isArray(product.customizationOptions)) {
        const materialOptions = product.customizationOptions.filter(
          option => option.type === 'material'
        )
        
        // Convert basic options to enhanced format
        return materialOptions.map(option => ({
          ...option,
          options: option.options.map(opt => ({
            ...opt,
            stockLevel: 100,
            isInStock: true,
            displayOrder: 0,
            popularityScore: 0,
            averageRating: 0,
            compatibleWith: [],
            incompatibleWith: [],
            renderingAssets: {}
          })),
          maxSelections: option.maxSelections || 1,
          minSelections: 0,
          displayMode: 'grid' as const,
          conditionalDisplay: [],
          validationRules: []
        })) as CustomizerOption[]
      }

      return []
    } catch (error) {
      console.error('Error extracting material options:', error)
      return []
    }
  }

  /**
   * Generate variant ID based on product and material
   */
  private generateVariantId(product: IProduct, material: Material): string {
    const productSlug = product.seo?.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const materialSlug = material.id.toLowerCase()
    return `${productSlug}-${materialSlug}`
  }

  /**
   * Generate human-readable variant name
   */
  private generateVariantName(product: IProduct, material: Material): string {
    return `${product.name} - ${material.name}`
  }

  /**
   * Generate variant description
   */
  private generateVariantDescription(product: IProduct, material: Material): string {
    return `${product.shortDescription || product.description} in ${material.name.toLowerCase()}`
  }

  /**
   * Get image count for material from product configuration
   */
  private getImageCountForMaterial(product: IProduct, materialValue: any): number {
    try {
      // Check customizer assets for specific frame count
      if (product.customizerAssets?.imageSequences) {
        const materialAsset = product.customizerAssets.imageSequences.find(
          seq => seq.materialId === materialValue.value
        )
        if (materialAsset) {
          return materialAsset.frameCount
        }
      }

      // Default to 36 frames for full rotation
      return 36
    } catch (error) {
      return 36
    }
  }

  /**
   * Generate asset path based on product and material
   */
  private generateAssetPath(product: IProduct, material: Material): string {
    const productSlug = product.seo?.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `${this.config.defaultImagePath}/${productSlug}-${material.id}-sequence`
  }

  /**
   * Generate thumbnail path
   */
  private generateThumbnailPath(product: IProduct, material: Material): string {
    return `${this.generateAssetPath(product, material)}/0.webp`
  }

  /**
   * Validate product supports customization
   */
  private validateProductForCustomization(product: IProduct): boolean {
    return !!(
      product.isCustomizable &&
      (product.customizationOptions?.length > 0 || product.customizerOptions?.length > 0) &&
      product.status === 'active'
    )
  }

  /**
   * Calculate total price with material adjustments
   */
  public calculatePrice(product: IProduct, material: Material, quantity: number = 1): PriceCalculationResult {
    const basePrice = product.basePrice || 0
    const materialAdjustment = (material.priceMultiplier - 1.0) * basePrice
    const finalPrice = (basePrice + materialAdjustment) * quantity

    return {
      basePrice,
      materialAdjustment,
      finalPrice: Math.max(0, finalPrice),
      breakdown: [{
        material: material.name,
        adjustment: materialAdjustment,
        percentage: ((material.priceMultiplier - 1.0) * 100)
      }]
    }
  }

  /**
   * Get cached variants for a product
   */
  public getCachedVariants(productId: string): ProductVariant[] | null {
    if (!this.config.enableCaching) return null
    
    const cached = this.getCacheEntry(`variants_${productId}`)
    return cached as ProductVariant[] || null
  }

  /**
   * Cache management methods
   */
  private setCacheEntry(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private getCacheEntry(key: string): any {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = (Date.now() - entry.timestamp) > (this.config.cacheExpiration * 60 * 1000)
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Performance tracking
   */
  private trackPerformance(operation: string, duration: number): void {
    if (!this.config.performanceTracking) return

    if (!this.performanceMetrics[operation]) {
      this.performanceMetrics[operation] = []
    }

    this.performanceMetrics[operation].push(duration)

    // Keep only last 100 measurements
    if (this.performanceMetrics[operation].length > 100) {
      this.performanceMetrics[operation] = this.performanceMetrics[operation].slice(-100)
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  public getPerformanceMetrics(): { [operation: string]: { avg: number; max: number; min: number; count: number } } {
    const metrics: { [operation: string]: { avg: number; max: number; min: number; count: number } } = {}

    for (const [operation, durations] of Object.entries(this.performanceMetrics)) {
      if (durations.length === 0) continue

      metrics[operation] = {
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        max: Math.max(...durations),
        min: Math.min(...durations),
        count: durations.length
      }
    }

    return metrics
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * Health check for the service
   */
  public healthCheck(): { status: 'healthy' | 'degraded'; details: any } {
    const cacheSize = this.cache.size
    const metrics = this.getPerformanceMetrics()
    
    const status = cacheSize < 1000 && 
                  (!metrics.generateVariantsFromProduct || metrics.generateVariantsFromProduct.avg < 1000) 
                  ? 'healthy' : 'degraded'

    return {
      status,
      details: {
        cacheSize,
        performanceMetrics: metrics,
        config: {
          cachingEnabled: this.config.enableCaching,
          performanceTracking: this.config.performanceTracking
        }
      }
    }
  }
}

// Export singleton instance
export const productCustomizationService = new ProductCustomizationService()
export default productCustomizationService