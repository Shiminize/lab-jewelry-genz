/**
 * Hero Section Data & Configuration
 * Aurora Design System - Batch 1 Migration
 * Extracted from HeroSection.tsx for better maintainability
 */

// Type definitions for Hero content
export interface HeroContent {
  headline: string
  subHeadline: string
  primaryCtaText: string
  primaryCtaHref: string
  secondaryCtaText: string
  secondaryCtaHref: string
  fallbackImageSrc: string
  fallbackImageAlt: string
}

export interface HeroVideoConfig {
  src: string
  preload: 'none' | 'metadata' | 'auto'
  autoPlay: boolean
  muted: boolean
  loop: boolean
  playsInline: boolean
}

export interface HeroAnimationConfig {
  respectReducedMotion: boolean
  sparkleCount: number
  sparkleAnimationDuration: string
  contentAnimationDelay: number
  videoLoadDelay: number
}

export interface HeroABTestContent {
  controlHeadline: string
  auroraHeadline: string
  controlSubHeadline: string
  auroraSubHeadline: string
}

// Default content configurations
export const DEFAULT_HERO_CONTENT: HeroContent = {
  headline: "Your Story, Our Sparkle. Jewelry That's Authentically You.",
  subHeadline: "Conflict-free, brilliantly crafted lab gems, Moissanite, and diamonds for every style and milestone. Because true luxury is a clear conscience.",
  primaryCtaText: "Start Designing",
  primaryCtaHref: "/customizer",
  secondaryCtaText: "Explore Collection",
  secondaryCtaHref: "/catalog",
  fallbackImageSrc: "/hero_fallback.jpg",
  fallbackImageAlt: "Elegant jewelry collection showcasing lab-grown diamonds and moissanite pieces"
}

export const HERO_AB_TEST_CONTENT: HeroABTestContent = {
  controlHeadline: "Your Story, Our Sparkle. Jewelry That's Authentically You.",
  auroraHeadline: "✨ Your Story, Our Sparkle. Aurora-Enhanced Jewelry That's Authentically You.",
  controlSubHeadline: "Conflict-free, brilliantly crafted lab gems, Moissanite, and diamonds for every style and milestone. Because true luxury is a clear conscience.",
  auroraSubHeadline: "Experience the future of luxury with Aurora-enhanced lab gems, Moissanite, and diamonds. Every piece tells your story with conscious choices that create positive impact."
}

export const DEFAULT_VIDEO_CONFIG: HeroVideoConfig = {
  src: "", // No video by default to avoid console errors
  preload: "none",
  autoPlay: true,
  muted: true,
  loop: true,
  playsInline: true
}

export const DEFAULT_ANIMATION_CONFIG: HeroAnimationConfig = {
  respectReducedMotion: true,
  sparkleCount: 5,
  sparkleAnimationDuration: "3s",
  contentAnimationDelay: 200, // ms
  videoLoadDelay: 1500 // ms - Load video 1.5s after page load
}

// Aurora color psychology configuration
export const HERO_AURORA_COLORS = {
  primaryGradient: "bg-aurora-hero animate-aurora-drift",
  shimmerOverlay: "bg-aurora-shimmer animate-aurora-shimmer-slow",
  radialBackground: "bg-aurora-radial animate-aurora-rotate",
  legacyOverlay: "bg-legacy-overlay",
  emotionalTrigger: "romantic-emotional-trigger"
} as const

// Animation variants for framer-motion
export const HERO_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: 0.2, 
      duration: 1.2, 
      ease: "easeOut" 
    } 
  }
} as const

export const HERO_SUBHEADLINE_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: 0.4, 
      duration: 1.0, 
      ease: "easeOut" 
    } 
  }
} as const

export const HERO_CTA_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: 0.6, 
      duration: 1.0, 
      ease: "easeOut" 
    } 
  }
} as const

// Loading progress messages
export const LOADING_MESSAGES = {
  preparing: "Preparing Aurora Experience...",
  loading: "Loading luxury elements...",
  finalizing: "Almost ready..."
} as const

// Sparkle animation configuration
export const SPARKLE_POSITIONS = [
  { left: "20%", top: "30%", delay: "0s", duration: "3s" },
  { left: "35%", top: "40%", delay: "0.5s", duration: "3.5s" },
  { left: "50%", top: "50%", delay: "1s", duration: "4s" },
  { left: "65%", top: "60%", delay: "1.5s", duration: "4.5s" },
  { left: "80%", top: "70%", delay: "2s", duration: "5s" }
] as const

export type HeroDataType = typeof DEFAULT_HERO_CONTENT
export type HeroVideoConfigType = typeof DEFAULT_VIDEO_CONFIG
export type HeroAnimationConfigType = typeof DEFAULT_ANIMATION_CONFIG