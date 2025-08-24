/**
 * ImageViewer - Simple 3D Image Sequence Display
 * Single responsibility: Display image sequences with frame navigation
 * CLAUDE_RULES.md compliant with stable useEffect dependencies
 */

'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { ImageViewerProps } from './types'

export const ImageViewer: React.FC<ImageViewerProps> = ({
  assetPath,
  currentFrame,
  totalFrames,
  onFrameChange,
  isLoading,
  error,
  className,
  showFrameIndicator = false, // Hardcoded false for minimalist design
  enableTouchGestures = true,
  touchFeedback = 'subtle',
  onGestureStart,
  onGestureEnd,
  autoRotate = true // Default to auto-rotate for minimalist experience
}) => {
  const [imageLoadStates, setImageLoadStates] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({})
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null)
  
  // Touch gesture refs
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const [isGesturing, setIsGesturing] = useState<boolean>(false)
  
  // Auto-rotate state
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(autoRotate)
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Memoized image path generation - CLAUDE_RULES: <100ms performance
  const imagePath = useMemo(() => {
    if (!assetPath) return null
    return `${assetPath}/${currentFrame}.webp`
  }, [assetPath, currentFrame])

  // Update current image source when path changes
  useEffect(() => {
    if (imagePath) {
      setCurrentImageSrc(imagePath)
    }
  }, [imagePath])

  // Handle image load success
  const handleImageLoad = (frame: number) => {
    setImageLoadStates(prev => ({
      ...prev,
      [frame]: 'loaded'
    }))
  }

  // Handle image load error with fallback
  const handleImageError = (frame: number) => {
    setImageLoadStates(prev => ({
      ...prev,
      [frame]: 'error'
    }))
  }

  // Preload adjacent frames for smooth navigation
  useEffect(() => {
    const preloadFrames = () => {
      const framesToPreload = [
        Math.max(0, currentFrame - 1),
        Math.min(totalFrames - 1, currentFrame + 1)
      ]

      framesToPreload.forEach(frameIndex => {
        if (imageLoadStates[frameIndex] !== 'loaded' && imageLoadStates[frameIndex] !== 'loading') {
          const img = new Image()
          const framePath = `${assetPath}/${frameIndex}.webp`
          
          setImageLoadStates(prev => ({
            ...prev,
            [frameIndex]: 'loading'
          }))

          img.onload = () => handleImageLoad(frameIndex)
          img.onerror = () => handleImageError(frameIndex)
          img.src = framePath
        }
      })
    }

    if (assetPath && totalFrames > 0) {
      preloadFrames()
    }
  }, [assetPath, currentFrame, totalFrames, imageLoadStates])

  // Auto-rotate functionality for minimalist experience
  useEffect(() => {
    const startAutoRotate = () => {
      if (!isAutoRotating || totalFrames <= 1) return
      
      autoRotateRef.current = setInterval(() => {
        onFrameChange((currentFrame + 1) % totalFrames)
      }, 100) // ~10fps for smooth rotation
    }

    const stopAutoRotate = () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current)
        autoRotateRef.current = null
      }
    }

    if (isAutoRotating && !isGesturing) {
      startAutoRotate()
    } else {
      stopAutoRotate()
    }

    return stopAutoRotate
  }, [isAutoRotating, isGesturing, currentFrame, totalFrames, onFrameChange])

  // Pause auto-rotate on interaction, resume after delay
  const pauseAutoRotate = () => {
    setIsAutoRotating(false)
    
    // Clear any existing resume timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
    }
    
    // Resume after 2 seconds of inactivity
    pauseTimeoutRef.current = setTimeout(() => {
      if (autoRotate) {
        setIsAutoRotating(true)
      }
    }, 2000)
  }

  // Loading state - minimalist design
  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-center aspect-square bg-background rounded-lg",
        className
      )}>
        <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  // Error state - minimalist design
  if (error || !currentImageSrc) {
    return (
      <div className={cn(
        "flex items-center justify-center aspect-square bg-background rounded-lg",
        className
      )}>
        <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
          <div className="text-2xl opacity-40">💎</div>
        </div>
      </div>
    )
  }

  // Current frame loading state
  const currentFrameState = imageLoadStates[currentFrame]
  const isCurrentFrameLoading = currentFrameState === 'loading' || !currentFrameState

  // Touch/Mouse handlers for rotation
  const handleStart = (clientX: number) => {
    if (!enableTouchGestures) return
    touchStartX.current = clientX
    isDragging.current = true
    setIsGesturing(true)
    pauseAutoRotate() // Pause auto-rotation on interaction
    onGestureStart?.()
  }

  const handleMove = (clientX: number) => {
    if (!isDragging.current) return
    
    const deltaX = clientX - touchStartX.current
    const sensitivity = 5 // Pixels per frame
    
    if (Math.abs(deltaX) > sensitivity) {
      const frameDelta = Math.floor(deltaX / sensitivity)
      const newFrame = (currentFrame - frameDelta + totalFrames) % totalFrames
      onFrameChange(newFrame)
      touchStartX.current = clientX
    }
  }

  const handleEnd = () => {
    if (!enableTouchGestures) return
    isDragging.current = false
    setIsGesturing(false)
    onGestureEnd?.()
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  const handleMouseLeave = () => {
    handleEnd()
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative aspect-square bg-white rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all duration-200",
        isGesturing && touchFeedback === 'subtle' && "shadow-sm",
        isGesturing && touchFeedback === 'prominent' && "shadow-md",
        className
      )}
      role="img"
      aria-label={`Interactive 360° jewelry view, frame ${currentFrame + 1} of ${totalFrames}`}
      onTouchStart={enableTouchGestures ? handleTouchStart : undefined}
      onTouchMove={enableTouchGestures ? handleTouchMove : undefined}
      onTouchEnd={enableTouchGestures ? handleTouchEnd : undefined}
      onMouseDown={enableTouchGestures ? handleMouseDown : undefined}
      onMouseMove={enableTouchGestures ? handleMouseMove : undefined}
      onMouseUp={enableTouchGestures ? handleMouseUp : undefined}
      onMouseLeave={enableTouchGestures ? handleMouseLeave : undefined}
      style={{ touchAction: enableTouchGestures ? 'none' : 'auto' }}
    >
      {/* Main image display */}
      <div className="relative w-full h-full">
        {currentImageSrc && (
          <img
            src={currentImageSrc}
            alt={`3D jewelry view frame ${currentFrame + 1}`}
            className={cn(
              "w-full h-full object-contain transition-opacity duration-200",
              isCurrentFrameLoading ? "opacity-50" : "opacity-100"
            )}
            onLoad={() => handleImageLoad(currentFrame)}
            onError={() => handleImageError(currentFrame)}
          />
        )}

        {/* Minimal loading overlay */}
        {isCurrentFrameLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        )}

        {/* Frame counter removed for minimalist design */}
      </div>

      {/* WCAG 2.1 AA - Screen reader support */}
      <div className="sr-only" aria-live="polite">
        Viewing frame {currentFrame + 1} of {totalFrames} in 360-degree jewelry view
      </div>
    </div>
  )
}

export default ImageViewer