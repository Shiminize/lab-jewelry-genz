'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Aurora Design System Typography Variants (CLAUDE_RULES compliant - new file)
const auroraVariants = cva(
  '', // Base class handled by size variant
  {
    variants: {
      size: {
        hero: 'aurora-hero',
        statement: 'aurora-statement', 
        'title-xl': 'aurora-title-xl',
        'title-l': 'aurora-title-l',
        'title-m': 'aurora-title-m',
        'body-xl': 'aurora-body-xl',
        'body-l': 'aurora-body-l',
        'body-m': 'aurora-body-m',
        small: 'aurora-small',
        micro: 'aurora-micro'
      },
      gradient: {
        true: 'aurora-gradient-text',
        false: ''
      }
    },
    defaultVariants: {
      size: 'body-m',
      gradient: false
    }
  }
)

interface AuroraTextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof auroraVariants> {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
}

export function AuroraText({ 
  className, 
  size = 'body-m', 
  gradient = false, 
  as = 'p', 
  children, 
  ...props 
}: AuroraTextProps) {
  const Component = as
  return (
    <Component className={cn(auroraVariants({ size, gradient }), className)} {...props}>
      {children}
    </Component>
  )
}

// Aurora Specific Components for better developer experience
export function AuroraHero({ className, gradient = false, as = 'h1', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="hero" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}

export function AuroraStatement({ className, gradient = false, as = 'h1', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="statement" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}

export function AuroraTitleXL({ className, gradient = false, as = 'h2', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="title-xl" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}

export function AuroraTitleL({ className, gradient = false, as = 'h3', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="title-l" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}

export function AuroraTitleM({ className, gradient = false, as = 'h4', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="title-m" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}

export function AuroraBodyXL({ className, gradient = false, as = 'p', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="body-xl" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}

export function AuroraBodyL({ className, gradient = false, as = 'p', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="body-l" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}

export function AuroraBodyM({ className, gradient = false, as = 'p', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="body-m" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}

export function AuroraSmall({ className, gradient = false, as = 'span', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="small" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}

export function AuroraMicro({ className, gradient = false, as = 'span', children, ...props }: Omit<AuroraTextProps, 'size'>) {
  return <AuroraText size="micro" gradient={gradient} as={as} className={className} {...props}>{children}</AuroraText>
}