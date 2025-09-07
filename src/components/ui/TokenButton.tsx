'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tokenButtonVariants = cva(
  // Base styles using ONLY tokens from tailwind.config.js
  'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-in-out focus:outline-2 focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer border-none rounded-token-md',
  {
    variants: {
      variant: {
        // Primary: Aurora Design System gradient with token compliance
        primary: 'text-neutral-0 bg-gradient-primary hover:brightness-115 hover:scale-101 shadow-near hover:shadow-hover',
        
        // Secondary: Luna grey background with token spacing
        secondary: 'bg-neutral-50 text-neutral-900 border border-neutral-200 hover:bg-neutral-0 hover:brightness-115 hover:scale-101',
        
        // Tertiary: Aurora pink accent
        tertiary: 'bg-gradient-tertiary text-neutral-0 hover:brightness-115 hover:scale-101 shadow-near hover:shadow-hover',
        
        // Ghost: Transparent with token hover states
        ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-50 hover:brightness-115 hover:scale-101',
        
        // Outline: Border-focused with token colors
        outline: 'bg-transparent text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-neutral-0 hover:brightness-115 hover:scale-101'
      },
      size: {
        // Proper Tailwind utilities mapped to design-tokens.css values
        sm: 'px-2 py-1 text-sm min-h-[2rem]',        // 8px, 4px, 32px
        md: 'px-4 py-2 text-base min-h-[2.75rem]',   // 16px, 8px, 44px (token-size-button-height)
        lg: 'px-6 py-4 text-lg min-h-[3.5rem]',     // 24px, 16px, 56px
        xl: 'px-8 py-4 text-xl min-h-[4rem]'        // 32px, 16px, 64px
      },
      state: {
        // Interactive states with tokens
        default: '',
        loading: 'cursor-wait opacity-75',
        success: 'bg-gradient-to-r from-brand-success to-brand-success-light',
        error: 'bg-gradient-to-r from-brand-error to-brand-error-light'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      state: 'default'
    }
  }
)

interface TokenButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tokenButtonVariants> {
  children: React.ReactNode
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export function TokenButton({ 
  className,
  variant,
  size,
  state,
  children,
  isLoading = false,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}: TokenButtonProps) {
  const isDisabled = disabled || isLoading
  const buttonState = isLoading ? 'loading' : state

  return (
    <button
      type="button"
      className={cn(tokenButtonVariants({ variant, size, state: buttonState }), className)}
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

export type TokenButtonVariant = VariantProps<typeof tokenButtonVariants>