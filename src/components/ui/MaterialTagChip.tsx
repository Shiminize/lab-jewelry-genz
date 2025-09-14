'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { sanitizeMaterialName } from '../../lib/security'
import type { MaterialTag } from '../../types/material-tags'
import { AuroraButton } from '../aurora'

const materialTagChipVariants = cva(
  'inline-flex items-center justify-center font-body font-medium transition-all duration-token-normal border focus:outline-none cursor-pointer whitespace-nowrap shadow-token-sm hover:shadow-token-md transition-shadow hover:brightness-115 hover:scale-101 hover:-translate-y-0.5 relative overflow-hidden rounded-token-md',
  {
    variants: {
      category: {
        // Stone: Emerald cues
        stone: 'text-aurora-emerald-flash bg-surface border-aurora-emerald-flash/20 hover:bg-surface-hover',
        // Metal: Neutral surface with nav border
        metal: 'text-aurora-text bg-surface-muted border-aurora-nav-border hover:bg-surface-active',
        // Carat: Neutral surface, subtle
        carat: 'text-aurora-text bg-surface border-aurora-nav-border hover:bg-surface-muted'
      },
      selected: {
        // Selected state: high contrast on brand
        true: 'text-high-contrast bg-cta border-cta shadow-token-lg',
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

// Deprecated: custom prismatic/emotional classes removed in favor of token shadows

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
  // Get Aurora focus class to fix CSS specificity conflict with prismatic shadows
  const auroraFocusClass = getAuroraFocusClass(tag.displayName, tag.category)

  return (
    <AuroraButton
      asChild
      variant={selected ? 'primary' : 'ghost'}
      size={size === 'sm' ? 'sm' : 'default'}
      className={cn(
        materialTagChipVariants({ 
          category: tag.category, 
          selected, 
          size, 
          disabled 
        }),
        auroraFocusClass,
        className
      )}
      aria-pressed={selected}
      aria-label={`${selected ? 'Remove' : 'Add'} ${tag.displayName} filter`}
      {...props}
    >
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        role="button"
        tabIndex={disabled ? -1 : 0}
        className="contents"
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
    </AuroraButton>
  )
})

// Export the memoized component
export const MaterialTagChip = MaterialTagChipComponent

// Export variants for external usage
export { materialTagChipVariants }
export type MaterialTagChipVariant = VariantProps<typeof materialTagChipVariants>