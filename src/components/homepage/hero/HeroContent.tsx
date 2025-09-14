/**
 * HeroContent Component
 * Aurora Design System - Batch 4 Migration
 * Extracted from HeroSection.tsx for Claude Rules compliance
 * Handles hero text content, headlines, and CTA buttons
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { AuroraButton } from '../../aurora/AuroraButton'
import { useDesignVersion, useABTest } from '../../../hooks/useDesignVersion'
import { getEmotionalClassName } from '../../../utils/classNameMigration'
import { useHeroAnimation } from '../../../hooks/useHeroAnimation'
import type { HeroContent, HeroAnimationConfig } from '../../../data/heroData'

// Aurora-compliant CVA variants for content container
const contentContainerVariants = cva(
  'relative z-40 flex min-h-screen items-center',
  {
    variants: {
      spacing: {
        comfortable: 'py-token-2xl sm:py-token-3xl lg:py-token-2xl px-token-md sm:px-token-lg lg:px-token-xl',
        compact: 'py-token-xl sm:py-token-2xl lg:py-token-3xl px-token-md sm:px-token-lg lg:px-token-xl',
        spacious: 'py-token-3xl sm:py-token-2xl lg:py-token-3xl px-token-md sm:px-token-lg lg:px-token-xl'
      },
      alignment: {
        center: 'text-center',
        left: 'text-left',
        right: 'text-right'
      }
    },
    defaultVariants: {
      spacing: 'comfortable',
      alignment: 'center'
    }
  }
)

const headlineVariants = cva(
  'aurora-hero aurora-gradient-text drop-shadow-2xl shadow-aurora-glow',
  {
    variants: {
      size: {
        small: '', // Size handled by aurora-hero class
        medium: '',
        large: ''
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        glow: 'animate-aurora-glow-pulse'
      }
    },
    defaultVariants: {
      size: 'medium',
      animation: 'glow'
    }
  }
)

const subHeadlineVariants = cva(
  'aurora-body-xl drop-shadow-lg max-w-3xl mx-auto aurora-text-glow',
  {
    variants: {
      size: {
        small: '', // Size handled by aurora-body-xl class  
        medium: '',
        large: ''
      },
      color: {
        white: 'text-white/95',
        muted: 'text-white/85',
        accent: 'aurora-accent'
      }
    },
    defaultVariants: {
      size: 'medium',
      color: 'white'
    }
  }
)

const ctaContainerVariants = cva(
  'flex justify-center',
  {
    variants: {
      direction: {
        row: 'flex-row',
        column: 'flex-col',
        responsive: 'flex-col sm:flex-row'
      },
      gap: {
        small: 'gap-token-md',
        medium: 'gap-token-lg',
        large: 'gap-token-xl'
      }
    },
    defaultVariants: {
      direction: 'responsive',
      gap: 'medium'
    }
  }
)

interface HeroContentProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof contentContainerVariants>,
    VariantProps<typeof headlineVariants>,
    VariantProps<typeof subHeadlineVariants>,
    VariantProps<typeof ctaContainerVariants> {
  /** Hero content configuration */
  content?: HeroContent
  /** Animation configuration */
  animationConfig?: HeroAnimationConfig
  /** Primary CTA click handler */
  onPrimaryCtaClick?: () => void
  /** Secondary CTA click handler */
  onSecondaryCtaClick?: () => void
  /** Enable sparkle effects */
  enableSparkles?: boolean
  /** Custom headline override */
  customHeadline?: string
  /** Custom sub-headline override */
  customSubHeadline?: string
  /** Show A/B test enhanced content */
  enableABTesting?: boolean
}

export function HeroContent({
  content,
  animationConfig,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  enableSparkles = true,
  customHeadline,
  customSubHeadline,
  enableABTesting = true,
  spacing,
  alignment,
  size: headlineSize,
  animation: headlineAnimation,
  color: subHeadlineColor,
  direction: ctaDirection,
  gap: ctaGap,
  className,
  ...props
}: HeroContentProps) {
  const { designVersion, getClassName } = useDesignVersion({ componentName: 'hero' })
  
  // Always call hooks in the same order - A/B testing is optional
  const { version, isAurora, isABTestActive, trackInteraction, trackConversion } = useABTest('HeroSection')
  
  // Use the extracted animation hook
  const { containerVariants, itemVariants } = useHeroAnimation({
    animationConfig,
    respectReducedMotion: true
  })

  // Default content
  const heroContent = content || {
    headline: "Your Story, Our Sparkle. Jewelry That's Authentically You.",
    subHeadline: "Conflict-free, brilliantly crafted lab gems, Moissanite, and diamonds for every style and milestone. Because true luxury is a clear conscience.",
    primaryCtaText: "Start Designing",
    primaryCtaHref: "/customizer",
    secondaryCtaText: "Explore Collection",
    secondaryCtaHref: "/catalog"
  }

  const handlePrimaryCta = () => {
    // Track A/B test interaction
    if (enableABTesting) {
      trackInteraction({ 
        action: 'primary_cta_click', 
        ctaText: heroContent.primaryCtaText,
        version: version 
      })
    }
    
    if (onPrimaryCtaClick) {
      onPrimaryCtaClick()
    } else {
      window.location.href = heroContent.primaryCtaHref || '/customizer'
    }
    
    // Track conversion for A/B testing
    if (enableABTesting) {
      trackConversion({ 
        event: 'hero_primary_cta', 
        ctaText: heroContent.primaryCtaText,
        version: version 
      })
    }
  }

  const handleSecondaryCta = () => {
    // Track A/B test interaction
    if (enableABTesting) {
      trackInteraction({ 
        action: 'secondary_cta_click', 
        ctaText: heroContent.secondaryCtaText,
        version: version 
      })
    }
    
    if (onSecondaryCtaClick) {
      onSecondaryCtaClick()
    } else {
      window.location.href = heroContent.secondaryCtaHref || '/catalog'
    }
    
    // Track conversion for A/B testing
    if (enableABTesting) {
      trackConversion({ 
        event: 'hero_secondary_cta', 
        ctaText: heroContent.secondaryCtaText,
        version: version 
      })
    }
  }

  // Determine final headline text
  const finalHeadline = customHeadline || 
    (enableABTesting && isABTestActive && isAurora 
      ? "✨ Your Story, Our Sparkle. Aurora-Enhanced Jewelry That's Authentically You." 
      : heroContent.headline)

  const finalSubHeadline = customSubHeadline || heroContent.subHeadline

  return (
    <div 
      className={cn(contentContainerVariants({ spacing, alignment }), className)}
      {...props}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Aurora Enhanced Headline with A/B Testing */}
        <motion.h1 
          className={cn(
            headlineVariants({ 
              size: headlineSize, 
              animation: enableABTesting && isABTestActive && isAurora ? 'glow' : 'glow'
            }),
            'mb-token-lg font-bold'
          )}
          variants={itemVariants.headline}
        >
          {finalHeadline}
        </motion.h1>

        {/* Aurora Enhanced Sub-headline */}
        <motion.p 
          className={cn(
            subHeadlineVariants({ 
              size: 'medium', 
              color: subHeadlineColor 
            }),
            'mb-token-xl font-medium'
          )}
          variants={itemVariants.subHeadline}
        >
          {finalSubHeadline}
        </motion.p>

        {/* Aurora Enhanced CTA Buttons */}
        <motion.div 
          className={cn(ctaContainerVariants({ direction: ctaDirection, gap: ctaGap }))}
          variants={itemVariants.cta}
        >
          <AuroraButton
            variant="primary"
            size="lg"
            luxury="exclusive"
            onClick={handlePrimaryCta}
            className="hover:animate-aurora-glow-pulse"
          >
            {heroContent.primaryCtaText}
          </AuroraButton>
          
          <AuroraButton
            variant="outline"
            size="lg"
            luxury="premium"
            onClick={handleSecondaryCta}
            className="backdrop-blur-sm"
          >
            {heroContent.secondaryCtaText}
          </AuroraButton>
        </motion.div>

        {/* Aurora Sparkle Effect */}
        {enableSparkles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-high-contrast/60 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export type HeroContentVariant = VariantProps<typeof contentContainerVariants>
export type HeroHeadlineVariant = VariantProps<typeof headlineVariants>
export type HeroSubHeadlineVariant = VariantProps<typeof subHeadlineVariants>
export type HeroCtaVariant = VariantProps<typeof ctaContainerVariants>