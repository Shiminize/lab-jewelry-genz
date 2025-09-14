'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { H3, BodyText, AuroraTitleM, AuroraBodyM } from '../../foundation/Typography'
import type { EnhancedValueProp } from '../../../types/enhanced-value'

const valueCardVariants = cva(
  'enhanced-value-card group relative overflow-hidden rounded-lg transition-all duration-token-slow ease-token-out',
  {
    variants: {
      style: {
        glassmorphism: 'bg-background shadow-aurora-lg hover:shadow-aurora-glow',
        minimal: 'space-y-token-xl bg-background',
        bordered: 'shadow-aurora-lg bg-background'
      },
      state: {
        default: 'hover:shadow-aurora-glow hover:scale-105 hover:-translate-y-token-sm',
        active: 'shadow-aurora-glow scale-105 -translate-y-token-sm bg-nebula-purple/5',
        dimmed: 'opacity-60 scale-95 translate-y-token-xs'
      }
    },
    defaultVariants: {
      style: 'glassmorphism',
      state: 'default'
    }
  }
)

const iconContainerVariants = cva(
  'enhanced-value-icon relative flex items-center justify-center transition-all duration-token-normal ease-token-out',
  {
    variants: {
      size: {
        small: 'w-token-4xl h-token-4xl',
        medium: 'w-token-5xl h-token-5xl',
        large: 'w-token-6xl h-token-6xl'
      },
      style: {
        glassmorphism: 'bg-background rounded-full shadow-aurora-md hover:shadow-aurora-lg',
        gradient: 'bg-nebula-purple/10 rounded-full',
        minimal: 'bg-nebula-purple/10 rounded-full'
      },
      state: {
        default: 'group-hover:scale-110 group-hover:shadow-aurora-glow',
        floating: 'hover:shadow-aurora-glow hover:scale-110'
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
  'enhanced-trust-badge inline-flex items-center gap-token-sm px-token-md py-token-sm rounded-token-full text-token-sm font-semibold transition-all duration-300 shadow-aurora-md hover:shadow-aurora-lg',
  {
    variants: {
      style: {
        glassmorphism: 'bg-background shadow-aurora-lg',
        accent: 'bg-background text-aurora-pink',
        minimal: 'bg-nebula-purple/10'
      },
      state: {
        default: 'hover:scale-110 hover:shadow-aurora-glow hover:-translate-y-token-xs animate-aurora-float',
        interactive: 'cursor-pointer hover:bg-nebula-purple/10 hover:scale-110 hover:shadow-aurora-glow active:scale-105'
      }
    },
    defaultVariants: {
      style: 'accent',
      state: 'default'
    }
  }
)

interface ValueCardProps {
  prop: EnhancedValueProp
  index: number
  isAnimated: boolean
  isActive: boolean
  isDimmed: boolean
  animationDelay: number
  enableAnimation: boolean
  enableInteraction: boolean
  mobileBreakpoint: 'sm' | 'md' | 'lg'
  onInteraction: (cardId: string, type: 'enter' | 'leave') => void
  onKeyboardNavigation: (event: React.KeyboardEvent, cardId: string) => void
}

export function ValueCard({
  prop,
  index,
  isAnimated,
  isActive,
  isDimmed,
  animationDelay,
  enableAnimation,
  enableInteraction,
  mobileBreakpoint,
  onInteraction,
  onKeyboardNavigation
}: ValueCardProps) {
  const IconComponent = prop.icon

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
        'space-y-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-aurora-pink/20 focus:ring-offset-2 rounded-lg',
        // Mobile optimization
        'min-h-[400px] sm:min-h-[420px] lg:min-h-[400px]',
        'touch-manipulation', // Improves touch responsiveness
        // Better mobile spacing with Aurora styling
        'p-6 sm:p-8 lg:p-10',
        getResponsiveClasses(index),
        `${mobileBreakpoint}:col-span-1`, // Reset on desktop
        isAnimated ? 'animate-in slide-in-from-bottom-6 duration-token-slow' : 'opacity-0',
        {
          [`delay-${index * animationDelay}`]: enableAnimation
        }
      )}
      role="tab"
      tabIndex={enableInteraction ? 0 : -1}
      onMouseEnter={() => onInteraction(prop.id, 'enter')}
      onMouseLeave={() => onInteraction(prop.id, 'leave')}
      onFocus={() => onInteraction(prop.id, 'enter')}
      onBlur={() => onInteraction(prop.id, 'leave')}
      onKeyDown={(e) => onKeyboardNavigation(e, prop.id)}
    >
      {/* Floating Aurora background */}
      <div className="absolute inset-0 bg-nebula-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-token-slow animate-aurora-drift" />
      
      {/* Icon Container */}
      <div className="relative flex justify-center">
        <div className={cn(iconContainerVariants())}>
          <IconComponent 
            className="enhanced-value-icon-svg text-aurora-pink transition-all duration-token-normal group-hover:scale-110 group-hover:text-aurora-pink animate-aurora-glow-pulse" 
            size={40}
          />
          
          {/* Aurora pulsing ring effect */}
          <div className="absolute inset-0 rounded-full scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-token-slow shadow-aurora-glow animate-aurora-sparkle" />
          
          {/* Aurora sparkle effect */}
          <div className="absolute inset-0 rounded-full bg-aurora-pink/10 scale-0 group-hover:scale-150 transition-transform duration-token-slow opacity-0 group-hover:opacity-30" />
        </div>
      </div>

      {/* Content */}
      <div className="relative space-y-token-md text-center">
        <AuroraTitleM className="text-deep-space group-hover:aurora-gradient-text transition-colors duration-token-normal">
          {prop.headline}
        </AuroraTitleM>
        <AuroraBodyM 
          className="text-deep-space/80"
        >
          {prop.description}
        </AuroraBodyM>

        {/* Additional Details (shown on interaction) */}
        {prop.details && (
          <div 
            className={cn(
              'transition-all duration-token-normal overflow-hidden',
              isActive 
                ? 'max-h-20 opacity-100 mt-4' 
                : 'max-h-0 opacity-0 mt-0'
            )}
          >
            <div className="pt-3">
              <AuroraBodyM 
                className="text-deep-space font-medium"
              >
                {prop.details}
              </AuroraBodyM>
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
                style={{ animationDelay: `${signalIndex * 0.1}s` }}
              >
                {/* Aurora background glow effect */}
                <div className="absolute inset-0 bg-aurora-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-token-normal rounded-full" />
                
                <SignalIcon 
                  className="text-aurora-pink transition-colors duration-token-normal relative z-10 animate-aurora-sparkle" 
                  size={16} 
                />
                <span className="font-semibold text-aurora-pink transition-colors duration-token-normal relative z-10">
                  {signal.text}
                </span>
                
                {/* Aurora shimmer effect */}
                <div className="absolute inset-0 -skew-x-12 bg-aurora-pink/20 opacity-0 group-hover:opacity-100 group-hover:animate-aurora-shimmer-slow transition-all duration-token-slow rounded-full" />
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}