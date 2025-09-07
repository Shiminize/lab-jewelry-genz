'use client'

import React from 'react'
import { BodyText, MutedText } from '@/components/foundation/Typography'
import { StockIndicator, LiveStockCounter } from '@/components/inventory/InventoryStatus'
import { extractPrice, formatPrice, type ProductCardData } from './ProductCardHelpers'

interface ProductCardPricingProps {
  product: ProductCardData
  variant?: 'standard' | 'featured' | 'compact'
  isAurora?: boolean
  getClassName: (legacy: string, aurora?: string) => string
}

export function ProductCardPricing({
  product,
  variant = 'standard',
  isAurora = false,
  getClassName
}: ProductCardPricingProps) {
  const priceData = extractPrice(product)
  const { basePrice, originalPrice, hasDiscount, currency } = priceData

  return (
    <div className={getClassName('space-y-4', 'space-y-token-md')}>
      <div className={getClassName(
        'flex items-center space-x-token-sm',
        'flex items-center space-x-token-md'
      )}>
        <BodyText 
          size={variant === 'featured' ? 'lg' : 'md'} 
          weight="semibold" 
          className={getClassName(
            'text-text-primary group-hover:text-accent transition-colors duration-300',
            'text-foreground group-hover:aurora-gradient-text transition-all duration-500'
          )}
        >
          {formatPrice(basePrice, currency)}
        </BodyText>
        {hasDiscount && originalPrice && (
          <MutedText 
            size="sm" 
            className={getClassName(
              'line-through text-text-muted group-hover:text-text-secondary transition-colors duration-300',
              'line-through text-aurora-nav-muted/60 group-hover:text-foreground/80 transition-colors duration-300'
            )}>
            {formatPrice(originalPrice, currency)}
          </MutedText>
        )}
        {hasDiscount && isAurora && (
          <div className="aurora-pulse w-1 h-1 bg-accent-secondary rounded-token-sm" />
        )}
      </div>
      
      {/* Real-time inventory status */}
      <div className={getClassName(
        'flex items-center justify-between rounded-token-lg p-token-sm bg-surface-muted transition-colors duration-300',
        'flex items-center justify-between aurora-interactive-shadow rounded-token-md p-token-sm bg-gradient-to-r from-background/50 to-transparent group-hover:from-background/30 transition-all duration-300'
      )}>
        <StockIndicator productId={product._id} />
        {variant !== 'compact' && (
          <LiveStockCounter productId={product._id} />
        )}
      </div>
    </div>
  )
}