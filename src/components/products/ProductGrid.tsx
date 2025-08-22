'use client'

import React from 'react'
import { ProductCard } from './ProductCard'
import { Grid } from '@/components/layout'
import { BodyText, MutedText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'
import type { ProductBase } from '@/types/customizer'
import type { ProductListDTO, ProductDisplayDTO } from '@/types/product-dto'

// Union type for flexible product data handling (CLAUDE_RULES.md TypeScript strict mode)
type ProductGridData = ProductBase | ProductListDTO | ProductDisplayDTO

interface ProductGridProps {
  products: ProductGridData[]
  loading?: boolean
  variant?: 'standard' | 'featured' | 'compact'
  columns?: 2 | 3 | 4
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  wishlistedItems?: string[]
  className?: string
  emptyMessage?: string
  emptyDescription?: string
}

// Loading skeleton component
const ProductSkeleton = ({ variant = 'standard' }: { variant?: 'standard' | 'featured' | 'compact' }) => {
  if (variant === 'compact') {
    return (
      <div className="flex space-x-3 animate-pulse">
        <div className="w-16 h-16 bg-muted/40 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted/40 rounded w-3/4" />
          <div className="h-3 bg-muted/40 rounded w-1/2" />
          <div className="h-4 bg-muted/40 rounded w-1/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-pulse">
      <div className={cn(
        'aspect-square bg-muted/40 rounded-lg',
        variant === 'featured' && 'border border-muted/40 p-4'
      )} />
      <div className="space-y-2">
        <div className="h-4 bg-muted/40 rounded w-3/4" />
        <div className="h-3 bg-muted/40 rounded w-1/2" />
        <div className="h-5 bg-muted/40 rounded w-1/3" />
      </div>
    </div>
  )
}

export function ProductGrid({
  products,
  loading = false,
  variant = 'standard',
  columns = 3,
  onAddToWishlist,
  onQuickView,
  onAddToCart,
  wishlistedItems = [],
  className,
  emptyMessage = 'No products found',
  emptyDescription = 'Try adjusting your search or filter criteria.'
}: ProductGridProps) {
  
  // Show loading skeletons
  if (loading) {
    return (
      <Grid 
        cols={variant === 'compact' ? 1 : columns} 
        gap="lg" 
        className={cn('w-full', className)}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductSkeleton key={index} variant={variant} />
        ))}
      </Grid>
    )
  }

  // Show empty state
  if (!products || products.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="max-w-md mx-auto">
          <BodyText size="lg" weight="medium" className="mb-2">
            {emptyMessage}
          </BodyText>
          <MutedText size="md">
            {emptyDescription}
          </MutedText>
        </div>
      </div>
    )
  }

  return (
    <Grid 
      cols={variant === 'compact' ? 1 : columns} 
      gap={variant === 'compact' ? 'sm' : 'lg'}
      className={cn('w-full', className)}
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          variant={variant}
          onAddToWishlist={onAddToWishlist}
          onQuickView={onQuickView}
          onAddToCart={onAddToCart}
          isWishlisted={wishlistedItems.includes(product._id)}
        />
      ))}
    </Grid>
  )
}

// Grid variant for different layouts
interface ProductGridLayoutProps extends Omit<ProductGridProps, 'columns'> {
  layout?: 'grid' | 'list' | 'masonry'
}

export function ProductGridLayout({ layout = 'grid', ...props }: ProductGridLayoutProps) {
  switch (layout) {
    case 'list':
      return <ProductGrid {...props} variant="compact" columns={2} />
    case 'masonry':
      // For future implementation with masonry layout
      return <ProductGrid {...props} columns={3} />
    case 'grid':
    default:
      return <ProductGrid {...props} />
  }
}