/**
 * API Validation Schemas
 * Zod schemas for validating API requests following CLAUDE_RULES.md
 */

import { z } from 'zod'
import { ProductCategory, ProductSubcategory } from '@/types/product'

// MongoDB ObjectId pattern for validation
const ObjectIdPattern = /^[0-9a-fA-F]{24}$/

// ObjectId schema
const ObjectIdSchema = z.string().regex(ObjectIdPattern, 'Invalid ObjectId format')

// Product Category and Subcategory enums for validation
const ProductCategorySchema = z.enum(['rings', 'necklaces', 'earrings', 'bracelets'])
const ProductSubcategorySchema = z.enum([
  'engagement-rings', 'wedding-bands', 'fashion-rings', 'eternity-rings',
  'pendants', 'chains', 'chokers', 'statement-necklaces',
  'studs', 'hoops', 'drops', 'climbers',
  'tennis-bracelets', 'bangles', 'chain-bracelets', 'charm-bracelets'
])

// Sort options
const SortBySchema = z.enum(['price', 'name', 'popularity', 'newest', 'rating'])
const SortOrderSchema = z.enum(['asc', 'desc'])

// Product search/filter query parameters schema
export const ProductQuerySchema = z.object({
  // Search
  q: z.string().optional(),
  query: z.string().optional(),
  
  // Pagination
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  
  // Sorting
  sortBy: SortBySchema.optional().default('popularity'),
  sortOrder: SortOrderSchema.optional().default('desc'),
  
  // Category filters
  categories: z.string().optional().transform((val) => 
    val ? val.split(',').filter(Boolean).filter((cat): cat is ProductCategory => 
      ['rings', 'necklaces', 'earrings', 'bracelets'].includes(cat)
    ) : undefined
  ),
  subcategories: z.string().optional().transform((val) => 
    val ? val.split(',').filter(Boolean).filter((subcat): subcat is ProductSubcategory => 
      [
        'engagement-rings', 'wedding-bands', 'fashion-rings', 'eternity-rings',
        'pendants', 'chains', 'chokers', 'statement-necklaces',
        'studs', 'hoops', 'drops', 'climbers',
        'tennis-bracelets', 'bangles', 'chain-bracelets', 'charm-bracelets'
      ].includes(subcat as ProductSubcategory)
    ) : undefined
  ),
  
  // Price range
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  
  // Material and customization filters
  materials: z.string().optional().transform((val) => 
    val ? val.split(',').filter(Boolean) : undefined
  ),
  gemstones: z.string().optional().transform((val) => 
    val ? val.split(',').filter(Boolean) : undefined
  ),
  sizes: z.string().optional().transform((val) => 
    val ? val.split(',').filter(Boolean) : undefined
  ),
  
  // Collection and tag filters  
  collections: z.string().optional().transform((val) => 
    val ? val.split(',').filter(Boolean) : undefined
  ),
  tags: z.string().optional().transform((val) => 
    val ? val.split(',').filter(Boolean) : undefined
  ),
  
  // Boolean filters
  inStock: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  newArrival: z.coerce.boolean().optional(),
  customizable: z.coerce.boolean().optional(),
  
  // Creator program filters
  creatorExclusive: z.coerce.boolean().optional(),
  creatorTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional()
}).transform((data) => {
  // Validate price range logic
  if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
    throw new Error('minPrice cannot be greater than maxPrice')
  }
  
  return {
    ...data,
    // Merge q and query for backward compatibility
    query: data.q || data.query,
    filters: {
      category: data.categories,
      subcategory: data.subcategories,
      priceRange: (data.minPrice !== undefined || data.maxPrice !== undefined) ? {
        min: data.minPrice || 0,
        max: data.maxPrice || Number.MAX_SAFE_INTEGER
      } : undefined,
      materials: data.materials,
      gemstones: data.gemstones,
      sizes: data.sizes,
      collections: data.collections,
      tags: data.tags,
      inStock: data.inStock,
      onSale: data.onSale,
      featured: data.featured,
      newArrival: data.newArrival,
      customizable: data.customizable,
      creatorExclusive: data.creatorExclusive,
      creatorTier: data.creatorTier
    }
  }
})

// Product ID path parameter schema
export const ProductIdSchema = z.object({
  id: z.string().min(1, 'Product ID is required').refine(
    (id) => {
      // Allow MongoDB ObjectId (24 hex chars) or custom product IDs (prod_*)
      return /^[0-9a-fA-F]{24}$/.test(id) || /^prod_[a-zA-Z0-9_-]+$/.test(id) || /^[a-zA-Z0-9-]+$/.test(id)
    },
    'Invalid product ID format'
  )
})

// Rate limiting configurations per endpoint type
export const RateLimitConfigs = {
  CATALOG: { limit: 100, windowMs: 60 * 1000 }, // 100/min for catalog browsing
  PRODUCT_DETAIL: { limit: 200, windowMs: 60 * 1000 }, // 200/min for product details
  SEARCH: { limit: 50, windowMs: 60 * 1000 }, // 50/min for search queries
  AUTH: { limit: 5, windowMs: 60 * 1000 }, // 5/min for auth endpoints
  CART: { limit: 30, windowMs: 60 * 1000 }, // 30/min for cart operations
  ORDERS: { limit: 10, windowMs: 60 * 1000 }, // 10/min for order operations
  ADMIN: { limit: 200, windowMs: 60 * 1000 } // 200/min for admin operations
} as const

// Generic pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20)
})

// Search query schema for dedicated search endpoint
export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  category: ProductCategorySchema.optional(),
  subcategory: ProductSubcategorySchema.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10)
})

// Product creation/update schema (for admin endpoints)
export const ProductCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  category: ProductCategorySchema,
  subcategory: ProductSubcategorySchema,
  basePrice: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  status: z.enum(['active', 'inactive', 'discontinued', 'coming-soon']).optional().default('active'),
  featured: z.boolean().optional().default(false),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  customizable: z.boolean().optional().default(false),
  seo: z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string().max(50)).max(20).optional().default([])
  }),
  inventory: z.object({
    sku: z.string().min(1),
    quantity: z.number().int().min(0),
    trackInventory: z.boolean().optional().default(true),
    lowStockThreshold: z.number().int().min(0).optional().default(5)
  })
})

// Export types derived from schemas
export type ProductQueryParams = z.infer<typeof ProductQuerySchema>
export type ProductIdParams = z.infer<typeof ProductIdSchema>
export type SearchQueryParams = z.infer<typeof SearchQuerySchema>
export type ProductCreateData = z.infer<typeof ProductCreateSchema>