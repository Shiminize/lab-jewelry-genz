'use client'

import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  selected?: boolean
  variant?: 'default' | 'outline'
}

export function Chip({ 
  selected = false, 
  variant = 'default',
  className, 
  children, 
  ...props 
}: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium transition-colors duration-200',
        variant === 'default' && selected && 'bg-accent-primary text-surface-base border border-transparent',
        variant === 'default' && !selected && 'bg-surface-panel text-text-secondary border border-transparent hover:bg-surface-panel/80',
        variant === 'outline' && selected && 'border-accent-primary text-accent-primary bg-accent-primary/5',
        variant === 'outline' && !selected && 'border-border-strong text-text-secondary hover:border-accent-primary/50',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
