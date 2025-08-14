/**
 * ImageSequenceViewer - High-Performance CSS 3D Alternative
 * Uses pre-rendered image sequences for smooth 360° product rotation
 * Follows CLAUDE_RULES design system and accessibility standards
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  'absolute inset-0 w-full h-full object-cover transition-opacity duration-150',
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
  imageFormat?: 'webp' | 'jpg' | 'png'
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
  imageFormat = 'png',
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
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set())
  const [isInteracting, setIsInteracting] = useState(false)
  
  // Refs for interaction handling
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startFrame = useRef(0)
  const autoRotateTimer = useRef<NodeJS.Timeout>()

  // Preload images for smooth interaction
  useEffect(() => {
    const preloadImages = async () => {
      setIsLoading(true)
      const imagePromises: Promise<void>[] = []
      const loadedSet = new Set<number>()

      for (let i = 0; i < imageCount; i++) {
        const imageUrl = `${imagePath}/${i}.${imageFormat}`
        
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            loadedSet.add(i)
            setPreloadedImages(new Set(loadedSet))
            resolve()
          }
          img.onerror = () => {
            console.warn(`Failed to load image: ${imageUrl}`)
            reject(new Error(`Failed to load image: ${imageUrl}`))
          }
          img.src = imageUrl
        })
        
        imagePromises.push(promise)
      }

      try {
        await Promise.allSettled(imagePromises)
        setIsLoading(false)
        // Defer onLoad call
        setTimeout(() => {
          onLoad?.()
        }, 0)
      } catch (error) {
        setHasError(true)
        setIsLoading(false)
        // Defer onError call
        setTimeout(() => {
          onError?.(error as Error)
        }, 0)
      }
    }

    preloadImages()
  }, [imagePath, imageCount, imageFormat, onLoad, onError])

  // Auto-rotation functionality
  useEffect(() => {
    if (autoRotate && !isInteracting && !isLoading) {
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
  }, [autoRotate, isInteracting, isLoading, imageCount, frameRate, onFrameChange])

  // Handle drag interactions
  const handleInteractionStart = useCallback((clientX: number) => {
    isDragging.current = true
    startX.current = clientX
    startFrame.current = currentFrame
    setIsInteracting(true)
  }, [currentFrame])

  const handleInteractionMove = useCallback((clientX: number) => {
    if (!isDragging.current) return

    const deltaX = clientX - startX.current
    const sensitivity = 2 // Adjust sensitivity (pixels per frame)
    const frameChange = Math.round(deltaX / sensitivity)
    
    // Calculate new frame with wrap-around
    let newFrame = (startFrame.current + frameChange) % imageCount
    if (newFrame < 0) newFrame += imageCount

    if (newFrame !== currentFrame) {
      setCurrentFrame(newFrame)
      onFrameChange?.(newFrame)
    }
  }, [currentFrame, imageCount, onFrameChange])

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
  const currentImageUrl = `${imagePath}/${currentFrame}.${imageFormat}`

  return (
    <div
      ref={containerRef}
      className={cn(viewerVariants({ size, state: currentState }), className)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="img"
      aria-label={`Interactive 360° product view - frame ${currentFrame + 1} of ${imageCount}`}
      tabIndex={0}
      onKeyDown={(e) => {
        // Keyboard navigation support
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          const newFrame = currentFrame === 0 ? imageCount - 1 : currentFrame - 1
          setCurrentFrame(newFrame)
          onFrameChange?.(newFrame)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          const newFrame = (currentFrame + 1) % imageCount
          setCurrentFrame(newFrame)
          onFrameChange?.(newFrame)
        }
      }}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <MutedText size="sm">Loading 360° view...</MutedText>
            <div className="w-32 h-2 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${(preloadedImages.size / imageCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center space-y-4 p-6">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-destructive text-xl" role="img" aria-label="Error">⚠</span>
            </div>
            <div>
              <MutedText className="font-medium mb-2 text-foreground">360° view unavailable</MutedText>
              <MutedText size="sm">Please try refreshing the page</MutedText>
            </div>
          </div>
        </div>
      )}

      {/* Main Image */}
      {!hasError && (
        <img
          src={currentImageUrl}
          alt={`Product view frame ${currentFrame + 1}`}
          className={cn(imageVariants({ visible: !isLoading }))}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Controls and Status */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <MutedText size="sm">360° Interactive</MutedText>
            </div>
            <div className="flex items-center space-x-2">
              <MutedText size="xs" className="text-muted">
                {currentFrame + 1}/{imageCount}
              </MutedText>
              {autoRotate && !isInteracting && (
                <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Touch/Drag hints */}
      <div className="absolute bottom-16 left-4 right-4 lg:hidden">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2">
          <MutedText size="sm" className="text-center text-xs">
            {isLoading ? 'Loading...' : 'Drag to rotate • Tap ← → keys'}
          </MutedText>
        </div>
      </div>

      {/* Accessibility Enhancement */}
      <div className="sr-only">
        <p>
          Interactive 360-degree product viewer. Use left and right arrow keys or drag to rotate the view.
          Currently showing frame {currentFrame + 1} of {imageCount}.
          {hasError && ' Image sequence failed to load, please refresh the page.'}
        </p>
      </div>
    </div>
  )
}

export type ImageSequenceViewerVariant = VariantProps<typeof viewerVariants>