/**
 * Image Quality Optimizer - Device-Aware 3D Sequence Enhancement
 * Automatically selects optimal image formats and quality settings based on device capabilities
 */

export interface DeviceCapabilities {
  tier: 'premium' | 'high' | 'standard' | 'low'
  supportsAvif: boolean
  supportsWebP: boolean
  pixelRatio: number
  connectionSpeed: 'fast' | 'medium' | 'slow'
  estimatedBandwidth: number // Mbps
  memoryGB: number
  cpuCores: number
}

export interface QualitySettings {
  format: 'avif' | 'webp' | 'png'
  fallbackFormats: string[]
  resolution: number
  quality: number
  frameCount: number
  compressionEffort: number
}

/**
 * Detect device capabilities for quality optimization
 */
export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  // Test AVIF support
  const supportsAvif = await testImageFormat('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=')
  
  // Test WebP support
  const supportsWebP = await testImageFormat('data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA')
  
  // Get device info
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const cpuCores = navigator.hardwareConcurrency || 4
  
  // Estimate memory (rough approximation)
  let memoryGB = 4 // Default estimate
  if ('memory' in (navigator as any)) {
    memoryGB = (navigator as any).memory.jsHeapSizeLimit / (1024 * 1024 * 1024)
  }
  
  // Test connection speed
  const { connectionSpeed, estimatedBandwidth } = await estimateConnectionSpeed()
  
  // Determine device tier
  const tier = determineDeviceTier({ cpuCores, memoryGB, pixelRatio, connectionSpeed })
  
  return {
    tier,
    supportsAvif,
    supportsWebP,
    pixelRatio,
    connectionSpeed,
    estimatedBandwidth,
    memoryGB,
    cpuCores
  }
}

/**
 * Get optimal quality settings based on device capabilities
 */
export function getOptimalQualitySettings(capabilities: DeviceCapabilities): QualitySettings {
  const { tier, supportsAvif, supportsWebP, pixelRatio, connectionSpeed } = capabilities
  
  // Base settings by device tier
  const tierSettings = {
    premium: {
      resolution: Math.min(2048, 1024 * pixelRatio),
      quality: 85,
      frameCount: 36,
      compressionEffort: 6
    },
    high: {
      resolution: Math.min(1024, 512 * pixelRatio),
      quality: 80,
      frameCount: 36,
      compressionEffort: 6
    },
    standard: {
      resolution: 512,
      quality: 75,
      frameCount: 24,
      compressionEffort: 4
    },
    low: {
      resolution: 512,
      quality: 70,
      frameCount: 18,
      compressionEffort: 2
    }
  }
  
  const settings = tierSettings[tier]
  
  // Adjust for connection speed
  if (connectionSpeed === 'slow') {
    settings.quality = Math.max(60, settings.quality - 15)
    settings.frameCount = Math.max(12, Math.round(settings.frameCount * 0.6))
  } else if (connectionSpeed === 'fast') {
    settings.quality = Math.min(95, settings.quality + 10)
  }
  
  // Select optimal format
  let format: 'avif' | 'webp' | 'png' = 'png'
  let fallbackFormats: string[] = ['png']
  
  if (supportsAvif) {
    format = 'avif'
    fallbackFormats = supportsWebP ? ['avif', 'webp', 'png'] : ['avif', 'png']
  } else if (supportsWebP) {
    format = 'webp'
    fallbackFormats = ['webp', 'png']
  }
  
  return {
    format,
    fallbackFormats,
    resolution: settings.resolution,
    quality: settings.quality,
    frameCount: settings.frameCount,
    compressionEffort: settings.compressionEffort
  }
}

/**
 * Test if browser supports specific image format
 */
async function testImageFormat(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = dataUrl
    
    // Timeout after 100ms
    setTimeout(() => resolve(false), 100)
  })
}

/**
 * Estimate connection speed
 */
async function estimateConnectionSpeed(): Promise<{ connectionSpeed: 'fast' | 'medium' | 'slow', estimatedBandwidth: number }> {
  // Use Network Information API if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection.effectiveType
    
    const speedMap = {
      'slow-2g': { speed: 'slow' as const, bandwidth: 0.5 },
      '2g': { speed: 'slow' as const, bandwidth: 1 },
      '3g': { speed: 'medium' as const, bandwidth: 5 },
      '4g': { speed: 'fast' as const, bandwidth: 25 }
    }
    
    const result = speedMap[effectiveType as keyof typeof speedMap] || { speed: 'medium' as const, bandwidth: 10 }
    return { connectionSpeed: result.speed, estimatedBandwidth: result.bandwidth }
  }
  
  // Fallback: measure download speed with small test image
  try {
    const startTime = performance.now()
    const testImage = new Image()
    
    await new Promise((resolve, reject) => {
      testImage.onload = resolve
      testImage.onerror = reject
      testImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // 1x1 transparent PNG
    })
    
    const loadTime = performance.now() - startTime
    
    if (loadTime < 50) return { connectionSpeed: 'fast', estimatedBandwidth: 25 }
    if (loadTime < 200) return { connectionSpeed: 'medium', estimatedBandwidth: 10 }
    return { connectionSpeed: 'slow', estimatedBandwidth: 2 }
    
  } catch (error) {
    return { connectionSpeed: 'medium', estimatedBandwidth: 10 }
  }
}

/**
 * Determine device performance tier
 */
function determineDeviceTier({ cpuCores, memoryGB, pixelRatio, connectionSpeed }: { 
  cpuCores: number
  memoryGB: number 
  pixelRatio: number
  connectionSpeed: string
}): 'premium' | 'high' | 'standard' | 'low' {
  // Premium: High-end devices with excellent performance
  if (cpuCores >= 8 && memoryGB >= 8 && pixelRatio >= 2 && connectionSpeed === 'fast') {
    return 'premium'
  }
  
  // High: Good performance devices
  if (cpuCores >= 4 && memoryGB >= 4 && connectionSpeed !== 'slow') {
    return 'high'
  }
  
  // Standard: Average devices
  if (cpuCores >= 4 && memoryGB >= 2) {
    return 'standard'
  }
  
  // Low: Budget devices or poor connections
  return 'low'
}

/**
 * Generate file size estimates for different quality settings
 */
export function estimateFileSizes(settings: QualitySettings, imageCount: number = 36): {
  totalSize: number
  perImageSize: number
  compressionRatio: number
} {
  const baseSize = (settings.resolution ** 2) * 4 // RGBA bytes
  
  const compressionRatios = {
    avif: 0.15,  // AVIF typically 85% smaller than PNG
    webp: 0.35,  // WebP typically 65% smaller than PNG  
    png: 1.0     // PNG baseline
  }
  
  const ratio = compressionRatios[settings.format]
  const qualityMultiplier = settings.quality / 100
  
  const perImageSize = Math.round(baseSize * ratio * qualityMultiplier)
  const totalSize = perImageSize * imageCount
  
  return {
    totalSize,
    perImageSize,
    compressionRatio: 1 / ratio
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Create enhanced ImageSequenceViewer props with optimal settings
 */
export async function createOptimizedViewerProps(imagePath: string): Promise<{
  imagePath: string
  preferredFormats: ('avif' | 'webp' | 'png')[]
  imageFormat: 'avif' | 'webp' | 'png'
  imageCount: number
  qualityInfo: {
    format: string
    tier: string
    estimatedSize: string
  }
}> {
  const capabilities = await detectDeviceCapabilities()
  const settings = getOptimalQualitySettings(capabilities)
  const sizeEstimate = estimateFileSizes(settings)
  
  return {
    imagePath,
    preferredFormats: settings.fallbackFormats as ('avif' | 'webp' | 'png')[],
    imageFormat: settings.format,
    imageCount: settings.frameCount,
    qualityInfo: {
      format: settings.format.toUpperCase(),
      tier: capabilities.tier,
      estimatedSize: formatFileSize(sizeEstimate.totalSize)
    }
  }
}