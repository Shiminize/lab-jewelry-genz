/**
 * Simple Image Viewer - Temporary replacement for ImageSequenceViewer
 * Used to eliminate infinite loop issues while maintaining functionality
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { MutedText } from '@/components/foundation/Typography'

interface SimpleImageViewerProps {
  imagePath: string
  imageCount?: number
  currentFrame?: number
  onFrameChange?: (frame: number) => void
  onLoad?: () => void
  onError?: (error: Error) => void
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export function SimpleImageViewer({
  imagePath,
  imageCount = 36,
  currentFrame = 0,
  onFrameChange,
  onLoad,
  onError,
  className,
  size = 'large'
}: SimpleImageViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  // Simple frame navigation
  const nextFrame = () => {
    const newFrame = (currentFrame + 1) % imageCount
    onFrameChange?.(newFrame)
  }

  const prevFrame = () => {
    const newFrame = currentFrame === 0 ? imageCount - 1 : currentFrame - 1
    onFrameChange?.(newFrame)
  }

  // Handle image load
  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
    // Don't propagate error for missing images in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SimpleImageViewer] Image failed to load, showing placeholder')
    } else {
      onError?.(new Error('Failed to load image'))
    }
  }

  const sizeClasses = {
    small: 'h-[200px]',
    medium: 'h-[300px]',
    large: 'h-[400px] sm:h-[500px] lg:h-[600px]'
  }

  return (
    <div className={cn('relative bg-background border border-border rounded-lg overflow-hidden', sizeClasses[size], className)}>
      {/* Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        {hasError ? (
          <div className="text-center p-4">
            <MutedText>Failed to load 3D preview</MutedText>
            <MutedText size="sm" className="mt-2">
              Images may be generating. Please check back soon.
            </MutedText>
          </div>
        ) : (
          <img
            src={`${imagePath}/${currentFrame}.webp`}
            alt={`3D view frame ${currentFrame}`}
            className="w-full h-full object-contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {/* Loading overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Simple controls */}
      {!hasError && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2">
          <button
            onClick={prevFrame}
            className="w-8 h-8 rounded-full bg-accent/20 hover:bg-accent/30 flex items-center justify-center transition-colors"
            aria-label="Previous frame"
          >
            ←
          </button>
          
          <div className="text-sm text-muted-foreground min-w-[60px] text-center">
            {currentFrame + 1} / {imageCount}
          </div>
          
          <button
            onClick={nextFrame}
            className="w-8 h-8 rounded-full bg-accent/20 hover:bg-accent/30 flex items-center justify-center transition-colors"
            aria-label="Next frame"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}