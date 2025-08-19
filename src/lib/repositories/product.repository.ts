/**
 * Product Repository
 * Handles all product data operations with proper type transformations
 * Uses mapper pattern to ensure consistency between database and application
 */

import { Collection, Db, ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '@/lib/database'
import { 
  ProductDTO, 
  ProductListDTO, 
  ProductSearchParams, 
  ProductSearchResult,
  ProductCreateDTO,
  ProductUpdateDTO 
} from '@/types/product-dto'
import { 
  mapProductToDTO, 
  mapProductToListDTO, 
  mapProductArrayToListDTO 
} from '@/lib/mappers/product.mapper'

export class ProductRepository {
  private collection: Collection | null = null

  /**
   * Get the products collection
   */
  private async getProductsCollection(): Promise<Collection> {
    if (!this.collection) {
      this.collection = await getCollection('products')
    }
    return this.collection
  }

  /**
   * Search products with filters and pagination
   * Enhanced with material-based filtering for CLAUDE_RULES compliance
   */
  async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
    const collection = await this.getProductsCollection()
    
    // Build query with proper MongoDB indexing
    const query: any = {
      'metadata.status': 'active' // Always filter for active products
    }
    
    // Text search
    if (params.query) {
      query.$text = { $search: params.query }
    }
    
    // Category filters
    if (params.filters?.category?.length) {
      query.category = { $in: params.filters.category }
    }
    
    if (params.filters?.subcategory?.length) {
      query.subcategory = { $in: params.filters.subcategory }
    }
    
    // Price range
    if (params.filters?.priceRange) {
      query['pricing.basePrice'] = {}
      if (params.filters.priceRange.min !== undefined) {
        query['pricing.basePrice'].$gte = params.filters.priceRange.min
      }
      if (params.filters.priceRange.max !== undefined) {
        query['pricing.basePrice'].$lte = params.filters.priceRange.max
      }
    }
    
    // Enhanced Material Filtering - leveraging MongoDB indexes
    if (params.filters?.metals?.length) {
      // Map to database material field structure
      const metalMapping: Record<string, string[]> = {
        'silver': ['silver', '925-silver'],
        '14k-gold': ['14k-gold', 'gold-14k-yellow', 'gold-14k-white', 'gold-14k-rose'],
        '18k-gold': ['18k-gold', 'gold-18k-yellow', 'gold-18k-white', 'gold-18k-rose'],
        'platinum': ['platinum', 'platinum-950']
      }
      
      const metalQueries = params.filters.metals.flatMap(metal => metalMapping[metal] || [metal])
      query.materials = { $in: metalQueries }
    }
    
    if (params.filters?.stones?.length) {
      // Map to database gemstone type structure
      const stoneMapping: Record<string, string[]> = {
        'lab-diamond': ['lab-diamond', 'lab-grown-diamond'],
        'moissanite': ['moissanite', 'silicon-carbide'],
        'lab-emerald': ['lab-emerald', 'lab-grown-emerald'],
        'lab-ruby': ['lab-ruby', 'lab-grown-ruby'],
        'lab-sapphire': ['lab-sapphire', 'lab-grown-sapphire']
      }
      
      const stoneQueries = params.filters.stones.flatMap(stone => stoneMapping[stone] || [stone])
      query['gemstones.type'] = { $in: stoneQueries }
    }
    
    // Carat range filtering
    if (params.filters?.caratRange) {
      query['gemstones.carat'] = {}
      if (params.filters.caratRange.min !== undefined) {
        query['gemstones.carat'].$gte = params.filters.caratRange.min
      }
      if (params.filters.caratRange.max !== undefined) {
        query['gemstones.carat'].$lte = params.filters.caratRange.max
      }
    }
    
    // Material tags filtering
    if (params.filters?.materialTags?.length) {
      query['metadata.tags'] = { $in: params.filters.materialTags }
    }
    
    // Legacy filter support (backward compatibility)
    if (params.filters?.materials?.length) {
      query['customization.materials.id'] = { $in: params.filters.materials }
    }
    
    if (params.filters?.gemstones?.length) {
      query['customization.gemstones.type'] = { $in: params.filters.gemstones }
    }
    
    // Other filters
    if (params.filters?.inStock) {
      query['inventory.available'] = { $gt: 0 }
    }
    
    if (params.filters?.featured) {
      query['metadata.featured'] = true
    }
    
    if (params.filters?.onSale) {
      query['pricing.compareAtPrice'] = { $exists: true, $gt: 0 }
    }
    
    if (params.filters?.newArrival) {
      query['metadata.newArrival'] = true
    }
    
    if (params.filters?.customizable) {
      query['customization.materials'] = { $exists: true, $ne: [] }
    }
    
    if (params.filters?.collections?.length) {
      query['metadata.collections'] = { $in: params.filters.collections }
    }
    
    if (params.filters?.tags?.length) {
      query['metadata.tags'] = { $in: params.filters.tags }
    }
    
    // Pagination
    const page = params.page || 1
    const limit = Math.min(params.limit || 20, 100)
    const skip = (page - 1) * limit
    
    // Sorting
    const sort: any = {}
    switch (params.sortBy) {
      case 'price':
        sort['pricing.basePrice'] = params.sortOrder === 'desc' ? -1 : 1
        break
      case 'name':
        sort.name = params.sortOrder === 'desc' ? -1 : 1
        break
      case 'newest':
        sort.createdAt = -1
        break
      case 'popularity':
      default:
        sort['analytics.views'] = -1
        break
    }
    
    // Execute query
    const [products, total] = await Promise.all([
      collection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ])
    
    // Map to DTOs
    const productDTOs = mapProductArrayToListDTO(products)
    
    // Get available filters
    const availableFilters = await this.getAvailableFilters(collection)
    
    return {
      products: productDTOs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        applied: params.filters || {},
        available: availableFilters
      }
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ProductDTO | null> {
    const collection = await this.getProductsCollection()
    
    // Handle both string IDs and ObjectIds
    let query: any = {}
    try {
      // Try as ObjectId first
      query._id = new ObjectId(id)
    } catch {
      // Fall back to string ID
      query._id = id
    }
    
    const product = await collection.findOne(query)
    
    if (!product) {
      return null
    }
    
    return mapProductToDTO(product)
  }

  /**
   * Get product by slug
   * Handles SEO-friendly URL slug lookups
   */
  async getProductBySlug(slug: string): Promise<ProductDTO | null> {
    const collection = await this.getProductsCollection()
    
    const product = await collection.findOne({ 
      'seo.slug': slug 
    })
    
    if (!product) {
      return null
    }
    
    return mapProductToDTO(product)
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: string, 
    limit: number = 20
  ): Promise<ProductListDTO[]> {
    const collection = await this.getProductsCollection()
    
    const products = await collection
      .find({ category, 'metadata.status': 'active' })
      .limit(limit)
      .toArray()
    
    return mapProductArrayToListDTO(products)
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<ProductListDTO[]> {
    const collection = await this.getProductsCollection()
    
    const products = await collection
      .find({ 
        'metadata.featured': true,
        'metadata.status': 'active'
      })
      .sort({ 'analytics.views': -1 })
      .limit(limit)
      .toArray()
    
    return mapProductArrayToListDTO(products)
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit: number = 8): Promise<ProductListDTO[]> {
    const collection = await this.getProductsCollection()
    
    const products = await collection
      .find({ 
        'metadata.newArrival': true,
        'metadata.status': 'active'
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return mapProductArrayToListDTO(products)
  }

  /**
   * Get bestsellers
   */
  async getBestsellers(limit: number = 8): Promise<ProductListDTO[]> {
    const collection = await this.getProductsCollection()
    
    const products = await collection
      .find({ 
        'metadata.bestseller': true,
        'metadata.status': 'active'
      })
      .sort({ 'analytics.purchases': -1 })
      .limit(limit)
      .toArray()
    
    return mapProductArrayToListDTO(products)
  }

  /**
   * Create a new product (admin only)
   */
  async createProduct(data: ProductCreateDTO): Promise<ProductDTO> {
    const collection = await this.getProductsCollection()
    
    // Generate slug from name
    const slug = data.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    // Create product document
    const product = {
      _id: new ObjectId().toString(),
      name: data.name,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      pricing: {
        basePrice: data.basePrice,
        currency: 'USD'
      },
      media: {
        primary: data.images.primary,
        gallery: data.images.gallery || [],
        thumbnail: data.images.thumbnail || data.images.primary
      },
      inventory: {
        sku: `GG-${data.category.toUpperCase()}-${Date.now()}`,
        quantity: 100,
        reserved: 0,
        available: 100,
        lowStockThreshold: 10,
        isCustomMade: true,
        leadTime: { min: 7, max: 14 }
      },
      customization: {
        materials: [],
        sizes: [],
        engraving: { available: data.customizable || false }
      },
      seo: {
        slug,
        keywords: data.tags || []
      },
      certifications: {},
      metadata: {
        featured: data.featured || false,
        bestseller: false,
        newArrival: true,
        limitedEdition: false,
        status: 'active' as const,
        collections: [],
        tags: data.tags || []
      },
      analytics: {
        views: 0,
        customizations: 0,
        purchases: 0,
        conversionRate: 0,
        averageTimeOnPage: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await collection.insertOne(product as any)
    
    return mapProductToDTO(product)
  }

  /**
   * Update a product (admin only)
   */
  async updateProduct(id: string, data: ProductUpdateDTO): Promise<ProductDTO | null> {
    const collection = await this.getProductsCollection()
    
    // Build update object
    const update: any = {
      $set: {
        updatedAt: new Date()
      }
    }
    
    // Update fields if provided
    if (data.name) update.$set.name = data.name
    if (data.description) update.$set.description = data.description
    if (data.category) update.$set.category = data.category
    if (data.subcategory) update.$set.subcategory = data.subcategory
    if (data.basePrice) update.$set['pricing.basePrice'] = data.basePrice
    if (data.metadata) {
      Object.keys(data.metadata).forEach(key => {
        update.$set[`metadata.${key}`] = (data.metadata as any)[key]
      })
    }
    
    // Handle ID format
    let query: any = {}
    try {
      query._id = new ObjectId(id)
    } catch {
      query._id = id
    }
    
    const result = await collection.findOneAndUpdate(
      query,
      update,
      { returnDocument: 'after' }
    )
    
    if (!result) {
      return null
    }
    
    return mapProductToDTO(result)
  }

  /**
   * Delete a product (admin only)
   */
  async deleteProduct(id: string): Promise<boolean> {
    const collection = await this.getProductsCollection()
    
    let query: any = {}
    try {
      query._id = new ObjectId(id)
    } catch {
      query._id = id
    }
    
    const result = await collection.deleteOne(query)
    
    return result.deletedCount > 0
  }

  /**
   * Increment product view count
   */
  async incrementProductViews(id: string): Promise<void> {
    const collection = await this.getProductsCollection()
    
    let query: any = {}
    try {
      query._id = new ObjectId(id)
    } catch {
      query._id = id
    }
    
    await collection.updateOne(
      query,
      { $inc: { 'analytics.views': 1 } }
    )
  }

  /**
   * Get available filters based on current products
   * Enhanced with material filtering support
   */
  private async getAvailableFilters(collection: Collection): Promise<any> {
    const activeProductsQuery = { 'metadata.status': 'active' }
    
    // Run aggregation pipeline for comprehensive filter data
    const aggregationResults = await collection.aggregate([
      { $match: activeProductsQuery },
      { 
        $group: {
          _id: null,
          categories: { $addToSet: '$category' },
          subcategories: { $addToSet: '$subcategory' },
          materials: { $addToSet: '$materials' },
          gemstoneTypes: { $addToSet: '$gemstones.type' },
          minPrice: { $min: '$pricing.basePrice' },
          maxPrice: { $max: '$pricing.basePrice' },
          minCarat: { $min: '$gemstones.carat' },
          maxCarat: { $max: '$gemstones.carat' },
          materialTags: { $addToSet: '$metadata.tags' }
        }
      }
    ]).toArray()
    
    const result = aggregationResults[0] || {}
    
    // Flatten and filter arrays
    const flattenAndFilter = (arr: any[]) => 
      arr.flat().filter(Boolean).filter((item, index, self) => self.indexOf(item) === index)
    
    return {
      categories: result.categories || [],
      subcategories: result.subcategories || [],
      priceRange: {
        min: result.minPrice || 0,
        max: result.maxPrice || 10000
      },
      // Enhanced material filtering support
      metals: flattenAndFilter(result.materials || []).filter((material: string) => 
        material && ['silver', '14k-gold', '18k-gold', 'platinum'].some(metal => 
          material.toLowerCase().includes(metal.replace('-', ''))
        )
      ),
      stones: flattenAndFilter(result.gemstoneTypes || []).filter((stone: string) => 
        stone && ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire'].some(stoneType => 
          stone.toLowerCase().includes(stoneType.replace('-', ''))
        )
      ),
      caratRange: {
        min: result.minCarat || 0,
        max: result.maxCarat || 5
      },
      materialTags: flattenAndFilter(result.materialTags || []).slice(0, 20), // Limit to 20 most common tags
      // Legacy support
      materials: flattenAndFilter(result.materials || [])
    }
  }
}

// Export singleton instance
export const productRepository = new ProductRepository()