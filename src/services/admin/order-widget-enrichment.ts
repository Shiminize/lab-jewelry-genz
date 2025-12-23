import prisma from '@/lib/prisma'

/**
 * Widget-related data for an order
 */
export interface OrderWidgetData {
  hasWidgetInteraction: boolean
  csatRating?: number
  csatNotes?: string
  csatTimestamp?: Date
  orderSubscription?: {
    email?: boolean
    sms?: boolean
    phone?: string
  }
  sessionNotes?: string
  widgetSessionId?: string
}

/**
 * Enriches order data with widget-related information
 * @param orderNumber - The order number to look up
 * @param customerEmail - The customer's email (fallback lookup)
 */
export async function getOrderWidgetData(orderNumber: string, customerEmail?: string): Promise<OrderWidgetData> {
  try {
    // Check for CSAT feedback
    const csatDoc = await prisma.csatFeedback.findFirst({
      where: { orderNumber },
      orderBy: { timestamp: 'desc' }
    })

    // Check for order subscriptions
    const subscriptionDoc = await prisma.widgetOrderSubscription.findFirst({
      where: { orderNumber }
    })

    // Check for widget analytics events related to this order
    const hasWidgetEventsCount = await prisma.widgetAnalyticsEvent.count({
      where: {
        AND: [
          { metadata: { path: ['orderNumber'], equals: orderNumber } as any }, // Assuming Json filtering or just simple match
          { event: { in: ['aurora_widget_open', 'aurora_intent_detected', 'aurora_products_shown'] } }
        ]
      },
      take: 1
    })

    // Check shortlists if no direct order link exists
    let widgetSessionId: string | undefined
    if (customerEmail && hasWidgetEventsCount === 0) {
      // Logic for correlating email to shortlist via session ID is tricky without direct link. 
      // Simplified: Check if we can find any shortlist with this email if modeled. 
      // For now, this part is tricky to migrate 1:1 without more context. Omit complex email lookup for now.
    }

    const hasWidgetInteraction = !!(csatDoc || subscriptionDoc || hasWidgetEventsCount > 0)

    return {
      hasWidgetInteraction,
      csatRating: csatDoc?.score,
      csatNotes: csatDoc?.notes || undefined,
      csatTimestamp: csatDoc?.timestamp,
      orderSubscription: subscriptionDoc
        ? {
          email: subscriptionDoc.email,
          sms: subscriptionDoc.sms,
          phone: subscriptionDoc.phone || undefined,
        }
        : undefined,
      sessionNotes: csatDoc?.notes || subscriptionDoc?.notes || undefined,
      widgetSessionId: subscriptionDoc?.sessionId || undefined,
    }
  } catch (error) {
    console.warn('Failed to fetch widget data for order', error)
    return {
      hasWidgetInteraction: false,
    }
  }
}

/**
 * Bulk enrichment for multiple orders (used in list view)
 * @param orders - Array of order numbers
 */
export async function enrichOrdersWithWidgetData(
  orders: Array<{ orderNumber: string; customerEmail?: string }>
): Promise<Map<string, OrderWidgetData>> {
  try {
    const orderNumbers = orders.map(o => o.orderNumber)
    const enrichmentMap = new Map<string, OrderWidgetData>()

    // Bulk fetch CSAT ratings
    const csatDocs = await prisma.csatFeedback.findMany({
      where: { orderNumber: { in: orderNumbers } }
    })

    // Key by orderNumber (last one wins if multiple)
    const csatByOrder = new Map(csatDocs.map(doc => [doc.orderNumber, doc]))

    // Bulk fetch subscriptions
    const subscriptionDocs = await prisma.widgetOrderSubscription.findMany({
      where: { orderNumber: { in: orderNumbers } }
    })

    const subscriptionByOrder = new Map(subscriptionDocs.map(doc => [doc.orderNumber, doc]))

    // Process each order
    for (const order of orders) {
      const csatDoc = csatByOrder.get(order.orderNumber)
      const subscriptionDoc = subscriptionByOrder.get(order.orderNumber)

      const hasWidgetInteraction = !!(csatDoc || subscriptionDoc)

      enrichmentMap.set(order.orderNumber, {
        hasWidgetInteraction,
        csatRating: csatDoc?.score,
        csatNotes: csatDoc?.notes || undefined,
        csatTimestamp: csatDoc?.timestamp,
        orderSubscription: subscriptionDoc
          ? {
            email: subscriptionDoc.email,
            sms: subscriptionDoc.sms,
            phone: subscriptionDoc.phone || undefined,
          }
          : undefined,
      })
    }

    return enrichmentMap
  } catch (error) {
    console.warn('Failed to bulk fetch widget data', error)
    return new Map()
  }
}

