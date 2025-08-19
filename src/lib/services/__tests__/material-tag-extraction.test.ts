/**
 * Material Tag Extraction Service Tests
 * Comprehensive test suite for tag extraction functionality
 * CLAUDE_RULES.md compliance: Performance <50ms, TypeScript strict
 */

import type { ProductListDTO } from '@/types/product-dto'
import { createMaterialSpecs } from '@/types/product-dto'
import {
  extractMaterialTags,
  extractMaterialTagsBatch,
  getUniqueTagsByCategory,
  sortTagsByCategory,
  createTagFilters,
  clearTagCache
} from '../material-tag-extraction.service'
import type { MaterialTag, TagCategory } from '@/types/material-tags'
import { TAG_EXTRACTION_CONSTANTS } from '@/types/material-tags'

// Test helper: Create mock product with material specs
const createMockProduct = (
  metalType: 'silver' | '14k-gold' | '18k-gold' | 'platinum',
  stone?: { type: 'lab-diamond' | 'moissanite' | 'lab-emerald' | 'lab-ruby' | 'lab-sapphire'; carat: number }
): ProductListDTO => ({
  _id: 'test-product-1',
  name: 'Test Product',
  description: 'Test Description',
  category: 'rings',
  subcategory: 'engagement-rings',
  slug: 'test-product',
  primaryImage: '/test-image.jpg',
  pricing: {
    basePrice: 1000,
    currency: 'USD'
  },
  inventory: {
    available: true,
    quantity: 10
  },
  metadata: {
    featured: false,
    bestseller: false,
    newArrival: false,
    tags: []
  },
  materialSpecs: createMaterialSpecs(metalType, stone)
})

describe('Material Tag Extraction Service', () => {
  beforeEach(() => {
    clearTagCache()
  })

  describe('extractMaterialTags', () => {
    test('should extract metal tag for silver product', () => {
      const product = createMockProduct('silver')
      const result = extractMaterialTags(product)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0]).toMatchObject({
        id: 'metal-silver',
        category: 'metal',
        displayName: '925 Silver',
        filterValue: 'silver'
      })
      expect(result.metrics?.isWithinThreshold).toBe(true)
    })

    test('should extract all tags for product with stone', () => {
      const product = createMockProduct('14k-gold', { type: 'lab-diamond', carat: 1.5 })
      const result = extractMaterialTags(product)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(3) // metal + stone + carat
      
      const tagCategories = result.data!.map(tag => tag.category)
      expect(tagCategories).toContain('metal')
      expect(tagCategories).toContain('stone')
      expect(tagCategories).toContain('carat')
    })

    test('should round carat weights correctly', () => {
      const testCases = [
        { input: 0.7, expected: '0.5CT' },
        { input: 1.2, expected: '1CT' },
        { input: 1.8, expected: '2CT' },
        { input: 2.7, expected: '2.5CT+' }
      ]

      testCases.forEach(({ input, expected }) => {
        const product = createMockProduct('platinum', { type: 'moissanite', carat: input })
        const result = extractMaterialTags(product)
        
        const caratTag = result.data!.find(tag => tag.category === 'carat')
        expect(caratTag?.displayName).toBe(expected)
      })
    })

    test('should meet performance requirements (<50ms)', () => {
      const product = createMockProduct('18k-gold', { type: 'lab-emerald', carat: 2.0 })
      const result = extractMaterialTags(product)

      expect(result.success).toBe(true)
      expect(result.metrics?.extractionTime).toBeLessThan(TAG_EXTRACTION_CONSTANTS.MAX_EXTRACTION_TIME)
      expect(result.metrics?.isWithinThreshold).toBe(true)
    })

    test('should handle missing material specs gracefully', () => {
      const invalidProduct = {
        ...createMockProduct('silver'),
        materialSpecs: undefined
      } as any

      const result = extractMaterialTags(invalidProduct)

      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('MISSING_REQUIRED_DATA')
    })

    test('should validate carat weight ranges', () => {
      const invalidProduct = createMockProduct('silver', { 
        type: 'lab-diamond', 
        carat: 15.0 // Exceeds max
      })

      const result = extractMaterialTags(invalidProduct)

      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('INVALID_CARAT_VALUE')
    })

    test('should use cache for repeated extractions', () => {
      const product = createMockProduct('platinum', { type: 'lab-diamond', carat: 1.0 })
      
      // First extraction
      const result1 = extractMaterialTags(product)
      expect(result1.success).toBe(true)
      
      // Second extraction (should use cache)
      const result2 = extractMaterialTags(product)
      expect(result2.success).toBe(true)
      expect(result2.data).toEqual(result1.data)
    })
  })

  describe('extractMaterialTagsBatch', () => {
    test('should process multiple products efficiently', () => {
      const products = [
        createMockProduct('silver'),
        createMockProduct('14k-gold', { type: 'moissanite', carat: 1.0 }),
        createMockProduct('platinum', { type: 'lab-diamond', carat: 2.0 })
      ]

      const result = extractMaterialTagsBatch(products)

      expect(result.successCount).toBe(3)
      expect(result.errorCount).toBe(0)
      expect(result.allTags.length).toBeGreaterThan(0)
      expect(result.metrics.isWithinThreshold).toBe(true)
    })

    test('should handle mixed success/failure scenarios', () => {
      const products = [
        createMockProduct('silver'),
        { ...createMockProduct('14k-gold'), materialSpecs: undefined } as any,
        createMockProduct('platinum')
      ]

      const result = extractMaterialTagsBatch(products)

      expect(result.successCount).toBe(2)
      expect(result.errorCount).toBe(1)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('getUniqueTagsByCategory', () => {
    test('should filter and deduplicate tags by category', () => {
      const tags: MaterialTag[] = [
        { id: 'metal-silver', category: 'metal', displayName: '925 Silver', filterValue: 'silver', sortOrder: 1 },
        { id: 'stone-diamond', category: 'stone', displayName: 'Lab Diamond', filterValue: 'lab-diamond', sortOrder: 1 },
        { id: 'metal-silver', category: 'metal', displayName: '925 Silver', filterValue: 'silver', sortOrder: 1 }, // Duplicate
        { id: 'carat-1', category: 'carat', displayName: '1CT', filterValue: '1', sortOrder: 1 }
      ]

      const metalTags = getUniqueTagsByCategory(tags, 'metal')
      expect(metalTags).toHaveLength(1)
      expect(metalTags[0].category).toBe('metal')

      const stoneTags = getUniqueTagsByCategory(tags, 'stone')
      expect(stoneTags).toHaveLength(1)
      expect(stoneTags[0].category).toBe('stone')
    })
  })

  describe('sortTagsByCategory', () => {
    test('should sort tags by category then sort order', () => {
      const tags: MaterialTag[] = [
        { id: 'carat-1', category: 'carat', displayName: '1CT', filterValue: '1', sortOrder: 2 },
        { id: 'metal-silver', category: 'metal', displayName: '925 Silver', filterValue: 'silver', sortOrder: 1 },
        { id: 'stone-diamond', category: 'stone', displayName: 'Lab Diamond', filterValue: 'lab-diamond', sortOrder: 1 }
      ]

      const sorted = sortTagsByCategory(tags)
      
      expect(sorted[0].category).toBe('stone')
      expect(sorted[1].category).toBe('carat')
      expect(sorted[2].category).toBe('metal')
    })
  })

  describe('createTagFilters', () => {
    test('should create proper filter object from selected tags', () => {
      const selectedTags: MaterialTag[] = [
        { id: 'metal-silver', category: 'metal', displayName: '925 Silver', filterValue: 'silver', sortOrder: 1 },
        { id: 'stone-diamond', category: 'stone', displayName: 'Lab Diamond', filterValue: 'lab-diamond', sortOrder: 1 },
        { id: 'carat-1', category: 'carat', displayName: '1CT', filterValue: '1', sortOrder: 1 }
      ]

      const filters = createTagFilters(selectedTags)

      expect(filters.metalTypes).toContain('silver')
      expect(filters.stoneTypes).toContain('lab-diamond')
      expect(filters.caratWeights).toContain(1)
      expect(filters.filterValues).toHaveLength(3)
    })
  })

  describe('Performance Requirements', () => {
    test('should extract tags from 100 products in under 50ms total', () => {
      const products = Array.from({ length: 100 }, (_, i) => 
        createMockProduct(
          i % 2 === 0 ? 'silver' : '14k-gold',
          i % 3 === 0 ? { type: 'lab-diamond', carat: 1.0 } : undefined
        )
      )

      const start = performance.now()
      const result = extractMaterialTagsBatch(products)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(TAG_EXTRACTION_CONSTANTS.MAX_EXTRACTION_TIME)
      expect(result.metrics.isWithinThreshold).toBe(true)
      expect(result.successCount).toBe(100)
    })
  })

  describe('Error Handling', () => {
    test('should provide clear error messages for invalid data', () => {
      const invalidProduct = {
        _id: 'invalid',
        materialSpecs: {
          primaryMetal: {
            type: 'invalid-metal' as any,
            purity: '925',
            displayName: 'Invalid Metal'
          }
        }
      } as ProductListDTO

      const result = extractMaterialTags(invalidProduct)

      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('UNKNOWN_METAL_TYPE')
      expect(result.error?.message).toContain('Unknown metal type')
    })
  })
})