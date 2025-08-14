/**
 * Database Utilities - Common database operations and helpers
 * Provides safe database operations with error handling and validation
 * Implements CLAUDE_RULES.md database standards
 */

import mongoose from 'mongoose'
import { connectToDatabase, withTransaction } from './mongoose'
import { UserModel, ProductModel } from './schemas'

// Common database operation results
export interface DatabaseResult<T = any> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

/**
 * Safe database operation wrapper
 * Ensures database connection and provides consistent error handling
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>
): Promise<DatabaseResult<T>> {
  try {
    await connectToDatabase()
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    console.error('Database operation failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    }
  }
}

/**
 * Paginated query helper
 * Provides consistent pagination across all collections
 */
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function paginatedQuery<T>(
  model: mongoose.Model<T>,
  filter: any = {},
  options: PaginationOptions = {}
): Promise<DatabaseResult<PaginatedResult<T>>> {
  return safeDbOperation(async () => {
    const page = Math.max(1, options.page || 1)
    const limit = Math.min(100, Math.max(1, options.limit || 20))
    const skip = (page - 1) * limit
    
    // Build sort options
    const sort: any = {}
    if (options.sortBy) {
      sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1
    } else {
      sort.createdAt = -1 // Default sort by creation date
    }
    
    // Execute query with count
    const [data, total] = await Promise.all([
      model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      model.countDocuments(filter)
    ])
    
    const pages = Math.ceil(total / limit)
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    }
  })
}

/**
 * User management utilities
 */
export class UserUtils {
  /**
   * Find user by email with error handling
   */
  static async findByEmail(email: string): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      const user = await UserModel.findOne({ 
        email: email.toLowerCase() 
      }).select('-password').exec()
      return user
    })
  }
  
  /**
   * Create new user with validation
   */
  static async createUser(userData: any): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      const user = new UserModel(userData)
      await user.save()
      // Remove password from response
      const userObject = user.toObject()
      delete userObject.password
      return userObject
    })
  }
  
  /**
   * Update user with validation
   */
  static async updateUser(userId: string, updateData: any): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password').exec()
      return user
    })
  }
  
  /**
   * Get creator analytics
   */
  static async getCreatorAnalytics(userId: string): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      const user = await UserModel.findById(userId)
        .select('creatorProfile analytics')
        .exec()
      
      if (!user || user.role !== 'creator') {
        throw new Error('User is not a creator')
      }
      
      return {
        profile: user.creatorProfile,
        analytics: user.analytics
      }
    })
  }
}

/**
 * Product management utilities
 */
export class ProductUtils {
  /**
   * Find product by slug
   */
  static async findBySlug(slug: string): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      const product = await ProductModel.findOne({ 
        'seo.slug': slug,
        status: 'active'
      })
      .populate('categories collections')
      .exec()
      return product
    })
  }
  
  /**
   * Get featured products
   */
  static async getFeatured(limit: number = 8): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      const products = await ProductModel.find({
        status: 'active',
        'analytics.trending': true
      })
      .sort({ 'analytics.trendingScore': -1 })
      .limit(limit)
      .populate('categories collections')
      .exec()
      return products
    })
  }
  
  /**
   * Search products with filters
   */
  static async search(
    searchTerm: string,
    filters: any = {},
    pagination: PaginationOptions = {}
  ): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      const query: any = {
        status: 'active'
      }
      
      // Add text search if search term provided
      if (searchTerm) {
        query.$text = { $search: searchTerm }
      }
      
      // Apply filters
      if (filters.priceMin || filters.priceMax) {
        query.basePrice = {}
        if (filters.priceMin) query.basePrice.$gte = filters.priceMin
        if (filters.priceMax) query.basePrice.$lte = filters.priceMax
      }
      
      if (filters.materials && filters.materials.length > 0) {
        query.materials = { $in: filters.materials }
      }
      
      if (filters.type) {
        query.type = filters.type
      }
      
      if (filters.categories && filters.categories.length > 0) {
        query.categories = { $in: filters.categories }
      }
      
      return paginatedQuery(ProductModel, query, pagination)
    })
  }
  
  /**
   * Update product analytics
   */
  static async updateAnalytics(
    productId: string,
    analytics: Partial<any>
  ): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      const product = await ProductModel.findByIdAndUpdate(
        productId,
        { $inc: analytics },
        { new: true }
      ).exec()
      return product
    })
  }
  
  /**
   * Check inventory availability
   */
  static async checkInventory(
    productId: string,
    variant: Record<string, string>,
    quantity: number
  ): Promise<DatabaseResult<{ available: boolean; stock: number }>> {
    return safeDbOperation(async () => {
      const product = await ProductModel.findById(productId).exec()
      
      if (!product) {
        throw new Error('Product not found')
      }
      
      // Find matching inventory item
      const inventoryItem = product.inventory.find(item => {
        const variantMatch = Object.keys(variant).every(key => 
          item.variant.get(key) === variant[key]
        )
        return variantMatch
      })
      
      if (!inventoryItem) {
        return { available: false, stock: 0 }
      }
      
      const availableStock = inventoryItem.quantity - inventoryItem.reserved
      
      return {
        available: availableStock >= quantity,
        stock: availableStock
      }
    })
  }
}

/**
 * Transaction utilities for complex operations
 */
export class TransactionUtils {
  /**
   * Create user and initialize cart in a transaction
   */
  static async createUserWithCart(userData: any): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      return withTransaction(async (session) => {
        // Create user
        const user = new UserModel(userData)
        await user.save({ session })
        
        // Note: Cart creation would be implemented when we have CartModel
        // For now, just return user
        const userObject = user.toObject()
        delete userObject.password
        return userObject
      })
    })
  }
  
  /**
   * Reserve inventory for order
   */
  static async reserveInventory(
    items: { productId: string; variant: Record<string, string>; quantity: number }[]
  ): Promise<DatabaseResult> {
    return safeDbOperation(async () => {
      return withTransaction(async (session) => {
        const reservations = []
        
        for (const item of items) {
          const product = await ProductModel.findById(item.productId).session(session)
          
          if (!product) {
            throw new Error(`Product ${item.productId} not found`)
          }
          
          const inventoryItem = product.inventory.find(inv => {
            return Object.keys(item.variant).every(key => 
              inv.variant.get(key) === item.variant[key]
            )
          })
          
          if (!inventoryItem) {
            throw new Error(`Variant not found for product ${item.productId}`)
          }
          
          const availableStock = inventoryItem.quantity - inventoryItem.reserved
          
          if (availableStock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId}`)
          }
          
          // Reserve inventory
          inventoryItem.reserved += item.quantity
          await product.save({ session })
          
          reservations.push({
            productId: item.productId,
            sku: inventoryItem.sku,
            quantity: item.quantity,
            reserved: true
          })
        }
        
        return reservations
      })
    })
  }
}

/**
 * Data validation utilities
 */
export class ValidationUtils {
  /**
   * Validate ObjectId format
   */
  static isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id)
  }
  
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }
  
  /**
   * Validate pagination parameters
   */
  static validatePagination(page?: number, limit?: number): PaginationOptions {
    return {
      page: Math.max(1, page || 1),
      limit: Math.min(100, Math.max(1, limit || 20))
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceUtils {
  /**
   * Log slow queries for monitoring
   */
  static logSlowQuery(queryName: string, duration: number, threshold: number = 1000) {
    if (duration > threshold) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`)
    }
  }
  
  /**
   * Execute query with performance monitoring
   */
  static async executeWithMonitoring<T>(
    queryName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    try {
      const result = await operation()
      const duration = Date.now() - startTime
      this.logSlowQuery(queryName, duration)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`Query failed: ${queryName} after ${duration}ms`, error)
      throw error
    }
  }
}

export default {
  UserUtils,
  ProductUtils,
  TransactionUtils,
  ValidationUtils,
  PerformanceUtils,
  safeDbOperation,
  paginatedQuery
}