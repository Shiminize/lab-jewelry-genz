'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, hint, id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}
        
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-11 w-full rounded-md border border-border bg-background px-3 py-2',
            'text-sm text-foreground placeholder:text-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors',
            error && 'border-error focus:ring-error focus:border-error',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        
        {hint && !error && (
          <p 
            id={`${inputId}-hint`}
            className="mt-2 text-xs text-gray-600"
          >
            {hint}
          </p>
        )}
        
        {error && (
          <p 
            id={`${inputId}-error`}
            role="alert"
            className="mt-2 text-xs text-error"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s/g, '-')}`

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2',
            'text-sm text-foreground placeholder:text-muted resize-none',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors',
            error && 'border-error focus:ring-error focus:border-error',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
          }
          {...props}
        />
        
        {hint && !error && (
          <p 
            id={`${textareaId}-hint`}
            className="mt-2 text-xs text-gray-600"
          >
            {hint}
          </p>
        )}
        
        {error && (
          <p 
            id={`${textareaId}-error`}
            role="alert"
            className="mt-2 text-xs text-error"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'