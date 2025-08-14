'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Eye, ShoppingCart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BodyText, MutedText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'
import type { ProductBase } from '@/types/customizer'

interface ProductCardProps {
  product: ProductBase
  variant?: 'standard' | 'featured' | 'compact'
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  isWishlisted?: boolean
  className?: string
}

const variantStyles = {
  standard: {
    container: 'group cursor-pointer',
    imageContainer: 'aspect-square mb-4 relative overflow-hidden rounded-lg bg-muted/20',
    image: 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
    content: 'space-y-2',
    actions: 'absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2',
  },
  featured: {
    container: 'group cursor-pointer border border-accent/20 rounded-xl p-4 bg-accent/5 hover:bg-accent/10 transition-colors',
    imageContainer: 'aspect-square mb-4 relative overflow-hidden rounded-lg bg-muted/20',
    image: 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
    content: 'space-y-3',
    actions: 'absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2',
  },
  compact: {
    container: 'group cursor-pointer flex space-x-3',
    imageContainer: 'w-16 h-16 relative overflow-hidden rounded-md bg-muted/20 flex-shrink-0',
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
  isWishlisted = false,
  className 
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.basePrice
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.basePrice) / product.originalPrice!) * 100)
    : 0

  return (
    <div className={cn(styles.container, className)}>
      <Link href={`/products/${product._id}`}>
        {/* Product Image */}
        <div className={styles.imageContainer}>
          {!imageError ? (
            <Image
              src={product.images.primary}
              alt={product.name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/40">
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
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
                size="sm"
                onClick={handleQuickViewClick}
                className="bg-background/90 hover:bg-background text-foreground"
              >
                <Eye size={16} className="mr-1" />
                Quick View
              </Button>
              <Button
                variant="primary"
                size="sm"
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
              {product.name}
            </BodyText>
            <MutedText size={variant === 'compact' ? 'sm' : 'md'} className="capitalize">
              {product.category.replace('-', ' ')}
            </MutedText>
          </div>

          {/* Pricing */}
          <div className="flex items-center space-x-2">
            <BodyText 
              size={variant === 'featured' ? 'lg' : 'md'} 
              weight="semibold" 
              className="text-foreground"
            >
              {formatPrice(product.basePrice)}
            </BodyText>
            {hasDiscount && (
              <MutedText 
                size="sm" 
                className="line-through"
              >
                {formatPrice(product.originalPrice!)}
              </MutedText>
            )}
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
                size="sm"
                onClick={handleWishlistClick}
                className="p-1"
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
                size="sm"
                onClick={handleAddToCartClick}
                className="p-1"
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