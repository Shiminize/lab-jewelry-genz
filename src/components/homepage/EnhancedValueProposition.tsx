'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
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
} from '@/components/ui/ValuesIcons'

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
        contained: 'px-token-md sm:px-token-lg lg:px-token-xl max-w-7xl mx-auto'
      }
    },
    defaultVariants: {
      spacing: 'comfortable',
      layout: 'contained'
    }
  }
)

const valueCardVariants = cva(
  'enhanced-value-card group relative overflow-hidden rounded-lg transition-all duration-700 ease-out',
  {
    variants: {
      style: {
        glassmorphism: 'bg-background shadow-xl',
        minimal: 'space-y-token-xl bg-background',
        bordered: 'shadow-xl bg-background'
      },
      state: {
        default: 'hover:shadow-xl hover:scale-[1.03] hover:-translate-y-token-sm',
        active: 'shadow-xl scale-[1.03] -translate-y-token-sm bg-muted',
        dimmed: 'opacity-60 scale-98 translate-y-token-xs'
      }
    },
    defaultVariants: {
      style: 'glassmorphism',
      state: 'default'
    }
  }
)

const iconContainerVariants = cva(
  'enhanced-value-icon relative flex items-center justify-center transition-all duration-300 ease-out',
  {
    variants: {
      size: {
        small: 'w-token-4xl h-token-4xl',
        medium: 'w-token-5xl h-token-5xl',
        large: 'w-token-6xl h-token-6xl'
      },
      style: {
        glassmorphism: 'bg-background rounded-full shadow-xl',
        gradient: 'bg-muted rounded-full',
        minimal: 'bg-muted rounded-full'
      },
      state: {
        default: 'group-hover:scale-110 group-hover:shadow-xl',
        floating: 'hover:shadow-xl hover:scale-115'
      }
    },
    defaultVariants: {
      size: 'large',
      style: 'glassmorphism',
      state: 'default'
    }
  }
)

const trustBadgeVariants = cva(
  'enhanced-trust-badge inline-flex items-center gap-token-sm px-token-md py-token-sm rounded-token-full text-token-sm font-semibold transition-all duration-300 shadow-md',
  {
    variants: {
      style: {
        glassmorphism: 'bg-background shadow-lg',
        accent: 'bg-background text-accent',
        minimal: 'bg-muted'
      },
      state: {
        default: 'hover:scale-110 hover:shadow-xl hover:-translate-y-token-xs',
        interactive: 'cursor-pointer hover:bg-muted hover:scale-110 hover:shadow-xl active:scale-105'
      }
    },
    defaultVariants: {
      style: 'accent',
      state: 'default'
    }
  }
)

interface EnhancedValueProp {
  id: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  headline: string
  description: string
  trustSignals: Array<{
    icon: React.ComponentType<{ className?: string; size?: number }>
    text: string
    description?: string
  }>
  details?: string
}

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
      className={cn(enhancedValueVariants({ spacing: 'comfortable', layout: 'contained' }), className)}
      {...props}
    >
      {/* Section Header */}
      <div className="text-center max-w-5xl mx-auto mb-16 lg:mb-20">
        {/* Decorative accent line */}
        <div className="w-24 h-1 bg-accent mx-auto mb-6 rounded-full" />
        
        <H2 
          id="enhanced-values-heading"
          className="mb-6 lg:mb-8 font-headline text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-foreground"
        >
          {headline}
        </H2>
        
        <BodyText 
          size="lg" 
          className="text-aurora-nav-muted max-w-4xl mx-auto leading-relaxed text-lg sm:text-xl lg:text-2xl font-light"
        >
          {description}
        </BodyText>
        
        {/* Subtle separator */}
        <div className="mt-8 lg:mt-12 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-150"></div>
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
          const IconComponent = prop.icon
          const isAnimated = animatedCards.has(prop.id)
          const isActive = activeCard === prop.id
          const isDimmed = activeCard !== null && activeCard !== prop.id
          
          // Simple responsive classes - no complex spanning to avoid gaps
          const getResponsiveClasses = (index: number) => {
            // On tablet, third card spans full width for better balance
            if (index === 2) return 'md:col-span-2'
            return ''
          }

          return (
            <article
              key={prop.id}
              className={cn(
                valueCardVariants({
                  style: 'glassmorphism',
                  state: isActive ? 'active' : isDimmed ? 'dimmed' : 'default'
                }),
                'space-y-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 rounded-lg',
                // Mobile optimization
                'min-h-[400px] sm:min-h-[420px] lg:min-h-[400px]',
                'touch-manipulation', // Improves touch responsiveness
                // Better mobile spacing
                'p-6 sm:p-8 lg:p-10',
                getResponsiveClasses(index),
                `${mobileBreakpoint}:col-span-1`, // Reset on desktop
                isAnimated ? 'animate-in slide-in-from-bottom-6 duration-600' : 'opacity-0',
                {
                  [`delay-${index * animationDelay}`]: enableAnimation
                }
              )}
              role="tab"
              tabIndex={enableInteraction ? 0 : -1}
              onMouseEnter={() => handleCardInteraction(prop.id, 'enter')}
              onMouseLeave={() => handleCardInteraction(prop.id, 'leave')}
              onFocus={() => handleCardInteraction(prop.id, 'enter')}
              onBlur={() => handleCardInteraction(prop.id, 'leave')}
              onKeyDown={(e) => handleKeyboardNavigation(e, prop.id)}
            >
              {/* Floating background */}
              <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon Container */}
              <div className="relative flex justify-center">
                <div className={cn(iconContainerVariants())}>
                  <IconComponent 
                    className="enhanced-value-icon-svg text-gray-600 transition-all duration-300 group-hover:scale-110 group-hover:text-accent" 
                    size={40}
                  />
                  
                  {/* Pulsing ring effect */}
                  <div className="absolute inset-0 rounded-full scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 shadow-lg" />
                  
                  {/* Sparkle effect */}
                  <div className="absolute inset-0 rounded-full bg-muted scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-30" />
                </div>
              </div>

              {/* Content */}
              <div className="relative space-y-token-md text-center">
                <H3 className="text-foreground group-hover:text-gray-800 transition-colors duration-300">
                  {prop.headline}
                </H3>
                <BodyText 
                  className="text-foreground leading-relaxed"
                  size="sm"
                >
                  {prop.description}
                </BodyText>

                {/* Additional Details (shown on interaction) */}
                {prop.details && (
                  <div 
                    className={cn(
                      'transition-all duration-300 overflow-hidden',
                      isActive 
                        ? 'max-h-20 opacity-100 mt-4' 
                        : 'max-h-0 opacity-0 mt-0'
                    )}
                  >
                    <div className="pt-3">
                      <BodyText 
                        size="sm" 
                        className="text-foreground font-medium"
                      >
                        {prop.details}
                      </BodyText>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust Signals */}
              <div className="relative mt-6 pt-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  {prop.trustSignals.map((signal, signalIndex) => {
                    const SignalIcon = signal.icon
                    
                    return (
                      <div 
                        key={signalIndex}
                        className={cn(
                          trustBadgeVariants({ style: 'accent', state: 'interactive' }),
                          'group relative overflow-hidden'
                        )}
                        title={signal.description}
                        role="button"
                        tabIndex={0}
                      >
                        {/* Background glow effect */}
                        <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                        
                        <SignalIcon 
                          className="text-accent transition-colors duration-300 relative z-10" 
                          size={16} 
                        />
                        <span className="font-semibold text-accent transition-colors duration-300 relative z-10">
                          {signal.text}
                        </span>
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -skew-x-12 bg-background opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 rounded-full" />
                      </div>
                    )
                  })}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Mobile Flow Indicators */}
      <div className={`${mobileBreakpoint}:hidden flex justify-center mt-8 space-x-token-sm`}>
        {valueProps.map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="w-8 h-1 bg-accent rounded-full" />
            {index < valueProps.length - 1 && (
              <div className="w-4 h-1 bg-accent mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Global Trust Signals Section */}
      {showTrustSignals && (
        <div className="mt-16 lg:mt-20 text-center">
          <div className="bg-white rounded-xl p-6 lg:p-8 max-w-5xl mx-auto shadow-xl">
            <MutedText className="mb-6 block text-lg">
              Join thousands who choose conscious luxury
            </MutedText>
            
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
                    className="group p-4 bg-gray-50 rounded-md shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex flex-col items-center space-y-token-sm">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ItemIcon className="text-accent" size={20} />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-foreground text-sm">
                          {item.text}
                        </div>
                        <MutedText size="xs" className="text-aurora-nav-muted">
                          {item.subtitle}
                        </MutedText>
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
    </section>
  )
}

export type { EnhancedValuePropositionProps }