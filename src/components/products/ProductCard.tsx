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
import type { ProductListDTO, ProductDisplayDTO } from '@/types/product-dto'
import type { MaterialTag } from '@/types/material-tags'

// Union type for flexible product data handling (CLAUDE_RULES.md TypeScript strict mode)
type ProductCardData = ProductListDTO | ProductDisplayDTO

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: ProductCardData
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
    container: 'group cursor-pointer aurora-living-component aurora-card transform-gpu perspective-1000 hover:scale-105 transition-all duration-700 hover:shadow-2xl hover:shadow-accent/20',
    imageContainer: 'aspect-square mb-4 relative overflow-hidden bg-gradient-to-br from-background to-muted rounded-xl transform-gpu group-hover:rotateX-2 group-hover:rotateY-2 transition-all duration-700',
    image: 'w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:rotate-2 group-hover:brightness-110 group-hover:saturate-110',
    content: 'space-y-2 transform-gpu group-hover:translateZ-4 transition-all duration-500',
    actions: 'absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end justify-center pb-4 space-x-2 backdrop-blur-sm',
  },
  featured: {
    container: 'group cursor-pointer aurora-living-component aurora-card border-2 border-foreground/30 rounded-2xl p-6 bg-gradient-to-br from-background via-background to-background hover:border-accent/50 transition-all duration-700 aurora-pulse transform-gpu hover:scale-110 hover:rotateY-3 hover:shadow-2xl hover:shadow-foreground/30',
    imageContainer: 'aspect-square mb-6 relative overflow-hidden bg-gradient-to-br from-background to-muted rounded-xl transform-gpu group-hover:rotateX-3 group-hover:rotateY-1 transition-all duration-700',
    image: 'w-full h-full object-cover transition-all duration-700 group-hover:scale-120 group-hover:rotate-3 group-hover:brightness-115 group-hover:saturate-125',
    content: 'space-y-4 transform-gpu group-hover:translateZ-6 transition-all duration-500',
    actions: 'absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end justify-center pb-6 space-x-3 backdrop-blur-md',
  },
  compact: {
    container: 'group cursor-pointer flex space-x-3 aurora-interactive-shadow rounded-lg p-2 hover:bg-background/50 transition-all duration-400 transform-gpu hover:scale-102 hover:shadow-lg hover:shadow-accent/10',
    imageContainer: 'w-16 h-16 relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted flex-shrink-0 transform-gpu group-hover:rotateY-1 transition-all duration-400',
    image: 'w-full h-full object-cover transition-all duration-400 group-hover:scale-115 group-hover:brightness-105',
    content: 'flex-1 min-w-0 space-y-1 transform-gpu group-hover:translateX-1 transition-all duration-300',
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

  // Type-safe price extraction (handles both ProductDisplayDTO and ProductListDTO)
  const extractPrice = (product: ProductCardData) => {
    // ProductDisplayDTO has direct basePrice property
    if ('basePrice' in product && typeof product.basePrice === 'number') {
      return {
        basePrice: product.basePrice,
        originalPrice: product.originalPrice,
        currency: product.currency || 'USD'
      }
    }
    // ProductListDTO has nested pricing object
    if ('pricing' in product && product.pricing) {
      return {
        basePrice: product.pricing.basePrice || 0,
        originalPrice: undefined, // ProductListDTO doesn't have originalPrice
        currency: product.pricing.currency || 'USD'
      }
    }
    // Fallback for malformed data
    return { basePrice: 0, originalPrice: undefined, currency: 'USD' }
  }

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const priceData = extractPrice(product)
  const basePrice = priceData.basePrice
  const originalPrice = priceData.originalPrice
  const currency = priceData.currency
  const hasDiscount = originalPrice && originalPrice > basePrice
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - basePrice) / originalPrice) * 100) : 0

  return (
    <div 
      className={cn(styles.container, className)} 
      data-testid="product-card"
      {...restProps}
    >
      <Link href={`/products/${product.slug || product._id}`}>
        {/* Aurora Enhanced Product Image */}
        <div className={styles.imageContainer}>
          {/* Aurora Shimmer Effect */}
          <div className="absolute inset-0 aurora-shimmer-overlay opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-10 pointer-events-none" />
          
          {/* Aurora Floating Sparkles */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-accent-secondary rounded-full opacity-0 group-hover:opacity-60 aurora-floating transition-opacity duration-700"
                style={{
                  left: `${20 + i * 25}%`,
                  top: `${15 + i * 20}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + i * 0.5}s`
                }}
              />
            ))}
          </div>

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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background to-muted">
              <Sparkles className="w-8 h-8 text-foreground aurora-pulse" />
            </div>
          )}
          
          {/* Aurora Enhanced Discount Badge */}
          {hasDiscount && variant !== 'compact' && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-cta to-accent text-background px-3 py-1 rounded-full text-xs font-semibold aurora-pulse shadow-lg">
              -{discountPercentage}%
            </div>
          )}

          {/* Aurora Enhanced Wishlist Button */}
          {variant !== 'compact' && (
            <Button
              variant="ghost"
              size="md"
              className="absolute top-3 right-3 bg-background/90 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-all duration-500 p-2 min-h-11 min-w-11 aurora-interactive-shadow rounded-full backdrop-blur-sm"
              onClick={handleWishlistClick}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart 
                size={16} 
                className={cn(
                  'transition-all duration-300',
                  isWishlisted ? 'fill-accent-secondary text-accent-secondary aurora-pulse' : 'text-foreground hover:text-accent-secondary'
                )} 
              />
            </Button>
          )}

          {/* Aurora Enhanced Hover Actions */}
          {variant !== 'compact' && (
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="md"
                onClick={handleQuickViewClick}
                className="bg-background/95 hover:bg-background text-foreground aurora-interactive-shadow backdrop-blur-sm"
              >
                <Eye size={16} className="mr-2" />
                View Details
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddToCartClick}
                className="bg-cta text-background shadow-lg"
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Aurora Enhanced Product Info */}
        <div className={styles.content}>
          <div className="space-y-1">
            <BodyText 
              size={variant === 'compact' ? 'sm' : 'md'} 
              weight="medium" 
              className="line-clamp-2 group-hover:aurora-gradient-text transition-all duration-500"
            >
              {product.name || 'Untitled Product'}
            </BodyText>
            <MutedText size={variant === 'compact' ? 'sm' : 'md'} className="capitalize text-aurora-nav-muted group-hover:text-foreground transition-colors duration-300">
              {product.category?.replace('-', ' ') || 'jewelry'}
            </MutedText>
          </div>

          {/* Aurora Enhanced Material Tags - Primary filtering system */}
          {materialTags.length > 0 && variant !== 'compact' && (
            <div className="flex flex-wrap gap-1 mt-2" role="group" aria-label="Product material filters">
              {materialTags.slice(0, variant === 'featured' ? 4 : 3).map((tag) => (
                <MaterialTagChip
                  key={tag.id}
                  tag={tag}
                  onClick={handleMaterialTagClick}
                  size={variant === 'featured' ? 'md' : 'sm'}
                  className="transition-all duration-200 hover:aurora-shimmer-overlay group-hover:scale-105"
                />
              ))}
              {materialTags.length > (variant === 'featured' ? 4 : 3) && (
                <div className="text-xs text-aurora-nav-muted/60 group-hover:text-foreground self-center ml-1 transition-colors duration-300 aurora-pulse">
                  +{materialTags.length - (variant === 'featured' ? 4 : 3)} more
                </div>
              )}
            </div>
          )}

          {/* Aurora Enhanced Compact Material Tags */}
          {materialTags.length > 0 && variant === 'compact' && (
            <div className="flex flex-wrap gap-1 mt-1" role="group" aria-label="Product material filters">
              {materialTags.slice(0, 2).map((tag) => (
                <MaterialTagChip
                  key={tag.id}
                  tag={tag}
                  onClick={handleMaterialTagClick}
                  size="sm"
                  className="transition-all duration-200 group-hover:aurora-shimmer-overlay"
                />
              ))}
              {materialTags.length > 2 && (
                <div className="text-xs text-aurora-nav-muted/60 group-hover:text-foreground self-center ml-1 transition-colors duration-300 aurora-pulse">
                  +{materialTags.length - 2}
                </div>
              )}
            </div>
          )}

          {/* Aurora Fallback Tags - Legacy support with Aurora styling */}
          {materialTags.length === 0 && product.metadata?.tags && product.metadata.tags.length > 0 && (
            <div className="text-xs text-aurora-nav-muted/70 group-hover:text-foreground mt-2 transition-colors duration-300">
              {product.metadata.tags.slice(0, variant === 'compact' ? 2 : 3).join(' • ')}
              {product.metadata.tags.length > (variant === 'compact' ? 2 : 3) && (
                <span> +{product.metadata.tags.length - (variant === 'compact' ? 2 : 3)} more</span>
              )}
            </div>
          )}

          {/* Aurora Enhanced Pricing and Stock */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <BodyText 
                size={variant === 'featured' ? 'lg' : 'md'} 
                weight="semibold" 
                className="text-foreground group-hover:aurora-gradient-text transition-all duration-500"
              >
                {formatPrice(basePrice, currency)}
              </BodyText>
              {hasDiscount && originalPrice && (
                <MutedText 
                  size="sm" 
                  className="line-through text-aurora-nav-muted/60 group-hover:text-foreground/80 transition-colors duration-300">
                >
                  {formatPrice(originalPrice, currency)}
                </MutedText>
              )}
              {hasDiscount && (
                <div className="aurora-pulse w-1 h-1 bg-accent-secondary rounded-full" />
              )}
            </div>
            
            {/* Aurora Enhanced Real-time inventory status */}
            <div className="flex items-center justify-between aurora-interactive-shadow rounded-lg p-2 bg-gradient-to-r from-background/50 to-transparent group-hover:from-background/30 transition-all duration-300">
              <StockIndicator productId={product._id} />
              {variant !== 'compact' && (
                <LiveStockCounter productId={product._id} />
              )}
            </div>
          </div>

          {/* Aurora Enhanced Featured Badge */}
          {variant === 'featured' && (
            <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-accent/10 to-aurora-nav-muted/10 rounded-lg aurora-interactive-shadow group-hover:from-accent/20 group-hover:to-aurora-nav-muted/20 transition-all duration-500">
              <Sparkles size={16} className="text-accent-secondary aurora-pulse" />
              <MutedText size="sm" className="text-foreground font-semibold aurora-gradient-text">
                Featured Design
              </MutedText>
              <div className="aurora-floating w-1 h-1 bg-accent-secondary rounded-full" />
            </div>
          )}

          {/* Aurora Enhanced Compact Actions */}
          {variant === 'compact' && (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="md"
                onClick={handleWishlistClick}
                className="p-2 min-h-11 min-w-11 hover:bg-accent-interactive/10 aurora-interactive-shadow group-hover:scale-105 transition-all duration-300"
              >
                <Heart 
                  size={14} 
                  className={cn(
                    isWishlisted 
                      ? 'fill-accent-secondary text-accent-secondary' 
                      : 'text-aurora-nav-muted hover:text-accent-secondary'
                  )} 
                />
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={handleAddToCartClick}
                className="p-2 min-h-11 min-w-11 hover:bg-foreground/10 aurora-interactive-shadow group-hover:scale-105 transition-all duration-300"
              >
                <ShoppingCart 
                  size={14} 
                  className="text-aurora-nav-muted hover:text-foreground aurora-pulse transition-colors duration-200" 
                />
              </Button>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}