
/**
 * 3D Asset Progressive Loading System
 * Implements quality tiers and connection-aware delivery
 */

interface AssetQuality {
  frames: number
  size: string
  format: 'webp' | 'avif' | 'jpg'
  dimensions: string
  loadTime: string
}

interface LoadingStrategy {
  immediate: AssetQuality
  onInteraction: AssetQuality
  onDemand: AssetQuality
}

class Asset3DOptimizer {
  private loadingStrategies: Record<string, LoadingStrategy>
  private connectionSpeed: string = 'fast'
  
  constructor() {
    this.loadingStrategies = {
      mobile: {
        immediate: { frames: 8, size: '30KB', format: 'webp', dimensions: '200x200', loadTime: '<100ms' },
        onInteraction: { frames: 16, size: '80KB', format: 'webp', dimensions: '300x300', loadTime: '<200ms' },
        onDemand: { frames: 24, size: '200KB', format: 'webp', dimensions: '500x500', loadTime: '<500ms' }
      },
      desktop: {
        immediate: { frames: 12, size: '50KB', format: 'webp', dimensions: '300x300', loadTime: '<100ms' },
        onInteraction: { frames: 36, size: '150KB', format: 'webp', dimensions: '500x500', loadTime: '<300ms' },
        onDemand: { frames: 60, size: '500KB', format: 'avif', dimensions: '800x800', loadTime: '<800ms' }
      },
      highEnd: {
        immediate: { frames: 16, size: '80KB', format: 'avif', dimensions: '400x400', loadTime: '<100ms' },
        onInteraction: { frames: 48, size: '250KB', format: 'avif', dimensions: '600x600', loadTime: '<250ms' },
        onDemand: { frames: 72, size: '800KB', format: 'avif', dimensions: '1000x1000', loadTime: '<600ms' }
      }
    }
    
    this.detectConnectionSpeed()
  }

  // Detect user's connection and device capabilities
  detectConnectionSpeed(): void {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      
      if (connection) {
        const speed = connection.effectiveType
        switch (speed) {
          case '4g':
            this.connectionSpeed = 'fast'
            break
          case '3g':
            this.connectionSpeed = 'medium'
            break
          case '2g':
          case 'slow-2g':
            this.connectionSpeed = 'slow'
            break
          default:
            this.connectionSpeed = 'fast'
        }
      }
    }
  }

  // Get optimal loading strategy based on device and connection
  getOptimalStrategy(deviceType: 'mobile' | 'desktop' | 'highEnd' = 'desktop'): LoadingStrategy {
    // Adjust strategy based on connection speed
    if (this.connectionSpeed === 'slow') {
      return this.loadingStrategies.mobile // Use mobile strategy for slow connections
    }
    
    return this.loadingStrategies[deviceType] || this.loadingStrategies.desktop
  }

  // Generate asset URLs for progressive loading
  generateAssetUrls(
    productId: string, 
    materialId: string, 
    quality: 'immediate' | 'onInteraction' | 'onDemand' = 'immediate'
  ): string[] {
    const strategy = this.getOptimalStrategy()
    const assetQuality = strategy[quality]
    
    const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || '/assets/3d'
    const urls: string[] = []
    
    for (let frame = 1; frame <= assetQuality.frames; frame++) {
      const frameNumber = frame.toString().padStart(3, '0')
      const url = `${baseUrl}/${productId}/${materialId}/${quality}/frame_${frameNumber}.${assetQuality.format}`
      urls.push(url)
    }
    
    return urls
  }

  // Preload assets based on priority
  async preloadAssets(
    productId: string, 
    materialId: string, 
    priority: 'immediate' | 'onInteraction' | 'onDemand' = 'immediate'
  ): Promise<boolean> {
    const urls = this.generateAssetUrls(productId, materialId, priority)
    
    try {
      // Load first few frames immediately for preview
      const previewUrls = urls.slice(0, Math.min(4, urls.length))
      
      const preloadPromises = previewUrls.map(url => 
        new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to load ${url}`))
          img.src = url
        })
      )
      
      await Promise.all(preloadPromises)
      
      // Background load remaining frames
      this.backgroundLoadAssets(urls.slice(4))
      
      return true
    } catch (error) {
      console.error('Asset preloading failed:', error)
      return false
    }
  }

  // Background loading for remaining assets
  private backgroundLoadAssets(urls: string[]): void {
    const loadNext = (index: number) => {
      if (index >= urls.length) return
      
      const img = new Image()
      img.onload = () => {
        // Load next asset after current one completes
        setTimeout(() => loadNext(index + 1), 50)
      }
      img.onerror = () => {
        // Skip failed assets and continue
        loadNext(index + 1)
      }
      img.src = urls[index]
    }
    
    loadNext(0)
  }

  // Get performance metrics for asset loading
  async measureAssetPerformance(
    productId: string, 
    materialId: string
  ): Promise<{ loadTime: number, quality: string }> {
    const startTime = performance.now()
    
    try {
      await this.preloadAssets(productId, materialId, 'immediate')
      const loadTime = performance.now() - startTime
      
      return {
        loadTime: Math.round(loadTime),
        quality: loadTime < 300 ? 'excellent' : loadTime < 500 ? 'good' : 'needs_optimization'
      }
    } catch (error) {
      return {
        loadTime: -1,
        quality: 'failed'
      }
    }
  }

  // Generate CDN configuration for optimal delivery
  generateCDNConfig(): any {
    return {
      regions: ['us-east-1', 'us-west-1', 'eu-west-1'],
      caching: {
        maxAge: '24h',
        staleWhileRevalidate: '48h',
        compression: ['brotli', 'gzip']
      },
      optimization: {
        imageFormat: 'auto', // Let CDN choose best format
        quality: 'auto',     // Adaptive quality based on connection
        resize: 'auto'       // Responsive sizing
      },
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=172800',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*'
      }
    }
  }
}

export const asset3DOptimizer = new Asset3DOptimizer()
