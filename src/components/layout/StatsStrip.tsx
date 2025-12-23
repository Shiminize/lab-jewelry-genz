import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatItem {
  label: ReactNode
  value: ReactNode
}

export interface StatsStripProps extends HTMLAttributes<HTMLDListElement> {
  items: StatItem[]
  align?: 'start' | 'center' | 'end'
  columns?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
}

const breakpointPrefix: Record<Exclude<keyof StatsStripProps['columns'], 'base'>, string> = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
  '2xl': '2xl:',
}

function toGridClasses(columns: StatsStripProps['columns'] = {}): string[] {
  const merged = { base: 3, ...columns }
  const classes: string[] = []

  Object.entries(merged).forEach(([key, value]) => {
    if (!value) return
    const prefix = key === 'base' ? '' : breakpointPrefix[key as keyof typeof breakpointPrefix] ?? ''
    classes.push(`${prefix}grid-cols-${value}`)
  })

  return classes
}

export function StatsStrip({ items, className, align = 'start', columns, ...rest }: StatsStripProps) {
  if (!items.length) return null

  const containerAlignment = align === 'center' ? 'justify-items-center sm:justify-items-start' : align === 'end' ? 'justify-items-end' : 'justify-items-start'
  const itemAlignment =
    align === 'center'
      ? 'text-center sm:text-left'
      : align === 'end'
      ? 'text-right'
      : 'text-left'

  return (
    <dl className={cn('grid gap-6 text-body', containerAlignment, toGridClasses(columns), className)} {...rest}>
      {items.map((item, index) => (
        <div key={index} className={cn('space-y-2', itemAlignment)}>
          <dt className="type-eyebrow">{item.label}</dt>
          <dd className="type-title">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
