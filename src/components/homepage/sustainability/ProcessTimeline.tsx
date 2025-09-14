/**
 * ProcessTimeline Component
 * Aurora Design System - Batch 3 Migration
 * Extracted from SustainabilityStorySection.tsx for Claude Rules compliance
 * Displays lab diamond creation process steps with visual connectors
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { H3, BodyText, AuroraTitleM, AuroraBodyM } from '../../foundation/Typography'
import type { ProcessStep } from '../../../data/sustainabilityData'

// Aurora-compliant CVA variants for timeline
const timelineContainerVariants = cva(
  'grid gap-token-lg',
  {
    variants: {
      columns: {
        responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        two: 'grid-cols-1 md:grid-cols-2',
        three: 'grid-cols-1 md:grid-cols-3',
        four: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      },
      connector: {
        none: '',
        arrows: 'relative',
        lines: 'relative'
      }
    },
    defaultVariants: {
      columns: 'responsive',
      connector: 'arrows'
    }
  }
)

const stepCardVariants = cva(
  'relative flex flex-col items-center text-center transition-all duration-token-normal',
  {
    variants: {
      style: {
        minimal: 'space-y-token-md',
        card: 'space-y-token-md p-token-lg bg-background rounded-token-lg shadow-token-sm hover:shadow-token-md',
        elevated: 'space-y-token-md p-token-xl bg-background rounded-token-xl shadow-token-md hover:shadow-token-lg hover:scale-101'
      },
      connector: {
        none: '',
        arrow: 'after:absolute after:top-12 after:-right-4 lg:after:-right-8 after:content-["→"] after:text-muted-foreground after:text-2xl after:hidden lg:after:block last:after:hidden',
        line: 'after:absolute after:top-16 after:-right-4 lg:after:-right-8 after:w-8 after:h-0.5 after:bg-muted-foreground/30 after:hidden lg:after:block last:after:hidden'
      }
    },
    defaultVariants: {
      style: 'elevated',
      connector: 'arrow'
    }
  }
)

const iconContainerVariants = cva(
  'flex items-center justify-center transition-all duration-token-normal group-hover:scale-110',
  {
    variants: {
      size: {
        small: 'w-16 h-16',
        medium: 'w-20 h-20',
        large: 'w-24 h-24'
      },
      style: {
        minimal: 'bg-muted rounded-full',
        accent: 'bg-accent/10 rounded-full shadow-token-sm',
        gradient: 'bg-gradient-to-br from-accent/20 to-muted/30 rounded-full shadow-token-md'
      }
    },
    defaultVariants: {
      size: 'large',
      style: 'accent'
    }
  }
)

interface ProcessTimelineProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof timelineContainerVariants>,
    VariantProps<typeof stepCardVariants> {
  /** Process steps data */
  steps: ProcessStep[]
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Icon container props */
  iconProps?: {
    size?: VariantProps<typeof iconContainerVariants>['size']
    style?: VariantProps<typeof iconContainerVariants>['style']
  }
  /** Show step numbers */
  showNumbers?: boolean
}

export function ProcessTimeline({
  steps,
  title = 'How Lab-Grown Diamonds Are Created',
  subtitle = 'Discover the fascinating science behind lab-grown diamond creation. In just weeks, we recreate millions of years of natural formation.',
  columns,
  connector,
  style,
  iconProps = {},
  showNumbers = true,
  className,
  ...props
}: ProcessTimelineProps) {
  return (
    <section 
      className={cn('py-token-4xl', className)}
      aria-labelledby="process-timeline-heading"
      {...props}
    >
      {/* Section Header */}
      <div className="text-center mb-token-3xl max-w-2xl mx-auto">
        <AuroraTitleM 
          id="process-timeline-heading"
          className="mb-token-md text-foreground"
        >
          {title}
        </AuroraTitleM>
        <AuroraBodyM className="text-foreground leading-relaxed">
          {subtitle}
        </AuroraBodyM>
      </div>

      {/* Process Steps Timeline */}
      <div className={cn(timelineContainerVariants({ columns, connector }))}>
        {steps.map((step, index) => (
          <article 
            key={index}
            className={cn(
              stepCardVariants({ style, connector }),
              'group'
            )}
            role="article"
            aria-labelledby={`process-step-${index}-title`}
          >
            {/* Step Number Badge */}
            {showNumbers && (
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-accent text-background rounded-full flex items-center justify-center text-sm font-bold shadow-token-md z-10">
                {index + 1}
              </div>
            )}
            
            {/* Icon Container */}
            <div className={cn(
              iconContainerVariants({ 
                size: iconProps.size, 
                style: iconProps.style 
              })
            )}>
              <span 
                className="text-3xl"
                aria-hidden="true"
              >
                {step.icon}
              </span>
            </div>
            
            {/* Step Content */}
            <div className="space-y-token-sm max-w-xs">
              <AuroraTitleM 
                id={`process-step-${index}-title`}
                className="text-lg font-semibold text-foreground"
              >
                {step.title}
              </AuroraTitleM>
              <AuroraBodyM 
                className="text-foreground leading-relaxed"
              >
                {step.description}
              </AuroraBodyM>
            </div>
          </article>
        ))}
      </div>

      {/* Process Summary */}
      <div className="mt-token-2xl text-center">
        <div className="bg-muted/20 border border-muted/40 rounded-token-lg p-token-lg max-w-3xl mx-auto">
          <AuroraBodyM 
            className="text-foreground mb-token-sm font-medium"
          >
            🔬 Scientific Precision Meets Natural Beauty
          </AuroraBodyM>
          <AuroraBodyM 
            className="text-foreground leading-relaxed"
          >
            Our lab-grown diamonds undergo the same geological processes as natural diamonds, 
            but in a controlled environment that ensures consistent quality, ethical sourcing, 
            and minimal environmental impact. Each diamond is individually grown, cut, and polished 
            to the highest industry standards.
          </AuroraBodyM>
        </div>
      </div>
    </section>
  )
}

export type ProcessTimelineVariant = VariantProps<typeof timelineContainerVariants>
export type ProcessStepVariant = VariantProps<typeof stepCardVariants>
export type ProcessIconVariant = VariantProps<typeof iconContainerVariants>