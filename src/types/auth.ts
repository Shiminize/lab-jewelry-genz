/**
 * Authentication and User Management Type Definitions
 * Comprehensive schema for GlowGlitch authentication system
 * Follows CLAUDE_RULES.md specifications and GDPR compliance
 */

import { z } from 'zod'

// User role types for RBAC
export type UserRole = 'customer' | 'creator' | 'admin'

// Authentication provider types
export type AuthProvider = 'credentials' | 'google' | 'apple' | 'facebook'

// User account status
export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'pending-verification'

// Address interface for shipping/billing
export interface UserAddress {
  id: string
  type: 'shipping' | 'billing'
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
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// User preferences
export interface UserPreferences {
  emailNotifications: {
    marketing: boolean
    orderUpdates: boolean
    newProducts: boolean
    priceAlerts: boolean
    creatorProgram: boolean
  }
  smsNotifications: {
    orderUpdates: boolean
    deliveryAlerts: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    allowDataCollection: boolean
    allowPersonalization: boolean
  }
  currency: 'USD' | 'CAD' | 'GBP' | 'EUR' | 'AUD'
  language: 'en' | 'fr' | 'es'
  timezone: string
}

// Creator profile for creator program
export interface CreatorProfile {
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  referralCode: string
  commissionRate: number // Percentage (e.g., 5.5 for 5.5%)
  bankDetails?: {
    accountHolder: string
    accountNumber: string
    routingNumber: string
    bankName: string
    accountType: 'checking' | 'savings'
  }
  stripeAccountId?: string
  socialMedia: {
    instagram?: string
    tiktok?: string
    youtube?: string
    website?: string
  }
  bio: string
  specialties: string[] // Areas of expertise
  applicationDate: Date
  approvalDate?: Date
  totalReferrals: number
  totalCommissionEarned: number
  analytics: {
    clicks: number
    conversions: number
    conversionRate: number
    revenue: number
  }
  brandPartnership: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    benefits: string[]
    exclusiveProducts: string[] // Product IDs
  }
}

// Main user interface
export interface User {
  _id: string
  email: string
  emailVerified: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  
  // Profile information
  firstName?: string
  lastName?: string
  displayName?: string
  dateOfBirth?: Date
  phone?: string
  profileImage?: string
  
  // Authentication
  password?: string // Hashed, only for credentials provider
  providers: {
    provider: AuthProvider
    providerId: string
    connected: Date
  }[]
  
  // Account management
  role: UserRole
  status: AccountStatus
  
  // Addresses and preferences
  addresses: UserAddress[]
  preferences: UserPreferences
  
  // Creator program (only if role includes creator)
  creatorProfile?: CreatorProfile
  
  // Shopping data
  cartId?: string
  wishlistIds: string[]
  
  // Security
  lastLogin?: Date
  loginAttempts: number
  lockedUntil?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  twoFactorSecret?: string
  twoFactorEnabled: boolean
  
  // GDPR compliance
  gdprConsent: {
    accepted: boolean
    acceptedAt: Date
    version: string
    ipAddress: string
  }
  dataRetentionConsent: boolean
  marketingConsent: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastActiveAt: Date
  
  // Analytics (aggregated, non-PII)
  analytics?: {
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    favoriteCategory?: string
    lastPurchaseDate?: Date
  }
}

// JWT token payload
export interface JWTPayload {
  sub: string // User ID
  email: string
  role: UserRole
  status: AccountStatus
  emailVerified: boolean
  iat: number
  exp: number
  jti: string // JWT ID for revocation
}

// Session interface (extends NextAuth Session)
export interface AuthSession {
  user: {
    id: string
    email: string
    name?: string
    image?: string
    role: UserRole
    status: AccountStatus
    emailVerified: boolean
  }
  accessToken: string
  refreshToken: string
  expires: string
}

// Authentication request/response types
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  acceptTerms: boolean
  acceptMarketing?: boolean
  referralCode?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  preferences?: Partial<UserPreferences>
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

// GDPR data export/deletion types
export interface GDPRDataExport {
  user: Omit<User, 'password' | 'passwordResetToken' | 'emailVerificationToken' | 'twoFactorSecret'>
  orders: any[] // Order data
  reviews: any[] // Review data
  customizations: any[] // Saved designs
  interactions: any[] // Page views, clicks (anonymized)
  exportedAt: Date
  format: 'json' | 'csv'
}

export interface GDPRDeletionRequest {
  userId: string
  reason: string
  retainOrderHistory: boolean
  retainAnalytics: boolean
  requestedAt: Date
  processedAt?: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// API envelope types for authentication responses
export interface AuthApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any[]
  }
  meta: {
    timestamp: string
    requestId: string
    version: string
  }
  rateLimit?: RateLimitInfo
}

// Validation schemas using Zod
export const UserAddressSchema = z.object({
  type: z.enum(['shipping', 'billing']),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  company: z.string().max(100).optional(),
  address1: z.string().min(1, 'Address is required').max(200),
  address2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(2),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number').optional(),
  isDefault: z.boolean().default(false)
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
})

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  acceptMarketing: z.boolean().optional(),
  referralCode: z.string().regex(/^[A-Z0-9]{6,12}$/).optional()
})

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional(),
  dateOfBirth: z.string().datetime().optional(),
  preferences: z.object({
    emailNotifications: z.object({
      marketing: z.boolean(),
      orderUpdates: z.boolean(),
      newProducts: z.boolean(),
      priceAlerts: z.boolean(),
      creatorProgram: z.boolean()
    }).partial(),
    smsNotifications: z.object({
      orderUpdates: z.boolean(),
      deliveryAlerts: z.boolean()
    }).partial(),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'private']),
      allowDataCollection: z.boolean(),
      allowPersonalization: z.boolean()
    }).partial(),
    currency: z.enum(['USD', 'CAD', 'GBP', 'EUR', 'AUD']),
    language: z.enum(['en', 'fr', 'es']),
    timezone: z.string()
  }).partial().optional()
})

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character')
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character')
})

// Types are already exported above with their declarations