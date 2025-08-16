'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { H3, BodyText } from '@/components/foundation/Typography'
import { 
  CarbonSeedIcon, 
  PressureHeatIcon, 
  CrystalGrowthIcon, 
  CutPolishIcon,
  AnimatedArrow 
} from '@/components/ui/DiamondProcessIcons'

const processContainerVariants = cva(
  'relative group transition-all duration-500 ease-out',
  {
    variants: {
      layout: {
        desktop: 'flex flex-col items-center text-center',
        mobile: 'flex flex-col items-start text-left'
      },
      state: {
        default: 'opacity-100 transform-none',
        highlighted: 'opacity-100 transform-none scale-105',
        dimmed: 'opacity-50 transform-none'
      }
    },
    defaultVariants: {
      layout: 'desktop',
      state: 'default'
    }
  }
)

const iconContainerVariants = cva(
  'relative flex items-center justify-center transition-all duration-300 ease-out',
  {
    variants: {
      size: {
        small: 'w-16 h-16',
        medium: 'w-20 h-20',
        large: 'w-24 h-24'
      },
      style: {
        default: 'bg-accent/10 rounded-full border-2 border-accent/20',
        glassmorphism: 'bg-background/30 backdrop-blur-md rounded-full border border-accent/40 shadow-xl shadow-accent/20',
        gradient: 'bg-gradient-to-br from-accent/10 to-accent/20 rounded-full border border-accent/30'
      },
      state: {
        default: 'shadow-sm',
        hover: 'shadow-xl scale-110 bg-accent/20',
        active: 'shadow-2xl scale-115 bg-accent/30'
      }
    },
    defaultVariants: {
      size: 'medium',
      style: 'glassmorphism',
      state: 'default'
    }
  }
)

const stepIndicatorVariants = cva(
  'absolute flex items-center justify-center text-sm font-bold transition-all duration-300',
  {
    variants: {
      position: {
        topLeft: '-top-2 -left-2',
        topRight: '-top-2 -right-2',
        center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      },
      style: {
        accent: 'w-8 h-8 bg-accent text-background rounded-full',
        gradient: 'w-8 h-8 bg-gradient-to-br from-accent to-accent/80 text-background rounded-full shadow-md',
        outline: 'w-8 h-8 border-2 border-accent text-accent rounded-full bg-background'
      }
    },
    defaultVariants: {
      position: 'topLeft',
      style: 'gradient'
    }
  }
)

interface ProcessStep {
  id: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  title: string
  description: string
  technicalDetails?: string
  duration?: string
}

const processSteps: ProcessStep[] = [
  {
    id: 'carbon-seed',
    icon: CarbonSeedIcon,
    title: 'Carbon Seed Placement',
    description: 'A tiny diamond seed is placed in a specialized chamber with precise carbon composition',
    technicalDetails: 'Ultra-pure carbon environment with precise atomic structure control',
    duration: '1 hour setup'
  },
  {
    id: 'pressure-heat',
    icon: PressureHeatIcon,
    title: 'High Pressure & Heat',
    description: 'Conditions mirror deep Earth: 2,000°F temperature and 1.5 million PSI pressure',
    technicalDetails: 'HPHT process replicating Earth\'s natural diamond formation conditions',
    duration: 'Continuous monitoring'
  },
  {
    id: 'crystal-growth',
    icon: CrystalGrowthIcon,
    title: '2-4 Week Growth',
    description: 'Carbon atoms crystallize layer by layer, forming identical atomic structure to mined diamonds',
    technicalDetails: 'Controlled crystal lattice formation with atomic precision',
    duration: '14-28 days'
  },
  {
    id: 'cut-polish',
    icon: CutPolishIcon,
    title: 'Cut & Polish',
    description: 'Master craftsmen cut and polish each diamond to reveal its maximum brilliance and fire',
    technicalDetails: 'Precision cutting using advanced laser technology and traditional craftsmanship',
    duration: '2-5 days'
  }
]

interface EnhancedDiamondProcessProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show technical details on hover/interaction */
  showTechnicalDetails?: boolean
  /** Enable step-by-step animation */
  enableAnimation?: boolean
  /** Animation delay between steps (ms) */
  animationDelay?: number
  /** Responsive layout breakpoint */
  mobileBreakpoint?: 'sm' | 'md' | 'lg'
  /** Show duration information */
  showDuration?: boolean
  /** Enable keyboard navigation */
  enableKeyboardNav?: boolean
}

export function EnhancedDiamondProcess({
  className,
  showTechnicalDetails = true,
  enableAnimation = true,
  animationDelay = 200,
  mobileBreakpoint = 'lg',
  showDuration = false,
  enableKeyboardNav = true,
  ...props
}: EnhancedDiamondProcessProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [animatedSteps, setAnimatedSteps] = useState<Set<string>>(new Set())
  const [isInView, setIsInView] = useState(false)

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && enableAnimation) {
          setIsInView(true)
        }
      },
      { threshold: 0.3 }
    )

    const element = document.getElementById('diamond-process-section')
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [enableAnimation])

  // Staggered animation for steps
  useEffect(() => {
    if (!isInView || !enableAnimation) return

    processSteps.forEach((step, index) => {
      setTimeout(() => {
        setAnimatedSteps(prev => new Set(Array.from(prev).concat(step.id)))
      }, index * animationDelay)
    })
  }, [isInView, enableAnimation, animationDelay])

  const handleStepInteraction = (stepId: string, type: 'enter' | 'leave') => {
    if (type === 'enter') {
      setActiveStep(stepId)
    } else {
      setActiveStep(null)
    }
  }

  const handleKeyboardNavigation = (event: React.KeyboardEvent, stepId: string) => {
    if (!enableKeyboardNav) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveStep(activeStep === stepId ? null : stepId)
    }
  }

  return (
    <div 
      id="diamond-process-section"
      className={cn('mt-16 lg:mt-20', className)}
      {...props}
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <H3 className="mb-4">How Lab Diamonds Are Created</H3>
        <BodyText className="text-foreground max-w-2xl mx-auto">
          Science meets artistry. Our diamonds grow using the same process as nature, 
          just faster and more sustainable. No mining required.
        </BodyText>
      </div>

      {/* Process Steps Grid */}
      <div 
        className={cn(
          'diamond-process-grid grid gap-8',
          `grid-cols-1 md:grid-cols-2 ${mobileBreakpoint}:grid-cols-4`,
          `${mobileBreakpoint}:gap-6`,
          // Mobile horizontal scroll for tablets
          'md:overflow-x-auto md:grid-flow-col md:auto-cols-[280px] md:snap-x md:snap-mandatory md:scrollbar-hide',
          `${mobileBreakpoint}:overflow-visible ${mobileBreakpoint}:grid-flow-row ${mobileBreakpoint}:auto-cols-auto`
        )}
        role="tablist"
        aria-label="Diamond creation process steps"
      >
        {processSteps.map((step, index) => {
          const IconComponent = step.icon
          const isAnimated = animatedSteps.has(step.id)
          const isActive = activeStep === step.id
          const isDimmed = activeStep !== null && activeStep !== step.id

          return (
            <div
              key={step.id}
              className={cn(
                processContainerVariants({
                  layout: 'desktop',
                  state: isActive ? 'highlighted' : isDimmed ? 'dimmed' : 'default'
                }),
                'diamond-process-container space-y-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg p-4',
                isAnimated ? 'animate-in slide-in-from-bottom-4 duration-500' : 'opacity-0',
                {
                  [`delay-${index * animationDelay}`]: enableAnimation
                }
              )}
              role="tab"
              tabIndex={enableKeyboardNav ? 0 : -1}
              aria-selected={isActive}
              aria-label={`Step ${index + 1}: ${step.title}`}
              onMouseEnter={() => handleStepInteraction(step.id, 'enter')}
              onMouseLeave={() => handleStepInteraction(step.id, 'leave')}
              onFocus={() => handleStepInteraction(step.id, 'enter')}
              onBlur={() => handleStepInteraction(step.id, 'leave')}
              onKeyDown={(e) => handleKeyboardNavigation(e, step.id)}
            >
              {/* Icon Container */}
              <div className="relative mx-auto">
                <div 
                  className={cn(
                    iconContainerVariants({
                      size: 'large',
                      style: 'glassmorphism',
                      state: isActive ? 'active' : 'default'
                    }),
                    'group-hover:shadow-xl group-hover:scale-110 group-hover:bg-accent/20'
                  )}
                >
                  <IconComponent 
                    className="diamond-process-icon text-accent transition-all duration-300 group-hover:scale-110" 
                    size={32}
                  />
                  
                  {/* Ripple effect on hover */}
                  <div className="absolute inset-0 rounded-full bg-accent/20 scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-30" />
                </div>

                {/* Step Number */}
                <div className={cn(stepIndicatorVariants(), 'diamond-process-step-indicator')}>
                  {index + 1}
                </div>

                {/* Duration Badge */}
                {showDuration && step.duration && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-background/40 backdrop-blur-md border border-accent/20 rounded-full text-xs text-foreground font-medium shadow-lg">
                    {step.duration}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <H3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                  {step.title}
                </H3>
                <BodyText 
                  size="sm" 
                  className="text-foreground leading-relaxed"
                >
                  {step.description}
                </BodyText>

                {/* Technical Details (shown on interaction) */}
                {showTechnicalDetails && step.technicalDetails && (
                  <div 
                    className={cn(
                      'transition-all duration-300 overflow-hidden',
                      isActive 
                        ? 'max-h-20 opacity-100 mt-3' 
                        : 'max-h-0 opacity-0 mt-0'
                    )}
                  >
                    <div className="pt-2 border-t border-accent/20">
                      <BodyText 
                        size="sm" 
                        className="text-accent font-medium"
                      >
                        {step.technicalDetails}
                      </BodyText>
                    </div>
                  </div>
                )}
              </div>

              {/* Connection Arrow (desktop only) */}
              {index < processSteps.length - 1 && (
                <div className={`hidden ${mobileBreakpoint}:block absolute top-12 -right-8 xl:-right-12`}>
                  <AnimatedArrow className="diamond-process-arrow text-accent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Flow Indicators */}
      <div className={`${mobileBreakpoint}:hidden flex justify-center mt-8 space-x-2`}>
        {processSteps.map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="w-8 h-1 bg-accent/30 rounded-full" />
            {index < processSteps.length - 1 && (
              <div className="w-4 h-1 bg-accent/60 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Process Summary */}
      <div className="mt-12 text-center">
        <div className="bg-background/30 backdrop-blur-md border border-accent/30 rounded-3xl p-6 lg:p-8 max-w-4xl mx-auto shadow-2xl shadow-accent/10">
          <BodyText className="text-foreground leading-relaxed">
            <span className="font-semibold text-accent">The result?</span> Diamonds with identical 
            physical, chemical, and optical properties to mined diamonds—but with a story 
            you can feel good about sharing.
          </BodyText>
          
          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-accent/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">100%</div>
              <BodyText size="sm" className="text-foreground">Identical Properties</BodyText>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">95%</div>
              <BodyText size="sm" className="text-foreground">Less Environmental Impact</BodyText>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">0</div>
              <BodyText size="sm" className="text-foreground">Mining Required</BodyText>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Reader Enhancement */}
      <div className="sr-only">
        <h4>Diamond Creation Process Details</h4>
        <ol>
          {processSteps.map((step, index) => (
            <li key={step.id}>
              Step {index + 1}: {step.title}. {step.description}
              {step.technicalDetails && ` Technical details: ${step.technicalDetails}`}
              {step.duration && ` Duration: ${step.duration}`}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export type { EnhancedDiamondProcessProps }