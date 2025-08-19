/**
 * Order Details API Endpoint
 * Handles individual order retrieval and updates
 * Follows CLAUDE_RULES.md API envelope format and security standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { DatabaseModels } from '@/lib/database-api'
import { headers } from 'next/headers'
import { checkAPIRateLimit } from '@/lib/api-utils'
import crypto from 'crypto'

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


/**
 * GET /api/orders/[id] - Get specific order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Find order
    const order = await DatabaseModels.Order.findById(id).lean()
    
    if (!order) {
      return fail('ORDER_NOT_FOUND', 'Order not found', null, 404)
    }

    // Verify order belongs to user (or is admin)
    if (order.userId?.toString() !== session.user.id) {
      return fail('FORBIDDEN', 'Order does not belong to user', null, 403)
    }

    return ok({
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping?.cost || order.shipping,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        currency: order.currency,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        payment: {
          method: order.payment?.method,
          status: order.payment?.status,
          transactionId: order.payment?.transactionId
        },
        shippingDetails: order.shipping,
        customerNotes: order.notes,
        discountCode: order.discountCode,
        timeline: order.timeline,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    })

  } catch (error) {
    console.error('Order details GET error:', error)
    return fail('SERVER_ERROR', 'Failed to fetch order details', null, 500)
  }
}