'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { BodyText, MutedText } from '@/components/foundation/Typography'
import { Star, Shield } from 'lucide-react'
import type { Testimonial } from '../social-proof/socialProofData'

// Aurora-compliant testimonial card variants
const testimonialCardVariants = cva(
  'border transition-all duration-300 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--nebula-purple)_8%,transparent)]',
  {
    variants: {
      size: {
        default: 'p-6',
        compact: 'p-4',
        large: 'p-8'
      },
      style: {
        default: 'bg-background border-border',
        elevated: 'bg-background border-border shadow-[0_4px_12px_color-mix(in_srgb,var(--nebula-purple)_4%,transparent)]',
        minimal: 'bg-muted/20 border-transparent'
      }
    },
    defaultVariants: {
      size: 'default',
      style: 'elevated'
    }
  }
)

interface TestimonialCardProps {
  testimonial: Testimonial
  size?: 'default' | 'compact' | 'large'
  style?: 'default' | 'elevated' | 'minimal'
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-accent text-accent' : 'text-foreground'
        }`}
      />
    ))}
  </div>
)

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial, 
  size = 'default',
  style = 'elevated'
}) => (
  <div className={testimonialCardVariants({ size, style })}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent/30 to-accent/60 flex items-center justify-center text-background font-semibold">
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <BodyText className="font-semibold">{testimonial.name}</BodyText>
            {testimonial.verified && (
              <Shield className="w-4 h-4 text-accent" />
            )}
          </div>
          <MutedText className="text-sm">
            {testimonial.age} • {testimonial.location}
          </MutedText>
        </div>
      </div>
      <StarRating rating={testimonial.rating} />
    </div>
    
    <BodyText className="mb-4 leading-relaxed">{testimonial.content}</BodyText>
    
    <div className="flex items-center justify-between">
      <div>
        <MutedText className="text-sm font-medium">{testimonial.productType}</MutedText>
        <MutedText className="text-xs">{testimonial.occasion}</MutedText>
      </div>
      {testimonial.social && (
        <MutedText className="text-sm text-accent">{testimonial.social}</MutedText>
      )}
    </div>
  </div>
)