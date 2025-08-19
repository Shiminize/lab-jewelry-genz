import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

// Admin role definitions
export type AdminRole = 'super-admin' | 'admin' | 'moderator' | 'viewer'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  permissions: AdminPermission[]
  lastLogin?: Date
  sessionId?: string
  twoFactorEnabled: boolean
  loginAttempts: number
  lockedUntil?: Date
}

export type AdminPermission = 
  | 'dashboard.view'
  | 'dashboard.edit'
  | 'inventory.view'
  | 'inventory.edit'
  | 'inventory.delete'
  | 'orders.view'
  | 'orders.edit'
  | 'orders.fulfill'
  | 'customers.view'
  | 'customers.edit'
  | 'marketing.view'
  | 'marketing.edit'
  | 'marketing.send'
  | 'creators.view'
  | 'creators.edit'
  | 'creators.payout'
  | 'analytics.view'
  | 'analytics.export'
  | 'settings.view'
  | 'settings.edit'
  | 'users.view'
  | 'users.edit'
  | 'users.delete'

// Role-based permission mappings
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  'super-admin': [
    'dashboard.view', 'dashboard.edit',
    'inventory.view', 'inventory.edit', 'inventory.delete',
    'orders.view', 'orders.edit', 'orders.fulfill',
    'customers.view', 'customers.edit',
    'marketing.view', 'marketing.edit', 'marketing.send',
    'creators.view', 'creators.edit', 'creators.payout',
    'analytics.view', 'analytics.export',
    'settings.view', 'settings.edit',
    'users.view', 'users.edit', 'users.delete'
  ],
  'admin': [
    'dashboard.view', 'dashboard.edit',
    'inventory.view', 'inventory.edit',
    'orders.view', 'orders.edit', 'orders.fulfill',
    'customers.view', 'customers.edit',
    'marketing.view', 'marketing.edit', 'marketing.send',
    'creators.view', 'creators.edit',
    'analytics.view', 'analytics.export',
    'settings.view'
  ],
  'moderator': [
    'dashboard.view',
    'inventory.view', 'inventory.edit',
    'orders.view', 'orders.edit',
    'customers.view',
    'marketing.view',
    'creators.view',
    'analytics.view'
  ],
  'viewer': [
    'dashboard.view',
    'inventory.view',
    'orders.view',
    'customers.view',
    'marketing.view',
    'creators.view',
    'analytics.view'
  ]
}

// Security configuration
const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
  requireTwoFactor: process.env.NODE_ENV === 'production',
  allowedIPs: process.env.ADMIN_ALLOWED_IPS?.split(',') || [],
  minPasswordLength: 12,
  requirePasswordComplexity: true
}

// Rate limiting for admin actions
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export class AdminSecurityManager {
  // Check if user has specific permission
  static hasPermission(user: AdminUser | null, permission: AdminPermission): boolean {
    if (!user) return false
    
    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return false
    }
    
    return user.permissions.includes(permission) || 
           ROLE_PERMISSIONS[user.role]?.includes(permission) || false
  }

  // Check if user can access specific admin route
  static canAccessRoute(user: AdminUser | null, route: string): boolean {
    if (!user) return false

    const routePermissions: Record<string, AdminPermission> = {
      '/admin': 'dashboard.view',
      '/admin/inventory': 'inventory.view',
      '/admin/orders': 'orders.view',
      '/admin/customers': 'customers.view',
      '/admin/email-marketing': 'marketing.view',
      '/admin/creators': 'creators.view',
      '/admin/analytics': 'analytics.view',
      '/admin/settings': 'settings.view',
      '/admin/users': 'users.view'
    }

    const requiredPermission = routePermissions[route]
    return requiredPermission ? this.hasPermission(user, requiredPermission) : false
  }

  // Validate admin session
  static async validateSession(sessionId: string): Promise<AdminUser | null> {
    // In a real implementation, this would validate against a database
    // For now, return mock admin user
    return {
      id: 'admin-1',
      email: 'admin@glowglitch.com',
      name: 'Super Admin',
      role: 'super-admin',
      permissions: ROLE_PERMISSIONS['super-admin'],
      lastLogin: new Date(),
      sessionId,
      twoFactorEnabled: true,
      loginAttempts: 0
    }
  }

  // Check rate limiting
  static checkRateLimit(identifier: string, limit: number = 60, windowMs: number = 60000): boolean {
    const now = Date.now()
    const window = rateLimitMap.get(identifier)

    if (!window || now > window.resetTime) {
      rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (window.count >= limit) {
      return false
    }

    window.count++
    return true
  }

  // Log security event
  static logSecurityEvent(event: {
    type: 'login' | 'logout' | 'permission_denied' | 'rate_limit' | 'suspicious_activity'
    userId?: string
    ip?: string
    userAgent?: string
    details?: any
  }) {
    // In production, this would log to a security monitoring system
    console.log(`[SECURITY] ${event.type}:`, {
      timestamp: new Date().toISOString(),
      ...event
    })
  }

  // Validate IP address
  static isIPAllowed(ip: string): boolean {
    if (SECURITY_CONFIG.allowedIPs.length === 0) return true
    return SECURITY_CONFIG.allowedIPs.includes(ip)
  }

  // Extract client IP from request
  static getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const connectingIP = request.headers.get('cf-connecting-ip')
    
    return (
      forwardedFor?.split(',')[0]?.trim() ||
      realIP ||
      connectingIP ||
      request.ip ||
      'unknown'
    )
  }

  // Generate secure session token
  static generateSessionToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < SECURITY_CONFIG.minPasswordLength) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.minPasswordLength} characters long`)
    }

    if (SECURITY_CONFIG.requirePasswordComplexity) {
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number')
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Check if action requires additional verification
  static requiresAdditionalVerification(action: string, role: AdminRole): boolean {
    const highRiskActions = [
      'users.delete',
      'inventory.delete',
      'creators.payout',
      'settings.edit'
    ]

    return highRiskActions.includes(action) && role !== 'super-admin'
  }

  // Audit trail for admin actions
  static async logAdminAction(action: {
    userId: string
    action: string
    resource: string
    resourceId?: string
    oldValue?: any
    newValue?: any
    ip: string
    userAgent: string
  }) {
    // In production, this would store in an audit log database
    console.log(`[AUDIT] Admin action:`, {
      timestamp: new Date().toISOString(),
      ...action
    })
  }
}

// Middleware helper for admin route protection
export async function protectAdminRoute(
  request: NextRequest,
  requiredPermission?: AdminPermission
): Promise<{
  isAuthorized: boolean
  user: AdminUser | null
  error?: string
}> {
  try {
    const ip = AdminSecurityManager.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check IP allowlist
    if (!AdminSecurityManager.isIPAllowed(ip)) {
      AdminSecurityManager.logSecurityEvent({
        type: 'permission_denied',
        ip,
        userAgent,
        details: 'IP not in allowlist'
      })
      return { isAuthorized: false, user: null, error: 'Access denied' }
    }

    // Check rate limiting
    if (!AdminSecurityManager.checkRateLimit(ip, 100, 60000)) {
      AdminSecurityManager.logSecurityEvent({
        type: 'rate_limit',
        ip,
        userAgent
      })
      return { isAuthorized: false, user: null, error: 'Rate limit exceeded' }
    }

    // Get session from cookie or header
    const sessionId = request.cookies.get('admin-session')?.value ||
                     request.headers.get('authorization')?.replace('Bearer ', '')

    if (!sessionId) {
      return { isAuthorized: false, user: null, error: 'No session' }
    }

    // Validate session
    const user = await AdminSecurityManager.validateSession(sessionId)
    if (!user) {
      return { isAuthorized: false, user: null, error: 'Invalid session' }
    }

    // Check specific permission if required
    if (requiredPermission && !AdminSecurityManager.hasPermission(user, requiredPermission)) {
      AdminSecurityManager.logSecurityEvent({
        type: 'permission_denied',
        userId: user.id,
        ip,
        userAgent,
        details: `Missing permission: ${requiredPermission}`
      })
      return { isAuthorized: false, user, error: 'Insufficient permissions' }
    }

    return { isAuthorized: true, user }

  } catch (error) {
    console.error('Admin route protection error:', error)
    return { isAuthorized: false, user: null, error: 'Security check failed' }
  }
}