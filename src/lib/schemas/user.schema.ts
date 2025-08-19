/**
 * User Schema - MongoDB Model for User Management
 * Extends NextAuth.js user types with comprehensive user management
 * Supports creator program, GDPR compliance, and security features
 */

import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { User, UserRole, AuthProvider, AccountStatus, UserAddress, UserPreferences, CreatorProfile } from '@/types/auth'

// Mongoose document interface
export interface IUser extends Omit<User, '_id'>, Document {
  _id: mongoose.Types.ObjectId
  comparePassword(candidatePassword: string): Promise<boolean>
  generateEmailVerificationToken(): string
  generatePasswordResetToken(): string
  incrementLoginAttempts(): Promise<void>
  resetLoginAttempts(): Promise<void>
  updateLastLogin(): Promise<void>
  checkAccountLocked(): boolean
}

// Address subdocument schema
const AddressSchema = new Schema<UserAddress>({
  id: { type: String, required: true },
  type: { type: String, enum: ['shipping', 'billing'], required: true },
  firstName: { type: String, required: true, maxlength: 50 },
  lastName: { type: String, required: true, maxlength: 50 },
  company: { type: String, maxlength: 100 },
  address1: { type: String, required: true, maxlength: 200 },
  address2: { type: String, maxlength: 200 },
  city: { type: String, required: true, maxlength: 100 },
  state: { type: String, required: true, maxlength: 100 },
  postalCode: { type: String, required: true, maxlength: 20 },
  country: { type: String, required: true, minlength: 2, maxlength: 2 },
  phone: { type: String, match: /^\\+?[\\d\\s\\-\\(\\)]+$/ },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true })

// User preferences subdocument schema
const UserPreferencesSchema = new Schema<UserPreferences>({
  emailNotifications: {
    marketing: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
    newProducts: { type: Boolean, default: false },
    priceAlerts: { type: Boolean, default: false },
    creatorProgram: { type: Boolean, default: false }
  },
  smsNotifications: {
    orderUpdates: { type: Boolean, default: false },
    deliveryAlerts: { type: Boolean, default: false }
  },
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'private' },
    allowDataCollection: { type: Boolean, default: false },
    allowPersonalization: { type: Boolean, default: true }
  },
  currency: { type: String, enum: ['USD', 'CAD', 'GBP', 'EUR', 'AUD'], default: 'USD' },
  language: { type: String, enum: ['en', 'fr', 'es'], default: 'en' },
  timezone: { type: String, default: 'America/New_York' }
})

// Creator profile subdocument schema
const CreatorProfileSchema = new Schema<CreatorProfile>({
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'suspended'], 
    default: 'pending' 
  },
  referralCode: { type: String, required: true, uppercase: true },
  commissionRate: { type: Number, min: 0, max: 100, default: 5.0 },
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    routingNumber: String,
    bankName: String,
    accountType: { type: String, enum: ['checking', 'savings'] }
  },
  stripeAccountId: String,
  socialMedia: {
    instagram: String,
    tiktok: String,
    youtube: String,
    website: String
  },
  bio: { type: String, maxlength: 500 },
  specialties: [{ type: String, maxlength: 50 }],
  applicationDate: { type: Date, default: Date.now },
  approvalDate: Date,
  totalReferrals: { type: Number, default: 0 },
  totalCommissionEarned: { type: Number, default: 0 },
  analytics: {
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  brandPartnership: {
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    benefits: [String],
    exclusiveProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  }
})

// Main user schema
const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    match: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Profile information
  firstName: { type: String, maxlength: 50 },
  lastName: { type: String, maxlength: 50 },
  displayName: { type: String, maxlength: 100 },
  dateOfBirth: Date,
  phone: { type: String, match: /^\\+?[\\d\\s\\-\\(\\)]+$/ },
  profileImage: String,

  // Authentication
  password: String, // Hashed password for credentials provider
  providers: [{
    provider: { type: String, enum: ['credentials', 'google', 'apple', 'facebook'], required: true },
    providerId: { type: String, required: true },
    connected: { type: Date, default: Date.now }
  }],

  // Account management
  role: { 
    type: String, 
    enum: ['customer', 'creator', 'admin'], 
    default: 'customer' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'pending-verification'], 
    default: 'pending-verification' 
  },

  // Addresses and preferences
  addresses: [AddressSchema],
  preferences: { type: UserPreferencesSchema, default: () => ({}) },

  // Creator program (only if role includes creator)
  creatorProfile: CreatorProfileSchema,

  // Shopping data
  cartId: { type: Schema.Types.ObjectId, ref: 'Cart' },
  wishlistIds: [{ type: Schema.Types.ObjectId, ref: 'Wishlist' }],

  // Security
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },

  // GDPR compliance
  gdprConsent: {
    accepted: { type: Boolean, required: true },
    acceptedAt: { type: Date, required: true },
    version: { type: String, required: true },
    ipAddress: { type: String, required: true }
  },
  dataRetentionConsent: { type: Boolean, default: true },
  marketingConsent: { type: Boolean, default: false },

  // Analytics (aggregated, non-PII)
  analytics: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    favoriteCategory: String,
    lastPurchaseDate: Date
  },

  lastActiveAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance optimization
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ 'creatorProfile.referralCode': 1 }, { unique: true, sparse: true })
UserSchema.index({ role: 1, status: 1 })
UserSchema.index({ 'providers.provider': 1, 'providers.providerId': 1 })
UserSchema.index({ createdAt: -1 })
UserSchema.index({ lastActiveAt: -1 })
UserSchema.index({ 'gdprConsent.accepted': 1 })

// Virtual fields
UserSchema.virtual('isAccountLocked').get(function() {
  return this.lockedUntil && this.lockedUntil > new Date()
})

UserSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`
  }
  return this.displayName || this.email
})

// Pre-save middleware
UserSchema.pre('save', async function(next) {
  // Hash password if it's been modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
  }

  // Generate referral code for new creators
  if (this.isModified('role') && this.role === 'creator' && !this.creatorProfile?.referralCode) {
    if (!this.creatorProfile) {
      this.creatorProfile = {} as CreatorProfile
    }
    this.creatorProfile.referralCode = this.generateReferralCode()
  }

  // Update lastActiveAt
  this.lastActiveAt = new Date()

  next()
})

// Instance methods
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

UserSchema.methods.generateEmailVerificationToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex')
  this.emailVerificationToken = token
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  return token
}

UserSchema.methods.generatePasswordResetToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = token
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  return token
}

UserSchema.methods.generateReferralCode = function(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomBytes = crypto.randomBytes(8)
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(randomBytes[i] % characters.length)
  }
  return result
}

UserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // Lock account after 5 failed attempts for 30 minutes
  const maxAttempts = 5
  const lockTime = 30 * 60 * 1000 // 30 minutes

  this.loginAttempts += 1

  if (this.loginAttempts >= maxAttempts) {
    this.lockedUntil = new Date(Date.now() + lockTime)
  }

  await this.save()
}

UserSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.loginAttempts = 0
  this.lockedUntil = undefined
  await this.save()
}

UserSchema.methods.updateLastLogin = async function(): Promise<void> {
  this.lastLogin = new Date()
  this.lastActiveAt = new Date()
  await this.save()
}

UserSchema.methods.checkAccountLocked = function(): boolean {
  return this.lockedUntil && this.lockedUntil > new Date()
}

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

UserSchema.statics.findByReferralCode = function(referralCode: string) {
  return this.findOne({ 'creatorProfile.referralCode': referralCode.toUpperCase() })
}

UserSchema.statics.findCreators = function(status?: string) {
  const query: any = { role: 'creator' }
  if (status) {
    query['creatorProfile.status'] = status
  }
  return this.find(query)
}

// Export the model
export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default UserModel