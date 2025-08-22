'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
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
  primaryCtaText = "Start Designing",
  onPrimaryCtaClick,
  secondaryCtaText = "Explore Collection", 
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
      {...props}
    >
      {/* Video Background with Lazy Loading */}
      <div ref={intersectionRef} className="absolute inset-0 z-0">
        {!videoError && shouldLoadVideo && (
          <>
            <video
              ref={videoRef}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
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
            
            {/* Video Loading Progress Indicator */}
            {!videoLoaded && loadingProgress > 0 && loadingProgress < 100 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm z-30">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <div className="text-white/80 font-medium">
                    Loading video... {loadingProgress.toFixed(0)}%
                  </div>
                  <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Fallback Image - Always show until video loads */}
        {(videoError || !videoLoaded || !shouldLoadVideo) && (
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

      {/* Hero Content */}
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
          {/* Headline */}
          <motion.h1 
            className={cn(
              "font-headline text-background",
              "text-4xl md:text-6xl lg:text-7xl",
              "leading-tight tracking-tight mb-6"
            )}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.8 } }
            }}
          >
            {headline}
          </motion.h1>

          {/* Sub-headline */}
          <motion.p 
            className={cn(
              "font-body text-background",
              "text-lg md:text-xl lg:text-2xl leading-relaxed mb-8",
              "max-w-3xl mx-auto"
            )}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.8 } }
            }}
          >
            {subHeadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.8 } }
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handlePrimaryCta}
            >
              {primaryCtaText}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="text-background border-background hover:bg-background hover:text-foreground"
              onClick={handleSecondaryCta}
            >
              {secondaryCtaText}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Video Error Notification */}
      {videoError && (
        <div className="absolute top-4 right-4 z-50 bg-red-500/90 text-white px-4 py-2 rounded-md text-sm">
          Video failed to load. Using fallback image.
        </div>
      )}
    </section>
  )
}

export type HeroSectionVariant = VariantProps<typeof heroVariants>
export type HeroContentVariant = VariantProps<typeof contentVariants>