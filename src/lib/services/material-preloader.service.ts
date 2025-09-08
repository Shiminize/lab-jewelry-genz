/**
 * Material Preloader Service - CLAUDE_RULES Phase 2 Optimization
 * 
 * Achieves <100ms material changes by preloading all material images
 * Uses intelligent background loading and memory management
 * 
 * Performance Requirements:
 * - <100ms material switches (CLAUDE_RULES mandatory)
 * - Background preloading without blocking UI
 * - Memory-efficient image caching
 * - Progressive loading with priority queues
 */

'use client'

interface MaterialImageSet {
  materialId: string
  basePath: string
  imageCount: number
  format: string
  preloadedImages: Map<number, HTMLImageElement>
  loadProgress: number
  isComplete: boolean
  lastAccessed: number
}

interface PreloaderConfig {
  maxCacheSize: number // Maximum number of material sets to cache
  preloadTimeout: number // Timeout per image in ms
  backgroundLoadDelay: number // Delay between background loads
  priorityMaterials: string[] // Materials to load first
}

class MaterialPreloaderService {
  private cache = new Map<string, MaterialImageSet>()
  private loadingQueue = new Set<string>()
  private activeLoads = new Map<string, Promise<void>>()
  private config: PreloaderConfig

  constructor(config: Partial<PreloaderConfig> = {}) {
    this.config = {
      maxCacheSize: 5, // Cache up to 5 material sets
      preloadTimeout: 2000,
      backgroundLoadDelay: 50, // 50ms between loads to avoid blocking
      priorityMaterials: ['18k-rose-gold', '14k-white-gold'],
      ...config
    }
  }

  /**
   * CLAUDE_RULES Performance: Get images for material switch in <100ms
   */
  public getMaterialImages(
    materialId: string, 
    basePath: string, 
    imageCount: number = 36,
    format: string = 'webp'
  ): { 
    images: Map<number, HTMLImageElement> | null
    isComplete: boolean
    loadProgress: number
  } {
    const cacheKey = `${materialId}-${basePath}-${format}`
    const cached = this.cache.get(cacheKey)
    
    if (cached) {
      // Update last accessed for LRU cache management
      cached.lastAccessed = Date.now()
      
      return {
        images: cached.preloadedImages,
        isComplete: cached.isComplete,
        loadProgress: cached.loadProgress
      }
    }
    
    // Start background loading if not already in progress
    this.startBackgroundLoad(materialId, basePath, imageCount, format)
    
    return {
      images: null,
      isComplete: false,
      loadProgress: 0
    }
  }

  /**
   * Preload material images in background for instant switching
   */
  public async preloadMaterial(
    materialId: string,
    basePath: string,
    imageCount: number = 36,
    format: string = 'webp'
  ): Promise<boolean> {
    const cacheKey = `${materialId}-${basePath}-${format}`
    
    // Return existing load if in progress
    if (this.activeLoads.has(cacheKey)) {
      await this.activeLoads.get(cacheKey)!
      return this.cache.get(cacheKey)?.isComplete ?? false
    }
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached?.isComplete) {
      return true
    }
    
    // Start new load
    const loadPromise = this.loadMaterialSet(materialId, basePath, imageCount, format)
    this.activeLoads.set(cacheKey, loadPromise)
    
    try {
      await loadPromise
      return this.cache.get(cacheKey)?.isComplete ?? false
    } finally {
      this.activeLoads.delete(cacheKey)
    }
  }

  /**
   * Background loading with priority queue
   */
  private startBackgroundLoad(
    materialId: string,
    basePath: string,
    imageCount: number,
    format: string
  ): void {
    const cacheKey = `${materialId}-${basePath}-${format}`
    
    if (this.loadingQueue.has(cacheKey) || this.activeLoads.has(cacheKey)) {
      return
    }
    
    this.loadingQueue.add(cacheKey)
    
    // Use setTimeout to avoid blocking current execution
    setTimeout(() => {
      this.preloadMaterial(materialId, basePath, imageCount, format)
        .then(() => {

        })
        .catch(error => {
          console.warn(`⚠️ Background preload failed: ${materialId}`, error)
        })
        .finally(() => {
          this.loadingQueue.delete(cacheKey)
        })
    }, 0)
  }

  /**
   * Load complete material image set with performance optimization
   */
  private async loadMaterialSet(
    materialId: string,
    basePath: string,
    imageCount: number,
    format: string
  ): Promise<void> {
    const cacheKey = `${materialId}-${basePath}-${format}`
    const startTime = performance.now()
    
    // Initialize cache entry
    const materialSet: MaterialImageSet = {
      materialId,
      basePath,
      imageCount,
      format,
      preloadedImages: new Map(),
      loadProgress: 0,
      isComplete: false,
      lastAccessed: Date.now()
    }
    
    this.cache.set(cacheKey, materialSet)
    this.enforceMemoryLimits()
    
    try {
      // Load images with progressive feedback
      const loadPromises: Promise<{ index: number; image: HTMLImageElement | null }>[] = []
      
      for (let i = 0; i < imageCount; i++) {
        const promise = this.loadSingleImage(basePath, i, format, materialId)
        loadPromises.push(promise)
        
        // Add small delay to prevent overwhelming the browser
        if (i > 0 && i % 6 === 0) {
          await new Promise(resolve => setTimeout(resolve, this.config.backgroundLoadDelay))
        }
      }
      
      // Process results as they complete
      let completedCount = 0
      const results = await Promise.allSettled(loadPromises)
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.image) {
          materialSet.preloadedImages.set(index, result.value.image)
          completedCount++
        }
        
        materialSet.loadProgress = completedCount / imageCount
      })
      
      materialSet.isComplete = completedCount >= Math.floor(imageCount * 0.8) // 80% success rate
      
      const loadTime = performance.now() - startTime
      
      if (materialSet.isComplete) {

      } else {
        console.warn(`⚠️ Material ${materialId} partial load: ${completedCount}/${imageCount} images in ${loadTime.toFixed(0)}ms`)
      }
      
    } catch (error) {
      console.error(`❌ Material ${materialId} preload failed:`, error)
      materialSet.isComplete = false
    }
  }

  /**
   * Load single image with timeout and error handling
   */
  private loadSingleImage(
    basePath: string,
    index: number,
    format: string,
    materialId: string
  ): Promise<{ index: number; image: HTMLImageElement | null }> {
    return new Promise((resolve) => {
      const img = new Image()
      
      const timeout = setTimeout(() => {
        console.warn(`⏰ Timeout loading ${materialId} frame ${index}`)
        resolve({ index, image: null })
      }, this.config.preloadTimeout)
      
      img.onload = () => {
        clearTimeout(timeout)
        resolve({ index, image: img })
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        console.warn(`❌ Failed to load ${materialId} frame ${index}`)
        resolve({ index, image: null })
      }
      
      // Construct asset URL
      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://localhost:3001'
      
      const cleanPath = basePath.startsWith('/') ? basePath.slice(1) : basePath
      img.crossOrigin = 'anonymous'
      img.src = `${baseUrl}/${cleanPath}/${index}.${format}`
    })
  }

  /**
   * Memory management: Enforce cache size limits
   */
  private enforceMemoryLimits(): void {
    if (this.cache.size <= this.config.maxCacheSize) {
      return
    }
    
    // LRU eviction - remove oldest accessed material
    let oldestKey: string | null = null
    let oldestTime = Date.now()
    
    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed
        oldestKey = key
      }
    }
    
    if (oldestKey) {

      this.cache.delete(oldestKey)
    }
  }

  /**
   * Preload priority materials for fastest initial experience
   */
  public async preloadPriorityMaterials(
    productBasePath: string,
    imageCount: number = 36,
    format: string = 'webp'
  ): Promise<void> {

    const startTime = performance.now()
    const preloadPromises = this.config.priorityMaterials.map(materialId => {
      const materialPath = `${productBasePath}/${materialId}`
      return this.preloadMaterial(materialId, materialPath, imageCount, format)
    })
    
    await Promise.allSettled(preloadPromises)
    
    const totalTime = performance.now() - startTime

  }

  /**
   * Clear cache and free memory
   */
  public clearCache(): void {
    this.cache.clear()
    this.loadingQueue.clear()

  }

  /**
   * Get cache statistics for debugging
   */
  public getCacheStats(): {
    cachedMaterials: number
    totalImages: number
    memoryUsage: string
    completedMaterials: number
  } {
    let totalImages = 0
    let completedMaterials = 0
    
    for (const materialSet of this.cache.values()) {
      totalImages += materialSet.preloadedImages.size
      if (materialSet.isComplete) {
        completedMaterials++
      }
    }
    
    return {
      cachedMaterials: this.cache.size,
      totalImages,
      memoryUsage: `~${Math.round(totalImages * 50)}KB`, // Rough estimate
      completedMaterials
    }
  }
}

// Export singleton instance
export const materialPreloader = new MaterialPreloaderService()
export type { MaterialImageSet, PreloaderConfig }