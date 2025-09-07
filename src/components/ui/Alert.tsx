'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full border px-4 py-3 text-sm font-body aurora-living-component aurora-interactive-shadow rounded-token-md', // Aurora border radius: medium (8px)
  {
    variants: {
      variant: {
        default: 'bg-lunar-grey text-deep-space border-border',
        warning: 'bg-amber-glow/10 text-deep-space border-amber-glow/30 aurora-shimmer-overlay', // Aurora warning color
        error: 'bg-error/10 text-deep-space border-error/30', // Aurora error color
        success: 'bg-emerald-flash/10 text-deep-space border-emerald-flash/30', // Aurora success color
        info: 'bg-nebula-purple/10 text-deep-space border-nebula-purple/30', // Aurora info color
        aurora: 'bg-gradient-to-r from-aurora-pink/10 to-aurora-plum/10 text-deep-space border-aurora-pink/30 aurora-pulse'
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
      <div className="flex items-start space-x-token-sm">
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