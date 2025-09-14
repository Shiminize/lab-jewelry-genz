/**
 * HeroBackground Component
 * Aurora Design System - Batch 4 Migration
 * Extracted from HeroSection.tsx for Claude Rules compliance
 * Handles video background, overlays, and Aurora animations
 */

'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { useDesignVersion } from '../../../hooks/useDesignVersion'
import { useHeroVideo } from '../../../hooks/useHeroVideo'
import type { HeroVideoConfig } from '../../../data/heroData'

// Aurora-compliant CVA variants for background container
const backgroundVariants = cva(
  'absolute inset-0 z-0',
  {
    variants: {
      style: {
        aurora: 'bg-aurora-hero animate-aurora-drift shadow-aurora-xl',
        legacy: 'bg-legacy-overlay',
        minimal: 'bg-muted/10'
      }
    },
    defaultVariants: {
      style: 'aurora'
    }
  }
)

const overlayVariants = cva(
  'absolute inset-0 z-30',
  {
    variants: {
      overlay: {
        light: 'bg-background/20',
        medium: 'bg-background/40', 
        dark: 'bg-background/60',
        gradient: 'bg-gradient-to-b from-background/10 via-background/40 to-background/70'
      }
    },
    defaultVariants: {
      overlay: 'gradient'
    }
  }
)

const auroraLayerVariants = cva(
  'absolute inset-0 pointer-events-none transition-opacity duration-token-slow',
  {
    variants: {
      layer: {
        base: 'z-10 bg-aurora-hero animate-aurora-drift romantic-emotional-trigger',
        shimmer: 'z-20 bg-aurora-shimmer animate-aurora-shimmer-slow opacity-60',
        radial: 'z-0 bg-aurora-radial animate-aurora-rotate opacity-30'
      }
    }
  }
)

const loadingOverlayVariants = cva(
  'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-foreground to-foreground/80 backdrop-blur-sm z-30',
  {
    variants: {
      visible: {
        true: 'opacity-100',
        false: 'opacity-0 pointer-events-none'
      }
    },
    defaultVariants: {
      visible: false
    }
  }
)

interface HeroBackgroundProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof backgroundVariants>,
    VariantProps<typeof overlayVariants> {
  /** Video configuration */
  videoConfig?: HeroVideoConfig
  /** Fallback image source URL */
  fallbackImageSrc?: string
  /** Alt text for fallback image */
  fallbackImageAlt?: string
  /** Enable Aurora animations */
  enableAurora?: boolean
  /** Video loading delay in milliseconds */
  loadDelay?: number
  /** Show loading progress indicator */
  showLoadingProgress?: boolean
  /** Custom overlay opacity */
  overlayOpacity?: number
}

export function HeroBackground({
  videoConfig,
  fallbackImageSrc = "/hero_fallback.jpg",
  fallbackImageAlt = "Elegant jewelry collection showcasing lab-grown diamonds and moissanite pieces",
  enableAurora = true,
  loadDelay = 1500,
  showLoadingProgress = true,
  overlayOpacity,
  style,
  overlay,
  className,
  ...props
}: HeroBackgroundProps) {
  const { getClassName } = useDesignVersion({ componentName: 'hero' })
  const intersectionRef = useRef<HTMLDivElement>(null)
  
  // Use the extracted video hook
  const {
    videoRef,
    videoLoaded,
    videoError,
    loadingProgress,
    shouldLoadVideo,
    prefersReducedMotion
  } = useHeroVideo({
    videoConfig,
    loadDelay,
    respectReducedMotion: true
  })

  return (
    <div 
      ref={intersectionRef} 
      className={cn(backgroundVariants({ style }), className)}
      {...props}
    >
      {/* Aurora Enhanced Background Layers */}
      {enableAurora && (
        <>
          {/* Aurora Background: Deep Space to Nebula Purple - Premium Psychology */}
          <div 
            className={cn(
              auroraLayerVariants({ layer: 'base' }),
              'bg-aurora-hero animate-aurora-drift shadow-aurora-lg',
              'romantic-emotional-trigger'
            )}
            style={{
              opacity: overlayOpacity !== undefined 
                ? overlayOpacity 
                : videoLoaded ? 0.3 : 0.7
            }}
          />
          
          {/* Aurora Shimmer: Iridescent Overlay - Gemstone Light Psychology */}
          <div 
            className={cn(
              auroraLayerVariants({ layer: 'shimmer' }),
              'bg-aurora-shimmer animate-aurora-shimmer-slow shadow-aurora-sm'
            )}
          />
          
          {/* Aurora Radial: Rotating Background Effect - Luxury Depth */}
          <div 
            className={cn(
              auroraLayerVariants({ layer: 'radial' }),
              'bg-aurora-radial animate-aurora-rotate shadow-aurora-float'
            )}
          />
        </>
      )}

      {/* Video Background */}
      {!videoError && shouldLoadVideo && videoConfig?.src && (
        <>
          <video
            ref={videoRef}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-token-slow",
              !videoLoaded && "opacity-0"
            )}
            autoPlay={!prefersReducedMotion}
            muted
            loop
            playsInline
            preload="none"
          >
            <source src={videoConfig.src} type={videoConfig.type || "video/mp4"} />
            Your browser does not support the video tag.
          </video>
          
          {/* Aurora Enhanced Loading Progress */}
          {showLoadingProgress && !videoLoaded && loadingProgress > 0 && loadingProgress < 100 && (
            <div className={cn(loadingOverlayVariants({ visible: true }))}>
              <div className="flex flex-col items-center space-y-token-lg">
                {/* Aurora Loading Spinner */}
                <div className="w-32 h-32 border-4 border-transparent bg-gradient-to-r from-accent to-aurora-nav-muted rounded-full p-token-xs">
                  <div className="w-full h-full bg-foreground rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-accent to-aurora-nav-muted rounded-full animate-pulse" />
                  </div>
                </div>
                
                {/* Loading Text */}
                <div className="text-white font-body text-xl text-center">
                  Preparing Aurora Experience... {loadingProgress.toFixed(0)}%
                </div>
                
                {/* Progress Bar */}
                <div className="w-64 h-3 bg-background/10 rounded-full overflow-hidden border border-high-contrast/20">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-aurora-nav-muted transition-all duration-300" 
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Enhanced Fallback Image with Aurora Overlay */}
      {(videoError || !videoLoaded || !shouldLoadVideo) && (
        <>
          <Image
            src={fallbackImageSrc}
            alt={fallbackImageAlt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onLoad={() => {}}
            onError={() => console.error('❌ Hero fallback image failed to load')}
          />
          {/* Aurora Enhanced Fallback Overlay */}
          <div className="absolute inset-0 z-10 bg-aurora-hero opacity-70" />
        </>
      )}
      
      {/* Text Readability Overlay */}
      <div 
        className={cn(overlayVariants({ overlay }))}
        aria-hidden="true"
      />

      {/* Aurora Enhanced Error Notification */}
      {videoError && (
        <div className="absolute top-token-md right-token-md z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-token-lg py-token-sm rounded-token-xl text-sm backdrop-blur-sm">
          <div className="flex items-center space-x-token-sm">
            <div className="w-2 h-2 bg-high-contrast rounded-full" />
            <span>Video unavailable. Aurora experience continues with fallback.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export type HeroBackgroundVariant = VariantProps<typeof backgroundVariants>
export type HeroOverlayVariant = VariantProps<typeof overlayVariants>
export type AuroraLayerVariant = VariantProps<typeof auroraLayerVariants>