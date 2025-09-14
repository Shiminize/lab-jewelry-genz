/**
 * GradientAnimatedHeading - Reusable gradient animated text component
 * Matches Hero section's aurora-iridescent-text animation
 * CLAUDE_RULES compliant: Simple, reusable UI pattern for gradient text
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gradientHeadingVariants = cva(
  'aurora-iridescent-text font-bold tracking-tight leading-tight',
  {
    variants: {
      size: {
        hero: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl',
        h1: 'text-3xl sm:text-4xl lg:text-5xl',
        h2: 'text-2xl sm:text-3xl lg:text-4xl',
        h3: 'text-xl sm:text-2xl lg:text-3xl',
      },
    },
    defaultVariants: {
      size: 'h2',
    },
  }
)

interface GradientAnimatedHeadingProps 
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof gradientHeadingVariants> {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function GradientAnimatedHeading({
  children,
  size,
  as: Component = 'h2',
  className,
  ...props
}: GradientAnimatedHeadingProps) {
  return (
    <Component
      className={cn(gradientHeadingVariants({ size }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export default GradientAnimatedHeading