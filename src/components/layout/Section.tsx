'use client'

import { cn } from '@/lib/utils'
import type { ElementType, HTMLAttributes, ReactNode } from 'react'

type SectionSpacing = 'none' | 'tight' | 'compact' | 'relaxed'

const sectionSpacingClassName: Record<SectionSpacing, string> = {
  none: 'section-spacing-none',
  tight: 'section-spacing-tight',
  compact: 'section-spacing-compact',
  relaxed: 'section-spacing-relaxed',
}

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  variant?: 'surface' | 'transparent'
  spacing?: SectionSpacing
  children: ReactNode
}

export function Section({
  as: Component = 'section',
  variant = 'surface',
  spacing = 'relaxed',
  className,
  children,
  ...rest
}: SectionProps) {
  const variantClass = variant === 'surface' ? 'bg-app' : ''

  return (
    <Component className={cn('relative', sectionSpacingClassName[spacing], variantClass, className)} {...rest}>
      {children}
    </Component>
  )
}

type SectionContainerSize = 'content' | 'gallery' | 'wide' | 'max' | 'full'

interface SectionContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  size?: SectionContainerSize
  bleed?: boolean
}

const sizeClassName: Record<Exclude<SectionContainerSize, 'full'>, string> = {
  content: 'mx-auto w-full max-w-[var(--ja-layout-content)]',
  gallery: 'mx-auto w-full max-w-[var(--ja-layout-gallery)]',
  wide: 'mx-auto w-full max-w-[var(--ja-layout-wide)]',
  max: 'mx-auto w-full max-w-[var(--ja-layout-max)]',
}

const paddingClassName: Record<SectionContainerSize, string> = {
  content: 'px-6 sm:px-8 md:px-12 xl:px-14',
  gallery: 'px-4 sm:px-6 md:px-10 xl:px-[56px]',
  wide: 'px-6 sm:px-10 md:px-14 xl:px-[56px]',
  max: 'px-6 sm:px-10 md:px-14 xl:px-[56px]',
  full: 'px-6 sm:px-10 md:px-16 xl:px-24',
}

export function SectionContainer({ className, children, size = 'full', bleed = false, ...rest }: SectionContainerProps) {
  const sizeClasses = size === 'full' ? '' : sizeClassName[size]
  const padding = bleed ? 'px-0' : paddingClassName[size]

  return (
    <div className={cn('w-full', padding, sizeClasses, className)} {...rest}>
      {children}
    </div>
  )
}
