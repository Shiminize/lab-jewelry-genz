'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Enhanced typography variants with luxury jewelry focus
const displayVariants = cva(
  'typography-display',
  {
    variants: {
      gradient: {
        true: 'typography-display-gradient',
        false: ''
      }
    },
    defaultVariants: {
      gradient: false
    }
  }
)

const headlineVariants = cva(
  'font-headline text-foreground',
  {
    variants: {
      level: {
        h1: 'typography-h1',
        h2: 'typography-h2', 
        h3: 'typography-h3',
        h4: 'typography-h4',
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
        sm: 'typography-body-sm',
        md: 'typography-body',
        lg: 'typography-body-lg',
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

const priceVariants = cva(
  'font-headline',
  {
    variants: {
      size: {
        display: 'typography-price-display',
        small: 'typography-price-small'
      }
    },
    defaultVariants: {
      size: 'display'
    }
  }
)

const jewelrySpecVariants = cva(
  'font-body',
  {
    variants: {
      type: {
        carat: 'typography-carat-display',
        metal: 'typography-metal-type',
        caption: 'typography-caption'
      }
    },
    defaultVariants: {
      type: 'caption'
    }
  }
)

// Display Component
interface DisplayProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof displayVariants> {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'div'
}

export function DisplayText({ className, gradient = false, as = 'h1', children, ...props }: DisplayProps) {
  const Component = as
  return (
    <Component className={cn(displayVariants({ gradient }), className)} {...props}>
      {children}
    </Component>
  )
}

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
// Price Display Components
interface PriceDisplayProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof priceVariants> {
  children: React.ReactNode
  currency?: string
  as?: 'span' | 'div' | 'p'
}

export function PriceDisplay({ 
  className, 
  size = 'display', 
  currency = '$',
  as = 'span', 
  children, 
  ...props 
}: PriceDisplayProps) {
  const Component = as
  return (
    <Component className={cn(priceVariants({ size }), className)} {...props}>
      {currency}{children}
    </Component>
  )
}

// Jewelry Specification Components
interface JewelrySpecProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof jewelrySpecVariants> {
  children: React.ReactNode
  as?: 'span' | 'div' | 'p'
}

export function CaratDisplay({ className, type = 'carat', as = 'span', children, ...props }: JewelrySpecProps) {
  const Component = as
  return (
    <Component className={cn(jewelrySpecVariants({ type }), className)} {...props}>
      {children}
    </Component>
  )
}

export function MetalTypeDisplay({ className, type = 'metal', as = 'span', children, ...props }: JewelrySpecProps) {
  const Component = as
  return (
    <Component className={cn(jewelrySpecVariants({ type }), className)} {...props}>
      {children}
    </Component>
  )
}

interface MutedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  size?: 'sm' | 'md'
  variant?: 'default' | 'light'
}

export function MutedText({ className, size = 'md', variant = 'default', children, ...props }: MutedTextProps) {
  const sizeClass = size === 'sm' ? 'typography-body-sm' : 'typography-body'
  const colorClass = 'text-muted' // CLAUDE_RULES compliant: Aurora muted text color
  return (
    <span className={cn('font-body', colorClass, sizeClass, className)} {...props}>
      {children}
    </span>
  )
}

// Caption Text Component
interface CaptionTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  as?: 'span' | 'div' | 'p'
}

export function CaptionText({ className, as = 'span', children, ...props }: CaptionTextProps) {
  const Component = as
  return (
    <Component className={cn('typography-caption', className)} {...props}>
      {children}
    </Component>
  )
}

interface CTATextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  as?: 'span' | 'div' | 'button'
}

export function CTAText({ className, as = 'span', children, ...props }: CTATextProps) {
  const Component = as
  return (
    <Component className={cn('typography-cta', className)} {...props}>
      {children}
    </Component>
  )
}

// Navigation Typography Components
interface NavTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'category'
  as?: 'span' | 'div' | 'p'
}

export function NavText({ 
  className, 
  variant = 'primary', 
  as = 'span', 
  children, 
  ...props 
}: NavTextProps) {
  const Component = as
  const variantClass = {
    primary: 'typography-nav-primary',
    secondary: 'typography-nav-secondary', 
    category: 'typography-nav-category'
  }[variant]
  
  return (
    <Component className={cn(variantClass, className)} {...props}>
      {children}
    </Component>
  )
}

// Link Typography Component
interface LinkTextProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
  href: string
}

export function LinkText({ className, children, ...props }: LinkTextProps) {
  return (
    <a className={cn('typography-link', className)} {...props}>
      {children}
    </a>
  )
}