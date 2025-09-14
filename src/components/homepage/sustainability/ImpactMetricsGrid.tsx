/**
 * ImpactMetricsGrid Component
 * Aurora Design System - Batch 3 Migration
 * Extracted from SustainabilityStorySection.tsx for Claude Rules compliance
 * Displays impact metrics with cards and comparison data
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { H3, BodyText, MutedText, AuroraTitleM, AuroraBodyM, AuroraSmall } from '../../foundation/Typography'
import type { ImpactMetric } from '../../../data/sustainabilityData'

// Aurora-compliant CVA variants for metrics
const metricsContainerVariants = cva(
  'grid gap-token-lg',
  {
    variants: {
      columns: {
        responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        two: 'grid-cols-1 md:grid-cols-2',
        three: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        four: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }
    },
    defaultVariants: {
      columns: 'responsive'
    }
  }
)

const metricCardVariants = cva(
  'group relative transition-all duration-token-normal rounded-token-lg shadow-token-md hover:shadow-token-lg',
  {
    variants: {
      style: {
        default: 'bg-background p-token-lg',
        accent: 'bg-accent/10 p-token-lg hover:bg-accent/20',
        gradient: 'bg-gradient-to-br from-accent/10 to-muted/30 p-token-lg hover:from-accent/20 hover:to-muted/40'
      },
      emphasis: {
        none: '',
        hover: 'hover:scale-101 hover:-translate-y-token-xs'
      }
    },
    defaultVariants: {
      style: 'default',
      emphasis: 'hover'
    }
  }
)

const metricValueVariants = cva(
  'font-bold transition-colors duration-token-normal',
  {
    variants: {
      size: {
        small: 'text-2xl lg:text-3xl',
        medium: 'text-3xl lg:text-4xl',
        large: 'text-4xl lg:text-5xl'
      },
      color: {
        accent: 'text-accent group-hover:text-accent-hover',
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

interface ImpactMetricsGridProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof metricsContainerVariants>,
    VariantProps<typeof metricCardVariants> {
  /** Impact metrics data */
  metrics: ImpactMetric[]
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Show comparison data */
  showComparison?: boolean
  /** Custom metric card props */
  metricCardProps?: {
    size?: VariantProps<typeof metricValueVariants>['size']
    color?: VariantProps<typeof metricValueVariants>['color']
  }
}

export function ImpactMetricsGrid({
  metrics,
  title = 'Real Impact, Real Numbers',
  subtitle = 'Transparency matters. Here\'s exactly how choosing lab-grown diamonds creates positive change for our planet and future generations.',
  columns,
  style,
  emphasis,
  showComparison = true,
  metricCardProps = {},
  className,
  ...props
}: ImpactMetricsGridProps) {
  return (
    <section 
      className={cn('py-token-4xl', className)}
      aria-labelledby="impact-metrics-heading"
      {...props}
    >
      {/* Section Header */}
      <div className="text-center mb-token-3xl max-w-2xl mx-auto">
        <AuroraTitleM 
          id="impact-metrics-heading"
          className="mb-token-md text-foreground"
        >
          {title}
        </AuroraTitleM>
        <AuroraBodyM className="text-foreground leading-relaxed">
          {subtitle}
        </AuroraBodyM>
      </div>

      {/* Metrics Grid */}
      <div className={cn(metricsContainerVariants({ columns }))}>
        {metrics.map((metric, index) => (
          <article 
            key={index}
            className={cn(metricCardVariants({ style, emphasis }))}
            role="article"
            aria-labelledby={`metric-${index}-label`}
          >
            <div className="text-center space-y-token-md">
              {/* Icon */}
              <div 
                className="text-4xl mb-token-md flex justify-center"
                aria-hidden="true"
              >
                {metric.icon}
              </div>
              
              {/* Value */}
              <div className="space-y-token-sm">
                <div className={cn(
                  metricValueVariants({ 
                    size: metricCardProps.size, 
                    color: metricCardProps.color 
                  })
                )}>
                  {metric.value}
                </div>
                
                {/* Label */}
                <AuroraTitleM 
                  id={`metric-${index}-label`}
                  className="text-lg font-semibold text-foreground"
                >
                  {metric.label}
                </AuroraTitleM>
                
                {/* Description */}
                <AuroraBodyM 
                  className="text-foreground leading-relaxed max-w-xs mx-auto"
                >
                  {metric.description}
                </AuroraBodyM>
                
                {/* Comparison Data */}
                {showComparison && metric.comparison && (
                  <div className="border-t border-muted pt-token-sm mt-token-md">
                    <AuroraSmall 
                      className="italic text-foreground/70"
                    >
                      {metric.comparison}
                    </AuroraSmall>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export type ImpactMetricsGridVariant = VariantProps<typeof metricsContainerVariants>
export type MetricCardVariant = VariantProps<typeof metricCardVariants>
export type MetricValueVariant = VariantProps<typeof metricValueVariants>