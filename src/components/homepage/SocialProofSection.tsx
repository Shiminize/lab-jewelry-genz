'use client'

import React, { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { H2, BodyText, AuroraStatement, AuroraBodyL } from '@/components/foundation/Typography'
import { ChevronLeft } from 'lucide-react'
import { TestimonialCard } from './testimonials/TestimonialCard'
import { CreatorProgramHighlight } from './social-proof/CreatorProgramHighlight'
import { TrustSignalsGrid } from './social-proof/TrustSignalsGrid'
import { Container } from '../layout/Container'
import { TESTIMONIALS_DATA, CREATOR_STATS, TRUST_SIGNALS } from './social-proof/socialProofData'

/**
 * Social Proof Section - Aurora Design System Compliant
 * Orchestrates testimonials, trust signals, and creator program highlight
 * CLAUDE_RULES compliant: <200 lines with component extraction
 */

// Aurora-compliant CVA variants
const socialProofVariants = cva(
  'w-full',
  {
    variants: {
      layout: {
        default: 'space-y-token-4xl',        // 5rem (was space-y-16) - Claude4.1 compliant
        compact: 'space-y-token-3xl',        // 4rem (was space-y-12)
        expanded: 'space-y-token-5xl'        // 6rem (was space-y-token-sm0 - TYPO FIXED)
      },
      background: {
        default: 'bg-background',
        muted: 'bg-muted/30',
        accent: 'bg-gray-50'
      }
    },
    defaultVariants: {
      layout: 'default',
      background: 'default'
    }
  }
)

interface SocialProofSectionProps extends VariantProps<typeof socialProofVariants> {
  className?: string
}

const SocialProofSection: React.FC<SocialProofSectionProps> = ({
  layout,
  background,
  className
}) => {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  const [visibleTestimonials, setVisibleTestimonials] = useState(6)

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === TESTIMONIALS_DATA.length - 1 ? 0 : prev + 1
    )
  }

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === 0 ? TESTIMONIALS_DATA.length - 1 : prev - 1
    )
  }

  return (
    <section 
      className={socialProofVariants({ layout, background, className })}
    >
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <AuroraStatement id="social-proof-heading" className="mb-4 aurora-gradient-text animate-aurora-glow-pulse">
            Loved by Thousands, Trusted by Creators
          </AuroraStatement>
          <AuroraBodyL className="text-deep-space">
            Join a community that values authenticity, sustainability, and self-expression. 
            Our customers and creator partners are building something beautiful together.
          </AuroraBodyL>
        </div>

        {/* Trust Signals Grid */}
        <TrustSignalsGrid signals={TRUST_SIGNALS} />

        {/* Creator Program Highlight */}
        <CreatorProgramHighlight stats={CREATOR_STATS} />

        {/* Testimonials Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <AuroraStatement className="text-deep-space">What Our Community Says</AuroraStatement>
            <div className="flex items-center gap-token-sm">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-token-md border border-aurora-pink/20 hover:bg-nebula-purple/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shadow-aurora-md hover:shadow-aurora-lg"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4 text-aurora-pink" />
              </button>
              <button
                onClick={nextTestimonial}
                className="p-3 rounded-token-md border border-aurora-pink/20 hover:bg-nebula-purple/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shadow-aurora-md hover:shadow-aurora-lg"
                aria-label="Next testimonial"
              >
                <span className="text-sm font-bold text-aurora-pink">→</span>
              </button>
            </div>
          </div>

          {/* Featured Testimonial */}
          <div className="mb-8">
            <TestimonialCard testimonial={TESTIMONIALS_DATA[currentTestimonialIndex]} />
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-token-lg">
            {TESTIMONIALS_DATA.slice(0, visibleTestimonials).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>

          {visibleTestimonials < TESTIMONIALS_DATA.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleTestimonials(prev => prev + 3)}
                className="border border-aurora-pink/20 px-token-lg py-token-md rounded-token-md font-semibold hover:bg-nebula-purple/10 transition-colors shadow-aurora-md hover:shadow-aurora-lg text-deep-space animate-aurora-float"
                aria-label="Load more testimonials"
              >
                Load More Reviews
              </button>
            </div>
          )}
        </div>

        {/* Community CTA */}
        <div className="text-center bg-nebula-purple/5 p-8 rounded-token-md shadow-aurora-lg">
          <AuroraStatement className="mb-4 aurora-gradient-text animate-aurora-glow-pulse">Ready to Join Our Community?</AuroraStatement>
          <AuroraBodyL className="mb-6 max-w-2xl mx-auto text-deep-space">
            Whether you're looking for the perfect piece to express yourself or want to 
            become a creator partner, we'd love to have you in our community.
          </AuroraBodyL>
          <div className="flex flex-col sm:flex-row gap-token-md justify-center">
            <button 
              className="bg-nebula-purple text-white px-token-lg py-token-md rounded-token-md font-semibold hover:opacity-90 transition-opacity shadow-aurora-md hover:shadow-aurora-lg animate-aurora-float"
              aria-label="Shop jewelry collection"
            >
              Shop Now
            </button>
            <button 
              className="border border-aurora-pink/20 px-token-lg py-token-md rounded-token-md font-semibold hover:bg-nebula-purple/10 transition-colors shadow-aurora-md hover:shadow-aurora-lg text-deep-space"
              aria-label="Leave product review"
            >
              Leave a Review
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default SocialProofSection