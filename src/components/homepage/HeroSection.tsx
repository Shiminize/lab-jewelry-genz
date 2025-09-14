import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { HeroBackground } from './hero/HeroBackground'
import { HeroContent } from './hero/HeroContent'
import { DEFAULT_HERO_CONTENT, DEFAULT_VIDEO_CONFIG, DEFAULT_ANIMATION_CONFIG } from '../../data/heroData'
import type { HeroContent as HeroContentType, HeroVideoConfig, HeroAnimationConfig } from '../../data/heroData'

// Aurora-compliant CVA variants for hero section
const heroSectionVariants = cva(
  'relative min-h-screen flex items-center justify-center overflow-hidden',
  {
    variants: {
      theme: {
        aurora: 'aurora-hero-theme',
        legacy: 'legacy-hero-theme',
        minimal: 'minimal-hero-theme'
      },
      layout: {
        fullscreen: 'min-h-screen',
        compact: 'min-h-[80vh]',
        large: 'min-h-[120vh]'
      }
    },
    defaultVariants: {
      theme: 'aurora',
      layout: 'fullscreen'
    }
  }
)

interface HeroSectionProps 
  extends Omit<React.HTMLAttributes<HTMLElement>, 'content'>,
    VariantProps<typeof heroSectionVariants> {
  /** Hero content configuration */
  content?: HeroContentType
  /** Video configuration */
  videoConfig?: HeroVideoConfig
  /** Animation configuration */
  animationConfig?: HeroAnimationConfig
  /** Primary CTA button action */
  onPrimaryCtaClick?: () => void
  /** Secondary CTA button action */
  onSecondaryCtaClick?: () => void
  /** Fallback image source URL */
  fallbackImageSrc?: string
  /** Alt text for fallback image */
  fallbackImageAlt?: string
  /** Background overlay style */
  overlay?: 'light' | 'medium' | 'dark' | 'gradient'
  /** Text position alignment */
  textPosition?: 'center' | 'left' | 'right'
  /** Content spacing */
  spacing?: 'comfortable' | 'compact' | 'spacious'
  /** Enable Aurora animations */
  enableAurora?: boolean
  /** Enable sparkle effects */
  enableSparkles?: boolean
  /** Enable A/B testing */
  enableABTesting?: boolean
}

export function HeroSection({
  className,
  content = DEFAULT_HERO_CONTENT,
  videoConfig = DEFAULT_VIDEO_CONFIG,
  animationConfig = DEFAULT_ANIMATION_CONFIG,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  fallbackImageSrc = "/hero_fallback.jpg",
  fallbackImageAlt = "Elegant jewelry collection showcasing lab-grown diamonds and moissanite pieces",
  overlay = 'gradient',
  textPosition = 'center',
  spacing = 'comfortable',
  enableAurora = true,
  enableSparkles = true,
  enableABTesting = true,
  theme,
  layout,
  ...props
}: HeroSectionProps) {
  // Hero section uses extracted components for better maintainability

  return (
    <section
      className={cn(
        heroSectionVariants({ theme, layout }), 
        className
      )}
      {...props}
    >
      {/* Hero Background Component - Handles video, overlays, and Aurora animations */}
      <HeroBackground
        videoConfig={videoConfig}
        fallbackImageSrc={fallbackImageSrc}
        fallbackImageAlt={fallbackImageAlt}
        enableAurora={enableAurora}
        overlay={overlay}
        showLoadingProgress={true}
      />

      {/* Hero Content Component - Handles text content and CTAs */}
      <HeroContent
        content={content}
        animationConfig={animationConfig}
        onPrimaryCtaClick={onPrimaryCtaClick}
        onSecondaryCtaClick={onSecondaryCtaClick}
        enableSparkles={enableSparkles}
        enableABTesting={enableABTesting}
        spacing={spacing}
        alignment={textPosition}
      />
    </section>
  )
}

export type HeroSectionVariant = VariantProps<typeof heroSectionVariants>