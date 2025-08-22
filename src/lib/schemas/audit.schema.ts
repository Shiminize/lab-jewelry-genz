/**
 * Audit Logging and GDPR Compliance Mongoose Schemas
 * Comprehensive audit trail system with GDPR compliance features
 * Tracks all user actions, data changes, and system events
 */

import mongoose, { Schema, Document } from 'mongoose'

// Audit event types
export type AuditEventType = 
  // Authentication events
  | 'auth.login' | 'auth.logout' | 'auth.register' | 'auth.password_change'
  | 'auth.password_reset' | 'auth.email_verify' | 'auth.account_lock'
  
  // User management events  
  | 'user.create' | 'user.update' | 'user.delete' | 'user.profile_update'
  | 'user.address_add' | 'user.address_update' | 'user.address_delete'
  | 'user.preferences_update' | 'user.role_change'
  
  // Product events
  | 'product.view' | 'product.customize' | 'product.favorite' | 'product.unfavorite'
  | 'product.review' | 'product.review_update' | 'product.review_delete'
  
  // Order events
  | 'order.create' | 'order.update' | 'order.cancel' | 'order.refund'
  | 'order.payment' | 'order.shipped' | 'order.delivered'
  
  // Cart events
  | 'cart.add_item' | 'cart.remove_item' | 'cart.update_item' | 'cart.clear'
  | 'cart.apply_discount' | 'cart.remove_discount'
  
  // Wishlist events
  | 'wishlist.add_item' | 'wishlist.remove_item' | 'wishlist.share'
  | 'wishlist.price_alert'
  
  // Creator program events
  | 'creator.apply' | 'creator.approve' | 'creator.reject' | 'creator.suspend'
  | 'creator.commission_earn' | 'creator.commission_pay' | 'creator.referral'
  
  // Administrative events
  | 'admin.user_impersonate' | 'admin.bulk_update' | 'admin.system_config'
  | 'admin.export_data' | 'admin.import_data'
  
  // GDPR events
  | 'gdpr.consent_accept' | 'gdpr.consent_withdraw' | 'gdpr.data_export'
  | 'gdpr.data_delete' | 'gdpr.data_portability' | 'gdpr.marketing_consent'
  
  // Security events
  | 'security.suspicious_activity' | 'security.rate_limit_exceeded'
  | 'security.fraud_detected' | 'security.account_compromise'
  
  // System events
  | 'system.backup' | 'system.maintenance' | 'system.error' | 'system.performance'

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'

// Audit Log interface
export interface AuditLogDocument extends Document {
  // Event identification
  eventType: AuditEventType
  eventId: string // Unique identifier for this event
  correlationId?: string // For grouping related events
  
  // Actor information
  userId?: string
  sessionId?: string
  actorType: 'user' | 'admin' | 'system' | 'anonymous'
  actorDetails?: {
    email?: string
    role?: string
    ipAddress?: string
    userAgent?: string
    location?: {
      country?: string
      region?: string
      city?: string
    }
  }
  
  // Target information
  targetType?: 'user' | 'product' | 'order' | 'cart' | 'wishlist' | 'customization' | 'review'
  targetId?: string
  targetDetails?: any
  
  // Event details
  action: string // Human-readable action description
  details: any // Event-specific data
  metadata?: {
    source?: string // Web, mobile app, API, etc.
    version?: string // Application version
    feature?: string // Feature that triggered the event
    experiment?: string // A/B test experiment
  }
  
  // Request context
  request?: {
    method?: string
    url?: string
    headers?: any
    body?: any
    query?: any
    params?: any
  }
  
  // Response context
  response?: {
    statusCode?: number
    duration?: number // Request duration in ms
    size?: number // Response size in bytes
  }
  
  // Change tracking
  changes?: {
    before?: any
    after?: any
    fields?: string[]
  }
  
  // Security and compliance
  severity: AuditSeverity
  isGDPRRelevant: boolean
  dataCategories: string[] // Types of personal data involved
  legalBasis?: string // GDPR legal basis
  
  // Timing
  timestamp: Date
  timeZone: string
  
  // Retention and compliance
  retentionUntil?: Date
  anonymized: boolean
  anonymizedAt?: Date
  
  // Error information (if applicable)
  error?: {
    message: string
    stack?: string
    code?: string
  }
  
  // System performance
  performance?: {
    memoryUsage?: number
    cpuUsage?: number
    dbQueries?: number
    cacheHits?: number
  }
}

// GDPR Data Processing Record interface
export interface GDPRProcessingRecordDocument extends Document {
  userId: string
  
  // Processing activity
  activityType: string
  purpose: string
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests'
  legalBasisDetails?: string
  
  // Data categories
  dataCategories: {
    category: string
    description: string
    sensitive: boolean
    retention: {
      period: number
      unit: 'days' | 'months' | 'years'
      reason: string
    }
  }[]
  
  // Data subjects
  dataSubjects: string[]
  
  // Data recipients
  recipients: {
    type: 'internal' | 'external' | 'third_party'
    name: string
    purpose: string
    country?: string
    safeguards?: string
  }[]
  
  // International transfers
  internationalTransfers?: {
    country: string
    adequacyDecision: boolean
    safeguards: string[]
    details?: string
  }[]
  
  // Security measures
  securityMeasures: {
    technical: string[]
    organizational: string[]
  }
  
  // Consent tracking
  consent?: {
    obtained: boolean
    obtainedAt?: Date
    method: string
    withdrawn?: boolean
    withdrawnAt?: Date
  }
  
  // Retention
  retention: {
    period: number
    unit: 'days' | 'months' | 'years'
    startDate: Date
    endDate: Date
    reason: string
    reviewDate: Date
  }
  
  // Risk assessment
  riskAssessment: {
    likelihood: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    overallRisk: 'low' | 'medium' | 'high'
    mitigations: string[]
    assessedAt: Date
    assessedBy: string
  }
  
  // Data Protection Impact Assessment
  dpia?: {
    required: boolean
    completed: boolean
    completedAt?: Date
    reference?: string
    outcome: 'approved' | 'rejected' | 'conditional'
    conditions?: string[]
  }
  
  // Status and lifecycle
  status: 'active' | 'suspended' | 'terminated'
  createdAt: Date
  updatedAt: Date
  lastReviewed: Date
  nextReview: Date
}

// Data Breach Log interface
export interface DataBreachLogDocument extends Document {
  // Breach identification
  breachId: string
  title: string
  description: string
  
  // Discovery and reporting
  discoveredAt: Date
  discoveredBy: string
  reportedAt?: Date
  reportedBy?: string
  
  // Breach details
  category: 'confidentiality' | 'integrity' | 'availability'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: 'internal' | 'external' | 'unknown'
  vector: string // How the breach occurred
  
  // Affected data
  dataTypes: string[]
  recordsAffected: number
  dataSubjects: string[] // Types of individuals affected
  
  // Impact assessment
  impact: {
    financial?: number
    operational: string
    reputational: string
    compliance: string
  }
  
  // Affected individuals
  individualsNotified: boolean
  individualsNotifiedAt?: Date
  notificationMethod?: string
  
  // Regulatory notification
  regulatoryNotification: {
    required: boolean
    submitted: boolean
    submittedAt?: Date
    authority: string
    reference?: string
  }
  
  // Containment and remediation
  containment: {
    contained: boolean
    containedAt?: Date
    containmentMeasures: string[]
  }
  
  remediation: {
    completed: boolean
    completedAt?: Date
    measures: string[]
    cost?: number
  }
  
  // Investigation
  investigation: {
    status: 'ongoing' | 'completed' | 'closed'
    findings: string
    rootCause?: string
    recommendations: string[]
    investigatedBy: string
  }
  
  // Lessons learned
  lessonsLearned?: string[]
  preventiveMeasures?: string[]
  
  // Status
  status: 'discovered' | 'investigating' | 'contained' | 'resolved' | 'closed'
  closedAt?: Date
  closedBy?: string
  
  createdAt: Date
  updatedAt: Date
}

// Audit Log schema
const auditLogSchema = new Schema<AuditLogDocument>({
  eventType: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  correlationId: {
    type: String
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  sessionId: {
    type: String
  },
  actorType: {
    type: String,
    enum: ['user', 'admin', 'system', 'anonymous'],
    required: true
  },
  actorDetails: {
    email: String,
    role: String,
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      region: String,
      city: String
    }
  },
  
  targetType: {
    type: String,
    enum: ['user', 'product', 'order', 'cart', 'wishlist', 'customization', 'review']
  },
  targetId: {
    type: String
  },
  targetDetails: Schema.Types.Mixed,
  
  action: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed,
    required: true
  },
  metadata: {
    source: String,
    version: String,
    feature: String,
    experiment: String
  },
  
  request: {
    method: String,
    url: String,
    headers: Schema.Types.Mixed,
    body: Schema.Types.Mixed,
    query: Schema.Types.Mixed,
    params: Schema.Types.Mixed
  },
  
  response: {
    statusCode: Number,
    duration: Number,
    size: Number
  },
  
  changes: {
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    fields: [String]
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  isGDPRRelevant: {
    type: Boolean,
    default: false
  },
  dataCategories: [String],
  legalBasis: String,
  
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeZone: {
    type: String,
    default: 'UTC'
  },
  
  retentionUntil: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  anonymized: {
    type: Boolean,
    default: false
  },
  anonymizedAt: Date,
  
  error: {
    message: String,
    stack: String,
    code: String
  },
  
  performance: {
    memoryUsage: Number,
    cpuUsage: Number,
    dbQueries: Number,
    cacheHits: Number
  }
}, {
  timestamps: false, // Using custom timestamp field
  collection: 'audit_logs'
})

// GDPR Processing Record schema
const gdprProcessingRecordSchema = new Schema<GDPRProcessingRecordDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  activityType: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  legalBasis: {
    type: String,
    enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
    required: true
  },
  legalBasisDetails: String,
  
  dataCategories: [{
    category: { type: String, required: true },
    description: { type: String, required: true },
    sensitive: { type: Boolean, default: false },
    retention: {
      period: { type: Number, required: true },
      unit: { type: String, enum: ['days', 'months', 'years'], required: true },
      reason: { type: String, required: true }
    }
  }],
  
  dataSubjects: [String],
  
  recipients: [{
    type: { type: String, enum: ['internal', 'external', 'third_party'], required: true },
    name: { type: String, required: true },
    purpose: { type: String, required: true },
    country: String,
    safeguards: String
  }],
  
  internationalTransfers: [{
    country: { type: String, required: true },
    adequacyDecision: { type: Boolean, required: true },
    safeguards: [String],
    details: String
  }],
  
  securityMeasures: {
    technical: [String],
    organizational: [String]
  },
  
  consent: {
    obtained: Boolean,
    obtainedAt: Date,
    method: String,
    withdrawn: Boolean,
    withdrawnAt: Date
  },
  
  retention: {
    period: { type: Number, required: true },
    unit: { type: String, enum: ['days', 'months', 'years'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    reviewDate: { type: Date, required: true }
  },
  
  riskAssessment: {
    likelihood: { type: String, enum: ['low', 'medium', 'high'], required: true },
    impact: { type: String, enum: ['low', 'medium', 'high'], required: true },
    overallRisk: { type: String, enum: ['low', 'medium', 'high'], required: true },
    mitigations: [String],
    assessedAt: { type: Date, required: true },
    assessedBy: { type: String, required: true }
  },
  
  dpia: {
    required: Boolean,
    completed: Boolean,
    completedAt: Date,
    reference: String,
    outcome: {
      type: String,
      enum: ['approved', 'rejected', 'conditional']
    },
    conditions: [String]
  },
  
  status: {
    type: String,
    enum: ['active', 'suspended', 'terminated'],
    default: 'active'
  },
  
  lastReviewed: {
    type: Date,
    default: Date.now
  },
  nextReview: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
})

// Data Breach Log schema
const dataBreachLogSchema = new Schema<DataBreachLogDocument>({
  breachId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  discoveredAt: {
    type: Date,
    required: true
  },
  discoveredBy: {
    type: String,
    required: true
  },
  reportedAt: Date,
  reportedBy: String,
  
  category: {
    type: String,
    enum: ['confidentiality', 'integrity', 'availability'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  source: {
    type: String,
    enum: ['internal', 'external', 'unknown'],
    required: true
  },
  vector: {
    type: String,
    required: true
  },
  
  dataTypes: [String],
  recordsAffected: {
    type: Number,
    required: true
  },
  dataSubjects: [String],
  
  impact: {
    financial: Number,
    operational: String,
    reputational: String,
    compliance: String
  },
  
  individualsNotified: {
    type: Boolean,
    default: false
  },
  individualsNotifiedAt: Date,
  notificationMethod: String,
  
  regulatoryNotification: {
    required: { type: Boolean, required: true },
    submitted: { type: Boolean, default: false },
    submittedAt: Date,
    authority: String,
    reference: String
  },
  
  containment: {
    contained: { type: Boolean, default: false },
    containedAt: Date,
    containmentMeasures: [String]
  },
  
  remediation: {
    completed: { type: Boolean, default: false },
    completedAt: Date,
    measures: [String],
    cost: Number
  },
  
  investigation: {
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'closed'],
      default: 'ongoing'
    },
    findings: String,
    rootCause: String,
    recommendations: [String],
    investigatedBy: String
  },
  
  lessonsLearned: [String],
  preventiveMeasures: [String],
  
  status: {
    type: String,
    enum: ['discovered', 'investigating', 'contained', 'resolved', 'closed'],
    default: 'discovered'
  },
  closedAt: Date,
  closedBy: String
}, {
  timestamps: true
})

// Indexes for Audit Log schema
auditLogSchema.index({ eventType: 1, timestamp: -1 })
auditLogSchema.index({ userId: 1, timestamp: -1 })
auditLogSchema.index({ targetType: 1, targetId: 1, timestamp: -1 })
auditLogSchema.index({ actorType: 1, severity: 1, timestamp: -1 })
auditLogSchema.index({ isGDPRRelevant: 1, timestamp: -1 })
auditLogSchema.index({ correlationId: 1 }, { sparse: true })
auditLogSchema.index({ retentionUntil: 1 }, { expireAfterSeconds: 0 })

// Compound indexes
auditLogSchema.index({ eventType: 1, userId: 1, timestamp: -1 })
auditLogSchema.index({ severity: 1, isGDPRRelevant: 1, timestamp: -1 })

// Indexes for GDPR Processing Record schema
gdprProcessingRecordSchema.index({ userId: 1, status: 1 })
gdprProcessingRecordSchema.index({ legalBasis: 1, status: 1 })
gdprProcessingRecordSchema.index({ nextReview: 1, status: 1 })
gdprProcessingRecordSchema.index({ 'retention.endDate': 1 })

// Indexes for Data Breach Log schema
dataBreachLogSchema.index({ breachId: 1 }, { unique: true })
dataBreachLogSchema.index({ severity: 1, status: 1 })
dataBreachLogSchema.index({ discoveredAt: -1 })
dataBreachLogSchema.index({ status: 1, discoveredAt: -1 })

// Static methods for Audit Log
auditLogSchema.statics.createEvent = async function(eventData: Partial<AuditLogDocument>) {
  const event = new this({
    ...eventData,
    eventId: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
    timestamp: new Date(),
    timeZone: eventData.timeZone || 'UTC'
  })
  
  // Set retention based on event type and GDPR relevance
  if (event.isGDPRRelevant) {
    event.retentionUntil = new Date(Date.now() + 6 * 365 * 24 * 60 * 60 * 1000) // 6 years
  } else {
    event.retentionUntil = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years
  }
  
  return event.save()
}

auditLogSchema.statics.findByUser = function(userId: string, eventTypes?: AuditEventType[]) {
  const query: any = { userId }
  if (eventTypes?.length) {
    query.eventType = { $in: eventTypes }
  }
  return this.find(query).sort({ timestamp: -1 }).limit(100)
}

auditLogSchema.statics.findGDPREvents = function(userId: string) {
  return this.find({ 
    userId, 
    isGDPRRelevant: true 
  }).sort({ timestamp: -1 })
}

// Export models
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema)
export const GDPRProcessingRecordModel = mongoose.models.GDPRProcessingRecord || mongoose.model<GDPRProcessingRecordDocument>('GDPRProcessingRecord', gdprProcessingRecordSchema)
export const DataBreachLogModel = mongoose.models.DataBreachLog || mongoose.model<DataBreachLogDocument>('DataBreachLog', dataBreachLogSchema)