/**
 * Asset Loading Utilities with Fallback Strategies
 * CLAUDE_RULES compliant error handling and graceful degradation
 */

import React from 'react'

interface AssetLoadResult {
  success: boolean
  url?: string
  error?: string
  fallbackUsed?: boolean
}

interface FallbackConfig {
  retries?: number
  timeout?: number
  fallbackAssets?: string[]
  defaultAsset?: string
}

/**
 * Preload asset with fallback strategy
 * Returns promise that resolves to AssetLoadResult
 */
export async function preloadAssetWithFallback(
  url: string, 
  type: 'image' | 'model' | 'video' = 'image',
  config: FallbackConfig = {}
): Promise<AssetLoadResult> {
  const {
    retries = 2,
    timeout = 5000,
    fallbackAssets = [],
    defaultAsset = type === 'image' ? '/images/placeholder.jpg' : undefined
  } = config

  const attemptLoad = async (assetUrl: string, attempt: number = 1): Promise<AssetLoadResult> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(assetUrl, {
        signal: controller.signal,
        method: 'HEAD' // Just check if asset exists
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return { success: true, url: assetUrl }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Try retries first
      if (attempt <= retries) {
        console.warn(`Asset load attempt ${attempt} failed for ${assetUrl}: ${errorMessage}. Retrying...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 500)) // Exponential backoff
        return attemptLoad(assetUrl, attempt + 1)
      }

      // Try fallback assets
      for (const fallback of fallbackAssets) {
        try {
          console.warn(`Primary asset failed: ${assetUrl}. Trying fallback: ${fallback}`)
          const fallbackResult = await attemptLoad(fallback, 1)
          if (fallbackResult.success) {
            return { ...fallbackResult, fallbackUsed: true }
          }
        } catch (fallbackError) {
          console.warn(`Fallback ${fallback} also failed:`, fallbackError)
        }
      }

      // Use default asset if available
      if (defaultAsset) {
        try {
          console.warn(`All assets failed for ${url}. Using default: ${defaultAsset}`)
          const defaultResult = await attemptLoad(defaultAsset, 1)
          if (defaultResult.success) {
            return { ...defaultResult, fallbackUsed: true }
          }
        } catch (defaultError) {
          console.error(`Even default asset failed:`, defaultError)
        }
      }

      return {
        success: false,
        error: errorMessage,
        url: assetUrl
      }
    }
  }

  return attemptLoad(url)
}

/**
 * Enhanced asset preloader for layout.tsx
 * Validates assets before adding to DOM
 */
export async function validateAndPreloadAssets(assets: Array<{
  url: string
  type: 'image' | 'model' | 'video'
  fallbacks?: string[]
  required?: boolean
}>): Promise<{
  validAssets: Array<{ url: string, type: string }>
  failedAssets: Array<{ url: string, error: string }>
}> {
  const validAssets: Array<{ url: string, type: string }> = []
  const failedAssets: Array<{ url: string, error: string }> = []

  const validationPromises = assets.map(async (asset) => {
    const result = await preloadAssetWithFallback(asset.url, asset.type, {
      fallbackAssets: asset.fallbacks,
      retries: asset.required ? 3 : 1,
      timeout: asset.required ? 8000 : 3000
    })

    if (result.success && result.url) {
      validAssets.push({ url: result.url, type: asset.type })
      
      if (result.fallbackUsed) {
        console.warn(`Asset ${asset.url} loaded using fallback: ${result.url}`)
      } else {

      }
    } else {
      const errorMsg = result.error || 'Unknown validation error'
      failedAssets.push({ url: asset.url, error: errorMsg })
      
      if (asset.required) {
        console.error(`CRITICAL: Required asset failed to load: ${asset.url} - ${errorMsg}`)
      } else {
        console.warn(`Optional asset failed to load: ${asset.url} - ${errorMsg}`)
      }
    }
  })

  await Promise.all(validationPromises)

  return { validAssets, failedAssets }
}

/**
 * Generate preload links for validated assets
 * Only creates DOM elements for assets that actually exist
 */
export function generatePreloadLinks(validAssets: Array<{ url: string, type: string }>): string[] {
  return validAssets.map(asset => {
    const crossOrigin = asset.url.startsWith('/') ? '' : 'crossorigin="anonymous"'
    
    switch (asset.type) {
      case 'model':
        return `<link rel="preload" href="${asset.url}" as="fetch" type="model/gltf-binary" ${crossOrigin} />`
      case 'image':
        return `<link rel="preload" href="${asset.url}" as="image" ${crossOrigin} />`
      case 'video':
        return `<link rel="preload" href="${asset.url}" as="video" ${crossOrigin} />`
      default:
        return `<link rel="preload" href="${asset.url}" ${crossOrigin} />`
    }
  })
}

/**
 * Runtime asset loader with error recovery
 * For use in components that need to load assets dynamically
 */
export class AssetLoader {
  private cache = new Map<string, AssetLoadResult>()
  private loadingPromises = new Map<string, Promise<AssetLoadResult>>()

  async loadAsset(url: string, type: 'image' | 'model' | 'video' = 'image', config?: FallbackConfig): Promise<AssetLoadResult> {
    // Return cached result if available
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!
    }

    // Start new loading operation
    const loadingPromise = preloadAssetWithFallback(url, type, config)
    this.loadingPromises.set(url, loadingPromise)

    try {
      const result = await loadingPromise
      this.cache.set(url, result)
      return result
    } finally {
      this.loadingPromises.delete(url)
    }
  }

  clearCache(): void {
    this.cache.clear()
    this.loadingPromises.clear()
  }

  getCacheStats(): { cached: number, loading: number } {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size
    }
  }
}

// Global asset loader instance
export const globalAssetLoader = new AssetLoader()

/**
 * Hook for React components to load assets with fallbacks
 */
export function useAssetWithFallback(url: string, type: 'image' | 'model' | 'video' = 'image', config?: FallbackConfig) {
  const [result, setResult] = React.useState<AssetLoadResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    globalAssetLoader.loadAsset(url, type, config).then(loadResult => {
      if (!cancelled) {
        setResult(loadResult)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [url, type])

  return { result, isLoading }
}