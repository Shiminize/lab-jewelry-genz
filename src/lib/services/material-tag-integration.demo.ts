/**
 * Material Tag Service Integration Demo
 * Demonstrates integration with existing ProductListDTO system
 * CLAUDE_RULES.md compliant integration example
 */

import type { ProductListDTO } from '@/types/product-dto'
import { extractMaterialTags, extractMaterialTagsBatch, createTagFilters } from './material-tag-extraction.service'

/**
 * Integration demo showing how catalog pages can use material tags
 * This would typically be used in /src/app/catalog/page.tsx
 */
export async function demoProductCatalogIntegration(products: ProductListDTO[]) {

  // Extract tags from all products for filter generation
  const batchResult = extractMaterialTagsBatch(products, {
    includeCaratTags: true,
    includeStoneTags: true,
    includeMetalTags: true
  })
  
  if (batchResult.successCount > 0) {

    // Group tags for UI filters
    const stoneTypes = new Set<string>()
    const metalTypes = new Set<string>()
    const caratWeights = new Set<string>()
    
    batchResult.allTags.forEach(tag => {
      switch (tag.category) {
        case 'stone':
          stoneTypes.add(tag.displayName)
          break
        case 'metal':
          metalTypes.add(tag.displayName)
          break
        case 'carat':
          caratWeights.add(tag.displayName)
          break
      }
    })

    return {
      success: true,
      filterOptions: {
        metals: Array.from(metalTypes),
        stones: Array.from(stoneTypes),
        carats: Array.from(caratWeights)
      },
      performance: {
        extractionTime: batchResult.metrics.extractionTime,
        isCompliant: batchResult.metrics.isWithinThreshold
      }
    }
  } else {

    return { success: false, errors: batchResult.errors }
  }
}

/**
 * Demonstrates how search API could use tag filters
 * This would typically be used in /src/app/api/products/search/route.ts
 */
export function demoSearchAPIIntegration(userSelectedTags: string[]) {

  // Convert user selections to MaterialTag objects (normally from UI state)
  const selectedMaterialTags = userSelectedTags.map((tagId, index) => ({
    id: tagId,
    category: tagId.includes('metal') ? 'metal' as const :
             tagId.includes('stone') ? 'stone' as const : 'carat' as const,
    displayName: tagId.replace(/-/g, ' '),
    filterValue: tagId.split('-')[1],
    sortOrder: index
  }))
  
  // Create API filters for MongoDB query
  const apiFilters = createTagFilters(selectedMaterialTags)

  // Example MongoDB query structure
  const mongoQuery = {
    $and: [
      apiFilters.stoneTypes ? { 'materialSpecs.primaryStone.type': { $in: apiFilters.stoneTypes } } : {},
      apiFilters.metalTypes ? { 'materialSpecs.primaryMetal.type': { $in: apiFilters.metalTypes } } : {},
      apiFilters.caratWeights ? { 'materialSpecs.primaryStone.carat': { $in: apiFilters.caratWeights } } : {}
    ].filter(filter => Object.keys(filter).length > 0)
  }

  return {
    apiFilters,
    mongoQuery,
    filterCount: Object.values(apiFilters).filter(Boolean).length
  }
}

/**
 * Performance benchmark for CLAUDE_RULES compliance
 */
export async function demoPerfomanceBenchmark() {

  // Create test dataset
  const testProducts: ProductListDTO[] = Array.from({ length: 500 }, (_, i) => ({
    _id: `benchmark-${i}`,
    name: `Test Product ${i}`,
    description: `Benchmark product ${i}`,
    category: 'rings' as const,
    subcategory: 'engagement-rings' as const,
    slug: `test-product-${i}`,
    primaryImage: `/test-${i}.jpg`,
    pricing: { basePrice: 1000, currency: 'USD' },
    inventory: { available: true },
    metadata: { featured: false, bestseller: false, newArrival: false, tags: [] },
    materialSpecs: {
      primaryMetal: {
        type: ['silver', '14k-gold', '18k-gold', 'platinum'][i % 4] as any,
        purity: ['925', '14K', '18K', 'PLAT'][i % 4],
        displayName: ['925 Silver', '14K Gold', '18K Gold', 'Platinum'][i % 4]
      },
      primaryStone: i % 3 === 0 ? {
        type: ['lab-diamond', 'moissanite', 'lab-emerald'][i % 3] as any,
        carat: 0.5 + (i % 8) * 0.25,
        displayName: `${0.5 + (i % 8) * 0.25}CT ${['Lab Diamond', 'Moissanite', 'Lab Emerald'][i % 3]}`
      } : undefined
    }
  }))
  
  // Benchmark extraction
  const startTime = performance.now()
  const result = extractMaterialTagsBatch(testProducts)
  const endTime = performance.now()
  const totalTime = endTime - startTime

  if (totalTime > 50) {

  } else {

  }
  
  return {
    totalTime,
    perProductTime: totalTime / testProducts.length,
    successRate: result.successCount / testProducts.length,
    isCompliant: result.metrics.isWithinThreshold,
    uniqueTags: result.allTags.length
  }
}

// Auto-run demos for immediate verification
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {

  // Run performance benchmark
  demoPerfomanceBenchmark().then(result => {

  }).catch(error => {
    console.error('❌ Demo failed:', error)
  })
}