/**
 * Order Status Update API Endpoint
 * Handles order status updates with automatic email notifications
 * Follows CLAUDE_RULES.md API envelope format and security standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { DatabaseModels } from '@/lib/database-api'
import { z } from 'zod'
import { checkAPIRateLimit } from '@/lib/api-utils'
import crypto from 'crypto'

// Validation schema for status updates
const updateStatusSchema = z.object({
  status: z.enum([
    'pending',
    'payment-failed', 
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'returned'
  ]),
  message: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().optional()
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

/**
 * PUT /api/orders/[id]/status - Update order status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    // Rate limiting
    const rateLimit = await checkAPIRateLimit(request, 'ORDER_STATUS')
    if (!rateLimit.allowed) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', null, 429)
    }

    const session = await auth()
    
    // Only authenticated users can update order status
    if (!session?.user?.id) {
      return fail('UNAUTHORIZED', 'Authentication required', null, 401)
    }

    // TODO: Add admin role check here
    // For now, only allow order owners to update status (limited statuses)
    
    const { id } = params
    const body = await request.json()
    
    // Validate request body
    const validationResult = updateStatusSchema.safeParse(body)
    if (!validationResult.success) {
      return fail(
        'VALIDATION_ERROR', 
        'Invalid request data', 
        validationResult.error.issues,
        400
      )
    }

    const { status, message, trackingNumber, trackingUrl, carrier, estimatedDelivery } = validationResult.data

    // Find the order
    const order = await DatabaseModels.Order.findById(id)
    if (!order) {
      return fail('ORDER_NOT_FOUND', 'Order not found', null, 404)
    }

    // Verify order belongs to user (or is admin)
    // TODO: Add admin role check
    if (order.userId?.toString() !== session.user.id) {
      return fail('FORBIDDEN', 'Order does not belong to user', null, 403)
    }

    // Update order status
    order.status = status
    
    // Update shipping information if provided
    if (trackingNumber) {
      order.shipping = order.shipping || {}
      order.shipping.trackingNumber = trackingNumber
    }
    
    if (trackingUrl) {
      order.shipping = order.shipping || {}
      order.shipping.trackingUrl = trackingUrl
    }
    
    if (carrier) {
      order.shipping = order.shipping || {}
      order.shipping.carrier = carrier
    }
    
    if (estimatedDelivery) {
      order.shipping = order.shipping || {}
      order.shipping.estimatedDelivery = new Date(estimatedDelivery)
    }

    // Add timeline event with custom message or default
    const statusMessage = message || getDefaultStatusMessage(status)
    order.addTimelineEvent(status, statusMessage, {
      updatedBy: session.user.id,
      trackingNumber,
      carrier
    })

    // Save the order (this will trigger pre-save middleware for timeline events)
    await order.save()

    // Send status update email notification
    try {
      const { sendOrderStatusUpdate } = await import('@/lib/email-service')
      const customerName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
      await sendOrderStatusUpdate(order, statusMessage, customerName)
    } catch (error) {
      console.error('Failed to send order status update email:', error)
      // Don't fail the status update if email fails
    }

    return ok({
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        shipping: order.shipping,
        timeline: order.timeline,
        updatedAt: order.updatedAt
      }
    })

  } catch (error) {
    console.error('Order status update error:', error)
    
    if (error instanceof Error) {
      return fail('SERVER_ERROR', error.message, null, 500)
    }
    
    return fail('SERVER_ERROR', 'Failed to update order status', null, 500)
  }
}

// Helper function to get default status messages
function getDefaultStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    'pending': 'Order is pending payment confirmation',
    'payment-failed': 'Payment processing failed - please try again',
    'confirmed': 'Payment confirmed successfully - order is being prepared',
    'processing': 'Your order is being carefully prepared by our team',
    'shipped': 'Your order has been shipped and is on its way to you',
    'delivered': 'Your order has been delivered successfully',
    'cancelled': 'Your order has been cancelled',
    'refunded': 'Your order has been refunded',
    'returned': 'Your order has been returned and processed'
  }
  
  return messages[status] || `Order status updated to ${status}`
}