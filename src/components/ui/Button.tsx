'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-body font-semibold transition-all focus:outline-2 focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer border-none rounded-lg',
  {
    variants: {
      variant: {
        // CLAUDE_RULES Compliant Button System
        primary: 'bg-cta text-high-contrast hover:bg-cta-hover hover:transform hover:-translate-y-0.5 shadow-sm hover:shadow-md',
        secondary: 'bg-background text-foreground border border-border hover:bg-muted shadow-sm',
        outline: 'bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-background',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        accent: 'bg-accent text-foreground hover:opacity-90 shadow-sm'
      },
      size: {
        // CLAUDE_RULES Button Sizes: Primary/Secondary (3 sizes) + Outline/Ghost/Accent (flexible)
        sm: 'min-h-9 px-4 text-sm', // 36px min-height, 16px padding
        md: 'min-h-11 px-6 text-base', // 44px min-height, 24px padding  
        lg: 'min-h-12 px-12 text-lg', // 48px min-height, 48px padding
        icon: 'w-9 h-9 p-0',
        'icon-lg': 'w-11 h-11 p-0'
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
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className={cn(
          'flex items-center',
          icon && 'space-x-2'
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