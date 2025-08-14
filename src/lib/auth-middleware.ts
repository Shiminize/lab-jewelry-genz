/**
 * Authentication and Authorization Middleware
 * Implements role-based access control for API routes
 * Follows CLAUDE_RULES.md security requirements
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserById } from '@/lib/user-service'
import { createErrorResponse, getClientIP } from '@/lib/api-utils'
import { checkAPIRateLimit, checkUserAPIRateLimit } from '@/lib/api-utils'
import { RateLimitConfigs } from '@/lib/redis-rate-limiter'
import type { UserRole, AuthSession } from '@/types/auth'

// Rate limiting configurations now use Redis-based system from CLAUDE_RULES
// These map to RateLimitConfigs in redis-rate-limiter.ts
export const RATE_LIMITS = {
  auth: 'AUTH',
  catalog: 'CATALOG', 
  cart: 'CART',
  orders: 'ORDERS',
  admin: 'ADMIN',
  user: 'CATALOG' // Use catalog limits for general user operations
} as const

// Permission sets for different roles
const ROLE_PERMISSIONS = {
  customer: [
    'read:own_profile',
    'update:own_profile',
    'read:products',
    'read:catalog',
    'create:orders',
    'read:own_orders',
    'update:own_cart',
    'read:own_cart',
    'create:reviews',
    'update:own_reviews',
    'delete:own_reviews'
  ],
  creator: [
    'read:own_profile',
    'update:own_profile',
    'read:products',
    'read:catalog',
    'create:orders',
    'read:own_orders',
    'update:own_cart',
    'read:own_cart',
    'create:reviews',
    'update:own_reviews',
    'delete:own_reviews',
    'read:creator_dashboard',
    'read:creator_analytics',
    'read:creator_commissions',
    'update:creator_profile',
    'validate:referral_codes'
  ],
  admin: [
    'read:all_profiles',
    'update:all_profiles',
    'delete:profiles',
    'read:products',
    'create:products',
    'update:products',
    'delete:products',
    'read:catalog',
    'read:all_orders',
    'update:order_status',
    'read:admin_dashboard',
    'read:admin_analytics',
    'read:inventory',
    'update:inventory',
    'read:creator_applications',
    'approve:creator_applications',
    'reject:creator_applications',
    'suspend:users',
    'manage:roles'
  ]
} as const

// Middleware configuration options
interface AuthMiddlewareOptions {
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  requiredPermissions?: string[]
  rateLimitType?: keyof typeof RATE_LIMITS
  checkEmailVerification?: boolean
  allowSuspended?: boolean
}

// Middleware result interface
interface AuthMiddlewareResult {
  success: boolean
  user?: AuthSession['user']
  session?: AuthSession
  error?: NextResponse
}

// Main authentication middleware
export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<AuthMiddlewareResult> {
  const {
    requireAuth = true,
    allowedRoles = [],
    requiredPermissions = [],
    rateLimitType = 'user',
    checkEmailVerification = true,
    allowSuspended = false
  } = options
  
  try {
    // Apply rate limiting using Redis-based system
    const rateLimitConfig = RATE_LIMITS[rateLimitType] as keyof typeof RateLimitConfigs
    const rateLimit = await checkAPIRateLimit(request, rateLimitConfig)
    
    if (!rateLimit.allowed) {
      const rateLimitInfo = {
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: rateLimit.reset,
        retryAfter: rateLimit.retryAfter
      }
      
      return {
        success: false,
        error: createErrorResponse(
          'RATE_LIMIT_EXCEEDED',
          'Rate limit exceeded. Please slow down your requests.',
          [],
          429,
          rateLimitInfo
        )
      }
    }
    
    // Get session
    const session = await auth() as AuthSession | null
    
    // Check if authentication is required
    if (requireAuth && !session) {
      return {
        success: false,
        error: createErrorResponse(
          'UNAUTHORIZED',
          'Authentication required',
          [],
          401
        )
      }
    }
    
    // If no auth required and no session, allow through
    if (!requireAuth && !session) {
      return { success: true }
    }
    
    // If we have a session, validate the user
    if (session) {
      const user = await getUserById(session.user.id)
      
      if (!user) {
        return {
          success: false,
          error: createErrorResponse(
            'USER_NOT_FOUND',
            'User not found',
            [],
            401
          )
        }
      }
      
      // Check account status
      if (!allowSuspended && user.status === 'suspended') {
        return {
          success: false,
          error: createErrorResponse(
            'ACCOUNT_SUSPENDED',
            'Your account has been suspended',
            [],
            403
          )
        }
      }
      
      if (user.status === 'inactive') {
        return {
          success: false,
          error: createErrorResponse(
            'ACCOUNT_INACTIVE',
            'Your account is inactive',
            [],
            403
          )
        }
      }
      
      // Check email verification if required
      if (checkEmailVerification && !user.emailVerified) {
        return {
          success: false,
          error: createErrorResponse(
            'EMAIL_NOT_VERIFIED',
            'Please verify your email address',
            [],
            403
          )
        }
      }
      
      // Check role-based access
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return {
          success: false,
          error: createErrorResponse(
            'FORBIDDEN',
            'Insufficient permissions for this resource',
            [],
            403
          )
        }
      }
      
      // Check specific permissions
      if (requiredPermissions.length > 0) {
        const userPermissions = ROLE_PERMISSIONS[user.role] || []
        const hasAllPermissions = requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        )
        
        if (!hasAllPermissions) {
          return {
            success: false,
            error: createErrorResponse(
              'FORBIDDEN',
              'Missing required permissions',
              requiredPermissions.filter(p => !userPermissions.includes(p)),
              403
            )
          }
        }
      }
      
      // Update user's last active timestamp (async, don't wait)
      updateLastActive(user._id).catch(console.error)
      
      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.displayName,
          image: user.profileImage,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified
        },
        session
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return {
      success: false,
      error: createErrorResponse(
        'INTERNAL_ERROR',
        'Authentication system error',
        [],
        500
      )
    }
  }
}

// Helper function to update user's last active timestamp
async function updateLastActive(userId: string): Promise<void> {
  try {
    // This would update the user's lastActiveAt field
    // Implementation depends on your user service
    // await updateUserLastActive(userId)
  } catch (error) {
    console.error('Error updating last active:', error)
  }
}

// Convenience middleware functions for common use cases

// Require authentication (any authenticated user)
export async function requireAuth(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withAuth(request, { requireAuth: true })
}

// Require customer role or higher
export async function requireCustomer(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: ['customer', 'creator', 'admin']
  })
}

// Require creator role or higher
export async function requireCreator(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: ['creator', 'admin']
  })
}

// Require admin role
export async function requireAdmin(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: ['admin']
  })
}

// Public route with optional auth
export async function publicRoute(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withAuth(request, {
    requireAuth: false,
    rateLimitType: 'catalog'
  })
}

// Admin route with high rate limits
export async function adminRoute(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: ['admin'],
    rateLimitType: 'admin'
  })
}

// Cart operations with user-specific rate limiting
export async function cartRoute(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withAuth(request, {
    requireAuth: true,
    rateLimitType: 'cart'
  })
}

// Order operations with stricter rate limiting
export async function orderRoute(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withAuth(request, {
    requireAuth: true,
    rateLimitType: 'orders'
  })
}

// Higher-order function to wrap API handlers with authentication
export function withAuthHandler<T extends any[]>(
  handler: (request: NextRequest, auth: AuthMiddlewareResult, ...args: T) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await withAuth(request, options)
    
    if (!authResult.success) {
      return authResult.error!
    }
    
    return handler(request, authResult, ...args)
  }
}

// Check if user has specific permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.includes(permission)
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || []
}

// Check if user can access resource
export function canAccessResource(
  userRole: UserRole,
  resourceUserId: string,
  currentUserId: string,
  permission: string
): boolean {
  // Admin can access everything
  if (userRole === 'admin') {
    return true
  }
  
  // Check if user has the required permission
  if (!hasPermission(userRole, permission)) {
    return false
  }
  
  // For "own" permissions, check if the resource belongs to the user
  if (permission.includes(':own_') && resourceUserId !== currentUserId) {
    return false
  }
  
  return true
}