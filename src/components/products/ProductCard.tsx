'use client'

import React, { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Eye, ShoppingCart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BodyText, MutedText } from '@/components/foundation/Typography'
import { MaterialTagChip } from '@/components/ui/MaterialTagChip'
import { StockIndicator, LiveStockCounter } from '@/components/inventory/InventoryStatus'
import { extractMaterialTags } from '@/lib/services/material-tag-extraction.service'
import { cn } from '@/lib/utils'
import type { ProductListDTO } from '@/types/product-dto'
import type { MaterialTag } from '@/types/material-tags'

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: ProductListDTO
  variant?: 'standard' | 'featured' | 'compact'
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  onTagClick?: (tag: string) => void
  onMaterialTagClick?: (tag: MaterialTag) => void
  isWishlisted?: boolean
  className?: string
}

const variantStyles = {
  standard: {
    container: 'group cursor-pointer',
    imageContainer: 'aspect-square mb-4 relative overflow-hidden rounded-lg bg-muted',
    image: 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
    content: 'space-y-2',
    actions: 'absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2',
  },
  featured: {
    container: 'group cursor-pointer border border-accent/20 rounded-xl p-4 bg-accent/5 hover:bg-accent/10 transition-colors',
    imageContainer: 'aspect-square mb-4 relative overflow-hidden rounded-lg bg-muted',
    image: 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
    content: 'space-y-3',
    actions: 'absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2',
  },
  compact: {
    container: 'group cursor-pointer flex space-x-3',
    imageContainer: 'w-16 h-16 relative overflow-hidden rounded-md bg-muted flex-shrink-0',
    image: 'w-full h-full object-cover',
    content: 'flex-1 min-w-0 space-y-1',
    actions: 'hidden', // No hover actions for compact variant
  },
}

export function ProductCard({ 
  product, 
  variant = 'standard',
  onAddToWishlist,
  onQuickView,
  onAddToCart,
  onTagClick,
  onMaterialTagClick,
  isWishlisted = false,
  className,
  ...restProps
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const styles = variantStyles[variant]
  
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToWishlist?.(product._id)
  }

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product._id)
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart?.(product._id)
  }

  const handleTagClick = (tag: string) => {
    onTagClick?.(tag)
  }

  // Extract material tags with memoization for performance (CLAUDE_RULES compliance)
  const materialTags = useMemo(() => {
    if (!product?.materialSpecs) {
      return []
    }
    
    const result = extractMaterialTags(product)
    return result.success && result.data ? result.data : []
  }, [product])

  // Handle material tag clicks with useCallback for performance
  const handleMaterialTagClick = useCallback((tag: MaterialTag) => {
    if (onMaterialTagClick) {
      onMaterialTagClick(tag)
    } else {
      // Fallback to generic tag click if material-specific handler not provided
      onTagClick?.(tag.filterValue)
    }
  }, [onMaterialTagClick, onTagClick])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const basePrice = product.pricing?.basePrice || 0
  const hasDiscount = false // ProductListDTO doesn't have originalPrice
  const discountPercentage = 0

  return (
    <div 
      className={cn(styles.container, className)} 
      data-testid="product-card"
      {...restProps}
    >
      <Link href={`/products/${product.slug || product._id}`}>
        {/* Product Image */}
        <div className={styles.imageContainer}>
          {!imageError ? (
            <Image
              src={product.primaryImage || '/images/placeholder-product.jpg'}
              alt={product.name || 'Product'}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Sparkles className="w-8 h-8 text-foreground" />
            </div>
          )}
          
          {/* Discount badge */}
          {hasDiscount && variant !== 'compact' && (
            <div className="absolute top-2 left-2 bg-cta text-background px-2 py-1 rounded-md text-xs font-semibold">
              -{discountPercentage}%
            </div>
          )}

          {/* Wishlist button */}
          {variant !== 'compact' && (
            <Button
              variant="ghost"
              size="md"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-2 min-h-11 min-w-11"
              onClick={handleWishlistClick}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart 
                size={16} 
                className={cn(
                  'transition-colors',
                  isWishlisted ? 'fill-cta text-cta' : 'text-foreground'
                )} 
              />
            </Button>
          )}

          {/* Hover actions */}
          {variant !== 'compact' && (
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="md"
                onClick={handleQuickViewClick}
                className="bg-background/90 hover:bg-background text-foreground"
              >
                <Eye size={16} className="mr-1" />
                View Details
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddToCartClick}
              >
                <ShoppingCart size={16} className="mr-1" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.content}>
          <div>
            <BodyText 
              size={variant === 'compact' ? 'sm' : 'md'} 
              weight="medium" 
              className="line-clamp-2"
            >
              {product.name || 'Untitled Product'}
            </BodyText>
            <MutedText size={variant === 'compact' ? 'sm' : 'md'} className="capitalize">
              {product.category?.replace('-', ' ') || 'jewelry'}
            </MutedText>
          </div>

          {/* Material Tags - Primary filtering system */}
          {materialTags.length > 0 && variant !== 'compact' && (
            <div className="flex flex-wrap gap-1 mt-2" role="group" aria-label="Product material filters">
              {materialTags.slice(0, variant === 'featured' ? 4 : 3).map((tag) => (
                <MaterialTagChip
                  key={tag.id}
                  tag={tag}
                  onClick={handleMaterialTagClick}
                  size={variant === 'featured' ? 'md' : 'sm'}
                  className="transition-all duration-200"
                />
              ))}
              {materialTags.length > (variant === 'featured' ? 4 : 3) && (
                <div className="text-xs text-muted-foreground self-center ml-1">
                  +{materialTags.length - (variant === 'featured' ? 4 : 3)} more
                </div>
              )}
            </div>
          )}

          {/* Compact variant material tags */}
          {materialTags.length > 0 && variant === 'compact' && (
            <div className="flex flex-wrap gap-1 mt-1" role="group" aria-label="Product material filters">
              {materialTags.slice(0, 2).map((tag) => (
                <MaterialTagChip
                  key={tag.id}
                  tag={tag}
                  onClick={handleMaterialTagClick}
                  size="sm"
                  className="transition-all duration-200"
                />
              ))}
              {materialTags.length > 2 && (
                <div className="text-xs text-muted-foreground self-center ml-1">
                  +{materialTags.length - 2}
                </div>
              )}
            </div>
          )}

          {/* Fallback to legacy tags if no material specs available */}
          {materialTags.length === 0 && product.metadata?.tags && product.metadata.tags.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {product.metadata.tags.slice(0, variant === 'compact' ? 2 : 3).join(' • ')}
              {product.metadata.tags.length > (variant === 'compact' ? 2 : 3) && (
                <span> +{product.metadata.tags.length - (variant === 'compact' ? 2 : 3)} more</span>
              )}
            </div>
          )}

          {/* Pricing and Stock */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <BodyText 
                size={variant === 'featured' ? 'lg' : 'md'} 
                weight="semibold" 
                className="text-foreground"
              >
                {formatPrice(basePrice)}
              </BodyText>
              {hasDiscount && (
                <MutedText 
                  size="sm" 
                  className="line-through"
                >
                  {/* Discount placeholder - would need originalPrice in DTO */}
                </MutedText>
              )}
            </div>
            
            {/* Real-time inventory status */}
            <div className="flex items-center justify-between">
              <StockIndicator productId={product._id} />
              {variant !== 'compact' && (
                <LiveStockCounter productId={product._id} />
              )}
            </div>
          </div>

          {/* Featured badge */}
          {variant === 'featured' && (
            <div className="flex items-center space-x-1 text-accent">
              <Sparkles size={14} />
              <MutedText size="sm" className="text-accent font-medium">
                Featured Design
              </MutedText>
            </div>
          )}

          {/* Compact variant actions */}
          {variant === 'compact' && (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="md"
                onClick={handleWishlistClick}
                className="p-2 min-h-11 min-w-11"
              >
                <Heart 
                  size={14} 
                  className={cn(
                    isWishlisted ? 'fill-cta text-cta' : 'text-foreground'
                  )} 
                />
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={handleAddToCartClick}
                className="p-2 min-h-11 min-w-11"
              >
                <ShoppingCart size={14} className="text-foreground" />
              </Button>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}