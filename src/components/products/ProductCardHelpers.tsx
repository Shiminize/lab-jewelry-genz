// ProductCard helper functions extracted for CLAUDE_RULES compliance
import type { ProductListDTO, ProductDisplayDTO } from '@/types/product-dto'

export type ProductCardData = ProductListDTO | ProductDisplayDTO

// Type-safe price extraction (handles both ProductDisplayDTO and ProductListDTO)
export const extractPrice = (product: ProductCardData) => {
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

export const formatPrice = (price: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}