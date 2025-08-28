'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Typography variants following the design system
const headlineVariants = cva(
  'font-headline text-foreground',
  {
    variants: {
      level: {
        h1: 'text-4xl lg:text-5xl font-bold tracking-tight leading-tight',
        h2: 'text-2xl lg:text-3xl font-semibold tracking-tight leading-tight',
        h3: 'text-xl lg:text-2xl font-semibold tracking-tight leading-snug',
        h4: 'text-lg lg:text-xl font-semibold leading-snug',
      }
    },
    defaultVariants: {
      level: 'h1'
    }
  }
)

const bodyVariants = cva(
  'font-body text-foreground',
  {
    variants: {
      size: {
        sm: 'text-sm leading-relaxed',
        md: 'text-base leading-relaxed',
        lg: 'text-lg leading-relaxed',
      },
      weight: {
        regular: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
      }
    },
    defaultVariants: {
      size: 'md',
      weight: 'regular'
    }
  }
)

// Headline Components
interface HeadlineProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headlineVariants> {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function H1({ className, level = 'h1', as = 'h1', children, ...props }: HeadlineProps) {
  const Component = as
  return (
    <Component className={cn(headlineVariants({ level }), className)} {...props}>
      {children}
    </Component>
  )
}

export function H2({ className, level = 'h2', as = 'h2', children, ...props }: HeadlineProps) {
  const Component = as
  return (
    <Component className={cn(headlineVariants({ level }), className)} {...props}>
      {children}
    </Component>
  )
}

export function H3({ className, level = 'h3', as = 'h3', children, ...props }: HeadlineProps) {
  const Component = as
  return (
    <Component className={cn(headlineVariants({ level }), className)} {...props}>
      {children}
    </Component>
  )
}

export function H4({ className, level = 'h4', as = 'h4', children, ...props }: HeadlineProps) {
  const Component = as
  return (
    <Component className={cn(headlineVariants({ level }), className)} {...props}>
      {children}
    </Component>
  )
}

// Body Text Components
interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof bodyVariants> {
  children: React.ReactNode
  as?: 'p' | 'span' | 'div'
}

export function BodyText({ 
  className, 
  size = 'md', 
  weight = 'regular', 
  as = 'p', 
  children, 
  ...props 
}: BodyTextProps) {
  const Component = as
  return (
    <Component className={cn(bodyVariants({ size, weight }), className)} {...props}>
      {children}
    </Component>
  )
}

// Specialized text components
interface MutedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  size?: 'sm' | 'md'
  variant?: 'default' | 'light' // Add variant for different muted levels
}

export function MutedText({ className, size = 'md', variant = 'default', children, ...props }: MutedTextProps) {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-base'
  const colorClass = 'text-aurora-nav-muted' // CLAUDE_RULES compliant: approved combination #2 (text-aurora-nav-muted bg-background)
  return (
    <span className={cn('font-body', colorClass, sizeClass, className)} {...props}>
      {children}
    </span>
  )
}

interface CTATextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function CTAText({ className, size = 'md', children, ...props }: CTATextProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base', 
    lg: 'text-lg'
  }
  
  return (
    <span 
      className={cn(
        'font-body font-semibold text-foreground uppercase tracking-wider', 
        sizeClasses[size], 
        className
      )} 
      {...props}
    >
      {children}
    </span>
  )
}