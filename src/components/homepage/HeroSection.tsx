'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useDesignVersion, useABTest } from '@/hooks/useDesignVersion'
import { migrateClassName, getEmotionalClassName } from '@/utils/classNameMigration'

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
  'relative z-20 max-w-6xl mx-auto px-token-md sm:px-token-lg lg:px-token-xl',
  {
    variants: {
      spacing: {
        comfortable: 'py-token-2xl sm:py-token-3xl lg:py-token-2xl',
        compact: 'py-token-xl sm:py-token-2xl lg:py-token-3xl',
        spacious: 'py-token-3xl sm:py-token-2xl lg:py-token-3xl'
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
  primaryCtaText = "Start Designing",
  onPrimaryCtaClick,
  secondaryCtaText = "Explore Collection", 
  onSecondaryCtaClick,
  videoSrc = "", // No video by default to avoid console errors
  fallbackImageSrc = "/hero_fallback.jpg",
  fallbackImageAlt = "Elegant jewelry collection showcasing lab-grown diamonds and moissanite pieces",
  respectReducedMotion = true,
  ...props
}: HeroSectionProps) {
  // Aurora Design System integration with A/B Testing
  const { designVersion, getClassName } = useDesignVersion({ componentName: 'hero' })
  const { version, isAurora, isABTestActive, trackInteraction, trackConversion } = useABTest('HeroSection')
  
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const intersectionRef = useRef<HTMLDivElement>(null)

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

  // Delayed video loading for performance
  useEffect(() => {
    // Use a timer-based approach instead of intersection observer for above-the-fold hero
    const timer = setTimeout(() => {
      console.log('🎬 Starting deferred video load after page stabilization')
      setShouldLoadVideo(true)
    }, 1500) // Load video 1.5s after page load

    return () => clearTimeout(timer)
  }, [])

  // Enhanced video loading and error handling
  const handleVideoLoad = () => {
    console.log('✅ Hero video loaded successfully')
    setVideoLoaded(true)
    setVideoError(false)
    setLoadingProgress(100)
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget
    const error = video.error
    
    console.error('❌ Hero video loading failed:', {
      error: error?.message || 'Unknown error',
      code: error?.code,
      networkState: video.networkState,
      readyState: video.readyState,
      src: videoSrc,
      currentSrc: video.currentSrc
    })
    
    setVideoError(true)
    setVideoLoaded(false)
    setLoadingProgress(0)
  }

  const handleVideoProgress = () => {
    if (videoRef.current) {
      const video = videoRef.current
      if (video.duration > 0) {
        const progress = (video.buffered.length > 0 ? video.buffered.end(0) / video.duration : 0) * 100
        setLoadingProgress(progress)
        console.log(`📊 Video loading progress: ${progress.toFixed(1)}%`)
      }
    }
  }

  const handleVideoLoadStart = () => {
    console.log('🎬 Hero video loading started:', videoSrc)
    setLoadingProgress(5)
  }

  const handleVideoCanPlay = () => {
    console.log('▶️ Hero video can start playing')
    setLoadingProgress(90)
  }

  // Auto-play video when loaded (respecting user preferences)
  useEffect(() => {
    if (videoRef.current && videoLoaded && !prefersReducedMotion) {
      videoRef.current.play().catch((playError) => {
        console.warn('⚠️ Auto-play failed (expected behavior):', playError.message)
        // Auto-play failed, but this is expected in many browsers
        // The video will still be available for user interaction
      })
    }
  }, [videoLoaded, prefersReducedMotion])

  const handlePrimaryCta = () => {
    // Track A/B test interaction
    trackInteraction({ 
      action: 'primary_cta_click', 
      ctaText: primaryCtaText,
      version: version 
    })
    
    onPrimaryCtaClick?.()
    
    // Track conversion for A/B testing
    trackConversion({ 
      event: 'hero_primary_cta', 
      ctaText: primaryCtaText,
      version: version 
    })
  }

  const handleSecondaryCta = () => {
    // Track A/B test interaction
    trackInteraction({ 
      action: 'secondary_cta_click', 
      ctaText: secondaryCtaText,
      version: version 
    })
    
    onSecondaryCtaClick?.()
    
    // Track conversion for A/B testing
    trackConversion({ 
      event: 'hero_secondary_cta', 
      ctaText: secondaryCtaText,
      version: version 
    })
  }

  return (
    <section
      className={cn(
        heroVariants({ overlay, textPosition }), 
        className
      )}
      {...props}
    >
      {/* Aurora Enhanced Background with Color Psychology */}
      <div ref={intersectionRef} className="absolute inset-0 z-0">
        {/* Color Psychology: Deep Space to Aurora Pink - Romance & Luxury Trigger */}
        <div 
          className={cn(
            "absolute inset-0 z-5",
            getClassName("bg-aurora-hero animate-aurora-drift", "aurora-hero-gradient"),
            getClassName("romantic-emotional-trigger", "romantic-emotional-trigger"),
            "transition-opacity duration-1000"
          )}
          style={{
            opacity: videoLoaded ? 0.4 : 0.8
          }}
        />
        {/* Iridescent Overlay for Gemstone Light Play Psychology */}
        <div 
          className={cn(
            "absolute inset-0 z-6 pointer-events-none",
            getClassName("bg-aurora-shimmer animate-aurora-shimmer-slow", "aurora-animate-aurora-shimmer"),
            "opacity-60"
          )}
        />
        {/* Color Psychology: Rotating Aurora Background Effect - Mimics Demo HTML */}
        <div 
          className={cn(
            "absolute inset-0 z-4 pointer-events-none",
            getClassName("bg-aurora-radial animate-aurora-rotate", "bg-aurora-radial animate-aurora-rotate"),
            "opacity-30"
          )}
        />
        {!videoError && shouldLoadVideo && videoSrc && (
          <>
            <video
              ref={videoRef}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
                !videoLoaded && "opacity-0"
              )}
              autoPlay={!prefersReducedMotion}
              muted
              loop
              playsInline
              preload="none"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              onLoadStart={handleVideoLoadStart}
              onCanPlay={handleVideoCanPlay}
              onProgress={handleVideoProgress}
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Aurora Enhanced Loading Progress */}
            {!videoLoaded && loadingProgress > 0 && loadingProgress < 100 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-foreground to-foreground/80 backdrop-blur-sm z-30">
                <div className="flex flex-col items-center space-y-token-lg">
                  <div className="w-32 h-32 border-4 border-transparent bg-gradient-to-r from-accent to-aurora-nav-muted rounded-full p-token-xs">
                    <div className="w-full h-full bg-foreground rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-accent to-aurora-nav-muted rounded-full" />
                    </div>
                  </div>
                  <div className="text-white font-body text-xl">
                    Preparing Aurora Experience... {loadingProgress.toFixed(0)}%
                  </div>
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
              onLoad={() => console.log('✅ Hero fallback image loaded successfully')}
              onError={() => console.error('❌ Hero fallback image failed to load')}
            />
            {/* Aurora Gradient Overlay on fallback */}
            <div 
              className="absolute inset-0 z-5"
              style={{
                background: 'linear-gradient(135deg, rgba(42,43,54,0.6) 0%, rgba(74,74,90,0.4) 50%, rgba(212,175,55,0.3) 100%)'
              }}
            />
          </>
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

      {/* Aurora Enhanced Hero Content */}
      <div 
        className={cn(
          "relative z-20 flex min-h-screen items-center",
          contentVariants({ spacing })
        )}
      >
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
        >
          {/* Aurora Enhanced Headline with A/B Testing */}
          <motion.h1 
            className={cn(
              "font-headline aurora-iridescent-text",
              "text-4xl md:text-6xl lg:text-7xl",
              "leading-tight tracking-tight",
              getClassName("mb-6", "aurora-mb-token-lg"),
              "drop-shadow-2xl",
              // A/B Test specific styling
              isABTestActive && isAurora ? "animate-pulse" : ""
            )}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 1.2, ease: "easeOut" } }
            }}
          >
            {/* A/B Testing: Aurora version gets enhanced headline */}
            {isABTestActive && isAurora 
              ? "✨ Your Story, Our Sparkle. Aurora-Enhanced Jewelry That's Authentically You." 
              : headline
            }
          </motion.h1>

          {/* Aurora Enhanced Sub-headline */}
          <motion.p 
            className={cn(
              "font-body text-white/95",
              "text-lg md:text-xl lg:text-2xl leading-relaxed",
              getClassName("mb-8", "aurora-mb-token-xl"),
              "max-w-3xl mx-auto",
              "drop-shadow-lg"
            )}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 1.0, ease: "easeOut" } }
            }}
          >
            {subHeadline}
          </motion.p>

          {/* Aurora Enhanced CTA Buttons */}
          <motion.div 
            className={cn(
              "flex flex-col sm:flex-row justify-center",
              getClassName("gap-6", "aurora-gap-token-lg")
            )}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.6, duration: 1.0, ease: "easeOut" } }
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handlePrimaryCta}
              className={cn(
                "btn-cta-marketing text-white font-semibold",
                getEmotionalClassName('luxury', '', 'hero')
              )}
            >
              {primaryCtaText}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "text-high-contrast border-high-contrast/50 hover:bg-high-contrast/10 hover:text-high-contrast hover:border-high-contrast backdrop-blur-sm",
                designVersion === 'aurora' ? "aurora-animate-aurora-hover" : "aurora-pink-sweep-effect"
              )}
              onClick={handleSecondaryCta}
            >
              {secondaryCtaText}
            </Button>
          </motion.div>

          {/* Aurora Sparkle Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-high-contrast/60 rounded-full aurora-floating"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Aurora Enhanced Error Notification */}
      {videoError && (
        <div className="absolute top-token-md right-token-md z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-token-lg py-token-sm rounded-token-xl text-sm backdrop-blur-sm">
          <div className="flex items-center space-x-token-sm">
            <div className="w-2 h-2 bg-high-contrast rounded-full" />
            <span>Video unavailable. Aurora experience continues with fallback.</span>
          </div>
        </div>
      )}
    </section>
  )
}

export type HeroSectionVariant = VariantProps<typeof heroVariants>
export type HeroContentVariant = VariantProps<typeof contentVariants>