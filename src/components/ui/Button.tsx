'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles using ONLY tokens from tailwind.config.js - CLAUDE_RULES compliant
  'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-in-out focus:outline-2 focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer border-none rounded-token-md',
  {
    variants: {
      variant: {
        // Primary: Token-based gradient with hover:brightness-115 and hover:scale-101
        primary: 'text-neutral-0 bg-gradient-primary hover:brightness-115 hover:scale-101 shadow-near hover:shadow-hover',
        
        // Secondary: Token background with interactive states
        secondary: 'bg-neutral-50 text-neutral-900 border border-neutral-200 hover:bg-neutral-0 hover:brightness-115 hover:scale-101 shadow-soft hover:shadow-near',
        
        // Outline: Token border with transform states
        outline: 'bg-transparent text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-neutral-0 hover:brightness-115 hover:scale-101',
        
        // Ghost: Clean hover with token background
        ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-50 hover:brightness-115 hover:scale-101',
        
        // Accent: Tertiary gradient with token compliance
        accent: 'bg-gradient-tertiary text-neutral-0 hover:brightness-115 hover:scale-101 shadow-near hover:shadow-hover'
      },
      size: {
        // Proper Tailwind utilities mapped to design-tokens.css values
        sm: 'px-2 py-1 text-sm min-h-[2rem]',        // 8px, 4px, 32px
        md: 'px-4 py-2 text-base min-h-[2.75rem]',   // 16px, 8px, 44px (token-size-button-height)
        lg: 'px-6 py-4 text-lg min-h-[3.5rem]',     // 24px, 16px, 56px
        icon: 'w-10 h-10 p-0',                      // 40px (2.5rem)
        'icon-lg': 'w-12 h-12 p-0'                  // 48px (3rem)
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  asChild?: boolean
}

export function Button({ 
  className,
  variant,
  size,
  children,
  isLoading = false,
  icon,
  iconPosition = 'left',
  disabled,
  asChild = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  if (asChild) {
    return (
      <span
        className={cn(buttonVariants({ variant, size }), className)}
        {...(props as any)}
      >
        {children}
      </span>
    )
  }

  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-token-xs">
          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className={cn(
          'flex items-center',
          icon && 'space-x-1'
        )}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </div>
      )}
    </button>
  )
}

export type ButtonVariant = VariantProps<typeof buttonVariants>