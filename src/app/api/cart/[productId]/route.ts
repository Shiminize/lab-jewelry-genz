/**
 * Cart Item Management API Endpoints
 * Handles updating and removing specific items from cart
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

// Validation schemas
const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(10, 'Quantity must be between 0 and 10'),
  customizations: z.object({
    material: z.string().optional(),
    gemstone: z.string().optional(),
    size: z.string().optional(),
    engraving: z.object({
      text: z.string(),
      font: z.string(),
      position: z.string()
    }).optional(),
    personalizations: z.any().optional()
  }).optional(),
  sessionId: z.string().optional()
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

// Get cart for user or session
async function getCart(userId?: string, sessionId?: string) {
  if (!userId && !sessionId) {
    throw new Error('Either userId or sessionId is required')
  }

  if (userId) {
    return await CartModel.findByUser(userId)
  } else if (sessionId) {
    return await CartModel.findBySession(sessionId)
  }
  
  return null
}

/**
 * PUT /api/cart/[productId] - Update cart item quantity/customizations
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const clientIP = getClientIP(request)
    const isAllowed = await cartRateLimit.check(clientIP)
    if (!isAllowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // Validate request body
    const validationResult = updateItemSchema.safeParse(body)
    if (!validationResult.success) {
      return fail(
        'VALIDATION_ERROR', 
        'Invalid request data', 
        validationResult.error.errors,
        400
      )
    }

    const { quantity, customizations, sessionId } = validationResult.data
    const { productId } = params

    if (!session?.user?.id && !sessionId) {
      return fail('INVALID_REQUEST', 'Session ID required for guest users', null, 400)
    }

    const cart = await getCart(session?.user?.id, sessionId)
    
    if (!cart) {
      return fail('CART_NOT_FOUND', 'Cart not found', null, 404)
    }
    
    // Update cart item
    await cart.updateItem(productId, quantity, customizations)
    
    return ok({
      cart: {
        id: cart._id,
        userId: cart.userId,
        sessionId: cart.sessionId,
        items: cart.items,
        subtotal: cart.subtotal,
        estimatedTax: cart.estimatedTax,
        estimatedShipping: cart.estimatedShipping,
        estimatedTotal: cart.estimatedTotal,
        currency: cart.currency,
        itemCount: cart.itemCount,
        discountCodes: cart.discountCodes,
        lastUpdated: cart.lastUpdated
      }
    })

  } catch (error) {
    console.error('Cart PUT error:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Item not found in cart') {
        return fail('ITEM_NOT_FOUND', 'Item not found in cart', null, 404)
      }
      return fail('SERVER_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to update cart item', null, 500)
  }
}

/**
 * DELETE /api/cart/[productId] - Remove item from cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const clientIP = getClientIP(request)
    const isAllowed = await cartRateLimit.check(clientIP)
    if (!isAllowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const session = await getServerSession(authOptions)
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    const customizationsParam = url.searchParams.get('customizations')
    
    let customizations
    if (customizationsParam) {
      try {
        customizations = JSON.parse(customizationsParam)
      } catch (e) {
        return fail('INVALID_REQUEST', 'Invalid customizations parameter', null, 400)
      }
    }

    const { productId } = params

    if (!session?.user?.id && !sessionId) {
      return fail('INVALID_REQUEST', 'Session ID required for guest users', null, 400)
    }

    const cart = await getCart(session?.user?.id, sessionId || undefined)
    
    if (!cart) {
      return fail('CART_NOT_FOUND', 'Cart not found', null, 404)
    }
    
    // Remove item from cart
    await cart.removeItem(productId, customizations)
    
    return ok({
      cart: {
        id: cart._id,
        userId: cart.userId,
        sessionId: cart.sessionId,
        items: cart.items,
        subtotal: cart.subtotal,
        estimatedTax: cart.estimatedTax,
        estimatedShipping: cart.estimatedShipping,
        estimatedTotal: cart.estimatedTotal,
        currency: cart.currency,
        itemCount: cart.itemCount,
        discountCodes: cart.discountCodes,
        lastUpdated: cart.lastUpdated
      }
    })

  } catch (error) {
    console.error('Cart DELETE error:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Item not found in cart') {
        return fail('ITEM_NOT_FOUND', 'Item not found in cart', null, 404)
      }
      return fail('SERVER_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to remove cart item', null, 500)
  }
}