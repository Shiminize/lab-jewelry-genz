/**
 * Review and Rating System Mongoose Schemas
 * Comprehensive review system with moderation, helpfulness voting, and analytics
 * Supports verified purchases, media uploads, and sentiment analysis
 */

import mongoose, { Schema, Document } from 'mongoose'

// Review status types
export type ReviewStatus = 
  | 'pending'     // Awaiting moderation
  | 'approved'    // Approved and visible
  | 'rejected'    // Rejected by moderation
  | 'flagged'     // Flagged for review
  | 'hidden'      // Hidden by admin

export type ReviewSentiment = 'positive' | 'neutral' | 'negative'

// Review interface
export interface ReviewDocument extends Document {
  productId: string
  userId: string
  orderId?: string
  
  // Review content
  rating: number // 1-5 stars
  title: string
  content: string
  pros?: string[]
  cons?: string[]
  
  // Verification and authenticity
  isVerifiedPurchase: boolean
  verificationStatus: 'verified' | 'unverified' | 'suspicious'
  
  // Media attachments
  images: {
    url: string
    thumbnail: string
    alt: string
    uploadedAt: Date
  }[]
  videos?: {
    url: string
    thumbnail: string
    duration: number
    uploadedAt: Date
  }[]
  
  // Review metadata
  status: ReviewStatus
  sentiment: ReviewSentiment
  sentimentScore: number // -1 to 1
  moderationReason?: string
  
  // Interaction metrics
  helpfulVotes: number
  unhelpfulVotes: number
  totalVotes: number
  reportCount: number
  
  // Quality scores
  qualityScore: number // 0-100, based on length, detail, etc.
  authenticityScore: number // 0-100, fraud detection
  
  // Brand response
  brandResponse?: {
    content: string
    respondedAt: Date
    respondedBy: string
    isPublic: boolean
  }
  
  // Moderation history
  moderationHistory: {
    action: string
    reason?: string
    moderatorId: string
    timestamp: Date
  }[]
  
  // User context (at time of review)
  userContext: {
    totalOrders: number
    customerSince: Date
    previousReviews: number
  }
  
  // Product variant reviewed
  productVariant?: {
    material: string
    size: string
    gemstone?: string
    customizations?: any
  }
  
  // Timeline
  submittedAt: Date
  moderatedAt?: Date
  publishedAt?: Date
  
  // Methods
  markAsHelpful(userId: string): Promise<void>
  markAsUnhelpful(userId: string): Promise<void>
  addBrandResponse(content: string, respondedBy: string): Promise<void>
  flagForReview(reason: string, reportedBy: string): Promise<void>
  calculateQualityScore(): number
  analyzeContent(): Promise<void>
}

// Review vote interface
export interface ReviewVoteDocument extends Document {
  reviewId: string
  userId: string
  voteType: 'helpful' | 'unhelpful'
  votedAt: Date
  ipAddress: string
}

// Review report interface
export interface ReviewReportDocument extends Document {
  reviewId: string
  reportedBy: string
  reason: string
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reportedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  resolution?: string
}

// Product rating summary interface
export interface ProductRatingDocument extends Document {
  productId: string
  
  // Overall metrics
  averageRating: number
  totalReviews: number
  totalRatings: number
  
  // Rating distribution
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  
  // Verified vs unverified
  verifiedReviews: number
  verifiedAverageRating: number
  
  // Quality metrics
  averageQualityScore: number
  averageAuthenticityScore: number
  
  // Sentiment analysis
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
  }
  
  // Recent activity
  reviewsLast30Days: number
  ratingTrend: number // Change in average rating over last 30 days
  
  // Last calculation
  lastCalculated: Date
  
  // Methods
  recalculate(): Promise<void>
  addReview(rating: number, isVerified: boolean, sentiment: ReviewSentiment): Promise<void>
  removeReview(rating: number, isVerified: boolean, sentiment: ReviewSentiment): Promise<void>
}

// Review schema
const reviewSchema = new Schema<ReviewDocument>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    sparse: true
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  pros: [String],
  cons: [String],
  
  // Verification and authenticity
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['verified', 'unverified', 'suspicious'],
    default: 'unverified'
  },
  
  // Media attachments
  images: [{
    url: { type: String, required: true },
    thumbnail: { type: String, required: true },
    alt: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  videos: [{
    url: { type: String, required: true },
    thumbnail: { type: String, required: true },
    duration: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Review metadata
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged', 'hidden'],
    default: 'pending'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1,
    default: 0
  },
  moderationReason: String,
  
  // Interaction metrics
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  unhelpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  reportCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Quality scores
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  authenticityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Brand response
  brandResponse: {
    content: String,
    respondedAt: Date,
    respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true }
  },
  
  // Moderation history
  moderationHistory: [{
    action: { type: String, required: true },
    reason: String,
    moderatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // User context
  userContext: {
    totalOrders: { type: Number, default: 0 },
    customerSince: Date,
    previousReviews: { type: Number, default: 0 }
  },
  
  // Product variant reviewed
  productVariant: {
    material: String,
    size: String,
    gemstone: String,
    customizations: Schema.Types.Mixed
  },
  
  // Timeline
  submittedAt: {
    type: Date,
    default: Date.now
  },
  moderatedAt: Date,
  publishedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Review vote schema
const reviewVoteSchema = new Schema<ReviewVoteDocument>({
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voteType: {
    type: String,
    enum: ['helpful', 'unhelpful'],
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

// Review report schema
const reviewReportSchema = new Schema<ReviewReportDocument>({
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other']
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: String
}, {
  timestamps: true
})

// Product rating summary schema
const productRatingSchema = new Schema<ProductRatingDocument>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  
  // Overall metrics
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Rating distribution
  ratingDistribution: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  
  // Verified vs unverified
  verifiedReviews: {
    type: Number,
    default: 0
  },
  verifiedAverageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  // Quality metrics
  averageQualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  averageAuthenticityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Sentiment analysis
  sentimentBreakdown: {
    positive: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    negative: { type: Number, default: 0 }
  },
  
  // Recent activity
  reviewsLast30Days: {
    type: Number,
    default: 0
  },
  ratingTrend: {
    type: Number,
    default: 0
  },
  
  lastCalculated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for Review schema
reviewSchema.index({ productId: 1, status: 1, publishedAt: -1 })
reviewSchema.index({ userId: 1, submittedAt: -1 })
reviewSchema.index({ orderId: 1 }, { sparse: true })
reviewSchema.index({ status: 1, submittedAt: -1 })
reviewSchema.index({ rating: 1, status: 1 })
reviewSchema.index({ isVerifiedPurchase: 1, status: 1 })
reviewSchema.index({ helpfulVotes: -1, status: 1 })
reviewSchema.index({ sentiment: 1, status: 1 })

// Compound indexes
reviewSchema.index({ productId: 1, rating: 1, status: 1 })
reviewSchema.index({ productId: 1, isVerifiedPurchase: 1, status: 1 })
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true }) // One review per user per product

// Indexes for ReviewVote schema
reviewVoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true })
reviewVoteSchema.index({ userId: 1, votedAt: -1 })

// Indexes for ReviewReport schema
reviewReportSchema.index({ reviewId: 1, reportedBy: 1 }, { unique: true })
reviewReportSchema.index({ status: 1, reportedAt: -1 })

// Pre-save middleware for review
reviewSchema.pre('save', async function(next) {
  if (this.isModified('content') || this.isModified('title')) {
    this.qualityScore = this.calculateQualityScore()
    await this.analyzeContent()
  }
  
  if (this.isModified('status') && this.status === 'approved' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  
  next()
})

// Instance methods for Review
reviewSchema.methods.markAsHelpful = async function(userId: string): Promise<void> {
  const ReviewVoteModel = mongoose.model('ReviewVote')
  
  // Check if user already voted
  const existingVote = await ReviewVoteModel.findOne({
    reviewId: this._id,
    userId: userId
  })
  
  if (existingVote) {
    if (existingVote.voteType === 'helpful') {
      return // Already voted helpful
    } else {
      // Change from unhelpful to helpful
      existingVote.voteType = 'helpful'
      await existingVote.save()
      this.helpfulVotes += 1
      this.unhelpfulVotes -= 1
    }
  } else {
    // New helpful vote
    await new ReviewVoteModel({
      reviewId: this._id,
      userId: userId,
      voteType: 'helpful'
    }).save()
    this.helpfulVotes += 1
    this.totalVotes += 1
  }
  
  await this.save()
}

reviewSchema.methods.markAsUnhelpful = async function(userId: string): Promise<void> {
  const ReviewVoteModel = mongoose.model('ReviewVote')
  
  const existingVote = await ReviewVoteModel.findOne({
    reviewId: this._id,
    userId: userId
  })
  
  if (existingVote) {
    if (existingVote.voteType === 'unhelpful') {
      return // Already voted unhelpful
    } else {
      // Change from helpful to unhelpful
      existingVote.voteType = 'unhelpful'
      await existingVote.save()
      this.unhelpfulVotes += 1
      this.helpfulVotes -= 1
    }
  } else {
    // New unhelpful vote
    await new ReviewVoteModel({
      reviewId: this._id,
      userId: userId,
      voteType: 'unhelpful'
    }).save()
    this.unhelpfulVotes += 1
    this.totalVotes += 1
  }
  
  await this.save()
}

reviewSchema.methods.addBrandResponse = async function(content: string, respondedBy: string): Promise<void> {
  this.brandResponse = {
    content,
    respondedAt: new Date(),
    respondedBy,
    isPublic: true
  }
  await this.save()
}

reviewSchema.methods.flagForReview = async function(reason: string, reportedBy: string): Promise<void> {
  this.reportCount += 1
  
  if (this.reportCount >= 3) {
    this.status = 'flagged'
  }
  
  // Create report record
  const ReviewReportModel = mongoose.model('ReviewReport')
  await new ReviewReportModel({
    reviewId: this._id,
    reportedBy,
    reason
  }).save()
  
  await this.save()
}

reviewSchema.methods.calculateQualityScore = function(): number {
  let score = 0
  
  // Content length (0-30 points)
  const contentLength = this.content.length
  if (contentLength >= 100) score += 30
  else if (contentLength >= 50) score += 20
  else if (contentLength >= 20) score += 10
  
  // Title quality (0-10 points)
  if (this.title.length >= 10) score += 10
  else if (this.title.length >= 5) score += 5
  
  // Has pros/cons (0-20 points)
  if (this.pros && this.pros.length > 0) score += 10
  if (this.cons && this.cons.length > 0) score += 10
  
  // Has media (0-20 points)
  if (this.images && this.images.length > 0) score += 15
  if (this.videos && this.videos.length > 0) score += 5
  
  // Verified purchase (0-20 points)
  if (this.isVerifiedPurchase) score += 20
  
  return Math.min(score, 100)
}

reviewSchema.methods.analyzeContent = async function(): Promise<void> {
  // Simple sentiment analysis (in production, would use proper NLP service)
  const content = (this.title + ' ' + this.content).toLowerCase()
  
  const positiveWords = ['love', 'amazing', 'beautiful', 'perfect', 'excellent', 'great', 'wonderful']
  const negativeWords = ['hate', 'terrible', 'awful', 'bad', 'poor', 'horrible', 'worst']
  
  let positiveCount = 0
  let negativeCount = 0
  
  positiveWords.forEach(word => {
    if (content.includes(word)) positiveCount++
  })
  
  negativeWords.forEach(word => {
    if (content.includes(word)) negativeCount++
  })
  
  if (positiveCount > negativeCount) {
    this.sentiment = 'positive'
    this.sentimentScore = Math.min(1, positiveCount / 10)
  } else if (negativeCount > positiveCount) {
    this.sentiment = 'negative'
    this.sentimentScore = Math.max(-1, -negativeCount / 10)
  } else {
    this.sentiment = 'neutral'
    this.sentimentScore = 0
  }
}

// Product rating methods
productRatingSchema.methods.recalculate = async function(): Promise<void> {
  const ReviewModel = mongoose.model('Review')
  
  const aggregation = await ReviewModel.aggregate([
    { $match: { productId: this.productId, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        verifiedReviews: { $sum: { $cond: ['$isVerifiedPurchase', 1, 0] } },
        verifiedAverageRating: { 
          $avg: { $cond: ['$isVerifiedPurchase', '$rating', null] }
        },
        averageQualityScore: { $avg: '$qualityScore' },
        averageAuthenticityScore: { $avg: '$authenticityScore' },
        ratingDistribution: {
          $push: '$rating'
        },
        sentimentBreakdown: {
          $push: '$sentiment'
        }
      }
    }
  ])
  
  if (aggregation.length > 0) {
    const data = aggregation[0]
    
    this.averageRating = Math.round(data.averageRating * 10) / 10
    this.totalReviews = data.totalReviews
    this.verifiedReviews = data.verifiedReviews
    this.verifiedAverageRating = data.verifiedAverageRating || 0
    this.averageQualityScore = data.averageQualityScore || 0
    this.averageAuthenticityScore = data.averageAuthenticityScore || 50
    
    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    data.ratingDistribution.forEach((rating: number) => {
      distribution[rating as keyof typeof distribution]++
    })
    this.ratingDistribution = distribution
    
    // Calculate sentiment breakdown
    const sentiment = { positive: 0, neutral: 0, negative: 0 }
    data.sentimentBreakdown.forEach((s: string) => {
      sentiment[s as keyof typeof sentiment]++
    })
    this.sentimentBreakdown = sentiment
  }
  
  this.lastCalculated = new Date()
  await this.save()
}

// Static methods
reviewSchema.statics.findByProduct = function(productId: string, options: any = {}) {
  const query = { productId, status: 'approved' }
  return this.find(query)
    .sort({ helpfulVotes: -1, publishedAt: -1 })
    .limit(options.limit || 20)
    .populate('userId', 'firstName lastName profileImage')
}

reviewSchema.statics.findPendingModeration = function() {
  return this.find({ status: 'pending' })
    .sort({ submittedAt: 1 })
    .populate('userId', 'firstName lastName email')
    .populate('productId', 'name')
}

// Export models
export const ReviewModel = mongoose.models.Review || mongoose.model<ReviewDocument>('Review', reviewSchema)
export const ReviewVoteModel = mongoose.models.ReviewVote || mongoose.model<ReviewVoteDocument>('ReviewVote', reviewVoteSchema)
export const ReviewReportModel = mongoose.models.ReviewReport || mongoose.model<ReviewReportDocument>('ReviewReport', reviewReportSchema)
export const ProductRatingModel = mongoose.models.ProductRating || mongoose.model<ProductRatingDocument>('ProductRating', productRatingSchema)