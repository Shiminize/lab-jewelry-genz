/**
 * AR Capabilities Detection and WebXR Foundation
 * Builds on device-capabilities for AR try-on features
 */

import { detectDeviceCapabilities, type DeviceCapabilities } from './device-capabilities'

export interface ARCapabilities extends DeviceCapabilities {
  supportsWebXR: boolean
  supportsARCore: boolean
  supportsARKit: boolean
  hasCamera: boolean
  hasMotionSensors: boolean
  screenSize: 'small' | 'medium' | 'large'
  isARReady: boolean
}

export interface ARSessionConfig {
  requiredFeatures: string[]
  optionalFeatures: string[]
  environmentBlendMode: 'opaque' | 'additive' | 'alpha-blend'
}

export async function detectARCapabilities(): Promise<ARCapabilities> {
  const baseCapabilities = await detectDeviceCapabilities()
  
  // WebXR support detection
  const supportsWebXR = await detectWebXR()
  
  // Platform-specific AR support
  const supportsARCore = /Android/i.test(navigator.userAgent) && supportsWebXR
  const supportsARKit = /iPhone|iPad/i.test(navigator.userAgent) && supportsWebXR
  
  // Camera and sensors
  const hasCamera = await detectCamera()
  const hasMotionSensors = await detectMotionSensors()
  
  // Screen size classification
  const screenSize = classifyScreenSize()
  
  // Overall AR readiness
  const isARReady = supportsWebXR && hasCamera && hasMotionSensors && (supportsARCore || supportsARKit)
  
  return {
    ...baseCapabilities,
    supportsWebXR,
    supportsARCore,
    supportsARKit,
    hasCamera,
    hasMotionSensors,
    screenSize,
    isARReady
  }
}

async function detectWebXR(): Promise<boolean> {
  try {
    if (!('xr' in navigator)) return false
    
    const xr = (navigator as any).xr
    if (!xr) return false
    
    // Check for immersive AR session support
    const isSupported = await xr.isSessionSupported('immersive-ar')
    return isSupported
  } catch (error) {
    console.log('WebXR not available:', error)
    return false
  }
}

async function detectCamera(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false
    
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some(device => device.kind === 'videoinput')
  } catch (error) {
    console.log('Camera detection failed:', error)
    return false
  }
}

async function detectMotionSensors(): Promise<boolean> {
  try {
    // Check for device orientation support
    if ('DeviceOrientationEvent' in window) {
      return new Promise((resolve) => {
        const handler = (event: DeviceOrientationEvent) => {
          window.removeEventListener('deviceorientation', handler)
          resolve(event.alpha !== null || event.beta !== null || event.gamma !== null)
        }
        
        const errorHandler = () => {
          window.removeEventListener('deviceorientation', handler)
          console.warn('AR: Device orientation blocked by permissions policy')
          resolve(false)
        }
        
        try {
          window.addEventListener('deviceorientation', handler)
        } catch (error) {
          console.warn('AR: Cannot add device orientation listener:', error)
          resolve(false)
          return
        }
        
        // Timeout after 1 second
        setTimeout(() => {
          window.removeEventListener('deviceorientation', handler)
          resolve(false)
        }, 1000)
      })
    }
    
    return false
  } catch (error) {
    console.log('Motion sensor detection failed:', error)
    return false
  }
}

function classifyScreenSize(): 'small' | 'medium' | 'large' {
  const width = window.innerWidth
  const height = window.innerHeight
  const diagonal = Math.sqrt(width * width + height * height)
  
  if (diagonal < 800) return 'small'   // Phone
  if (diagonal < 1400) return 'medium' // Tablet
  return 'large'                       // Desktop/Large tablet
}

export function getARSessionConfig(capabilities: ARCapabilities): ARSessionConfig {
  const requiredFeatures = ['local']
  const optionalFeatures = ['hand-tracking', 'hit-test', 'dom-overlay']
  
  // Add features based on device capabilities
  if (capabilities.supportsARCore) {
    optionalFeatures.push('plane-detection')
  }
  
  if (capabilities.supportsARKit) {
    optionalFeatures.push('face-tracking')
  }
  
  return {
    requiredFeatures,
    optionalFeatures,
    environmentBlendMode: 'alpha-blend'
  }
}

export function shouldEnableARMode(capabilities: ARCapabilities): boolean {
  return capabilities.isARReady && 
         capabilities.hasCamera && 
         capabilities.screenSize !== 'small' && 
         capabilities.tier !== 'low'
}

/**
 * AR Session Management Hook Data
 */
export interface ARSession {
  isActive: boolean
  isSupported: boolean
  error?: string
  mode: 'preview' | 'fitting' | 'placement'
}

export const DEFAULT_AR_SESSION: ARSession = {
  isActive: false,
  isSupported: false,
  mode: 'preview'
}