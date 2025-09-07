'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tokenCardVariants = cva(
  // Base styles using ONLY tokens from tailwind.config.js
  'transition-all duration-300 ease-in-out border border-neutral-200',
  {
    variants: {
      variant: {
        // Default: Clean card with token background
        default: 'bg-neutral-0 hover:brightness-115 hover:scale-101 shadow-near hover:shadow-hover rounded-token-lg',
        
        // Luxury: Gradient midnight background
        luxury: 'bg-gradient-luxury-midnight text-neutral-0 hover:brightness-115 hover:scale-101 shadow-hover hover:shadow-far rounded-token-lg',
        
        // Featured: Primary gradient with enhanced shadow
        featured: 'bg-gradient-primary text-neutral-0 hover:brightness-115 hover:scale-101 shadow-hover hover:shadow-far rounded-token-xl',
        
        // Surface: Subtle surface gradient
        surface: 'bg-gradient-surface hover:brightness-115 hover:scale-101 shadow-near hover:shadow-hover rounded-token-md',
        
        // Compact: Minimal card for dense layouts
        compact: 'bg-neutral-0 hover:brightness-115 hover:scale-101 shadow-soft hover:shadow-near rounded-token-sm',
        
        // Interactive: Enhanced hover states for clickable cards
        interactive: 'bg-neutral-0 hover:brightness-115 hover:scale-101 cursor-pointer shadow-near hover:shadow-hover rounded-token-lg border-neutral-200 hover:border-brand-primary'
      },
      padding: {
        // Token-based padding variants
        none: 'p-0',
        xs: 'p-token-xs',
        sm: 'p-token-sm', 
        md: 'p-token-md',
        lg: 'p-token-lg',
        xl: 'p-token-xl'
      },
      elevation: {
        // Token-based shadow elevation
        none: 'shadow-none',
        soft: 'shadow-soft',
        near: 'shadow-near hover:shadow-hover',
        hover: 'shadow-hover hover:shadow-far',
        far: 'shadow-far hover:shadow-distant'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      elevation: 'near'
    }
  }
)

const tokenCardHeaderVariants = cva(
  'flex items-center justify-between border-b border-neutral-200',
  {
    variants: {
      size: {
        sm: 'pb-token-sm mb-token-sm',
        md: 'pb-token-md mb-token-md', 
        lg: 'pb-token-lg mb-token-lg'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

const tokenCardContentVariants = cva(
  'text-neutral-900',
  {
    variants: {
      spacing: {
        tight: 'space-y-token-xs',
        normal: 'space-y-token-sm',
        relaxed: 'space-y-token-md',
        loose: 'space-y-token-lg'
      }
    },
    defaultVariants: {
      spacing: 'normal'
    }
  }
)

interface TokenCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tokenCardVariants> {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  headerSize?: VariantProps<typeof tokenCardHeaderVariants>['size']
  contentSpacing?: VariantProps<typeof tokenCardContentVariants>['spacing']
}

interface TokenCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: VariantProps<typeof tokenCardHeaderVariants>['size']
}

interface TokenCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spacing?: VariantProps<typeof tokenCardContentVariants>['spacing']
}

interface TokenCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function TokenCard({ 
  className,
  variant,
  padding,
  elevation,
  children,
  header,
  footer,
  headerSize = 'md',
  contentSpacing = 'normal',
  ...props
}: TokenCardProps) {
  return (
    <div
      className={cn(tokenCardVariants({ variant, padding, elevation }), className)}
      {...props}
    >
      {header && (
        <div className={cn(tokenCardHeaderVariants({ size: headerSize }))}>
          {header}
        </div>
      )}
      
      <div className={cn(tokenCardContentVariants({ spacing: contentSpacing }))}>
        {children}
      </div>
      
      {footer && (
        <div className="pt-token-md mt-token-md border-t border-neutral-200">
          {footer}
        </div>
      )}
    </div>
  )
}

export function TokenCardHeader({ 
  className,
  children,
  size = 'md',
  ...props 
}: TokenCardHeaderProps) {
  return (
    <div
      className={cn(tokenCardHeaderVariants({ size }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function TokenCardContent({ 
  className,
  children,
  spacing = 'normal',
  ...props 
}: TokenCardContentProps) {
  return (
    <div
      className={cn(tokenCardContentVariants({ spacing }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function TokenCardFooter({ 
  className,
  children,
  ...props 
}: TokenCardFooterProps) {
  return (
    <div
      className={cn("pt-token-md mt-token-md border-t border-neutral-200", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export type TokenCardVariant = VariantProps<typeof tokenCardVariants>