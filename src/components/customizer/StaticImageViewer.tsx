/**
 * StaticImageViewer - Temporary Placeholder Component
 * WCAG 2.1 AA compliant static image viewer with proper accessibility
 * Mobile-first responsive design using CLAUDE_RULES design tokens
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { MutedText } from '@/components/foundation/Typography'

// CVA variants for different viewer states and sizes
const viewerVariants = cva(
  'relative w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background to-muted',
  {
    variants: {
      size: {
        sm: 'h-[200px] sm:h-[250px]',
        md: 'h-[300px] sm:h-[400px] lg:h-[500px]',
        lg: 'h-[400px] sm:h-[500px] lg:h-[600px]'
      },
      state: {
        loading: 'animate-pulse',
        loaded: '',
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
  'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
  {
    variants: {
      loaded: {
        true: 'opacity-100',
        false: 'opacity-0'
      }
    },
    defaultVariants: {
      loaded: true
    }
  }
)

interface StaticImageViewerProps extends VariantProps<typeof viewerVariants> {
  imageUrl?: string
  alt: string
  className?: string
  onImageLoad?: () => void
  onImageError?: (error: Error) => void
}

export function StaticImageViewer({
  imageUrl = '/images/jewelry-placeholder.webp',
  alt,
  size = 'md',
  state = 'loaded',
  className,
  onImageLoad,
  onImageError
}: StaticImageViewerProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const handleImageLoad = () => {
    setIsLoaded(true)
    onImageLoad?.()
  }

  const handleImageError = () => {
    const error = new Error(`Failed to load image: ${imageUrl}`)
    setHasError(true)
    setIsLoaded(false)
    onImageError?.(error)
  }

  const currentState = hasError ? 'error' : (isLoaded ? 'loaded' : 'loading')

  return (
    <div 
      className={cn(viewerVariants({ size, state: currentState }), className)}
      role="img"
      aria-label={alt}
    >
      {/* Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <MutedText size="sm">Loading preview...</MutedText>
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
              <MutedText className="font-medium mb-2 text-foreground">Unable to load preview</MutedText>
              <MutedText size="sm">Please try refreshing the page</MutedText>
            </div>
          </div>
        </div>
      )}

      {/* Main Image */}
      <img
        src={imageUrl}
        alt={alt}
        className={cn(imageVariants({ loaded: isLoaded && !hasError }))}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        decoding="async"
      />

      {/* Placeholder Indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <MutedText size="sm">Static Preview</MutedText>
            </div>
            <MutedText size="xs" className="text-gray-600">
              Interactive viewer loading...
            </MutedText>
          </div>
        </div>
      </div>

      {/* Accessibility Enhancement */}
      <div className="sr-only">
        <p>
          Static jewelry preview image. Interactive 3D viewer will be available shortly.
          {hasError && ' Image failed to load, please refresh the page.'}
        </p>
      </div>
    </div>
  )
}

export type StaticImageViewerVariant = VariantProps<typeof viewerVariants>