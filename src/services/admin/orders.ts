import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { type OrderWidgetData, enrichOrdersWithWidgetData, getOrderWidgetData } from './order-widget-enrichment'
import { validateRefund, validateStatusChange } from './order-validation'

export interface AdminOrderSummary {
  id: string
  orderNumber: string
  status: string
  customerEmail?: string
  total: number
  createdAt?: Date
  paymentStatus?: string
  widgetData?: OrderWidgetData
}

export interface AdminOrderDetail extends AdminOrderSummary {
  items: Array<{
    name?: string
    productId?: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  shipping?: {
    method?: string
    carrier?: string
    trackingNumber?: string
    estimatedDelivery?: Date
    deliveredAt?: Date
  }
  payment?: {
    method?: string
    status?: string
    transactionId?: string
  }
  shippingAddress?: Record<string, unknown>
  billingAddress?: Record<string, unknown>
  creator?: {
    creatorId?: string
    referralCode?: string
    commissionRate?: number
    commissionAmount?: number
  }
  widgetData?: OrderWidgetData
}

export interface AdminOrderStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  pendingOrders: number
  fulfilledOrders: number
}

// Type guard or helper for JSON fields
function parseJson<T>(json: Prisma.JsonValue | null): T | undefined {
  if (!json || typeof json !== 'object') return undefined
  return json as unknown as T
}

export async function listAdminOrders(limit = 100, includeWidgetData = false): Promise<AdminOrderSummary[]> {
  try {
    const docs = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        customerEmail: true,
        payment: true, // JSON field
      }
    })

    const orders = docs.map((doc) => {
      const payment = parseJson<{ status?: string, method?: string }>(doc.payment)
      return {
        id: doc.id,
        orderNumber: doc.orderNumber,
        status: doc.status,
        total: doc.total,
        createdAt: doc.createdAt,
        paymentStatus: payment?.status ?? 'pending',
        customerEmail: doc.customerEmail,
      }
    })

    if (includeWidgetData) {
      const widgetDataMap = await enrichOrdersWithWidgetData(orders)
      return orders.map((order) => ({
        ...order,
        widgetData: widgetDataMap.get(order.orderNumber),
      }))
    }

    return orders
  } catch (error) {
    console.warn('Failed to list admin orders', error)
    return []
  }
}

export async function getAdminOrder(idOrNumber: string, includeWidgetData = false): Promise<AdminOrderDetail | null> {
  try {
    const doc = await prisma.order.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { orderNumber: idOrNumber }
        ]
      }
    })

    if (!doc) return null

    const items = (parseJson<any[]>(doc.items) || []).map((item: any) => ({
      name: item?.name ?? item?.productName ?? 'Unknown Product',
      productId: item?.productId ?? item?.product?._id ?? undefined,
      quantity: item?.quantity ?? 0,
      unitPrice: item?.unitPrice ?? 0,
      subtotal: (item?.quantity ?? 0) * (item?.unitPrice ?? 0),
    }))

    const payment = parseJson<any>(doc.payment)
    const shipping = parseJson<any>(doc.shipping)
    const shippingAddress = parseJson<Record<string, unknown>>(doc.shippingAddress)
    const billingAddress = parseJson<Record<string, unknown>>(doc.billingAddress)
    // Creator not currently in schema, omit or add to metadata if needed. 
    // Assuming metadata might hold creator info for now.
    const metadata = parseJson<any>(doc.metadata)

    const orderSummary: AdminOrderDetail = {
      id: doc.id,
      orderNumber: doc.orderNumber,
      status: doc.status,
      total: doc.total,
      createdAt: doc.createdAt,
      paymentStatus: payment?.status ?? 'pending',
      customerEmail: doc.customerEmail,
      items,
      shipping: shipping,
      payment: payment,
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      creator: metadata?.creator,
      widgetData: undefined
    }

    if (includeWidgetData) {
      orderSummary.widgetData = await getOrderWidgetData(doc.orderNumber, doc.customerEmail)
    }

    return orderSummary
  } catch (error) {
    console.warn('Failed to fetch admin order', error)
    return null
  }
}

export async function getAdminOrderStats(): Promise<AdminOrderStats> {
  try {
    // Aggregation in Prisma
    const groupResult = await prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { total: true },
    })

    let totalRevenue = 0
    let totalOrders = 0
    let pendingOrders = 0
    let fulfilledOrders = 0

    for (const group of groupResult) {
      const count = group._count._all
      const revenue = group._sum.total ?? 0

      totalOrders += count
      totalRevenue += revenue

      if (['pending', 'processing', 'confirmed'].includes(group.status)) {
        pendingOrders += count
      }
      if (['shipped', 'delivered'].includes(group.status)) {
        fulfilledOrders += count
      }
    }

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      pendingOrders,
      fulfilledOrders,
    }
  } catch (error) {
    console.warn('Failed to compute admin order stats', error)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      fulfilledOrders: 0,
    }
  }
}

export async function updateOrderStatus(id: string, newStatus: string) {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new Error('Order not found')

  const check = validateStatusChange(order.status, newStatus)
  if (!check.valid) throw new Error(check.reason)

  await prisma.order.update({
    where: { id },
    data: {
      status: newStatus,
      statusHistory: {
        push: { status: newStatus, changedAt: new Date() }
      }
    }
  })
}

export async function refundOrder(id: string, amount: number) {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new Error('Order not found')

  const payment = parseJson<any>(order.payment) || { status: 'pending', amount: 0 }
  // Extract refunded amount from returnInfo if available
  const returnInfo = parseJson<any>(order.returnInfo) || { refundedAmount: 0 }
  const currentRefunded = returnInfo.refundedAmount || 0

  const check = validateRefund({
    total: order.total,
    payment,
    refundedAmount: currentRefunded
  }, amount)

  if (!check.valid) throw new Error(check.reason)

  const newRefundTotal = currentRefunded + amount
  const newPaymentStatus = newRefundTotal >= order.total ? 'refunded' : 'partially_refunded'

  await prisma.order.update({
    where: { id },
    data: {
      payment: { ...payment, status: newPaymentStatus, refundedAmount: newRefundTotal },
      returnInfo: { ...returnInfo, refundedAmount: newRefundTotal, lastRefundAt: new Date() }
    }
  })
}
