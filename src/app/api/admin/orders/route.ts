import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse, checkAPIRateLimit } from '@/lib/api-utils'
import { OrderModel } from '@/lib/schemas/order.schema'
import connectDB from '@/lib/mongodb'

// Admin-specific order management endpoints
// Enhanced with bulk operations, advanced filtering, and admin-only features

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for admin endpoints
    const rateLimitResult = await checkAPIRateLimit(request, 100, 60) // 100 requests per minute
    if (!rateLimitResult.success) {
      return createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests', 429)
    }

    // Admin authentication check
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return createErrorResponse('UNAUTHORIZED', 'Admin access required', 401)
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    
    // Enhanced query parameters for admin interface
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 orders per page
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const shippingStatus = searchParams.get('shippingStatus')
    const customerEmail = searchParams.get('customerEmail')
    const orderNumber = searchParams.get('orderNumber')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const isGuest = searchParams.get('isGuest')
    const creatorId = searchParams.get('creatorId')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter query
    const filter: any = {}
    
    if (status) filter.status = status
    if (paymentStatus) filter.paymentStatus = paymentStatus
    if (shippingStatus) filter.shippingStatus = shippingStatus
    if (customerEmail) filter.email = { $regex: customerEmail, $options: 'i' }
    if (orderNumber) filter.orderNumber = { $regex: orderNumber, $options: 'i' }
    if (isGuest === 'true') filter.isGuest = true
    if (isGuest === 'false') filter.isGuest = { $ne: true }
    if (creatorId) filter['items.creator.creatorId'] = creatorId

    // Date range filtering
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Execute query with pagination
    const skip = (page - 1) * limit
    
    const [orders, totalCount, statusCounts] = await Promise.all([
      OrderModel.find(filter)
        .populate('userId', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      
      OrderModel.countDocuments(filter),
      
      // Get status distribution for admin metrics
      OrderModel.aggregate([
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }},
        { $sort: { count: -1 } }
      ])
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    // Admin-specific metrics
    const metrics = {
      totalOrders: totalCount,
      statusDistribution: statusCounts.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          totalValue: item.totalValue
        }
        return acc
      }, {} as any),
      averageOrderValue: totalCount > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      guestOrderPercentage: orders.filter(order => order.isGuest).length / orders.length * 100
    }

    return createSuccessResponse({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext,
        hasPrev
      },
      metrics
    })

  } catch (error) {
    console.error('Admin orders fetch error:', error)
    return createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch orders', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkAPIRateLimit(request, 50, 60) // 50 updates per minute
    if (!rateLimitResult.success) {
      return createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests', 429)
    }

    // Admin authentication check
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return createErrorResponse('UNAUTHORIZED', 'Admin access required', 401)
    }

    await connectDB()

    const body = await request.json()
    const { action, orderIds, updates } = body

    if (action === 'bulk-status-update') {
      // Bulk status update for multiple orders
      const { status, message, trackingNumber, carrier, estimatedDelivery } = updates

      if (!status || !Array.isArray(orderIds) || orderIds.length === 0) {
        return createErrorResponse('INVALID_INPUT', 'Status and order IDs required', 400)
      }

      // Update multiple orders
      const updateData: any = {
        status,
        $push: {
          timeline: {
            status,
            message: message || `Status updated to ${status} by admin`,
            createdAt: new Date(),
            updatedBy: session.user.id
          }
        }
      }

      // Add shipping information if provided
      if (status === 'shipped' && trackingNumber) {
        updateData.shippingStatus = 'shipped'
        updateData['shipping.trackingNumber'] = trackingNumber
        updateData['shipping.carrier'] = carrier
        updateData['shipping.shippedAt'] = new Date()
        if (estimatedDelivery) {
          updateData['shipping.estimatedDelivery'] = new Date(estimatedDelivery)
        }
      }

      const result = await OrderModel.updateMany(
        { _id: { $in: orderIds } },
        updateData
      )

      return createSuccessResponse({
        modifiedCount: result.modifiedCount,
        message: `Updated ${result.modifiedCount} orders`
      })
    }

    if (action === 'bulk-export') {
      // Export orders data for admin reporting
      const orders = await OrderModel.find({ _id: { $in: orderIds } })
        .populate('userId', 'name email')
        .lean()

      // Transform for CSV export
      const exportData = orders.map(order => ({
        orderNumber: order.orderNumber,
        customerEmail: order.email,
        customerName: order.userId ? `${order.userId.name}` : `${order.guestDetails?.firstName} ${order.guestDetails?.lastName}`,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        currency: order.currency,
        createdAt: order.createdAt,
        isGuest: order.isGuest || false,
        itemCount: order.items.length,
        shippingMethod: order.shipping?.method,
        trackingNumber: order.shipping?.trackingNumber
      }))

      return createSuccessResponse({
        exportData,
        format: 'csv',
        filename: `orders-export-${new Date().toISOString().split('T')[0]}.csv`
      })
    }

    return createErrorResponse('INVALID_ACTION', 'Invalid bulk action', 400)

  } catch (error) {
    console.error('Admin orders bulk operation error:', error)
    return createErrorResponse('INTERNAL_SERVER_ERROR', 'Bulk operation failed', 500)
  }
}