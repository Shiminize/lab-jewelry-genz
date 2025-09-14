'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const tagChipVariants = cva(
  // Base styles
  'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-34 transition-all duration-200 cursor-pointer whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-muted/60 text-foreground hover:bg-muted/80 border border-muted-foreground/20',
        business: 'bg-cta/10 text-cta border border-cta/30 hover:bg-cta/20',
        sustainability: 'bg-success/10 text-success border border-success/30 hover:bg-success/15 dark:text-success',
        category: 'bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30',
        trending: 'bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/30 hover:from-primary/15 hover:to-accent/15'
      },
      size: {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-xs px-2 py-1',
        lg: 'text-sm px-3 py-1.5'
      },
      interactive: {
        true: 'hover:scale-105 active:scale-95 hover:shadow-sm',
        false: 'cursor-default'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: true
    }
  }
)

export interface ProductTagChipProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tagChipVariants> {
  tag: string
  onTagClick?: (tag: string) => void
  icon?: React.ReactNode
}

const getTagVariant = (tag: string): VariantProps<typeof tagChipVariants>['variant'] => {
  const lowerTag = tag.toLowerCase()
  
  // Business tags
  if (['featured', 'bestseller', 'new-arrival', 'limited-edition', 'exclusive'].includes(lowerTag)) {
    return 'business'
  }
  
  // Sustainability tags  
  if (['eco-friendly', 'recycled', 'lab-grown', 'ethical', 'sustainable', 'carbon-neutral'].includes(lowerTag)) {
    return 'sustainability'
  }
  
  // Trending tags
  if (['trending', 'viral', 'popular', 'hot', 'must-have'].includes(lowerTag)) {
    return 'trending'
  }
  
  // Category tags
  if (['rings', 'necklaces', 'earrings', 'bracelets', 'jewelry'].includes(lowerTag)) {
    return 'category'
  }
  
  return 'default'
}

export function ProductTagChip({
  tag,
  variant,
  size,
  interactive = true,
  onTagClick,
  icon,
  className,
  ...props
}: ProductTagChipProps) {
  const displayVariant = variant || getTagVariant(tag)
  const displayTag = tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (interactive && onTagClick) {
      e.preventDefault()
      e.stopPropagation()
      onTagClick(tag)
    }
  }

  return (
    <button
      className={cn(tagChipVariants({ variant: displayVariant, size, interactive }), className)}
      onClick={handleClick}
      disabled={!interactive}
      type="button"
      aria-label={`Filter by ${displayTag} tag`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{displayTag}</span>
    </button>
  )
}

export { tagChipVariants }