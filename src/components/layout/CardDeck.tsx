'use client'

import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CardDeckProps {
  children: ReactNode
  className?: string
  gapClassName?: string
  columns?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  /**
   * When true, cards auto-fit based on the James Allen width tokens.
   */
  autoFit?: boolean
}

const breakpointPrefix: Record<Exclude<keyof CardDeckProps['columns'], 'base'>, string> = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
  '2xl': '2xl:',
}

const gridCountClass: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}

function toGridClasses(columns: CardDeckProps['columns'] = {}): string[] {
  const merged = { base: 1, ...columns }
  const classes: string[] = []

  Object.entries(merged).forEach(([key, value]) => {
    if (!value) return
    const baseClass = gridCountClass[value]
    if (!baseClass) return
    const prefix = key === 'base' ? '' : breakpointPrefix[key as keyof typeof breakpointPrefix] ?? ''
    classes.push(`${prefix}${baseClass}`)
  })

  return classes
}

export function CardDeck({ children, className, gapClassName = 'gap-6', columns, autoFit = false }: CardDeckProps) {
  const style: CSSProperties | undefined = autoFit
    ? {
        gridTemplateColumns: 'repeat(auto-fit, minmax(var(--ja-card-width-min), var(--ja-card-width-max)))',
        justifyContent: 'center',
      }
    : undefined

  return (
    <div
      className={cn('grid', gapClassName, ...(autoFit ? [] : toGridClasses(columns)), autoFit && 'justify-items-stretch', className)}
      style={style}
    >
      {children}
    </div>
  )
}
