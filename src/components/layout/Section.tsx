/**
 * Section Component - Single Source of Truth for Section Spacing
 * Claude4.1 Demo Compliant - 5rem 2rem standard spacing
 * CLAUDE_RULES compliant: Simple layout component with CVA variants
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const sectionVariants = cva(
  'w-full',
  {
    variants: {
      spacing: {
        default: 'py-token-4xl px-token-xl',   // 5rem 2rem (Claude4.1 Demo standard)
        compact: 'py-token-3xl px-token-xl',   // 4rem 2rem
        spacious: 'py-token-5xl px-token-xl',  // 6rem 2rem
        minimal: 'py-token-2xl px-token-xl',   // 3rem 2rem
        hero: 'py-token-6xl px-token-xl',      // 8rem 2rem (for hero sections)
      },
      background: {
        default: 'bg-background',
        muted: 'bg-muted/20',
        accent: 'bg-accent/5',
        transparent: 'bg-transparent'
      }
    },
    defaultVariants: {
      spacing: 'default',
      background: 'transparent'
    }
  }
)

interface SectionProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  /** HTML element type */
  as?: 'section' | 'div' | 'main' | 'article' | 'header' | 'footer'
}

export function Section({
  className,
  spacing,
  background,
  as = 'section',
  children,
  ...props
}: SectionProps) {
  const Component = as

  return (
    <Component
      className={cn(sectionVariants({ spacing, background }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export type SectionVariant = VariantProps<typeof sectionVariants>