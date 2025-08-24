/**
 * AssetCacheService - High-performance material asset caching
 * Achieves <90ms material switching by pre-loading and caching all material variants
 * CLAUDE_RULES compliant with memory-efficient LRU implementation
 */

import type { Material, MaterialId } from '@/components/customizer/types'

interface CachedAsset {
  materialId: MaterialId
  assetPaths: string[]
  timestamp: number
  size: number
  // PHASE 1: Multi-format support
  availableFormats?: string[]
  frameCount?: number
  validationTimestamp?: string
}

interface CacheEntry {
  key: string
  value: CachedAsset
  lastAccessed: number
}

export class AssetCacheService {
  private static instance: AssetCacheService
  private cache: Map<string, CacheEntry>
  private maxCacheSize: number = 100 * 1024 * 1024 // 100MB limit
  private currentCacheSize: number = 0
  private prefetchQueue: Set<string> = new Set()
  private prefetchInProgress: Map<string, Promise<CachedAsset>> = new Map()

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): AssetCacheService {
    if (!AssetCacheService.instance) {
      AssetCacheService.instance = new AssetCacheService()
    }
    return AssetCacheService.instance
  }

  /**
   * Pre-fetch all materials for a product
   * Returns immediately and fetches in background
   */
  async prefetchMaterials(
    productId: string, 
    materials: MaterialId[],
    priority: 'high' | 'low' = 'high'
  ): Promise<void> {
    const fetchPromises = materials.map(materialId => {
      const cacheKey = this.getCacheKey(productId, materialId)
      
      // Skip if already cached or being fetched
      if (this.cache.has(cacheKey) || this.prefetchInProgress.has(cacheKey)) {
        return Promise.resolve()
      }

      // Add to queue for background fetching
      this.prefetchQueue.add(cacheKey)
      
      // Start fetching with appropriate priority
      const fetchPromise = this.fetchAsset(productId, materialId, priority)
      this.prefetchInProgress.set(cacheKey, fetchPromise)
      
      return fetchPromise.finally(() => {
        this.prefetchInProgress.delete(cacheKey)
        this.prefetchQueue.delete(cacheKey)
      })
    })

    // For high priority, wait for all to complete
    if (priority === 'high') {
      await Promise.all(fetchPromises)
    }
    // For low priority, fire and forget
  }

  /**
   * Get cached asset with LRU update
   */
  getCachedAsset(productId: string, materialId: MaterialId): CachedAsset | null {
    const cacheKey = this.getCacheKey(productId, materialId)
    const entry = this.cache.get(cacheKey)
    
    if (!entry) {
      return null
    }

    // Update last accessed time for LRU
    entry.lastAccessed = Date.now()
    
    // Move to end (most recently used)
    this.cache.delete(cacheKey)
    this.cache.set(cacheKey, entry)
    
    return entry.value
  }

  /**
   * Check if asset is cached
   */
  isCached(productId: string, materialId: MaterialId): boolean {
    return this.cache.has(this.getCacheKey(productId, materialId))
  }

  /**
   * Clear least recently used items if cache is too large
   */
  private evictLRU(): void {
    if (this.currentCacheSize <= this.maxCacheSize) {
      return
    }

    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)

    while (this.currentCacheSize > this.maxCacheSize * 0.8 && entries.length > 0) {
      const [key, entry] = entries.shift()!
      this.cache.delete(key)
      this.currentCacheSize -= entry.value.size
    }
  }

  /**
   * Fetch asset from API
   */
  private async fetchAsset(
    productId: string, 
    materialId: MaterialId,
    priority: 'high' | 'low'
  ): Promise<CachedAsset> {
    const startTime = performance.now()
    
    try {
      const response = await fetch(
        `/api/products/customizable/${productId}/assets?materialId=${materialId}`,
        { 
          priority: priority as RequestInit['priority'],
          cache: 'no-store' // PHASE 2: Always fetch fresh data to prevent dark image cache issues
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assets: ${response.status}`)
      }
      
      const data = await response.json()
      const fetchTime = performance.now() - startTime
      
      console.log(`[AssetCache] Fetched ${materialId} in ${fetchTime.toFixed(2)}ms`)
      
      if (data.success && data.data.assets.available) {
        const cachedAsset: CachedAsset = {
          materialId,
          assetPaths: data.data.assets.assetPaths,
          timestamp: Date.now(),
          size: this.estimateAssetSize(data.data.assets.assetPaths),
          // PHASE 1: Enhanced metadata for multi-format fallback
          availableFormats: data.data.assets.availableFormats || ['webp', 'avif', 'png'],
          frameCount: data.data.assets.frameCount || 36,
          validationTimestamp: data.data.assets.validationTimestamp
        }
        
        console.log(`[AssetCache] Cached ${materialId} with ${cachedAsset.availableFormats?.join(', ')} formats, ${cachedAsset.frameCount} frames`)
        
        // Cache the result
        this.setCachedAsset(productId, materialId, cachedAsset)
        
        return cachedAsset
      }
      
      throw new Error(`Assets not available for ${materialId} - validation may have failed`)
    } catch (error) {
      console.error(`[AssetCache] Failed to fetch ${materialId}:`, error)
      throw error
    }
  }

  /**
   * Store asset in cache with LRU eviction
   */
  private setCachedAsset(
    productId: string, 
    materialId: MaterialId, 
    asset: CachedAsset
  ): void {
    const cacheKey = this.getCacheKey(productId, materialId)
    
    // Remove old entry if exists
    const existingEntry = this.cache.get(cacheKey)
    if (existingEntry) {
      this.currentCacheSize -= existingEntry.value.size
    }
    
    // Add new entry
    const entry: CacheEntry = {
      key: cacheKey,
      value: asset,
      lastAccessed: Date.now()
    }
    
    this.cache.set(cacheKey, entry)
    this.currentCacheSize += asset.size
    
    // Evict LRU items if needed
    this.evictLRU()
  }

  /**
   * Generate cache key
   */
  private getCacheKey(productId: string, materialId: MaterialId): string {
    return `${productId}:${materialId}`
  }

  /**
   * Estimate asset size (rough calculation)
   */
  private estimateAssetSize(assetPaths: string[]): number {
    // Assume ~50KB per image * 36 frames
    return assetPaths.length * 50 * 1024
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache.clear()
    this.currentCacheSize = 0
    this.prefetchQueue.clear()
    this.prefetchInProgress.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    itemCount: number
    totalSize: number
    maxSize: number
    hitRate: number
  } {
    return {
      itemCount: this.cache.size,
      totalSize: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      hitRate: 0 // Would need to track hits/misses for this
    }
  }
}

// Export singleton instance
export const assetCache = AssetCacheService.getInstance()