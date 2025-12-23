'use client'

import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'glass' | 'day'
}

export function Card({ className, variant = 'glass', children, ...props }: CardProps) {
  const base = 'rounded-xl border transition duration-300'
  const styles =
    variant === 'glass'
      ? 'border-surface-base/20 bg-surface-base/25 backdrop-blur-xl'
      : variant === 'day'
        ? 'border-border-subtle bg-surface-base shadow-soft hover:shadow-medium'
        : 'border-transparent bg-surface-panel shadow-soft'

  return (
    <div className={cn(base, styles, className)} {...props}>
      {children}
    </div>
  )
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('mb-4 flex flex-col gap-2', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('mt-6 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  )
}
