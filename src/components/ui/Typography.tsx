'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const typographyVariants = cva('', {
  variants: {
    variant: {
      display: 'type-display text-ink',
      heading: 'type-heading text-ink',
      title: 'type-title text-ink',
      body: 'type-body text-body',
      eyebrow: 'type-eyebrow text-body-muted',
      caption: 'type-caption text-body-muted',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'body',
    align: 'left',
  },
})

type TypographyProps<T extends React.ElementType> = VariantProps<typeof typographyVariants> & {
  as?: T
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

export function Typography<T extends React.ElementType = 'p'>({
  variant,
  align,
  as,
  className,
  children,
  ...props
}: TypographyProps<T>) {
  const Component = (as ?? 'p') as React.ElementType

  return (
    <Component className={cn(typographyVariants({ variant, align }), className)} {...props}>
      {children}
    </Component>
  )
}

export type { TypographyProps }
