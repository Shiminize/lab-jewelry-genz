import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_COOKIE_NAME = 'auth-token'

export interface UserPayload extends JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'user' | 'customer'
  status?: string
  emailVerified?: boolean
  [key: string]: any
}

interface CustomJWTPayload extends JWTPayload {
  userId: string
  email: string
  role: string
  status?: string
  emailVerified?: boolean
}

// Create JWT token (Edge Runtime compatible)
export async function createToken(payload: UserPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .setSubject(payload.userId)
    .setIssuer('glowglitch')
    .setAudience('glowglitch-app')
    .sign(secret)
}

// Verify JWT token (Edge Runtime compatible)
export async function verifyToken(token: string): Promise<CustomJWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'glowglitch',
      audience: 'glowglitch-app'
    })
    
    return payload as CustomJWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Get current user from cookies (server-side)
export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(JWT_COOKIE_NAME)?.value
    
    if (!token) {
      return null
    }
    
    const payload = await verifyToken(token)
    
    if (!payload || !payload.userId || !payload.email || !payload.role) {
      return null
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role as 'admin' | 'user' | 'customer',
      status: payload.status,
      emailVerified: payload.emailVerified,
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

// Set auth cookie (server-side)
export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set({
    name: JWT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  })
}

// Clear auth cookie (server-side)
export function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete(JWT_COOKIE_NAME)
}

// Check if user has required role
export function hasRole(userRole: string, requiredRole: string | string[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }
  
  return userRole === requiredRole
}

// Check if user is admin
export function isAdmin(userRole: string): boolean {
  return userRole === 'admin'
}

// Check if user is authenticated (has valid role)
export function isAuthenticated(userRole?: string): boolean {
  return userRole !== undefined && ['admin', 'user', 'customer'].includes(userRole)
}

// Refresh token utilities
export interface RefreshTokenPayload extends JWTPayload {
  userId: string
  email: string
  tokenVersion: number
  [key: string]: any
}

// Create refresh token (longer expiry)
export async function createRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Refresh token expires in 7 days
    .setSubject(payload.userId)
    .setIssuer('glowglitch')
    .setAudience('glowglitch-refresh')
    .sign(secret)
}

// Verify refresh token
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'glowglitch',
      audience: 'glowglitch-refresh'
    })
    
    return payload as unknown as RefreshTokenPayload
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

// Client-side cookie utilities (for use in client components)
export const clientAuth = {
  // Get token from client-side cookies
  getToken(): string | null {
    if (typeof document === 'undefined') return null
    
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${JWT_COOKIE_NAME}=`)
    )
    
    if (!authCookie) return null
    
    return authCookie.split('=')[1]
  },
  
  // Remove token (logout)
  removeToken(): void {
    if (typeof document === 'undefined') return
    
    document.cookie = `${JWT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  },
  
  // Check if user is logged in (client-side)
  isLoggedIn(): boolean {
    return this.getToken() !== null
  }
}

// Error types for better error handling
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AuthError'
  }
}

// API Response Types following CLAUDE_RULES.md
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  meta: {
    timestamp: string
    version: string
    requestId?: string
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  meta: {
    timestamp: string
    requestId: string
  }
}

// API Response Helpers following CLAUDE_RULES.md
export function ok<T>(data: T, pagination?: any, requestId?: string): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
    meta: { 
      timestamp: new Date().toISOString(), 
      version: '1.0.0',
      ...(requestId ? { requestId } : {})
    }
  }
}

export function fail(code: string, message: string, details?: any, requestId?: string): ApiErrorResponse {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
    meta: { 
      timestamp: new Date().toISOString(), 
      requestId: requestId || crypto.randomUUID() 
    }
  }
}

// Common auth error codes
export const AUTH_ERRORS = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  MISSING_TOKEN: 'MISSING_TOKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const

// Rate Limiting Types and Functions (matching existing auth types)
import type { RateLimitInfo } from '@/types/auth'

export interface RateLimitResult extends RateLimitInfo {
  allowed: boolean
  reset: number
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function following CLAUDE_RULES.md
export function checkRateLimit(
  identifier: string, 
  limit: number, 
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const record = rateLimitStore.get(key)
  const resetTime = Math.floor((now + windowMs) / 1000)
  
  if (!record || now > record.resetTime) {
    const newResetTime = now + windowMs
    rateLimitStore.set(key, { count: 1, resetTime: newResetTime })
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      reset: resetTime
    }
  }
  
  if (record.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset: Math.floor(record.resetTime / 1000)
    }
  }
  
  record.count++
  return {
    allowed: true,
    limit,
    remaining: limit - record.count,
    reset: Math.floor(record.resetTime / 1000)
  }
}

// Rate limit headers helper
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString()
  }
}