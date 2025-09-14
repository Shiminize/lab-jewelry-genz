import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Price Display Components
const priceVariants = cva(
  '', // Base handled by Aurora classes
  {
    variants: {
      size: {
        display: 'aurora-price-hero', // Map to Aurora Price Hero
        small: 'aurora-price'         // Map to Aurora Price
      }
    },
    defaultVariants: {
      size: 'display'
    }
  }
)

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
const jewelrySpecVariants = cva(
  '', // Base handled by Aurora classes  
  {
    variants: {
      type: {
        carat: 'aurora-micro',   // Map to Aurora Micro (uppercase, small)
        metal: 'aurora-micro',   // Map to Aurora Micro (uppercase, small)  
        caption: 'aurora-small' // Map to Aurora Small
      }
    },
    defaultVariants: {
      type: 'caption'
    }
  }
)

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

// Caption Text Component
interface CaptionTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  as?: 'span' | 'div' | 'p'
}

export function CaptionText({ className, as = 'span', children, ...props }: CaptionTextProps) {
  const Component = as
  return (
    <Component className={cn('aurora-small text-muted', className)} {...props}>
      {children}
    </Component>
  )
}

// CTA Text Component
interface CTATextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  as?: 'span' | 'div' | 'button'
}

export function CTAText({ className, as = 'span', children, ...props }: CTATextProps) {
  const Component = as
  return (
    <Component className={cn('aurora-body-m font-semibold text-accent', className)} {...props}>
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
    primary: 'aurora-body-m font-medium text-foreground',
    secondary: 'aurora-small text-muted', 
    category: 'aurora-body-m font-semibold text-accent'
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
    <a className={cn('aurora-body-m text-accent hover:text-accent/80 underline', className)} {...props}>
      {children}
    </a>
  )
}

// Export types
export type PriceDisplayVariant = VariantProps<typeof priceVariants>
export type JewelrySpecVariant = VariantProps<typeof jewelrySpecVariants>