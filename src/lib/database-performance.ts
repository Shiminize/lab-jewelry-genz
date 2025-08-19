/**
 * Database Performance Optimization
 * Advanced aggregation pipelines, query optimization, and performance monitoring
 * Designed for high-performance jewelry e-commerce operations
 */

import mongoose from 'mongoose'
import { DatabaseModels } from './schemas'

// Performance monitoring interface
export interface QueryPerformance {
  operation: string
  collection: string
  executionTime: number
  indexesUsed: string[]
  documentsExamined: number
  documentsReturned: number
  stage: string
  timestamp: Date
}

// Aggregation pipeline builder
class AggregationBuilder {
  private pipeline: any[] = []
  private collection: string

  constructor(collection: string) {
    this.collection = collection
  }

  /**
   * Add match stage
   */
  match(conditions: any): this {
    this.pipeline.push({ $match: conditions })
    return this
  }

  /**
   * Add lookup (populate) stage
   */
  lookup(options: {
    from: string
    localField: string
    foreignField: string
    as: string
    pipeline?: any[]
  }): this {
    const lookupStage: any = {
      $lookup: {
        from: options.from,
        localField: options.localField,
        foreignField: options.foreignField,
        as: options.as
      }
    }
    
    if (options.pipeline) {
      lookupStage.$lookup.pipeline = options.pipeline
    }
    
    this.pipeline.push(lookupStage)
    return this
  }

  /**
   * Add sort stage
   */
  sort(sortOptions: any): this {
    this.pipeline.push({ $sort: sortOptions })
    return this
  }

  /**
   * Add limit stage
   */
  limit(limitValue: number): this {
    this.pipeline.push({ $limit: limitValue })
    return this
  }

  /**
   * Add skip stage
   */
  skip(skipValue: number): this {
    this.pipeline.push({ $skip: skipValue })
    return this
  }

  /**
   * Add project stage
   */
  project(projection: any): this {
    this.pipeline.push({ $project: projection })
    return this
  }

  /**
   * Add group stage
   */
  group(groupOptions: any): this {
    this.pipeline.push({ $group: groupOptions })
    return this
  }

  /**
   * Add unwind stage
   */
  unwind(field: string, options?: { preserveNullAndEmptyArrays?: boolean }): this {
    const unwindStage: any = { $unwind: field }
    
    if (options) {
      unwindStage.$unwind = {
        path: field,
        ...options
      }
    }
    
    this.pipeline.push(unwindStage)
    return this
  }

  /**
   * Add facet stage for multiple aggregations
   */
  facet(facets: Record<string, any[]>): this {
    this.pipeline.push({ $facet: facets })
    return this
  }

  /**
   * Add text search stage
   */
  textSearch(searchText: string, options?: { language?: string; caseSensitive?: boolean }): this {
    const searchStage: any = {
      $match: {
        $text: {
          $search: searchText
        }
      }
    }
    
    if (options?.language) {
      searchStage.$match.$text.$language = options.language
    }
    
    if (options?.caseSensitive) {
      searchStage.$match.$text.$caseSensitive = options.caseSensitive
    }
    
    this.pipeline.push(searchStage)
    
    // Add text score for sorting
    this.pipeline.push({
      $addFields: {
        textScore: { $meta: 'textScore' }
      }
    })
    
    return this
  }

  /**
   * Build and return the pipeline
   */
  build(): any[] {
    return [...this.pipeline]
  }

  /**
   * Execute the aggregation
   */
  async execute<T = any>(model: mongoose.Model<any>): Promise<T[]> {
    return model.aggregate(this.pipeline).exec()
  }

  /**
   * Explain the aggregation performance
   */
  async explain(model: mongoose.Model<any>): Promise<any> {
    return model.aggregate(this.pipeline).explain('executionStats')
  }
}

// Pre-built aggregation pipelines for common operations
class OptimizedQueries {
  /**
   * Get product analytics with performance optimization
   */
  static getProductAnalytics(options: {
    productIds?: string[]
    dateRange?: { start: Date; end: Date }
    includeReviews?: boolean
  } = {}) {
    const builder = new AggregationBuilder('products')
    
    // Match products
    if (options.productIds?.length) {
      builder.match({ _id: { $in: options.productIds.map(id => new mongoose.Types.ObjectId(id)) } })
    }
    
    // Lookup orders for sales data
    builder.lookup({
      from: 'orders',
      localField: '_id',
      foreignField: 'items.productId',
      as: 'orders',
      pipeline: [
        { $match: { status: 'delivered' } },
        ...(options.dateRange ? [{ $match: { createdAt: { $gte: options.dateRange.start, $lte: options.dateRange.end } } }] : []),
        { $unwind: '$items' },
        { $match: { 'items.productId': { $exists: true } } },
        {
          $group: {
            _id: '$items.productId',
            totalSales: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
            averageOrderValue: { $avg: '$total' },
            orderCount: { $sum: 1 }
          }
        }
      ]
    })
    
    // Lookup reviews if requested
    if (options.includeReviews) {
      builder.lookup({
        from: 'reviews',
        localField: '_id',
        foreignField: 'productId',
        as: 'reviews',
        pipeline: [
          { $match: { status: 'approved' } },
          {
            $group: {
              _id: '$productId',
              averageRating: { $avg: '$rating' },
              reviewCount: { $sum: 1 },
              totalHelpfulVotes: { $sum: '$helpfulVotes' }
            }
          }
        ]
      })
    }
    
    // Project final analytics
    builder.project({
      _id: 1,
      name: 1,
      category: 1,
      subcategory: 1,
      'pricing.basePrice': 1,
      'inventory.available': 1,
      'metadata.status': 1,
      'analytics.views': 1,
      salesData: { $arrayElemAt: ['$orders', 0] },
      ...(options.includeReviews ? { reviewData: { $arrayElemAt: ['$reviews', 0] } } : {}),
      conversionRate: {
        $cond: {
          if: { $gt: ['$analytics.views', 0] },
          then: {
            $divide: [
              { $ifNull: [{ $arrayElemAt: ['$orders.orderCount', 0] }, 0] },
              '$analytics.views'
            ]
          },
          else: 0
        }
      }
    })
    
    return builder
  }

  /**
   * Get user shopping behavior analytics
   */
  static getUserShoppingAnalytics(userId: string, dateRange?: { start: Date; end: Date }) {
    const builder = new AggregationBuilder('users')
    
    builder.match({ _id: new mongoose.Types.ObjectId(userId) })
    
    // Lookup orders
    builder.lookup({
      from: 'orders',
      localField: '_id',
      foreignField: 'userId',
      as: 'orders',
      pipeline: [
        ...(dateRange ? [{ $match: { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } }] : []),
        {
          $group: {
            _id: '$userId',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' },
            categoriesPurchased: { $addToSet: '$items.productId' },
            lastOrderDate: { $max: '$createdAt' },
            ordersByStatus: {
              $push: {
                status: '$status',
                total: '$total',
                date: '$createdAt'
              }
            }
          }
        }
      ]
    })
    
    // Lookup cart activity
    builder.lookup({
      from: 'carts',
      localField: '_id',
      foreignField: 'userId',
      as: 'cartActivity',
      pipeline: [
        { $match: { isActive: true } },
        {
          $project: {
            itemCount: { $size: '$items' },
            cartValue: '$estimatedTotal',
            lastUpdated: '$lastUpdated'
          }
        }
      ]
    })
    
    // Lookup wishlist activity
    builder.lookup({
      from: 'wishlists',
      localField: '_id',
      foreignField: 'userId',
      as: 'wishlistActivity',
      pipeline: [
        {
          $group: {
            _id: '$userId',
            totalWishlists: { $sum: 1 },
            totalWishlistItems: { $sum: '$itemCount' },
            totalWishlistValue: { $sum: '$totalValue' }
          }
        }
      ]
    })
    
    // Lookup customizations
    builder.lookup({
      from: 'customizations',
      localField: '_id',
      foreignField: 'userId',
      as: 'customizations',
      pipeline: [
        {
          $group: {
            _id: '$userId',
            totalCustomizations: { $sum: 1 },
            customizationsByStatus: {
              $push: {
                status: '$status',
                totalTime: '$analytics.totalTime',
                interactions: '$analytics.interactions'
              }
            }
          }
        }
      ]
    })
    
    builder.project({
      _id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      role: 1,
      createdAt: 1,
      orderAnalytics: { $arrayElemAt: ['$orders', 0] },
      cartAnalytics: { $arrayElemAt: ['$cartActivity', 0] },
      wishlistAnalytics: { $arrayElemAt: ['$wishlistActivity', 0] },
      customizationAnalytics: { $arrayElemAt: ['$customizations', 0] },
      customerSegment: {
        $switch: {
          branches: [
            {
              case: { $gte: [{ $arrayElemAt: ['$orders.totalSpent', 0] }, 5000] },
              then: 'VIP'
            },
            {
              case: { $gte: [{ $arrayElemAt: ['$orders.totalSpent', 0] }, 1000] },
              then: 'Premium'
            },
            {
              case: { $gte: [{ $arrayElemAt: ['$orders.totalOrders', 0] }, 1] },
              then: 'Regular'
            }
          ],
          default: 'New'
        }
      }
    })
    
    return builder
  }

  /**
   * Get creator performance analytics
   */
  static getCreatorAnalytics(creatorId: string, timeframe: 'week' | 'month' | 'quarter' = 'month') {
    const builder = new AggregationBuilder('users')
    
    const now = new Date()
    const timeframes = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    
    const startDate = timeframes[timeframe]
    
    builder.match({ 
      _id: new mongoose.Types.ObjectId(creatorId),
      role: { $in: ['creator', 'admin'] }
    })
    
    // Lookup referrals
    builder.lookup({
      from: 'referrals',
      localField: '_id',
      foreignField: 'creatorId',
      as: 'referrals',
      pipeline: [
        { $match: { clickedAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$creatorId',
            totalClicks: { $sum: 1 },
            conversions: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, '$orderValue', 0] } },
            clicksBySource: {
              $push: {
                source: '$source',
                status: '$status',
                orderValue: '$orderValue'
              }
            }
          }
        }
      ]
    })
    
    // Lookup commissions
    builder.lookup({
      from: 'commissions',
      localField: '_id',
      foreignField: 'creatorId',
      as: 'commissions',
      pipeline: [
        { $match: { earnedAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$creatorId',
            totalCommissionsEarned: { $sum: '$amount' },
            totalCommissionsPaid: { 
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
            },
            pendingCommissions: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
            },
            averageCommission: { $avg: '$amount' },
            commissionCount: { $sum: 1 }
          }
        }
      ]
    })
    
    builder.project({
      _id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      'creatorProfile.referralCode': 1,
      'creatorProfile.commissionRate': 1,
      'creatorProfile.brandPartnership.tier': 1,
      timeframe: timeframe,
      referralMetrics: { $arrayElemAt: ['$referrals', 0] },
      commissionMetrics: { $arrayElemAt: ['$commissions', 0] },
      conversionRate: {
        $cond: {
          if: { $gt: [{ $arrayElemAt: ['$referrals.totalClicks', 0] }, 0] },
          then: {
            $divide: [
              { $arrayElemAt: ['$referrals.conversions', 0] },
              { $arrayElemAt: ['$referrals.totalClicks', 0] }
            ]
          },
          else: 0
        }
      }
    })
    
    return builder
  }

  /**
   * Get inventory insights
   */
  static getInventoryInsights() {
    const builder = new AggregationBuilder('products')
    
    builder.match({ 'metadata.status': 'active' })
    
    // Add calculated fields
    builder.project({
      _id: 1,
      name: 1,
      category: 1,
      subcategory: 1,
      'pricing.basePrice': 1,
      'inventory.quantity': 1,
      'inventory.available': 1,
      'inventory.reserved': 1,
      'inventory.lowStockThreshold': 1,
      'metadata.featured': 1,
      'metadata.bestseller': 1,
      'analytics.views': 1,
      'analytics.purchases': 1,
      stockStatus: {
        $switch: {
          branches: [
            { case: { $eq: ['$inventory.available', 0] }, then: 'out_of_stock' },
            { case: { $lte: ['$inventory.available', '$inventory.lowStockThreshold'] }, then: 'low_stock' },
            { case: { $lte: ['$inventory.available', { $multiply: ['$inventory.lowStockThreshold', 2] }] }, then: 'medium_stock' }
          ],
          default: 'high_stock'
        }
      },
      inventoryTurnover: {
        $cond: {
          if: { $gt: ['$inventory.quantity', 0] },
          then: { $divide: ['$analytics.purchases', '$inventory.quantity'] },
          else: 0
        }
      }
    })
    
    // Group by category for insights
    builder.group({
      _id: '$category',
      totalProducts: { $sum: 1 },
      averagePrice: { $avg: '$pricing.basePrice' },
      totalInventoryValue: { $sum: { $multiply: ['$pricing.basePrice', '$inventory.available'] } },
      lowStockProducts: { $sum: { $cond: [{ $eq: ['$stockStatus', 'low_stock'] }, 1, 0] } },
      outOfStockProducts: { $sum: { $cond: [{ $eq: ['$stockStatus', 'out_of_stock'] }, 1, 0] } },
      averageTurnover: { $avg: '$inventoryTurnover' },
      topProducts: {
        $push: {
          $cond: [
            { $gt: ['$analytics.views', 100] },
            {
              _id: '$_id',
              name: '$name',
              views: '$analytics.views',
              purchases: '$analytics.purchases'
            },
            '$$REMOVE'
          ]
        }
      }
    })
    
    builder.sort({ totalInventoryValue: -1 })
    
    return builder
  }
}

// Query optimization utilities
class QueryOptimizer {
  /**
   * Analyze query performance
   */
  static async analyzeQuery(
    model: mongoose.Model<any>,
    query: any,
    options?: any
  ): Promise<QueryPerformance> {
    const startTime = Date.now()
    
    const explanation = await model.find(query, null, options).explain('executionStats')
    const executionTime = Date.now() - startTime
    
    const stats = explanation.executionStats
    
    return {
      operation: 'find',
      collection: model.collection.name,
      executionTime,
      indexesUsed: stats.indexesUsed || [],
      documentsExamined: stats.totalDocsExamined || 0,
      documentsReturned: stats.totalDocsReturned || 0,
      stage: stats.stage || 'unknown',
      timestamp: new Date()
    }
  }

  /**
   * Suggest indexes for a query
   */
  static suggestIndexes(query: any, sort?: any): string[] {
    const suggestions: string[] = []
    
    // Suggest indexes based on query fields
    Object.keys(query).forEach(field => {
      if (field.startsWith('$')) return // Skip operators
      suggestions.push(`{ "${field}": 1 }`)
    })
    
    // Suggest compound index for query + sort
    if (sort && Object.keys(sort).length > 0) {
      const queryFields = Object.keys(query).filter(f => !f.startsWith('$'))
      const sortFields = Object.keys(sort)
      
      if (queryFields.length > 0) {
        const compoundIndex = [...queryFields, ...sortFields]
          .map(field => `"${field}": 1`)
          .join(', ')
        
        suggestions.push(`{ ${compoundIndex} }`)
      }
    }
    
    return suggestions
  }

  /**
   * Create performance monitoring middleware
   */
  static createPerformanceMiddleware() {
    return function(this: any, next: any) {
      const startTime = Date.now()
      
      this.on('finish', () => {
        const executionTime = Date.now() - startTime
        
        if (executionTime > 1000) { // Log slow queries (>1s)
          console.warn(`Slow query detected: ${this.op} on ${this.model.collection.name} took ${executionTime}ms`)
        }
      })
      
      next()
    }
  }
}

// Caching utilities
class QueryCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  /**
   * Generate cache key for query
   */
  private static generateKey(collection: string, query: any, options?: any): string {
    return `${collection}:${JSON.stringify(query)}:${JSON.stringify(options || {})}`
  }

  /**
   * Get cached result
   */
  static get<T>(collection: string, query: any, options?: any): T | null {
    const key = this.generateKey(collection, query, options)
    const cached = this.cache.get(key)
    
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  /**
   * Set cache result
   */
  static set<T>(collection: string, query: any, data: T, ttl: number = 300000, options?: any): void {
    const key = this.generateKey(collection, query, options)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    // Clean up old entries periodically
    if (this.cache.size > 1000) {
      this.cleanup()
    }
  }

  /**
   * Invalidate cache by pattern
   */
  static invalidate(pattern: string): void {
    Array.from(this.cache.keys())
      .filter(key => key.includes(pattern))
      .forEach(key => this.cache.delete(key))
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.cache.clear()
  }

  /**
   * Clean up expired entries
   */
  private static cleanup(): void {
    const now = Date.now()
    Array.from(this.cache.entries())
      .filter(([_, value]) => now - value.timestamp > value.ttl)
      .forEach(([key]) => this.cache.delete(key))
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()).map(key => ({
        key,
        age: Date.now() - (this.cache.get(key)?.timestamp || 0)
      }))
    }
  }
}

// Export utilities
export { AggregationBuilder, OptimizedQueries, QueryOptimizer, QueryCache }