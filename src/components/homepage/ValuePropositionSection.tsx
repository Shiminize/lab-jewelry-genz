'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'

const valuePropositionVariants = cva(
  'bg-background',
  {
    variants: {
      spacing: {
        comfortable: 'py-16 sm:py-20 lg:py-24',
        compact: 'py-12 sm:py-16 lg:py-20',
        spacious: 'py-20 sm:py-24 lg:py-32'
      },
      layout: {
        default: 'px-4 sm:px-6 lg:px-8',
        wide: 'px-6 sm:px-8 lg:px-12',
        contained: 'px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'
      }
    },
    defaultVariants: {
      spacing: 'comfortable',
      layout: 'contained'
    }
  }
)

const gridVariants = cva(
  'grid gap-8 lg:gap-12',
  {
    variants: {
      columns: {
        three: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        two: 'grid-cols-1 lg:grid-cols-2',
        stacked: 'grid-cols-1'
      },
      alignment: {
        center: 'items-center text-center',
        start: 'items-start text-left',
        stretch: 'items-stretch'
      }
    },
    defaultVariants: {
      columns: 'three',
      alignment: 'center'
    }
  }
)

const valueCardVariants = cva(
  'group relative',
  {
    variants: {
      style: {
        minimal: 'space-y-4',
        card: 'bg-muted/30 rounded-2xl p-6 lg:p-8 space-y-4 hover:bg-muted/40 transition-colors duration-300',
        bordered: 'border border-muted rounded-2xl p-6 lg:p-8 space-y-4 hover:border-accent/30 transition-colors duration-300'
      },
      emphasis: {
        none: '',
        subtle: 'transform hover:scale-[1.02] transition-transform duration-300',
        strong: 'transform hover:scale-105 transition-all duration-300 hover:shadow-lg'
      }
    },
    defaultVariants: {
      style: 'minimal',
      emphasis: 'subtle'
    }
  }
)

const iconVariants = cva(
  'flex items-center justify-center rounded-full',
  {
    variants: {
      size: {
        sm: 'w-12 h-12 text-lg',
        md: 'w-16 h-16 text-xl',
        lg: 'w-20 h-20 text-2xl'
      },
      style: {
        accent: 'bg-accent/10 text-accent',
        muted: 'bg-muted text-foreground',
        gradient: 'bg-gradient-to-br from-accent/20 to-accent/10 text-accent'
      }
    },
    defaultVariants: {
      size: 'md',
      style: 'accent'
    }
  }
)

const trustSignalVariants = cva(
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-muted/50 text-foreground',
        accent: 'bg-accent/10 text-accent',
        success: 'bg-accent/20 text-accent'
      }
    },
    defaultVariants: {
      variant: 'accent'
    }
  }
)

interface ValueProp {
  icon: string
  headline: string
  description: string
  trustSignals: Array<{
    icon: string
    text: string
    variant?: 'default' | 'accent' | 'success'
  }>
}

interface ValuePropositionSectionProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof valuePropositionVariants>,
    VariantProps<typeof gridVariants>,
    VariantProps<typeof valueCardVariants> {
  /** Main section headline */
  headline?: string
  /** Section description/subtitle */
  description?: string
  /** Custom value propositions - if not provided, defaults will be used */
  valueProps?: ValueProp[]
  /** Show trust signals at the bottom */
  showTrustSignals?: boolean
  /** Icon size for value prop icons */
  iconSize?: 'sm' | 'md' | 'lg'
  /** Icon style variant */
  iconStyle?: 'accent' | 'muted' | 'gradient'
}

const defaultValueProps: ValueProp[] = [
  {
    icon: '🌱',
    headline: 'Ethically Sourced & Conflict-Free',
    description: 'Every piece tells a story of responsibility. Our lab-grown diamonds and ethically sourced materials mean you can wear your values with pride, knowing your jewelry creates positive impact.',
    trustSignals: [
      { icon: '✨', text: '100% Conflict-Free', variant: 'accent' },
      { icon: '🔬', text: 'Lab-Grown Certified', variant: 'accent' }
    ]
  },
  {
    icon: '🎨',
    headline: 'Your Vision, Your Voice',
    description: 'Self-expression shouldn\'t be limited by what\'s on the shelf. Design jewelry that speaks your language - from subtle statements to bold declarations of who you are.',
    trustSignals: [
      { icon: '⚡', text: 'Unlimited Customization', variant: 'accent' },
      { icon: '💎', text: 'Premium Quality', variant: 'accent' }
    ]
  },
  {
    icon: '♻️',
    headline: 'Planet-Positive Luxury',
    description: 'True luxury means caring about tomorrow. Our sustainable practices and recycled metals prove that conscious choices can be absolutely stunning.',
    trustSignals: [
      { icon: '🌍', text: 'Carbon Neutral', variant: 'accent' },
      { icon: '♻️', text: 'Recycled Metals', variant: 'accent' }
    ]
  }
]

export function ValuePropositionSection({
  className,
  spacing,
  layout,
  columns,
  alignment,
  style,
  emphasis,
  headline = 'Luxury That Aligns With Your Values',
  description = 'We believe true luxury comes from knowing your choices make a positive impact. Every piece is crafted with ethical sourcing, sustainable practices, and the freedom to express your authentic self.',
  valueProps = defaultValueProps,
  showTrustSignals = true,
  iconSize = 'md',
  iconStyle = 'accent',
  ...props
}: ValuePropositionSectionProps) {
  return (
    <section
      className={cn(valuePropositionVariants({ spacing, layout }), className)}
      {...props}
    >
      {/* Section Header */}
      <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
        <H2 
          id="value-proposition-heading"
          className="mb-4 lg:mb-6"
        >
          {headline}
        </H2>
        <BodyText 
          size="lg" 
          className="text-foreground max-w-3xl mx-auto"
        >
          {description}
        </BodyText>
      </div>

      {/* Value Propositions Grid */}
      <div className={cn(gridVariants({ columns, alignment }))}>
        {valueProps.map((prop, index) => (
          <article 
            key={index}
            className={cn(valueCardVariants({ style, emphasis }))}
          >
            {/* Icon */}
            <div className={cn(
              iconVariants({ size: iconSize, style: iconStyle }),
              alignment === 'center' ? 'mx-auto' : ''
            )}>
              <span className={cn(
                iconSize === 'sm' ? 'text-lg' : 
                iconSize === 'md' ? 'text-xl' : 'text-2xl'
              )}>
                {prop.icon}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <H3 
                id={`value-prop-${index}-heading`}
                className="text-foreground"
              >
                {prop.headline}
              </H3>
              <BodyText className="text-foreground leading-relaxed">
                {prop.description}
              </BodyText>
            </div>

            {/* Trust Signals */}
            {showTrustSignals && prop.trustSignals && (
              <div className="flex flex-wrap gap-2 pt-2">
                {prop.trustSignals.map((signal, signalIndex) => (
                  <div 
                    key={signalIndex}
                    className={cn(trustSignalVariants({ variant: signal.variant }))}
                  >
                    <span>
                      {signal.icon}
                    </span>
                    <MutedText size="sm" className="font-medium">
                      {signal.text}
                    </MutedText>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Additional Trust Signals Row */}
      {showTrustSignals && (
        <div className="mt-12 lg:mt-16 text-center">
          <MutedText className="mb-6 block">
            Join thousands who choose conscious luxury
          </MutedText>
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
            <div className={cn(trustSignalVariants({ variant: 'accent' }))}>
              <span>🌱</span>
              <span className="font-semibold">100% Conflict-Free</span>
            </div>
            <div className={cn(trustSignalVariants({ variant: 'accent' }))}>
              <span>♻️</span>
              <span className="font-semibold">Recycled Metal</span>
            </div>
            <div className={cn(trustSignalVariants({ variant: 'accent' }))}>
              <span>🔬</span>
              <span className="font-semibold">Lab-Grown Certified</span>
            </div>
            <div className={cn(trustSignalVariants({ variant: 'accent' }))}>
              <span>🌍</span>
              <span className="font-semibold">Carbon Neutral</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Enhancement */}
      <div className="sr-only">
        <h3>Our Core Values Summary</h3>
        <p>
          GlowGlitch is committed to ethical sourcing with 100% conflict-free diamonds, 
          unlimited customization for personal expression, and sustainable practices 
          including recycled metals and carbon-neutral operations. We believe luxury 
          should align with your values and make a positive impact on the world.
        </p>
      </div>
    </section>
  )
}

export type ValuePropositionVariant = VariantProps<typeof valuePropositionVariants>
export type ValuePropositionGridVariant = VariantProps<typeof gridVariants>
export type ValuePropositionCardVariant = VariantProps<typeof valueCardVariants>