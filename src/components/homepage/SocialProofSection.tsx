'use client'

import React, { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Star, ChevronLeft, Award, Shield, Truck, Heart, Users, TrendingUp } from 'lucide-react'

// Interfaces for data types
interface Testimonial {
  id: string
  name: string
  age: number
  location: string
  rating: number
  content: string
  productType: string
  occasion: string
  image?: string
  verified: boolean
  social?: string
}

interface CreatorStats {
  totalCreators: number
  averageEarnings: string
  topCreatorEarnings: string
  commissionRate: number
}

interface TrustSignal {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  stat?: string
}

// Sample testimonial data with authentic Gen Z/Millennial content
const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maya Chen',
    age: 24,
    location: 'Seattle, WA',
    rating: 5,
    content: "Finally found a jewelry brand that gets it! My custom nose ring is literally perfection and knowing it's conflict-free makes me feel even better about wearing it. The whole experience was so transparent and the quality is unmatched.",
    productType: 'Custom Nose Ring',
    occasion: 'Self-expression',
    verified: true,
    social: '@mayavibes'
  },
  {
    id: '2',
    name: 'Jordan Martinez',
    age: 26,
    location: 'Austin, TX',
    rating: 5,
    content: "Proposed with a GlowGlitch ring and it was absolutely magical! The customization process was so easy and my partner was obsessed with the ethical sourcing story. Worth every penny and the lifetime warranty gives us peace of mind.",
    productType: 'Engagement Ring',
    occasion: 'Proposal',
    verified: true,
    social: '@jordan_creates'
  },
  {
    id: '3',
    name: 'Zara Okafor',
    age: 22,
    location: 'Brooklyn, NY',
    rating: 5,
    content: "Been wearing my septum clicker for 6 months and still obsessed! Love that the company is carbon neutral - it aligns with my values. Customer service is also incredible, they actually care about getting it right.",
    productType: 'Septum Clicker',
    occasion: 'Everyday wear',
    verified: true,
    social: '@zarastyle'
  },
  {
    id: '4',
    name: 'Alex Thompson',
    age: 28,
    location: 'Portland, OR',
    rating: 4,
    content: "The ear stack I designed is everything! Process was super intuitive and I love how they show exactly where materials come from. Shipping was fast and packaging was minimal but protective - no unnecessary waste!",
    productType: 'Ear Stack Set',
    occasion: 'Personal style',
    verified: true,
    social: '@alexpiercings'
  },
  {
    id: '5',
    name: 'Riley Park',
    age: 25,
    location: 'Los Angeles, CA',
    rating: 5,
    content: "As someone with sensitive skin, finding body jewelry that doesn't irritate is crucial. These pieces are hypoallergenic AND gorgeous. The fact that 30% goes to creators is amazing - supporting the community!",
    productType: 'Body Jewelry Set',
    occasion: 'Sensitive skin',
    verified: true,
    social: '@rileysstyle'
  },
  {
    id: '6',
    name: 'Sam Rodriguez',
    age: 23,
    location: 'Chicago, IL',
    rating: 5,
    content: "My industrial piercing jewelry is chef's kiss! Love that I could see 3D previews before ordering. The sustainability report they sent with my order really shows they're not just greenwashing - they're the real deal.",
    productType: 'Industrial Barbell',
    occasion: 'New piercing',
    verified: true,
    social: '@sammypierce'
  }
]

// Creator program stats
const creatorStats: CreatorStats = {
  totalCreators: 1200,
  averageEarnings: '$850',
  topCreatorEarnings: '$12K',
  commissionRate: 30
}

// Trust signals data
const trustSignals: TrustSignal[] = [
  {
    icon: Users,
    title: '10,000+ Happy Customers',
    description: 'Join our growing community',
    stat: '4.8/5 avg rating'
  },
  {
    icon: Shield,
    title: 'Lifetime Warranty',
    description: 'Free repairs & replacements',
    stat: 'Forever protected'
  },
  {
    icon: Heart,
    title: 'Conflict-Free Certified',
    description: 'Ethically sourced materials',
    stat: '100% traceable'
  },
  {
    icon: Truck,
    title: 'Carbon Neutral Shipping',
    description: 'Eco-friendly delivery',
    stat: 'Zero emissions'
  },
  {
    icon: Award,
    title: '30-Day Returns',
    description: 'No questions asked',
    stat: '98% satisfaction'
  },
  {
    icon: TrendingUp,
    title: '30% Creator Commission',
    description: 'Industry-leading rates',
    stat: 'Avg $850/month'
  }
]

// CVA variants for the component
const socialProofVariants = cva(
  'w-full',
  {
    variants: {
      layout: {
        default: 'space-y-16',
        compact: 'space-y-12',
        expanded: 'space-y-20'
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

// Testimonial card variants
const testimonialCardVariants = cva(
  'border transition-all duration-300 hover:shadow-lg',
  {
    variants: {
      size: {
        default: 'p-6',
        compact: 'p-4',
        large: 'p-8'
      },
      style: {
        default: 'bg-background border-border',
        elevated: 'bg-background border-border shadow-sm',
        minimal: 'bg-muted/20 border-transparent'
      }
    },
    defaultVariants: {
      size: 'default',
      style: 'elevated'
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
      prev === testimonials.length - 1 ? 0 : prev + 1
    )
  }

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
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

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <div className={testimonialCardVariants()}>
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {trustSignals.map((signal, index) => (
          <div 
            key={index}
            className="text-center p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-center mb-2">
              <signal.icon className="w-8 h-8 text-accent" />
            </div>
            <H3 className="text-sm font-semibold mb-1">{signal.title}</H3>
            <MutedText className="text-xs mb-1">{signal.description}</MutedText>
            {signal.stat && (
              <MutedText className="text-xs font-medium text-accent">{signal.stat}</MutedText>
            )}
          </div>
        ))}
      </div>

      {/* Creator Program Highlight */}
      <div className="bg-gradient-to-r from-accent/5 to-accent/10 p-8 border border-accent/20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <H2 className="mb-4 text-foreground">Join Our Creator Community</H2>
            <BodyText className="mb-6 text-foreground">
              Earn industry-leading {creatorStats.commissionRate}% commission while promoting 
              jewelry that aligns with your values. Our {creatorStats.totalCreators}+ creators 
              average {creatorStats.averageEarnings} monthly.
            </BodyText>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-background rounded-lg">
                <H3 className="text-2xl font-bold text-accent">{creatorStats.commissionRate}%</H3>
                <MutedText className="text-sm">Commission Rate</MutedText>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <H3 className="text-2xl font-bold text-accent">{creatorStats.averageEarnings}</H3>
                <MutedText className="text-sm">Avg Monthly</MutedText>
              </div>
            </div>
            <button 
              className="bg-cta text-background px-6 py-3 rounded-lg font-semibold hover:bg-cta/90 transition-colors"
            >
              Apply Now
            </button>
          </div>
          <div className="space-y-4">
            <H3 className="text-foreground">Creator Benefits</H3>
            <ul className="space-y-2">
              {[
                'Exclusive early access to new designs',
                'Personal analytics dashboard',
                'Dedicated creator support team',
                'Monthly creator spotlights',
                'Custom discount codes for followers'
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-foreground">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <BodyText className="text-sm">{benefit}</BodyText>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <H2>What Our Community Says</H2>
          <div className="flex items-center gap-2">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full border border-border hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full border border-border hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <span className="text-sm font-bold">→</span>
            </button>
          </div>
        </div>

        {/* Featured Testimonial */}
        <div className="mb-8">
          <TestimonialCard testimonial={testimonials[currentTestimonialIndex]} />
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, visibleTestimonials).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {visibleTestimonials < testimonials.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleTestimonials(prev => prev + 3)}
              className="border border-border px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Load More Reviews
            </button>
          </div>
        )}
      </div>

      {/* Community CTA */}
      <div className="text-center bg-accent/10 p-8 border border-accent/20">
        <H2 className="mb-4">Ready to Join Our Community?</H2>
        <BodyText className="mb-6 max-w-2xl mx-auto">
          Whether you're looking for the perfect piece to express yourself or want to 
          become a creator partner, we'd love to have you in our community.
        </BodyText>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-foreground text-background px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Shop Now
          </button>
          <button className="border border-border px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors">
            Leave a Review
          </button>
        </div>
      </div>
      </div>
    </section>
  )
}

export default SocialProofSection