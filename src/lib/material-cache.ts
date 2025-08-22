/**
 * Material Specification Cache
 * High-performance caching layer for material tag extraction
 * Targets <50ms response time for material operations (CLAUDE_RULES)
 */

import { ProductListMaterialSpecs, MetalType, StoneType } from '@/types/product-dto'
import { performanceMonitor } from '@/lib/performance-monitor'
import { redis } from '@/lib/redis-client'

/**
 * In-memory cache for ultra-fast material spec lookups
 * Target: <20ms response time
 */
export class MaterialSpecCache {
  private cache = new Map<string, {
    data: ProductListMaterialSpecs
    timestamp: number
    accessCount: number
  }>()
  
  private readonly maxSize = 1000 // Maximum cache entries
  private readonly ttl = 5 * 60 * 1000 // 5 minutes TTL
  private readonly cleanupInterval = 60 * 1000 // Cleanup every minute
  private cleanupTimer: NodeJS.Timeout | null = null
  
  constructor() {
    // Start cleanup timer
    if (typeof window === 'undefined') {
      this.startCleanup()
    }
  }
  
  /**
   * Get material specs from cache
   */
  get(productId: string): ProductListMaterialSpecs | null {
    const startTime = performance.now()
    const entry = this.cache.get(productId)
    
    if (entry) {
      const age = Date.now() - entry.timestamp
      
      if (age < this.ttl) {
        // Update access count for LRU
        entry.accessCount++
        
        const duration = performance.now() - startTime
        performanceMonitor.recordMetric({
          name: 'material_cache_hit',
          value: duration,
          unit: 'ms',
          timestamp: new Date(),
          labels: { cache: 'memory', operation: 'get' }
        })
        
        return entry.data
      } else {
        // Expired entry
        this.cache.delete(productId)
      }
    }
    
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric({
      name: 'material_cache_miss',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      labels: { cache: 'memory', operation: 'get' }
    })
    
    return null
  }
  
  /**
   * Set material specs in cache
   */
  set(productId: string, specs: ProductListMaterialSpecs): void {
    const startTime = performance.now()
    
    // Check cache size and evict if necessary
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }
    
    this.cache.set(productId, {
      data: specs,
      timestamp: Date.now(),
      accessCount: 0
    })
    
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric({
      name: 'material_cache_set',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      labels: { cache: 'memory', operation: 'set' }
    })
  }
  
  /**
   * Bulk set for efficient batch operations
   */
  bulkSet(entries: Array<{ productId: string; specs: ProductListMaterialSpecs }>): void {
    const startTime = performance.now()
    
    entries.forEach(({ productId, specs }) => {
      if (this.cache.size >= this.maxSize) {
        this.evictLRU()
      }
      
      this.cache.set(productId, {
        data: specs,
        timestamp: Date.now(),
        accessCount: 0
      })
    })
    
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric({
      name: 'material_cache_bulk_set',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      labels: { 
        cache: 'memory', 
        operation: 'bulk_set',
        count: entries.length.toString()
      }
    })
  }
  
  /**
   * Invalidate cache entry
   */
  invalidate(productId: string): void {
    this.cache.delete(productId)
  }
  
  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    hitRate: number
    avgAge: number
    memoryUsage: number
  } {
    const entries = Array.from(this.cache.values())
    const now = Date.now()
    
    const totalAccess = entries.reduce((sum, e) => sum + e.accessCount, 0)
    const avgAge = entries.length > 0
      ? entries.reduce((sum, e) => sum + (now - e.timestamp), 0) / entries.length
      : 0
    
    // Estimate memory usage (rough approximation)
    const memoryUsage = this.cache.size * 500 // ~500 bytes per entry
    
    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? totalAccess / (totalAccess + this.cache.size) : 0,
      avgAge: Math.round(avgAge / 1000), // Convert to seconds
      memoryUsage
    }
  }
  
  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount)
    
    // Remove bottom 10% of entries
    const toRemove = Math.max(1, Math.floor(this.cache.size * 0.1))
    
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0])
    }
  }
  
  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      const expired: string[] = []
      
      this.cache.forEach((entry, key) => {
        if (now - entry.timestamp > this.ttl) {
          expired.push(key)
        }
      })
      
      expired.forEach(key => this.cache.delete(key))
      
      if (expired.length > 0) {
        console.log(`[MaterialCache] Cleaned ${expired.length} expired entries`)
      }
    }, this.cleanupInterval)
  }
  
  /**
   * Stop cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.cache.clear()
  }
}

/**
 * Redis cache for distributed caching
 * Target: <100ms response time
 */
export class RedisMaterialCache {
  private readonly keyPrefix = 'material:'
  private readonly ttl = 300 // 5 minutes in seconds
  
  /**
   * Get material specs from Redis
   */
  async get(productId: string): Promise<ProductListMaterialSpecs | null> {
    if (!redis) return null
    
    const startTime = performance.now()
    
    try {
      const key = `${this.keyPrefix}${productId}`
      const cached = await redis.get(key)
      
      if (cached) {
        const duration = performance.now() - startTime
        performanceMonitor.recordMetric({
          name: 'material_cache_hit',
          value: duration,
          unit: 'ms',
          timestamp: new Date(),
          labels: { cache: 'redis', operation: 'get' }
        })
        
        return JSON.parse(cached)
      }
    } catch (error) {
      console.error('[RedisMaterialCache] Get error:', error)
    }
    
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric({
      name: 'material_cache_miss',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      labels: { cache: 'redis', operation: 'get' }
    })
    
    return null
  }
  
  /**
   * Set material specs in Redis
   */
  async set(productId: string, specs: ProductListMaterialSpecs): Promise<void> {
    if (!redis) return
    
    const startTime = performance.now()
    
    try {
      const key = `${this.keyPrefix}${productId}`
      await redis.setex(key, this.ttl, JSON.stringify(specs))
      
      const duration = performance.now() - startTime
      performanceMonitor.recordMetric({
        name: 'material_cache_set',
        value: duration,
        unit: 'ms',
        timestamp: new Date(),
        labels: { cache: 'redis', operation: 'set' }
      })
    } catch (error) {
      console.error('[RedisMaterialCache] Set error:', error)
    }
  }
  
  /**
   * Bulk set with pipeline for efficiency
   */
  async bulkSet(entries: Array<{ productId: string; specs: ProductListMaterialSpecs }>): Promise<void> {
    if (!redis) return
    
    const startTime = performance.now()
    
    try {
      const pipeline = redis.pipeline()
      
      entries.forEach(({ productId, specs }) => {
        const key = `${this.keyPrefix}${productId}`
        pipeline.setex(key, this.ttl, JSON.stringify(specs))
      })
      
      await pipeline.exec()
      
      const duration = performance.now() - startTime
      performanceMonitor.recordMetric({
        name: 'material_cache_bulk_set',
        value: duration,
        unit: 'ms',
        timestamp: new Date(),
        labels: { 
          cache: 'redis', 
          operation: 'bulk_set',
          count: entries.length.toString()
        }
      })
    } catch (error) {
      console.error('[RedisMaterialCache] Bulk set error:', error)
    }
  }
  
  /**
   * Invalidate cache entry
   */
  async invalidate(productId: string): Promise<void> {
    if (!redis) return
    
    try {
      const key = `${this.keyPrefix}${productId}`
      await redis.del(key)
    } catch (error) {
      console.error('[RedisMaterialCache] Invalidate error:', error)
    }
  }
  
  /**
   * Clear all material cache entries
   */
  async clear(): Promise<void> {
    if (!redis) return
    
    try {
      const keys = await redis.keys(`${this.keyPrefix}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('[RedisMaterialCache] Clear error:', error)
    }
  }
}

/**
 * Catalog page cache for complete query results
 * Target: <150ms for full page results
 */
export class CatalogPageCache {
  private readonly keyPrefix = 'catalog:'
  private readonly ttl = 300 // 5 minutes
  
  /**
   * Generate cache key from search parameters
   */
  private generateKey(params: {
    page?: number
    limit?: number
    sortBy?: string
    filters?: any
  }): string {
    const filters = params.filters || {}
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${JSON.stringify(filters[key])}`)
      .join('|')
    
    return `${this.keyPrefix}${params.page || 1}:${params.limit || 20}:${params.sortBy || 'default'}:${filterString}`
  }
  
  /**
   * Get cached catalog page
   */
  async get(params: any): Promise<any | null> {
    if (!redis) return null
    
    const startTime = performance.now()
    
    try {
      const key = this.generateKey(params)
      const cached = await redis.get(key)
      
      if (cached) {
        const duration = performance.now() - startTime
        performanceMonitor.recordMetric({
          name: 'catalog_cache_hit',
          value: duration,
          unit: 'ms',
          timestamp: new Date(),
          labels: { cache: 'redis', operation: 'catalog_get' }
        })
        
        return JSON.parse(cached)
      }
    } catch (error) {
      console.error('[CatalogPageCache] Get error:', error)
    }
    
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric({
      name: 'catalog_cache_miss',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      labels: { cache: 'redis', operation: 'catalog_get' }
    })
    
    return null
  }
  
  /**
   * Set catalog page in cache
   */
  async set(params: any, data: any): Promise<void> {
    if (!redis) return
    
    const startTime = performance.now()
    
    try {
      const key = this.generateKey(params)
      await redis.setex(key, this.ttl, JSON.stringify(data))
      
      const duration = performance.now() - startTime
      performanceMonitor.recordMetric({
        name: 'catalog_cache_set',
        value: duration,
        unit: 'ms',
        timestamp: new Date(),
        labels: { cache: 'redis', operation: 'catalog_set' }
      })
    } catch (error) {
      console.error('[CatalogPageCache] Set error:', error)
    }
  }
  
  /**
   * Invalidate all catalog pages (used after product updates)
   */
  async invalidateAll(): Promise<void> {
    if (!redis) return
    
    try {
      const keys = await redis.keys(`${this.keyPrefix}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
        console.log(`[CatalogPageCache] Invalidated ${keys.length} catalog pages`)
      }
    } catch (error) {
      console.error('[CatalogPageCache] Invalidate all error:', error)
    }
  }
}

// Export singleton instances
export const materialSpecCache = new MaterialSpecCache()
export const redisMaterialCache = new RedisMaterialCache()
export const catalogPageCache = new CatalogPageCache()

// Cleanup on process exit
if (typeof window === 'undefined') {
  process.on('exit', () => {
    materialSpecCache.destroy()
  })
}