'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-md border px-4 py-3 text-sm font-body',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        warning: 'bg-accent/10 text-foreground border-accent/50',
        error: 'bg-error/10 text-foreground border-error/50',
        success: 'bg-cta/10 text-foreground border-cta/50',
        info: 'bg-accent/10 text-foreground border-accent/50'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  children: React.ReactNode
  icon?: React.ReactNode
}

export function Alert({ className, variant, children, icon, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start space-x-2">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function AlertTitle({ className, children, ...props }: AlertTitleProps) {
  return (
    <h5
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  )
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function AlertDescription({ className, children, ...props }: AlertDescriptionProps) {
  return (
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  )
}