/**
 * Database API Layer
 * High-level database operations for common use cases
 * Provides simplified interface for application logic
 */

import mongoose from 'mongoose'
import { DatabaseModels } from './schemas'
import { dbUtils, safeFind, safeCreate, safeUpdate, safeDelete } from './database-utils'
import { OptimizedQueries } from './database-performance'

// User operations
class UserAPI {
  /**
   * Create a new user with validation
   */
  static async createUser(userData: any) {
    return safeCreate(DatabaseModels.User, userData, {
      eventType: 'user.create',
      actorType: 'system'
    })
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    return safeFind(DatabaseModels.User, { email: email.toLowerCase() })
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: any) {
    return safeUpdate(
      DatabaseModels.User,
      { _id: userId },
      updates,
      {},
      {
        eventType: 'user.update',
        actorType: 'user',
        userId
      }
    )
  }

  /**
   * Get user shopping analytics
   */
  static async getUserAnalytics(userId: string) {
    const builder = OptimizedQueries.getUserShoppingAnalytics(userId)
    return builder.execute(DatabaseModels.User)
  }

  /**
   * Apply for creator program
   */
  static async applyForCreatorProgram(userId: string, applicationData: any) {
    const updates = {
      role: 'creator',
      creatorProfile: {
        status: 'pending',
        referralCode: this.generateReferralCode(),
        ...applicationData,
        applicationDate: new Date()
      }
    }

    return safeUpdate(
      DatabaseModels.User,
      { _id: userId },
      updates,
      {},
      {
        eventType: 'creator.apply',
        actorType: 'user',
        userId
      }
    )
  }

  private static generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }
}

// Product operations
class ProductAPI {
  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8) {
    return safeFind(DatabaseModels.Product, {
      'metadata.featured': true,
      'metadata.status': 'active',
      'inventory.available': { $gt: 0 }
    }, { limit, sort: { 'analytics.views': -1 } })
  }

  /**
   * Search products with filters
   */
  static async searchProducts(searchParams: any) {
    return dbUtils.advancedSearch(DatabaseModels.Product, searchParams)
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string) {
    return safeFind(DatabaseModels.Product, { 'seo.slug': slug })
  }

  /**
   * Update product analytics (views, etc.)
   */
  static async updateProductAnalytics(productId: string, analytics: any) {
    return safeUpdate(
      DatabaseModels.Product,
      { _id: productId },
      { $inc: analytics },
      {},
      {
        eventType: 'product.view',
        actorType: 'user'
      }
    )
  }

  /**
   * Get product analytics
   */
  static async getProductAnalytics(productIds?: string[]) {
    const builder = OptimizedQueries.getProductAnalytics({
      productIds,
      includeReviews: true
    })
    return builder.execute(DatabaseModels.Product)
  }
}

// Cart operations
class CartAPI {
  /**
   * Get user's cart
   */
  static async getUserCart(userId: string) {
    const result = await safeFind(DatabaseModels.Cart, { userId, isActive: true })
    
    if (result.success && result.data?.length) {
      return { success: true, data: result.data[0] }
    }
    
    // Create new cart if none exists
    return safeCreate(DatabaseModels.Cart, {
      userId,
      items: [],
      isActive: true
    })
  }

  /**
   * Add item to cart
   */
  static async addToCart(userId: string, productId: string, quantity: number, customizations?: any) {
    const cartResult = await this.getUserCart(userId)
    
    if (!cartResult.success) {
      return cartResult
    }

    const cart = cartResult.data
    
    try {
      await cart.addItem(productId, quantity, customizations)
      
      await dbUtils.logAuditEvent({
        eventType: 'cart.add_item',
        action: 'Added item to cart',
        actorType: 'user',
        userId,
        targetType: 'cart',
        targetId: cart._id.toString(),
        details: { productId, quantity, customizations }
      })

      return { success: true, data: cart }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item to cart'
      }
    }
  }

  /**
   * Convert cart to order
   */
  static async convertToOrder(userId: string, orderData: any) {
    return dbUtils.executeTransaction(async (context) => {
      const cart = await DatabaseModels.Cart.findOne({ userId, isActive: true }).session(context.session)
      
      if (!cart || cart.items.length === 0) {
        throw new Error('No active cart found')
      }

      const orderItems = await cart.convertToOrder(userId)
      
      const order = await DatabaseModels.Order.create([{
        ...orderItems,
        ...orderData,
        status: 'pending',
        paymentStatus: 'pending'
      }], { session: context.session })

      await cart.clearCart()

      return order[0]
    }, {
      eventType: 'order.create',
      actorType: 'user',
      userId
    })
  }
}

// Order operations
class OrderAPI {
  /**
   * Create new order
   */
  static async createOrder(orderData: any) {
    return safeCreate(DatabaseModels.Order, orderData, {
      eventType: 'order.create',
      actorType: 'user',
      userId: orderData.userId
    })
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: string, updateData?: any) {
    const updates = { status, ...updateData }
    
    return safeUpdate(
      DatabaseModels.Order,
      { _id: orderId },
      updates,
      {},
      {
        eventType: 'order.update',
        actorType: 'system'
      }
    )
  }

  /**
   * Get user orders
   */
  static async getUserOrders(userId: string, limit: number = 20) {
    return safeFind(
      DatabaseModels.Order,
      { userId },
      { 
        limit, 
        sort: { createdAt: -1 },
        populate: 'items.productId'
      }
    )
  }

  /**
   * Process payment
   */
  static async processPayment(orderId: string, paymentData: any) {
    return dbUtils.executeTransaction(async (context) => {
      const order = await DatabaseModels.Order.findById(orderId).session(context.session)
      
      if (!order) {
        throw new Error('Order not found')
      }

      // Update payment information
      order.payment = {
        ...order.payment,
        ...paymentData,
        status: 'completed'
      }
      
      order.paymentStatus = 'completed'
      order.status = 'confirmed'

      await order.save({ session: context.session })

      // Process creator commissions
      if (order.creatorCommissions.length > 0) {
        for (const commission of order.creatorCommissions) {
          await DatabaseModels.Commission.create([{
            creatorId: commission.creatorId,
            orderId: order._id,
            amount: commission.amount,
            rate: commission.rate,
            orderValue: order.total,
            status: 'pending'
          }], { session: context.session })
        }
      }

      return order
    }, {
      eventType: 'order.payment',
      actorType: 'system'
    })
  }
}

// Review operations
class ReviewAPI {
  /**
   * Create product review
   */
  static async createReview(userId: string, productId: string, reviewData: any) {
    // Check if user has purchased this product
    const order = await DatabaseModels.Order.findOne({
      userId,
      'items.productId': productId,
      status: 'delivered'
    })

    const review = {
      ...reviewData,
      userId,
      productId,
      isVerifiedPurchase: !!order,
      verificationStatus: order ? 'verified' : 'unverified',
      status: 'pending'
    }

    return safeCreate(DatabaseModels.Review, review, {
      eventType: 'product.review',
      actorType: 'user',
      userId
    })
  }

  /**
   * Get product reviews
   */
  static async getProductReviews(productId: string, options: any = {}) {
    return safeFind(
      DatabaseModels.Review,
      { productId, status: 'approved' },
      {
        limit: options.limit || 20,
        sort: { helpfulVotes: -1, publishedAt: -1 },
        populate: 'userId'
      }
    )
  }

  /**
   * Vote on review helpfulness
   */
  static async voteOnReview(reviewId: string, userId: string, voteType: 'helpful' | 'unhelpful') {
    const review = await DatabaseModels.Review.findById(reviewId)
    
    if (!review) {
      return { success: false, error: 'Review not found' }
    }

    try {
      if (voteType === 'helpful') {
        await review.markAsHelpful(userId)
      } else {
        await review.markAsUnhelpful(userId)
      }

      return { success: true, data: review }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to vote on review'
      }
    }
  }
}

// Creator operations
class CreatorAPI {
  /**
   * Track referral click
   */
  static async trackReferralClick(referralCode: string, clickData: any) {
    // Find creator by referral code
    const creator = await DatabaseModels.User.findOne({
      'creatorProfile.referralCode': referralCode,
      'creatorProfile.status': 'approved'
    })

    if (!creator) {
      return { success: false, error: 'Invalid referral code' }
    }

    return safeCreate(DatabaseModels.Referral, {
      creatorId: creator._id,
      referralCode,
      ...clickData,
      commissionRate: creator.creatorProfile?.commissionRate || 5
    }, {
      eventType: 'creator.referral',
      actorType: 'user'
    })
  }

  /**
   * Get creator analytics
   */
  static async getCreatorAnalytics(creatorId: string, timeframe: 'week' | 'month' | 'quarter' = 'month') {
    const builder = OptimizedQueries.getCreatorAnalytics(creatorId, timeframe)
    return builder.execute(DatabaseModels.User)
  }

  /**
   * Process commission payment
   */
  static async processCommissionPayment(commissionIds: string[], paymentData: any) {
    return dbUtils.executeTransaction(async (context) => {
      const commissions = await DatabaseModels.Commission.find({
        _id: { $in: commissionIds },
        status: 'payable'
      }).session(context.session)

      for (const commission of commissions) {
        await commission.markAsPaid(paymentData.reference, paymentData.method)
      }

      return commissions
    }, {
      eventType: 'creator.commission_pay',
      actorType: 'admin'
    })
  }
}

// Customization operations
class CustomizationAPI {
  /**
   * Save customization
   */
  static async saveCustomization(userId: string, customizationData: any) {
    return safeCreate(DatabaseModels.Customization, {
      ...customizationData,
      userId,
      status: 'saved'
    }, {
      eventType: 'product.customize',
      actorType: 'user',
      userId
    })
  }

  /**
   * Get user customizations
   */
  static async getUserCustomizations(userId: string) {
    return safeFind(
      DatabaseModels.Customization,
      { userId, status: { $ne: 'archived' } },
      { sort: { lastAccessedAt: -1 } }
    )
  }

  /**
   * Share customization
   */
  static async shareCustomization(customizationId: string, shareData: any) {
    return safeUpdate(
      DatabaseModels.Customization,
      { _id: customizationId },
      {
        isPublic: true,
        sharedWith: shareData.emails?.map((email: string) => ({
          email,
          permission: 'view',
          sharedAt: new Date()
        })) || []
      }
    )
  }
}

// Analytics operations
class AnalyticsAPI {
  /**
   * Get dashboard analytics
   */
  static async getDashboardAnalytics(dateRange?: { start: Date; end: Date }) {
    const results = await Promise.all([
      OptimizedQueries.getProductAnalytics({ dateRange }).execute(DatabaseModels.Product),
      this.getUserMetrics(dateRange),
      this.getOrderMetrics(dateRange),
      this.getCreatorMetrics(dateRange)
    ])

    return {
      success: true,
      data: {
        products: results[0],
        users: results[1],
        orders: results[2],
        creators: results[3]
      }
    }
  }

  private static async getUserMetrics(dateRange?: { start: Date; end: Date }) {
    const match: any = {}
    if (dateRange) {
      match.createdAt = { $gte: dateRange.start, $lte: dateRange.end }
    }

    return DatabaseModels.User.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          customers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
          creators: { $sum: { $cond: [{ $eq: ['$role', 'creator'] }, 1, 0] } },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      }
    ])
  }

  private static async getOrderMetrics(dateRange?: { start: Date; end: Date }) {
    const match: any = {}
    if (dateRange) {
      match.createdAt = { $gte: dateRange.start, $lte: dateRange.end }
    }

    return DatabaseModels.Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }
        }
      }
    ])
  }

  private static async getCreatorMetrics(dateRange?: { start: Date; end: Date }) {
    const match: any = {}
    if (dateRange) {
      match.earnedAt = { $gte: dateRange.start, $lte: dateRange.end }
    }

    return DatabaseModels.Commission.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: '$amount' },
          paidCommissions: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
          pendingCommissions: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
          commissionCount: { $sum: 1 }
        }
      }
    ])
  }
}

// Export all APIs
export {
  UserAPI,
  ProductAPI,
  CartAPI,
  OrderAPI,
  ReviewAPI,
  CreatorAPI,
  CustomizationAPI,
  AnalyticsAPI
}