/**
 * Shopping Cart API Endpoints
 * Handles cart operations for guest and authenticated users
 * Follows CLAUDE_RULES.md API envelope format and security standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CartModel } from '@/lib/schemas/cart.schema'
import { connectToDatabase } from '@/lib/mongoose'
import { z } from 'zod'
import { checkAPIRateLimit } from '@/lib/api-utils'
import crypto from 'crypto'

// Validation schemas
const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10'),
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
  }).optional()
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

// Get or create cart based on user session or guest session
async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (!userId && !sessionId) {
    throw new Error('Either userId or sessionId is required')
  }

  // Try to find existing cart
  let cart = null
  if (userId) {
    cart = await CartModel.findOne({ userId, isActive: true })
  } else if (sessionId) {
    cart = await CartModel.findOne({ sessionId, isActive: true })
  }

  // Create new cart if none exists
  if (!cart) {
    cart = await CartModel.create({
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      items: [],
      subtotal: 0,
      estimatedTax: 0,
      estimatedShipping: 0,
      estimatedTotal: 0,
      isActive: true
    })
  }

  return cart
}

/**
 * GET /api/cart - Get user's cart
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'CART')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const session = await auth()
    const sessionId = request.headers.get('x-session-id') || crypto.randomUUID()
    
    const cart = await getOrCreateCart(session?.user?.id, sessionId || undefined)

    return ok({
      cart: {
        id: cart._id,
        items: cart.items,
        itemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        subtotal: cart.subtotal,
        estimatedTax: cart.estimatedTax,
        estimatedShipping: cart.estimatedShipping,
        estimatedTotal: cart.estimatedTotal,
        currency: cart.currency,
        lastUpdated: cart.lastUpdated
      }
    })

  } catch (error) {
    console.error('Cart GET error:', error)
    return fail('SERVER_ERROR', 'Failed to fetch cart', null, 500)
  }
}

/**
 * POST /api/cart - Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'CART')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const session = await auth()
    const body = await request.json()
    
    // Validate request body
    const validationResult = addToCartSchema.safeParse(body)
    if (!validationResult.success) {
      return fail(
        'VALIDATION_ERROR', 
        'Invalid request data', 
        validationResult.error.issues,
        400
      )
    }

    const { productId, quantity, customizations } = validationResult.data
    const sessionId = request.headers.get('x-session-id') || crypto.randomUUID()
    
    const cart = await getOrCreateCart(session?.user?.id, sessionId || undefined)
    
    // Add item to cart (this will handle existing item updates)
    await cart.addItem(productId, quantity, customizations)

    return ok({
      cart: {
        id: cart._id,
        items: cart.items,
        itemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        subtotal: cart.subtotal,
        estimatedTax: cart.estimatedTax,
        estimatedShipping: cart.estimatedShipping,
        estimatedTotal: cart.estimatedTotal,
        currency: cart.currency
      }
    })

  } catch (error) {
    console.error('Cart POST error:', error)
    
    if (error instanceof Error) {
      return fail('SERVER_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to add item to cart', null, 500)
  }
}

/**
 * DELETE /api/cart - Clear entire cart
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'CART')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const session = await auth()
    const sessionId = request.headers.get('x-session-id') || crypto.randomUUID()
    
    const cart = await getOrCreateCart(session?.user?.id, sessionId || undefined)
    
    // Clear the cart
    await cart.clearCart()

    return ok({
      cart: {
        id: cart._id,
        items: cart.items,
        itemCount: 0,
        subtotal: cart.subtotal,
        estimatedTax: cart.estimatedTax,
        estimatedShipping: cart.estimatedShipping,
        estimatedTotal: cart.estimatedTotal,
        currency: cart.currency
      }
    })

  } catch (error) {
    console.error('Cart DELETE error:', error)
    return fail('SERVER_ERROR', 'Failed to clear cart', null, 500)
  }
}