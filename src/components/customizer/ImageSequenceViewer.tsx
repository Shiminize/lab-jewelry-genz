/**
 * ImageSequenceViewer - High-Performance CSS 3D Alternative
 * Uses pre-rendered image sequences for smooth 360° product rotation
 * Follows CLAUDE_RULES design system and accessibility standards
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { MutedText } from '@/components/foundation/Typography'
import type { ImageSequenceData, ViewerInteraction } from '@/types/customizer'

// CVA variants for different viewer sizes and states
const viewerVariants = cva(
  'relative w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background to-muted select-none',
  {
    variants: {
      size: {
        sm: 'h-[200px] sm:h-[250px]',
        md: 'h-[300px] sm:h-[400px] lg:h-[500px]',
        lg: 'h-[400px] sm:h-[500px] lg:h-[600px]'
      },
      state: {
        loading: 'animate-pulse',
        loaded: 'cursor-grab active:cursor-grabbing',
        error: 'border-destructive bg-destructive/5'
      }
    },
    defaultVariants: {
      size: 'md',
      state: 'loaded'
    }
  }
)

const imageVariants = cva(
  'absolute inset-0 w-full h-full object-cover',
  {
    variants: {
      visible: {
        true: 'opacity-100',
        false: 'opacity-0'
      }
    },
    defaultVariants: {
      visible: true
    }
  }
)

interface ImageSequenceViewerProps extends VariantProps<typeof viewerVariants> {
  imagePath: string
  imageCount?: number
  imageFormat?: 'avif' | 'webp' | 'jpg' | 'png'
  preferredFormats?: ('avif' | 'webp' | 'png')[]  // Format priority order
  className?: string
  autoRotate?: boolean
  frameRate?: number
  onLoad?: () => void
  onError?: (error: Error) => void
  onFrameChange?: (frame: number) => void
}

export function ImageSequenceViewer({
  imagePath,
  imageCount = 36,
  imageFormat = 'avif',  // Default to AVIF for best quality
  preferredFormats = ['webp', 'png', 'avif'],  // Safari-friendly format fallback order
  size = 'md',
  className,
  autoRotate = false,
  frameRate = 30,
  onLoad,
  onError,
  onFrameChange
}: ImageSequenceViewerProps) {
  // State management
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string>('')
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set())
  const [isInteracting, setIsInteracting] = useState(false)
  const [detectedFormat, setDetectedFormat] = useState<string>(imageFormat)
  const [isMetadataOnly, setIsMetadataOnly] = useState(false)
  
  // Refs for interaction handling
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startFrame = useRef(0)
  const autoRotateTimer = useRef<NodeJS.Timeout>()

  // Check if path contains only metadata files (JSON)
  const checkForMetadataOnly = async (path: string): Promise<boolean> => {
    // Circuit breaker: Cache results to prevent repeated requests
    const cacheKey = `metadata_check_${path}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached !== null) {
      return cached === 'true'
    }

    let requestCount = 0
    const maxRequests = 3 // Limit to 3 total requests per path
    
    try {
      // Check if actual image files exist (not just JSON metadata)
      // Try to load the first image in the preferred formats
      for (const format of ['avif', 'webp', 'png']) {
        if (requestCount >= maxRequests) break
        
        try {
          requestCount++
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
          
          const imageResponse = await fetch(`${path}/0.${format}`, { 
            method: 'HEAD',
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (imageResponse.ok) {
            // Found an actual image file, not metadata-only
            console.log(`✅ Found ${format} images in: ${path}`)
            sessionStorage.setItem(cacheKey, 'false')
            return false
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.warn(`⏰ Timeout checking ${format} in ${path}`)
          }
          // Continue checking other formats
        }
      }
      
      // Circuit breaker: Don't check JSON if we've already made too many requests
      if (requestCount < maxRequests) {
        requestCount++
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const jsonResponse = await fetch(`${path}/0.json`, { 
          method: 'HEAD',
          signal: controller.signal 
        })
        
        clearTimeout(timeoutId)
        
        if (jsonResponse.ok) {
          console.log(`📋 Detected metadata-only directory (no images found): ${path}`)
          sessionStorage.setItem(cacheKey, 'true')
          return true
        }
      }
    } catch (error) {
      console.warn(`Error checking metadata for ${path}:`, error)
      // Cache negative result to prevent retries
      sessionStorage.setItem(cacheKey, 'false')
    }
    
    // Cache negative result
    sessionStorage.setItem(cacheKey, 'false')
    return false
  }

  // Detect optimal image format and preload images
  useEffect(() => {
    const detectFormatAndPreload = async () => {
      setIsLoading(true)
      setHasError(false)
      setErrorDetails('')
      
      // Circuit breaker: Check cache first to prevent repeated requests
      const cacheKey = `format_detection_${imagePath}`
      const cachedFormat = sessionStorage.getItem(cacheKey)
      
      // First check if this is a metadata-only directory
      const isMetadata = await checkForMetadataOnly(imagePath)
      if (isMetadata) {
        setIsMetadataOnly(true)
        setHasError(true)
        setErrorDetails('Images are being generated. Please check back soon!')
        setIsLoading(false)
        onError?.(new Error('Metadata-only directory - images not yet generated'))
        return
      }
      
      let workingFormat = imageFormat
      let formatFound = false
      let requestCount = 0
      const maxFormatRequests = 3 // Circuit breaker: Limit format detection requests
      
      // Use cached format if available and current
      if (cachedFormat && preferredFormats.includes(cachedFormat)) {
        workingFormat = cachedFormat
        setDetectedFormat(cachedFormat)
        formatFound = true
        console.log(`🚀 Using cached ${cachedFormat.toUpperCase()} format`)
      } else {
        // Test format availability in priority order with circuit breaker
        for (const format of preferredFormats) {
          if (requestCount >= maxFormatRequests) {
            console.warn(`⚠️ Circuit breaker: Max format requests (${maxFormatRequests}) reached for ${imagePath}`)
            break
          }
          
          try {
            requestCount++
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout
            
            const testUrl = `${imagePath}/0.${format}`
            const response = await fetch(testUrl, { 
              method: 'HEAD',
              signal: controller.signal 
            })
            
            clearTimeout(timeoutId)
            
            if (response.ok) {
              workingFormat = format
              setDetectedFormat(format)
              formatFound = true
              // Cache successful format for 5 minutes
              sessionStorage.setItem(cacheKey, format)
              sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString())
              console.log(`✅ Using ${format.toUpperCase()} format for optimal quality`)
              break
            }
          } catch (error) {
            if (error.name === 'AbortError') {
              console.warn(`⏰ Timeout testing ${format} format for ${imagePath}`)
            } else {
              console.log(`❌ ${format.toUpperCase()} not available for ${imagePath}, trying next format`)
            }
          }
        }
      }
      
      if (!formatFound) {
        setHasError(true)
        setErrorDetails('No compatible image format found')
        setIsLoading(false)
        // Cache the failure to prevent immediate retries
        sessionStorage.setItem(`${cacheKey}_failed`, 'true')
        onError?.(new Error('No compatible image format found'))
        return
      }
      
      // Preload images with detected format
      const imagePromises: Promise<void>[] = []
      const loadedSet = new Set<number>()
      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < imageCount; i++) {
        const imageUrl = `${imagePath}/${i}.${workingFormat}`
        
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image()
          
          // Add timeout for image loading to prevent hanging
          const timeoutId = setTimeout(() => {
            errorCount++
            console.warn(`⏰ Timeout loading image: ${imageUrl}`)
            resolve()
          }, 10000) // 10s timeout per image
          
          img.onload = () => {
            clearTimeout(timeoutId)
            loadedSet.add(i)
            successCount++
            setPreloadedImages(new Set(loadedSet))
            resolve()
          }
          img.onerror = () => {
            clearTimeout(timeoutId)
            errorCount++
            console.warn(`Failed to load image: ${imageUrl}`)
            // Don't reject immediately - allow partial loading
            resolve()
          }
          img.src = imageUrl
        })
        
        imagePromises.push(promise)
      }

      try {
        await Promise.allSettled(imagePromises)
        
        // Check if we have enough images loaded (at least 50% success rate)
        const successRate = successCount / imageCount
        if (successRate >= 0.5) {
          setIsLoading(false)
          console.log(`✅ Loaded ${successCount}/${imageCount} images (${Math.round(successRate * 100)}% success rate)`)
          setTimeout(() => {
            onLoad?.()
          }, 0)
        } else {
          setHasError(true)
          setErrorDetails(`Only ${successCount}/${imageCount} images loaded. Please try refreshing.`)
          setIsLoading(false)
          setTimeout(() => {
            onError?.(new Error(`Insufficient images loaded: ${successCount}/${imageCount}`))
          }, 0)
        }
      } catch (error) {
        setHasError(true)
        setErrorDetails('Failed to load image sequence')
        setIsLoading(false)
        setTimeout(() => {
          onError?.(error as Error)
        }, 0)
      }
    }

    detectFormatAndPreload()
  }, [imagePath, imageCount, imageFormat, preferredFormats, onLoad, onError])

  // Auto-rotation functionality
  useEffect(() => {
    if (autoRotate && !isInteracting && !isLoading && !hasError) {
      autoRotateTimer.current = setInterval(() => {
        setCurrentFrame((prev) => {
          const nextFrame = (prev + 1) % imageCount
          onFrameChange?.(nextFrame)
          return nextFrame
        })
      }, 1000 / frameRate)
    } else {
      if (autoRotateTimer.current) {
        clearInterval(autoRotateTimer.current)
        autoRotateTimer.current = undefined
      }
    }

    return () => {
      if (autoRotateTimer.current) {
        clearInterval(autoRotateTimer.current)
      }
    }
  }, [autoRotate, isInteracting, isLoading, hasError, imageCount, frameRate, onFrameChange])

  // Handle drag interactions
  const handleInteractionStart = useCallback((clientX: number) => {
    if (hasError) return
    isDragging.current = true
    startX.current = clientX
    startFrame.current = currentFrame
    setIsInteracting(true)
  }, [currentFrame, hasError])

  const handleInteractionMove = useCallback((clientX: number) => {
    if (!isDragging.current || hasError) return

    const deltaX = clientX - startX.current
    const sensitivity = 2 // Adjust sensitivity (pixels per frame)
    const frameChange = Math.round(deltaX / sensitivity)
    
    // Calculate new frame with wrap-around
    let newFrame = (startFrame.current + frameChange) % imageCount
    if (newFrame < 0) newFrame += imageCount

    if (newFrame !== currentFrame && preloadedImages.has(newFrame)) {
      setCurrentFrame(newFrame)
      onFrameChange?.(newFrame)
    }
  }, [currentFrame, imageCount, onFrameChange, hasError])

  const handleInteractionEnd = useCallback(() => {
    isDragging.current = false
    setIsInteracting(false)
  }, [])

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleInteractionStart(e.clientX)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleInteractionMove(e.clientX)
  }, [handleInteractionMove])

  const handleMouseUp = useCallback(() => {
    handleInteractionEnd()
  }, [handleInteractionEnd])

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleInteractionStart(touch.clientX)
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) handleInteractionMove(touch.clientX)
  }, [handleInteractionMove])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    handleInteractionEnd()
  }, [handleInteractionEnd])

  // Global event listeners for drag continuation
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handleMouseMove(e)
    }
    
    const handleGlobalMouseUp = () => {
      if (isDragging.current) handleMouseUp()
    }

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging.current) handleTouchMove(e)
    }

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (isDragging.current) handleTouchEnd(e)
    }

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false })
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('touchmove', handleGlobalTouchMove)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const currentState = hasError ? 'error' : (isLoading ? 'loading' : 'loaded')
  const currentImageUrl = `${imagePath}/${currentFrame}.${detectedFormat}`

  return (
    <div
      ref={containerRef}
      className={cn(viewerVariants({ size, state: currentState }), className)}
      onMouseDown={!hasError ? handleMouseDown : undefined}
      onTouchStart={!hasError ? handleTouchStart : undefined}
      data-testid="image-sequence-viewer"
      aria-hidden="true"
      onKeyDown={(e) => {
        if (hasError) return
        // Keyboard navigation support
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          const newFrame = currentFrame === 0 ? imageCount - 1 : currentFrame - 1
          if (preloadedImages.has(newFrame)) {
            setCurrentFrame(newFrame)
            onFrameChange?.(newFrame)
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          const newFrame = (currentFrame + 1) % imageCount
          if (preloadedImages.has(newFrame)) {
            setCurrentFrame(newFrame)
            onFrameChange?.(newFrame)
          }
        }
      }}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <MutedText size="sm" className="text-gray-600">Loading your perfect view...</MutedText>
            <div className="w-32 h-2 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${(preloadedImages.size / imageCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error State - Enhanced with specific messaging */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center space-y-4 p-6 max-w-md">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-destructive text-xl" role="img" aria-label="Error">
                {isMetadataOnly ? '🚧' : '⚠'}
              </span>
            </div>
            <div>
              <MutedText className="font-medium mb-2 text-foreground">
                {isMetadataOnly ? 'Coming Soon' : '360° view unavailable'}
              </MutedText>
              <MutedText size="sm" className="text-gray-600">
                {errorDetails || 'Please try refreshing the page'}
              </MutedText>
              {isMetadataOnly && (
                <MutedText size="sm" className="mt-2 text-accent">
                  Our artisans are crafting the perfect view for you
                </MutedText>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Images - All preloaded and hidden except current */}
      {!hasError && (
        <>
          {Array.from({ length: imageCount }, (_, i) => {
            const isCurrentFrame = i === currentFrame
            const isImageLoaded = preloadedImages.has(i)
            const imageUrl = `${imagePath}/${i}.${detectedFormat}`
            
            // Only render loaded images
            if (!isImageLoaded) return null
            
            return (
              <Image
                key={i}
                src={imageUrl}
                alt={`Product view frame ${i + 1}`}
                fill
                className={cn(
                  'object-cover transition-opacity duration-200',
                  isCurrentFrame ? 'opacity-100 z-10' : 'opacity-0 z-0'
                )}
                style={{ display: isCurrentFrame ? 'block' : 'none' }}
                priority={i === currentFrame}
                sizes="(max-width: 768px) 100vw, 600px"
              />
            )
          })}
        </>
      )}

      {/* Controls and Status - Always Visible */}
      {!hasError && (
        <div className="absolute bottom-4 left-4 right-4 opacity-100 transition-opacity duration-300">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <MutedText size="sm" className="font-headline font-medium">
                  Infinite Perspectives • {detectedFormat.toUpperCase()}
                </MutedText>
              </div>
              <div className="flex items-center space-x-2">
                {autoRotate && !isInteracting && (
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                    <MutedText size="sm" className="text-gray-600 font-medium">Auto</MutedText>
                  </div>
                )}
                {isInteracting && (
                  <MutedText size="sm" className="text-accent font-medium">Interactive</MutedText>
                )}
                <MutedText size="sm" className="text-gray-600">
                  {preloadedImages.size}/{imageCount}
                </MutedText>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Touch/Drag hints */}
      {!hasError && (
        <div className="absolute bottom-16 left-4 right-4 lg:hidden">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 border border-border/50">
            <MutedText size="sm" className="text-center text-xs text-gray-600">
              {isLoading ? 'Loading...' : 'Swipe to fall in love'}
            </MutedText>
          </div>
        </div>
      )}

    </div>
  )
}

export type ImageSequenceViewerVariant = VariantProps<typeof viewerVariants>