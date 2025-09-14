/**
 * SelectableCard - Reusable selectable card component
 * Based on MaterialSelection pattern from 3D customizer
 * CLAUDE_RULES compliant: Simple, reusable UI component
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

// Aurora-compliant selectable card variants matching MaterialSelection
const selectableCardVariants = cva(
  'relative p-4 rounded-token-lg transition-all duration-300 text-left focus:outline-none',
  {
    variants: {
      state: {
        default: 'text-foreground',
        hover: 'text-foreground',
        selected: 'text-foreground',
      },
      size: {
        default: 'p-4',
        compact: 'p-3',
        large: 'p-6',
      }
    },
    defaultVariants: {
      state: 'hover',
      size: 'default'
    }
  }
)

interface SelectableCardProps extends VariantProps<typeof selectableCardVariants> {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  'aria-label'?: string
  'data-testid'?: string
  disabled?: boolean
  focusClass?: string
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  children,
  onClick,
  className,
  state = 'hover',
  size = 'default',
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  disabled = false,
  focusClass = 'focus:aurora-focus-default'
}) => {
  const baseClassName = selectableCardVariants({ state, size })
  
  // Apply gradient background and shadow matching material selector selected state
  const gradientBackground = 'bg-gradient-to-br from-nebula-purple/10 to-aurora-pink/5'
  const shadowEffect = 'shadow-lg'
  
  const finalClassName = `
    ${baseClassName}
    ${gradientBackground}
    ${shadowEffect}
    ${focusClass}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ')

  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      onClick={disabled ? undefined : onClick}
      className={finalClassName}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      disabled={disabled}
      // No hover animations - static gradient appearance matching material selector
      transition={{ duration: 0.2 }}
    >
      {children}
    </Component>
  )
}

export default SelectableCard