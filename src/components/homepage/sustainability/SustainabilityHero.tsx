/**
 * SustainabilityHero Component
 * Aurora Design System - Batch 3 Migration
 * Extracted from SustainabilityStorySection.tsx for Claude Rules compliance
 * Handles hero section with headline, description, and CTAs
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { H2, BodyText, AuroraStatement, AuroraBodyM } from '../../foundation/Typography'
import { Button } from '../../ui/Button'
import type { SustainabilityContent } from '../../../data/sustainabilityData'

// Aurora-compliant CVA variants for hero section
const heroVariants = cva(
  'relative overflow-hidden rounded-token-xl text-center',
  {
    variants: {
      style: {
        default: 'bg-gradient-to-br from-accent/10 via-background to-muted/30',
        subtle: 'bg-muted/30',
        vibrant: 'bg-gradient-to-br from-accent/20 via-background to-accent/10'
      },
      padding: {
        comfortable: 'p-token-2xl lg:p-token-3xl',
        compact: 'p-token-xl lg:p-token-2xl',
        spacious: 'p-token-3xl lg:p-token-4xl'
      }
    },
    defaultVariants: {
      style: 'default',
      padding: 'comfortable'
    }
  }
)

const keyMessageVariants = cva(
  'bg-background/50 backdrop-blur-sm rounded-token-lg shadow-token-md',
  {
    variants: {
      prominence: {
        default: 'p-token-lg mb-token-2xl',
        subtle: 'p-token-md mb-token-xl',
        bold: 'p-token-xl mb-token-3xl border border-accent/20'
      }
    },
    defaultVariants: {
      prominence: 'default'
    }
  }
)

interface SustainabilityHeroProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof heroVariants>,
    VariantProps<typeof keyMessageVariants> {
  /** Content configuration */
  content: SustainabilityContent
  /** Show decorative elements */
  showDecorative?: boolean
  /** Button click handlers */
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  /** Custom max width for content */
  maxWidth?: string
}

export function SustainabilityHero({
  content,
  style,
  padding,
  prominence,
  className,
  showDecorative = true,
  onPrimaryClick,
  onSecondaryClick,
  maxWidth = '4xl',
  ...props
}: SustainabilityHeroProps) {
  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick()
    } else {
      window.location.href = content.ctaHref
    }
  }

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick()
    } else {
      window.location.href = content.secondaryCtaHref
    }
  }

  return (
    <section
      className={cn(heroVariants({ style, padding }), className)}
      aria-labelledby="sustainability-hero-heading"
      {...props}
    >
      <div className={cn('mx-auto', `max-w-${maxWidth}`)}>
        {/* Main Headline */}
        <AuroraStatement 
          id="sustainability-hero-heading"
          className="mb-token-lg text-foreground"
        >
          {content.headline}
        </AuroraStatement>
        
        {/* Description */}
        <AuroraBodyM 
          className="text-foreground mb-token-2xl leading-relaxed max-w-3xl mx-auto"
        >
          {content.description}
        </AuroraBodyM>
        
        {/* Key Message Highlight */}
        <div className={cn(keyMessageVariants({ prominence }))}>
          <AuroraBodyM 
            className="text-foreground font-medium"
          >
            💎 {content.keyMessage}{' '}
            <span className="text-accent font-semibold">
              {content.keyMessageHighlight}
            </span>
          </AuroraBodyM>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-token-md justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handlePrimaryClick}
            className="min-w-[200px]"
          >
            {content.ctaText}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSecondaryClick}
            className="min-w-[200px]"
          >
            {content.secondaryCtaText}
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      {showDecorative && (
        <>
          <div 
            className="absolute top-token-md right-token-md opacity-20 text-6xl"
            aria-hidden="true"
          >
            🌱
          </div>
          <div 
            className="absolute bottom-token-md left-token-md opacity-20 text-4xl"
            aria-hidden="true"
          >
            ♻️
          </div>
        </>
      )}
    </section>
  )
}

export type SustainabilityHeroVariant = VariantProps<typeof heroVariants>
export type SustainabilityHeroKeyMessageVariant = VariantProps<typeof keyMessageVariants>