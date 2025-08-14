/**
 * Product Selector Component
 * Allows switching between different ring designs in the customizer
 * Uses seed product data for Gen Z/Young Millennial appeal
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'

interface ProductSelectorProps {
  availableProducts: Array<{
    id: string
    name: string
    basePrice: number
    description: string
    category: string
    tags?: string[]
  }>
  selectedProductId: string
  onProductChange: (productId: string) => void
  className?: string
}

export function ProductSelector({
  availableProducts,
  selectedProductId,
  onProductChange,
  className
}: ProductSelectorProps) {
  return (
    <div className={cn('bg-background border border-border rounded-lg p-6', className)}>
      <H3 className="mb-4 text-foreground">Choose Your Design</H3>
      <MutedText className="mb-6 text-sm">
        Each piece tells a unique story. Pick the one that speaks to you.
      </MutedText>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {availableProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductChange(product.id)}
            className={cn(
              'text-left p-4 rounded-lg border transition-all duration-200',
              'hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent',
              selectedProductId === product.id
                ? 'border-accent bg-accent/10 shadow-md'
                : 'border-border bg-background hover:bg-muted/50'
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <BodyText className={cn(
                  'font-semibold text-sm leading-tight',
                  selectedProductId === product.id ? 'text-accent' : 'text-foreground'
                )}>
                  {product.name}
                </BodyText>
                <MutedText className="text-xs mt-1 line-clamp-2">
                  {product.description}
                </MutedText>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <BodyText className="text-xs font-medium text-foreground">
                  ${product.basePrice.toLocaleString()}
                </BodyText>
              </div>
            </div>
            
            {/* Tags for Gen Z appeal */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      selectedProductId === product.id
                        ? 'bg-accent/20 text-accent'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    {tag}
                  </span>
                ))}
                {product.tags.length > 2 && (
                  <span className="text-xs text-foreground">
                    +{product.tags.length - 2} more
                  </span>
                )}
              </div>
            )}

            {/* Selection indicator */}
            {selectedProductId === product.id && (
              <div className="flex items-center mt-3 text-accent">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <MutedText className="text-xs text-accent">
                  Selected
                </MutedText>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Quick stats */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div>
              <MutedText className="text-xs">Available Designs</MutedText>
              <BodyText className="text-sm font-semibold text-foreground">
                {availableProducts.length}
              </BodyText>
            </div>
            <div>
              <MutedText className="text-xs">Price Range</MutedText>
              <BodyText className="text-sm font-semibold text-foreground">
                ${Math.min(...availableProducts.map(p => p.basePrice)).toLocaleString()} - 
                ${Math.max(...availableProducts.map(p => p.basePrice)).toLocaleString()}
              </BodyText>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Product Selector for mobile/smaller screens
 */
export function CompactProductSelector({
  availableProducts,
  selectedProductId,
  onProductChange,
  className
}: ProductSelectorProps) {
  const selectedProduct = availableProducts.find(p => p.id === selectedProductId)

  return (
    <div className={cn('bg-background border border-border rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <H3 className="text-foreground">Design</H3>
        <MutedText className="text-xs">
          {availableProducts.length} options
        </MutedText>
      </div>

      {/* Current selection display */}
      <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
        <BodyText className="font-semibold text-accent text-sm">
          {selectedProduct?.name || 'No selection'}
        </BodyText>
        <MutedText className="text-xs mt-1 line-clamp-1">
          {selectedProduct?.description}
        </MutedText>
        <div className="flex items-center justify-between mt-2">
          <BodyText className="text-xs font-medium text-foreground">
            ${selectedProduct?.basePrice.toLocaleString()}
          </BodyText>
          {selectedProduct?.tags && (
            <div className="flex gap-1">
              {selectedProduct.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Horizontal scrollable options */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {availableProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductChange(product.id)}
            className={cn(
              'flex-shrink-0 w-24 p-3 rounded-lg border text-center transition-all',
              'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent',
              selectedProductId === product.id
                ? 'border-accent bg-accent/10'
                : 'border-border bg-background hover:bg-muted/50'
            )}
          >
            <BodyText className={cn(
              'text-xs font-medium leading-tight line-clamp-2 mb-1',
              selectedProductId === product.id ? 'text-accent' : 'text-foreground'
            )}>
              {product.name.replace(' Ring', '')}
            </BodyText>
            <MutedText className="text-xs">
              ${product.basePrice.toLocaleString()}
            </MutedText>
            {selectedProductId === product.id && (
              <div className="w-2 h-2 bg-accent rounded-full mx-auto mt-2" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}