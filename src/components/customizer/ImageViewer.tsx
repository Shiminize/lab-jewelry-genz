/**
 * ImageViewer - Simple 3D Image Sequence Display
 * Single responsibility: Display image sequences with frame navigation
 * CLAUDE_RULES.md compliant with stable useEffect dependencies
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { ImageViewerProps } from './types'

export const ImageViewer: React.FC<ImageViewerProps> = ({
  assetPath,
  currentFrame,
  totalFrames,
  onFrameChange,
  isLoading,
  error,
  className
}) => {
  const [imageLoadStates, setImageLoadStates] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({})
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null)

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

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-center aspect-square bg-background/50 rounded-lg border border-border",
        className
      )}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm text-muted-foreground">Loading 3D viewer...</div>
        </div>
      </div>
    )
  }

  // Error state with fallback
  if (error || !currentImageSrc) {
    return (
      <div className={cn(
        "flex items-center justify-center aspect-square bg-background/50 rounded-lg border border-border",
        className
      )}>
        <div className="text-center space-y-2 p-4">
          <div className="text-sm font-medium text-foreground">Unable to load 3D view</div>
          <div className="text-xs text-muted-foreground">
            {error || 'Image assets unavailable'}
          </div>
          <div className="w-16 h-16 bg-muted/20 rounded mx-auto flex items-center justify-center">
            <div className="text-2xl">💎</div>
          </div>
        </div>
      </div>
    )
  }

  // Current frame loading state
  const currentFrameState = imageLoadStates[currentFrame]
  const isCurrentFrameLoading = currentFrameState === 'loading' || !currentFrameState

  return (
    <div 
      className={cn(
        "relative aspect-square bg-background rounded-lg overflow-hidden border border-border",
        className
      )}
      role="img"
      aria-label={`Interactive 360° jewelry view, frame ${currentFrame + 1} of ${totalFrames}`}
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

        {/* Loading overlay for current frame */}
        {isCurrentFrameLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Frame counter - CLAUDE_RULES: Accessibility support */}
        <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-foreground">
          {currentFrame + 1} / {totalFrames}
        </div>
      </div>

      {/* WCAG 2.1 AA - Screen reader support */}
      <div className="sr-only" aria-live="polite">
        Viewing frame {currentFrame + 1} of {totalFrames} in 360-degree jewelry view
      </div>
    </div>
  )
}

export default ImageViewer