'use client'

import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tokenInputVariants = cva(
  // Base styles using ONLY tokens from tailwind.config.js - CLAUDE_RULES compliant
  'flex w-full transition-all duration-300 ease-in-out focus:outline-2 focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500',
  {
    variants: {
      variant: {
        // Default: Clean input with token borders and focus states
        default: 'border border-neutral-200 bg-neutral-0 text-neutral-900 hover:border-neutral-300 focus:border-brand-primary focus:brightness-115',
        
        // Filled: Aurora background with subtle elevation
        filled: 'bg-neutral-50 border border-transparent text-neutral-900 hover:bg-neutral-25 focus:bg-neutral-0 focus:border-brand-primary focus:brightness-115',
        
        // Outline: Emphasized border with token colors
        outline: 'border-2 border-neutral-300 bg-neutral-0 text-neutral-900 hover:border-brand-primary/50 focus:border-brand-primary focus:brightness-115',
        
        // Ghost: Minimal with hover states
        ghost: 'border-0 bg-transparent text-neutral-900 hover:bg-neutral-50 focus:bg-neutral-25 focus:ring-1 focus:brightness-115'
      },
      size: {
        // Token-based sizing matching design-tokens.css values
        sm: 'px-2 py-1 text-sm h-8 rounded-token-sm',          // 32px height, 8px padding
        md: 'px-4 py-2 text-base h-11 rounded-token-md',       // 44px height, 16px padding (token-size-button-height)
        lg: 'px-6 py-3 text-lg h-14 rounded-token-lg'          // 56px height, 24px padding
      },
      state: {
        // Interactive states with token compliance
        default: '',
        error: 'border-brand-error focus:border-brand-error focus:ring-brand-error text-brand-error',
        success: 'border-brand-success focus:border-brand-success focus:ring-brand-success',
        warning: 'border-brand-warning focus:border-brand-warning focus:ring-brand-warning'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default'
    }
  }
)

interface TokenInputProps 
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof tokenInputVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const TokenInput = forwardRef<HTMLInputElement, TokenInputProps>(({
  className,
  variant,
  size,
  state,
  label,
  helperText,
  errorMessage,
  startIcon,
  endIcon,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const hasError = !!errorMessage
  const inputState = hasError ? 'error' : state

  return (
    <div className="w-full space-y-token-xs">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-token-sm font-medium text-neutral-900 mb-token-xs"
        >
          {label}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Start Icon */}
        {startIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
            {startIcon}
          </div>
        )}
        
        {/* Input */}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            tokenInputVariants({ variant, size, state: inputState }),
            startIcon && 'pl-10',
            endIcon && 'pr-10',
            className
          )}
          {...props}
        />
        
        {/* End Icon */}
        {endIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
            {endIcon}
          </div>
        )}
      </div>
      
      {/* Helper Text / Error Message */}
      {(helperText || errorMessage) && (
        <p className={cn(
          'text-token-xs mt-token-xs',
          hasError ? 'text-brand-error' : 'text-neutral-600'
        )}>
          {hasError ? errorMessage : helperText}
        </p>
      )}
    </div>
  )
})

TokenInput.displayName = 'TokenInput'

export type TokenInputVariant = VariantProps<typeof tokenInputVariants>