/**
 * Progress Component
 * A customizable progress bar component following Claude Rules design system
 */

'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const progressVariants = cva(
  'w-full overflow-hidden rounded-full bg-muted',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2', 
        lg: 'h-3'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

const progressBarVariants = cva(
  'h-full transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-cta',
        accent: 'bg-accent',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressBarVariants> {
  value?: number
  max?: number
  showValue?: boolean
}

export function Progress({
  value = 0,
  max = 100,
  size,
  variant,
  showValue = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className="space-y-1">
      <div
        className={progressVariants({ size, className })}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className={progressBarVariants({ variant })}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}

export default Progress