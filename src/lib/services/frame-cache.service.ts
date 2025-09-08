/**
 * Advanced Frame Cache Service - CLAUDE_RULES Phase 2 Performance
 * 
 * Implements intelligent frame caching with:
 * - LRU cache management for memory efficiency
 * - Predictive preloading based on user interaction patterns
 * - Progressive image quality loading
 * - WebP/AVIF format detection and fallback
 * 
 * Performance Goals:
 * - <50ms frame switching for cached frames
 * - <2s initial load time
 * - Memory usage under 50MB per product
 */

'use client'

interface CachedFrame {
  index: number
  image: HTMLImageElement
  format: string
  quality: 'low' | 'medium' | 'high'
  loadTime: number
  lastAccessed: number
  memorySize: number // Estimated memory usage in bytes
}

interface FrameCacheStats {
  cachedFrames: number
  memoryUsage: number
  hitRate: number
  avgLoadTime: number
  totalRequests: number
  cacheHits: number
}

interface PredictiveLoadingConfig {
  enabled: boolean
  lookAhead: number // Number of frames to preload ahead
  lookBehind: number // Number of frames to preload behind
  userPatternThreshold: number // Minimum interactions to detect patterns
}

class FrameCacheService {
  private cache = new Map<string, CachedFrame>()
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>()
  private maxCacheSize: number
  private maxMemoryUsage: number
  private stats: FrameCacheStats
  private userInteractionHistory: number[] = []
  private predictiveConfig: PredictiveLoadingConfig

  constructor(
    maxCacheSize = 144, // Cache up to 4 full 36-frame sequences
    maxMemoryUsage = 50 * 1024 * 1024 // 50MB limit
  ) {
    this.maxCacheSize = maxCacheSize
    this.maxMemoryUsage = maxMemoryUsage
    this.stats = {
      cachedFrames: 0,
      memoryUsage: 0,
      hitRate: 0,
      avgLoadTime: 0,
      totalRequests: 0,
      cacheHits: 0
    }
    this.predictiveConfig = {
      enabled: true,
      lookAhead: 3,
      lookBehind: 2,
      userPatternThreshold: 5
    }
  }

  /**
   * Get frame with intelligent caching and preloading
   */
  public async getFrame(
    imagePath: string,
    frameIndex: number,
    imageCount: number,
    format: string = 'webp'
  ): Promise<HTMLImageElement> {
    const cacheKey = `${imagePath}_${frameIndex}_${format}`
    this.stats.totalRequests++
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached) {
      cached.lastAccessed = Date.now()
      this.stats.cacheHits++
      this.updateHitRate()
      
      // Trigger predictive loading based on user patterns
      this.triggerPredictiveLoading(imagePath, frameIndex, imageCount, format)
      
      return cached.image
    }

    // Check if already loading
    const loadingPromise = this.loadingPromises.get(cacheKey)
    if (loadingPromise) {
      return loadingPromise
    }

    // Load new frame
    const promise = this.loadFrame(imagePath, frameIndex, format)
    this.loadingPromises.set(cacheKey, promise)

    try {
      const image = await promise
      
      // Cache the loaded frame
      await this.cacheFrame(cacheKey, frameIndex, image, format)
      
      // Update user interaction history for predictive loading
      this.updateInteractionHistory(frameIndex)
      
      // Trigger predictive loading for surrounding frames
      this.triggerPredictiveLoading(imagePath, frameIndex, imageCount, format)
      
      return image
    } finally {
      this.loadingPromises.delete(cacheKey)
    }
  }

  /**
   * Load single frame with format fallback and performance tracking
   */
  private async loadFrame(
    imagePath: string,
    frameIndex: number,
    format: string
  ): Promise<HTMLImageElement> {
    const startTime = performance.now()
    
    const supportedFormats = [format, 'webp', 'jpg', 'png']
    let lastError: Error | null = null

    for (const currentFormat of supportedFormats) {
      try {
        const image = await this.loadSingleImage(imagePath, frameIndex, currentFormat)
        const loadTime = performance.now() - startTime
        
        // Update average load time
        this.updateAvgLoadTime(loadTime)

        return image
      } catch (error) {
        lastError = error as Error
        console.warn(`❌ Failed to load frame ${frameIndex} as ${currentFormat}:`, error)
      }
    }

    throw lastError || new Error(`Failed to load frame ${frameIndex} in any format`)
  }

  /**
   * Load single image with timeout
   */
  private loadSingleImage(
    imagePath: string,
    frameIndex: number,
    format: string
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout loading frame ${frameIndex}`))
      }, 5000)

      img.onload = () => {
        clearTimeout(timeout)
        resolve(img)
      }

      img.onerror = () => {
        clearTimeout(timeout)
        reject(new Error(`Failed to load frame ${frameIndex}`))
      }

      // Construct image URL
      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://localhost:3000'
      
      let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
      if (cleanPath.startsWith('Public/')) {
        cleanPath = cleanPath.slice(7)
      }

      img.crossOrigin = 'anonymous'
      img.src = `${baseUrl}/${cleanPath}/${frameIndex}.${format}`
    })
  }

  /**
   * Cache frame with memory management
   */
  private async cacheFrame(
    cacheKey: string,
    frameIndex: number,
    image: HTMLImageElement,
    format: string
  ): Promise<void> {
    const loadTime = performance.now()
    const estimatedSize = this.estimateImageSize(image)

    const cachedFrame: CachedFrame = {
      index: frameIndex,
      image,
      format,
      quality: this.detectImageQuality(image),
      loadTime,
      lastAccessed: Date.now(),
      memorySize: estimatedSize
    }

    // Check memory limits before caching
    if (this.stats.memoryUsage + estimatedSize > this.maxMemoryUsage) {
      await this.evictFrames(estimatedSize)
    }

    // Add to cache
    this.cache.set(cacheKey, cachedFrame)
    this.updateCacheStats()
  }

  /**
   * Intelligent frame eviction using LRU + usage patterns
   */
  private async evictFrames(requiredSpace: number): Promise<void> {
    const sortedFrames = Array.from(this.cache.entries())
      .map(([key, frame]) => ({ key, frame }))
      .sort((a, b) => {
        // Sort by last accessed time (LRU)
        return a.frame.lastAccessed - b.frame.lastAccessed
      })

    let freedSpace = 0
    const toEvict: string[] = []

    for (const { key, frame } of sortedFrames) {
      toEvict.push(key)
      freedSpace += frame.memorySize
      
      if (freedSpace >= requiredSpace) {
        break
      }
    }

    // Remove evicted frames
    for (const key of toEvict) {
      this.cache.delete(key)

    }

    this.updateCacheStats()
  }

  /**
   * Predictive loading based on user interaction patterns
   * Implements intelligent predictiveLoading for optimal performance
   */
  private async triggerPredictiveLoading(
    imagePath: string,
    currentFrame: number,
    imageCount: number,
    format: string
  ): Promise<void> {
    if (!this.predictiveConfig.enabled) return

    // Determine which frames to preload
    const framesToPreload = this.getPredictiveFrames(currentFrame, imageCount)
    
    // Load frames in background (don't await)
    framesToPreload.forEach(frameIndex => {
      const cacheKey = `${imagePath}_${frameIndex}_${format}`
      
      if (!this.cache.has(cacheKey) && !this.loadingPromises.has(cacheKey)) {
        this.getFrame(imagePath, frameIndex, imageCount, format)
          .catch(error => {
            console.warn(`Background preload failed for frame ${frameIndex}:`, error)
          })
      }
    })
  }

  /**
   * Determine frames to preload based on current position and user patterns
   */
  private getPredictiveFrames(currentFrame: number, imageCount: number): number[] {
    const frames: number[] = []
    
    // Add look-ahead frames
    for (let i = 1; i <= this.predictiveConfig.lookAhead; i++) {
      frames.push((currentFrame + i) % imageCount)
    }
    
    // Add look-behind frames
    for (let i = 1; i <= this.predictiveConfig.lookBehind; i++) {
      frames.push((currentFrame - i + imageCount) % imageCount)
    }

    // Add pattern-based predictions if we have enough history
    if (this.userInteractionHistory.length >= this.predictiveConfig.userPatternThreshold) {
      const predictedFrames = this.predictNextFrames(currentFrame, imageCount)
      frames.push(...predictedFrames)
    }

    return [...new Set(frames)] // Remove duplicates
  }

  /**
   * Predict next frames based on user interaction history
   */
  private predictNextFrames(currentFrame: number, imageCount: number): number[] {
    // Analyze recent interaction patterns
    const recentHistory = this.userInteractionHistory.slice(-10)
    const patterns: number[] = []

    // Look for common movement patterns
    for (let i = 1; i < recentHistory.length; i++) {
      const diff = recentHistory[i] - recentHistory[i - 1]
      patterns.push(diff)
    }

    // Predict next moves based on average pattern
    if (patterns.length > 0) {
      const avgPattern = patterns.reduce((sum, p) => sum + p, 0) / patterns.length
      const predictedFrame = Math.round((currentFrame + avgPattern + imageCount) % imageCount)
      return [predictedFrame]
    }

    return []
  }

  /**
   * Update user interaction history for pattern learning
   */
  private updateInteractionHistory(frameIndex: number): void {
    this.userInteractionHistory.push(frameIndex)
    
    // Keep only recent history to avoid memory bloat
    if (this.userInteractionHistory.length > 50) {
      this.userInteractionHistory = this.userInteractionHistory.slice(-25)
    }
  }

  /**
   * Estimate image memory usage
   */
  private estimateImageSize(image: HTMLImageElement): number {
    // Rough estimate: width * height * 4 bytes per pixel (RGBA)
    return image.naturalWidth * image.naturalHeight * 4
  }

  /**
   * Detect image quality level
   */
  private detectImageQuality(image: HTMLImageElement): 'low' | 'medium' | 'high' {
    const pixels = image.naturalWidth * image.naturalHeight
    
    if (pixels > 1000000) return 'high' // > 1MP
    if (pixels > 500000) return 'medium' // > 0.5MP
    return 'low'
  }

  /**
   * Update cache statistics
   */
  private updateCacheStats(): void {
    this.stats.cachedFrames = this.cache.size
    this.stats.memoryUsage = Array.from(this.cache.values())
      .reduce((total, frame) => total + frame.memorySize, 0)
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0
  }

  /**
   * Update average load time
   */
  private updateAvgLoadTime(newTime: number): void {
    const currentAvg = this.stats.avgLoadTime
    const totalRequests = this.stats.totalRequests
    
    this.stats.avgLoadTime = totalRequests > 1 
      ? ((currentAvg * (totalRequests - 1)) + newTime) / totalRequests
      : newTime
  }

  /**
   * Get cache statistics
   */
  public getStats(): FrameCacheStats {
    this.updateCacheStats()
    return { ...this.stats }
  }

  /**
   * Preload entire sequence in background
   */
  public async preloadSequence(
    imagePath: string,
    imageCount: number,
    format: string = 'webp',
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {

    const startTime = performance.now()

    const loadPromises = Array.from({ length: imageCount }, (_, i) => {
      const delay = priority === 'high' ? 0 : priority === 'normal' ? i * 50 : i * 100
      
      return new Promise<void>(resolve => {
        setTimeout(() => {
          this.getFrame(imagePath, i, imageCount, format)
            .then(() => resolve())
            .catch(() => resolve()) // Continue on error
        }, delay)
      })
    })

    await Promise.allSettled(loadPromises)
    
    const totalTime = performance.now() - startTime
    const stats = this.getStats()

  }

  /**
   * Clear cache and free memory
   */
  public clearCache(): void {
    this.cache.clear()
    this.loadingPromises.clear()
    this.userInteractionHistory = []
    this.updateCacheStats()

  }

  /**
   * Configure predictive loading
   */
  public configurePredictive(config: Partial<PredictiveLoadingConfig>): void {
    this.predictiveConfig = { ...this.predictiveConfig, ...config }

  }
}

// Export singleton instance
export const frameCache = new FrameCacheService()
export type { CachedFrame, FrameCacheStats, PredictiveLoadingConfig }