/**
 * Creator Referral and Commission Tracking Schemas
 * Comprehensive system for managing creator program referrals and commissions
 * Includes analytics, payment tracking, and fraud prevention
 */

import mongoose, { Schema, Document } from 'mongoose'

// Referral status types
export type ReferralStatus = 
  | 'pending'     // Click registered, no action yet
  | 'converted'   // Purchase made
  | 'cancelled'   // Order cancelled/refunded
  | 'expired'     // Referral window expired
  | 'fraud'       // Flagged as fraudulent

export type CommissionStatus = 
  | 'pending'     // Commission earned but not yet payable
  | 'payable'     // Ready for payment
  | 'paid'        // Commission paid out
  | 'cancelled'   // Commission cancelled (refund, etc.)
  | 'disputed'    // Under dispute/review

// Referral interface
export interface ReferralDocument extends Document {
  creatorId: string
  referralCode: string
  
  // Customer information
  customerId?: string // If customer registers/purchases
  customerEmail?: string
  customerIPAddress: string
  customerUserAgent: string
  
  // Referral tracking
  clickedAt: Date
  convertedAt?: Date
  orderNumber?: string
  orderId?: string
  
  // Status and fraud detection
  status: ReferralStatus
  fraudScore: number // 0-100, higher = more suspicious
  fraudReasons: string[]
  
  // Financial data
  orderValue?: number
  commissionRate: number
  commissionAmount?: number
  currency: string
  
  // Attribution tracking
  source: string // 'social', 'email', 'website', etc.
  campaign?: string
  medium?: string
  utmParameters?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
  
  // Geographic data
  country?: string
  region?: string
  city?: string
  
  // Device information
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  platform?: string
  
  // Timestamps
  expiresAt: Date // 30-day attribution window
  createdAt: Date
  updatedAt: Date
  
  // Methods
  markAsConverted(orderId: string, orderValue: number): Promise<void>
  calculateCommission(): number
  checkForFraud(): Promise<number>
  isExpired(): boolean
}

// Commission interface  
export interface CommissionDocument extends Document {
  creatorId: string
  referralId?: string
  orderId?: string
  
  // Commission details
  amount: number
  rate: number
  currency: string
  status: CommissionStatus
  
  // Order information
  orderNumber?: string
  orderValue: number
  productIds: string[]
  customerId?: string
  
  // Payment tracking
  paymentBatch?: string
  paidAt?: Date
  paymentMethod?: 'stripe' | 'paypal' | 'bank-transfer'
  paymentReference?: string
  
  // Dispute handling
  disputeReason?: string
  disputedAt?: Date
  resolvedAt?: Date
  
  // Timing
  earnedAt: Date
  payableAt: Date // When commission becomes payable (e.g., 30 days after order)
  expiresAt?: Date // If not claimed within timeframe
  
  // Metadata
  notes?: string
  metadata?: any
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  
  // Methods
  markAsPaid(paymentReference: string, paymentMethod: string): Promise<void>
  dispute(reason: string): Promise<void>
  resolve(): Promise<void>
  isPayable(): boolean
  daysUntilPayable(): number
}

// Creator Analytics interface
export interface CreatorAnalyticsDocument extends Document {
  creatorId: string
  
  // Time period
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: Date
  endDate: Date
  
  // Referral metrics
  totalClicks: number
  uniqueClicks: number
  conversions: number
  conversionRate: number
  
  // Financial metrics
  totalRevenue: number
  commissionEarned: number
  commissionPaid: number
  commissionPending: number
  averageOrderValue: number
  
  // Top performing content
  topSources: {
    source: string
    clicks: number
    conversions: number
    revenue: number
  }[]
  
  topProducts: {
    productId: string
    productName: string
    clicks: number
    conversions: number
    revenue: number
  }[]
  
  // Geographic performance
  topCountries: {
    country: string
    clicks: number
    conversions: number
    revenue: number
  }[]
  
  // Device performance
  deviceBreakdown: {
    desktop: { clicks: number; conversions: number }
    mobile: { clicks: number; conversions: number }
    tablet: { clicks: number; conversions: number }
  }
  
  // Fraud metrics
  fraudulentClicks: number
  fraudScore: number
  
  // Timestamps
  calculatedAt: Date
  createdAt: Date
  updatedAt: Date
}

// Referral schema
const referralSchema = new Schema<ReferralDocument>({
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referralCode: {
    type: String,
    required: true,
    uppercase: true
  },
  
  // Customer information
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  customerEmail: {
    type: String,
    lowercase: true,
    sparse: true
  },
  customerIPAddress: {
    type: String,
    required: true
  },
  customerUserAgent: {
    type: String,
    required: true
  },
  
  // Referral tracking
  clickedAt: {
    type: Date,
    default: Date.now
  },
  convertedAt: Date,
  orderNumber: String,
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    sparse: true
  },
  
  // Status and fraud detection
  status: {
    type: String,
    enum: ['pending', 'converted', 'cancelled', 'expired', 'fraud'],
    default: 'pending'
  },
  fraudScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  fraudReasons: [String],
  
  // Financial data
  orderValue: {
    type: Number,
    min: 0
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
  commissionAmount: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Attribution tracking
  source: {
    type: String,
    required: true,
    default: 'direct'
  },
  campaign: String,
  medium: String,
  utmParameters: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  },
  
  // Geographic data
  country: String,
  region: String,
  city: String,
  
  // Device information
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    required: true
  },
  browser: String,
  platform: String,
  
  // Expiration (30-day attribution window)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
})

// Commission schema
const commissionSchema = new Schema<CommissionDocument>({
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referralId: {
    type: Schema.Types.ObjectId,
    ref: 'Referral',
    sparse: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // Commission details
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
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'payable', 'paid', 'cancelled', 'disputed'],
    default: 'pending'
  },
  
  // Order information
  orderNumber: String,
  orderValue: {
    type: Number,
    required: true,
    min: 0
  },
  productIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Payment tracking
  paymentBatch: String,
  paidAt: Date,
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank-transfer']
  },
  paymentReference: String,
  
  // Dispute handling
  disputeReason: String,
  disputedAt: Date,
  resolvedAt: Date,
  
  // Timing
  earnedAt: {
    type: Date,
    default: Date.now
  },
  payableAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  expiresAt: Date,
  
  // Metadata
  notes: String,
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
})

// Creator Analytics schema
const creatorAnalyticsSchema = new Schema<CreatorAnalyticsDocument>({
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Time period
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Referral metrics
  totalClicks: { type: Number, default: 0 },
  uniqueClicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  
  // Financial metrics
  totalRevenue: { type: Number, default: 0 },
  commissionEarned: { type: Number, default: 0 },
  commissionPaid: { type: Number, default: 0 },
  commissionPending: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  
  // Top performing content
  topSources: [{
    source: String,
    clicks: Number,
    conversions: Number,
    revenue: Number
  }],
  
  topProducts: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    clicks: Number,
    conversions: Number,
    revenue: Number
  }],
  
  // Geographic performance
  topCountries: [{
    country: String,
    clicks: Number,
    conversions: Number,
    revenue: Number
  }],
  
  // Device performance
  deviceBreakdown: {
    desktop: {
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },
    mobile: {
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },
    tablet: {
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    }
  },
  
  // Fraud metrics
  fraudulentClicks: { type: Number, default: 0 },
  fraudScore: { type: Number, default: 0 },
  
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for Referral schema
referralSchema.index({ creatorId: 1, clickedAt: -1 })
referralSchema.index({ referralCode: 1, clickedAt: -1 })
referralSchema.index({ customerId: 1 }, { sparse: true })
referralSchema.index({ customerIPAddress: 1, clickedAt: -1 })
referralSchema.index({ orderId: 1 }, { sparse: true })
referralSchema.index({ status: 1, clickedAt: -1 })
referralSchema.index({ source: 1, status: 1 })
referralSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Compound indexes
referralSchema.index({ creatorId: 1, status: 1, clickedAt: -1 })
referralSchema.index({ status: 1, fraudScore: 1 })

// Indexes for Commission schema
commissionSchema.index({ creatorId: 1, earnedAt: -1 })
commissionSchema.index({ status: 1, payableAt: 1 })
commissionSchema.index({ orderId: 1 })
commissionSchema.index({ paymentBatch: 1 }, { sparse: true })
commissionSchema.index({ paidAt: -1 }, { sparse: true })

// Compound indexes
commissionSchema.index({ creatorId: 1, status: 1, earnedAt: -1 })
commissionSchema.index({ status: 1, payableAt: 1 })

// Indexes for Analytics schema
creatorAnalyticsSchema.index({ creatorId: 1, period: 1, startDate: -1 })
creatorAnalyticsSchema.index({ period: 1, calculatedAt: -1 })

// Referral instance methods
referralSchema.methods.markAsConverted = async function(orderId: string, orderValue: number): Promise<void> {
  this.status = 'converted'
  this.convertedAt = new Date()
  this.orderId = orderId
  this.orderValue = orderValue
  this.commissionAmount = this.calculateCommission()
  
  // Create corresponding commission record
  const CommissionModel = mongoose.model('Commission')
  await new CommissionModel({
    creatorId: this.creatorId,
    referralId: this._id,
    orderId: orderId,
    amount: this.commissionAmount,
    rate: this.commissionRate,
    orderValue: orderValue,
    currency: this.currency
  }).save()
  
  await this.save()
}

referralSchema.methods.calculateCommission = function(): number {
  if (!this.orderValue) return 0
  return Math.round((this.orderValue * this.commissionRate / 100) * 100) / 100
}

referralSchema.methods.checkForFraud = async function(): Promise<number> {
  let score = 0
  const reasons: string[] = []
  
  // Check for multiple clicks from same IP
  const ipClicks = await mongoose.model('Referral').countDocuments({
    customerIPAddress: this.customerIPAddress,
    clickedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  })
  
  if (ipClicks > 10) {
    score += 30
    reasons.push('Multiple clicks from same IP')
  }
  
  // Check for rapid conversion (too fast to be genuine)
  if (this.convertedAt && this.convertedAt.getTime() - this.clickedAt.getTime() < 60000) {
    score += 40
    reasons.push('Conversion too rapid')
  }
  
  // Check user agent patterns
  if (this.customerUserAgent.includes('bot') || this.customerUserAgent.includes('crawler')) {
    score += 50
    reasons.push('Bot/crawler user agent')
  }
  
  this.fraudScore = Math.min(score, 100)
  this.fraudReasons = reasons
  
  if (this.fraudScore >= 70) {
    this.status = 'fraud'
  }
  
  await this.save()
  return this.fraudScore
}

referralSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date()
}

// Commission instance methods
commissionSchema.methods.markAsPaid = async function(paymentReference: string, paymentMethod: string): Promise<void> {
  this.status = 'paid'
  this.paidAt = new Date()
  this.paymentReference = paymentReference
  this.paymentMethod = paymentMethod
  await this.save()
}

commissionSchema.methods.dispute = async function(reason: string): Promise<void> {
  this.status = 'disputed'
  this.disputeReason = reason
  this.disputedAt = new Date()
  await this.save()
}

commissionSchema.methods.resolve = async function(): Promise<void> {
  this.status = 'payable'
  this.resolvedAt = new Date()
  await this.save()
}

commissionSchema.methods.isPayable = function(): boolean {
  return this.status === 'payable' && this.payableAt <= new Date()
}

commissionSchema.methods.daysUntilPayable = function(): number {
  const diff = this.payableAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

// Static methods
referralSchema.statics.findByCreator = function(creatorId: string, limit = 50) {
  return this.find({ creatorId }).sort({ clickedAt: -1 }).limit(limit)
}

referralSchema.statics.findByReferralCode = function(referralCode: string) {
  return this.find({ referralCode }).sort({ clickedAt: -1 })
}

commissionSchema.statics.findPayableCommissions = function(creatorId?: string) {
  const query: any = { 
    status: 'payable', 
    payableAt: { $lte: new Date() } 
  }
  if (creatorId) query.creatorId = creatorId
  return this.find(query).sort({ earnedAt: 1 })
}

commissionSchema.statics.calculateCreatorEarnings = async function(creatorId: string, startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        creatorId: new mongoose.Types.ObjectId(creatorId),
        earnedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalEarned: { $sum: '$amount' },
        totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
        totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
        totalPayable: { $sum: { $cond: [{ $eq: ['$status', 'payable'] }, '$amount', 0] } },
        commissionCount: { $sum: 1 }
      }
    }
  ])
}

// Export models
export const ReferralModel = mongoose.models.Referral || mongoose.model<ReferralDocument>('Referral', referralSchema)
export const CommissionModel = mongoose.models.Commission || mongoose.model<CommissionDocument>('Commission', commissionSchema)
export const CreatorAnalyticsModel = mongoose.models.CreatorAnalytics || mongoose.model<CreatorAnalyticsDocument>('CreatorAnalytics', creatorAnalyticsSchema)