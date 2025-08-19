/**
 * Cart Merge API Endpoint
 * Handles merging guest cart with user cart when user signs in
 * Follows CLAUDE_RULES.md API envelope format and security standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CartModel } from '@/lib/schemas/cart.schema'
import { connectToDatabase } from '@/lib/mongoose'
import { z } from 'zod'
import { headers } from 'next/headers'
import { createRateLimiter } from '@/lib/auth-middleware'
import crypto from 'crypto'

// Rate limiter for cart operations (30/min per user per CLAUDE_RULES.md)
const cartRateLimit = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  limit: 30
})

// Validation schema
const mergeCartSchema = z.object({
  guestSessionId: z.string().min(1, 'Guest session ID is required')
})

// Success response helper (CLAUDE_RULES.md compliant)
function ok<T>(data: T, pagination?: any) {
  return NextResponse.json({
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
    meta: { 
      timestamp: new Date().toISOString(), 
      version: '1.0.0' 
    }
  })
}

// Error response helper (CLAUDE_RULES.md compliant)
function fail(code: string, message: string, details?: any, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: { 
      code, 
      message, 
      ...(details ? { details } : {}) 
    },
    meta: { 
      timestamp: new Date().toISOString(), 
      requestId: crypto.randomUUID() 
    }
  }, { status })
}

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const headersList = headers()
  return headersList.get('x-forwarded-for')?.split(',')[0] || 
         headersList.get('x-real-ip') || 
         request.ip || 
         '127.0.0.1'
}

/**
 * POST /api/cart/merge - Merge guest cart with user cart after sign in
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const clientIP = getClientIP(request)
    const isAllowed = await cartRateLimit.check(clientIP)
    if (!isAllowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'User must be signed in to merge cart', null, 401)
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = mergeCartSchema.safeParse(body)
    if (!validationResult.success) {
      return fail(
        'VALIDATION_ERROR', 
        'Invalid request data', 
        validationResult.error.errors,
        400
      )
    }

    const { guestSessionId } = validationResult.data
    const userId = session.user.id
    
    // Use the static method from the cart schema to merge carts
    const mergedCart = await CartModel.mergeGuestCart(guestSessionId, userId)
    
    if (!mergedCart) {
      return fail('GUEST_CART_NOT_FOUND', 'Guest cart not found', null, 404)
    }
    
    return ok({
      cart: {
        id: mergedCart._id,
        userId: mergedCart.userId,
        sessionId: mergedCart.sessionId,
        items: mergedCart.items,
        subtotal: mergedCart.subtotal,
        estimatedTax: mergedCart.estimatedTax,
        estimatedShipping: mergedCart.estimatedShipping,
        estimatedTotal: mergedCart.estimatedTotal,
        currency: mergedCart.currency,
        itemCount: mergedCart.itemCount,
        discountCodes: mergedCart.discountCodes,
        lastUpdated: mergedCart.lastUpdated
      },
      merged: true,
      message: 'Guest cart successfully merged with user cart'
    })

  } catch (error) {
    console.error('Cart merge error:', error)
    
    if (error instanceof Error) {
      return fail('SERVER_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to merge cart', null, 500)
  }
}