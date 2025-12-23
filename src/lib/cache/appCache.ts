/**
 * Simple in-memory LRU cache with TTL
 * Used for app-level caching (10s) in addition to edge cache (30s)
 * 
 * Purpose: Reduce load on database/provider for identical requests within 10s window
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class AppCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly ttlMs: number
  private readonly maxSize: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(ttlMs: number = 10_000, maxSize: number = 100) {
    this.ttlMs = ttlMs
    this.maxSize = maxSize
    
    // Cleanup expired entries every 30 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 30_000)
  }

  /**
   * Canonicalize query parameters for consistent cache keys
   * Sorts params alphabetically for identical queries with different param order
   */
  static canonicalizeKey(searchParams: URLSearchParams): string {
    const sorted = Array.from(searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    return sorted || '__empty__'
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const now = Date.now()
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }

  set(key: string, value: T): void {
    // Enforce max size (simple LRU: delete oldest if over limit)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
    
    const expiresAt = Date.now() + this.ttlMs
    this.cache.set(key, { value, expiresAt })
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    })
    
    if (cleaned > 0) {
      console.log(JSON.stringify({
        type: 'app-cache',
        action: 'cleanup',
        cleaned,
        remaining: this.cache.size,
      }))
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlMs: this.ttlMs,
    }
  }

  clear() {
    this.cache.clear()
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Singleton instance for product API caching (10s TTL, max 100 entries)
export const productCache = new AppCache<any>(10_000, 100)

// Log startup
console.log(
  '🔄 App-level cache initialized (10s TTL, max 100 entries) for /api/concierge/products'
)

