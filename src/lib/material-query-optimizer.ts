/**
 * Material Query Optimizer for GlowGlitch E-commerce
 * 
 * Provides optimized MongoDB query builders for material-based filtering
 * Ensures <300ms response times per CLAUDE_RULES.md requirements
 * 
 * FEATURES:
 * - Index-optimized query patterns
 * - Performance monitoring
 * - Query explain analysis
 * - Automatic query optimization
 */

import { Collection, Document } from 'mongodb'

// Performance tracking interface
export interface QueryPerformance {
  query: any
  executionTimeMs: number
  documentsExamined: number
  documentsReturned: number
  indexUsed: string | null
  isOptimized: boolean
  timestamp: Date
}

// Material filter types for type safety
export interface MaterialFilters {
  metals?: string[]
  gemstones?: string[]
  caratRange?: { min: number; max: number }
  priceRange?: { min: number; max: number }
  category?: string
  subcategory?: string
  inStock?: boolean
  featured?: boolean
}

// Enhanced material specs (future-ready)
export interface EnhancedMaterialFilters {
  primaryMetal?: {
    type: 'silver' | '14k-gold' | '18k-gold' | 'platinum'
    purity?: string
  }
  primaryStone?: {
    type: 'lab-diamond' | 'moissanite' | 'lab-emerald' | 'lab-ruby' | 'lab-sapphire'
    carat?: { min: number; max: number }
  }
  category?: string
  priceRange?: { min: number; max: number }
  inStock?: boolean
}

/**
 * Material Query Optimizer Class
 * Builds index-optimized MongoDB queries for material filtering
 */
export class MaterialQueryOptimizer {
  private collection: Collection
  private performanceLog: QueryPerformance[] = []

  constructor(collection: Collection) {
    this.collection = collection
  }

  /**
   * Build optimized query for current schema structure
   * Uses materials[] and gemstones[] arrays with compound indexes
   */
  buildCurrentSchemaQuery(filters: MaterialFilters): any {
    const query: any = {
      'metadata.status': 'active' // Always filter active products first (uses index)
    }

    // Category filtering (uses category index)
    if (filters.category) {
      query.category = filters.category
    }

    if (filters.subcategory) {
      query.subcategory = filters.subcategory
    }

    // Material filtering (uses materials index)
    if (filters.metals?.length) {
      query.materials = filters.metals.length === 1 
        ? filters.metals[0] 
        : { $in: filters.metals }
    }

    // Gemstone filtering (uses gemstones index)
    if (filters.gemstones?.length) {
      query['gemstones.type'] = filters.gemstones.length === 1
        ? filters.gemstones[0]
        : { $in: filters.gemstones }
    }

    // Carat range filtering (uses compound gemstone index)
    if (filters.caratRange) {
      const caratQuery: any = {}
      if (filters.caratRange.min !== undefined) {
        caratQuery.$gte = filters.caratRange.min
      }
      if (filters.caratRange.max !== undefined) {
        caratQuery.$lte = filters.caratRange.max
      }
      if (Object.keys(caratQuery).length > 0) {
        query['gemstones.carat'] = caratQuery
      }
    }

    // Price range filtering (uses price index)
    if (filters.priceRange) {
      const priceQuery: any = {}
      if (filters.priceRange.min !== undefined) {
        priceQuery.$gte = filters.priceRange.min
      }
      if (filters.priceRange.max !== undefined) {
        priceQuery.$lte = filters.priceRange.max
      }
      if (Object.keys(priceQuery).length > 0) {
        query['pricing.basePrice'] = priceQuery
      }
    }

    // Inventory filtering (uses inventory index)
    if (filters.inStock) {
      query['inventory.available'] = { $gt: 0 }
    }

    // Featured filtering (uses featured index)
    if (filters.featured) {
      query['metadata.featured'] = true
    }

    return query
  }

  /**
   * Build optimized query for enhanced materialSpecs structure
   * Future-ready for enhanced material specifications
   */
  buildEnhancedSchemaQuery(filters: EnhancedMaterialFilters): any {
    const query: any = {
      'metadata.status': 'active' // Always filter active products first
    }

    // Category filtering
    if (filters.category) {
      query.category = filters.category
    }

    // Enhanced primary metal filtering
    if (filters.primaryMetal) {
      if (filters.primaryMetal.type) {
        query['materialSpecs.primaryMetal.type'] = filters.primaryMetal.type
      }
      if (filters.primaryMetal.purity) {
        query['materialSpecs.primaryMetal.purity'] = filters.primaryMetal.purity
      }
    }

    // Enhanced primary stone filtering
    if (filters.primaryStone) {
      if (filters.primaryStone.type) {
        query['materialSpecs.primaryStone.type'] = filters.primaryStone.type
      }
      if (filters.primaryStone.carat) {
        const caratQuery: any = {}
        if (filters.primaryStone.carat.min !== undefined) {
          caratQuery.$gte = filters.primaryStone.carat.min
        }
        if (filters.primaryStone.carat.max !== undefined) {
          caratQuery.$lte = filters.primaryStone.carat.max
        }
        if (Object.keys(caratQuery).length > 0) {
          query['materialSpecs.primaryStone.carat'] = caratQuery
        }
      }
    }

    // Price range filtering
    if (filters.priceRange) {
      const priceQuery: any = {}
      if (filters.priceRange.min !== undefined) {
        priceQuery.$gte = filters.priceRange.min
      }
      if (filters.priceRange.max !== undefined) {
        priceQuery.$lte = filters.priceRange.max
      }
      if (Object.keys(priceQuery).length > 0) {
        query['pricing.basePrice'] = priceQuery
      }
    }

    // Inventory filtering
    if (filters.inStock) {
      query['inventory.available'] = { $gt: 0 }
    }

    return query
  }

  /**
   * Get optimized sort options for different scenarios
   */
  getOptimizedSort(sortBy: string = 'popularity', sortOrder: 'asc' | 'desc' = 'desc'): any {
    const direction = sortOrder === 'desc' ? -1 : 1

    switch (sortBy) {
      case 'price':
        return { 'pricing.basePrice': direction }
      
      case 'name':
        return { name: direction }
      
      case 'newest':
        return { createdAt: -1 }
      
      case 'rating':
        return { 'analytics.averageRating': -1 }
      
      case 'popularity':
      default:
        return { 'analytics.views': -1 }
    }
  }

  /**
   * Execute optimized query with performance tracking
   */
  async executeOptimizedQuery(
    filters: MaterialFilters,
    options: {
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      page?: number
      limit?: number
    } = {}
  ): Promise<{ results: Document[]; performance: QueryPerformance }> {
    const startTime = Date.now()
    
    // Build optimized query
    const query = this.buildCurrentSchemaQuery(filters)
    
    // Get sort options
    const sort = this.getOptimizedSort(options.sortBy, options.sortOrder)
    
    // Pagination
    const page = options.page || 1
    const limit = Math.min(options.limit || 20, 100)
    const skip = (page - 1) * limit

    // Execute query with explain
    const [results, explainResult] = await Promise.all([
      this.collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      this.collection.find(query).sort(sort).skip(skip).limit(limit).explain('executionStats')
    ])

    const executionTime = Date.now() - startTime
    const stats = explainResult.executionStats

    // Track performance
    const performance: QueryPerformance = {
      query,
      executionTimeMs: executionTime,
      documentsExamined: stats?.totalDocsExamined || 0,
      documentsReturned: results.length,
      indexUsed: stats?.indexName || null,
      isOptimized: executionTime < 300 && (stats?.totalDocsExamined || 0) < 1000,
      timestamp: new Date()
    }

    this.performanceLog.push(performance)

    // Log slow queries for monitoring
    if (executionTime > 300) {
      console.warn('Slow material query detected:', {
        executionTime: `${executionTime}ms`,
        query,
        documentsExamined: stats?.totalDocsExamined,
        indexUsed: stats?.indexName
      })
    }

    return { results, performance }
  }

  /**
   * Execute enhanced query (future-ready)
   */
  async executeEnhancedQuery(
    filters: EnhancedMaterialFilters,
    options: {
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      page?: number
      limit?: number
    } = {}
  ): Promise<{ results: Document[]; performance: QueryPerformance }> {
    const startTime = Date.now()
    
    // Build enhanced query
    const query = this.buildEnhancedSchemaQuery(filters)
    
    // Get sort options
    const sort = this.getOptimizedSort(options.sortBy, options.sortOrder)
    
    // Pagination
    const page = options.page || 1
    const limit = Math.min(options.limit || 20, 100)
    const skip = (page - 1) * limit

    // Execute query with explain
    const [results, explainResult] = await Promise.all([
      this.collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      this.collection.find(query).sort(sort).skip(skip).limit(limit).explain('executionStats')
    ])

    const executionTime = Date.now() - startTime
    const stats = explainResult.executionStats

    // Track performance
    const performance: QueryPerformance = {
      query,
      executionTimeMs: executionTime,
      documentsExamined: stats?.totalDocsExamined || 0,
      documentsReturned: results.length,
      indexUsed: stats?.indexName || null,
      isOptimized: executionTime < 300 && (stats?.totalDocsExamined || 0) < 1000,
      timestamp: new Date()
    }

    this.performanceLog.push(performance)

    return { results, performance }
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(): {
    averageExecutionTime: number
    slowQueries: QueryPerformance[]
    totalQueries: number
    optimizedQueries: number
    indexUsageStats: Record<string, number>
  } {
    const totalQueries = this.performanceLog.length
    const optimizedQueries = this.performanceLog.filter(p => p.isOptimized).length
    const slowQueries = this.performanceLog.filter(p => p.executionTimeMs > 300)
    
    const averageExecutionTime = totalQueries > 0
      ? this.performanceLog.reduce((sum, p) => sum + p.executionTimeMs, 0) / totalQueries
      : 0

    // Index usage statistics
    const indexUsageStats: Record<string, number> = {}
    this.performanceLog.forEach(p => {
      const index = p.indexUsed || 'COLLSCAN'
      indexUsageStats[index] = (indexUsageStats[index] || 0) + 1
    })

    return {
      averageExecutionTime,
      slowQueries,
      totalQueries,
      optimizedQueries,
      indexUsageStats
    }
  }

  /**
   * Clear performance log (call periodically to prevent memory leaks)
   */
  clearPerformanceLog(): void {
    this.performanceLog = []
  }
}

/**
 * Pre-built optimized query patterns for common scenarios
 */
export class MaterialQueryPatterns {
  /**
   * Silver jewelry under $500 (volume segment)
   */
  static affordableSilver(): MaterialFilters {
    return {
      metals: ['silver'],
      priceRange: { min: 50, max: 500 },
      inStock: true
    }
  }

  /**
   * Gold engagement rings (premium segment)
   */
  static goldEngagementRings(): MaterialFilters {
    return {
      metals: ['gold'],
      category: 'rings',
      subcategory: 'engagement-rings',
      gemstones: ['diamond', 'moissanite'],
      priceRange: { min: 800, max: 5000 }
    }
  }

  /**
   * Lab diamond luxury collection (luxury segment)
   */
  static labDiamondLuxury(): MaterialFilters {
    return {
      gemstones: ['diamond'],
      caratRange: { min: 0.5, max: 3.0 },
      metals: ['gold', 'platinum'],
      priceRange: { min: 1500, max: 15000 }
    }
  }

  /**
   * Moissanite value collection (accessible luxury)
   */
  static moissaniteValue(): MaterialFilters {
    return {
      gemstones: ['moissanite'],
      metals: ['silver', 'gold'],
      priceRange: { min: 200, max: 1200 },
      featured: true
    }
  }

  /**
   * Men's jewelry collection
   */
  static mensJewelry(): MaterialFilters {
    return {
      category: 'bracelets',
      metals: ['silver', 'gold'],
      priceRange: { min: 150, max: 800 }
    }
  }

  /**
   * New arrivals with premium materials
   */
  static newPremiumArrivals(): MaterialFilters {
    return {
      metals: ['gold', 'platinum'],
      gemstones: ['diamond', 'emerald', 'sapphire'],
      featured: true
    }
  }
}

/**
 * Enhanced material specs patterns (future-ready)
 */
export class EnhancedMaterialPatterns {
  /**
   * 14K gold with lab diamonds
   */
  static goldLabDiamonds(): EnhancedMaterialFilters {
    return {
      primaryMetal: { type: '14k-gold', purity: '14K' },
      primaryStone: { type: 'lab-diamond', carat: { min: 0.3, max: 2.0 } },
      priceRange: { min: 800, max: 8000 }
    }
  }

  /**
   * Silver with moissanite (accessible luxury)
   */
  static silverMoissanite(): EnhancedMaterialFilters {
    return {
      primaryMetal: { type: 'silver', purity: '925' },
      primaryStone: { type: 'moissanite', carat: { min: 0.5, max: 2.0 } },
      priceRange: { min: 200, max: 1000 }
    }
  }

  /**
   * Platinum luxury collection
   */
  static platinumLuxury(): EnhancedMaterialFilters {
    return {
      primaryMetal: { type: 'platinum' },
      primaryStone: { type: 'lab-diamond', carat: { min: 1.0, max: 3.0 } },
      priceRange: { min: 3000, max: 20000 }
    }
  }
}

// Export singleton factory
export function createMaterialQueryOptimizer(collection: Collection): MaterialQueryOptimizer {
  return new MaterialQueryOptimizer(collection)
}

// Export utility functions
export { MaterialQueryPatterns, EnhancedMaterialPatterns }