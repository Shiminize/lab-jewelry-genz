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
  console.log(`🏷️  Material Tag Extraction Demo - Processing ${products.length} products`)
  
  // Extract tags from all products for filter generation
  const batchResult = extractMaterialTagsBatch(products, {
    includeCaratTags: true,
    includeStoneTags: true,
    includeMetalTags: true
  })
  
  if (batchResult.successCount > 0) {
    console.log(`✅ Successfully processed ${batchResult.successCount}/${products.length} products`)
    console.log(`⚡ Processing time: ${batchResult.metrics.extractionTime.toFixed(2)}ms`)
    console.log(`🎯 Performance compliant: ${batchResult.metrics.isWithinThreshold ? 'YES' : 'NO'}`)
    console.log(`🏷️  Generated ${batchResult.allTags.length} unique tags`)
    
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
    
    console.log('\n📊 Available Filter Options:')
    console.log(`   Metals: ${Array.from(metalTypes).join(', ')}`)
    console.log(`   Stones: ${Array.from(stoneTypes).join(', ')}`)
    console.log(`   Carats: ${Array.from(caratWeights).join(', ')}`)
    
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
    console.log(`❌ Failed to process products: ${batchResult.errorCount} errors`)
    return { success: false, errors: batchResult.errors }
  }
}

/**
 * Demonstrates how search API could use tag filters
 * This would typically be used in /src/app/api/products/search/route.ts
 */
export function demoSearchAPIIntegration(userSelectedTags: string[]) {
  console.log(`🔍 Search API Integration Demo - User selected: ${userSelectedTags.join(', ')}`)
  
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
  
  console.log('🔧 Generated MongoDB Query Filters:')
  console.log('   Stone types:', apiFilters.stoneTypes)
  console.log('   Metal types:', apiFilters.metalTypes)
  console.log('   Carat weights:', apiFilters.caratWeights)
  
  // Example MongoDB query structure
  const mongoQuery = {
    $and: [
      apiFilters.stoneTypes ? { 'materialSpecs.primaryStone.type': { $in: apiFilters.stoneTypes } } : {},
      apiFilters.metalTypes ? { 'materialSpecs.primaryMetal.type': { $in: apiFilters.metalTypes } } : {},
      apiFilters.caratWeights ? { 'materialSpecs.primaryStone.carat': { $in: apiFilters.caratWeights } } : {}
    ].filter(filter => Object.keys(filter).length > 0)
  }
  
  console.log('📝 Example MongoDB Query:')
  console.log(JSON.stringify(mongoQuery, null, 2))
  
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
  console.log('🚀 Performance Benchmark - CLAUDE_RULES.md <50ms requirement')
  
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
  
  console.log('\n📊 Benchmark Results:')
  console.log(`   Products processed: ${testProducts.length}`)
  console.log(`   Success rate: ${(result.successCount / testProducts.length * 100).toFixed(1)}%`)
  console.log(`   Total time: ${totalTime.toFixed(2)}ms`)
  console.log(`   Per product: ${(totalTime / testProducts.length).toFixed(3)}ms`)
  console.log(`   Unique tags: ${result.allTags.length}`)
  console.log(`   CLAUDE_RULES compliant: ${result.metrics.isWithinThreshold ? '✅ YES' : '❌ NO'}`)
  
  if (totalTime > 50) {
    console.log(`⚠️  WARNING: Benchmark exceeded 50ms threshold (${totalTime.toFixed(2)}ms)`)
  } else {
    console.log(`🎯 EXCELLENT: Well within performance requirements`)
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
  console.log('🧪 Material Tag Service Integration Demos')
  console.log('=========================================\n')
  
  // Run performance benchmark
  demoPerfomanceBenchmark().then(result => {
    console.log('\n✅ Integration demos completed successfully!')
    console.log(`🎯 Performance: ${result.isCompliant ? 'COMPLIANT' : 'NEEDS_OPTIMIZATION'}`)
  }).catch(error => {
    console.error('❌ Demo failed:', error)
  })
}