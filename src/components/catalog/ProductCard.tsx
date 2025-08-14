/**
 * Product Card Component
 * Mobile-first product display with 3D preview integration
 * Optimized for performance and accessibility
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Heart, Star, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  showQuickView?: boolean
  className?: string
}

export function ProductCard({ product, showQuickView = true, className }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  // Format price with proper currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.pricing.currency || 'USD'
    }).format(price)
  }

  // Calculate discount percentage
  const discountPercentage = product.pricing.originalPrice
    ? Math.round(((product.pricing.originalPrice - product.pricing.basePrice) / product.pricing.originalPrice) * 100)
    : null

  // Handle favorite toggle
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    // TODO: Implement actual favorites functionality
  }

  return (
    <div 
      className={cn(
        'group relative bg-background border border-border rounded-xl overflow-hidden',
        'hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
        'focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.seo.slug}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square bg-muted/10 overflow-hidden">
          {/* Main product image */}
          <img
            src={product.media.primary}
            alt={product.name}
            onLoad={() => setIsImageLoaded(true)}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              'group-hover:scale-105',
              !isImageLoaded && 'opacity-0'
            )}
            loading="lazy"
          />

          {/* Gallery image on hover */}
          {product.media.gallery[0] && (
            <img
              src={product.media.gallery[0]}
              alt={`${product.name} alternate view`}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
              loading="lazy"
            />
          )}

          {/* Loading placeholder */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-border-muted to-muted-light/30 animate-pulse" />
          )}

          {/* Product badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.metadata.featured && (
              <span className="px-2 py-1 bg-accent text-background text-xs font-semibold rounded-full">
                Featured
              </span>
            )}
            {product.metadata.newArrival && (
              <span className="px-2 py-1 bg-success text-background text-xs font-semibold rounded-full">
                New
              </span>
            )}
            {discountPercentage && (
              <span className="px-2 py-1 bg-error text-background text-xs font-semibold rounded-full">
                -{discountPercentage}%
              </span>
            )}
            {product.metadata.limitedEdition && (
              <span className="px-2 py-1 bg-warning text-background text-xs font-semibold rounded-full">
                Limited
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={toggleFavorite}
              className={cn(
                'p-2 rounded-full bg-background/90 backdrop-blur-sm',
                'hover:bg-background transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-accent',
                isFavorited && 'text-error'
              )}
              aria-label="Add to favorites"
            >
              <Heart className={cn('w-4 h-4', isFavorited && 'fill-current')} />
            </button>

            {showQuickView && (
              <button
                className={cn(
                  'p-2 rounded-full bg-background/90 backdrop-blur-sm',
                  'hover:bg-background transition-colors opacity-0 group-hover:opacity-100',
                  'focus:outline-none focus:ring-2 focus:ring-accent'
                )}
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 3D Model indicator */}
          {product.media.model3D?.glb && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-1 bg-background/90 backdrop-blur-sm text-xs font-medium rounded-full flex items-center gap-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                3D View
              </span>
            </div>
          )}

          {/* Stock status */}
          {product.inventory.available <= product.inventory.lowStockThreshold && (
            <div className="absolute bottom-3 right-3">
              {product.inventory.available > 0 ? (
                <span className="px-2 py-1 bg-warning/90 backdrop-blur-sm text-background text-xs font-semibold rounded-full">
                  Low Stock
                </span>
              ) : (
                <span className="px-2 py-1 bg-error/90 backdrop-blur-sm text-background text-xs font-semibold rounded-full">
                  Out of Stock
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category and collection */}
          <div className="flex items-center justify-between mb-2">
            <MutedText size="sm" className="capitalize">
              {product.category.replace('-', ' ')}
            </MutedText>
            {product.analytics && (
              <div className="flex items-center gap-1 text-muted">
                <Star className="w-3 h-3 fill-current" />
                <MutedText size="sm">
                  {(4.5 + Math.random() * 0.5).toFixed(1)} {/* Placeholder rating */}
                </MutedText>
              </div>
            )}
          </div>

          {/* Product name */}
          <H3 className="mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {product.name}
          </H3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <BodyText className="font-bold text-foreground">
              {formatPrice(product.pricing.basePrice)}
            </BodyText>
            {product.pricing.originalPrice && (
              <MutedText size="sm" className="line-through">
                {formatPrice(product.pricing.originalPrice)}
              </MutedText>
            )}
          </div>

          {/* Price range indicator for customizable products */}
          {product.pricing.priceRange && product.pricing.priceRange.max > product.pricing.basePrice && (
            <MutedText size="sm" className="mb-2">
              Starting from • Up to {formatPrice(product.pricing.priceRange.max)}
            </MutedText>
          )}

          {/* Key features */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.customization.materials.slice(0, 2).map((material, index) => (
              <span 
                key={material.id}
                className="px-2 py-1 bg-border-muted text-xs rounded-full text-muted"
              >
                {material.name}
              </span>
            ))}
            {product.customization.gemstones && (
              <span className="px-2 py-1 bg-border-muted text-xs rounded-full text-muted">
                Lab-grown Diamond
              </span>
            )}
          </div>

          {/* Sustainability indicators */}
          <div className="flex items-center gap-2 text-success">
            <div className="w-2 h-2 bg-success rounded-full" />
            <MutedText size="sm">Sustainable • Conflict-free</MutedText>
          </div>

          {/* Lead time for custom products */}
          {product.inventory.isCustomMade && product.inventory.leadTime && (
            <MutedText size="sm" className="mt-2">
              Ships in {product.inventory.leadTime.min}-{product.inventory.leadTime.max} business days
            </MutedText>
          )}
        </div>
      </Link>

      {/* Hover overlay for quick actions */}
      <div className={cn(
        'absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100',
        'transition-opacity duration-300 pointer-events-none'
      )} />
    </div>
  )
}