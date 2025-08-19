/**
 * Material Tag Types for Product Filtering
 * Extracts dynamic tags from ProductListDTO material specifications
 * Follows CLAUDE_RULES.md performance and TypeScript standards
 */

import type { MetalType, StoneType } from './product-dto'

/**
 * Tag categories for material-based filtering
 */
export type TagCategory = 'stone' | 'metal' | 'carat'

/**
 * Material tag structure for dynamic filtering system
 */
export interface MaterialTag {
  /** Unique identifier for the tag (kebab-case, URL-safe) */
  id: string
  /** Category classification for grouping */
  category: TagCategory
  /** Human-readable display name */
  displayName: string
  /** Value used for API filtering */
  filterValue: string
  /** Sort order for consistent display */
  sortOrder: number
}

/**
 * Tag extraction options for customizing behavior
 */
export interface TagExtractionOptions {
  /** Whether to include carat weight tags */
  includeCaratTags?: boolean
  /** Whether to include stone type tags */
  includeStoneTags?: boolean
  /** Whether to include metal type tags */
  includeMetalTags?: boolean
  /** Custom carat rounding increment (default: 0.5) */
  caratRoundingIncrement?: number
}

/**
 * Filter object for API queries
 */
export interface MaterialTagFilter {
  /** Stone type filters */
  stoneTypes?: StoneType[]
  /** Metal type filters */
  metalTypes?: MetalType[]
  /** Carat weight filters */
  caratWeights?: number[]
  /** Raw filter values for backend processing */
  filterValues?: string[]
}

/**
 * Tag aggregation result for analytics
 */
export interface TagAggregation {
  /** Tag information */
  tag: MaterialTag
  /** Number of products with this tag */
  count: number
  /** Percentage of total products */
  percentage: number
}

/**
 * Performance metrics for tag extraction
 */
export interface TagExtractionMetrics {
  /** Time taken for extraction in milliseconds */
  extractionTime: number
  /** Number of products processed */
  productsProcessed: number
  /** Number of tags generated */
  tagsGenerated: number
  /** Performance threshold compliance (<50ms) */
  isWithinThreshold: boolean
}

/**
 * Error types for tag extraction
 */
export type TagExtractionError = 
  | 'INVALID_MATERIAL_SPECS'
  | 'MISSING_REQUIRED_DATA'
  | 'PERFORMANCE_THRESHOLD_EXCEEDED'
  | 'UNKNOWN_STONE_TYPE'
  | 'UNKNOWN_METAL_TYPE'
  | 'INVALID_CARAT_VALUE'

/**
 * Result wrapper for tag extraction operations
 */
export interface TagExtractionResult<T = MaterialTag[]> {
  /** Success status */
  success: boolean
  /** Extracted data (if successful) */
  data?: T
  /** Error information (if failed) */
  error?: {
    type: TagExtractionError
    message: string
    details?: Record<string, unknown>
  }
  /** Performance metrics */
  metrics?: TagExtractionMetrics
}

/**
 * Batch processing result for multiple products
 */
export interface BatchTagExtractionResult {
  /** Successfully processed products */
  successCount: number
  /** Failed products */
  errorCount: number
  /** All unique tags extracted */
  allTags: MaterialTag[]
  /** Error details for failed products */
  errors: Array<{
    productId: string
    error: TagExtractionError
    message: string
  }>
  /** Overall performance metrics */
  metrics: TagExtractionMetrics
}

/**
 * Configuration for tag sorting and display
 */
export interface TagDisplayConfig {
  /** Sort order for stone types */
  stoneTypePriority: StoneType[]
  /** Sort order for metal types */
  metalTypePriority: MetalType[]
  /** Sort order for carat weights */
  caratWeightPriority: number[]
  /** Custom display names for override */
  customDisplayNames?: Record<string, string>
}

/**
 * Default tag display configuration
 */
export const DEFAULT_TAG_CONFIG: TagDisplayConfig = {
  stoneTypePriority: ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire'],
  metalTypePriority: ['platinum', '18k-gold', '14k-gold', 'silver'],
  caratWeightPriority: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  customDisplayNames: {
    'lab-diamond': 'Lab Diamond',
    'moissanite': 'Moissanite',
    'lab-emerald': 'Lab Emerald',
    'lab-ruby': 'Lab Ruby',
    'lab-sapphire': 'Lab Sapphire',
    'silver': '925 Silver',
    '14k-gold': '14K Gold',
    '18k-gold': '18K Gold',
    'platinum': 'Platinum'
  }
}

/**
 * Type guards for runtime validation
 */
export const isValidTagCategory = (category: any): category is TagCategory => {
  return typeof category === 'string' && ['stone', 'metal', 'carat'].includes(category)
}

export const isMaterialTag = (obj: any): obj is MaterialTag => {
  return Boolean(
    obj &&
    typeof obj.id === 'string' &&
    isValidTagCategory(obj.category) &&
    typeof obj.displayName === 'string' &&
    typeof obj.filterValue === 'string' &&
    typeof obj.sortOrder === 'number'
  )
}

export const isTagExtractionResult = (obj: any): obj is TagExtractionResult => {
  return Boolean(
    obj &&
    typeof obj.success === 'boolean' &&
    (obj.success ? Array.isArray(obj.data) : obj.error)
  )
}

/**
 * Constants for performance and validation
 */
export const TAG_EXTRACTION_CONSTANTS = {
  /** Maximum extraction time in milliseconds (CLAUDE_RULES compliance) */
  MAX_EXTRACTION_TIME: 50,
  /** Maximum batch size for performance */
  MAX_BATCH_SIZE: 1000,
  /** Default carat rounding increment */
  DEFAULT_CARAT_INCREMENT: 0.5,
  /** Minimum valid carat weight */
  MIN_CARAT_WEIGHT: 0.1,
  /** Maximum valid carat weight for tagging */
  MAX_CARAT_WEIGHT: 10.0
} as const