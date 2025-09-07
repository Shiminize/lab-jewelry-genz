'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GridProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto-fit' | 'auto-fill'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6
    md?: 1 | 2 | 3 | 4 | 5 | 6
    lg?: 1 | 2 | 3 | 4 | 5 | 6
    xl?: 1 | 2 | 3 | 4 | 5 | 6
  }
  className?: string
}

interface GridItemProps {
  children: ReactNode
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 'full'
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6
    md?: 1 | 2 | 3 | 4 | 5 | 6
    lg?: 1 | 2 | 3 | 4 | 5 | 6
    xl?: 1 | 2 | 3 | 4 | 5 | 6
  }
  className?: string
}

const getGridCols = (cols: GridProps['cols']): string => {
  switch (cols) {
    case 1: return 'grid-cols-1'
    case 2: return 'grid-cols-2'
    case 3: return 'grid-cols-3'
    case 4: return 'grid-cols-4'
    case 5: return 'grid-cols-5'
    case 6: return 'grid-cols-6'
    case 'auto-fit': return 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]'
    case 'auto-fill': return 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]'
    default: return 'grid-cols-1'
  }
}

const getGap = (gap: GridProps['gap']): string => {
  switch (gap) {
    case 'sm': return 'gap-token-sm'
    case 'md': return 'gap-token-md'
    case 'lg': return 'gap-token-lg'
    case 'xl': return 'gap-token-xl'
    default: return 'gap-token-md'
  }
}

const getResponsiveClasses = (responsive?: GridProps['responsive']): string => {
  if (!responsive) return ''
  
  const classes: string[] = []
  if (responsive.sm) classes.push(`sm:grid-cols-${responsive.sm}`)
  if (responsive.md) classes.push(`md:grid-cols-${responsive.md}`)
  if (responsive.lg) classes.push(`lg:grid-cols-${responsive.lg}`)
  if (responsive.xl) classes.push(`xl:grid-cols-${responsive.xl}`)
  
  return classes.join(' ')
}

const getItemSpan = (span: GridItemProps['span']): string => {
  switch (span) {
    case 1: return 'col-span-1'
    case 2: return 'col-span-2'
    case 3: return 'col-span-3'
    case 4: return 'col-span-4'
    case 5: return 'col-span-5'
    case 6: return 'col-span-6'
    case 'full': return 'col-span-full'
    default: return 'col-span-1'
  }
}

const getItemResponsiveClasses = (responsive?: GridItemProps['responsive']): string => {
  if (!responsive) return ''
  
  const classes: string[] = []
  if (responsive.sm) classes.push(`sm:col-span-${responsive.sm}`)
  if (responsive.md) classes.push(`md:col-span-${responsive.md}`)
  if (responsive.lg) classes.push(`lg:col-span-${responsive.lg}`)
  if (responsive.xl) classes.push(`xl:col-span-${responsive.xl}`)
  
  return classes.join(' ')
}

export function Grid({
  children,
  cols = 1,
  gap = 'md',
  responsive,
  className
}: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        getGridCols(cols),
        getGap(gap),
        getResponsiveClasses(responsive),
        className
      )}
    >
      {children}
    </div>
  )
}

export function GridItem({
  children,
  span = 1,
  responsive,
  className
}: GridItemProps) {
  return (
    <div
      className={cn(
        getItemSpan(span),
        getItemResponsiveClasses(responsive),
        className
      )}
    >
      {children}
    </div>
  )
}