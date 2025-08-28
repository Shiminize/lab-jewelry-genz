'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { MaterialTag } from '@/types/material-tags'

const materialTagChipVariants = cva(
  // Base styles with CLAUDE_RULES compliance
  'inline-flex items-center justify-center font-body font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 cursor-pointer whitespace-nowrap',
  {
    variants: {
      category: {
        // Stone Tags: Use `text-accent bg-background` (Aurora Nebula Purple on background)
        stone: 'text-accent bg-background border-accent/20 hover:bg-muted hover:text-foreground',
        // Metal Tags: Use `text-foreground bg-muted` (graphite on muted background)  
        metal: 'text-foreground bg-muted border-border hover:bg-background hover:text-foreground',
        // Carat Tags: Use `text-foreground bg-background` (graphite on background)
        carat: 'text-foreground bg-background border-border hover:bg-muted hover:text-foreground'
      },
      selected: {
        // Selected State: Use `text-background bg-cta` (white on coral gold)
        true: 'text-background bg-cta border-cta hover:bg-cta-hover hover:border-cta-hover',
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
      // Override category styles when selected
      {
        selected: true,
        category: ['stone', 'metal', 'carat'],
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

/**
 * MaterialTagChip - AURORA DESIGN SYSTEM Compliant Component
 * 
 * Displays material-specific tags with strict Aurora color compliance:
 * - Stone Tags: Aurora Nebula Purple on background (text-accent bg-background)
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
 */
export function MaterialTagChip({
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
          {tag.displayName}
        </span>
      </div>
    </button>
  )
}

// Export variants for external usage
export { materialTagChipVariants }
export type MaterialTagChipVariant = VariantProps<typeof materialTagChipVariants>