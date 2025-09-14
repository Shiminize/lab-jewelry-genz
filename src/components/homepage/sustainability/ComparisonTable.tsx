/**
 * ComparisonTable Component
 * Aurora Design System - Batch 3 Migration
 * Extracted from SustainabilityStorySection.tsx for Claude Rules compliance
 * Displays lab-grown vs traditional mining comparison
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { H3, BodyText, MutedText, AuroraTitleM, AuroraBodyM, AuroraSmall } from '../../foundation/Typography'
import type { ComparisonPoint } from '../../../data/sustainabilityData'

// Aurora-compliant CVA variants for comparison
const comparisonContainerVariants = cva(
  'space-y-token-lg',
  {
    variants: {
      layout: {
        stacked: 'space-y-token-lg',
        compact: 'space-y-token-md'
      }
    },
    defaultVariants: {
      layout: 'stacked'
    }
  }
)

const comparisonRowVariants = cva(
  'grid gap-token-md items-center rounded-token-lg transition-all duration-token-normal hover:shadow-token-md',
  {
    variants: {
      columns: {
        responsive: 'grid-cols-1 lg:grid-cols-3',
        equal: 'grid-cols-1 md:grid-cols-3'
      },
      spacing: {
        comfortable: 'p-token-md',
        compact: 'p-token-sm'
      }
    },
    defaultVariants: {
      columns: 'responsive',
      spacing: 'comfortable'
    }
  }
)

const comparisonCardVariants = cva(
  'relative transition-all duration-token-normal rounded-token-md shadow-token-sm hover:shadow-token-md',
  {
    variants: {
      type: {
        traditional: 'bg-muted/20 border border-muted/40',
        labgrown: 'bg-accent/10 border border-accent/30'
      },
      emphasis: {
        none: '',
        hover: 'hover:scale-101'
      }
    },
    defaultVariants: {
      type: 'traditional',
      emphasis: 'hover'
    }
  }
)

const impactIconVariants = cva(
  'text-xl flex-shrink-0 transition-transform duration-token-normal',
  {
    variants: {
      impact: {
        positive: 'text-accent group-hover:scale-110',
        negative: 'text-foreground',
        neutral: 'text-foreground'
      }
    },
    defaultVariants: {
      impact: 'neutral'
    }
  }
)

interface ComparisonTableProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof comparisonContainerVariants>,
    VariantProps<typeof comparisonRowVariants> {
  /** Comparison data */
  comparisons: ComparisonPoint[]
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Show impact icons */
  showImpactIcons?: boolean
}

const getImpactIcon = (impact: ComparisonPoint['impact']) => {
  switch (impact) {
    case 'positive':
      return '✅'
    case 'negative':
      return '⚠️'
    case 'neutral':
      return '⚖️'
    default:
      return '⚖️'
  }
}

export function ComparisonTable({
  comparisons,
  title = 'Lab-Grown vs. Traditional Mining',
  subtitle = 'Same diamonds, different story. See why lab-grown is the conscious choice for the future-focused generation.',
  layout,
  columns,
  spacing,
  showImpactIcons = true,
  className,
  ...props
}: ComparisonTableProps) {
  return (
    <section 
      className={cn('py-token-4xl', className)}
      aria-labelledby="comparison-heading"
      {...props}
    >
      {/* Section Header */}
      <div className="text-center mb-token-3xl max-w-2xl mx-auto">
        <AuroraTitleM 
          id="comparison-heading"
          className="mb-token-md text-foreground"
        >
          {title}
        </AuroraTitleM>
        <AuroraBodyM className="text-foreground leading-relaxed">
          {subtitle}
        </AuroraBodyM>
      </div>

      {/* Comparison Items */}
      <div className={cn(comparisonContainerVariants({ layout }))}>
        {comparisons.map((item, index) => (
          <div 
            key={index}
            className={cn(comparisonRowVariants({ columns, spacing }))}
            role="region"
            aria-labelledby={`comparison-aspect-${index}`}
          >
            {/* Aspect Label */}
            <div className="text-center lg:text-left">
              <AuroraTitleM 
                id={`comparison-aspect-${index}`}
                className="text-lg font-semibold text-foreground mb-token-sm"
              >
                {item.aspect}
              </AuroraTitleM>
            </div>

            {/* Traditional Mining */}
            <div className={cn(
              comparisonCardVariants({ type: 'traditional', emphasis: 'hover' }),
              'p-token-lg group'
            )}>
              <div className="flex items-start gap-token-sm">
                {showImpactIcons && (
                  <span 
                    className={cn(impactIconVariants({ impact: 'negative' }))}
                    aria-hidden="true"
                  >
                    ⚠️
                  </span>
                )}
                <div className="flex-1">
                  <AuroraSmall 
                    className="font-medium text-foreground mb-token-xs"
                  >
                    Traditional Mining
                  </AuroraSmall>
                  <AuroraBodyM 
                    className="text-foreground leading-relaxed"
                  >
                    {item.traditional}
                  </AuroraBodyM>
                </div>
              </div>
            </div>

            {/* Lab-Grown */}
            <div className={cn(
              comparisonCardVariants({ type: 'labgrown', emphasis: 'hover' }),
              'p-token-lg group'
            )}>
              <div className="flex items-start gap-token-sm">
                {showImpactIcons && (
                  <span 
                    className={cn(impactIconVariants({ impact: item.impact }))}
                    aria-hidden="true"
                  >
                    {getImpactIcon(item.impact)}
                  </span>
                )}
                <div className="flex-1">
                  <AuroraSmall 
                    className="font-medium text-accent mb-token-xs"
                  >
                    Lab-Grown
                  </AuroraSmall>
                  <AuroraBodyM 
                    className="text-accent leading-relaxed"
                  >
                    {item.labGrown}
                  </AuroraBodyM>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Note */}
      <div className="mt-token-2xl text-center">
        <div className="bg-accent/5 border border-accent/20 rounded-token-lg p-token-lg max-w-2xl mx-auto">
          <AuroraBodyM 
            className="text-accent font-medium"
          >
            💡 Lab-grown diamonds are chemically, physically, and optically identical to mined diamonds, 
            certified by the same gemological institutes, but created with 95% less environmental impact.
          </AuroraBodyM>
        </div>
      </div>
    </section>
  )
}

export type ComparisonTableVariant = VariantProps<typeof comparisonContainerVariants>
export type ComparisonRowVariant = VariantProps<typeof comparisonRowVariants>
export type ComparisonCardVariant = VariantProps<typeof comparisonCardVariants>