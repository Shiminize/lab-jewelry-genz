'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { H2, BodyText, MutedText, AuroraStatement, AuroraBodyL, AuroraSmall } from '../foundation/Typography'
import { Container } from '../layout/Container'
import { 
  EthicalSourcingIcon, 
  CustomVisionIcon, 
  PlanetPositiveIcon,
  ConflictFreeIcon,
  LabGrownIcon,
  RecycledMetalIcon,
  CarbonNeutralIcon,
  PremiumQualityIcon,
  UnlimitedCustomizationIcon
} from '../ui/ValuesIcons'

// Extracted components for Claude Rules compliance
import { ValueCard } from './enhanced-value-proposition/ValueCard'
import { MobileFlowIndicator } from './enhanced-value-proposition/MobileFlowIndicator'
import type { EnhancedValueProp } from '../../types/enhanced-value'

// Aurora-compliant section variants
const enhancedValueVariants = cva(
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

interface EnhancedValuePropositionProps extends React.HTMLAttributes<HTMLElement> {
  /** Main section headline */
  headline?: string
  /** Section description/subtitle */
  description?: string
  /** Custom value propositions */
  valueProps?: EnhancedValueProp[]
  /** Show trust signals section */
  showTrustSignals?: boolean
  /** Enable animation system */
  enableAnimation?: boolean
  /** Animation delay between cards */
  animationDelay?: number
  /** Mobile breakpoint for responsive behavior */
  mobileBreakpoint?: 'sm' | 'md' | 'lg'
  /** Enable interactive features */
  enableInteraction?: boolean
}

const defaultEnhancedValueProps: EnhancedValueProp[] = [
  {
    id: 'ethical-sourcing',
    icon: EthicalSourcingIcon,
    headline: 'Ethically Sourced & Conflict-Free',
    description: 'Every piece tells a story of responsibility. Our lab-grown diamonds and ethically sourced materials mean you can wear your values with pride, knowing your jewelry creates positive impact.',
    trustSignals: [
      { 
        icon: ConflictFreeIcon, 
        text: '100% Conflict-Free',
        description: 'Certified conflict-free diamonds from controlled laboratory environments'
      },
      { 
        icon: LabGrownIcon, 
        text: 'Lab-Grown Certified',
        description: 'IGI and GIA certified lab-grown diamonds with full traceability'
      }
    ],
    details: 'Our certification process includes third-party verification and complete supply chain transparency.'
  },
  {
    id: 'custom-vision',
    icon: CustomVisionIcon,
    headline: 'Your Vision, Your Voice',
    description: 'Self-expression shouldn\'t be limited by what\'s on the shelf. Design jewelry that speaks your language - from subtle statements to bold declarations of who you are.',
    trustSignals: [
      { 
        icon: UnlimitedCustomizationIcon, 
        text: 'Unlimited Customization',
        description: 'Complete design freedom with our advanced 3D modeling tools'
      },
      { 
        icon: PremiumQualityIcon, 
        text: 'Master-Crafted Luxury',
        description: 'Expert craftsmanship ensures every custom piece meets our luxury standards'
      }
    ],
    details: 'Work with our design team to create truly one-of-a-kind pieces that reflect your personal style.'
  },
  {
    id: 'planet-positive',
    icon: PlanetPositiveIcon,
    headline: 'Planet-Positive Luxury',
    description: 'True luxury means caring about tomorrow. Our sustainable practices and recycled metals prove that conscious choices can be absolutely stunning.',
    trustSignals: [
      { 
        icon: CarbonNeutralIcon, 
        text: 'Carbon Neutral',
        description: 'Offset all emissions from production to delivery'
      },
      { 
        icon: RecycledMetalIcon, 
        text: 'Recycled Metals',
        description: '80% recycled precious metals in all our jewelry settings'
      }
    ],
    details: 'Our environmental impact is 95% lower than traditional mining operations.'
  }
]

export function EnhancedValueProposition({
  className,
  headline = 'Luxury That Aligns With Your Values',
  description = 'We believe true luxury comes from knowing your choices make a positive impact. Every piece is crafted with ethical sourcing, sustainable practices, and the freedom to express your authentic self.',
  valueProps = defaultEnhancedValueProps,
  showTrustSignals = true,
  enableAnimation = true,
  animationDelay = 200,
  mobileBreakpoint = 'lg',
  enableInteraction = true,
  ...props
}: EnhancedValuePropositionProps) {
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [animatedCards, setAnimatedCards] = useState<Set<string>>(new Set())
  const [isInView, setIsInView] = useState(false)

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && enableAnimation) {
          setIsInView(true)
        }
      },
      { threshold: 0.2 }
    )

    const element = document.getElementById('enhanced-values-section')
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [enableAnimation])

  // Staggered animation for cards
  useEffect(() => {
    if (!isInView || !enableAnimation) return

    valueProps.forEach((prop, index) => {
      setTimeout(() => {
        setAnimatedCards(prev => new Set(Array.from(prev).concat(prop.id)))
      }, index * animationDelay)
    })
  }, [isInView, enableAnimation, animationDelay, valueProps])

  const handleCardInteraction = (cardId: string, type: 'enter' | 'leave') => {
    if (!enableInteraction) return
    
    if (type === 'enter') {
      setActiveCard(cardId)
    } else {
      setActiveCard(null)
    }
  }

  const handleKeyboardNavigation = (event: React.KeyboardEvent, cardId: string) => {
    if (!enableInteraction) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveCard(activeCard === cardId ? null : cardId)
    }
  }

  return (
    <section
      id="enhanced-values-section"
      className={cn(enhancedValueVariants({ spacing: 'comfortable', layout: 'default' }), className)}
      {...props}
    >
      <Container maxWidth="default">
      {/* Section Header */}
      <div className="text-center max-w-5xl mx-auto mb-16 lg:mb-20">
        {/* Aurora decorative accent line */}
        <div className="w-24 h-1 bg-aurora-pink mx-auto mb-6 rounded-full shadow-aurora-md animate-aurora-shimmer-slow" />
        
        <AuroraStatement 
          id="enhanced-values-heading"
          className="mb-6 lg:mb-8 aurora-gradient-text animate-aurora-glow-pulse"
        >
          {headline}
        </AuroraStatement>
        
        <AuroraBodyL 
          className="text-deep-space/80 max-w-4xl mx-auto"
        >
          {description}
        </AuroraBodyL>
        
        {/* Aurora subtle separator */}
        <div className="mt-8 lg:mt-12 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-aurora-pink rounded-full animate-aurora-sparkle shadow-aurora-md"></div>
            <div className="w-2 h-2 bg-aurora-pink rounded-full animate-aurora-sparkle shadow-aurora-md" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-aurora-pink rounded-full animate-aurora-sparkle shadow-aurora-md" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      {/* Value Propositions Grid */}
      <div 
        className={cn(
          'enhanced-values-grid grid gap-6 lg:gap-8',
          // Mobile: Single column with full width cards
          'grid-cols-1',
          // Tablet: Two columns, auto rows to prevent gaps
          'md:grid-cols-2',
          // Desktop: Three columns with equal spacing
          `${mobileBreakpoint}:grid-cols-3`,
          // Improved touch targets and spacing
          'px-2 md:px-0'
        )}
        role="tablist"
      >
        {valueProps.map((prop, index) => {
          const isAnimated = animatedCards.has(prop.id)
          const isActive = activeCard === prop.id
          const isDimmed = activeCard !== null && activeCard !== prop.id

          return (
            <ValueCard
              key={prop.id}
              prop={prop}
              index={index}
              isAnimated={isAnimated}
              isActive={isActive}
              isDimmed={isDimmed}
              animationDelay={animationDelay}
              enableAnimation={enableAnimation}
              enableInteraction={enableInteraction}
              mobileBreakpoint={mobileBreakpoint}
              onInteraction={handleCardInteraction}
              onKeyboardNavigation={handleKeyboardNavigation}
            />
          )
        })}
      </div>

      {/* Mobile Flow Indicators */}
      <MobileFlowIndicator 
        valueProps={valueProps} 
        mobileBreakpoint={mobileBreakpoint} 
      />

      {/* Global Trust Signals Section */}
      {showTrustSignals && (
        <div className="mt-16 lg:mt-20 text-center">
          <div className="bg-nebula-purple/5 rounded-xl p-6 lg:p-8 max-w-5xl mx-auto shadow-aurora-lg">
            <AuroraBodyL className="mb-6 block text-deep-space opacity-80">
              Join thousands who choose conscious luxury
            </AuroraBodyL>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {[
                { icon: ConflictFreeIcon, text: '100% Conflict-Free', subtitle: 'Certified diamonds' },
                { icon: RecycledMetalIcon, text: 'Recycled Metal', subtitle: '80% recycled content' },
                { icon: LabGrownIcon, text: 'Lab-Grown Certified', subtitle: 'IGI & GIA verified' },
                { icon: CarbonNeutralIcon, text: 'Carbon Neutral', subtitle: 'Offset emissions' }
              ].map((item, index) => {
                const ItemIcon = item.icon
                
                return (
                  <div 
                    key={index}
                    className="group p-4 bg-background rounded-md shadow-aurora-md hover:shadow-aurora-lg transition-all duration-300 hover:scale-105 animate-aurora-float"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col items-center space-y-token-sm">
                      <div className="w-12 h-12 bg-nebula-purple/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-aurora-md">
                        <ItemIcon className="text-aurora-pink animate-aurora-glow-pulse" size={20} />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-deep-space text-sm">
                          {item.text}
                        </div>
                        <AuroraSmall className="text-deep-space/70">
                          {item.subtitle}
                        </AuroraSmall>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Enhancement */}
      <div className="sr-only">
        <h3>Enhanced Values Summary</h3>
        <p>
          GlowGlitch offers ethical luxury jewelry with three core values: 
          100% conflict-free and ethically sourced materials, unlimited customization 
          for personal expression, and planet-positive practices including carbon 
          neutrality and 80% recycled metals. All our lab-grown diamonds are 
          certified by international gemological institutes.
        </p>
      </div>
      </Container>
    </section>
  )
}

export type { EnhancedValuePropositionProps }