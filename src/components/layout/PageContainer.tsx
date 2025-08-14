'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: 'main' | 'section' | 'div' | 'article'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}

const paddingClasses = {
  none: '',
  sm: 'px-4 py-6',
  md: 'px-4 py-8 md:px-6',
  lg: 'px-4 py-12 md:px-6 lg:px-8',
}

export function PageContainer({ 
  children, 
  className,
  maxWidth = '7xl',
  padding = 'md',
  as = 'div'
}: PageContainerProps) {
  const Component = as
  
  return (
    <Component 
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  )
}

interface SectionProps {
  children: React.ReactNode
  className?: string
  background?: 'default' | 'muted' | 'accent'
}

const backgroundClasses = {
  default: 'bg-background',
  muted: 'bg-muted/20',
  accent: 'bg-accent/5',
}

export function Section({ children, className, background = 'default' }: SectionProps) {
  return (
    <section className={cn(backgroundClasses[background], className)}>
      {children}
    </section>
  )
}

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}

const responsiveColsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
}

export function Grid({ 
  children, 
  className, 
  cols = 1, 
  gap = 'md', 
  responsive = true 
}: GridProps) {
  return (
    <div 
      className={cn(
        'grid',
        responsive ? responsiveColsClasses[cols] : colsClasses[cols],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

interface FlexProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

const directionClasses = {
  row: 'flex-row',
  col: 'flex-col',
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

const flexGapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export function Flex({ 
  children, 
  className,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md'
}: FlexProps) {
  return (
    <div 
      className={cn(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        flexGapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}