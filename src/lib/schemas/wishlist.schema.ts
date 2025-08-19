/**
 * Wishlist Mongoose Schema
 * User wishlist functionality with sharing capabilities and price alerts
 * Supports multiple wishlists per user and social sharing features
 */

import mongoose, { Schema, Document } from 'mongoose'

// Wishlist item interface
export interface WishlistItem {
  productId: string
  productName: string
  productImage: string
  productSKU: string
  currentPrice: number
  originalPrice?: number
  customizations?: {
    material?: string
    gemstone?: string
    size?: string
    engraving?: {
      text: string
      font: string
      position: string
    }
    personalizations?: any
  }
  variantSKU?: string
  addedAt: Date
  priceAlert?: {
    enabled: boolean
    targetPrice: number
    notified: boolean
  }
  notes?: string
}

// Extend Wishlist interface with Mongoose Document
export interface WishlistDocument extends Document {
  userId: string
  name: string
  description?: string
  items: WishlistItem[]
  
  // Sharing and privacy
  isPublic: boolean
  shareUrl?: string
  sharedWith: {
    email: string
    sharedAt: Date
    canEdit: boolean
  }[]
  
  // Metadata
  totalValue: number
  itemCount: number
  createdAt: Date
  updatedAt: Date
  lastViewedAt: Date
  
  // Methods
  addItem(productId: string, customizations?: any, notes?: string): Promise<void>
  removeItem(productId: string, customizations?: any): Promise<void>
  updateItem(productId: string, customizations: any, updates: any): Promise<void>
  moveToCart(productId: string, customizations?: any): Promise<boolean>
  shareWithEmail(email: string, canEdit?: boolean): Promise<void>
  generateShareUrl(): string
  updatePrices(): Promise<void>
  checkPriceAlerts(): Promise<WishlistItem[]>
}

// Wishlist item subdocument schema
const wishlistItemSchema = new Schema({
  productId: {
    type: String, // Support both ObjectId and string IDs
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productImage: {
    type: String,
    required: true
  },
  productSKU: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  customizations: {
    material: String,
    gemstone: String,
    size: String,
    engraving: {
      text: String,
      font: String,
      position: String
    },
    personalizations: Schema.Types.Mixed
  },
  variantSKU: String,
  addedAt: {
    type: Date,
    default: Date.now
  },
  priceAlert: {
    enabled: { type: Boolean, default: false },
    targetPrice: { type: Number, min: 0 },
    notified: { type: Boolean, default: false }
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { _id: false })

// Shared with subdocument schema
const sharedWithSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      },
      message: 'Invalid email format'
    }
  },
  sharedAt: {
    type: Date,
    default: Date.now
  },
  canEdit: {
    type: Boolean,
    default: false
  }
}, { _id: false })

// Main Wishlist schema
const wishlistSchema = new Schema<WishlistDocument>({
  userId: {
    type: String, // Support both ObjectId and guest string IDs
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'My Wishlist'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  items: {
    type: [wishlistItemSchema],
    default: []
  },
  
  // Sharing and privacy
  isPublic: {
    type: Boolean,
    default: false
  },
  shareUrl: {
    type: String,
    sparse: true
  },
  sharedWith: [sharedWithSchema],
  
  // Calculated fields
  totalValue: {
    type: Number,
    default: 0,
    min: 0
  },
  itemCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastViewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance optimization
wishlistSchema.index({ userId: 1, createdAt: -1 })
wishlistSchema.index({ shareUrl: 1 }, { sparse: true })
wishlistSchema.index({ isPublic: 1, createdAt: -1 })
wishlistSchema.index({ 'items.productId': 1 })
wishlistSchema.index({ 'items.priceAlert.enabled': 1, 'items.priceAlert.notified': 1 })
wishlistSchema.index({ 'sharedWith.email': 1 })

// Compound indexes for common queries
wishlistSchema.index({ userId: 1, name: 1 })
wishlistSchema.index({ isPublic: 1, lastViewedAt: -1 })

// Pre-save middleware to calculate totals
wishlistSchema.pre('save', function(next) {
  this.itemCount = this.items.length
  this.totalValue = this.items.reduce((sum: number, item: WishlistItem) => {
    return sum + item.currentPrice
  }, 0)
  next()
})

// Pre-save middleware to generate share URL if public
wishlistSchema.pre('save', function(next) {
  if (this.isPublic && !this.shareUrl) {
    this.shareUrl = this.generateShareUrl()
  } else if (!this.isPublic && this.shareUrl) {
    this.shareUrl = undefined
  }
  next()
})

// Instance methods
wishlistSchema.methods.addItem = async function(
  productId: string, 
  customizations?: any, 
  notes?: string
): Promise<void> {
  // Check if item with same customizations already exists
  const existingItem = this.items.find((item: WishlistItem) => {
    return item.productId.toString() === productId && 
           JSON.stringify(item.customizations) === JSON.stringify(customizations)
  })
  
  if (existingItem) {
    throw new Error('Item already exists in wishlist')
  }
  
  // Add new item with basic info (will be enriched later)
  this.items.push({
    productId,
    productName: `Product ${productId}`,
    productImage: '/images/placeholder-product.jpg',
    productSKU: `SKU_${productId}`,
    currentPrice: 0, // Will be updated when product is fetched
    customizations,
    addedAt: new Date(),
    notes
  })
  
  await this.save()
}

wishlistSchema.methods.removeItem = async function(
  productId: string, 
  customizations?: any
): Promise<void> {
  const itemIndex = this.items.findIndex((item: WishlistItem) => {
    return item.productId.toString() === productId && 
           JSON.stringify(item.customizations) === JSON.stringify(customizations)
  })
  
  if (itemIndex === -1) {
    throw new Error('Item not found in wishlist')
  }
  
  this.items.splice(itemIndex, 1)
  await this.save()
}

wishlistSchema.methods.updateItem = async function(
  productId: string, 
  customizations: any, 
  updates: any
): Promise<void> {
  const itemIndex = this.items.findIndex((item: WishlistItem) => {
    return item.productId.toString() === productId && 
           JSON.stringify(item.customizations) === JSON.stringify(customizations)
  })
  
  if (itemIndex === -1) {
    throw new Error('Item not found in wishlist')
  }
  
  // Update allowed fields
  if (updates.notes !== undefined) {
    this.items[itemIndex].notes = updates.notes
  }
  
  if (updates.priceAlert !== undefined) {
    this.items[itemIndex].priceAlert = {
      ...this.items[itemIndex].priceAlert,
      ...updates.priceAlert
    }
  }
  
  await this.save()
}

wishlistSchema.methods.moveToCart = async function(
  productId: string, 
  customizations?: any
): Promise<boolean> {
  const itemIndex = this.items.findIndex((item: WishlistItem) => {
    return item.productId.toString() === productId && 
           JSON.stringify(item.customizations) === JSON.stringify(customizations)
  })
  
  if (itemIndex === -1) {
    return false
  }
  
  try {
    // Get user's cart
    const CartModel = mongoose.model('Cart')
    let cart = await CartModel.findByUser(this.userId.toString())
    
    if (!cart) {
      // Create new cart if none exists
      cart = new CartModel({
        userId: this.userId,
        items: []
      })
    }
    
    const item = this.items[itemIndex]
    
    // Add item to cart
    await cart.addItem(
      item.productId.toString(),
      1, // Default quantity
      item.customizations
    )
    
    // Remove from wishlist
    this.items.splice(itemIndex, 1)
    await this.save()
    
    return true
  } catch (error) {
    console.error('Error moving item to cart:', error)
    return false
  }
}

wishlistSchema.methods.shareWithEmail = async function(
  email: string, 
  canEdit: boolean = false
): Promise<void> {
  // Check if already shared with this email
  const existingShare = this.sharedWith.find(share => share.email === email)
  
  if (existingShare) {
    existingShare.canEdit = canEdit
    existingShare.sharedAt = new Date()
  } else {
    this.sharedWith.push({
      email,
      canEdit,
      sharedAt: new Date()
    })
  }
  
  await this.save()
}

wishlistSchema.methods.generateShareUrl = function(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `wl_${timestamp}_${random}`
}

wishlistSchema.methods.updatePrices = async function(): Promise<void> {
  const ProductModel = mongoose.model('Product')
  let hasChanges = false
  
  for (const item of this.items) {
    const product = await ProductModel.findById(item.productId)
    
    if (product) {
      const newPrice = product.calculatePrice(item.customizations)
      
      if (newPrice !== item.currentPrice) {
        item.currentPrice = newPrice
        hasChanges = true
        
        // Reset price alert notification if price changed
        if (item.priceAlert?.enabled) {
          item.priceAlert.notified = false
        }
      }
    }
  }
  
  if (hasChanges) {
    await this.save()
  }
}

wishlistSchema.methods.checkPriceAlerts = async function(): Promise<WishlistItem[]> {
  const alertItems: WishlistItem[] = []
  
  for (const item of this.items) {
    if (item.priceAlert?.enabled && 
        !item.priceAlert.notified && 
        item.currentPrice <= item.priceAlert.targetPrice) {
      alertItems.push(item)
      item.priceAlert.notified = true
    }
  }
  
  if (alertItems.length > 0) {
    await this.save()
  }
  
  return alertItems
}

// Static methods
wishlistSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

wishlistSchema.statics.findByShareUrl = function(shareUrl: string) {
  return this.findOne({ shareUrl, isPublic: true })
}

wishlistSchema.statics.findPublicWishlists = function(limit = 20) {
  return this.find({ isPublic: true })
    .sort({ lastViewedAt: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName displayName profileImage')
}

wishlistSchema.statics.findWishlistsWithPriceAlerts = function() {
  return this.find({
    'items.priceAlert.enabled': true,
    'items.priceAlert.notified': false
  })
}

// Virtual for average item price
wishlistSchema.virtual('averageItemPrice').get(function() {
  if (this.itemCount === 0) return 0
  return this.totalValue / this.itemCount
})

// Virtual for items on sale
wishlistSchema.virtual('itemsOnSale').get(function() {
  return this.items.filter((item: WishlistItem) => 
    item.originalPrice && item.currentPrice < item.originalPrice
  )
})

// Virtual for price alert count
wishlistSchema.virtual('priceAlertCount').get(function() {
  return this.items.filter((item: WishlistItem) => 
    item.priceAlert?.enabled
  ).length
})

// Export the model
export const WishlistModel = mongoose.models.Wishlist || mongoose.model<WishlistDocument>('Wishlist', wishlistSchema)