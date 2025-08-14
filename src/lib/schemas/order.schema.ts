/**
 * Order Mongoose Schema
 * Complete order management with payment tracking, shipping, and order history
 * Supports creator commissions and detailed order analytics
 */

import mongoose, { Schema, Document } from 'mongoose'

// Order status types
export type OrderStatus = 
  | 'pending'           // Order created, awaiting payment
  | 'payment-failed'    // Payment processing failed
  | 'confirmed'         // Payment confirmed, order processing
  | 'processing'        // Order being prepared/manufactured
  | 'shipped'           // Order shipped to customer
  | 'delivered'         // Order delivered successfully
  | 'cancelled'         // Order cancelled (before shipping)
  | 'refunded'          // Order refunded
  | 'returned'          // Order returned by customer

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially-refunded'

export type ShippingStatus = 
  | 'pending'
  | 'preparing'
  | 'shipped'
  | 'in-transit'
  | 'delivered'
  | 'failed'

// Order item interface
export interface OrderItem {
  productId: string
  productName: string
  productSKU: string
  productImage: string
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
  creator?: {
    creatorId: string
    commissionRate: number
    commissionAmount: number
  }
}

// Shipping address interface
export interface ShippingAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

// Payment details interface
export interface PaymentDetails {
  method: 'stripe' | 'paypal' | 'apple-pay' | 'google-pay'
  transactionId: string
  stripePaymentIntentId?: string
  paypalOrderId?: string
  last4?: string
  brand?: string
  status: PaymentStatus
  amount: number
  currency: string
  fees?: {
    processing: number
    platform: number
  }
  refunds?: {
    id: string
    amount: number
    reason: string
    createdAt: Date
  }[]
}

// Shipping details interface
export interface ShippingDetails {
  method: string
  carrier: string
  service: string
  cost: number
  estimatedDelivery: Date
  trackingNumber?: string
  trackingUrl?: string
  status: ShippingStatus
  shippedAt?: Date
  deliveredAt?: Date
}

// Order timeline event
export interface OrderTimelineEvent {
  status: OrderStatus | ShippingStatus | PaymentStatus
  message: string
  createdAt: Date
  metadata?: any
}

// Extend Order interface with Mongoose Document
export interface OrderDocument extends Document {
  orderNumber: string
  userId: string
  email: string
  
  // Order items and pricing
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  currency: string
  
  // Status tracking
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingStatus: ShippingStatus
  
  // Address information
  shippingAddress: ShippingAddress
  billingAddress: ShippingAddress
  
  // Payment and shipping details
  payment: PaymentDetails
  shipping: ShippingDetails
  
  // Creator commissions
  creatorCommissions: {
    creatorId: string
    amount: number
    rate: number
    status: 'pending' | 'paid' | 'cancelled'
    paidAt?: Date
  }[]
  
  // Discount and promotion codes
  discountCode?: string
  promotionDetails?: {
    code: string
    type: 'percentage' | 'fixed'
    value: number
    description: string
  }
  
  // Order notes and special instructions
  notes?: string
  specialInstructions?: string
  
  // Timeline and audit trail
  timeline: OrderTimelineEvent[]
  
  // GDPR and data retention
  gdprDataRetained: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  cancelledAt?: Date
  
  // Methods
  addTimelineEvent(status: string, message: string, metadata?: any): void
  calculateCreatorCommissions(): void
  canBeCancelled(): boolean
  canBeRefunded(): boolean
  generateOrderNumber(): string
}

// Order item subdocument schema
const orderItemSchema = new Schema({
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
  productSKU: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
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
  creator: {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    commissionRate: {
      type: Number,
      min: 0,
      max: 50
    },
    commissionAmount: {
      type: Number,
      min: 0
    }
  }
}, { _id: false })

// Shipping address subdocument schema
const shippingAddressSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address1: {
    type: String,
    required: true,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    length: 2,
    uppercase: true
  },
  phone: {
    type: String,
    trim: true
  }
}, { _id: false })

// Payment details subdocument schema
const paymentDetailsSchema = new Schema({
  method: {
    type: String,
    enum: ['stripe', 'paypal', 'apple-pay', 'google-pay'],
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  stripePaymentIntentId: String,
  paypalOrderId: String,
  last4: String,
  brand: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially-refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  fees: {
    processing: { type: Number, default: 0 },
    platform: { type: Number, default: 0 }
  },
  refunds: [{
    id: String,
    amount: Number,
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { _id: false })

// Shipping details subdocument schema
const shippingDetailsSchema = new Schema({
  method: {
    type: String,
    required: true
  },
  carrier: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDelivery: {
    type: Date,
    required: true
  },
  trackingNumber: String,
  trackingUrl: String,
  status: {
    type: String,
    enum: ['pending', 'preparing', 'shipped', 'in-transit', 'delivered', 'failed'],
    default: 'pending'
  },
  shippedAt: Date,
  deliveredAt: Date
}, { _id: false })

// Timeline event subdocument schema
const timelineEventSchema = new Schema({
  status: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false })

// Creator commission subdocument schema
const creatorCommissionSchema = new Schema({
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  paidAt: Date
}, { _id: false })

// Main Order schema
const orderSchema = new Schema<OrderDocument>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  
  // Order items and pricing
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items: OrderItem[]) {
        return items.length > 0
      },
      message: 'Order must contain at least one item'
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'payment-failed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially-refunded'],
    default: 'pending'
  },
  shippingStatus: {
    type: String,
    enum: ['pending', 'preparing', 'shipped', 'in-transit', 'delivered', 'failed'],
    default: 'pending'
  },
  
  // Address information
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  billingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  
  // Payment and shipping details
  payment: {
    type: paymentDetailsSchema,
    required: true
  },
  shipping: {
    type: shippingDetailsSchema,
    required: true
  },
  
  // Creator commissions
  creatorCommissions: [creatorCommissionSchema],
  
  // Discount and promotion codes
  discountCode: String,
  promotionDetails: {
    code: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    value: Number,
    description: String
  },
  
  // Order notes and special instructions
  notes: String,
  specialInstructions: String,
  
  // Timeline and audit trail
  timeline: {
    type: [timelineEventSchema],
    default: []
  },
  
  // GDPR and data retention
  gdprDataRetained: {
    type: Boolean,
    default: true
  },
  
  // Completion timestamps
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance optimization
orderSchema.index({ orderNumber: 1 }, { unique: true })
orderSchema.index({ userId: 1, createdAt: -1 })
orderSchema.index({ email: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ paymentStatus: 1 })
orderSchema.index({ shippingStatus: 1 })
orderSchema.index({ 'payment.transactionId': 1 })
orderSchema.index({ 'payment.stripePaymentIntentId': 1 }, { sparse: true })
orderSchema.index({ 'shipping.trackingNumber': 1 }, { sparse: true })
orderSchema.index({ 'creatorCommissions.creatorId': 1 }, { sparse: true })
orderSchema.index({ discountCode: 1 }, { sparse: true })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ completedAt: -1 }, { sparse: true })

// Compound indexes for common queries
orderSchema.index({ userId: 1, status: 1, createdAt: -1 })
orderSchema.index({ status: 1, createdAt: -1 })
orderSchema.index({ paymentStatus: 1, status: 1 })

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = this.generateOrderNumber()
  }
  next()
})

// Pre-save middleware to calculate creator commissions
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.calculateCreatorCommissions()
  }
  next()
})

// Pre-save middleware to add timeline events on status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const statusMessages: Record<OrderStatus, string> = {
      'pending': 'Order created and awaiting payment',
      'payment-failed': 'Payment processing failed',
      'confirmed': 'Payment confirmed, order processing started',
      'processing': 'Order is being prepared',
      'shipped': 'Order has been shipped',
      'delivered': 'Order delivered successfully',
      'cancelled': 'Order has been cancelled',
      'refunded': 'Order has been refunded',
      'returned': 'Order has been returned'
    }
    
    this.addTimelineEvent(this.status, statusMessages[this.status] || `Order status updated to ${this.status}`)
    
    if (this.status === 'delivered') {
      this.completedAt = new Date()
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date()
    }
  }
  next()
})

// Instance methods
orderSchema.methods.addTimelineEvent = function(status: string, message: string, metadata?: any): void {
  this.timeline.push({
    status,
    message,
    metadata,
    createdAt: new Date()
  })
}

orderSchema.methods.calculateCreatorCommissions = function(): void {
  this.creatorCommissions = []
  
  this.items.forEach((item: OrderItem) => {
    if (item.creator?.creatorId) {
      const existingCommission = this.creatorCommissions.find(
        (c: any) => c.creatorId.toString() === item.creator!.creatorId
      )
      
      if (existingCommission) {
        existingCommission.amount += item.creator.commissionAmount
      } else {
        this.creatorCommissions.push({
          creatorId: item.creator.creatorId,
          amount: item.creator.commissionAmount,
          rate: item.creator.commissionRate,
          status: 'pending'
        })
      }
    }
  })
}

orderSchema.methods.canBeCancelled = function(): boolean {
  return ['pending', 'confirmed', 'processing'].includes(this.status)
}

orderSchema.methods.canBeRefunded = function(): boolean {
  return ['delivered', 'shipped'].includes(this.status) && this.paymentStatus === 'completed'
}

orderSchema.methods.generateOrderNumber = function(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GG-${timestamp}-${random}`
}

// Static methods
orderSchema.statics.findByUser = function(userId: string, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('items.productId', 'name media.thumbnail')
}

orderSchema.statics.findByStatus = function(status: OrderStatus) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName email')
}

orderSchema.statics.findPendingCommissions = function(creatorId?: string) {
  const query: any = { 'creatorCommissions.status': 'pending' }
  if (creatorId) {
    query['creatorCommissions.creatorId'] = creatorId
  }
  return this.find(query)
}

// Virtual for order total with commission
orderSchema.virtual('totalWithCommissions').get(function() {
  const commissionTotal = this.creatorCommissions.reduce((sum: number, commission: any) => {
    return sum + commission.amount
  }, 0)
  return this.total + commissionTotal
})

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24))
})

// Export the model
export const OrderModel = mongoose.models.Order || mongoose.model<OrderDocument>('Order', orderSchema)