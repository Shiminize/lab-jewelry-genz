/**
 * Container Component - Single Source of Truth for Layout Containers
 * Claude4.1 Demo Compliant - Replaces all max-w-7xl patterns
 * CLAUDE_RULES compliant: Simple layout component with CVA variants
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const containerVariants = cva(
  'mx-auto w-full',
  {
    variants: {
      maxWidth: {
        default: 'max-w-token-container',  // 1400px (Claude4.1 Demo standard)
        full: 'max-w-full',
        narrow: 'max-w-4xl',
        wide: 'max-w-screen-2xl'
      },
      padding: {
        default: 'px-token-xl',                           // 2rem (Claude4.1 Demo)
        none: '',
        compact: 'px-token-md',                           // 1rem
        responsive: 'px-token-md sm:px-token-lg lg:px-token-xl'  // Legacy support
      }
    },
    defaultVariants: {
      maxWidth: 'default',
      padding: 'default'
    }
  }
)

interface ContainerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  /** HTML element type */
  as?: 'div' | 'main' | 'section' | 'article' | 'header' | 'footer'
}

export function Container({
  className,
  maxWidth,
  padding,
  as = 'div',
  children,
  ...props
}: ContainerProps) {
  const Component = as

  return (
    <Component
      className={cn(containerVariants({ maxWidth, padding }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export type ContainerVariant = VariantProps<typeof containerVariants>