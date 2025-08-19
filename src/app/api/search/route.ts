/**
 * Advanced Search API
 * GET /api/search - Advanced product search with filters, facets, and ranking
 * Phase 2: Scale & Optimize implementation
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import { withAPIMonitoring } from '@/lib/performance'
import { analytics } from '@/lib/analytics'
import crypto from 'crypto'

// Success response helper (CLAUDE_RULES.md compliant)
function ok<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
    meta: { 
      timestamp: new Date().toISOString(), 
      version: '1.0.0' 
    }
  })
}

// Error response helper (CLAUDE_RULES.md compliant)
function fail(code: string, message: string, details?: any, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: { 
      code, 
      message, 
      ...(details ? { details } : {}) 
    },
    meta: { 
      timestamp: new Date().toISOString(), 
      requestId: crypto.randomUUID() 
    }
  }, { status })
}

/**
 * Advanced search interface
 */
interface SearchFilters {
  category?: string[]
  subcategory?: string[]
  materials?: string[]
  gemstones?: string[]
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  featured?: boolean
  newArrival?: boolean
  rating?: number
  tags?: string[]
}

interface SearchOptions {
  q?: string
  filters?: SearchFilters
  sortBy?: 'relevance' | 'price' | 'popularity' | 'rating' | 'newest'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  facets?: boolean
  suggestions?: boolean
}

/**
 * GET /api/search - Advanced product search
 */
async function searchProducts(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse search parameters
    const options: SearchOptions = {
      q: searchParams.get('q') || '',
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      facets: searchParams.get('facets') === 'true',
      suggestions: searchParams.get('suggestions') === 'true'
    }
    
    // Parse filters
    const filters: SearchFilters = {}
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category')!.split(',')
    }
    if (searchParams.get('subcategory')) {
      filters.subcategory = searchParams.get('subcategory')!.split(',')
    }
    if (searchParams.get('materials')) {
      filters.materials = searchParams.get('materials')!.split(',')
    }
    if (searchParams.get('gemstones')) {
      filters.gemstones = searchParams.get('gemstones')!.split(',')
    }
    if (searchParams.get('priceMin')) {
      filters.priceMin = parseFloat(searchParams.get('priceMin')!)
    }
    if (searchParams.get('priceMax')) {
      filters.priceMax = parseFloat(searchParams.get('priceMax')!)
    }
    if (searchParams.get('inStock')) {
      filters.inStock = searchParams.get('inStock') === 'true'
    }
    if (searchParams.get('featured')) {
      filters.featured = searchParams.get('featured') === 'true'
    }
    if (searchParams.get('newArrival')) {
      filters.newArrival = searchParams.get('newArrival') === 'true'
    }
    if (searchParams.get('rating')) {
      filters.rating = parseFloat(searchParams.get('rating')!)
    }
    if (searchParams.get('tags')) {
      filters.tags = searchParams.get('tags')!.split(',')
    }
    
    options.filters = filters
    
    // Track search analytics
    await analytics.trackEvent({
      event: 'search_query',
      sessionId: request.headers.get('x-session-id') || crypto.randomUUID(),
      properties: {
        query: options.q,
        filters: Object.keys(filters),
        sortBy: options.sortBy
      },
      metadata: {
        userAgent: request.headers.get('user-agent') || '',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        page: '/search',
        device: 'desktop' // Will be detected properly in full implementation
      }
    })
    
    const { db } = await connectToDatabase()
    
    // Build search aggregation pipeline
    const pipeline = buildSearchPipeline(options)
    
    // Execute search
    const [searchResults, facetResults] = await Promise.all([
      db.collection('products').aggregate(pipeline).toArray(),
      options.facets ? getFacetCounts(db, options) : Promise.resolve(null)
    ])
    
    // Calculate pagination
    const total = searchResults[0]?.metadata?.[0]?.total || 0
    const totalPages = Math.ceil(total / options.limit!)
    const hasNextPage = options.page! < totalPages
    const hasPrevPage = options.page! > 1
    
    // Extract products from aggregation results
    const products = searchResults[0]?.data || []
    
    // Generate search suggestions if requested
    const suggestions = options.suggestions ? 
      await generateSearchSuggestions(db, options.q || '', filters) : null
    
    // Format response
    const responseData = {
      products,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      facets: facetResults,
      suggestions,
      searchOptions: options,
      resultsFound: products.length,
      searchTime: Date.now() // Will be calculated properly
    }
    
    return ok(responseData)
    
  } catch (error) {
    console.error('Search error:', error)
    return fail('SEARCH_ERROR', 'Failed to perform search', null, 500)
  }
}

/**
 * Build MongoDB aggregation pipeline for search
 */
function buildSearchPipeline(options: SearchOptions) {
  const pipeline: any[] = []
  
  // Build match stage for filters and text search
  const matchStage: any = {}
  
  // Text search
  if (options.q && options.q.trim()) {
    matchStage.$text = { $search: options.q.trim() }
  }
  
  // Apply filters
  if (options.filters) {
    const filters = options.filters
    
    if (filters.category?.length) {
      matchStage.category = { $in: filters.category }
    }
    
    if (filters.subcategory?.length) {
      matchStage.subcategory = { $in: filters.subcategory }
    }
    
    if (filters.materials?.length) {
      matchStage['customization.materials.name'] = { $in: filters.materials }
    }
    
    if (filters.gemstones?.length) {
      matchStage['customization.gemstones.name'] = { $in: filters.gemstones }
    }
    
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      matchStage['pricing.basePrice'] = {}
      if (filters.priceMin !== undefined) {
        matchStage['pricing.basePrice'].$gte = filters.priceMin
      }
      if (filters.priceMax !== undefined) {
        matchStage['pricing.basePrice'].$lte = filters.priceMax
      }
    }
    
    if (filters.inStock) {
      matchStage['inventory.inStock'] = { $gt: 0 }
    }
    
    if (filters.featured) {
      matchStage['metadata.featured'] = true
    }
    
    if (filters.newArrival) {
      matchStage['metadata.newArrival'] = true
    }
    
    if (filters.rating) {
      matchStage['reviews.averageRating'] = { $gte: filters.rating }
    }
    
    if (filters.tags?.length) {
      matchStage['metadata.tags'] = { $in: filters.tags }
    }
  }
  
  // Only add match stage if we have conditions
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage })
  }
  
  // Add text search score for relevance sorting
  if (options.q && options.q.trim()) {
    pipeline.push({
      $addFields: {
        searchScore: { $meta: 'textScore' },
        relevanceScore: {
          $add: [
            { $meta: 'textScore' },
            { $cond: [{ $eq: ['$metadata.featured', true] }, 2, 0] },
            { $cond: [{ $eq: ['$metadata.newArrival', true] }, 1, 0] },
            { $multiply: ['$reviews.averageRating', 0.5] }
          ]
        }
      }
    })
  } else {
    // Add relevance score without text search
    pipeline.push({
      $addFields: {
        relevanceScore: {
          $add: [
            { $cond: [{ $eq: ['$metadata.featured', true] }, 3, 0] },
            { $cond: [{ $eq: ['$metadata.newArrival', true] }, 2, 0] },
            { $multiply: ['$reviews.averageRating', 1] },
            { $divide: ['$inventory.inStock', 10] } // Favor items in stock
          ]
        }
      }
    })
  }
  
  // Build sort stage
  const sortStage: any = {}
  
  switch (options.sortBy) {
    case 'price':
      sortStage['pricing.basePrice'] = options.sortOrder === 'asc' ? 1 : -1
      break
    case 'popularity':
      sortStage['analytics.views'] = -1
      sortStage['reviews.count'] = -1
      break
    case 'rating':
      sortStage['reviews.averageRating'] = -1
      sortStage['reviews.count'] = -1
      break
    case 'newest':
      sortStage['metadata.createdAt'] = -1
      break
    case 'relevance':
    default:
      if (options.q && options.q.trim()) {
        sortStage.relevanceScore = -1
        sortStage.searchScore = { $meta: 'textScore' }
      } else {
        sortStage.relevanceScore = -1
        sortStage['metadata.featured'] = -1
        sortStage['reviews.averageRating'] = -1
      }
      break
  }
  
  pipeline.push({ $sort: sortStage })
  
  // Facet stage for pagination and results
  pipeline.push({
    $facet: {
      data: [
        { $skip: ((options.page || 1) - 1) * (options.limit || 20) },
        { $limit: options.limit || 20 },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            category: 1,
            subcategory: 1,
            pricing: 1,
            media: 1,
            inventory: 1,
            reviews: 1,
            metadata: 1,
            searchScore: 1,
            relevanceScore: 1
          }
        }
      ],
      metadata: [
        { $count: 'total' }
      ]
    }
  })
  
  return pipeline
}

/**
 * Get facet counts for filters
 */
async function getFacetCounts(db: any, options: SearchOptions) {
  const basePipeline: any[] = []
  
  // Apply same base filters (excluding the facet we're counting)
  const matchStage: any = {}
  
  // For facets, use regex search instead of text search to avoid metadata issues
  if (options.q && options.q.trim()) {
    matchStage.$or = [
      { name: { $regex: options.q.trim(), $options: 'i' } },
      { description: { $regex: options.q.trim(), $options: 'i' } },
      { category: { $regex: options.q.trim(), $options: 'i' } },
      { subcategory: { $regex: options.q.trim(), $options: 'i' } }
    ]
  }
  
  if (Object.keys(matchStage).length > 0) {
    basePipeline.push({ $match: matchStage })
  }
  
  const facetPipeline = {
    categories: [
      ...basePipeline,
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ],
    subcategories: [
      ...basePipeline,
      { $group: { _id: '$subcategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ],
    materials: [
      ...basePipeline,
      { $unwind: '$customization.materials' },
      { $group: { _id: '$customization.materials.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ],
    gemstones: [
      ...basePipeline,
      { $unwind: '$customization.gemstones' },
      { $group: { _id: '$customization.gemstones.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ],
    priceRanges: [
      ...basePipeline,
      {
        $bucket: {
          groupBy: '$pricing.basePrice',
          boundaries: [0, 500, 1000, 2000, 3000, 5000, 10000],
          default: '5000+',
          output: { count: { $sum: 1 } }
        }
      }
    ],
    ratings: [
      ...basePipeline,
      {
        $bucket: {
          groupBy: '$reviews.averageRating',
          boundaries: [0, 3, 4, 4.5, 5],
          default: 'unrated',
          output: { count: { $sum: 1 } }
        }
      }
    ]
  }
  
  const facetResults = await db.collection('products').aggregate([
    { $facet: facetPipeline }
  ]).toArray()
  
  return facetResults[0] || {}
}

/**
 * Generate search suggestions
 */
async function generateSearchSuggestions(db: any, query: string, filters: SearchFilters) {
  if (!query || query.length < 2) return []
  
  const suggestions = await db.collection('products').aggregate([
    {
      $match: {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { subcategory: { $regex: query, $options: 'i' } },
          { 'metadata.tags': { $regex: query, $options: 'i' } }
        ]
      }
    },
    {
      $group: {
        _id: null,
        names: { $addToSet: '$name' },
        categories: { $addToSet: '$category' },
        subcategories: { $addToSet: '$subcategory' },
        tags: { $addToSet: { $arrayElemAt: ['$metadata.tags', 0] } }
      }
    },
    {
      $project: {
        suggestions: {
          $slice: [
            {
              $filter: {
                input: {
                  $concatArrays: ['$names', '$categories', '$subcategories', '$tags']
                },
                cond: {
                  $regexMatch: {
                    input: '$$this',
                    regex: query,
                    options: 'i'
                  }
                }
              }
            },
            8
          ]
        }
      }
    }
  ]).toArray()
  
  return suggestions[0]?.suggestions || []
}

// Export with performance monitoring
export const GET = withAPIMonitoring('/api/search', searchProducts)