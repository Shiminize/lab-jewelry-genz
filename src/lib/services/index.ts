/**
 * Services Layer Index
 * Central export point for all service modules
 * Follows CLAUDE_RULES.md modular architecture standards
 */

// Material Tag Extraction Service
export {
  extractMaterialTags,
  extractMaterialTagsBatch,
  getUniqueTagsByCategory,
  getUniqueTagsById,
  sortTagsByCategory,
  createTagFilters,
  aggregateTags,
  clearTagCache,
  getTagCacheStats
} from './material-tag-extraction.service'

// Re-export types for convenience
export type {
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

export { DEFAULT_TAG_CONFIG, TAG_EXTRACTION_CONSTANTS } from '@/types/material-tags'