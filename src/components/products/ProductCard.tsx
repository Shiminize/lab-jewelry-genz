'use client'

import React, { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { MaterialTagChip } from '@/components/ui/MaterialTagChip'
import { BodyText } from '@/components/foundation/Typography'
import { extractMaterialTags } from '@/lib/services/material-tag-extraction.service'
import { cn } from '@/lib/utils'
import { useDesignVersion, useMaterialDesign, useABTest } from '@/hooks/useDesignVersion'
import type { MaterialTag } from '@/types/material-tags'
import { extractPrice, type ProductCardData } from './ProductCardHelpers'
import { ProductCardImage } from './ProductCardImage'
import { ProductCardPricing } from './ProductCardPricing'
import { ProductCardActions } from './ProductCardActions'

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

import { variantStyles } from './ProductCardVariants'

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
  // Aurora Design System migration control with A/B Testing
  const { designVersion, getClassName, isAurora } = useDesignVersion({ 
    componentName: 'productCard' 
  })
  
  // A/B Testing for ProductCard variations
  const { 
    version: abVersion, 
    isAurora: isABTestAurora, 
    trackInteraction, 
    trackConversion 
  } = useABTest('ProductCard')
  
  // Material-specific Aurora enhancements
  const materialType = product?.materialSpecs?.metal?.toLowerCase() || 'gold'
  const { materialClasses, triggerAnimation } = useMaterialDesign({
    componentName: 'productCard',
    material: materialType.includes('platinum') ? 'platinum' : 
              materialType.includes('rose') ? 'roseGold' : 'gold',
    enableEmotionalTriggers: isAurora
  })
  
  const styles = variantStyles[variant]

  const handleWishlistClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    trackInteraction({ 
      action: 'wishlist_click', 
      productId: product._id,
      productName: product.name,
      variant: variant 
    })
    
    onAddToWishlist?.(product._id)
  }, [product._id, product.name, variant, trackInteraction, onAddToWishlist])

  const handleQuickViewClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    trackInteraction({ 
      action: 'quick_view_click', 
      productId: product._id,
      productName: product.name,
      variant: variant 
    })
    
    onQuickView?.(product._id)
  }, [product._id, product.name, variant, trackInteraction, onQuickView])

  const handleAddToCartClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    trackInteraction({ 
      action: 'add_to_cart_click', 
      productId: product._id,
      productName: product.name,
      variant: variant 
    })
    
    trackConversion({ 
      event: 'product_card_add_to_cart', 
      productId: product._id,
      productName: product.name,
      variant: variant,
      price: extractPrice(product)
    })
    
    onAddToCart?.(product._id)
  }, [product._id, product.name, variant, trackInteraction, trackConversion, onAddToCart])

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
      onTagClick?.(tag.filterValue)
    }
  }, [onMaterialTagClick, onTagClick])

  const priceData = extractPrice(product)
  const { basePrice, originalPrice } = priceData
  const hasDiscount = originalPrice && originalPrice > basePrice
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - basePrice) / originalPrice) * 100) : 0

  return (
    <div 
      className={cn(
        // Base container styles with Aurora migration
        getClassName(
          'group cursor-pointer transform hover:scale-105 transition-all duration-700 shadow-lg rounded-token-lg p-token-md bg-surface',
          'group cursor-pointer aurora-living-component aurora-card transform-gpu perspective-1000 hover:scale-105 transition-all duration-700'
        ),
        // Material-specific Aurora enhancements
        isAurora && [
          materialClasses.shadow,
          materialClasses.hoverShadow,
          materialClasses.prismatic,
          materialClasses.emotional
        ],
        // Variant-specific styling
        variant === 'featured' && getClassName(
          'border-2 border-surface-active bg-gradient-to-br from-surface-muted to-surface',
          'border-2 border-foreground/30 rounded-token-lg p-token-xl bg-gradient-to-br from-background via-background to-background hover:border-accent/50 aurora-pulse'
        ),
        variant === 'compact' && getClassName(
          'flex space-x-token-md rounded-token-lg p-token-md hover:bg-surface-hover',
          'flex space-x-token-md aurora-interactive-shadow rounded-token-md p-token-sm hover:bg-background/50'
        ),
        className
      )} 
      data-testid="product-card"
      data-aurora-version={designVersion}
      onMouseEnter={() => isAurora && triggerAnimation('hover')}
      {...restProps}
    >
      <Link href={`/products/${product.slug || product._id}`}>
        {/* Product Image Component */}
        <ProductCardImage
          product={product}
          variant={variant}
          isAurora={isAurora}
          getClassName={getClassName}
          hasDiscount={hasDiscount}
          discountPercentage={discountPercentage}
        />

        {/* Product Content */}
        <div className={getClassName('space-y-4', 'space-y-token-md')}>
          {/* Product Name */}
          <BodyText 
            size={variant === 'featured' ? 'lg' : 'md'} 
            weight="semibold" 
            className={getClassName(
              'text-text-primary group-hover:text-accent transition-colors duration-300',
              'text-foreground group-hover:aurora-gradient-text transition-all duration-500'
            )}
          >
            {product.name}
          </BodyText>
          
          {/* Material Tags */}
          {materialTags.length > 0 && variant !== 'compact' && (
            <div className={getClassName('flex flex-wrap gap-token-xs', 'flex flex-wrap gap-token-sm')}>
              {materialTags.slice(0, variant === 'featured' ? 4 : 3).map((tag) => (
                <MaterialTagChip
                  key={tag.displayName}
                  tag={tag}
                  onClick={() => handleMaterialTagClick(tag)}
                  size={variant === 'featured' ? 'md' : 'sm'}
                  variant={isAurora ? 'aurora' : 'default'}
                />
              ))}
            </div>
          )}
          
          {/* Pricing Component */}
          <ProductCardPricing
            product={product}
            variant={variant}
            isAurora={isAurora}
            getClassName={getClassName}
          />
        </div>
      </Link>
      
      {/* Actions Component */}
      <ProductCardActions
        variant={variant}
        isAurora={isAurora}
        isWishlisted={isWishlisted}
        getClassName={getClassName}
        onWishlistClick={handleWishlistClick}
        onQuickViewClick={handleQuickViewClick}
        onAddToCartClick={handleAddToCartClick}
      />
    </div>
  )
}