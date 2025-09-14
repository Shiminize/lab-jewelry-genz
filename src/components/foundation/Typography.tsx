import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Re-export Aurora Typography components from separate file (CLAUDE_RULES compliant)
export * from './AuroraTypography'

// Specialized typography components removed as they were unused

// Export helpful aliases to migrate from legacy to Aurora typography
export { 
  AuroraHero as Hero,
  AuroraStatement as Statement, 
  AuroraTitleXL as TitleXL,
  AuroraTitleL as TitleL,
  AuroraTitleM as TitleM,
  AuroraBodyXL as BodyXL,
  AuroraBodyL as BodyL,
  AuroraBodyM as BodyM,
  AuroraSmall as Small,
  AuroraMicro as Micro
} from './AuroraTypography'

// Legacy display variants (maintained for backward compatibility)
const displayVariants = cva(
  'aurora-hero', // Map to Aurora Hero for display text
  {
    variants: {
      gradient: {
        true: 'bg-gradient-to-r from-accent via-foreground to-accent bg-clip-text text-transparent',
        false: ''
      }
    },
    defaultVariants: {
      gradient: false
    }
  }
)

const headlineVariants = cva(
  '', // Base handled by Aurora classes
  {
    variants: {
      level: {
        h1: 'aurora-title-xl', // Map to Aurora Title XL (clamp 2rem-3rem)
        h2: 'aurora-title-l',  // Map to Aurora Title L (clamp 1.5rem-2.25rem)
        h3: 'aurora-title-m',  // Map to Aurora Title M (clamp 1.25rem-1.75rem)
        h4: 'aurora-body-xl',  // Map to Aurora Body XL (clamp 1.125rem-1.5rem)
      }
    },
    defaultVariants: {
      level: 'h1'
    }
  }
)

const bodyVariants = cva(
  '', // Base handled by Aurora classes
  {
    variants: {
      size: {
        sm: 'aurora-small',   // Map to Aurora Small (0.875rem)
        md: 'aurora-body-m',  // Map to Aurora Body M (1rem)
        lg: 'aurora-body-l',  // Map to Aurora Body L (1.125rem)
      },
      weight: {
        regular: '', // Weight handled by Aurora classes
        medium: '',  // Weight handled by Aurora classes  
        semibold: '', // Weight handled by Aurora classes
      }
    },
    defaultVariants: {
      size: 'md',
      weight: 'regular'
    }
  }
)

// Specialized variants moved to SpecializedTypography.tsx for Claude Rules compliance

// ===== LEGACY COMPONENTS (MAINTAINED FOR COMPATIBILITY) =====

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

// Specialized text components moved to SpecializedTypography.tsx for Claude Rules compliance

interface MutedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'light'
}

export function MutedText({ className, size = 'md', variant = 'default', children, ...props }: MutedTextProps) {
  // Map size props to Aurora components for backward compatibility
  const sizeClass = {
    xs: 'aurora-micro',
    sm: 'aurora-small', 
    md: 'aurora-body-m',
    lg: 'aurora-body-l',
    xl: 'aurora-body-xl'
  }[size] || 'aurora-body-m'
  
  const colorClass = 'text-muted' // CLAUDE_RULES compliant: Aurora muted text color
  return (
    <span className={cn(sizeClass, colorClass, className)} {...props}>
      {children}
    </span>
  )
}

// Caption Text Component
// Caption, CTA, Nav, and Link components moved to SpecializedTypography.tsx for Claude Rules compliance