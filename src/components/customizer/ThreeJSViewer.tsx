'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MutedText } from '@/components/foundation/Typography'

interface ThreeJSViewerProps {
  modelPath: string
  material?: {
    metalness: number
    roughness: number
    color: string
  }
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
  enableControls?: boolean
  autoRotate?: boolean
}

export function ThreeJSViewer({
  modelPath,
  material = { metalness: 1.0, roughness: 0.1, color: '#ffffff' },
  className,
  onLoad,
  onError,
  onInteractionStart,
  onInteractionEnd,
  enableControls = true,
  autoRotate = false
}: ThreeJSViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const modelRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const animationFrameRef = useRef<number>()
  
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loadProgress, setLoadProgress] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)

  // Three.js initialization
  useEffect(() => {
    let isMounted = true
    
    const initThreeJS = async () => {
      try {
        // Dynamic import Three.js
        const [
          THREE,
          { GLTFLoader },
          { OrbitControls }
        ] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/controls/OrbitControls.js')
        ])

        if (!isMounted) return

        const canvas = canvasRef.current
        if (!canvas) return

        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        })

        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
        renderer.setClearColor(0x000000, 0)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap

        // Enhanced lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
        scene.add(ambientLight)

        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
        mainLight.position.set(5, 5, 5)
        mainLight.castShadow = true
        mainLight.shadow.mapSize.width = 2048
        mainLight.shadow.mapSize.height = 2048
        scene.add(mainLight)

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
        fillLight.position.set(-5, 5, -5)
        scene.add(fillLight)

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2)
        rimLight.position.set(0, -5, 5)
        scene.add(rimLight)

        // Controls setup
        let controls
        if (enableControls) {
          controls = new OrbitControls(camera, canvas)
          controls.enableDamping = true
          controls.dampingFactor = 0.05
          controls.enableZoom = true
          controls.enablePan = false
          controls.autoRotate = autoRotate
          controls.autoRotateSpeed = 2.0
          
          controls.addEventListener('start', () => {
            setIsInteracting(true)
            onInteractionStart?.()
          })
          
          controls.addEventListener('end', () => {
            setIsInteracting(false)
            onInteractionEnd?.()
          })
        }

        // Model loading
        const loader = new GLTFLoader()
        
        loader.load(
          modelPath,
          (gltf) => {
            if (!isMounted) return

            const model = gltf.scene
            
            // Apply material settings
            model.traverse((child: any) => {
              if (child.isMesh && child.material) {
                if (child.material.isMeshStandardMaterial) {
                  child.material.metalness = material.metalness
                  child.material.roughness = material.roughness
                  child.material.color.setHex(material.color.replace('#', '0x'))
                  child.material.envMapIntensity = 1.0
                  child.castShadow = true
                  child.receiveShadow = true
                }
              }
            })

            // Center and scale model
            const box = new THREE.Box3().setFromObject(model)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())
            
            model.position.sub(center)
            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = 2.5 / maxDim
            model.scale.multiplyScalar(scale)
            
            scene.add(model)
            
            // Position camera
            camera.position.set(0, 0, 4)
            camera.lookAt(0, 0, 0)
            
            // Store references
            sceneRef.current = scene
            rendererRef.current = renderer
            modelRef.current = model
            controlsRef.current = controls
            
            setIsLoading(false)
            onLoad?.()
          },
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100
            setLoadProgress(percent)
          },
          (error) => {
            if (!isMounted) return
            setHasError(true)
            setErrorMessage(error.message || 'Failed to load 3D model')
            setIsLoading(false)
            onError?.(error)
          }
        )

        // Animation loop
        const animate = () => {
          if (!isMounted) return
          
          animationFrameRef.current = requestAnimationFrame(animate)
          
          if (controls) {
            controls.update()
          }
          
          renderer.render(scene, camera)
        }
        
        animate()

      } catch (error) {
        if (!isMounted) return
        setHasError(true)
        setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize Three.js')
        setIsLoading(false)
        onError?.(error instanceof Error ? error : new Error('Three.js initialization failed'))
      }
    }

    initThreeJS()

    return () => {
      isMounted = false
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [modelPath, material, enableControls, autoRotate, onLoad, onError, onInteractionStart, onInteractionEnd])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const renderer = rendererRef.current
      
      if (canvas && renderer) {
        const { offsetWidth, offsetHeight } = canvas.parentElement || canvas
        renderer.setSize(offsetWidth, offsetHeight)
        
        if (sceneRef.current) {
          const camera = sceneRef.current.children.find((child: any) => child.isCamera)
          if (camera) {
            camera.aspect = offsetWidth / offsetHeight
            camera.updateProjectionMatrix()
          }
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: hasError ? 'none' : 'block' }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <MutedText className="font-medium">Loading Premium 3D Experience</MutedText>
            <div className="w-48 h-2 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <MutedText size="sm" className="text-gray-600">
              {loadProgress < 50 ? 'Initializing WebGL...' : 'Preparing your jewelry...'}
            </MutedText>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center space-y-4 p-6 max-w-md">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-destructive text-xl">⚠</span>
            </div>
            <MutedText className="font-medium text-foreground">
              Premium 3D Mode Unavailable
            </MutedText>
            <MutedText size="sm" className="text-gray-600">
              {errorMessage}
            </MutedText>
            <MutedText size="sm" className="text-accent">
              Falling back to image sequences...
            </MutedText>
          </div>
        </div>
      )}

      {/* Premium Mode Indicator */}
      {!isLoading && !hasError && (
        <div className="absolute top-4 right-4">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-accent/50">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <MutedText size="sm" className="font-medium text-accent">
                Premium 3D
              </MutedText>
              {isInteracting && (
                <MutedText size="sm" className="text-gray-600">Interactive</MutedText>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}