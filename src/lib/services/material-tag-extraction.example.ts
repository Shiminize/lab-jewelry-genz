/**
 * Material Tag Extraction Service Usage Examples
 * Demonstrates how to use the tag extraction service for filtering
 * CLAUDE_RULES.md compliant implementation examples
 */

import type { ProductListDTO } from '@/types/product-dto'
import { createMaterialSpecs } from '@/types/product-dto'
import { 
  extractMaterialTags,
  extractMaterialTagsBatch,
  getUniqueTagsByCategory,
  sortTagsByCategory,
  createTagFilters,
  aggregateTags
} from './material-tag-extraction.service'

// Example 1: Extract tags from a single product
export function exampleSingleProductTagExtraction() {
  const product: ProductListDTO = {
    _id: 'ring-001',
    name: 'Elegant Moissanite Ring',
    description: 'Beautiful 1.5CT moissanite ring in 14K gold',
    category: 'rings',
    subcategory: 'engagement-rings',
    slug: 'elegant-moissanite-ring',
    primaryImage: '/images/ring-001.jpg',
    pricing: { basePrice: 1200, currency: 'USD' },
    inventory: { available: true, quantity: 5 },
    metadata: { featured: true, bestseller: false, newArrival: true, tags: [] },
    materialSpecs: createMaterialSpecs('14k-gold', { type: 'moissanite', carat: 1.5 })
  }

  const result = extractMaterialTags(product)
  
  if (result.success && result.data) {

    // Output:
    // [
    //   { id: 'metal-14k-gold', category: 'metal', displayName: '14K Gold', filterValue: '14k-gold', sortOrder: 1 },
    //   { id: 'stone-moissanite', category: 'stone', displayName: 'Moissanite', filterValue: 'moissanite', sortOrder: 1 },
    //   { id: 'carat-1-5', category: 'carat', displayName: '1.5CT', filterValue: '1.5', sortOrder: 2 }
    // ]

    // Performance should be <50ms as per CLAUDE_RULES.md
  }
}

// Example 2: Process a product catalog for filtering
export function exampleCatalogTagExtraction() {
  const productCatalog: ProductListDTO[] = [
    {
      _id: 'ring-001',
      name: 'Silver Ring',
      description: 'Classic silver ring',
      category: 'rings',
      subcategory: 'fashion-rings',
      slug: 'silver-ring',
      primaryImage: '/images/ring-001.jpg',
      pricing: { basePrice: 300, currency: 'USD' },
      inventory: { available: true },
      metadata: { featured: false, bestseller: false, newArrival: false, tags: [] },
      materialSpecs: createMaterialSpecs('silver')
    },
    {
      _id: 'ring-002',
      name: 'Diamond Engagement Ring',
      description: '2CT lab diamond in platinum setting',
      category: 'rings',
      subcategory: 'engagement-rings',
      slug: 'diamond-engagement-ring',
      primaryImage: '/images/ring-002.jpg',
      pricing: { basePrice: 3500, currency: 'USD' },
      inventory: { available: true },
      metadata: { featured: true, bestseller: true, newArrival: false, tags: [] },
      materialSpecs: createMaterialSpecs('platinum', { type: 'lab-diamond', carat: 2.0 })
    },
    {
      _id: 'necklace-001',
      name: 'Gold Ruby Necklace',
      description: '0.8CT lab ruby on 18K gold chain',
      category: 'necklaces',
      subcategory: 'pendants',
      slug: 'gold-ruby-necklace',
      primaryImage: '/images/necklace-001.jpg',
      pricing: { basePrice: 1800, currency: 'USD' },
      inventory: { available: true },
      metadata: { featured: false, bestseller: false, newArrival: true, tags: [] },
      materialSpecs: createMaterialSpecs('18k-gold', { type: 'lab-ruby', carat: 0.8 })
    }
  ]

  // Extract all tags from the catalog
  const batchResult = extractMaterialTagsBatch(productCatalog)
  
  if (batchResult.successCount > 0) {

    // Group tags by category for filtering UI
    const stoneTags = getUniqueTagsByCategory(batchResult.allTags, 'stone')
    const metalTags = getUniqueTagsByCategory(batchResult.allTags, 'metal')
    const caratTags = getUniqueTagsByCategory(batchResult.allTags, 'carat')

    // Sort all tags for consistent display
    const sortedTags = sortTagsByCategory(batchResult.allTags)

    // Generate analytics data
    const tagAnalytics = aggregateTags(batchResult.allTags, productCatalog.length)

  }
}

// Example 3: Create filters for API queries
export function exampleFilterCreation() {
  // Simulate user selecting filter tags in the UI
  const selectedTags = [
    { id: 'stone-lab-diamond', category: 'stone' as const, displayName: 'Lab Diamond', filterValue: 'lab-diamond', sortOrder: 0 },
    { id: 'metal-platinum', category: 'metal' as const, displayName: 'Platinum', filterValue: 'platinum', sortOrder: 0 },
    { id: 'carat-2', category: 'carat' as const, displayName: '2CT', filterValue: '2', sortOrder: 4 }
  ]
  
  // Convert to API filter format
  const apiFilters = createTagFilters(selectedTags)

  // Output:
  // {
  //   stoneTypes: ['lab-diamond'],
  //   metalTypes: ['platinum'], 
  //   caratWeights: [2],
  //   filterValues: ['lab-diamond', 'platinum', '2']
  // }
  
  // Example of how this would be used in an API call
  const apiQuery = {
    endpoint: '/api/products/search',
    params: {
      filters: {
        'materialSpecs.primaryStone.type': { $in: apiFilters.stoneTypes },
        'materialSpecs.primaryMetal.type': { $in: apiFilters.metalTypes },
        'materialSpecs.primaryStone.carat': { $gte: Math.min(...(apiFilters.caratWeights || [])) }
      }
    }
  }

}

// Example 4: Performance monitoring
export function examplePerformanceMonitoring() {
  // Generate large dataset for performance testing
  const largeDataset: ProductListDTO[] = Array.from({ length: 1000 }, (_, i) => ({
    _id: `product-${i}`,
    name: `Product ${i}`,
    description: `Test product ${i}`,
    category: 'rings' as const,
    subcategory: 'fashion-rings' as const,
    slug: `product-${i}`,
    primaryImage: `/images/product-${i}.jpg`,
    pricing: { basePrice: 500 + i, currency: 'USD' },
    inventory: { available: true },
    metadata: { featured: false, bestseller: false, newArrival: false, tags: [] },
    materialSpecs: createMaterialSpecs(
      ['silver', '14k-gold', '18k-gold', 'platinum'][i % 4] as any,
      i % 3 === 0 ? { 
        type: ['lab-diamond', 'moissanite', 'lab-emerald'][i % 3] as any, 
        carat: 0.5 + (i % 5) * 0.5 
      } : undefined
    )
  }))

  const start = performance.now()
  const result = extractMaterialTagsBatch(largeDataset)
  const elapsed = performance.now() - start

  if (result.errorCount > 0) {

    result.errors.forEach(error => {

    })
  }
}

// Example 5: Custom configuration and options
export function exampleCustomConfiguration() {
  const product: ProductListDTO = {
    _id: 'custom-ring',
    name: 'Custom Ring',
    description: 'Ring with custom tag extraction',
    category: 'rings',
    subcategory: 'engagement-rings',
    slug: 'custom-ring',
    primaryImage: '/images/custom-ring.jpg',
    pricing: { basePrice: 2000, currency: 'USD' },
    inventory: { available: true },
    metadata: { featured: false, bestseller: false, newArrival: false, tags: [] },
    materialSpecs: createMaterialSpecs('platinum', { type: 'lab-diamond', carat: 1.7 })
  }

  // Custom extraction options
  const customOptions = {
    includeCaratTags: true,
    includeStoneTags: true,
    includeMetalTags: true,
    caratRoundingIncrement: 0.25 // Quarter-carat increments instead of half
  }

  // Custom display configuration
  const customConfig = {
    stoneTypePriority: ['lab-diamond', 'lab-emerald', 'moissanite', 'lab-ruby', 'lab-sapphire'],
    metalTypePriority: ['platinum', '18k-gold', '14k-gold', 'silver'],
    caratWeightPriority: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5],
    customDisplayNames: {
      'lab-diamond': 'Premium Lab Diamond',
      'platinum': 'Platinum Premium'
    }
  }

  const result = extractMaterialTags(product, customOptions, customConfig)
  
  if (result.success && result.data) {

    // Will show 1.75CT instead of 2CT due to custom rounding
    // Will show "Premium Lab Diamond" instead of "Lab Diamond"
  }
}

// Export all examples for easy testing
export const examples = {
  singleProduct: exampleSingleProductTagExtraction,
  catalogProcessing: exampleCatalogTagExtraction,
  filterCreation: exampleFilterCreation,
  performanceMonitoring: examplePerformanceMonitoring,
  customConfiguration: exampleCustomConfiguration
}