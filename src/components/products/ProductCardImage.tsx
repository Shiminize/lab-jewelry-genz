'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ProductCardData } from './ProductCardHelpers'

interface ProductCardImageProps {
  product: ProductCardData
  variant?: 'standard' | 'featured' | 'compact'
  isAurora?: boolean
  getClassName: (legacy: string, aurora?: string) => string
  hasDiscount?: boolean
  discountPercentage?: number
}

export function ProductCardImage({
  product,
  variant = 'standard',
  isAurora = false,
  getClassName,
  hasDiscount = false,
  discountPercentage = 0
}: ProductCardImageProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className={cn(
      getClassName(
        'relative overflow-hidden mb-token-lg aspect-square rounded-token-lg transform-gpu group-hover:scale-105 group-hover:rotate-1 transition-all duration-500',
        'relative overflow-hidden mb-token-xl aspect-square rounded-token-md transform-gpu group-hover:rotateX-3 group-hover:rotateY-1'
      ),
      variant === 'compact' && getClassName(
        'w-16 h-16 mb-0 rounded-md',
        'w-token-2xl h-token-2xl mb-0 rounded-token-sm transform-gpu group-hover:rotateY-1 transition-all duration-400'
      )
    )}>
      {/* Aurora Shimmer Effect */}
      {isAurora && (
        <div className="absolute inset-0 bg-aurora-shimmer opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-10 pointer-events-none animate-aurora-shimmer-slow" />
      )}
      
      {/* Aurora Floating Sparkles */}
      {isAurora && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-aurora-pink rounded-token-sm opacity-0 group-hover:opacity-60 animate-aurora-float transition-opacity duration-700"
              style={{
                left: `${20 + i * 25}%`,
                top: `${15 + i * 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + i * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {!imageError ? (
        <Image
          src={product.primaryImage || '/images/placeholder-product.jpg'}
          alt={product.name || 'Product'}
          fill
          className={getClassName(
            'w-full h-full object-cover transition-all duration-500 group-hover:scale-110',
            'w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:rotate-2 group-hover:brightness-110 group-hover:saturate-110'
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={getClassName(
          'w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-muted to-surface-active',
          'w-full h-full flex items-center justify-center bg-gradient-to-br from-background to-muted'
        )}>
          <Sparkles className={getClassName(
            'w-token-lg h-token-lg text-text-muted',
            'w-token-lg h-token-lg text-foreground animate-aurora-glow-pulse'
          )} />
        </div>
      )}
      
      {/* Discount Badge */}
      {hasDiscount && variant !== 'compact' && (
        <div className={getClassName(
          'absolute top-token-sm left-token-sm bg-error text-text-inverse px-token-sm py-token-xs rounded-token-lg text-xs font-semibold shadow-md',
          'absolute top-token-md left-token-md bg-gradient-to-r from-cta to-accent text-background px-token-md py-1 rounded-token-lg text-xs font-semibold animate-aurora-glow-pulse shadow-near'
        )}>
          -{discountPercentage}%
        </div>
      )}
    </div>
  )
}