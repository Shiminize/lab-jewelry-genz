/**
 * MinimalHoverCard - Reusable Hover State Component
 * Matches target design with +15% luminosity and 0.3s ease transition
 * CLAUDE_RULES.md compliant - Simple feature, component-only architecture
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface MinimalHoverCardProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'platinum' | 'rose-gold' | 'white-gold'
  showLabel?: boolean
  className?: string
  onClick?: () => void
  isSelected?: boolean
  disabled?: boolean
}

export const MinimalHoverCard: React.FC<MinimalHoverCardProps> = ({
  children,
  variant = 'default',
  showLabel = false,
  className,
  onClick,
  isSelected = false,
  disabled = false
}) => {
  // Get variant-specific Tailwind classes for material types
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'gold':
        return 'hover:shadow-token-gold'
      case 'platinum':
        return 'hover:shadow-token-platinum'
      case 'rose-gold':
        return 'hover:shadow-token-rose-gold'
      case 'white-gold':
        return 'hover:shadow-token-white-gold'
      default:
        return 'hover:shadow-aurora-glow'
    }
  }

  const variantShadowClass = getVariantClasses(variant)

  return (
    <div 
      className={cn(
        // Base minimalist structure - clean and simple
        "relative p-6 rounded-token-lg cursor-pointer",
        "transition-all duration-300 ease-out",
        // Clean background with subtle gradient (matches target design)
        "bg-gradient-to-br from-neutral-0/80 to-transparent",
        "backdrop-blur-sm border border-neutral-200/50",
        // Hover state with +15% luminosity enhancement (using our custom Tailwind utility)
        "hover:brightness-115",
        "hover:scale-101", // Subtle scale for premium feel (using our custom Tailwind utility)
        // Material-specific shadow effects using Tailwind token shadows
        variantShadowClass,
        // Selected state indicator using token colors
        isSelected && "ring-1 ring-brand-primary/30 bg-brand-primary/5",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",
        // Label support for demo mode
        showLabel && "min-h-[120px] flex flex-col justify-center",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {children}
      
      {/* Optional demo label showing hover specifications */}
      {showLabel && (
        <div className="absolute bottom-2 left-4 text-xs text-neutral-500 font-medium">
          +15% luminosity • 0.3s ease
        </div>
      )}
      
      {/* Optional selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-primary text-neutral-0 flex items-center justify-center text-xs">
          ✓
        </div>
      )}
    </div>
  )
}

export default MinimalHoverCard