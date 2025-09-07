'use client'

import React, { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { H2, BodyText } from '@/components/foundation/Typography'
import { ChevronLeft } from 'lucide-react'
import { TestimonialCard } from './testimonials/TestimonialCard'
import { CreatorProgramHighlight } from './social-proof/CreatorProgramHighlight'
import { TrustSignalsGrid } from './social-proof/TrustSignalsGrid'
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
        default: 'space-y-16',
        compact: 'space-y-12',
        expanded: 'space-y-token-sm0'
      },
      background: {
        default: 'bg-background',
        muted: 'bg-muted/30',
        accent: 'bg-accent/5'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <H2 id="social-proof-heading" className="mb-4">
            Loved by Thousands, Trusted by Creators
          </H2>
          <BodyText className="text-lg text-foreground">
            Join a community that values authenticity, sustainability, and self-expression. 
            Our customers and creator partners are building something beautiful together.
          </BodyText>
        </div>

        {/* Trust Signals Grid */}
        <TrustSignalsGrid signals={TRUST_SIGNALS} />

        {/* Creator Program Highlight */}
        <CreatorProgramHighlight stats={CREATOR_STATS} />

        {/* Testimonials Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <H2>What Our Community Says</H2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-token-md border border-border hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextTestimonial}
                className="p-3 rounded-token-md border border-border hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Next testimonial"
              >
                <span className="text-sm font-bold">→</span>
              </button>
            </div>
          </div>

          {/* Featured Testimonial */}
          <div className="mb-8">
            <TestimonialCard testimonial={TESTIMONIALS_DATA[currentTestimonialIndex]} />
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS_DATA.slice(0, visibleTestimonials).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>

          {visibleTestimonials < TESTIMONIALS_DATA.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleTestimonials(prev => prev + 3)}
                className="border border-border px-6 py-3 rounded-token-md font-semibold hover:bg-muted transition-colors"
                aria-label="Load more testimonials"
              >
                Load More Reviews
              </button>
            </div>
          )}
        </div>

        {/* Community CTA */}
        <div className="text-center bg-accent/10 p-8 border border-accent/20 rounded-token-md">
          <H2 className="mb-4">Ready to Join Our Community?</H2>
          <BodyText className="mb-6 max-w-2xl mx-auto">
            Whether you're looking for the perfect piece to express yourself or want to 
            become a creator partner, we'd love to have you in our community.
          </BodyText>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-foreground text-background px-6 py-3 rounded-token-md font-semibold hover:opacity-90 transition-opacity"
              aria-label="Shop jewelry collection"
            >
              Shop Now
            </button>
            <button 
              className="border border-border px-6 py-3 rounded-token-md font-semibold hover:bg-muted transition-colors"
              aria-label="Leave product review"
            >
              Leave a Review
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SocialProofSection