/**
 * Pricing Utilities
 * Functions for calculating product prices, discounts, and customization costs
 */

interface CustomizationOptions {
  material?: string
  gemstone?: string
  size?: string
  finish?: string
  engraving?: string
}

interface ProductPricing {
  base: number
  current: number
  currency: string
}

interface CustomizationPricing {
  materials?: Array<{
    id: string
    name: string
    priceModifier: number
  }>
  gemstones?: Array<{
    id: string
    name: string
    priceModifier: number
  }>
  sizes?: Array<{
    value: string
    label: string
    priceModifier: number
  }>
  finishes?: Array<{
    id: string
    name: string
    priceModifier: number
  }>
  engraving?: {
    enabled: boolean
    priceModifier: number
  }
}

/**
 * Calculate custom price based on base product price and customization options
 */
export function calculateCustomPrice(
  basePrice: number,
  customization: CustomizationOptions,
  customizationPricing: CustomizationPricing
): number {
  let totalPrice = basePrice

  // Add material price modifier
  if (customization.material && customizationPricing.materials) {
    const material = customizationPricing.materials.find(m => m.id === customization.material)
    if (material) {
      totalPrice += material.priceModifier
    }
  }

  // Add gemstone price modifier
  if (customization.gemstone && customizationPricing.gemstones) {
    const gemstone = customizationPricing.gemstones.find(g => g.id === customization.gemstone)
    if (gemstone) {
      totalPrice += gemstone.priceModifier
    }
  }

  // Add size price modifier
  if (customization.size && customizationPricing.sizes) {
    const size = customizationPricing.sizes.find(s => s.value === customization.size)
    if (size) {
      totalPrice += size.priceModifier
    }
  }

  // Add finish price modifier
  if (customization.finish && customizationPricing.finishes) {
    const finish = customizationPricing.finishes.find(f => f.id === customization.finish)
    if (finish) {
      totalPrice += finish.priceModifier
    }
  }

  // Add engraving price modifier
  if (customization.engraving && customization.engraving.trim() !== '' && customizationPricing.engraving?.enabled) {
    totalPrice += customizationPricing.engraving.priceModifier
  }

  return Math.max(0, totalPrice) // Ensure price doesn't go negative
}

/**
 * Calculate discount amount and percentage
 */
export function calculateDiscount(originalPrice: number, discountedPrice: number) {
  const discountAmount = originalPrice - discountedPrice
  const discountPercentage = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0
  
  return {
    amount: Math.max(0, discountAmount),
    percentage: Math.max(0, discountPercentage)
  }
}

/**
 * Apply percentage discount to a price
 */
export function applyPercentageDiscount(price: number, discountPercentage: number): number {
  const discountAmount = (price * discountPercentage) / 100
  return Math.max(0, price - discountAmount)
}

/**
 * Apply fixed amount discount to a price
 */
export function applyFixedDiscount(price: number, discountAmount: number): number {
  return Math.max(0, price - discountAmount)
}

/**
 * Calculate tax amount based on price and tax rate
 */
export function calculateTax(price: number, taxRate: number): number {
  return (price * taxRate) / 100
}

/**
 * Calculate shipping cost based on various factors
 */
export function calculateShipping(
  subtotal: number,
  weight: number,
  destination: string,
  shippingMethod: 'standard' | 'express' | 'overnight' = 'standard'
): number {
  // Free shipping threshold
  const freeShippingThreshold = 100

  if (subtotal >= freeShippingThreshold) {
    return 0
  }

  // Base shipping rates
  const shippingRates = {
    standard: 9.99,
    express: 19.99,
    overnight: 39.99
  }

  let shippingCost = shippingRates[shippingMethod]

  // Weight-based adjustments
  if (weight > 1) { // 1 lb base
    const additionalWeight = weight - 1
    shippingCost += additionalWeight * 2.50 // $2.50 per additional lb
  }

  // International shipping adjustment
  if (destination && destination !== 'US') {
    shippingCost *= 2.5 // 2.5x for international
  }

  return Math.round(shippingCost * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate total order amount including tax and shipping
 */
export function calculateOrderTotal(
  subtotal: number,
  taxRate: number = 0,
  shippingCost: number = 0,
  discountAmount: number = 0
): {
  subtotal: number
  discount: number
  taxableAmount: number
  tax: number
  shipping: number
  total: number
} {
  const discount = Math.min(discountAmount, subtotal)
  const taxableAmount = subtotal - discount
  const tax = calculateTax(taxableAmount, taxRate)
  const total = taxableAmount + tax + shippingCost

  return {
    subtotal,
    discount,
    taxableAmount,
    tax: Math.round(tax * 100) / 100,
    shipping: shippingCost,
    total: Math.round(total * 100) / 100
  }
}

/**
 * Format price for display
 */
export function formatPrice(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Generate price tiers for bulk pricing
 */
export function generatePriceTiers(basePrice: number): Array<{
  quantity: number
  price: number
  discount: number
  savings: number
}> {
  const tiers = [
    { quantity: 1, discount: 0 },
    { quantity: 5, discount: 5 },   // 5% off for 5+
    { quantity: 10, discount: 10 }, // 10% off for 10+
    { quantity: 25, discount: 15 }  // 15% off for 25+
  ]

  return tiers.map(tier => {
    const discountedPrice = applyPercentageDiscount(basePrice, tier.discount)
    const savings = (basePrice - discountedPrice) * tier.quantity
    
    return {
      quantity: tier.quantity,
      price: Math.round(discountedPrice * 100) / 100,
      discount: tier.discount,
      savings: Math.round(savings * 100) / 100
    }
  })
}

/**
 * Check if a price is valid (positive number)
 */
export function isValidPrice(price: any): price is number {
  return typeof price === 'number' && price >= 0 && !isNaN(price) && isFinite(price)
}

/**
 * Convert between currencies (placeholder - would integrate with real exchange rates)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate?: number
): number {
  if (fromCurrency === toCurrency) return amount
  
  // Placeholder conversion - in production, use real exchange rates
  const rate = exchangeRate || 1
  return Math.round(amount * rate * 100) / 100
}