'use client'

import React, { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { H1, H2, BodyText, MutedText } from '@/components/foundation/Typography'
import { HybridCustomizer } from './HybridCustomizer'
import type { ProductBase, CustomizationOptions } from '@/types/customizer'
import type { ProductCustomization } from '@/lib/schemas/product-customization'

interface CustomizerContainerProps {
  product: ProductBase
  productCustomization?: ProductCustomization
  onCustomizationChange?: (updates: Partial<CustomizationOptions>) => void
  className?: string
}

export function CustomizerContainer({
  product,
  productCustomization,
  onCustomizationChange,
  className
}: CustomizerContainerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)

  const handleModelLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleModelError = (error: Error) => {
    setIsLoading(false)
    setError(error.message)
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const LoadingSkeleton = () => (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-muted border-t-accent rounded-full animate-spin mb-4" />
      <H2 className="text-foreground mb-2">Crafting your vision...</H2>
      <BodyText className="text-foreground text-center max-w-xs">
        Loading your 3D preview. This may take a moment.
      </BodyText>
    </div>
  )

  const ErrorState = () => (
    <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <H2 className="text-foreground mb-2">Oops! Something went wrong</H2>
      <BodyText className="text-foreground text-center max-w-sm mb-4">
        Design couldn't load. Let's try again to continue your customization.
      </BodyText>
      <button
        onClick={() => {
          setError(null)
          setIsLoading(true)
        }}
        className="px-4 py-2 bg-cta text-background rounded-md hover:bg-cta-hover transition-colors"
      >
        Try Again
      </button>
    </div>
  )

  const MobileGestureInstructions = () => (
    <div className="absolute top-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg md:hidden animate-fade-in">
      <MutedText size="sm" className="text-center">
        Swipe to explore, tap to personalize
      </MutedText>
    </div>
  )

  const ViewerControls = () => (
    <div className="absolute bottom-4 right-4 flex space-x-2">
      <button
        onClick={handleFullscreen}
        className="w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Toggle fullscreen"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
      <button
        className="w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Reset view"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  )

  return (
    <div className={cn(
      'relative bg-gradient-to-br from-background via-muted/30 to-background',
      'border border-border rounded-xl overflow-hidden shadow-lg',
      'aspect-square md:aspect-video max-w-4xl mx-auto',
      className
    )}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <H1 className="text-lg md:text-xl font-headline">
              {product.name}
            </H1>
            <MutedText size="sm">
              {product.category} • Premium Collection
            </MutedText>
          </div>
          <div className="text-right">
            <BodyText className="text-lg font-semibold text-foreground">
              ${product.basePrice.toLocaleString()}
            </BodyText>
            {product.originalPrice && (
              <MutedText size="sm" className="line-through">
                ${product.originalPrice.toLocaleString()}
              </MutedText>
            )}
          </div>
        </div>
      </div>

      {/* 3D Viewer Area */}
      <div 
        ref={viewerRef}
        className={cn(
          'w-full h-full pt-20 pb-16',
          'flex items-center justify-center',
          'bg-gradient-to-b from-transparent to-muted/20'
        )}
        role="img"
        aria-label={`3D preview of ${product.name}`}
      >
        {/* Hybrid 3D Customizer */}
        <HybridCustomizer 
          product={product}
          productCustomization={productCustomization}
          modelPath={productCustomization?.product.modelPath || "/Ringmodel.glb"}
          className="w-full h-full"
          onModelLoad={handleModelLoad}
          onError={handleModelError}
          onCustomizationChange={onCustomizationChange}
        />
        
        {/* Mobile gesture instructions */}
        {!isLoading && !error && <MobileGestureInstructions />}
        
        {/* Viewer controls */}
        {!isLoading && !error && <ViewerControls />}

        {/* Loading state */}
        {isLoading && <LoadingSkeleton />}
        
        {/* Error state */}
        {error && <ErrorState />}
      </div>

      {/* Mobile rotation hint */}
      <div className="absolute bottom-4 left-4 md:hidden">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
          <MutedText size="sm" className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Pinch to zoom, tap to select</span>
          </MutedText>
        </div>
      </div>
    </div>
  )
}