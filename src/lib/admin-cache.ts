'use client'

// Admin dashboard caching system for performance optimization
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  version: string
}

interface CacheConfig {
  defaultTTL: number
  maxSize: number
  enableCompression: boolean
  enableEncryption: boolean
}

export class AdminCacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100, // Maximum number of cache entries
      enableCompression: false, // Disable for browser compatibility
      enableEncryption: false, // Disable for performance
      ...config
    }

    // Auto-cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  // Cache key generation
  private generateCacheKey(namespace: string, params: any = {}): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    
    return `admin:${namespace}:${paramString}`
  }

  // Get cached data
  async get<T>(namespace: string, params: any = {}): Promise<T | null> {
    const key = this.generateCacheKey(namespace, params)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Return cached data
    return entry.data as T
  }

  // Set cached data
  async set<T>(
    namespace: string, 
    data: T, 
    params: any = {}, 
    ttl: number = this.config.defaultTTL
  ): Promise<void> {
    const key = this.generateCacheKey(namespace, params)

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: '1.0.0'
    }

    this.cache.set(key, entry)
  }

  // Invalidate cache entries
  invalidate(namespace: string, params: any = {}): void {
    if (params && Object.keys(params).length > 0) {
      // Invalidate specific entry
      const key = this.generateCacheKey(namespace, params)
      this.cache.delete(key)
    } else {
      // Invalidate all entries in namespace
      const keysToDelete = Array.from(this.cache.keys())
        .filter(key => key.startsWith(`admin:${namespace}:`))
      
      keysToDelete.forEach(key => this.cache.delete(key))
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key))

    if (expiredKeys.length > 0) {
      console.log(`[CACHE] Cleaned up ${expiredKeys.length} expired entries`)
    }
  }

  // Get cache statistics
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    memoryUsage: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses in real implementation
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  // Estimate memory usage (rough calculation)
  private estimateMemoryUsage(): number {
    let totalSize = 0
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2 // UTF-16 encoding
      totalSize += JSON.stringify(entry.data).length * 2
      totalSize += 100 // Overhead for timestamp, ttl, etc.
    }

    return totalSize
  }
}

// Global cache manager instance
export const adminCache = new AdminCacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 50, // Limit for browser memory
  enableCompression: false,
  enableEncryption: false
})

// Cache-aware fetch wrapper for admin APIs
export async function cachedAdminFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheNamespace: string = 'api',
  cacheTTL: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  const cacheParams = {
    url,
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined
  }

  // Try to get from cache first (only for GET requests)
  if (!options.method || options.method === 'GET') {
    const cached = await adminCache.get<T>(cacheNamespace, cacheParams)
    if (cached) {
      return cached
    }
  }

  // Fetch from API
  try {
    const response = await fetch(url, options)
    const data = await response.json()

    // Cache successful responses (only for GET requests)
    if (response.ok && (!options.method || options.method === 'GET')) {
      await adminCache.set(cacheNamespace, data, cacheParams, cacheTTL)
    }

    return data as T
  } catch (error) {
    // Try to return stale cache data as fallback
    const staleData = await adminCache.get<T>(cacheNamespace, cacheParams)
    if (staleData) {
      console.warn('[CACHE] Using stale data due to API error:', error)
      return staleData
    }
    
    throw error
  }
}

// Preload cache for critical admin data
export async function preloadAdminCache(): Promise<void> {
  const criticalEndpoints = [
    { url: '/api/admin/dashboard/metrics', namespace: 'metrics', ttl: 2 * 60 * 1000 },
    { url: '/api/admin/dashboard/alerts', namespace: 'alerts', ttl: 1 * 60 * 1000 },
    { url: '/api/admin/inventory', namespace: 'inventory', ttl: 5 * 60 * 1000 }
  ]

  const preloadPromises = criticalEndpoints.map(async endpoint => {
    try {
      await cachedAdminFetch(endpoint.url, {}, endpoint.namespace, endpoint.ttl)
      console.log(`[CACHE] Preloaded: ${endpoint.namespace}`)
    } catch (error) {
      console.warn(`[CACHE] Failed to preload ${endpoint.namespace}:`, error)
    }
  })

  await Promise.allSettled(preloadPromises)
}

// Cache performance monitoring
export function setupCacheMonitoring(): void {
  // Log cache statistics every 5 minutes
  setInterval(() => {
    const stats = adminCache.getStats()
    console.log('[CACHE] Statistics:', {
      entries: stats.size,
      maxEntries: stats.maxSize,
      memoryUsage: `${(stats.memoryUsage / 1024).toFixed(1)}KB`,
      utilizationPercent: `${((stats.size / stats.maxSize) * 100).toFixed(1)}%`
    })
  }, 5 * 60 * 1000)

  // Clear cache on memory pressure (browser only)
  if (typeof window !== 'undefined') {
    // Listen for memory pressure events
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory
        if (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize > 0.9) {
          console.warn('[CACHE] Memory pressure detected, clearing cache')
          adminCache.clear()
        }
      }, 30000)
    }

    // Clear cache on page visibility change (when user leaves tab)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Partially clear cache when tab becomes hidden
        const stats = adminCache.getStats()
        if (stats.size > stats.maxSize * 0.7) {
          console.log('[CACHE] Tab hidden, performing cache cleanup')
          // Keep only most recent entries
          adminCache.clear()
        }
      }
    })
  }
}

// Cache invalidation strategies
export const CacheInvalidation = {
  // Invalidate metrics when business data changes
  onMetricsUpdate: () => {
    adminCache.invalidate('metrics')
    adminCache.invalidate('api', { url: '/api/admin/dashboard/metrics' })
  },

  // Invalidate alerts when system state changes
  onSystemStateChange: () => {
    adminCache.invalidate('alerts')
    adminCache.invalidate('api', { url: '/api/admin/dashboard/alerts' })
  },

  // Invalidate inventory when stock changes
  onInventoryUpdate: () => {
    adminCache.invalidate('inventory')
    adminCache.invalidate('api', { url: '/api/admin/inventory' })
  },

  // Invalidate all admin data
  onAdminDataUpdate: () => {
    adminCache.clear()
  }
}