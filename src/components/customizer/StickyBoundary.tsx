/**
 * StickyBoundary - Layout Boundary Component
 * Acts as a stopper positioned under sticky preview container to prevent content blocking
 * Displays current material selections as additional UX value
 * Follows CLAUDE_RULES design system and positioning requirements
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// CLAUDE_RULES compliant variants for boundary component
const boundaryVariants = cva(
  'w-full transition-all duration-200 ease-in-out',
  {
    variants: {
      state: {
        visible: 'opacity-100',
        minimized: 'opacity-75',
        hidden: 'opacity-0 pointer-events-none'
      },
      size: {
        compact: 'min-h-12',
        standard: 'min-h-16'
      },
      position: {
        'bottom-aligned': 'mt-4',
        'inline': 'mt-2'
      }
    },
    defaultVariants: {
      state: 'visible',
      size: 'compact',
      position: 'bottom-aligned'
    }
  }
)

const contentVariants = cva(
  'border border-border transition-all duration-200',
  {
    variants: {
      layout: {
        horizontal: 'flex items-center justify-between rounded-lg',
        compact: 'flex items-center space-x-2 rounded-lg'
      },
      background: {
        card: 'bg-background shadow-sm',
        subtle: 'bg-background border-border/50'
      }
    },
    defaultVariants: {
      layout: 'horizontal',
      background: 'card'
    }
  }
)

// Material selection interface
interface MaterialSelection {
  metal: string
  stone: string
  style: string
}

interface StickyBoundaryProps extends VariantProps<typeof boundaryVariants> {
  materialSelection: MaterialSelection
  isVisible?: boolean
  onMinimize?: () => void
  onClose?: () => void
  className?: string
  showControls?: boolean
}

export function StickyBoundary({
  materialSelection,
  isVisible = true,
  onMinimize,
  onClose,
  state = 'visible',
  size = 'compact',
  position = 'bottom-aligned',
  className,
  showControls = true,
  ...props
}: StickyBoundaryProps) {

  // Format material selection for display
  const materialText = `${materialSelection.metal} • ${materialSelection.stone} • ${materialSelection.style}`

  if (!isVisible) return null

  return (
    <div
      className={cn(
        boundaryVariants({ state, size, position }),
        className
      )}
      role="complementary"
      aria-label="Current material selection boundary"
      {...props}
    >
      <div
        className={cn(
          contentVariants({
            layout: 'horizontal',
            background: 'card'
          }),
          'p-3'
        )}
      >
        {/* Material Selection Display */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {/* Material indicator dot */}
          <div 
            className="w-2 h-2 bg-cta rounded-full flex-shrink-0" 
            aria-hidden="true" 
          />
          
          {/* Material selection text */}
          <span className="font-body text-sm text-foreground truncate">
            {materialText}
          </span>
        </div>

        {/* Control buttons (optional) */}
        {showControls && (
          <div className="flex items-center space-x-1 flex-shrink-0">
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-1 text-aurora-nav-muted hover:text-foreground transition-colors duration-200 rounded touch-manipulation"
                aria-label="Minimize material selection display"
                title="Minimize"
              >
                <Minus size={14} />
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-aurora-nav-muted hover:text-foreground transition-colors duration-200 rounded touch-manipulation"
                aria-label="Close material selection display"
                title="Close"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Minimized state variant for space-constrained layouts
export function StickyBoundaryMinimized({
  materialSelection,
  onExpand,
  className
}: {
  materialSelection: MaterialSelection
  onExpand?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        boundaryVariants({ state: 'minimized', size: 'compact', position: 'inline' }),
        className
      )}
    >
      <div
        className={cn(
          contentVariants({ layout: 'compact', background: 'subtle' }),
          'p-2 cursor-pointer hover:bg-background hover:shadow-sm'
        )}
        onClick={onExpand}
        role="button"
        tabIndex={0}
        aria-label="Expand material selection display"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onExpand?.()
          }
        }}
      >
        <div className="w-2 h-2 bg-accent rounded-full" aria-hidden="true" />
        <span className="font-body text-xs text-aurora-nav-muted">
          Current Selection
        </span>
      </div>
    </div>
  )
}

export type { StickyBoundaryProps, MaterialSelection }