'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'

// Component variants following design system
const sustainabilityVariants = cva(
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

const heroGradientVariants = cva(
  'relative overflow-hidden p-8 lg:p-12',
  {
    variants: {
      style: {
        default: 'bg-gradient-to-br from-accent/10 via-background to-accent/5',
        subtle: 'bg-muted/30',
        vibrant: 'bg-gradient-to-br from-accent/20 via-background to-accent/10'
      }
    },
    defaultVariants: {
      style: 'default'
    }
  }
)

const comparisonCardVariants = cva(
  'relative p-6 lg:p-8',
  {
    variants: {
      type: {
        traditional: 'bg-muted/20 border border-muted/40',
        labgrown: 'bg-accent/10 border border-accent/30'
      }
    }
  }
)

const metricCardVariants = cva(
  'group relative p-6 transition-all duration-300',
  {
    variants: {
      style: {
        default: 'bg-muted/30 hover:bg-muted/40',
        accent: 'bg-accent/10 hover:bg-accent/15',
        gradient: 'bg-gradient-to-br from-accent/10 to-muted/20 hover:from-accent/15 hover:to-muted/30'
      },
      emphasis: {
        none: '',
        hover: 'hover:scale-[1.02] hover:shadow-lg'
      }
    },
    defaultVariants: {
      style: 'default',
      emphasis: 'hover'
    }
  }
)

const processStepVariants = cva(
  'relative flex flex-col items-center text-center space-y-4',
  {
    variants: {
      connector: {
        none: '',
        arrow: 'after:absolute after:top-12 after:-right-4 lg:after:-right-8 after:content-["→"] after:text-accent after:text-2xl after:hidden lg:after:block last:after:hidden'
      }
    },
    defaultVariants: {
      connector: 'arrow'
    }
  }
)

const certificationBadgeVariants = cva(
  'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
  {
    variants: {
      variant: {
        verified: 'bg-accent/20 text-accent',
        certified: 'bg-accent/10 text-accent',
        partner: 'bg-muted/30 text-foreground'
      }
    },
    defaultVariants: {
      variant: 'certified'
    }
  }
)

// Data structures
interface ImpactMetric {
  icon: string
  value: string
  label: string
  description: string
  comparison?: string
}

interface ProcessStep {
  icon: string
  title: string
  description: string
}

interface Certification {
  icon: string
  name: string
  description: string
  variant?: 'verified' | 'certified' | 'partner'
}

interface ComparisonPoint {
  aspect: string
  traditional: string
  labGrown: string
  impact: 'negative' | 'positive' | 'neutral'
}

// Default data
const impactMetrics: ImpactMetric[] = [
  {
    icon: '🌱',
    value: '95%',
    label: 'Less Environmental Impact',
    description: 'Compared to traditional diamond mining',
    comparison: 'vs. mined diamonds'
  },
  {
    icon: '💧',
    value: '0',
    label: 'Water Pollution',
    description: 'Zero contamination from mining operations',
    comparison: 'mining causes 100+ toxic spills yearly'
  },
  {
    icon: '⚡',
    value: '100%',
    label: 'Renewable Energy',
    description: 'All our lab facilities powered by clean energy',
    comparison: 'traditional mining: <10% renewable'
  },
  {
    icon: '♻️',
    value: '80%',
    label: 'Recycled Metals',
    description: 'Precious metals given new life in our settings',
    comparison: '2x industry average'
  },
  {
    icon: '🚚',
    value: '100%',
    label: 'Carbon Neutral Shipping',
    description: 'Offset all emissions from production to your door',
    comparison: 'industry first commitment'
  },
  {
    icon: '🌍',
    value: '0.07',
    label: 'Carats per Ton of Earth',
    description: 'Lab creation vs mining displacement',
    comparison: 'mining: removes 250 tons per carat'
  }
]

const processSteps: ProcessStep[] = [
  {
    icon: '🔬',
    title: 'Carbon Seed Placement',
    description: 'A tiny diamond seed is placed in a specialized chamber with precise carbon composition'
  },
  {
    icon: '🔥',
    title: 'High Pressure & Heat',
    description: 'Conditions mirror deep Earth: 2,000°F temperature and 1.5 million PSI pressure'
  },
  {
    icon: '⏱️',
    title: '2-4 Week Growth',
    description: 'Carbon atoms crystallize layer by layer, forming identical atomic structure to mined diamonds'
  },
  {
    icon: '💎',
    title: 'Cut & Polish',
    description: 'Master craftsmen cut and polish each diamond to reveal its maximum brilliance and fire'
  }
]

const certifications: Certification[] = [
  {
    icon: '🔬',
    name: 'IGI Certified',
    description: 'International Gemological Institute authentication',
    variant: 'certified'
  },
  {
    icon: '✅',
    name: 'SCS Global Verified',
    description: 'Third-party sustainability certification',
    variant: 'verified'
  },
  {
    icon: '🤝',
    name: 'Responsible Jewelry Council',
    description: 'Industry-leading ethical standards member',
    variant: 'partner'
  },
  {
    icon: '🌱',
    name: 'Carbon Trust Certified',
    description: 'Carbon footprint measurement and reduction verified',
    variant: 'verified'
  }
]

const comparisonData: ComparisonPoint[] = [
  {
    aspect: 'Environmental Impact',
    traditional: 'Massive land disruption, habitat destruction',
    labGrown: 'Minimal footprint, controlled environment',
    impact: 'positive'
  },
  {
    aspect: 'Water Usage',
    traditional: '126+ gallons per carat',
    labGrown: '<1 gallon per carat',
    impact: 'positive'
  },
  {
    aspect: 'Carbon Emissions',
    traditional: '125+ lbs CO₂ per carat',
    labGrown: '6 lbs CO₂ per carat (offset to zero)',
    impact: 'positive'
  },
  {
    aspect: 'Human Impact',
    traditional: 'Potential conflict sourcing, dangerous working conditions',
    labGrown: 'Safe, ethical working conditions, living wages',
    impact: 'positive'
  },
  {
    aspect: 'Quality & Beauty',
    traditional: 'Identical chemical & optical properties',
    labGrown: 'Identical chemical & optical properties',
    impact: 'neutral'
  },
  {
    aspect: 'Value & Pricing',
    traditional: 'Higher cost due to mining complexity',
    labGrown: '30-40% better value for equivalent quality',
    impact: 'positive'
  }
]

interface SustainabilityStorySectionProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sustainabilityVariants>,
    VariantProps<typeof heroGradientVariants> {
  /** Main section headline */
  headline?: string
  /** Section description/subtitle */
  description?: string
  /** Show comparison section */
  showComparison?: boolean
  /** Show process section */
  showProcess?: boolean
  /** Show metrics section */
  showMetrics?: boolean
  /** Show certifications */
  showCertifications?: boolean
  /** Custom impact metrics */
  customMetrics?: ImpactMetric[]
  /** CTA button text */
  ctaText?: string
  /** CTA button href */
  ctaHref?: string
  /** Secondary CTA text */
  secondaryCtaText?: string
  /** Secondary CTA href */
  secondaryCtaHref?: string
}

export function SustainabilityStorySection({
  className,
  spacing,
  layout,
  style,
  headline = 'The Future of Luxury is Sustainable',
  description = "We're redefining what luxury means for your generation. Every piece tells a story of innovation, responsibility, and conscious choices that create positive impact for our planet and communities.",
  showComparison = true,
  showProcess = true,
  showMetrics = true,
  showCertifications = true,
  customMetrics = impactMetrics,
  ctaText = 'Explore Our Sustainability Commitment',
  ctaHref = '/sustainability',
  secondaryCtaText = 'Choose Your Sustainable Piece',
  secondaryCtaHref = '/catalog',
  ...props
}: SustainabilityStorySectionProps) {
  return (
    <section
      className={cn(sustainabilityVariants({ spacing, layout }), className)}
      {...props}
    >
      {/* Hero Section */}
      <div className={cn(heroGradientVariants({ style }))}>
        <div className="text-center max-w-4xl mx-auto">
          <H2 
            id="sustainability-heading"
            className="mb-6"
          >
            {headline}
          </H2>
          <BodyText 
            size="lg" 
            className="text-foreground mb-8 leading-relaxed"
          >
            {description}
          </BodyText>
          
          {/* Key Message */}
          <div className="bg-background/50 backdrop-blur-sm p-6 mb-8">
            <BodyText 
              weight="medium" 
              className="text-foreground"
            >
              💎 Lab-grown diamonds: Same atomic structure, same beauty, zero compromise.{' '}
              <span className="text-accent font-semibold">
                95% less environmental impact.
              </span>
            </BodyText>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = ctaHref}
            >
              {ctaText}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = secondaryCtaHref}
            >
              {secondaryCtaText}
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <span className="text-6xl">🌱</span>
        </div>
        <div className="absolute bottom-4 left-4 opacity-20">
          <span className="text-4xl">♻️</span>
        </div>
      </div>

      {/* Impact Metrics Section */}
      {showMetrics && (
        <div className="mt-16 lg:mt-20">
          <div className="text-center mb-12">
            <H3 className="mb-4">Real Impact, Real Numbers</H3>
            <BodyText className="text-foreground max-w-2xl mx-auto">
              Transparency matters. Here's exactly how choosing lab-grown diamonds 
              creates positive change for our planet and future generations.
            </BodyText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customMetrics.map((metric, index) => (
              <div 
                key={index}
                className={cn(metricCardVariants())}
              >
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-3">
                    {metric.icon}
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl lg:text-4xl font-bold text-accent">
                      {metric.value}
                    </div>
                    <H3 className="text-lg font-semibold text-foreground">
                      {metric.label}
                    </H3>
                    <BodyText 
                      size="sm" 
                      className="text-foreground leading-relaxed"
                    >
                      {metric.description}
                    </BodyText>
                    {metric.comparison && (
                      <MutedText 
                        size="sm" 
                        className="italic border-t border-muted pt-2"
                      >
                        {metric.comparison}
                      </MutedText>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab-Grown vs Traditional Comparison */}
      {showComparison && (
        <div className="mt-16 lg:mt-20">
          <div className="text-center mb-12">
            <H3 className="mb-4">Lab-Grown vs. Traditional Mining</H3>
            <BodyText className="text-foreground max-w-2xl mx-auto">
              Same diamonds, different story. See why lab-grown is the conscious 
              choice for the future-focused generation.
            </BodyText>
          </div>

          <div className="space-y-6">
            {comparisonData.map((item, index) => (
              <div 
                key={index}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center"
              >
                {/* Aspect */}
                <div className="text-center lg:text-left">
                  <H3 className="text-lg font-semibold text-foreground mb-2">
                    {item.aspect}
                  </H3>
                </div>

                {/* Traditional */}
                <div className={cn(comparisonCardVariants({ type: 'traditional' }))}>
                  <div className="flex items-start gap-3">
                    <span className="text-foreground text-xl flex-shrink-0">⚠️</span>
                    <div>
                      <MutedText size="sm" className="font-medium text-foreground mb-1">
                        Traditional Mining
                      </MutedText>
                      <BodyText size="sm" className="text-foreground">
                        {item.traditional}
                      </BodyText>
                    </div>
                  </div>
                </div>

                {/* Lab-Grown */}
                <div className={cn(comparisonCardVariants({ type: 'labgrown' }))}>
                  <div className="flex items-start gap-3">
                    <span className="text-accent text-xl flex-shrink-0">
                      {item.impact === 'positive' ? '✅' : item.impact === 'neutral' ? '⚖️' : '⚠️'}
                    </span>
                    <div>
                      <MutedText size="sm" className="font-medium text-accent mb-1">
                        Lab-Grown
                      </MutedText>
                      <BodyText size="sm" className="text-accent">
                        {item.labGrown}
                      </BodyText>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab Diamond Creation Process */}
      {showProcess && (
        <div className="mt-16 lg:mt-20">
          <div className="text-center mb-12">
            <H3 className="mb-4">How Lab-Grown Diamonds Are Created</H3>
            <BodyText className="text-foreground max-w-2xl mx-auto">
              Discover the fascinating science behind lab-grown diamond creation. 
              In just weeks, we recreate millions of years of natural formation.
            </BodyText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <div 
                key={index}
                className={cn(processStepVariants())}
              >
                <div className="w-20 h-20 mx-auto bg-accent/10 flex items-center justify-center text-3xl mb-4">
                  {step.icon}
                </div>
                <H3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </H3>
                <BodyText 
                  size="sm" 
                  className="text-foreground leading-relaxed"
                >
                  {step.description}
                </BodyText>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Partnerships */}
      {showCertifications && (
        <div className="mt-16 lg:mt-20">
          <div className="text-center mb-12">
            <H3 className="mb-4">Certified & Verified</H3>
            <BodyText className="text-foreground max-w-2xl mx-auto">
              Third-party verification you can trust. Our sustainability claims 
              are backed by industry-leading certifications and partnerships.
            </BodyText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div 
                key={index}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 mx-auto bg-background flex items-center justify-center text-3xl shadow-sm border border-muted">
                  {cert.icon}
                </div>
                <div className="space-y-2">
                  <div className={cn(certificationBadgeVariants({ variant: cert.variant }))}>
                    {cert.name}
                  </div>
                  <BodyText 
                    size="sm" 
                    className="text-foreground"
                  >
                    {cert.description}
                  </BodyText>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Impact Section */}
      <div className="mt-16 lg:mt-20">
        <div className="bg-gradient-to-r from-accent/5 to-accent/10 p-8 lg:p-12 text-center">
          <H3 className="mb-6 text-foreground">
            Join the Conscious Luxury Movement
          </H3>
          <BodyText 
            size="lg" 
            className="text-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Every purchase supports a future where luxury and responsibility go hand in hand. 
            You&apos;re not just buying jewelry—you&apos;re investing in a world where beautiful choices 
            create beautiful change.
          </BodyText>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <div className="text-2xl lg:text-3xl font-bold text-accent">50K+</div>
              <MutedText>Conscious consumers joined</MutedText>
            </div>
            <div className="space-y-2">
              <div className="text-2xl lg:text-3xl font-bold text-accent">2.5M</div>
              <MutedText>Tons of earth preserved</MutedText>
            </div>
            <div className="space-y-2">
              <div className="text-2xl lg:text-3xl font-bold text-accent">100%</div>
              <MutedText>Customer satisfaction</MutedText>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/catalog'}
            >
              Start Your Sustainable Journey
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => window.location.href = '/about'}
            >
              Learn More About Us
            </Button>
          </div>
        </div>
      </div>

      {/* Screen Reader Enhancement */}
      <div className="sr-only">
        <h3>Sustainability Story Summary</h3>
        <p>
          GlowGlitch creates lab-grown diamonds that are chemically, physically, and optically 
          identical to mined diamonds but with 95% less environmental impact. Our process uses 
          renewable energy, creates zero water pollution, and supports ethical working conditions. 
          Each diamond is certified by international gemological institutes and our sustainability 
          practices are verified by third-party organizations. We are committed to carbon-neutral 
          shipping and use 80% recycled metals in our jewelry settings.
        </p>
      </div>
    </section>
  )
}

export type SustainabilityStoryVariant = VariantProps<typeof sustainabilityVariants>
export type SustainabilityHeroVariant = VariantProps<typeof heroGradientVariants>