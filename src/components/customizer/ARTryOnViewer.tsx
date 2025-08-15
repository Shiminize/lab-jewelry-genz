'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { detectARCapabilities, shouldEnableARMode, getARSessionConfig, type ARCapabilities } from '@/lib/ar-capabilities'

interface ARTryOnViewerProps {
  modelPath: string
  material?: {
    metalness: number
    roughness: number
    color: string
  }
  className?: string
  onSessionStart?: () => void
  onSessionEnd?: () => void
  onError?: (error: Error) => void
}

export function ARTryOnViewer({
  modelPath,
  material = { metalness: 1.0, roughness: 0.1, color: '#ffffff' },
  className,
  onSessionStart,
  onSessionEnd,
  onError
}: ARTryOnViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sessionRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)
  
  const [capabilities, setCapabilities] = useState<ARCapabilities | null>(null)
  const [isARSupported, setIsARSupported] = useState(false)
  const [isARActive, setIsARActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [permissionsGranted, setPermissionsGranted] = useState(false)

  // Detect AR capabilities on mount
  useEffect(() => {
    const detectCapabilities = async () => {
      try {
        const caps = await detectARCapabilities()
        setCapabilities(caps)
        setIsARSupported(shouldEnableARMode(caps))
        
        console.log('🔍 AR Capabilities detected:', {
          supported: caps.isARReady,
          webxr: caps.supportsWebXR,
          arcore: caps.supportsARCore,
          arkit: caps.supportsARKit,
          camera: caps.hasCamera,
          tier: caps.tier
        })
      } catch (error) {
        console.error('AR capability detection failed:', error)
        setIsARSupported(false)
      }
    }

    detectCapabilities()
  }, [])

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop())
      
      setPermissionsGranted(true)
      return true
    } catch (error) {
      console.error('Camera permission denied:', error)
      setError('Camera access required for AR try-on')
      return false
    }
  }, [])

  const startARSession = useCallback(async () => {
    if (!capabilities || !isARSupported) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Request permissions first
      if (!permissionsGranted) {
        const granted = await requestPermissions()
        if (!granted) {
          setIsLoading(false)
          return
        }
      }

      // Initialize Three.js for AR
      const [
        THREE,
        { GLTFLoader },
        { ARButton }
      ] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/webxr/ARButton.js')
      ])

      const canvas = canvasRef.current
      if (!canvas) throw new Error('Canvas not available')

      // Setup AR scene
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)
      
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
      })
      
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.xr.enabled = true
      renderer.setClearColor(0x000000, 0)

      // AR lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(0, 1, 1)
      scene.add(directionalLight)

      // Load jewelry model
      const loader = new GLTFLoader()
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(modelPath, resolve, undefined, reject)
      })

      const model = gltf.scene
      
      // Apply material properties
      model.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (child.material.isMeshStandardMaterial) {
            child.material.metalness = material.metalness
            child.material.roughness = material.roughness
            child.material.color.setHex(material.color.replace('#', '0x'))
          }
        }
      })

      // Scale and position for AR
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 0.05 / maxDim // Small scale for AR (5cm)
      model.scale.setScalar(scale)
      
      // Position model in front of camera
      model.position.set(0, 0, -0.3)
      scene.add(model)

      // Store references
      rendererRef.current = renderer
      sceneRef.current = scene
      
      // Request AR session
      const sessionConfig = getARSessionConfig(capabilities)
      const session = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: sessionConfig.requiredFeatures,
        optionalFeatures: sessionConfig.optionalFeatures
      })
      
      sessionRef.current = session
      await renderer.xr.setSession(session)
      
      setIsARActive(true)
      setIsLoading(false)
      onSessionStart?.()
      
      // Handle session end
      session.addEventListener('end', () => {
        setIsARActive(false)
        onSessionEnd?.()
      })

      // Start render loop
      renderer.setAnimationLoop(() => {
        if (session) {
          renderer.render(scene, camera)
        }
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start AR session'
      setError(errorMessage)
      setIsLoading(false)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      console.error('AR session failed:', error)
    }
  }, [capabilities, isARSupported, permissionsGranted, modelPath, material, onSessionStart, onSessionEnd, onError, requestPermissions])

  const endARSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.end()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.end()
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

  return (
    <div className={cn('relative w-full h-full', className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isARActive ? 'block' : 'none' }}
      />

      {/* AR Controls */}
      {!isARActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95">
          <div className="text-center space-y-6 p-6 max-w-md">
            
            {/* AR Status */}
            <div className="space-y-3">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-accent text-2xl">📱</span>
              </div>
              
              <div>
                <MutedText className="font-medium text-foreground mb-2">
                  {isARSupported ? 'AR Try-On Ready' : 'AR Preview Mode'}
                </MutedText>
                <MutedText size="sm" className="text-gray-600">
                  {error || (isARSupported 
                    ? 'Experience your jewelry in augmented reality'
                    : 'AR try-on requires a compatible mobile device'
                  )}
                </MutedText>
              </div>
            </div>

            {/* AR Requirements */}
            {capabilities && (
              <div className="space-y-2 text-left">
                <MutedText size="sm" className="text-gray-600 font-medium">Device Status:</MutedText>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <MutedText size="sm">WebXR Support</MutedText>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      capabilities.supportsWebXR ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {capabilities.supportsWebXR ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <MutedText size="sm">Camera Access</MutedText>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      capabilities.hasCamera ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {capabilities.hasCamera ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <MutedText size="sm">Motion Sensors</MutedText>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      capabilities.hasMotionSensors ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {capabilities.hasMotionSensors ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AR Action Button */}
            <div className="space-y-3">
              {isARSupported ? (
                <Button
                  onClick={startARSession}
                  disabled={isLoading || !!error}
                  className="w-full"
                  variant="primary"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      <span>Starting AR...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>📱</span>
                      <span>Try On in AR</span>
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="w-full"
                >
                  AR Not Available
                </Button>
              )}
              
              {isARSupported && (
                <MutedText size="sm" className="text-gray-600">
                  Point your camera at a well-lit surface and tap to place jewelry
                </MutedText>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AR Session Controls */}
      {isARActive && (
        <div className="absolute top-4 left-4 right-4 z-50">
          <div className="flex justify-between items-center">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2 border border-accent">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <MutedText size="sm" className="text-accent font-medium">AR Active</MutedText>
              </div>
            </div>
            
            <Button
              onClick={endARSession}
              variant="outline"
              className="bg-background/95 backdrop-blur-sm"
            >
              Exit AR
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}