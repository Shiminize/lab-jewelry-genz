import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Container } from '../layout/Container'
import { 
  DEFAULT_SUSTAINABILITY_CONTENT,
  IMPACT_METRICS,
  PROCESS_STEPS,
  CERTIFICATIONS,
  COMPARISON_DATA,
  COMMUNITY_STATS,
  ACCESSIBILITY_SUMMARY,
  type SustainabilityContent
} from '../../data/sustainabilityData'

// Extracted components
import { SustainabilityHero } from './sustainability/SustainabilityHero'
import { ImpactMetricsGrid } from './sustainability/ImpactMetricsGrid'
import { ComparisonTable } from './sustainability/ComparisonTable'
import { ProcessTimeline } from './sustainability/ProcessTimeline'
import { CertificationBadges } from './sustainability/CertificationBadges'
import { CommunityImpact } from './sustainability/CommunityImpact'

// Aurora-compliant container variants
const sustainabilityVariants = cva(
  'bg-background',
  {
    variants: {
      spacing: {
        comfortable: 'py-token-4xl sm:py-token-5xl lg:py-token-6xl',
        compact: 'py-token-3xl sm:py-token-4xl lg:py-token-5xl',
        spacious: 'py-token-5xl sm:py-token-6xl lg:py-token-8xl'
      },
      layout: {
        default: 'px-token-md sm:px-token-lg lg:px-token-xl',
        wide: 'px-token-lg sm:px-token-xl lg:px-token-3xl',
        contained: 'px-token-md sm:px-token-lg lg:px-token-xl'
      }
    },
    defaultVariants: {
      spacing: 'comfortable',
      layout: 'contained'
    }
  }
)



interface SustainabilityStorySectionProps 
  extends Omit<React.HTMLAttributes<HTMLElement>, 'content'>,
    VariantProps<typeof sustainabilityVariants> {
  /** Content configuration */
  content?: SustainabilityContent
  /** Show comparison section */
  showComparison?: boolean
  /** Show process section */
  showProcess?: boolean
  /** Show metrics section */
  showMetrics?: boolean
  /** Show certifications */
  showCertifications?: boolean
  /** Show community impact */
  showCommunity?: boolean
  /** Show hero section */
  showHero?: boolean
}

export function SustainabilityStorySection({
  className,
  spacing,
  layout,
  content = DEFAULT_SUSTAINABILITY_CONTENT,
  showComparison = true,
  showProcess = true,
  showMetrics = true,
  showCertifications = true,
  showCommunity = true,
  showHero = true,
  ...props
}: SustainabilityStorySectionProps) {
  return (
    <section
      className={cn(sustainabilityVariants({ spacing, layout: layout === 'contained' ? 'default' : layout }), className)}
      {...props}
    >
      <Container maxWidth="default">
      {/* Hero Section */}
      {showHero && (
        <SustainabilityHero 
          content={content}
          className="mb-token-4xl"
        />
      )}

      {/* Impact Metrics Section */}
      {showMetrics && (
        <ImpactMetricsGrid 
          metrics={IMPACT_METRICS}
          className="mb-token-4xl"
        />
      )}

      {/* Lab-Grown vs Traditional Comparison */}
      {showComparison && (
        <ComparisonTable 
          comparisons={COMPARISON_DATA}
          className="mb-token-4xl"
        />
      )}

      {/* Lab Diamond Creation Process */}
      {showProcess && (
        <ProcessTimeline 
          steps={PROCESS_STEPS}
          className="mb-token-4xl"
        />
      )}

      {/* Certifications & Partnerships */}
      {showCertifications && (
        <CertificationBadges 
          certifications={CERTIFICATIONS}
          className="mb-token-4xl"
        />
      )}

      {/* Community Impact Section */}
      {showCommunity && (
        <CommunityImpact 
          stats={COMMUNITY_STATS}
        />
      )}

      {/* Screen Reader Enhancement */}
      <div className="sr-only">
        <h3>{ACCESSIBILITY_SUMMARY.title}</h3>
        <p>{ACCESSIBILITY_SUMMARY.content}</p>
      </div>
      </Container>
    </section>
  )
}

export type SustainabilityStoryVariant = VariantProps<typeof sustainabilityVariants>