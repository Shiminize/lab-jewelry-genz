'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  children: ReactNode
  title?: string
  subtitle?: string
  description?: string
  variant?: 'default' | 'muted' | 'card' | 'aurora'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  centered?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
}

const getSizeClasses = (size: SectionProps['size']): string => {
  switch (size) {
    case 'sm': return 'py-token-lg px-token-md'
    case 'md': return 'py-token-xl px-token-lg'
    case 'lg': return 'py-token-2xl px-token-xl'
    case 'xl': return 'py-token-3xl px-token-2xl'
    default: return 'py-token-xl px-token-lg'
  }
}

const getVariantClasses = (variant: SectionProps['variant']): string => {
  switch (variant) {
    case 'muted':
      return 'bg-muted/50'
    case 'card':
      return 'bg-background border border-border rounded-token-lg shadow-sm'
    case 'aurora':
      return 'bg-gradient-to-r from-aurora-deep-space/5 via-aurora-nebula-purple/5 to-aurora-pink/5'
    default:
      return 'bg-background'
  }
}

const getTitleSize = (size: SectionProps['size']): string => {
  switch (size) {
    case 'sm': return 'text-lg'
    case 'md': return 'text-xl'
    case 'lg': return 'text-2xl'
    case 'xl': return 'text-3xl'
    default: return 'text-xl'
  }
}

export function Section({
  children,
  title,
  subtitle,
  description,
  variant = 'default',
  size = 'md',
  centered = false,
  className,
  headerClassName,
  contentClassName
}: SectionProps) {
  const hasHeader = title || subtitle || description

  return (
    <section
      className={cn(
        getSizeClasses(size),
        getVariantClasses(variant),
        className
      )}
    >
      <div className={cn(
        'max-w-7xl mx-auto',
        centered && 'text-center'
      )}>
        {hasHeader && (
          <header className={cn(
            'space-y-token-sm mb-token-lg',
            headerClassName
          )}>
            {subtitle && (
              <div className="text-sm font-medium text-aurora-nebula-purple uppercase tracking-wide">
                {subtitle}
              </div>
            )}
            {title && (
              <h2 className={cn(
                'font-semibold text-foreground',
                getTitleSize(size)
              )}>
                {title}
              </h2>
            )}
            {description && (
              <p className="text-muted-foreground max-w-3xl">
                {description}
              </p>
            )}
          </header>
        )}
        
        <div className={cn(
          'w-full',
          contentClassName
        )}>
          {children}
        </div>
      </div>
    </section>
  )
}

// Specialized section variants for common use cases
export function HeroSection({ children, ...props }: SectionProps) {
  return (
    <Section
      {...props}
      variant="aurora"
      size="xl"
      centered
      className={cn('relative overflow-hidden', props.className)}
    >
      {children}
    </Section>
  )
}

export function ContentSection({ children, ...props }: SectionProps) {
  return (
    <Section
      {...props}
      variant="default"
      size="lg"
      className={props.className}
    >
      {children}
    </Section>
  )
}

export function FeatureSection({ children, ...props }: SectionProps) {
  return (
    <Section
      {...props}
      variant="muted"
      size="lg"
      centered
      className={props.className}
    >
      {children}
    </Section>
  )
}