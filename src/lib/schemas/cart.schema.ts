/**
 * Shopping Cart Mongoose Schema
 * Handles shopping cart functionality with product customization support
 * Includes automatic cart cleanup and inventory reservation
 */

import mongoose, { Schema, Document } from 'mongoose'

// Cart item interface
export interface CartItem {
  productId: string
  productName: string
  productImage: string
  productSKU: string
  quantity: number
  unitPrice: number
  totalPrice: number
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
  reservedUntil?: Date // Inventory reservation expiry
}

// Extend Cart interface with Mongoose Document
export interface CartDocument extends Document {
  userId?: string // Optional for guest carts
  sessionId?: string // For guest users
  items: CartItem[]
  subtotal: number
  estimatedTax: number
  estimatedShipping: number
  estimatedTotal: number
  currency: string
  
  // Cart metadata
  lastUpdated: Date
  expiresAt: Date
  isActive: boolean
  
  // Shipping preferences for calculation
  shippingAddress?: {
    country: string
    state: string
    postalCode: string
  }
  
  // Discount codes applied
  discountCodes: {
    code: string
    discount: number
    type: 'percentage' | 'fixed'
  }[]
  
  // Cart methods
  addItem(productId: string, quantity: number, customizations?: any): Promise<void>
  updateItem(productId: string, quantity: number, customizations?: any): Promise<void>
  removeItem(productId: string, customizations?: any): Promise<void>
  clearCart(): Promise<void>
  calculateTotals(): Promise<void>
  validateItems(): Promise<boolean>
  reserveInventory(): Promise<boolean>
  releaseReservations(): Promise<void>
  convertToOrder(userId: string): Promise<any>
}

// Cart item subdocument schema
const cartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10 // Reasonable limit for jewelry
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
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
  reservedUntil: Date
}, { _id: false })

// Discount code subdocument schema
const discountCodeSchema = new Schema({
  code: {
    type: String,
    required: true,
    uppercase: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  }
}, { _id: false })

// Shipping address subdocument schema for tax/shipping calculation
const shippingAddressSchema = new Schema({
  country: {
    type: String,
    required: true,
    length: 2,
    uppercase: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  }
}, { _id: false })

// Main Cart schema
const cartSchema = new Schema<CartDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Allow null for guest carts
  },
  sessionId: {
    type: String,
    sparse: true // For guest users
  },
  items: {
    type: [cartItemSchema],
    default: []
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedTax: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedShipping: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expireAfterSeconds: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  shippingAddress: shippingAddressSchema,
  discountCodes: [discountCodeSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance optimization
cartSchema.index({ userId: 1 }, { sparse: true })
cartSchema.index({ sessionId: 1 }, { sparse: true })
cartSchema.index({ isActive: 1, lastUpdated: -1 })
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
cartSchema.index({ 'items.productId': 1 })

// Ensure either userId or sessionId is present
cartSchema.index({ userId: 1, sessionId: 1 }, { 
  partialFilterExpression: {
    $or: [
      { userId: { $exists: true } },
      { sessionId: { $exists: true } }
    ]
  }
})

// Pre-save middleware to update lastUpdated
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date()
  next()
})

// Pre-save middleware to calculate totals
cartSchema.pre('save', async function(next) {
  if (this.isModified('items') || this.isModified('discountCodes')) {
    await this.calculateTotals()
  }
  next()
})

// Instance methods
cartSchema.methods.addItem = async function(
  productId: string, 
  quantity: number, 
  customizations?: any
): Promise<void> {
  // Check if item with same customizations already exists
  const existingItemIndex = this.items.findIndex((item: CartItem) => {
    return item.productId.toString() === productId && 
           JSON.stringify(item.customizations) === JSON.stringify(customizations)
  })
  
  if (existingItemIndex >= 0) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity
    this.items[existingItemIndex].totalPrice = 
      this.items[existingItemIndex].unitPrice * this.items[existingItemIndex].quantity
  } else {
    // Get product details to populate cart item
    const ProductModel = mongoose.model('Product')
    const product = await ProductModel.findById(productId)
    
    if (!product) {
      throw new Error('Product not found')
    }
    
    // Calculate price with customizations
    const unitPrice = product.calculatePrice(customizations)
    const variantSKU = product.getVariantSKU(customizations || {})
    
    // Add new item
    this.items.push({
      productId,
      productName: product.name,
      productImage: product.media.thumbnail,
      productSKU: product.inventory.sku,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
      customizations,
      variantSKU,
      addedAt: new Date()
    })
  }
  
  await this.save()
}

cartSchema.methods.updateItem = async function(
  productId: string, 
  quantity: number, 
  customizations?: any
): Promise<void> {
  const itemIndex = this.items.findIndex((item: CartItem) => {
    return item.productId.toString() === productId && 
           JSON.stringify(item.customizations) === JSON.stringify(customizations)
  })
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart')
  }
  
  if (quantity <= 0) {
    this.items.splice(itemIndex, 1)
  } else {
    this.items[itemIndex].quantity = quantity
    this.items[itemIndex].totalPrice = this.items[itemIndex].unitPrice * quantity
  }
  
  await this.save()
}

cartSchema.methods.removeItem = async function(
  productId: string, 
  customizations?: any
): Promise<void> {
  const itemIndex = this.items.findIndex((item: CartItem) => {
    return item.productId.toString() === productId && 
           JSON.stringify(item.customizations) === JSON.stringify(customizations)
  })
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart')
  }
  
  this.items.splice(itemIndex, 1)
  await this.save()
}

cartSchema.methods.clearCart = async function(): Promise<void> {
  await this.releaseReservations()
  this.items = []
  this.discountCodes = []
  await this.save()
}

cartSchema.methods.calculateTotals = async function(): Promise<void> {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum: number, item: CartItem) => {
    return sum + item.totalPrice
  }, 0)
  
  // Apply discount codes
  let totalDiscount = 0
  this.discountCodes.forEach(discount => {
    if (discount.type === 'percentage') {
      totalDiscount += this.subtotal * (discount.discount / 100)
    } else {
      totalDiscount += discount.discount
    }
  })
  
  const discountedSubtotal = Math.max(0, this.subtotal - totalDiscount)
  
  // Calculate estimated tax (simplified - would integrate with tax service)
  this.estimatedTax = discountedSubtotal * 0.08 // 8% example rate
  
  // Calculate estimated shipping (simplified - would integrate with shipping service)
  this.estimatedShipping = discountedSubtotal > 100 ? 0 : 15 // Free shipping over $100
  
  // Calculate estimated total
  this.estimatedTotal = discountedSubtotal + this.estimatedTax + this.estimatedShipping
}

cartSchema.methods.validateItems = async function(): Promise<boolean> {
  const ProductModel = mongoose.model('Product')
  
  for (const item of this.items) {
    const product = await ProductModel.findById(item.productId)
    
    if (!product || !product.isAvailable()) {
      return false
    }
    
    if (product.inventory.available < item.quantity) {
      return false
    }
  }
  
  return true
}

cartSchema.methods.reserveInventory = async function(): Promise<boolean> {
  const ProductModel = mongoose.model('Product')
  const reservationDuration = 15 * 60 * 1000 // 15 minutes
  
  for (const item of this.items) {
    const product = await ProductModel.findById(item.productId)
    
    if (!product) {
      return false
    }
    
    const reserved = await product.reserveInventory(item.quantity)
    if (!reserved) {
      // Rollback previous reservations
      await this.releaseReservations()
      return false
    }
    
    item.reservedUntil = new Date(Date.now() + reservationDuration)
  }
  
  await this.save()
  return true
}

cartSchema.methods.releaseReservations = async function(): Promise<void> {
  const ProductModel = mongoose.model('Product')
  
  for (const item of this.items) {
    if (item.reservedUntil && item.reservedUntil > new Date()) {
      const product = await ProductModel.findById(item.productId)
      if (product) {
        await product.releaseReservedInventory(item.quantity)
      }
    }
    item.reservedUntil = undefined
  }
  
  await this.save()
}

cartSchema.methods.convertToOrder = async function(userId: string): Promise<any> {
  if (this.items.length === 0) {
    throw new Error('Cannot create order from empty cart')
  }
  
  const isValid = await this.validateItems()
  if (!isValid) {
    throw new Error('Some items are no longer available')
  }
  
  // This would integrate with the order creation process
  // Return order data structure that can be used to create an order
  return {
    userId,
    items: this.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productSKU: item.productSKU,
      productImage: item.productImage,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      customizations: item.customizations,
      variantSKU: item.variantSKU
    })),
    subtotal: this.subtotal,
    estimatedTax: this.estimatedTax,
    estimatedShipping: this.estimatedShipping,
    total: this.estimatedTotal,
    discountCodes: this.discountCodes
  }
}

// Static methods
cartSchema.statics.findByUser = function(userId: string) {
  return this.findOne({ userId, isActive: true })
}

cartSchema.statics.findBySession = function(sessionId: string) {
  return this.findOne({ sessionId, isActive: true })
}

cartSchema.statics.mergeGuestCart = async function(guestSessionId: string, userId: string) {
  const guestCart = await this.findBySession(guestSessionId)
  if (!guestCart) return null
  
  let userCart = await this.findByUser(userId)
  
  if (!userCart) {
    // Convert guest cart to user cart
    guestCart.userId = userId
    guestCart.sessionId = undefined
    return await guestCart.save()
  } else {
    // Merge guest cart items into user cart
    for (const item of guestCart.items) {
      await userCart.addItem(
        item.productId.toString(),
        item.quantity,
        item.customizations
      )
    }
    
    // Mark guest cart as inactive
    guestCart.isActive = false
    await guestCart.save()
    
    return userCart
  }
}

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
})

// Virtual for has reserved items
cartSchema.virtual('hasReservedItems').get(function() {
  return this.items.some((item: CartItem) => 
    item.reservedUntil && item.reservedUntil > new Date()
  )
})

// Export the model
export const CartModel = mongoose.models.Cart || mongoose.model<CartDocument>('Cart', cartSchema)