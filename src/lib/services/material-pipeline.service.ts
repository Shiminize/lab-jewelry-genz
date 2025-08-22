/**
 * Material Pipeline Service
 * Optimized material configuration and generation pipeline
 * CLAUDE_RULES.md compliant with <100ms material switches
 */

import { getProductionConfig, ProductionLogger } from '@/lib/production-config'
import { ResourceOptimizer } from '@/lib/resource-optimizer'

export interface MaterialConfig {
  id: string
  name: string
  displayName: string
  category: 'precious-metal' | 'gemstone' | 'coating' | 'finish'
  
  // PBR (Physically Based Rendering) properties
  pbr: {
    metallic: number        // 0.0 to 1.0
    roughness: number       // 0.0 to 1.0  
    baseColor: [number, number, number] // RGB values 0-1
    specular: number        // 0.0 to 1.0
    ior: number            // Index of refraction (1.0 to 3.0)
    emissive?: [number, number, number] // Optional emissive color
  }
  
  // Performance optimization settings
  performance: {
    preloadPriority: 'high' | 'medium' | 'low'
    compressionLevel: 'lossless' | 'high' | 'medium' | 'low'
    cacheStrategy: 'aggressive' | 'intelligent' | 'minimal'
    renderComplexity: number // 1-10 scale
  }
  
  // Asset generation settings
  generation: {
    targetSwitchTime: number // milliseconds (CLAUDE_RULES <100ms)
    formats: string[]        // ['avif', 'webp', 'png'] 
    compressionSettings: {
      avif?: { quality: number; effort: number }
      webp?: { quality: number; method: number }
      png?: { compressionLevel: number }
    }
  }
  
  // Metadata
  metadata: {
    marketValue: 'premium' | 'luxury' | 'accessible'
    popularity: number      // 1-100 scale
    seasonality?: string[]  // ['spring', 'summer', 'fall', 'winter']
    tags: string[]
    description?: string
  }
}

export interface MaterialPipelineMetrics {
  switchTimes: { [materialId: string]: number }
  cacheHitRates: { [materialId: string]: number }
  renderingPerformance: { [materialId: string]: number }
  generationMetrics: {
    totalMaterials: number
    averageSwitchTime: number
    cacheMisses: number
    compressionRatio: number
  }
}

export class MaterialPipelineService {
  private static instance: MaterialPipelineService
  private materials: Map<string, MaterialConfig> = new Map()
  private cache: Map<string, any> = new Map()
  private metrics: MaterialPipelineMetrics
  private config = getProductionConfig()
  private logger = new ProductionLogger(this.config)
  private optimizer = new ResourceOptimizer()
  
  private constructor() {
    this.metrics = this.initializeMetrics()
    this.loadOptimizedMaterials()
  }
  
  static getInstance(): MaterialPipelineService {
    if (!MaterialPipelineService.instance) {
      MaterialPipelineService.instance = new MaterialPipelineService()
    }
    return MaterialPipelineService.instance
  }
  
  private initializeMetrics(): MaterialPipelineMetrics {
    return {
      switchTimes: {},
      cacheHitRates: {},
      renderingPerformance: {},
      generationMetrics: {
        totalMaterials: 0,
        averageSwitchTime: 0,
        cacheMisses: 0,
        compressionRatio: 0
      }
    }
  }
  
  private loadOptimizedMaterials(): void {
    // Optimized material configurations for jewelry
    const optimizedMaterials: MaterialConfig[] = [
      {
        id: 'platinum',
        name: 'platinum',
        displayName: 'Platinum',
        category: 'precious-metal',
        pbr: {
          metallic: 1.0,
          roughness: 0.05,
          baseColor: [0.85, 0.85, 0.88],
          specular: 0.95,
          ior: 2.33
        },
        performance: {
          preloadPriority: 'high',
          compressionLevel: 'high',
          cacheStrategy: 'aggressive',
          renderComplexity: 8
        },
        generation: {
          targetSwitchTime: 50, // <100ms CLAUDE_RULES
          formats: ['avif', 'webp', 'png'],
          compressionSettings: {
            avif: { quality: 85, effort: 6 },
            webp: { quality: 90, method: 6 },
            png: { compressionLevel: 6 }
          }
        },
        metadata: {
          marketValue: 'premium',
          popularity: 95,
          tags: ['luxury', 'hypoallergenic', 'durable'],
          description: 'Premium platinum with exceptional durability and brilliance'
        }
      },
      {
        id: '18k-white-gold',
        name: '18k-white-gold',
        displayName: '18K White Gold',
        category: 'precious-metal',
        pbr: {
          metallic: 1.0,
          roughness: 0.08,
          baseColor: [0.88, 0.88, 0.90],
          specular: 0.92,
          ior: 2.28
        },
        performance: {
          preloadPriority: 'high',
          compressionLevel: 'high',
          cacheStrategy: 'aggressive',
          renderComplexity: 7
        },
        generation: {
          targetSwitchTime: 60,
          formats: ['avif', 'webp', 'png'],
          compressionSettings: {
            avif: { quality: 82, effort: 5 },
            webp: { quality: 88, method: 5 },
            png: { compressionLevel: 5 }
          }
        },
        metadata: {
          marketValue: 'luxury',
          popularity: 90,
          tags: ['classic', 'versatile', 'elegant'],
          description: 'Classic 18K white gold with timeless appeal'
        }
      },
      {
        id: '18k-yellow-gold',
        name: '18k-yellow-gold',
        displayName: '18K Yellow Gold',
        category: 'precious-metal',
        pbr: {
          metallic: 1.0,
          roughness: 0.06,
          baseColor: [1.0, 0.85, 0.57],
          specular: 0.94,
          ior: 2.42
        },
        performance: {
          preloadPriority: 'high',
          compressionLevel: 'high',
          cacheStrategy: 'aggressive',
          renderComplexity: 7
        },
        generation: {
          targetSwitchTime: 55,
          formats: ['avif', 'webp', 'png'],
          compressionSettings: {
            avif: { quality: 85, effort: 6 },
            webp: { quality: 90, method: 6 },
            png: { compressionLevel: 6 }
          }
        },
        metadata: {
          marketValue: 'luxury',
          popularity: 85,
          tags: ['traditional', 'warm', 'rich'],
          description: 'Warm 18K yellow gold with rich traditional color'
        }
      },
      {
        id: '18k-rose-gold',
        name: '18k-rose-gold',
        displayName: '18K Rose Gold',
        category: 'precious-metal',
        pbr: {
          metallic: 1.0,
          roughness: 0.07,
          baseColor: [1.0, 0.75, 0.70],
          specular: 0.92,
          ior: 2.39
        },
        performance: {
          preloadPriority: 'medium',
          compressionLevel: 'high',
          cacheStrategy: 'intelligent',
          renderComplexity: 7
        },
        generation: {
          targetSwitchTime: 65,
          formats: ['avif', 'webp', 'png'],
          compressionSettings: {
            avif: { quality: 83, effort: 5 },
            webp: { quality: 88, method: 5 },
            png: { compressionLevel: 5 }
          }
        },
        metadata: {
          marketValue: 'luxury',
          popularity: 78,
          tags: ['romantic', 'modern', 'trendy'],
          description: 'Romantic 18K rose gold with contemporary appeal'
        }
      }
    ]
    
    // Load materials into memory with performance optimization
    optimizedMaterials.forEach(material => {
      this.materials.set(material.id, material)
      this.preloadMaterialAssets(material)
    })
    
    this.metrics.generationMetrics.totalMaterials = this.materials.size
    this.logger.info('Material pipeline initialized', { 
      materialCount: this.materials.size,
      cacheSize: this.cache.size 
    })
  }
  
  private async preloadMaterialAssets(material: MaterialConfig): Promise<void> {
    if (material.performance.preloadPriority === 'high') {
      // Preload high-priority materials for instant switching
      const cacheKey = `material:${material.id}:assets`
      
      if (!this.cache.has(cacheKey)) {
        const assetData = {
          id: material.id,
          pbr: material.pbr,
          renderSettings: this.getOptimizedRenderSettings(material),
          preloadTime: Date.now()
        }
        
        this.cache.set(cacheKey, assetData)
        this.logger.debug('Material assets preloaded', { materialId: material.id })
      }
    }
  }
  
  private getOptimizedRenderSettings(material: MaterialConfig): any {
    return {
      metallic: material.pbr.metallic,
      roughness: material.pbr.roughness,
      baseColor: material.pbr.baseColor,
      specular: material.pbr.specular,
      ior: material.pbr.ior,
      emissive: material.pbr.emissive || [0, 0, 0],
      
      // Performance optimizations
      lodBias: material.performance.renderComplexity < 5 ? -0.5 : 0,
      shadowQuality: material.performance.renderComplexity >= 7 ? 'high' : 'medium',
      reflectionQuality: material.performance.preloadPriority === 'high' ? 'high' : 'medium'
    }
  }
  
  async getMaterial(materialId: string): Promise<MaterialConfig | null> {
    const startTime = Date.now()
    
    const material = this.materials.get(materialId)
    if (!material) {
      this.logger.warn('Material not found', { materialId })
      return null
    }
    
    // Track access time for metrics
    const accessTime = Date.now() - startTime
    this.updateMetrics(materialId, 'access', accessTime)
    
    return material
  }
  
  async getAllMaterials(): Promise<MaterialConfig[]> {
    return Array.from(this.materials.values())
  }
  
  async getMaterialsByCategory(category: MaterialConfig['category']): Promise<MaterialConfig[]> {
    return Array.from(this.materials.values())
      .filter(material => material.category === category)
  }
  
  async switchMaterial(fromMaterialId: string, toMaterialId: string): Promise<{
    success: boolean
    switchTime: number
    cacheHit: boolean
    renderSettings: any
  }> {
    const startTime = Date.now()
    
    this.logger.debug('Material switch initiated', { fromMaterialId, toMaterialId })
    
    // Check cache first for optimal performance
    const cacheKey = `material:${toMaterialId}:assets`
    const cachedAssets = this.cache.get(cacheKey)
    const cacheHit = !!cachedAssets
    
    const toMaterial = await this.getMaterial(toMaterialId)
    if (!toMaterial) {
      return {
        success: false,
        switchTime: Date.now() - startTime,
        cacheHit: false,
        renderSettings: null
      }
    }
    
    // Get optimized render settings
    const renderSettings = cachedAssets?.renderSettings || this.getOptimizedRenderSettings(toMaterial)
    
    // If not cached and high priority, cache it now
    if (!cacheHit && toMaterial.performance.preloadPriority === 'high') {
      await this.preloadMaterialAssets(toMaterial)
    }
    
    const switchTime = Date.now() - startTime
    
    // Update metrics
    this.updateMetrics(toMaterialId, 'switch', switchTime)
    this.updateCacheMetrics(toMaterialId, cacheHit)
    
    // Check CLAUDE_RULES compliance
    if (switchTime > 100) {
      this.logger.warn('Material switch exceeds CLAUDE_RULES target', {
        fromMaterialId,
        toMaterialId,
        switchTime,
        target: 100
      })
    }
    
    this.logger.info('Material switch completed', {
      fromMaterialId,
      toMaterialId,
      switchTime,
      cacheHit,
      claudeRulesCompliant: switchTime <= 100
    })
    
    return {
      success: true,
      switchTime,
      cacheHit,
      renderSettings
    }
  }
  
  private updateMetrics(materialId: string, operation: 'access' | 'switch', time: number): void {
    if (operation === 'switch') {
      this.metrics.switchTimes[materialId] = time
      
      // Update average
      const allSwitchTimes = Object.values(this.metrics.switchTimes)
      this.metrics.generationMetrics.averageSwitchTime = 
        allSwitchTimes.reduce((sum, time) => sum + time, 0) / allSwitchTimes.length
    }
  }
  
  private updateCacheMetrics(materialId: string, cacheHit: boolean): void {
    if (!this.metrics.cacheHitRates[materialId]) {
      this.metrics.cacheHitRates[materialId] = 0
    }
    
    // Simple hit rate calculation (would use more sophisticated tracking in production)
    this.metrics.cacheHitRates[materialId] = cacheHit ? 1 : 0
    
    if (!cacheHit) {
      this.metrics.generationMetrics.cacheMisses++
    }
  }
  
  async generateMaterialSequence(materialId: string, modelId: string): Promise<{
    success: boolean
    generationTime: number
    outputPath: string
    formats: string[]
    compressionRatio: number
  }> {
    const startTime = Date.now()
    
    const material = await this.getMaterial(materialId)
    if (!material) {
      throw new Error(`Material ${materialId} not found`)
    }
    
    this.logger.info('Material sequence generation started', { materialId, modelId })
    
    // Optimized output path structure: /sequences/{model-id}/{material-id}/
    const outputPath = `/images/products/sequences/${modelId}/${materialId}/`
    
    // Simulate generation process with optimized settings
    const generationTime = Math.min(
      material.generation.targetSwitchTime * 20, // Realistic generation time
      this.config.generation.timeoutMinutes * 60 * 1000
    )
    
    // Calculate compression ratio based on settings
    const compressionRatio = this.calculateCompressionRatio(material)
    
    const result = {
      success: true,
      generationTime: Date.now() - startTime,
      outputPath,
      formats: material.generation.formats,
      compressionRatio
    }
    
    this.logger.info('Material sequence generation completed', {
      materialId,
      modelId,
      ...result
    })
    
    return result
  }
  
  private calculateCompressionRatio(material: MaterialConfig): number {
    // Calculate compression ratio based on format settings
    const settings = material.generation.compressionSettings
    let ratio = 1.0
    
    if (settings.avif) {
      ratio *= (100 - settings.avif.quality) / 100 + 0.3
    }
    if (settings.webp) {
      ratio *= (100 - settings.webp.quality) / 100 + 0.4
    }
    if (settings.png) {
      ratio *= settings.png.compressionLevel / 10 + 0.5
    }
    
    return Math.max(0.1, Math.min(0.9, ratio)) // Clamp between 10% and 90%
  }
  
  getMetrics(): MaterialPipelineMetrics {
    return { ...this.metrics }
  }
  
  getSystemHealth(): {
    materialsLoaded: number
    cacheSize: number
    averageSwitchTime: number
    claudeRulesCompliance: number
    memoryUsage: string
  } {
    const switchTimes = Object.values(this.metrics.switchTimes)
    const compliantSwitches = switchTimes.filter(time => time <= 100).length
    const complianceRate = switchTimes.length > 0 ? (compliantSwitches / switchTimes.length) * 100 : 100
    
    return {
      materialsLoaded: this.materials.size,
      cacheSize: this.cache.size,
      averageSwitchTime: this.metrics.generationMetrics.averageSwitchTime,
      claudeRulesCompliance: complianceRate,
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }
  }
  
  async optimizePipeline(): Promise<void> {
    this.logger.info('Optimizing material pipeline')
    
    // Clear low-priority cache entries if memory pressure is high
    const memoryPressure = this.optimizer.getMemoryPressure()
    if (memoryPressure === 'high' || memoryPressure === 'critical') {
      this.clearLowPriorityCache()
    }
    
    // Preload high-priority materials that aren't cached
    for (const [materialId, material] of this.materials) {
      if (material.performance.preloadPriority === 'high') {
        await this.preloadMaterialAssets(material)
      }
    }
    
    this.logger.info('Material pipeline optimization completed')
  }
  
  private clearLowPriorityCache(): void {
    const keysToRemove: string[] = []
    
    for (const [key] of this.cache) {
      const materialId = key.split(':')[1]
      const material = this.materials.get(materialId)
      
      if (material && material.performance.preloadPriority === 'low') {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => this.cache.delete(key))
    this.logger.debug('Low priority cache cleared', { removedKeys: keysToRemove.length })
  }
}

export default MaterialPipelineService