'use client'

import { ReactNode, FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface FormProps {
  children: ReactNode
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  className?: string
  errors?: string[]
  title?: string
  description?: string
}

interface FormFieldProps {
  children: ReactNode
  label?: string
  required?: boolean
  error?: string
  description?: string
  className?: string
}

interface FormActionsProps {
  children: ReactNode
  className?: string
}

export function Form({
  children,
  onSubmit,
  className,
  errors,
  title,
  description
}: FormProps) {
  return (
    <div className={cn('space-y-token-lg', className)}>
      {title && (
        <div className="space-y-token-sm">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {errors && errors.length > 0 && (
        <div className="bg-error/10 border border-error/30 rounded-token-lg p-token-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-error" />
            <span className="text-sm font-medium text-error">
              Please fix the following errors:
            </span>
          </div>
          <ul className="list-disc list-inside text-sm text-error space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-token-lg">
        {children}
      </form>
    </div>
  )
}

export function FormField({
  children,
  label,
  required,
  error,
  description,
  className
}: FormFieldProps) {
  return (
    <div className={cn('space-y-token-sm', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-error flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

export function FormActions({
  children,
  className
}: FormActionsProps) {
  return (
    <div className={cn(
      'flex items-center justify-end gap-token-sm pt-token-md border-t border-border',
      className
    )}>
      {children}
    </div>
  )
}