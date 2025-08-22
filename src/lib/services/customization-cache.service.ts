
/**
 * High-Performance Caching Service for Customization API
 * Implements multi-tier caching strategy
 */

import Redis from 'ioredis'

interface CacheConfig {
  ttl: number
  prefix: string
  compression?: boolean
}

interface CachedCustomizationData {
  variants: any[]
  materialOptions: any[]
  sequenceData?: any
  generatedAt: number
  expiresAt: number
}

class CustomizationCacheService {
  private redis: Redis
  private configs: Record<string, CacheConfig>
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
    
    // Cache configuration by data type
    this.configs = {
      variants: { ttl: 900, prefix: 'variants:', compression: true },     // 15 minutes
      materials: { ttl: 3600, prefix: 'materials:', compression: false }, // 1 hour
      sequences: { ttl: 1800, prefix: 'sequences:', compression: true },  // 30 minutes
      popular: { ttl: 7200, prefix: 'popular:', compression: false }      // 2 hours
    }
  }

  // Cache variants for specific product configuration
  async cacheVariants(productId: string, variants: any[]): Promise<void> {
    const key = this.buildKey('variants', productId)
    const data: CachedCustomizationData = {
      variants,
      materialOptions: this.extractMaterialOptions(variants),
      generatedAt: Date.now(),
      expiresAt: Date.now() + (this.configs.variants.ttl * 1000)
    }
    
    await this.redis.setex(
      key,
      this.configs.variants.ttl,
      JSON.stringify(data)
    )
  }

  // Retrieve cached variants
  async getCachedVariants(productId: string): Promise<any[] | null> {
    const key = this.buildKey('variants', productId)
    const cached = await this.redis.get(key)
    
    if (!cached) return null
    
    try {
      const data: CachedCustomizationData = JSON.parse(cached)
      
      // Check expiration
      if (Date.now() > data.expiresAt) {
        await this.redis.del(key)
        return null
      }
      
      return data.variants
    } catch (error) {
      console.error('Cache parsing error:', error)
      return null
    }
  }

  // Cache material switching data for instant response
  async cacheMaterialOptions(jewelryType: string, options: any[]): Promise<void> {
    const key = this.buildKey('materials', jewelryType)
    await this.redis.setex(
      key,
      this.configs.materials.ttl,
      JSON.stringify({
        options,
        generatedAt: Date.now()
      })
    )
  }

  // Get cached material options
  async getCachedMaterialOptions(jewelryType: string): Promise<any[] | null> {
    const key = this.buildKey('materials', jewelryType)
    const cached = await this.redis.get(key)
    
    if (!cached) return null
    
    try {
      const data = JSON.parse(cached)
      return data.options
    } catch (error) {
      console.error('Material cache parsing error:', error)
      return null
    }
  }

  // Cache 3D sequence data for rapid material switching
  async cacheSequenceData(configId: string, materialId: string, sequenceData: any): Promise<void> {
    const key = this.buildKey('sequences', `${configId}:${materialId}`)
    await this.redis.setex(
      key,
      this.configs.sequences.ttl,
      JSON.stringify({
        sequenceData,
        cachedAt: Date.now()
      })
    )
  }

  // Get cached sequence data
  async getCachedSequenceData(configId: string, materialId: string): Promise<any | null> {
    const key = this.buildKey('sequences', `${configId}:${materialId}`)
    const cached = await this.redis.get(key)
    
    if (!cached) return null
    
    try {
      const data = JSON.parse(cached)
      return data.sequenceData
    } catch (error) {
      console.error('Sequence cache parsing error:', error)
      return null
    }
  }

  // Warm up cache with popular configurations
  async warmUpPopularConfigs(popularConfigs: any[]): Promise<void> {
    console.log('🔥 Warming up cache with popular configurations...')
    
    for (const config of popularConfigs) {
      await this.cacheVariants(config.productId, config.variants)
      await this.cacheMaterialOptions(config.jewelryType, config.materialOptions)
    }
    
    console.log(`✅ Cache warmed up with ${popularConfigs.length} popular configurations`)
  }

  // Performance monitoring
  async getCacheStats(): Promise<any> {
    const info = await this.redis.info('memory')
    const keyCount = await this.redis.dbsize()
    
    return {
      memoryUsage: this.parseMemoryInfo(info),
      keyCount,
      configs: this.configs
    }
  }

  // Utility methods
  private buildKey(type: string, identifier: string): string {
    return `${this.configs[type].prefix}${identifier}`
  }

  private extractMaterialOptions(variants: any[]): any[] {
    const materials = new Set()
    variants.forEach(variant => {
      if (variant.materials) {
        Object.keys(variant.materials).forEach(material => materials.add(material))
      }
    })
    return Array.from(materials)
  }

  private parseMemoryInfo(info: string): any {
    const lines = info.split('\r\n')
    const memory: any = {}
    
    lines.forEach(line => {
      if (line.includes('used_memory_human:')) {
        memory.used = line.split(':')[1]
      }
      if (line.includes('used_memory_peak_human:')) {
        memory.peak = line.split(':')[1]
      }
    })
    
    return memory
  }
}

export const customizationCache = new CustomizationCacheService()
