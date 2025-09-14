/**
 * CommunityImpact Component
 * Aurora Design System - Batch 3 Migration
 * Extracted from SustainabilityStorySection.tsx for Claude Rules compliance
 * Displays community stats and final CTA section
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { H3, BodyText, MutedText, AuroraTitleM, AuroraBodyM, AuroraSmall } from '../../foundation/Typography'
import { Button } from '../../ui/Button'
import type { CommunityStats } from '../../../data/sustainabilityData'

// Aurora-compliant CVA variants for community section
const communityContainerVariants = cva(
  'text-center rounded-token-xl',
  {
    variants: {
      style: {
        gradient: 'bg-gradient-to-r from-accent/10 to-accent/20',
        solid: 'bg-accent/10',
        minimal: 'bg-muted/20'
      },
      padding: {
        comfortable: 'p-token-2xl lg:p-token-3xl',
        compact: 'p-token-xl lg:p-token-2xl',
        spacious: 'p-token-3xl lg:p-token-4xl'
      }
    },
    defaultVariants: {
      style: 'gradient',
      padding: 'comfortable'
    }
  }
)

const statsGridVariants = cva(
  'grid gap-token-lg mb-token-2xl',
  {
    variants: {
      columns: {
        responsive: 'grid-cols-1 md:grid-cols-3',
        two: 'grid-cols-1 md:grid-cols-2',
        three: 'grid-cols-1 md:grid-cols-3'
      }
    },
    defaultVariants: {
      columns: 'responsive'
    }
  }
)

const statItemVariants = cva(
  'transition-all duration-token-normal',
  {
    variants: {
      emphasis: {
        none: '',
        hover: 'hover:scale-105',
        glow: 'hover:scale-105 hover:text-accent'
      }
    },
    defaultVariants: {
      emphasis: 'glow'
    }
  }
)

const statValueVariants = cva(
  'font-bold transition-colors duration-token-normal',
  {
    variants: {
      size: {
        small: 'text-xl lg:text-2xl',
        medium: 'text-2xl lg:text-3xl',
        large: 'text-3xl lg:text-4xl'
      },
      color: {
        accent: 'text-accent',
        foreground: 'text-foreground',
        gradient: 'bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent'
      }
    },
    defaultVariants: {
      size: 'medium',
      color: 'accent'
    }
  }
)

interface CommunityImpactProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof communityContainerVariants>,
    VariantProps<typeof statsGridVariants> {
  /** Community statistics */
  stats: CommunityStats
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Primary CTA text */
  primaryCtaText?: string
  /** Primary CTA href */
  primaryCtaHref?: string
  /** Secondary CTA text */
  secondaryCtaText?: string
  /** Secondary CTA href */
  secondaryCtaHref?: string
  /** Stat value props */
  statProps?: {
    size?: VariantProps<typeof statValueVariants>['size']
    color?: VariantProps<typeof statValueVariants>['color']
    emphasis?: VariantProps<typeof statItemVariants>['emphasis']
  }
  /** Button click handlers */
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
}

export function CommunityImpact({
  stats,
  title = 'Join the Conscious Luxury Movement',
  subtitle = 'Every purchase supports a future where luxury and responsibility go hand in hand. You\'re not just buying jewelry—you\'re investing in a world where beautiful choices create beautiful change.',
  primaryCtaText = 'Start Your Sustainable Journey',
  primaryCtaHref = '/catalog',
  secondaryCtaText = 'Learn More About Us',
  secondaryCtaHref = '/about',
  style,
  padding,
  columns,
  statProps = {},
  onPrimaryClick,
  onSecondaryClick,
  className,
  ...props
}: CommunityImpactProps) {
  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick()
    } else {
      window.location.href = primaryCtaHref
    }
  }

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick()
    } else {
      window.location.href = secondaryCtaHref
    }
  }

  return (
    <section 
      className={cn('py-token-4xl', className)}
      aria-labelledby="community-impact-heading"
      {...props}
    >
      <div className={cn(communityContainerVariants({ style, padding }))}>
        {/* Section Header */}
        <div className="mb-token-2xl">
          <AuroraTitleM 
            id="community-impact-heading"
            className="mb-token-lg text-foreground"
          >
            {title}
          </AuroraTitleM>
          <AuroraBodyM 
            className="text-foreground leading-relaxed max-w-3xl mx-auto"
          >
            {subtitle}
          </AuroraBodyM>
        </div>

        {/* Community Statistics */}
        <div className={cn(statsGridVariants({ columns }))}>
          <div className={cn(statItemVariants({ emphasis: statProps.emphasis }))}>
            <div className={cn(
              statValueVariants({ 
                size: statProps.size, 
                color: statProps.color 
              })
            )}>
              {stats.consumersJoined}
            </div>
            <AuroraSmall className="text-foreground/80">
              Conscious consumers joined
            </AuroraSmall>
          </div>
          
          <div className={cn(statItemVariants({ emphasis: statProps.emphasis }))}>
            <div className={cn(
              statValueVariants({ 
                size: statProps.size, 
                color: statProps.color 
              })
            )}>
              {stats.earthPreserved}
            </div>
            <AuroraSmall className="text-foreground/80">
              Tons of earth preserved
            </AuroraSmall>
          </div>
          
          <div className={cn(statItemVariants({ emphasis: statProps.emphasis }))}>
            <div className={cn(
              statValueVariants({ 
                size: statProps.size, 
                color: statProps.color 
              })
            )}>
              {stats.satisfaction}
            </div>
            <AuroraSmall className="text-foreground/80">
              Customer satisfaction
            </AuroraSmall>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-token-md justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handlePrimaryClick}
            className="min-w-[220px]"
          >
            {primaryCtaText}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleSecondaryClick}
            className="min-w-[220px] text-foreground hover:text-accent border-foreground/20 hover:border-accent/30"
          >
            {secondaryCtaText}
          </Button>
        </div>

        {/* Additional Impact Message */}
        <div className="mt-token-xl">
          <AuroraBodyM 
            className="text-foreground/70 leading-relaxed max-w-2xl mx-auto"
          >
            When you choose lab-grown diamonds, you join a community of forward-thinking individuals 
            who believe luxury should enhance life, not compromise it. Together, we're creating a 
            more sustainable and ethical future for the jewelry industry.
          </AuroraBodyM>
        </div>
      </div>
    </section>
  )
}

export type CommunityImpactVariant = VariantProps<typeof communityContainerVariants>
export type CommunityStatsVariant = VariantProps<typeof statsGridVariants>
export type StatItemVariant = VariantProps<typeof statItemVariants>