// ProductCard helper functions extracted for CLAUDE_RULES compliance
import type { ProductListDTO, ProductDisplayDTO } from '@/types/product-dto'

export type ProductCardData = ProductListDTO | ProductDisplayDTO

// Type for extracted price data
export type ExtractedPriceData = {
  basePrice: number
  originalPrice?: number
  currency: string
  hasDiscount: boolean
  discountPercentage: number
}

// Type-safe price extraction (handles both ProductDisplayDTO and ProductListDTO)
export const extractPrice = (product: ProductCardData): ExtractedPriceData => {
  let basePrice = 0;
  let originalPrice: number | undefined;
  let currency = 'USD';

  // ProductDisplayDTO has direct basePrice property
  if ('basePrice' in product && typeof product.basePrice === 'number') {
    basePrice = product.basePrice;
    originalPrice = product.originalPrice;
    currency = product.currency || 'USD';
  }
  // ProductListDTO has nested pricing object
  else if ('pricing' in product && product.pricing) {
    basePrice = product.pricing.basePrice || 0;
    originalPrice = undefined; // ProductListDTO doesn't have originalPrice
    currency = product.pricing.currency || 'USD';
  }

  // Calculate discount information
  const hasDiscount = !!originalPrice && originalPrice > basePrice;
  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
    : 0;

  return { 
    basePrice, 
    originalPrice, 
    currency,
    hasDiscount,
    discountPercentage
  };
}

export const formatPrice = (price: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

// Category-based gradient mapping (uses Tailwind's native gradient syntax for text compatibility)
export const getCategoryGradient = (category?: string): string => {
  switch (category?.toLowerCase()) {
    case 'necklaces': 
      return 'bg-gradient-to-r from-acid-yellow to-volt-glow' // Yellow to green gradient
    case 'bracelets': 
      return 'bg-gradient-to-r from-volt-glow to-digital-blue' // Green to blue gradient
    case 'earrings': 
      return 'bg-gradient-to-r from-holo-purple to-cyber-pink' // Purple to pink gradient
    case 'rings': 
      return 'bg-gradient-to-r from-digital-blue to-holo-purple' // Blue to purple gradient
    default: 
      return 'bg-gradient-to-r from-void-400 to-void-600' // Neutral fallback gradient
  }
}

// Button-specific gradient helper (reuses getCategoryGradient)
export const getButtonGradient = (category?: string): string => {
  return getCategoryGradient(category)
}

// Extract and format material composition for display
export const extractMaterialSpecs = (product: ProductCardData): string | null => {
  // Check for materialSpecs in ProductDisplayDTO format
  if ('materialSpecs' in product && product.materialSpecs) {
    const specs = product.materialSpecs
    const materials: string[] = []
    
    // Extract primary metal
    if (specs.primaryMetal?.displayName) {
      materials.push(specs.primaryMetal.displayName)
    } else if (specs.primaryMetal?.type) {
      // Format type if no display name (e.g., "14k-gold" -> "14K Gold")
      const formatted = specs.primaryMetal.type
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
      materials.push(formatted)
    }
    
    // Extract primary stone
    if (specs.primaryStone?.displayName) {
      materials.push(specs.primaryStone.displayName)
    } else if (specs.primaryStone?.type) {
      // Format stone type
      const formatted = specs.primaryStone.type
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
      materials.push(formatted)
    }
    
    return materials.length > 0 ? materials.join(' • ') : null
  }
  
  // Check for materials array in ProductListDTO format
  if ('materials' in product && product.materials && Array.isArray(product.materials)) {
    const materials = product.materials
      .slice(0, 2) // Limit to first 2 materials for space
      .map((material: string) => {
        // Format material string (e.g., "14k-gold" -> "14K Gold")
        return material
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
          .replace(/\b14k\b/gi, '14K')
          .replace(/\b18k\b/gi, '18K')
          .replace(/\b10k\b/gi, '10K')
      })
    
    return materials.length > 0 ? materials.join(' • ') : null
  }
  
  // Check for gemstones array as fallback
  if ('gemstones' in product && product.gemstones && Array.isArray(product.gemstones)) {
    const gemstones = product.gemstones
      .slice(0, 2) // Limit to first 2 gemstones
      .map((gem: any) => {
        if (typeof gem === 'object' && gem.type) {
          return gem.type
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase())
        }
        return null
      })
      .filter(Boolean)
    
    return gemstones.length > 0 ? gemstones.join(' • ') : null
  }
  
  return null
}