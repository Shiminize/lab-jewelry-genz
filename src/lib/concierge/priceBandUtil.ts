/**
 * Price Band Utility
 * Computes price bands for products at write-time
 */

export type PriceBand = 'under-100' | 'under-300' | 'under-500' | 'under-1000' | 'over-1000'

export interface PriceBandRange {
  min: number
  max: number
  label: string
}

/**
 * Price band definitions
 * These are deterministic and should never change
 */
export const PRICE_BANDS: Record<PriceBand, PriceBandRange> = {
  'under-100': { min: 0, max: 100, label: 'Under $100' },
  'under-300': { min: 0, max: 300, label: 'Under $300' },
  'under-500': { min: 0, max: 500, label: 'Under $500' },
  'under-1000': { min: 0, max: 1000, label: 'Under $1,000' },
  'over-1000': { min: 1000, max: Number.MAX_SAFE_INTEGER, label: 'Over $1,000' }
}

/**
 * Compute price band for a given price
 * Returns the most specific band that applies
 * 
 * @param price - Product price in USD
 * @returns PriceBand identifier
 */
export function computePriceBand(price: number): PriceBand {
  if (typeof price !== 'number' || price < 0) {
    return 'over-1000' // Default for invalid prices
  }

  if (price < 100) return 'under-100'
  if (price < 300) return 'under-300'
  if (price < 500) return 'under-500'
  if (price < 1000) return 'under-1000'
  return 'over-1000'
}

/**
 * Get all applicable price bands for a given price
 * A product at $250 would be in both 'under-300' and 'under-500' and 'under-1000'
 * 
 * @param price - Product price in USD
 * @returns Array of applicable PriceBand identifiers
 */
export function getAllApplicableBands(price: number): PriceBand[] {
  const bands: PriceBand[] = []
  
  if (typeof price !== 'number' || price < 0) {
    return ['over-1000']
  }

  if (price < 100) bands.push('under-100')
  if (price < 300) bands.push('under-300')
  if (price < 500) bands.push('under-500')
  if (price < 1000) bands.push('under-1000')
  if (price >= 1000) bands.push('over-1000')

  return bands
}

/**
 * Get price range for a given band
 * 
 * @param band - PriceBand identifier
 * @returns Price range { min, max, label }
 */
export function getPriceBandRange(band: PriceBand): PriceBandRange {
  return PRICE_BANDS[band]
}

/**
 * Check if a price falls within a given band
 * 
 * @param price - Product price in USD
 * @param band - PriceBand identifier
 * @returns true if price is within the band
 */
export function isPriceInBand(price: number, band: PriceBand): boolean {
  const range = PRICE_BANDS[band]
  return price >= range.min && price < range.max
}

