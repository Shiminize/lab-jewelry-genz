/**
 * Analytics Database Schemas
 * MongoDB schemas for analytics and performance data
 * Phase 2: Scale & Optimize implementation
 */

import { z } from 'zod'
import mongoose from 'mongoose'

// Zod schemas for validation
export const AnalyticsEventSchema = z.object({
  event: z.enum([
    'page_view',
    'product_view', 
    'customizer_open',
    'customizer_material_change',
    'customizer_stone_change',
    'add_to_cart',
    'checkout_start',
    'payment_success',
    'payment_failed',
    'creator_referral',
    'search_query',
    'filter_apply',
    'error_occurred'
  ]),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.date(),
  properties: z.record(z.string(), z.any()),
  metadata: z.object({
    userAgent: z.string(),
    ip: z.string(),
    referrer: z.string().optional(),
    page: z.string(),
    device: z.enum(['mobile', 'tablet', 'desktop'])
  })
})

export const PerformanceMetricsSchema = z.object({
  apiResponseTime: z.number(),
  databaseQueryTime: z.number(),
  renderTime: z.number().optional(),
  memoryUsage: z.number().optional(),
  errorRate: z.number(),
  endpoint: z.string(),
  timestamp: z.date()
})

export const BusinessMetricsSchema = z.object({
  date: z.date(),
  revenue: z.number(),
  orders: z.number(),
  newUsers: z.number(),
  activeUsers: z.number(),
  conversionRate: z.number(),
  averageOrderValue: z.number(),
  creatorCommissions: z.number(),
  inventoryTurnover: z.number()
})

export const DatabaseQueryMetricsSchema = z.object({
  query: z.string(),
  collection: z.string(),
  duration: z.number(),
  recordsAffected: z.number(),
  timestamp: z.date()
})

export const UserJourneySchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  events: z.array(z.string()), // Event IDs
  conversionEvent: z.string().optional(),
  sourceChannel: z.string().optional(),
  creatorReferral: z.string().optional(),
  totalValue: z.number().default(0)
})

export const ConversionFunnelSchema = z.object({
  step: z.enum([
    'landing',
    'product_browse',
    'product_view',
    'customizer_open',
    'add_to_cart',
    'checkout_start',
    'payment_complete'
  ]),
  timestamp: z.date(),
  sessionId: z.string(),
  userId: z.string().optional(),
  metadata: z.record(z.string(), z.any())
})

// TypeScript types from Zod schemas
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>
export type BusinessMetrics = z.infer<typeof BusinessMetricsSchema>
export type DatabaseQueryMetrics = z.infer<typeof DatabaseQueryMetricsSchema>
export type UserJourney = z.infer<typeof UserJourneySchema>
export type ConversionFunnel = z.infer<typeof ConversionFunnelSchema>

// MongoDB Schemas
const analyticsEventMongoSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'product_view',
      'customizer_open', 
      'customizer_material_change',
      'customizer_stone_change',
      'add_to_cart',
      'checkout_start',
      'payment_success',
      'payment_failed',
      'creator_referral',
      'search_query',
      'filter_apply',
      'error_occurred'
    ]
  },
  userId: { type: String },
  sessionId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  properties: { type: mongoose.Schema.Types.Mixed },
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String,
    page: String,
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    }
  }
}, {
  timestamps: true,
  collection: 'analyticsEvents'
})

const performanceMetricsMongoSchema = new mongoose.Schema({
  apiResponseTime: { type: Number, required: true },
  databaseQueryTime: { type: Number, required: true },
  renderTime: Number,
  memoryUsage: Number,
  errorRate: { type: Number, required: true },
  endpoint: { type: String, required: true },
  timestamp: { type: Date, required: true }
}, {
  timestamps: true,
  collection: 'performanceMetrics'
})

const businessMetricsMongoSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  revenue: { type: Number, required: true },
  orders: { type: Number, required: true },
  newUsers: { type: Number, required: true },
  activeUsers: { type: Number, required: true },
  conversionRate: { type: Number, required: true },
  averageOrderValue: { type: Number, required: true },
  creatorCommissions: { type: Number, required: true },
  inventoryTurnover: { type: Number, required: true }
}, {
  timestamps: true,
  collection: 'businessMetrics'
})

const databaseQueryMetricsMongoSchema = new mongoose.Schema({
  query: { type: String, required: true },
  collection: { type: String, required: true },
  duration: { type: Number, required: true },
  recordsAffected: { type: Number, required: true },
  timestamp: { type: Date, required: true }
}, {
  timestamps: true,
  collection: 'databaseQueryMetrics'
})

const userJourneyMongoSchema = new mongoose.Schema({
  userId: { type: String },
  sessionId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: Date,
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AnalyticsEvent' }],
  conversionEvent: String,
  sourceChannel: String,
  creatorReferral: { type: String },
  totalValue: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: 'userJourneys'
})

const conversionFunnelMongoSchema = new mongoose.Schema({
  step: {
    type: String,
    required: true,
    enum: [
      'landing',
      'product_browse',
      'product_view',
      'customizer_open',
      'add_to_cart',
      'checkout_start',
      'payment_complete'
    ],
  },
  timestamp: { type: Date, required: true },
  sessionId: { type: String, required: true },
  userId: { type: String },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  collection: 'conversionFunnel'
})

// Indexes for performance
analyticsEventMongoSchema.index({ timestamp: -1, event: 1 })
analyticsEventMongoSchema.index({ sessionId: 1, timestamp: 1 })
analyticsEventMongoSchema.index({ userId: 1, timestamp: -1 })

performanceMetricsMongoSchema.index({ timestamp: -1, endpoint: 1 })
performanceMetricsMongoSchema.index({ endpoint: 1, timestamp: -1 })

businessMetricsMongoSchema.index({ date: -1 })

databaseQueryMetricsMongoSchema.index({ timestamp: -1, collection: 1 })
databaseQueryMetricsMongoSchema.index({ collection: 1, duration: -1 })

userJourneyMongoSchema.index({ startTime: -1, sessionId: 1 })
userJourneyMongoSchema.index({ userId: 1, startTime: -1 })
userJourneyMongoSchema.index({ creatorReferral: 1, startTime: -1 })

conversionFunnelMongoSchema.index({ timestamp: -1, step: 1 })
conversionFunnelMongoSchema.index({ sessionId: 1, timestamp: 1 })

// TTL indexes for data retention (keep data for 90 days)
analyticsEventMongoSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })
performanceMetricsMongoSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })
databaseQueryMetricsMongoSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }) // 30 days
userJourneyMongoSchema.index({ startTime: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })
conversionFunnelMongoSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

// Business metrics kept for 2 years
businessMetricsMongoSchema.index({ date: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 })

// Export Models
export const AnalyticsEventModel = mongoose.models.AnalyticsEvent || 
  mongoose.model('AnalyticsEvent', analyticsEventMongoSchema)

export const PerformanceMetricsModel = mongoose.models.PerformanceMetrics || 
  mongoose.model('PerformanceMetrics', performanceMetricsMongoSchema)

export const BusinessMetricsModel = mongoose.models.BusinessMetrics || 
  mongoose.model('BusinessMetrics', businessMetricsMongoSchema)

export const DatabaseQueryMetricsModel = mongoose.models.DatabaseQueryMetrics || 
  mongoose.model('DatabaseQueryMetrics', databaseQueryMetricsMongoSchema)

export const UserJourneyModel = mongoose.models.UserJourney || 
  mongoose.model('UserJourney', userJourneyMongoSchema)

export const ConversionFunnelModel = mongoose.models.ConversionFunnel || 
  mongoose.model('ConversionFunnel', conversionFunnelMongoSchema)

// Analytics aggregation pipelines
export const analyticsAggregations = {
  // Daily event counts
  dailyEventCounts: (days: number = 30) => [
    {
      $match: {
        timestamp: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          event: "$event"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        events: {
          $push: {
            event: "$_id.event",
            count: "$count"
          }
        },
        totalEvents: { $sum: "$count" }
      }
    },
    { $sort: { _id: 1 } }
  ],

  // Conversion funnel analysis
  conversionFunnel: (timeframe: Date) => [
    {
      $match: {
        timestamp: { $gte: timeframe }
      }
    },
    {
      $group: {
        _id: "$step",
        sessions: { $addToSet: "$sessionId" },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        step: "$_id",
        uniqueSessions: { $size: "$sessions" },
        totalEvents: "$count"
      }
    },
    { $sort: { step: 1 } }
  ],

  // User journey analysis
  userJourneyAnalysis: (timeframe: Date) => [
    {
      $match: {
        startTime: { $gte: timeframe }
      }
    },
    {
      $lookup: {
        from: "analyticsEvents",
        localField: "events",
        foreignField: "_id",
        as: "eventDetails"
      }
    },
    {
      $group: {
        _id: "$sourceChannel",
        journeys: { $sum: 1 },
        conversions: {
          $sum: { $cond: [{ $ne: ["$conversionEvent", null] }, 1, 0] }
        },
        totalValue: { $sum: "$totalValue" },
        avgJourneyLength: { $avg: { $size: "$events" } }
      }
    },
    {
      $project: {
        channel: "$_id",
        journeys: 1,
        conversions: 1,
        conversionRate: { $divide: ["$conversions", "$journeys"] },
        totalValue: 1,
        avgOrderValue: { $divide: ["$totalValue", "$conversions"] },
        avgJourneyLength: 1
      }
    }
  ],

  // Performance insights
  performanceInsights: (timeframe: Date) => [
    {
      $match: {
        timestamp: { $gte: timeframe }
      }
    },
    {
      $group: {
        _id: "$endpoint",
        avgResponseTime: { $avg: "$apiResponseTime" },
        maxResponseTime: { $max: "$apiResponseTime" },
        minResponseTime: { $min: "$apiResponseTime" },
        avgDbTime: { $avg: "$databaseQueryTime" },
        totalRequests: { $sum: 1 },
        errorCount: { $sum: { $cond: [{ $gt: ["$errorRate", 0] }, 1, 0] } }
      }
    },
    {
      $project: {
        endpoint: "$_id",
        avgResponseTime: { $round: ["$avgResponseTime", 2] },
        maxResponseTime: { $round: ["$maxResponseTime", 2] },
        minResponseTime: { $round: ["$minResponseTime", 2] },
        avgDbTime: { $round: ["$avgDbTime", 2] },
        totalRequests: 1,
        errorRate: { $divide: ["$errorCount", "$totalRequests"] }
      }
    },
    { $sort: { totalRequests: -1 } }
  ]
}

export default {
  AnalyticsEventModel,
  PerformanceMetricsModel,
  BusinessMetricsModel,
  DatabaseQueryMetricsModel,
  UserJourneyModel,
  ConversionFunnelModel,
  analyticsAggregations
}