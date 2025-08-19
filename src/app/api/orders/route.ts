/**
 * Orders API Endpoints
 * Handles order management and retrieval
 * Follows CLAUDE_RULES.md API envelope format and security standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { DatabaseModels } from '@/lib/database-api'
import { z } from 'zod'
import { headers } from 'next/headers'
import { checkAPIRateLimit } from '@/lib/api-utils'
import crypto from 'crypto'

// Validation schemas
const createOrderSchema = z.object({
  cartId: z.string().min(1, 'Cart ID is required'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Street address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional()
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Street address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required')
  }).optional(),
  customerNotes: z.string().optional()
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


// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GG-${timestamp}-${random}`
}

/**
 * GET /api/orders - Get user's orders with pagination
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'ORDER')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const session = await auth()
    
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required', null, 401)
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50)
    const status = url.searchParams.get('status')

    // Build query
    const query: any = { userId: session.user.id }
    if (status) {
      query.status = status
    }

    // Get orders with pagination
    const orders = await DatabaseModels.Order
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    // Get total count for pagination
    const totalCount = await DatabaseModels.Order.countDocuments(query)
    const totalPages = Math.ceil(totalCount / limit)

    return ok(
      { orders },
      {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    )

  } catch (error) {
    console.error('Orders GET error:', error)
    return fail('SERVER_ERROR', 'Failed to fetch orders', null, 500)
  }
}

/**
 * POST /api/orders - Create new order (usually called after payment confirmation)
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'ORDER')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const session = await auth()
    const body = await request.json()
    
    // Validate request body
    const validationResult = createOrderSchema.safeParse(body)
    if (!validationResult.success) {
      return fail(
        'VALIDATION_ERROR', 
        'Invalid request data', 
        validationResult.error.errors,
        400
      )
    }

    const { 
      cartId, 
      paymentIntentId, 
      shippingAddress, 
      billingAddress,
      customerNotes 
    } = validationResult.data

    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required', null, 401)
    }

    // Find the cart
    const cart = await DatabaseModels.Cart.findById(cartId)
    if (!cart || cart.items.length === 0) {
      return fail('CART_NOT_FOUND', 'Cart not found or empty', null, 404)
    }

    // Verify cart belongs to user
    if (cart.userId?.toString() !== session.user.id) {
      return fail('FORBIDDEN', 'Cart does not belong to user', null, 403)
    }

    // Convert cart to order
    const orderItems = await cart.convertToOrder(session.user.id)
    
    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order with proper schema structure
    const order = await DatabaseModels.Order.create({
      orderNumber,
      userId: session.user.id,
      email: session.user.email || '',
      status: 'confirmed',
      items: orderItems.items,
      subtotal: orderItems.subtotal,
      shipping: orderItems.estimatedShipping,
      tax: orderItems.estimatedTax,
      discount: 0,
      total: orderItems.total,
      currency: 'USD',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        method: 'stripe',
        transactionId: paymentIntentId,
        stripePaymentIntentId: paymentIntentId,
        status: 'completed',
        amount: orderItems.total,
        currency: 'USD'
      },
      shipping: {
        method: 'standard',
        carrier: 'UPS',
        service: 'Ground',
        cost: orderItems.estimatedShipping,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending'
      },
      notes: customerNotes,
      discountCode: orderItems.discountCodes?.[0]?.code
    })

    // Clear the cart
    await cart.clearCart()

    // Send order confirmation email
    const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`
    try {
      const { sendOrderConfirmation } = await import('@/lib/email-service')
      await sendOrderConfirmation(order, customerName)
    } catch (error) {
      console.error('Failed to send order confirmation email:', error)
      // Don't fail the order creation if email fails
    }

    // Send guest account invitation if user not authenticated
    if (!session?.user?.id) {
      try {
        const { sendGuestAccountInvitation } = await import('@/lib/email-service')
        const inviteToken = require('crypto').randomBytes(32).toString('hex')
        // TODO: Store invite token in database for guest account creation
        await sendGuestAccountInvitation(order, inviteToken)
      } catch (error) {
        console.error('Failed to send guest invitation email:', error)
      }
    }

    // TODO: Update inventory quantities (fulfill reserved inventory)
    // TODO: Trigger fulfillment process
    // TODO: Create fulfillment job for processing team

    return ok({
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        currency: order.currency,
        itemCount: order.items.length,
        createdAt: order.createdAt,
        estimatedDelivery: order.shipping.estimatedDelivery
      }
    })

  } catch (error) {
    console.error('Order creation error:', error)
    
    if (error instanceof Error) {
      return fail('SERVER_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to create order', null, 500)
  }
}