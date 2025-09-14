/**
 * CertificationBadges Component
 * Aurora Design System - Batch 3 Migration
 * Extracted from SustainabilityStorySection.tsx for Claude Rules compliance
 * Displays certifications and partnerships with trust indicators
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { H3, BodyText, AuroraTitleM, AuroraBodyM } from '../../foundation/Typography'
import type { Certification } from '../../../data/sustainabilityData'

// Aurora-compliant CVA variants for certifications
const certificationsContainerVariants = cva(
  'grid gap-token-lg',
  {
    variants: {
      columns: {
        responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        two: 'grid-cols-1 md:grid-cols-2',
        three: 'grid-cols-1 md:grid-cols-3',
        four: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }
    },
    defaultVariants: {
      columns: 'responsive'
    }
  }
)

const certificationCardVariants = cva(
  'text-center transition-all duration-token-normal group hover:scale-101',
  {
    variants: {
      style: {
        minimal: 'space-y-token-md',
        card: 'space-y-token-md p-token-lg bg-background rounded-token-lg shadow-token-sm hover:shadow-token-md',
        bordered: 'space-y-token-md p-token-lg bg-background rounded-token-lg border border-muted hover:border-accent/30 hover:shadow-token-md'
      }
    },
    defaultVariants: {
      style: 'bordered'
    }
  }
)

const badgeIconVariants = cva(
  'mx-auto flex items-center justify-center transition-all duration-token-normal group-hover:scale-110',
  {
    variants: {
      size: {
        small: 'w-16 h-16',
        medium: 'w-20 h-20',
        large: 'w-24 h-24'
      },
      style: {
        minimal: 'bg-background border border-muted rounded-token-md shadow-token-sm',
        accent: 'bg-background border border-accent/20 rounded-token-md shadow-token-md',
        elevated: 'bg-background border border-muted rounded-token-lg shadow-token-lg hover:shadow-token-xl'
      }
    },
    defaultVariants: {
      size: 'large',
      style: 'elevated'
    }
  }
)

const certificationBadgeVariants = cva(
  'inline-flex items-center gap-token-xs px-token-md py-token-sm rounded-token-full text-token-sm font-semibold transition-all duration-token-normal',
  {
    variants: {
      variant: {
        verified: 'bg-accent/20 text-accent hover:bg-accent/30',
        certified: 'bg-accent/10 text-accent hover:bg-accent/20',
        partner: 'bg-muted/30 text-foreground hover:bg-muted/40'
      }
    },
    defaultVariants: {
      variant: 'certified'
    }
  }
)

interface CertificationBadgesProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof certificationsContainerVariants>,
    VariantProps<typeof certificationCardVariants> {
  /** Certifications data */
  certifications: Certification[]
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Icon container props */
  iconProps?: {
    size?: VariantProps<typeof badgeIconVariants>['size']
    style?: VariantProps<typeof badgeIconVariants>['style']
  }
  /** Show trust indicators */
  showTrustBadges?: boolean
}

const getTrustIcon = (variant: Certification['variant']) => {
  switch (variant) {
    case 'verified':
      return '✓'
    case 'certified':
      return '🏆'
    case 'partner':
      return '🤝'
    default:
      return '✓'
  }
}

export function CertificationBadges({
  certifications,
  title = 'Certified & Verified',
  subtitle = 'Third-party verification you can trust. Our sustainability claims are backed by industry-leading certifications and partnerships.',
  columns,
  style,
  iconProps = {},
  showTrustBadges = true,
  className,
  ...props
}: CertificationBadgesProps) {
  return (
    <section 
      className={cn('py-token-4xl', className)}
      aria-labelledby="certifications-heading"
      {...props}
    >
      {/* Section Header */}
      <div className="text-center mb-token-3xl max-w-2xl mx-auto">
        <AuroraTitleM 
          id="certifications-heading"
          className="mb-token-md text-foreground"
        >
          {title}
        </AuroraTitleM>
        <AuroraBodyM className="text-foreground leading-relaxed">
          {subtitle}
        </AuroraBodyM>
      </div>

      {/* Certifications Grid */}
      <div className={cn(certificationsContainerVariants({ columns }))}>
        {certifications.map((cert, index) => (
          <article 
            key={index}
            className={cn(certificationCardVariants({ style }))}
            role="article"
            aria-labelledby={`certification-${index}-name`}
          >
            {/* Certification Icon */}
            <div className={cn(
              badgeIconVariants({ 
                size: iconProps.size, 
                style: iconProps.style 
              })
            )}>
              <span 
                className="text-3xl"
                aria-hidden="true"
              >
                {cert.icon}
              </span>
            </div>
            
            {/* Certification Content */}
            <div className="space-y-token-sm">
              {/* Trust Badge */}
              {showTrustBadges && (
                <div className="flex justify-center mb-token-sm">
                  <div className={cn(certificationBadgeVariants({ variant: cert.variant }))}>
                    <span aria-hidden="true">{getTrustIcon(cert.variant)}</span>
                    <span>{cert.name}</span>
                  </div>
                </div>
              )}
              
              {/* Certification Name (if not using badge) */}
              {!showTrustBadges && (
                <AuroraTitleM 
                  id={`certification-${index}-name`}
                  className="text-lg font-semibold text-foreground"
                >
                  {cert.name}
                </AuroraTitleM>
              )}
              
              {/* Description */}
              <AuroraBodyM 
                className="text-foreground leading-relaxed max-w-xs mx-auto"
              >
                {cert.description}
              </AuroraBodyM>
            </div>
          </article>
        ))}
      </div>

      {/* Trust Statement */}
      <div className="mt-token-2xl text-center">
        <div className="bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-token-lg p-token-lg max-w-3xl mx-auto">
          <AuroraBodyM 
            className="text-foreground mb-token-sm font-medium"
          >
            🛡️ Industry-Leading Standards & Transparency
          </AuroraBodyM>
          <AuroraBodyM 
            className="text-foreground leading-relaxed"
          >
            Every claim we make is backed by third-party verification from respected international organizations. 
            Our commitment to transparency means you can trust that your jewelry choice creates positive impact 
            for both people and planet.
          </AuroraBodyM>
        </div>
      </div>
    </section>
  )
}

export type CertificationBadgesVariant = VariantProps<typeof certificationsContainerVariants>
export type CertificationCardVariant = VariantProps<typeof certificationCardVariants>
export type BadgeIconVariant = VariantProps<typeof badgeIconVariants>