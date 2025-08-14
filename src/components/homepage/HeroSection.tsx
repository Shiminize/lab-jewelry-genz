'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const heroVariants = cva(
  'relative min-h-screen flex items-center justify-center overflow-hidden',
  {
    variants: {
      overlay: {
        light: 'before:bg-background/20',
        medium: 'before:bg-background/40', 
        dark: 'before:bg-background/60',
        gradient: 'before:bg-gradient-to-b before:from-background/10 before:via-background/40 before:to-background/70'
      },
      textPosition: {
        center: 'text-center',
        left: 'text-left',
        right: 'text-right'
      }
    },
    defaultVariants: {
      overlay: 'gradient',
      textPosition: 'center'
    }
  }
)

const contentVariants = cva(
  'relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      spacing: {
        comfortable: 'py-16 sm:py-20 lg:py-24',
        compact: 'py-12 sm:py-16 lg:py-20',
        spacious: 'py-20 sm:py-24 lg:py-32'
      }
    },
    defaultVariants: {
      spacing: 'comfortable'
    }
  }
)

interface HeroSectionProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof heroVariants>,
    VariantProps<typeof contentVariants> {
  /** Main headline text */
  headline?: string
  /** Sub-headline text */
  subHeadline?: string
  /** Primary CTA button text */
  primaryCtaText?: string
  /** Primary CTA button action */
  onPrimaryCtaClick?: () => void
  /** Secondary CTA button text */
  secondaryCtaText?: string
  /** Secondary CTA button action */
  onSecondaryCtaClick?: () => void
  /** Video source URL */
  videoSrc?: string
  /** Fallback image source URL */
  fallbackImageSrc?: string
  /** Alt text for fallback image */
  fallbackImageAlt?: string
  /** Enable reduced motion support */
  respectReducedMotion?: boolean
}

export function HeroSection({
  className,
  overlay,
  textPosition,
  spacing,
  headline = "Your Story, Our Sparkle. Jewelry That's Authentically You.",
  subHeadline = "Conflict-free, brilliantly crafted lab gems, Moissanite, and diamonds for every style and milestone. Because true luxury is a clear conscience.",
  primaryCtaText = "Find Your Signature Piece",
  onPrimaryCtaClick,
  secondaryCtaText = "Start Your Design Journey", 
  onSecondaryCtaClick,
  videoSrc = "/hero_section_video.mp4",
  fallbackImageSrc = "/hero_fallback.jpg",
  fallbackImageAlt = "Elegant jewelry collection showcasing lab-grown diamonds and moissanite pieces",
  respectReducedMotion = true,
  ...props
}: HeroSectionProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Check for reduced motion preference
  useEffect(() => {
    if (respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)
      
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [respectReducedMotion])

  // Handle video loading and error states
  const handleVideoLoad = () => {
    setVideoLoaded(true)
    setVideoError(false)
  }

  const handleVideoError = () => {
    setVideoError(true)
    setVideoLoaded(false)
  }

  // Auto-play video when loaded (respecting user preferences)
  useEffect(() => {
    if (videoRef.current && videoLoaded && !prefersReducedMotion) {
      videoRef.current.play().catch(() => {
        // Auto-play failed, but this is expected in many browsers
        // The video will still be available for user interaction
      })
    }
  }, [videoLoaded, prefersReducedMotion])

  const handlePrimaryCta = () => {
    onPrimaryCtaClick?.()
    // Add analytics tracking here if needed
  }

  const handleSecondaryCta = () => {
    onSecondaryCtaClick?.()
    // Add analytics tracking here if needed
  }

  return (
    <section
      className={cn(heroVariants({ overlay, textPosition }), className)}
      aria-label="Hero section showcasing GlowGlitch jewelry collection"
      {...props}
    >
      {/* Video Background with Overlay */}
      <div className="absolute inset-0 z-0">
        {!videoError && (
          <video
            ref={videoRef}
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              !videoLoaded && "opacity-0"
            )}
            autoPlay={!prefersReducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            aria-hidden="true"
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        
        {/* Fallback Image */}
        {(videoError || !videoLoaded) && (
          <img
            src={fallbackImageSrc}
            alt={fallbackImageAlt}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        )}
        
        {/* Overlay for text readability */}
        <div 
          className={cn(
            "absolute inset-0 z-10",
            overlay === 'light' && "bg-background/20",
            overlay === 'medium' && "bg-background/40", 
            overlay === 'dark' && "bg-background/60",
            overlay === 'gradient' && "bg-gradient-to-b from-background/10 via-background/40 to-background/70"
          )}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className={cn(contentVariants({ spacing }))}>
        <div className="space-y-8 sm:space-y-10">
          {/* Main Headline */}
          <h1 className={cn(
            "font-headline text-foreground font-bold leading-tight",
            "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl",
            "max-w-4xl",
            textPosition === 'center' && "mx-auto",
            textPosition === 'right' && "ml-auto"
          )}>
            {headline}
          </h1>

          {/* Sub-headline */}
          <p className={cn(
            "font-body text-foreground text-lg sm:text-xl lg:text-2xl leading-relaxed",
            "max-w-3xl",
            textPosition === 'center' && "mx-auto",
            textPosition === 'right' && "ml-auto"
          )}>
            {subHeadline}
          </p>

          {/* CTA Buttons */}
          <div className={cn(
            "flex flex-col sm:flex-row gap-4 sm:gap-6",
            textPosition === 'center' && "justify-center",
            textPosition === 'right' && "justify-end"
          )}>
            <Button
              variant="primary"
              size="lg"
              onClick={handlePrimaryCta}
              className="min-w-44 touch-manipulation"
              aria-label={`${primaryCtaText} - Browse our jewelry collection`}
            >
              {primaryCtaText}
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={handleSecondaryCta}
              className="min-w-44 touch-manipulation"
              aria-label={`${secondaryCtaText} - Begin custom jewelry design process`}
            >
              {secondaryCtaText}
            </Button>
          </div>
        </div>

        {/* Accessibility Enhancement: Screen Reader Context */}
        <div className="sr-only">
          <p>
            Welcome to GlowGlitch, where we create authentic jewelry with conflict-free lab-grown gems, 
            Moissanite, and diamonds. Our collection is designed for Gen Z and Young Millennials who 
            value ethical luxury and personal expression.
          </p>
        </div>
      </div>

      {/* Video Loading Indicator */}
      {!videoLoaded && !videoError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/10">
          <div 
            className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Loading hero video"
          />
        </div>
      )}
    </section>
  )
}

export type HeroSectionVariant = VariantProps<typeof heroVariants>
export type HeroContentVariant = VariantProps<typeof contentVariants>