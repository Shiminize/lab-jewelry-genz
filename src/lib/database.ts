/**
 * Database Connection and MongoDB Integration
 * Handles MongoDB connection with proper error handling and optimization
 * Follows PRD requirements for scalable data management
 */

import { MongoClient, Db, Collection } from 'mongodb'
import { Product, ProductFilters, ProductSearchParams, ProductSearchResult } from '@/types/product'
import { User, UserRole, AccountStatus } from '@/types/auth'

// Database configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DATABASE_NAME = process.env.DATABASE_NAME || 'glowglitch'

// Global connection promise to avoid multiple connections
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

/**
 * Connect to MongoDB with optimized connection pooling for CLAUDE_RULES <300ms target
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      // Optimized pool settings for CLAUDE_RULES performance
      maxPoolSize: process.env.NODE_ENV === 'production' ? 50 : 10,
      minPoolSize: process.env.NODE_ENV === 'production' ? 5 : 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      bufferMaxEntries: 0,
      retryWrites: true,
      w: 'majority',
      // Connection compression for improved performance
      compressors: ['snappy', 'zlib'],
      // Read preference optimization
      readPreference: 'secondaryPreferred',
      // Enable monitoring for production
      monitorCommands: process.env.NODE_ENV === 'production',
      // Connection pool events for monitoring
      maxConnecting: 2,
    })

    await client.connect()
    
    const db = client.db(DATABASE_NAME)
    
    // Cache the connection
    cachedClient = client
    cachedDb = db

    // Set up connection monitoring for CLAUDE_RULES compliance
    client.on('connectionPoolCreated', (event) => {
      console.log('Connection pool created:', event.address)
    })

    client.on('connectionPoolClosed', (event) => {
      console.log('Connection pool closed:', event.address)
    })

    client.on('connectionCreated', (event) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Connection created:', event.connectionId)
      }
    })

    client.on('connectionClosed', (event) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Connection closed:', event.connectionId)
      }
    })

    // Monitor slow operations for CLAUDE_RULES compliance
    client.on('commandStarted', (event) => {
      event['startTime'] = Date.now()
    })

    client.on('commandSucceeded', (event) => {
      const executionTime = Date.now() - (event['startTime'] || Date.now())
      if (executionTime > 300) {
        console.warn(`CLAUDE_RULES VIOLATION: Slow ${event.commandName} operation took ${executionTime}ms`)
      }
    })

    client.on('commandFailed', (event) => {
      console.error(`Command failed: ${event.commandName}`, event.failure)
    })

    console.log('Successfully connected to MongoDB with optimized pooling')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw new Error('Database connection failed')
  }
}

/**
 * Get specific collection with proper typing
 */
export async function getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
  const { db } = await connectToDatabase()
  return db.collection<T>(collectionName)
}

/**
 * Database collections enum for type safety
 */
export const Collections = {
  PRODUCTS: 'products',
  USERS: 'users',
  ORDERS: 'orders',
  CREATORS: 'creators',
  REVIEWS: 'reviews',
  MATERIALS: 'materials',
  GEMSTONES: 'gemstones',
  SIZES: 'sizes'
} as const

/**
 * Product-specific database operations
 */
export class ProductRepository {
  private collection: Collection<Product> | null = null

  private async getCollection(): Promise<Collection<Product>> {
    if (!this.collection) {
      this.collection = await getCollection<Product>(Collections.PRODUCTS)
    }
    return this.collection
  }

  /**
   * Create database indexes for optimal query performance
   */
  async createIndexes(): Promise<void> {
    const collection = await this.getCollection()

    try {
      // Text search index for product search
      await collection.createIndex({
        'name': 'text',
        'description': 'text',
        'seo.keywords': 'text',
        'metadata.tags': 'text'
      }, {
        name: 'product_text_search',
        weights: {
          'name': 10,
          'description': 5,
          'seo.keywords': 8,
          'metadata.tags': 3
        }
      })

      // Category and filtering indexes
      await collection.createIndex({ 'category': 1, 'subcategory': 1 })
      await collection.createIndex({ 'pricing.basePrice': 1 })
      await collection.createIndex({ 'metadata.featured': 1, 'metadata.status': 1 })
      await collection.createIndex({ 'metadata.bestseller': 1 })
      await collection.createIndex({ 'metadata.newArrival': 1 })
      await collection.createIndex({ 'inventory.available': 1 })
      await collection.createIndex({ 'seo.slug': 1 }, { unique: true })
      await collection.createIndex({ 'inventory.sku': 1 }, { unique: true })

      // Compound indexes for common queries
      await collection.createIndex({
        'category': 1,
        'metadata.status': 1,
        'inventory.available': 1,
        'pricing.basePrice': 1
      })

      // Creator program index
      await collection.createIndex({ 'creator.creatorId': 1 })

      console.log('Product indexes created successfully')
    } catch (error) {
      console.error('Failed to create product indexes:', error)
    }
  }

  /**
   * Optimized product search with <300ms CLAUDE_RULES performance target
   */
  async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
    const collection = await this.getCollection()
    const { query, filters = {}, sortBy = 'popularity', sortOrder = 'desc', page = 1, limit = 20 } = params
    const startTime = Date.now()

    try {
      // Build optimized MongoDB aggregation pipeline for better performance
      const pipeline: any[] = []

      // Stage 1: Initial match with compound index optimization
      const matchStage: any = { 
        'metadata.status': 'active',
        'inventory.available': { $gt: 0 } // Always filter for available products
      }

      // Text search optimization - use $text when available
      if (query) {
        matchStage.$text = { $search: query }
      }

      // Category filters (use compound indexes)
      if (filters.category?.length) {
        matchStage.category = { $in: filters.category }
      }

      if (filters.subcategory?.length) {
        matchStage.subcategory = { $in: filters.subcategory }
      }

      // Price range filter (indexed field)
      if (filters.priceRange) {
        matchStage['pricing.basePrice'] = {}
        if (filters.priceRange.min !== undefined) {
          matchStage['pricing.basePrice'].$gte = filters.priceRange.min
        }
        if (filters.priceRange.max !== undefined) {
          matchStage['pricing.basePrice'].$lte = filters.priceRange.max
        }
      }

      // Boolean filters (indexed fields)
      if (filters.featured) {
        matchStage['metadata.featured'] = true
      }

      if (filters.newArrival) {
        matchStage['metadata.newArrival'] = true
      }

      if (filters.onSale) {
        matchStage['pricing.originalPrice'] = { $exists: true }
      }

      pipeline.push({ $match: matchStage })

      // Stage 2: Additional filters that benefit from reduced document set
      if (filters.materials?.length || filters.gemstones?.length || 
          filters.collections?.length || filters.tags?.length) {
        
        const additionalMatch: any = {}
        
        if (filters.materials?.length) {
          additionalMatch['customization.materials.id'] = { $in: filters.materials }
        }

        if (filters.gemstones?.length) {
          additionalMatch['customization.gemstones.type'] = { $in: filters.gemstones }
        }

        if (filters.collections?.length) {
          additionalMatch['metadata.collections'] = { $in: filters.collections }
        }

        if (filters.tags?.length) {
          additionalMatch['metadata.tags'] = { $in: filters.tags }
        }

        pipeline.push({ $match: additionalMatch })
      }

      // Stage 3: Add text search score if needed
      if (query) {
        pipeline.push({
          $addFields: {
            textScore: { $meta: 'textScore' }
          }
        })
      }

      // Stage 4: Facet for parallel aggregation (performance optimization)
      const facetStage = {
        $facet: {
          // Main results with sorting and pagination
          results: [
            // Sorting
            {
              $sort: this.buildSortOptions(sortBy, sortOrder, !!query)
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            // Project only needed fields to reduce data transfer
            {
              $project: {
                _id: 1,
                name: 1,
                category: 1,
                subcategory: 1,
                pricing: 1,
                inventory: { available: 1, sku: 1 },
                images: { $slice: ['$images', 2] }, // Only first 2 images
                metadata: {
                  status: 1,
                  featured: 1,
                  bestseller: 1,
                  newArrival: 1,
                  tags: { $slice: ['$metadata.tags', 5] }
                },
                seo: { slug: 1 },
                analytics: { views: 1, rating: 1 },
                ...(query && { textScore: 1 })
              }
            }
          ],
          // Total count
          totalCount: [
            { $count: 'count' }
          ],
          // Filter aggregations for faceted search
          categoryFacets: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ],
          priceRange: [
            {
              $group: {
                _id: null,
                min: { $min: '$pricing.basePrice' },
                max: { $max: '$pricing.basePrice' }
              }
            }
          ]
        }
      }

      pipeline.push(facetStage)

      // Execute optimized aggregation
      const aggregationResult = await collection.aggregate(pipeline, {
        // Use read preference for better performance
        readPreference: 'secondaryPreferred',
        // Set reasonable timeout
        maxTimeMS: 250 // Fail fast if approaching CLAUDE_RULES limit
      }).toArray()

      const result = aggregationResult[0]
      const executionTime = Date.now() - startTime

      // Log performance for CLAUDE_RULES monitoring
      if (executionTime > 300) {
        console.warn(`CLAUDE_RULES VIOLATION: Product search took ${executionTime}ms (target: <300ms)`)
      } else if (executionTime > 200) {
        console.info(`Product search approaching limit: ${executionTime}ms`)
      }

      const totalCount = result.totalCount[0]?.count || 0

      return {
        products: result.results,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        },
        filters: {
          applied: filters,
          available: {
            categories: result.categoryFacets,
            priceRange: result.priceRange[0] || { min: 0, max: 10000 },
            materials: [] // Can be populated if needed
          }
        },
        performance: {
          executionTime,
          claudeRulesCompliant: executionTime < 300
        }
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Product search failed:', error, { executionTime })
      throw new Error('Failed to search products')
    }
  }

  /**
   * Build optimized sort options with index hints
   */
  private buildSortOptions(sortBy: string, sortOrder: string, hasTextSearch: boolean): any {
    const sortOptions: any = {}

    // Text search score sorting (highest priority)
    if (hasTextSearch) {
      sortOptions.textScore = { $meta: 'textScore' }
    }

    // Secondary sorting
    switch (sortBy) {
      case 'price':
        sortOptions['pricing.basePrice'] = sortOrder === 'asc' ? 1 : -1
        break
      case 'name':
        sortOptions['name'] = sortOrder === 'asc' ? 1 : -1
        break
      case 'newest':
        sortOptions['createdAt'] = -1
        break
      case 'rating':
        sortOptions['analytics.rating'] = -1
        break
      case 'popularity':
      default:
        // Use compound sort for popularity (leverages compound indexes)
        sortOptions['metadata.featured'] = -1
        sortOptions['analytics.views'] = -1
        break
    }

    return sortOptions
  }

  /**
   * Get available filter options with counts
   */
  private async getAvailableFilters(baseQuery: any) {
    const collection = await this.getCollection()

    try {
      // Get category counts
      const categories = await collection.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { value: '$_id', count: 1, _id: 0 } }
      ]).toArray()

      // Get price range
      const priceRange = await collection.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            min: { $min: '$pricing.basePrice' },
            max: { $max: '$pricing.basePrice' }
          }
        }
      ]).toArray()

      // Get material counts
      const materials = await collection.aggregate([
        { $match: baseQuery },
        { $unwind: '$customization.materials' },
        {
          $group: {
            _id: '$customization.materials.id',
            name: { $first: '$customization.materials.name' },
            count: { $sum: 1 }
          }
        },
        { $project: { id: '$_id', name: 1, count: 1, _id: 0 } }
      ]).toArray()

      return {
        categories,
        priceRange: priceRange[0] || { min: 0, max: 10000 },
        materials
      }
    } catch (error) {
      console.error('Failed to get available filters:', error)
      return {
        categories: [],
        priceRange: { min: 0, max: 10000 },
        materials: []
      }
    }
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product | null> {
    const collection = await this.getCollection()
    
    try {
      return await collection.findOne({ _id: id })
    } catch (error) {
      console.error('Failed to get product by ID:', error)
      return null
    }
  }

  /**
   * Get product by slug
   */
  async getBySlug(slug: string): Promise<Product | null> {
    const collection = await this.getCollection()
    
    try {
      return await collection.findOne({ 'seo.slug': slug })
    } catch (error) {
      console.error('Failed to get product by slug:', error)
      return null
    }
  }

  /**
   * Get featured products
   */
  async getFeatured(limit: number = 8): Promise<Product[]> {
    const collection = await this.getCollection()
    
    try {
      return await collection
        .find({
          'metadata.featured': true,
          'metadata.status': 'active',
          'inventory.available': { $gt: 0 }
        })
        .sort({ 'analytics.views': -1 })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Failed to get featured products:', error)
      return []
    }
  }

  /**
   * Get products by category
   */
  async getByCategory(category: string, limit: number = 12): Promise<Product[]> {
    const collection = await this.getCollection()
    
    try {
      return await collection
        .find({
          category,
          'metadata.status': 'active',
          'inventory.available': { $gt: 0 }
        })
        .sort({ 'metadata.featured': -1, 'analytics.views': -1 })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Failed to get products by category:', error)
      return []
    }
  }

  /**
   * Create new product
   */
  async create(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const collection = await this.getCollection()
    
    try {
      const now = new Date()
      const newProduct: Product = {
        ...product,
        _id: generateProductId(),
        createdAt: now,
        updatedAt: now
      }

      const result = await collection.insertOne(newProduct)
      
      if (!result.acknowledged) {
        throw new Error('Failed to create product')
      }

      return newProduct
    } catch (error) {
      console.error('Failed to create product:', error)
      throw new Error('Failed to create product')
    }
  }

  /**
   * Update product
   */
  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const collection = await this.getCollection()
    
    try {
      const result = await collection.findOneAndUpdate(
        { _id: id },
        { 
          $set: { 
            ...updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      return result.value
    } catch (error) {
      console.error('Failed to update product:', error)
      return null
    }
  }
}

/**
 * Generate unique product ID
 */
function generateProductId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `prod_${timestamp}_${randomStr}`
}

/**
 * User-specific database operations
 */
export class UserRepository {
  private collection: Collection<User> | null = null

  private async getCollection(): Promise<Collection<User>> {
    if (!this.collection) {
      this.collection = await getCollection<User>(Collections.USERS)
    }
    return this.collection
  }

  /**
   * Create database indexes for optimal user query performance
   */
  async createIndexes(): Promise<void> {
    const collection = await this.getCollection()

    try {
      // Core user indexes
      await collection.createIndex({ email: 1 }, { unique: true })
      await collection.createIndex({ role: 1 })
      await collection.createIndex({ status: 1 })
      await collection.createIndex({ emailVerified: 1 })
      
      // Authentication indexes
      await collection.createIndex({ emailVerificationToken: 1 }, { sparse: true })
      await collection.createIndex({ passwordResetToken: 1 }, { sparse: true })
      await collection.createIndex({ emailVerificationExpires: 1 }, { sparse: true })
      await collection.createIndex({ passwordResetExpires: 1 }, { sparse: true })
      
      // Security indexes
      await collection.createIndex({ loginAttempts: 1 })
      await collection.createIndex({ lockedUntil: 1 }, { sparse: true })
      await collection.createIndex({ lastLogin: 1 })
      await collection.createIndex({ lastActiveAt: 1 })
      
      // Creator program indexes
      await collection.createIndex({ 'creatorProfile.referralCode': 1 }, { unique: true, sparse: true })
      await collection.createIndex({ 'creatorProfile.status': 1 }, { sparse: true })
      await collection.createIndex({ 'creatorProfile.approvalDate': 1 }, { sparse: true })
      await collection.createIndex({ 'creatorProfile.stripeAccountId': 1 }, { sparse: true })
      
      // Address indexes for shipping/billing queries
      await collection.createIndex({ 'addresses.type': 1 })
      await collection.createIndex({ 'addresses.isDefault': 1 })
      await collection.createIndex({ 'addresses.country': 1 })
      await collection.createIndex({ 'addresses.state': 1 })
      
      // GDPR and compliance indexes
      await collection.createIndex({ 'gdprConsent.accepted': 1 })
      await collection.createIndex({ 'gdprConsent.acceptedAt': 1 })
      await collection.createIndex({ dataRetentionConsent: 1 })
      await collection.createIndex({ marketingConsent: 1 })
      
      // Timestamp indexes for analytics and cleanup
      await collection.createIndex({ createdAt: 1 })
      await collection.createIndex({ updatedAt: 1 })
      
      // Compound indexes for common queries
      await collection.createIndex({ role: 1, status: 1, emailVerified: 1 })
      await collection.createIndex({ email: 1, status: 1 })
      await collection.createIndex({ 'creatorProfile.status': 1, 'creatorProfile.approvalDate': 1 }, { sparse: true })
      
      // Shopping-related indexes
      await collection.createIndex({ cartId: 1 }, { sparse: true })
      await collection.createIndex({ wishlistIds: 1 })
      
      // Analytics indexes
      await collection.createIndex({ 'analytics.totalOrders': 1 }, { sparse: true })
      await collection.createIndex({ 'analytics.totalSpent': 1 }, { sparse: true })
      await collection.createIndex({ 'analytics.lastPurchaseDate': 1 }, { sparse: true })

      console.log('User indexes created successfully')
    } catch (error) {
      console.error('Failed to create user indexes:', error)
    }
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection()
    
    try {
      return await collection.findOne({ email: email.toLowerCase() })
    } catch (error) {
      console.error('Failed to find user by email:', error)
      return null
    }
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<User | null> {
    const collection = await this.getCollection()
    
    try {
      return await collection.findOne({ _id: id })
    } catch (error) {
      console.error('Failed to find user by ID:', error)
      return null
    }
  }

  /**
   * Create new user
   */
  async create(userData: Omit<User, '_id'>): Promise<User> {
    const collection = await this.getCollection()
    
    try {
      const newUser: User = {
        ...userData,
        _id: generateUserId()
      }

      const result = await collection.insertOne(newUser)
      
      if (!result.acknowledged) {
        throw new Error('Failed to create user')
      }

      return newUser
    } catch (error) {
      console.error('Failed to create user:', error)
      if (error instanceof Error && error.message.includes('E11000')) {
        throw new Error('USER_EXISTS')
      }
      throw new Error('DATABASE_ERROR')
    }
  }

  /**
   * Update user
   */
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const collection = await this.getCollection()
    
    try {
      const result = await collection.findOneAndUpdate(
        { _id: id },
        { 
          $set: { 
            ...updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      return result.value
    } catch (error) {
      console.error('Failed to update user:', error)
      return null
    }
  }

  /**
   * Delete user (for GDPR compliance)
   */
  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    
    try {
      const result = await collection.deleteOne({ _id: id })
      return result.deletedCount === 1
    } catch (error) {
      console.error('Failed to delete user:', error)
      return false
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole, limit: number = 50): Promise<User[]> {
    const collection = await this.getCollection()
    
    try {
      return await collection
        .find({ role })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Failed to find users by role:', error)
      return []
    }
  }

  /**
   * Find users by status
   */
  async findByStatus(status: AccountStatus, limit: number = 50): Promise<User[]> {
    const collection = await this.getCollection()
    
    try {
      return await collection
        .find({ status })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Failed to find users by status:', error)
      return []
    }
  }

  /**
   * Find creator applications pending approval
   */
  async findPendingCreatorApplications(): Promise<User[]> {
    const collection = await this.getCollection()
    
    try {
      return await collection
        .find({ 
          'creatorProfile.status': 'pending'
        })
        .sort({ 'creatorProfile.applicationDate': 1 })
        .toArray()
    } catch (error) {
      console.error('Failed to find pending creator applications:', error)
      return []
    }
  }

  /**
   * Find users with expired verification tokens for cleanup
   */
  async findExpiredVerificationTokens(): Promise<User[]> {
    const collection = await this.getCollection()
    
    try {
      return await collection
        .find({
          emailVerificationExpires: { $lt: new Date() },
          emailVerified: false
        })
        .toArray()
    } catch (error) {
      console.error('Failed to find expired verification tokens:', error)
      return []
    }
  }

  /**
   * Get user analytics summary
   */
  async getUserAnalytics(timeframe: 'week' | 'month' | 'year' = 'month') {
    const collection = await this.getCollection()
    
    try {
      const now = new Date()
      const startDate = new Date()
      
      switch (timeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      const analytics = await collection.aggregate([
        {
          $facet: {
            totalUsers: [
              { $count: 'count' }
            ],
            newUsers: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: 'count' }
            ],
            usersByRole: [
              { $group: { _id: '$role', count: { $sum: 1 } } }
            ],
            usersByStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            verificationStats: [
              { $group: { _id: '$emailVerified', count: { $sum: 1 } } }
            ],
            creatorStats: [
              { $match: { 'creatorProfile': { $exists: true } } },
              { $group: { _id: '$creatorProfile.status', count: { $sum: 1 } } }
            ]
          }
        }
      ]).toArray()

      return analytics[0]
    } catch (error) {
      console.error('Failed to get user analytics:', error)
      return null
    }
  }
}

/**
 * Generate unique user ID
 */
function generateUserId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `user_${timestamp}_${randomStr}`
}

// Export singleton instances
export const productRepository = new ProductRepository()
export const userRepository = new UserRepository()

/**
 * Initialize database with indexes
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await connectToDatabase()
    await Promise.all([
      productRepository.createIndexes(),
      userRepository.createIndexes()
    ])
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}