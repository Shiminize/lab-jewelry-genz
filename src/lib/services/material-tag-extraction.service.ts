/**
 * Material Tag Extraction Service
 * Generates dynamic tags from ProductListDTO material specifications
 * 
 * CLAUDE_RULES.md Compliance:
 * - TypeScript strict mode with no 'any' types
 * - Performance: <50ms for tag extraction operations
 * - Error-first coding with clear recovery paths
 * - Component architecture: composition over inheritance
 * - Pure functions for testability
 * 
 * @author GenZ Jewelry Platform
 * @version 1.0.0
 */

import type { 
  ProductListDTO, 
  ProductDisplayDTO,
  MetalType, 
  StoneType,
  ProductListMaterialSpecs 
} from '@/types/product-dto'

// Union type for flexible product data handling (CLAUDE_RULES.md TypeScript strict mode)
type ProductWithMaterialSpecs = ProductListDTO | ProductDisplayDTO
import type {
  MaterialTag,
  TagCategory,
  TagExtractionOptions,
  TagExtractionResult,
  BatchTagExtractionResult,
  MaterialTagFilter,
  TagAggregation,
  TagExtractionMetrics,
  TagExtractionError,
  TagDisplayConfig
} from '@/types/material-tags'
import { DEFAULT_TAG_CONFIG } from '@/types/material-tags'
import { TAG_EXTRACTION_CONSTANTS } from '@/types/material-tags'

/**
 * Cache for memoization of tag extraction results
 * Improves performance for repeated operations
 */
const tagCache = new Map<string, MaterialTag[]>()

/**
 * Performance monitoring utility
 */
const createPerformanceTimer = () => {
  const start = performance.now()
  return {
    end: (): number => performance.now() - start,
    isWithinThreshold: (elapsed: number): boolean => 
      elapsed <= TAG_EXTRACTION_CONSTANTS.MAX_EXTRACTION_TIME
  }
}

/**
 * Generates a cache key for memoization
 */
const generateCacheKey = (
  materialSpecs: ProductListMaterialSpecs,
  options: TagExtractionOptions = {}
): string => {
  const metalKey = `${materialSpecs.primaryMetal.type}-${materialSpecs.primaryMetal.purity}`
  const stoneKey = materialSpecs.primaryStone 
    ? `${materialSpecs.primaryStone.type}-${materialSpecs.primaryStone.carat}`
    : 'no-stone'
  const optionsKey = JSON.stringify(options)
  
  return `${metalKey}|${stoneKey}|${optionsKey}`
}

/**
 * Rounds carat weight to nearest increment for tagging
 * 
 * @param carat - Raw carat weight
 * @param increment - Rounding increment (default: 0.5)
 * @returns Rounded carat weight
 */
const roundCaratWeight = (carat: number, increment: number = 0.5): number => {
  if (carat < TAG_EXTRACTION_CONSTANTS.MIN_CARAT_WEIGHT || 
      carat > TAG_EXTRACTION_CONSTANTS.MAX_CARAT_WEIGHT) {
    throw new Error(`Invalid carat weight: ${carat}. Must be between ${TAG_EXTRACTION_CONSTANTS.MIN_CARAT_WEIGHT} and ${TAG_EXTRACTION_CONSTANTS.MAX_CARAT_WEIGHT}`)
  }
  
  return Math.round(carat / increment) * increment
}

/**
 * Creates a stone type tag from material specifications
 * 
 * @param stoneSpec - Stone specification from material specs
 * @param config - Display configuration
 * @returns Material tag for stone type
 */
const createStoneTag = (
  stoneSpec: NonNullable<ProductListMaterialSpecs['primaryStone']>,
  config: TagDisplayConfig = DEFAULT_TAG_CONFIG
): MaterialTag => {
  const stoneOrder = config.stoneTypePriority.indexOf(stoneSpec.type)
  const displayName = config.customDisplayNames?.[stoneSpec.type] || stoneSpec.type
  
  return {
    id: `stone-${stoneSpec.type}`,
    category: 'stone',
    displayName,
    filterValue: stoneSpec.type,
    sortOrder: stoneOrder >= 0 ? stoneOrder : 999
  }
}

/**
 * Creates a carat weight tag from stone specifications
 * 
 * @param stoneSpec - Stone specification from material specs
 * @param config - Display configuration
 * @param caratIncrement - Rounding increment for carat weights
 * @returns Material tag for carat weight
 */
const createCaratTag = (
  stoneSpec: NonNullable<ProductListMaterialSpecs['primaryStone']>,
  config: TagDisplayConfig = DEFAULT_TAG_CONFIG,
  caratIncrement: number = TAG_EXTRACTION_CONSTANTS.DEFAULT_CARAT_INCREMENT
): MaterialTag => {
  const roundedCarat = roundCaratWeight(stoneSpec.carat, caratIncrement)
  const caratOrder = config.caratWeightPriority.indexOf(roundedCarat)
  const displayName = roundedCarat >= 2.5 ? '2.5CT+' : `${roundedCarat}CT`
  
  return {
    id: `carat-${roundedCarat.toString().replace('.', '-')}`,
    category: 'carat',
    displayName,
    filterValue: roundedCarat.toString(),
    sortOrder: caratOrder >= 0 ? caratOrder : 999
  }
}

/**
 * Creates a metal type tag from material specifications
 * 
 * @param metalSpec - Metal specification from material specs
 * @param config - Display configuration
 * @returns Material tag for metal type
 */
const createMetalTag = (
  metalSpec: ProductListMaterialSpecs['primaryMetal'],
  config: TagDisplayConfig = DEFAULT_TAG_CONFIG
): MaterialTag => {
  const metalOrder = config.metalTypePriority.indexOf(metalSpec.type)
  const displayName = config.customDisplayNames?.[metalSpec.type] || metalSpec.displayName
  
  return {
    id: `metal-${metalSpec.type}`,
    category: 'metal',
    displayName,
    filterValue: metalSpec.type,
    sortOrder: metalOrder >= 0 ? metalOrder : 999
  }
}

/**
 * Validates material specifications for tag extraction
 * 
 * @param materialSpecs - Material specifications to validate
 * @returns Validation result with error details if invalid
 */
const validateMaterialSpecs = (
  materialSpecs: ProductListMaterialSpecs
): { isValid: boolean; error?: TagExtractionError; message?: string } => {
  if (!materialSpecs) {
    return {
      isValid: false,
      error: 'MISSING_REQUIRED_DATA',
      message: 'Material specifications are required'
    }
  }

  if (!materialSpecs.primaryMetal) {
    return {
      isValid: false,
      error: 'MISSING_REQUIRED_DATA',
      message: 'Primary metal specification is required'
    }
  }

  const validMetalTypes: MetalType[] = ['silver', '14k-gold', '18k-gold', 'platinum']
  if (!validMetalTypes.includes(materialSpecs.primaryMetal.type)) {
    return {
      isValid: false,
      error: 'UNKNOWN_METAL_TYPE',
      message: `Unknown metal type: ${materialSpecs.primaryMetal.type}`
    }
  }

  if (materialSpecs.primaryStone) {
    const validStoneTypes: StoneType[] = ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']
    if (!validStoneTypes.includes(materialSpecs.primaryStone.type)) {
      return {
        isValid: false,
        error: 'UNKNOWN_STONE_TYPE',
        message: `Unknown stone type: ${materialSpecs.primaryStone.type}`
      }
    }

    if (materialSpecs.primaryStone.carat < TAG_EXTRACTION_CONSTANTS.MIN_CARAT_WEIGHT ||
        materialSpecs.primaryStone.carat > TAG_EXTRACTION_CONSTANTS.MAX_CARAT_WEIGHT) {
      return {
        isValid: false,
        error: 'INVALID_CARAT_VALUE',
        message: `Invalid carat weight: ${materialSpecs.primaryStone.carat}`
      }
    }
  }

  return { isValid: true }
}

/**
 * Main tag extraction function for a single product
 * Extracts material tags from ProductListDTO material specifications
 * 
 * @param product - Product with material specifications
 * @param options - Extraction options for customization
 * @param config - Display configuration for tags
 * @returns Tag extraction result with performance metrics
 */
export function extractMaterialTags(
  product: ProductWithMaterialSpecs,
  options: TagExtractionOptions = {},
  config: TagDisplayConfig = DEFAULT_TAG_CONFIG
): TagExtractionResult<MaterialTag[]> {
  const timer = createPerformanceTimer()
  const extractedTags: MaterialTag[] = []

  try {
    // Validate input
    if (!product?.materialSpecs) {
      return {
        success: false,
        error: {
          type: 'MISSING_REQUIRED_DATA',
          message: 'Product material specifications are required',
          details: { productId: product?._id }
        },
        metrics: {
          extractionTime: timer.end(),
          productsProcessed: 0,
          tagsGenerated: 0,
          isWithinThreshold: false
        }
      }
    }

    // Validate material specifications
    const validation = validateMaterialSpecs(product.materialSpecs)
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          type: validation.error!,
          message: validation.message!,
          details: { productId: product._id, materialSpecs: product.materialSpecs }
        },
        metrics: {
          extractionTime: timer.end(),
          productsProcessed: 0,
          tagsGenerated: 0,
          isWithinThreshold: false
        }
      }
    }

    // Check cache for existing tags
    const cacheKey = generateCacheKey(product.materialSpecs, options)
    const cachedTags = tagCache.get(cacheKey)
    if (cachedTags) {
      const elapsed = timer.end()
      return {
        success: true,
        data: [...cachedTags], // Return copy to prevent mutation
        metrics: {
          extractionTime: elapsed,
          productsProcessed: 1,
          tagsGenerated: cachedTags.length,
          isWithinThreshold: timer.isWithinThreshold(elapsed)
        }
      }
    }

    // Extract metal tag (always included)
    if (options.includeMetalTags !== false) {
      extractedTags.push(createMetalTag(product.materialSpecs.primaryMetal, config))
    }

    // Extract stone and carat tags if stone is present
    if (product.materialSpecs.primaryStone) {
      if (options.includeStoneTags !== false) {
        extractedTags.push(createStoneTag(product.materialSpecs.primaryStone, config))
      }

      if (options.includeCaratTags !== false) {
        extractedTags.push(createCaratTag(
          product.materialSpecs.primaryStone,
          config,
          options.caratRoundingIncrement
        ))
      }
    }

    // Cache the results
    tagCache.set(cacheKey, [...extractedTags])

    const elapsed = timer.end()
    
    // Check performance threshold
    if (!timer.isWithinThreshold(elapsed)) {
      return {
        success: false,
        error: {
          type: 'PERFORMANCE_THRESHOLD_EXCEEDED',
          message: `Tag extraction took ${elapsed}ms, exceeding ${TAG_EXTRACTION_CONSTANTS.MAX_EXTRACTION_TIME}ms threshold`,
          details: { productId: product._id, extractionTime: elapsed }
        },
        metrics: {
          extractionTime: elapsed,
          productsProcessed: 1,
          tagsGenerated: extractedTags.length,
          isWithinThreshold: false
        }
      }
    }

    return {
      success: true,
      data: extractedTags,
      metrics: {
        extractionTime: elapsed,
        productsProcessed: 1,
        tagsGenerated: extractedTags.length,
        isWithinThreshold: true
      }
    }

  } catch (error) {
    const elapsed = timer.end()
    return {
      success: false,
      error: {
        type: 'INVALID_MATERIAL_SPECS',
        message: error instanceof Error ? error.message : 'Unknown error during tag extraction',
        details: { productId: product._id, error: error }
      },
      metrics: {
        extractionTime: elapsed,
        productsProcessed: 0,
        tagsGenerated: 0,
        isWithinThreshold: false
      }
    }
  }
}

/**
 * Batch extraction for multiple products with performance optimization
 * 
 * @param products - Array of products to process
 * @param options - Extraction options
 * @param config - Display configuration
 * @returns Batch processing result with aggregated metrics
 */
export function extractMaterialTagsBatch(
  products: ProductWithMaterialSpecs[],
  options: TagExtractionOptions = {},
  config: TagDisplayConfig = DEFAULT_TAG_CONFIG
): BatchTagExtractionResult {
  const timer = createPerformanceTimer()
  const allTags: MaterialTag[] = []
  const errors: BatchTagExtractionResult['errors'] = []
  let successCount = 0

  // Validate batch size
  if (products.length > TAG_EXTRACTION_CONSTANTS.MAX_BATCH_SIZE) {
    throw new Error(`Batch size ${products.length} exceeds maximum ${TAG_EXTRACTION_CONSTANTS.MAX_BATCH_SIZE}`)
  }

  for (const product of products) {
    const result = extractMaterialTags(product, options, config)
    
    if (result.success && result.data) {
      successCount++
      allTags.push(...result.data)
    } else if (result.error) {
      errors.push({
        productId: product._id,
        error: result.error.type,
        message: result.error.message
      })
    }
  }

  const elapsed = timer.end()

  return {
    successCount,
    errorCount: errors.length,
    allTags: getUniqueTagsById(allTags),
    errors,
    metrics: {
      extractionTime: elapsed,
      productsProcessed: products.length,
      tagsGenerated: allTags.length,
      isWithinThreshold: timer.isWithinThreshold(elapsed)
    }
  }
}

/**
 * Gets unique tags by category for filtering
 * 
 * @param tags - Array of material tags
 * @param category - Tag category to filter by
 * @returns Unique tags for the specified category
 */
export function getUniqueTagsByCategory(
  tags: MaterialTag[],
  category: TagCategory
): MaterialTag[] {
  const uniqueTags = new Map<string, MaterialTag>()
  
  tags
    .filter(tag => tag.category === category)
    .forEach(tag => {
      if (!uniqueTags.has(tag.id)) {
        uniqueTags.set(tag.id, tag)
      }
    })
  
  return Array.from(uniqueTags.values()).sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Gets unique tags by ID (removes duplicates)
 * 
 * @param tags - Array of material tags
 * @returns Unique tags without duplicates
 */
export function getUniqueTagsById(tags: MaterialTag[]): MaterialTag[] {
  const uniqueTags = new Map<string, MaterialTag>()
  
  tags.forEach(tag => {
    if (!uniqueTags.has(tag.id)) {
      uniqueTags.set(tag.id, tag)
    }
  })
  
  return Array.from(uniqueTags.values())
}

/**
 * Sorts tags by category and sort order
 * 
 * @param tags - Array of material tags to sort
 * @returns Sorted tags grouped by category
 */
export function sortTagsByCategory(tags: MaterialTag[]): MaterialTag[] {
  const categoryOrder: Record<TagCategory, number> = {
    'stone': 1,
    'carat': 2,
    'metal': 3
  }
  
  return tags.sort((a, b) => {
    // First sort by category
    const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category]
    if (categoryDiff !== 0) return categoryDiff
    
    // Then sort by sort order within category
    return a.sortOrder - b.sortOrder
  })
}

/**
 * Creates filter object for API queries from selected tags
 * 
 * @param selectedTags - Array of selected material tags
 * @returns Filter object for backend processing
 */
export function createTagFilters(selectedTags: MaterialTag[]): MaterialTagFilter {
  const stoneTypes: StoneType[] = []
  const metalTypes: MetalType[] = []
  const caratWeights: number[] = []
  const filterValues: string[] = []

  selectedTags.forEach(tag => {
    filterValues.push(tag.filterValue)
    
    switch (tag.category) {
      case 'stone':
        if (!stoneTypes.includes(tag.filterValue as StoneType)) {
          stoneTypes.push(tag.filterValue as StoneType)
        }
        break
      case 'metal':
        if (!metalTypes.includes(tag.filterValue as MetalType)) {
          metalTypes.push(tag.filterValue as MetalType)
        }
        break
      case 'carat':
        const caratValue = parseFloat(tag.filterValue)
        if (!isNaN(caratValue) && !caratWeights.includes(caratValue)) {
          caratWeights.push(caratValue)
        }
        break
    }
  })

  return {
    stoneTypes: stoneTypes.length > 0 ? stoneTypes : undefined,
    metalTypes: metalTypes.length > 0 ? metalTypes : undefined,
    caratWeights: caratWeights.length > 0 ? caratWeights : undefined,
    filterValues
  }
}

/**
 * Aggregates tags with count and percentage information
 * 
 * @param tags - Array of all material tags
 * @param totalProducts - Total number of products for percentage calculation
 * @returns Tag aggregation data for analytics
 */
export function aggregateTags(
  tags: MaterialTag[],
  totalProducts: number
): TagAggregation[] {
  const tagCounts = new Map<string, { tag: MaterialTag; count: number }>()
  
  tags.forEach(tag => {
    const existing = tagCounts.get(tag.id)
    if (existing) {
      existing.count++
    } else {
      tagCounts.set(tag.id, { tag, count: 1 })
    }
  })
  
  return Array.from(tagCounts.values()).map(({ tag, count }) => ({
    tag,
    count,
    percentage: totalProducts > 0 ? (count / totalProducts) * 100 : 0
  }))
}

/**
 * Clears the tag extraction cache
 * Useful for testing or when material specifications change
 */
export function clearTagCache(): void {
  tagCache.clear()
}

/**
 * Gets cache statistics for monitoring
 * 
 * @returns Cache size and performance metrics
 */
export function getTagCacheStats(): {
  size: number;
  maxSize: number;
  hitRate?: number;
} {
  return {
    size: tagCache.size,
    maxSize: 1000, // Reasonable cache size limit
    hitRate: undefined // Would need request tracking to calculate
  }
}