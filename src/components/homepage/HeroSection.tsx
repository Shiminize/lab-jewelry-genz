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
      className={cn(
        heroVariants({ overlay, textPosition }), 
        className
      )}
      {...props}
    >
      {/* Aurora Enhanced Background */}
      <div ref={intersectionRef} className="absolute inset-0 z-0">
        {/* Aurora Gradient Overlay */}
        <div 
          className="absolute inset-0 z-5"
          style={{
            background: 'linear-gradient(135deg, #2a2b36 0%, #4a4a5a 50%, #d4af37 100%)',
            opacity: videoLoaded ? 0.3 : 0.7,
            transition: 'opacity 1s ease-in-out'
          }}
        />
        {!videoError && shouldLoadVideo && (
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
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-32 h-32 border-4 border-transparent bg-gradient-to-r from-accent to-aurora-nav-muted rounded-full p-1">
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
          {/* Aurora Enhanced Headline */}
          <motion.h1 
            className={cn(
              "font-headline text-white aurora-gradient-text",
              "text-4xl md:text-6xl lg:text-7xl",
              "leading-tight tracking-tight mb-6",
              "drop-shadow-2xl"
            )}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 1.2, ease: "easeOut" } }
            }}
          >
            {headline}
          </motion.h1>

          {/* Aurora Enhanced Sub-headline */}
          <motion.p 
            className={cn(
              "font-body text-white/95",
              "text-lg md:text-xl lg:text-2xl leading-relaxed mb-10",
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
            className="flex flex-col sm:flex-row gap-6 justify-center"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.6, duration: 1.0, ease: "easeOut" } }
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handlePrimaryCta}
              className="text-white font-semibold"
            >
              {primaryCtaText}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="text-high-contrast border-high-contrast/50 hover:bg-high-contrast/10 hover:text-high-contrast hover:border-high-contrast backdrop-blur-sm"
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
        <div className="absolute top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl text-sm backdrop-blur-sm">
          <div className="flex items-center space-x-2">
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