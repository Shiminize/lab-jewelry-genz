/**
 * Device Capabilities Detection for Three.js Premium Mode
 * Implements caching to prevent redundant detection calls
 */

// Global cache for device capabilities
let capabilitiesCache: DeviceCapabilities | null = null
let capabilitiesPromise: Promise<DeviceCapabilities> | null = null

export interface DeviceCapabilities {
  tier: 'premium' | 'high' | 'standard' | 'low'
  isDesktop: boolean
  supportsWebGL: boolean
  supportsWebGL2: boolean
  memoryGB: number
  cpuCores: number
  pixelRatio: number
  connectionSpeed: 'fast' | 'medium' | 'slow'
  gpuTier: 'high' | 'medium' | 'low'
  batteryLevel?: number
  isLowPowerMode?: boolean
}

export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  // Return cached result if available
  if (capabilitiesCache) {
    return capabilitiesCache
  }
  
  // Return existing promise if detection is in progress
  if (capabilitiesPromise) {
    return capabilitiesPromise
  }
  
  // Start new detection with timeout
  capabilitiesPromise = Promise.race([
    performDeviceCapabilityDetection(),
    new Promise<DeviceCapabilities>((_, reject) => 
      setTimeout(() => reject(new Error('Device capabilities detection timeout')), 3000)
    )
  ])
  
  try {
    capabilitiesCache = await capabilitiesPromise
    return capabilitiesCache
  } catch (error) {
    // Reset promise on failure so it can be retried
    capabilitiesPromise = null
    console.error('Device capabilities detection failed:', error)
    
    // Return fallback capabilities
    const fallback: DeviceCapabilities = {
      tier: 'standard',
      isDesktop: !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)),
      supportsWebGL: true,
      supportsWebGL2: false,
      memoryGB: 4,
      cpuCores: 4,
      pixelRatio: window.devicePixelRatio || 1,
      connectionSpeed: 'medium',
      gpuTier: 'medium'
    }
    
    capabilitiesCache = fallback
    return fallback
  }
}

async function performDeviceCapabilityDetection(): Promise<DeviceCapabilities> {
  const isDesktop = !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
  const cpuCores = navigator.hardwareConcurrency || 4
  const pixelRatio = window.devicePixelRatio || 1
  
  // Memory estimation
  let memoryGB = 4
  if ('memory' in (navigator as any)) {
    memoryGB = (navigator as any).memory.jsHeapSizeLimit / (1024 * 1024 * 1024)
  }
  
  // WebGL support detection
  const supportsWebGL = detectWebGL()
  const supportsWebGL2 = detectWebGL2()
  const gpuTier = await detectGPUTier()
  
  // Connection speed
  const connectionSpeed = detectConnectionSpeed()
  
  // Battery status
  const { batteryLevel, isLowPowerMode } = await detectBatteryStatus()
  
  // Determine tier
  const tier = determineDeviceTier({
    isDesktop,
    cpuCores,
    memoryGB,
    supportsWebGL2,
    gpuTier,
    connectionSpeed,
    isLowPowerMode
  })
  
  return {
    tier,
    isDesktop,
    supportsWebGL,
    supportsWebGL2,
    memoryGB,
    cpuCores,
    pixelRatio,
    connectionSpeed,
    gpuTier,
    batteryLevel,
    isLowPowerMode
  }
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

function detectWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    return !!gl
  } catch {
    return false
  }
}

async function detectGPUTier(): Promise<'high' | 'medium' | 'low'> {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl || !('getExtension' in gl)) return 'low'
    
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      
      // High-end GPUs
      if (/RTX|GTX 1[6-9]|GTX 20|GTX 30|GTX 40|Radeon RX|M1|M2|M3|Apple/.test(renderer)) {
        return 'high'
      }
      
      // Mid-range GPUs
      if (/GTX 1[0-5]|GTX 9|Radeon R|Intel Iris|UHD Graphics|Xe/.test(renderer)) {
        return 'medium'
      }
    }
    
    return 'low'
  } catch {
    return 'low'
  }
}

function detectConnectionSpeed(): 'fast' | 'medium' | 'slow' {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection.effectiveType
    
    switch (effectiveType) {
      case '4g': return 'fast'
      case '3g': return 'medium'
      default: return 'slow'
    }
  }
  
  return 'medium'
}

async function detectBatteryStatus(): Promise<{ batteryLevel?: number; isLowPowerMode?: boolean }> {
  try {
    if ('getBattery' in navigator) {
      // Add timeout to prevent hanging
      const batteryPromise = (navigator as any).getBattery()
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Battery API timeout')), 1000)
      )
      
      const battery = await Promise.race([batteryPromise, timeoutPromise])
      return {
        batteryLevel: battery.level * 100,
        isLowPowerMode: battery.level < 0.2 || !battery.charging
      }
    }
  } catch (error) {
    // Battery API not available or timed out
    console.warn('Battery API detection failed or timed out:', error)
  }
  
  return {}
}

function determineDeviceTier({
  isDesktop,
  cpuCores,
  memoryGB,
  supportsWebGL2,
  gpuTier,
  connectionSpeed,
  isLowPowerMode
}: {
  isDesktop: boolean
  cpuCores: number
  memoryGB: number
  supportsWebGL2: boolean
  gpuTier: string
  connectionSpeed: string
  isLowPowerMode?: boolean
}): 'premium' | 'high' | 'standard' | 'low' {
  // Low power mode forces standard tier
  if (isLowPowerMode) return 'standard'
  
  // Premium: Desktop with high-end specs
  if (isDesktop && cpuCores >= 8 && memoryGB >= 8 && supportsWebGL2 && gpuTier === 'high' && connectionSpeed === 'fast') {
    return 'premium'
  }
  
  // High: Good desktop specs or very capable mobile
  if ((isDesktop && cpuCores >= 6 && memoryGB >= 6 && supportsWebGL2) || 
      (!isDesktop && cpuCores >= 8 && memoryGB >= 6 && gpuTier === 'high')) {
    return 'high'
  }
  
  // Standard: Average devices
  if (cpuCores >= 4 && memoryGB >= 4 && supportsWebGL2) {
    return 'standard'
  }
  
  return 'low'
}

export function shouldUsePremiumMode(capabilities: DeviceCapabilities): boolean {
  return capabilities.tier === 'premium' && 
         capabilities.isDesktop && 
         capabilities.supportsWebGL2 &&
         !capabilities.isLowPowerMode
}

// Debug function to reset cache (useful for development)
export function resetDeviceCapabilitiesCache(): void {
  capabilitiesCache = null
  capabilitiesPromise = null
}