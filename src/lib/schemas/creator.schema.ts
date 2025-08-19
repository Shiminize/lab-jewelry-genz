/**
 * Creator Referral Schema
 * Database model for content creators and their referral system
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

// Creator Profile Interface
export interface ICreator extends Document {
  _id: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  creatorCode: string
  displayName: string
  email: string
  profileImage?: string
  bio?: string
  socialLinks: {
    instagram?: string
    tiktok?: string
    youtube?: string
    twitter?: string
    website?: string
  }
  commissionRate: number // Percentage (e.g., 10 for 10%)
  minimumPayout: number // Minimum amount before payout
  paymentInfo: {
    method: 'paypal' | 'bank' | 'stripe'
    details: string // Encrypted payment details
  }
  status: 'pending' | 'approved' | 'suspended' | 'inactive'
  metrics: {
    totalClicks: number
    totalSales: number
    totalCommission: number
    conversionRate: number
    lastSaleDate?: Date
  }
  settings: {
    emailNotifications: boolean
    publicProfile: boolean
    allowDirectMessages: boolean
  }
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  suspendedAt?: Date
  notes?: string // Admin notes
}

// Referral Link Interface
export interface IReferralLink extends Document {
  _id: mongoose.Types.ObjectId
  creatorId: mongoose.Types.ObjectId
  linkCode: string
  originalUrl: string
  shortUrl: string
  productId?: mongoose.Types.ObjectId
  customAlias?: string
  title?: string
  description?: string
  isActive: boolean
  clickCount: number
  uniqueClickCount: number
  conversionCount: number
  lastClickedAt?: Date
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

// Referral Click Interface
export interface IReferralClick extends Document {
  _id: mongoose.Types.ObjectId
  linkId: mongoose.Types.ObjectId
  creatorId: mongoose.Types.ObjectId
  ipAddress: string
  userAgent: string
  sessionId?: string
  userId?: mongoose.Types.ObjectId
  referrer?: string
  location?: {
    country?: string
    state?: string
    city?: string
    latitude?: number
    longitude?: number
  }
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet'
    os?: string
    browser?: string
  }
  // UTM Parameters for enhanced tracking
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  // Multi-touch attribution
  touchpointSequence?: number // Order in customer journey (1st, 2nd, 3rd touch)
  attributionWeight?: number // Percentage weight for this touchpoint
  crossDeviceId?: string // Identifier for cross-device tracking
  customerJourneyId?: string // Links multiple touches for same customer
  converted: boolean
  orderId?: mongoose.Types.ObjectId
  conversionValue?: number
  clickedAt: Date
}

// Commission Transaction Interface
export interface ICommissionTransaction extends Document {
  _id: mongoose.Types.ObjectId
  creatorId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  linkId: mongoose.Types.ObjectId
  clickId: mongoose.Types.ObjectId
  commissionRate: number
  orderAmount: number
  commissionAmount: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  type: 'sale' | 'return' | 'adjustment'
  notes?: string
  createdAt: Date
  processedAt?: Date
  paidAt?: Date
}

// Creator Payout Interface
export interface ICreatorPayout extends Document {
  _id: mongoose.Types.ObjectId
  creatorId: mongoose.Types.ObjectId
  amount: number
  currency: string
  transactionIds: mongoose.Types.ObjectId[]
  paymentMethod: string
  paymentDetails: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  payoutDate: Date
  completedAt?: Date
  failureReason?: string
  paymentReference?: string
  createdAt: Date
  updatedAt: Date
}

// Creator Schema
const CreatorSchema = new Schema<ICreator>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, sparse: true },
  creatorCode: { type: String, required: true, uppercase: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  profileImage: { type: String },
  bio: { type: String, maxlength: 500 },
  socialLinks: {
    instagram: { type: String },
    tiktok: { type: String },
    youtube: { type: String },
    twitter: { type: String },
    website: { type: String }
  },
  commissionRate: { type: Number, required: true, min: 0, max: 50, default: 10 },
  minimumPayout: { type: Number, required: true, default: 50 },
  paymentInfo: {
    method: { type: String, enum: ['paypal', 'bank', 'stripe'], required: true },
    details: { type: String, required: true } // Should be encrypted
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'suspended', 'inactive'], 
    default: 'pending' 
  },
  metrics: {
    totalClicks: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastSaleDate: { type: Date }
  },
  settings: {
    emailNotifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  suspendedAt: { type: Date },
  notes: { type: String }
}, {
  timestamps: true
})

// Referral Link Schema
const ReferralLinkSchema = new Schema<IReferralLink>({
  creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  linkCode: { type: String, required: true },
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  customAlias: { type: String },
  title: { type: String },
  description: { type: String, maxlength: 200 },
  isActive: { type: Boolean, default: true },
  clickCount: { type: Number, default: 0 },
  uniqueClickCount: { type: Number, default: 0 },
  conversionCount: { type: Number, default: 0 },
  lastClickedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
}, {
  timestamps: true
})

// Referral Click Schema
const ReferralClickSchema = new Schema<IReferralClick>({
  linkId: { type: Schema.Types.ObjectId, ref: 'ReferralLink', required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  sessionId: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  referrer: { type: String },
  location: {
    country: { type: String },
    state: { type: String },
    city: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  deviceInfo: {
    type: { type: String, enum: ['desktop', 'mobile', 'tablet'], required: true },
    os: { type: String },
    browser: { type: String }
  },
  // UTM Parameters for enhanced tracking
  utmSource: { type: String },
  utmMedium: { type: String },
  utmCampaign: { type: String },
  utmTerm: { type: String },
  utmContent: { type: String },
  // Multi-touch attribution
  touchpointSequence: { type: Number },
  attributionWeight: { type: Number, min: 0, max: 100 },
  crossDeviceId: { type: String },
  customerJourneyId: { type: String },
  converted: { type: Boolean, default: false },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  conversionValue: { type: Number },
  clickedAt: { type: Date, default: Date.now }
})

// Commission Transaction Schema
const CommissionTransactionSchema = new Schema<ICommissionTransaction>({
  creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  linkId: { type: Schema.Types.ObjectId, ref: 'ReferralLink', required: true },
  clickId: { type: Schema.Types.ObjectId, ref: 'ReferralClick', required: true },
  commissionRate: { type: Number, required: true },
  orderAmount: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  type: { type: String, enum: ['sale', 'return', 'adjustment'], default: 'sale' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  paidAt: { type: Date }
})

// Creator Payout Schema
const CreatorPayoutSchema = new Schema<ICreatorPayout>({
  creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  transactionIds: [{ type: Schema.Types.ObjectId, ref: 'CommissionTransaction' }],
  paymentMethod: { type: String, required: true },
  paymentDetails: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  payoutDate: { type: Date, required: true },
  completedAt: { type: Date },
  failureReason: { type: String },
  paymentReference: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Indexes
CreatorSchema.index({ creatorCode: 1 }, { unique: true })
CreatorSchema.index({ userId: 1 }, { unique: true, sparse: true })
CreatorSchema.index({ status: 1 })
CreatorSchema.index({ 'metrics.totalSales': -1 })

ReferralLinkSchema.index({ creatorId: 1 })
ReferralLinkSchema.index({ linkCode: 1 }, { unique: true })
ReferralLinkSchema.index({ shortUrl: 1 }, { unique: true })
ReferralLinkSchema.index({ isActive: 1 })

ReferralClickSchema.index({ linkId: 1 })
ReferralClickSchema.index({ creatorId: 1 })
ReferralClickSchema.index({ sessionId: 1 })
ReferralClickSchema.index({ customerJourneyId: 1 })
ReferralClickSchema.index({ crossDeviceId: 1 })
ReferralClickSchema.index({ utmSource: 1, utmMedium: 1, utmCampaign: 1 })
ReferralClickSchema.index({ touchpointSequence: 1 })
ReferralClickSchema.index({ clickedAt: -1 })
ReferralClickSchema.index({ converted: 1 })

CommissionTransactionSchema.index({ creatorId: 1 })
CommissionTransactionSchema.index({ orderId: 1 })
CommissionTransactionSchema.index({ status: 1 })
CommissionTransactionSchema.index({ createdAt: -1 })

CreatorPayoutSchema.index({ creatorId: 1 })
CreatorPayoutSchema.index({ status: 1 })
CreatorPayoutSchema.index({ payoutDate: -1 })

// Static Methods
CreatorSchema.statics.generateCreatorCode = function(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

ReferralLinkSchema.statics.generateLinkCode = function(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Instance Methods
CreatorSchema.methods.updateMetrics = async function() {
  const clicks = await mongoose.model('ReferralClick').countDocuments({ creatorId: this._id })
  const transactions = await mongoose.model('CommissionTransaction').find({ 
    creatorId: this._id, 
    status: { $in: ['approved', 'paid'] } 
  })
  
  const totalSales = transactions.length
  const totalCommission = transactions.reduce((sum, t) => sum + t.commissionAmount, 0)
  const conversionRate = clicks > 0 ? (totalSales / clicks) * 100 : 0
  
  this.metrics = {
    totalClicks: clicks,
    totalSales,
    totalCommission,
    conversionRate: Math.round(conversionRate * 100) / 100,
    lastSaleDate: transactions.length > 0 ? transactions[transactions.length - 1].createdAt : undefined
  }
  
  return this.save()
}

// Export Models
export const Creator: Model<ICreator> = mongoose.models.Creator || mongoose.model<ICreator>('Creator', CreatorSchema)
export const ReferralLink: Model<IReferralLink> = mongoose.models.ReferralLink || mongoose.model<IReferralLink>('ReferralLink', ReferralLinkSchema)
export const ReferralClick: Model<IReferralClick> = mongoose.models.ReferralClick || mongoose.model<IReferralClick>('ReferralClick', ReferralClickSchema)
export const CommissionTransaction: Model<ICommissionTransaction> = mongoose.models.CommissionTransaction || mongoose.model<ICommissionTransaction>('CommissionTransaction', CommissionTransactionSchema)
export const CreatorPayout: Model<ICreatorPayout> = mongoose.models.CreatorPayout || mongoose.model<ICreatorPayout>('CreatorPayout', CreatorPayoutSchema)