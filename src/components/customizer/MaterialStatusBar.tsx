/**
 * MaterialStatusBar - Fixed-Position Material Selection Display
 * Shows current material selections in a non-intrusive fixed bottom container
 * Follows CLAUDE_RULES design system and accessibility standards
 */

'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// CLAUDE_RULES compliant variants
const statusBarVariants = cva(
  'fixed z-50 transition-all duration-300 ease-in-out',
  {
    variants: {
      position: {
        'bottom-full': 'bottom-0 left-0 right-0',
        'bottom-right': 'bottom-4 right-4'
      },
      state: {
        collapsed: 'translate-y-0',
        expanded: 'translate-y-0',
        hidden: 'translate-y-full opacity-0'
      },
      size: {
        compact: 'max-w-sm',
        full: 'w-full'
      }
    },
    defaultVariants: {
      position: 'bottom-full',
      state: 'collapsed',
      size: 'full'
    }
  }
)

const contentVariants = cva(
  'bg-background shadow-lg border-t border-border transition-all duration-200',
  {
    variants: {
      layout: {
        mobile: 'rounded-t-xl p-4',
        desktop: 'rounded-xl p-3 border border-border shadow-xl'
      }
    },
    defaultVariants: {
      layout: 'mobile'
    }
  }
)

// Types following existing customizer patterns
interface MaterialSelection {
  metal: string
  stone: string
  style: string
}

interface MaterialStatusBarProps extends VariantProps<typeof statusBarVariants> {
  isVisible?: boolean
  materialSelection: MaterialSelection
  onDismiss?: () => void
  onToggleExpanded?: (expanded: boolean) => void
  className?: string
}

export function MaterialStatusBar({
  isVisible = true,
  materialSelection,
  onDismiss,
  onToggleExpanded,
  position = 'bottom-full',
  className,
  ...props
}: MaterialStatusBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle expand/collapse
  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onToggleExpanded?.(newExpanded)
  }

  // Handle dismiss
  const handleDismiss = () => {
    onDismiss?.()
  }

  // Auto-collapse on mobile after delay
  useEffect(() => {
    if (isMobile && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isExpanded, isMobile])

  if (!isVisible) return null

  // Material selection text formatting
  const materialText = `${materialSelection.metal} • ${materialSelection.stone} • ${materialSelection.style}`

  return (
    <div
      className={cn(
        statusBarVariants({
          position: isMobile ? 'bottom-full' : 'bottom-right',
          state: isVisible ? (isExpanded ? 'expanded' : 'collapsed') : 'hidden',
          size: isMobile ? 'full' : 'compact'
        }),
        className
      )}
      role="banner"
      aria-label="Material selection status"
      {...props}
    >
      <div
        className={cn(
          contentVariants({
            layout: isMobile ? 'mobile' : 'desktop'
          })
        )}
      >
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="space-y-3">
            {/* Collapsed State - Touch Bar */}
            {!isExpanded && (
              <button
                onClick={handleToggleExpanded}
                className="w-full flex items-center justify-between p-2 -m-2 text-foreground bg-background hover:bg-muted/50 rounded-lg transition-colors duration-200 touch-manipulation"
                aria-expanded="false"
                aria-controls="material-details"
                aria-label="Show material selection details"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cta rounded-full flex-shrink-0" aria-hidden="true" />
                  <span className="font-body text-sm text-foreground truncate">
                    Current Selection
                  </span>
                </div>
                <ChevronUp size={16} className="text-aurora-nav-muted flex-shrink-0" />
              </button>
            )}

            {/* Expanded State - Full Details */}
            {isExpanded && (
              <div id="material-details" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-body text-sm font-medium text-foreground">
                    Material Selection
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleToggleExpanded}
                      className="p-1 text-aurora-nav-muted hover:text-foreground transition-colors duration-200 touch-manipulation"
                      aria-expanded="true"
                      aria-controls="material-details"
                      aria-label="Hide material selection details"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="p-1 text-aurora-nav-muted hover:text-foreground transition-colors duration-200 touch-manipulation"
                      aria-label="Close material selection display"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-foreground font-body">
                  {materialText}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Desktop Layout - Always Expanded */
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-cta rounded-full flex-shrink-0" aria-hidden="true" />
            <span className="font-body text-sm text-foreground">
              {materialText}
            </span>
            <button
              onClick={handleDismiss}
              className="p-1 text-aurora-nav-muted hover:text-foreground transition-colors duration-200 ml-2"
              aria-label="Close material selection display"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export type { MaterialStatusBarProps, MaterialSelection }