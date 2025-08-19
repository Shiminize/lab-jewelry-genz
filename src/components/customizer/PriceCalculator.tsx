'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { cn, calculateDiscount } from '@/lib/utils'
import { formatPrice } from '@/lib/pricing'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
import type { ProductBase, CustomizationOptions, PriceBreakdown } from '@/types/customizer'
import type { PriceCalculation } from '@/lib/schemas/product-customization'

interface PriceCalculatorProps {
  product: ProductBase
  customization: CustomizationOptions
  pricing?: PriceCalculation | null
  className?: string
}

const ENGRAVING_COST = 75

export function PriceCalculator({
  product,
  customization,
  pricing,
  className
}: PriceCalculatorProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayPrice, setDisplayPrice] = useState(product.basePrice)

  // Use provided pricing or fallback to local calculation
  const priceBreakdown = useMemo((): PriceBreakdown => {
    if (pricing) {
      // Use the pricing from the API/hook which includes real-time updates
      return {
        basePrice: pricing.basePrice,
        materialCost: pricing.materialCost,
        stoneCost: pricing.stoneCost,
        engravingCost: pricing.engravingCost,
        total: pricing.total,
        savings: pricing.savings
      }
    }

    // Fallback calculation if pricing not available
    const basePrice = product.basePrice
    
    const materialCost = customization.material 
      ? Math.round(basePrice * (customization.material.priceMultiplier - 1))
      : 0
    
    const stoneCost = customization.stoneQuality
      ? Math.round(basePrice * (customization.stoneQuality.priceMultiplier - 1))
      : 0
    
    const engravingCost = customization.engraving ? ENGRAVING_COST : 0
    
    const total = basePrice + materialCost + stoneCost + engravingCost
    
    const savings = product.originalPrice ? product.originalPrice - total : undefined

    return {
      basePrice,
      materialCost,
      stoneCost,
      engravingCost,
      total,
      savings
    }
  }, [product, customization, pricing])

  // Animate price changes (CLAUDE_RULES compliant - smooth updates <2s)
  useEffect(() => {
    if (displayPrice !== priceBreakdown.total) {
      setIsAnimating(true)
      
      const timer = setTimeout(() => {
        setDisplayPrice(priceBreakdown.total)
        setIsAnimating(false)
      }, 150) // Fast animation for responsive feel

      return () => clearTimeout(timer)
    }
  }, [priceBreakdown.total, displayPrice])

  const PriceBreakdownItem = ({ 
    label, 
    amount, 
    isIncluded = false,
    isPositive = false 
  }: { 
    label: string
    amount: number
    isIncluded?: boolean
    isPositive?: boolean 
  }) => (
    <div className="flex items-center justify-between py-2">
      <MutedText size="sm" className="flex items-center space-x-2">
        <span>{label}</span>
        {isIncluded && (
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
            Included
          </span>
        )}
      </MutedText>
      <BodyText className={cn(
        'text-sm font-medium',
        isPositive ? 'text-success' : amount > 0 ? 'text-cta' : 'text-gray-600'
      )}>
        {amount === 0 
          ? (isIncluded ? 'Included' : '—')
          : `${isPositive ? '−' : '+'}${formatPrice(Math.abs(amount))}`
        }
      </BodyText>
    </div>
  )

  return (
    <div className={cn(
      'bg-background border border-border rounded-lg p-6 shadow-sm',
      className
    )}>
      {/* Main price display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <H3 className="text-foreground">Your Design</H3>
          {priceBreakdown.savings && (
            <div className="text-success text-sm font-medium">
              Save {formatPrice(priceBreakdown.savings)}
            </div>
          )}
        </div>
        
        <div className={cn(
          'transition-all duration-300',
          isAnimating && 'scale-105 text-accent'
        )}>
          <H2 className="text-3xl font-bold text-foreground">
            {formatPrice(displayPrice)}
          </H2>
        </div>
        
        {product.originalPrice && (
          <div className="flex items-center space-x-2 mt-2">
            <MutedText className="line-through text-lg">
              {formatPrice(product.originalPrice)}
            </MutedText>
            <div className="bg-success/10 text-success text-sm font-medium px-2 py-1 rounded-full">
              {calculateDiscount(product.originalPrice, priceBreakdown.total)}% off
            </div>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-1 pb-4 border-b border-border">
        <PriceBreakdownItem
          label="Base price"
          amount={priceBreakdown.basePrice}
          isIncluded
        />
        
        {customization.material && (
          <PriceBreakdownItem
            label={`${customization.material.name} upgrade`}
            amount={priceBreakdown.materialCost}
          />
        )}
        
        {customization.stoneQuality && (
          <PriceBreakdownItem
            label={`${customization.stoneQuality.name} stone`}
            amount={priceBreakdown.stoneCost}
          />
        )}
        
        <PriceBreakdownItem
          label="Engraving"
          amount={priceBreakdown.engravingCost}
        />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-4">
        <BodyText className="text-lg font-semibold text-foreground">
          Total
        </BodyText>
        <BodyText className="text-xl font-bold text-foreground">
          {formatPrice(priceBreakdown.total)}
        </BodyText>
      </div>

      {/* Value propositions */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <MutedText size="sm">Free shipping & 30-day returns</MutedText>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <MutedText size="sm">IGI & GCAL certified diamonds</MutedText>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <MutedText size="sm">Lifetime warranty included</MutedText>
        </div>
      </div>

      {/* Financing option */}
      <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <BodyText className="text-sm font-medium text-foreground">
            Pay in installments
          </BodyText>
          <BodyText className="text-sm font-semibold text-foreground">
            {formatPrice(Math.round(priceBreakdown.total / 4))}/month
          </BodyText>
        </div>
        <MutedText size="sm">
          4 interest-free payments with Sezzle or Afterpay
        </MutedText>
      </div>

      {/* Lab-grown vs mined comparison */}
      {product.originalPrice && (
        <div className="mt-6 p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <BodyText className="text-sm font-medium text-foreground">
              Lab-Grown Advantage
            </BodyText>
          </div>
          <MutedText size="sm" className="leading-relaxed">
            Each lab-created gem reduces mining waste by 95%. Choose conscious luxury 
            that doesn't compromise on beauty or ethics.
          </MutedText>
        </div>
      )}

      {/* Price update notification */}
      {isAnimating && (
        <div className="fixed bottom-4 right-4 bg-accent text-foreground px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50">
          <BodyText className="text-sm font-medium">
            Design updated
          </BodyText>
        </div>
      )}
    </div>
  )
}