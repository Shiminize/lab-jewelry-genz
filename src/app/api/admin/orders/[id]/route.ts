import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { fail, success } from '@/lib/api-utils'
import { checkAPIRateLimit } from '@/lib/rate-limiting'
import { OrderModel } from '@/lib/schemas/order.schema'
import connectDB from '@/lib/mongodb'
import { emailService } from '@/lib/email-service'

// Admin-specific individual order management
// Enhanced with admin-only operations and detailed order management

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await checkAPIRateLimit(request, 100, 60)
    if (!rateLimitResult.success) {
      return fail('RATE_LIMIT_EXCEEDED', 'Too many requests', 429)
    }

    // Admin authentication check
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return fail('UNAUTHORIZED', 'Admin access required', 401)
    }

    await connectDB()

    const orderId = params.id

    // Get order with full details including user information
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone profile addresses createdAt')
      .lean()

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    // Get customer's order history for admin context
    const customerOrderHistory = await Order.find({
      $or: [
        { userId: order.userId },
        { email: order.email }
      ]
    })
    .select('orderNumber status total createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

    // Calculate customer metrics
    const customerMetrics = {
      totalOrders: customerOrderHistory.length,
      totalSpent: customerOrderHistory.reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: customerOrderHistory.length > 0 
        ? customerOrderHistory.reduce((sum, o) => sum + o.total, 0) / customerOrderHistory.length 
        : 0,
      firstOrderDate: customerOrderHistory[customerOrderHistory.length - 1]?.createdAt,
      lastOrderDate: customerOrderHistory[0]?.createdAt
    }

    // Admin-specific order details
    const adminOrderDetails = {
      ...order,
      adminMetadata: {
        canBeCancelled: ['pending', 'confirmed'].includes(order.status),
        canBeRefunded: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status),
        canBeShipped: order.status === 'processing',
        requiresAction: order.status === 'pending' && order.paymentStatus === 'failed',
        riskLevel: calculateRiskLevel(order),
        profitMargin: calculateProfitMargin(order),
        fulfillmentPriority: calculateFulfillmentPriority(order)
      },
      customerMetrics,
      customerOrderHistory
    }

    return NextResponse.json({
      success: true,
      data: { order: adminOrderDetails },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })

  } catch (error) {
    console.error('Admin order fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'Failed to fetch order details' 
        } 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, 30, 60) // 30 updates per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
        { status: 429 }
      )
    }

    // Admin authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      )
    }

    await connectDB()

    const orderId = params.id
    const body = await request.json()
    const { action, ...updateData } = body

    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      )
    }

    let result
    let emailSent = false

    switch (action) {
      case 'update-status':
        result = await updateOrderStatus(order, updateData, session.user.id)
        emailSent = await sendStatusUpdateEmail(order, updateData)
        break

      case 'add-tracking':
        result = await addTrackingInformation(order, updateData, session.user.id)
        emailSent = await sendTrackingEmail(order, updateData)
        break

      case 'process-refund':
        result = await processRefund(order, updateData, session.user.id)
        emailSent = await sendRefundEmail(order, updateData)
        break

      case 'update-shipping':
        result = await updateShippingInfo(order, updateData, session.user.id)
        break

      case 'add-note':
        result = await addOrderNote(order, updateData, session.user.id)
        break

      case 'cancel-order':
        result = await cancelOrder(order, updateData, session.user.id)
        emailSent = await sendCancellationEmail(order, updateData)
        break

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action specified' } },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: { 
        order: result,
        emailSent,
        message: getActionSuccessMessage(action)
      }
    })

  } catch (error) {
    console.error('Admin order update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'Failed to update order' 
        } 
      },
      { status: 500 }
    )
  }
}

// Helper functions for order management

async function updateOrderStatus(order: any, updateData: any, adminId: string) {
  const { status, message, notifyCustomer = true } = updateData

  // Validate status transition
  if (!isValidStatusTransition(order.status, status)) {
    throw new Error(`Invalid status transition from ${order.status} to ${status}`)
  }

  // Update order status and timeline
  order.status = status
  order.timeline.push({
    status,
    message: message || `Status updated to ${status} by admin`,
    createdAt: new Date(),
    updatedBy: adminId
  })

  // Update related status fields
  if (status === 'shipped') {
    order.shippingStatus = 'shipped'
    order.shipping.shippedAt = new Date()
  } else if (status === 'delivered') {
    order.shippingStatus = 'delivered'
    order.shipping.deliveredAt = new Date()
  } else if (status === 'cancelled') {
    order.paymentStatus = 'refunded'
  }

  await order.save()
  return order
}

async function addTrackingInformation(order: any, updateData: any, adminId: string) {
  const { trackingNumber, carrier, service, estimatedDelivery } = updateData

  order.shipping = {
    ...order.shipping,
    trackingNumber,
    carrier,
    service,
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
    trackingUrl: generateTrackingUrl(carrier, trackingNumber)
  }

  if (order.status === 'processing') {
    order.status = 'shipped'
    order.shippingStatus = 'shipped'
    order.shipping.shippedAt = new Date()
  }

  order.timeline.push({
    status: 'tracking-added',
    message: `Tracking information added: ${carrier} ${trackingNumber}`,
    createdAt: new Date(),
    updatedBy: adminId
  })

  await order.save()
  return order
}

async function processRefund(order: any, updateData: any, adminId: string) {
  const { amount, reason, refundId } = updateData

  // Add refund to payment details
  if (!order.payment.refunds) {
    order.payment.refunds = []
  }

  order.payment.refunds.push({
    id: refundId || `refund_${Date.now()}`,
    amount,
    reason,
    createdAt: new Date(),
    processedBy: adminId
  })

  // Update payment status
  const totalRefunded = order.payment.refunds.reduce((sum: number, refund: any) => sum + refund.amount, 0)
  if (totalRefunded >= order.total) {
    order.paymentStatus = 'refunded'
    order.status = 'refunded'
  } else {
    order.paymentStatus = 'partially-refunded'
  }

  order.timeline.push({
    status: 'refund-processed',
    message: `Refund processed: $${amount} - ${reason}`,
    createdAt: new Date(),
    updatedBy: adminId
  })

  await order.save()
  return order
}

async function updateShippingInfo(order: any, updateData: any, adminId: string) {
  const { method, cost, estimatedDelivery } = updateData

  order.shipping = {
    ...order.shipping,
    method,
    cost,
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
  }

  order.timeline.push({
    status: 'shipping-updated',
    message: `Shipping information updated by admin`,
    createdAt: new Date(),
    updatedBy: adminId
  })

  await order.save()
  return order
}

async function addOrderNote(order: any, updateData: any, adminId: string) {
  const { note, isInternal = true } = updateData

  if (!order.adminNotes) {
    order.adminNotes = []
  }

  order.adminNotes.push({
    note,
    isInternal,
    createdAt: new Date(),
    createdBy: adminId
  })

  order.timeline.push({
    status: 'note-added',
    message: isInternal ? 'Internal note added' : 'Customer note added',
    createdAt: new Date(),
    updatedBy: adminId
  })

  await order.save()
  return order
}

async function cancelOrder(order: any, updateData: any, adminId: string) {
  const { reason, refundAmount, notifyCustomer = true } = updateData

  // Validate cancellation eligibility
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new Error('Order cannot be cancelled in current status')
  }

  order.status = 'cancelled'
  order.paymentStatus = refundAmount > 0 ? 'refunded' : order.paymentStatus

  order.timeline.push({
    status: 'cancelled',
    message: `Order cancelled by admin: ${reason}`,
    createdAt: new Date(),
    updatedBy: adminId
  })

  // Process refund if specified
  if (refundAmount > 0) {
    if (!order.payment.refunds) {
      order.payment.refunds = []
    }
    
    order.payment.refunds.push({
      id: `cancel_refund_${Date.now()}`,
      amount: refundAmount,
      reason: `Order cancellation: ${reason}`,
      createdAt: new Date(),
      processedBy: adminId
    })
  }

  await order.save()
  return order
}

// Helper functions
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'pending': ['confirmed', 'cancelled', 'payment-failed'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'returned'],
    'delivered': ['returned'],
    'payment-failed': ['pending', 'cancelled']
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
}

function calculateRiskLevel(order: any): 'low' | 'medium' | 'high' {
  let riskScore = 0
  
  if (order.isGuest) riskScore += 10
  if (order.total > 5000) riskScore += 15
  if (order.paymentStatus === 'failed') riskScore += 20
  if (!order.userId) riskScore += 10
  
  if (riskScore >= 30) return 'high'
  if (riskScore >= 15) return 'medium'
  return 'low'
}

function calculateProfitMargin(order: any): number {
  // Simplified profit calculation - 65% gross margin as per PRD
  const grossMargin = 0.65
  return order.subtotal * grossMargin
}

function calculateFulfillmentPriority(order: any): 'low' | 'medium' | 'high' | 'urgent' {
  if (order.shipping?.method === 'express') return 'urgent'
  if (order.total > 3000) return 'high'
  if (order.items.some((item: any) => item.creator)) return 'medium'
  return 'low'
}

function generateTrackingUrl(carrier: string, trackingNumber: string): string {
  const trackingUrls: Record<string, string> = {
    'UPS': `https://www.ups.com/track?track=yes&trackNums=${trackingNumber}`,
    'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
  }
  
  return trackingUrls[carrier] || `https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`
}

async function sendStatusUpdateEmail(order: any, updateData: any): Promise<boolean> {
  try {
    await emailService.sendOrderStatusUpdate(order.email, {
      orderNumber: order.orderNumber,
      status: updateData.status,
      message: updateData.message,
      trackingNumber: order.shipping?.trackingNumber,
      estimatedDelivery: order.shipping?.estimatedDelivery
    })
    return true
  } catch (error) {
    console.error('Failed to send status update email:', error)
    return false
  }
}

async function sendTrackingEmail(order: any, updateData: any): Promise<boolean> {
  try {
    await emailService.sendShippingNotification(order.email, {
      orderNumber: order.orderNumber,
      trackingNumber: updateData.trackingNumber,
      carrier: updateData.carrier,
      estimatedDelivery: updateData.estimatedDelivery,
      trackingUrl: generateTrackingUrl(updateData.carrier, updateData.trackingNumber)
    })
    return true
  } catch (error) {
    console.error('Failed to send tracking email:', error)
    return false
  }
}

async function sendRefundEmail(order: any, updateData: any): Promise<boolean> {
  try {
    await emailService.sendRefundNotification(order.email, {
      orderNumber: order.orderNumber,
      refundAmount: updateData.amount,
      reason: updateData.reason,
      processingTime: '3-5 business days'
    })
    return true
  } catch (error) {
    console.error('Failed to send refund email:', error)
    return false
  }
}

async function sendCancellationEmail(order: any, updateData: any): Promise<boolean> {
  try {
    await emailService.sendOrderCancellation(order.email, {
      orderNumber: order.orderNumber,
      reason: updateData.reason,
      refundAmount: updateData.refundAmount
    })
    return true
  } catch (error) {
    console.error('Failed to send cancellation email:', error)
    return false
  }
}

function getActionSuccessMessage(action: string): string {
  const messages: Record<string, string> = {
    'update-status': 'Order status updated successfully',
    'add-tracking': 'Tracking information added successfully',
    'process-refund': 'Refund processed successfully',
    'update-shipping': 'Shipping information updated successfully',
    'add-note': 'Note added successfully',
    'cancel-order': 'Order cancelled successfully'
  }
  
  return messages[action] || 'Operation completed successfully'
}