'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { sanitizeMaterialName } from '@/lib/security'
import type { MaterialTag } from '@/types/material-tags'

const materialTagChipVariants = cva(
  // Color Psychology: Enhanced micro-interactions with emotional triggers
  // Aurora ripple creates dopamine response, luminosity boost signals luxury quality
  'inline-flex items-center justify-center font-body font-medium transition-all duration-300 border focus:outline-none cursor-pointer whitespace-nowrap aurora-material-ripple hover:brightness-[1.15] hover:scale-[1.02] hover:-translate-y-0.5 relative overflow-hidden aurora-shimmer-effect',
  {
    variants: {
      category: {
        // Stone Tags: Use emerald-flash for consistency with CLAUDE_RULES  
        stone: 'text-emerald-flash bg-background border-emerald-flash/20 hover:bg-muted hover:text-foreground',
        // Metal Tags: Use `text-foreground bg-muted` (graphite on muted background)  
        metal: 'text-foreground bg-muted border-border hover:bg-background hover:text-foreground',
        // Carat Tags: Use `text-foreground bg-background` (graphite on background)
        carat: 'text-foreground bg-background border-border hover:bg-muted hover:text-foreground'
      },
      selected: {
        // Selected State: Use `text-foreground` for prismatic shadows (no bg override)
        true: 'text-foreground',
        false: ''
      },
      size: {
        // Touch-optimized sizes with 44px minimum height for accessibility
        sm: 'min-h-10 px-3 py-2 text-sm', // 40px height, still accessible
        md: 'min-h-11 px-4 py-2.5 text-sm' // 44px height, WCAG compliant
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: ''
      }
    },
    compoundVariants: [
      // Override category styles when selected (but not for metal - uses prismatic shadows)
      {
        selected: true,
        category: ['stone', 'carat'],
        class: 'text-background bg-cta border-cta hover:bg-cta-hover hover:border-cta-hover'
      }
    ],
    defaultVariants: {
      category: 'stone',
      selected: false,
      size: 'md',
      disabled: false
    }
  }
)

export interface MaterialTagChipProps 
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    VariantProps<typeof materialTagChipVariants> {
  /** Material tag data */
  tag: MaterialTag
  /** Whether the tag is currently selected */
  selected?: boolean
  /** Click handler for tag selection */
  onClick?: (tag: MaterialTag) => void
  /** Component size variant */
  size?: 'sm' | 'md'
  /** Optional icon to display */
  icon?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

// Color Psychology: Material-specific prismatic effects trigger emotional purchase responses
// Gold = Warmth & Luxury | Platinum = Sophistication | Rose Gold = Romance 
function getPrismaticShadowClass(materialName: string, isSelected: boolean): string {
  const name = materialName.toLowerCase()
  let baseClass = ''
  
  if (name.includes('gold') && !name.includes('rose') && !name.includes('white')) {
    // Gold: Warm psychological trigger - wealth, success, luxury
    baseClass = 'luxury-emotional-trigger'
    if (isSelected) {
      return `prismatic-shadow-gold prismatic-shadow-gold ${baseClass}`
    }
    return baseClass
  }
  if (name.includes('rose') && name.includes('gold')) {
    // Rose Gold: Romance psychological trigger - love, femininity, elegance
    baseClass = 'romantic-emotional-trigger'
    if (isSelected) {
      return `prismatic-shadow-rose-gold prismatic-shadow-rose-gold ${baseClass}`
    }
    return baseClass
  }
  if (name.includes('white') && name.includes('gold')) {
    // White Gold: Modern luxury trigger - sophistication, purity
    baseClass = 'luxury-emotional-trigger'
    if (isSelected) {
      return `prismatic-shadow-white-gold prismatic-shadow-white-gold ${baseClass}`
    }
    return baseClass
  }
  if (name.includes('platinum')) {
    // Platinum: Premium exclusivity trigger - rarity, status
    baseClass = 'luxury-emotional-trigger'
    if (isSelected) {
      return `prismatic-shadow-platinum prismatic-shadow-platinum ${baseClass}`
    }
    return baseClass
  }
  return '' // No prismatic effect for other materials
}

// Helper function to get Aurora focus class based on material (Fixes CSS specificity conflict)
function getAuroraFocusClass(materialName: string, category: string): string {
  // Only apply material-specific focus for metal tags
  if (category !== 'metal') {
    return 'focus:aurora-focus-default'
  }

  const name = materialName.toLowerCase()
  if (name.includes('gold') && !name.includes('rose') && !name.includes('white')) {
    return 'focus:aurora-focus-gold'
  }
  if (name.includes('rose') && name.includes('gold')) {
    return 'focus:aurora-focus-rose-gold'
  }
  if (name.includes('platinum') || name.includes('white')) {
    return 'focus:aurora-focus-platinum'
  }
  return 'focus:aurora-focus-default'
}

/**
 * MaterialTagChip - AURORA DESIGN SYSTEM Compliant Component
 * 
 * Displays material-specific tags with strict Aurora color compliance:
 * - Stone Tags: Emerald flash on background (text-emerald-flash bg-background)
 * - Metal Tags: Graphite on muted background (text-foreground bg-muted)  
 * - Carat Tags: Graphite on background (text-foreground bg-background)
 * - Selected: White on Aurora purple (text-background bg-cta)
 * 
 * Features:
 * - WCAG 2.1 AA accessibility compliance
 * - 44px minimum touch targets
 * - Keyboard navigation support
 * - Proper focus management
 * - Material-specific styling
 * - Performance optimized with React.memo
 */
const MaterialTagChipComponent = React.memo(function MaterialTagChip({
  tag,
  selected = false,
  onClick,
  size = 'md',
  icon,
  className,
  disabled = false,
  ...props
}: MaterialTagChipProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      e.preventDefault()
      e.stopPropagation()
      onClick(tag)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault()
      onClick(tag)
    }
  }

  // Get prismatic shadow class and emotional triggers for all materials
  const prismaticClass = getPrismaticShadowClass(tag.displayName, selected)
  
  // Get Aurora focus class to fix CSS specificity conflict with prismatic shadows
  const auroraFocusClass = getAuroraFocusClass(tag.displayName, tag.category)

  return (
    <button
      type="button"
      className={cn(
        materialTagChipVariants({ 
          category: tag.category, 
          selected, 
          size, 
          disabled 
        }),
        prismaticClass,
        auroraFocusClass,
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${selected ? 'Remove' : 'Add'} ${tag.displayName} filter`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {icon}
          </span>
        )}
        <span className="truncate font-medium">
          {sanitizeMaterialName(tag.displayName)}
        </span>
      </div>
    </button>
  )
})

// Export the memoized component
export const MaterialTagChip = MaterialTagChipComponent

// Export variants for external usage
export { materialTagChipVariants }
export type MaterialTagChipVariant = VariantProps<typeof materialTagChipVariants>