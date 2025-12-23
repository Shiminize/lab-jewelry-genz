import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type OrderTimelineEntry = {
  label: string;
  date?: string;
  status: 'complete' | 'current' | 'upcoming';
};

export type OrderStatusResult = {
  reference: string;
  entries: OrderTimelineEntry[];
  error?: string;
  customerEmail?: string;
};

/**
 * Fetch order status and build timeline
 * @param details - Query parameters: orderId or email+postalCode
 */
export async function getOrderStatus(details: {
  orderId?: string;
  email?: string;
  postalCode?: string;
}): Promise<OrderStatusResult> {
  try {
    let order;

    if (details.orderId) {
      // Search by order ID or order number
      order = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: details.orderId },
            { id: details.orderId }
          ]
        }
      });
    } else if (details.email && details.postalCode) {
      // Search by email and postal code (in shipping or shippingAddress)
      // We check shippingAddress primarily as that's standard, but fallback to shipping if legacy data used it.
      // Prisma JSON filtering:
      order = await prisma.order.findFirst({
        where: {
          customerEmail: details.email,
          OR: [
            { shippingAddress: { path: ['postalCode'], equals: details.postalCode } },
            { shipping: { path: ['postalCode'], equals: details.postalCode } }
          ]
        }
      });
    }

    if (!order) {
      return {
        reference: details.orderId || 'Unknown',
        entries: [],
        error: 'Order not found. Please check your order number or contact support.',
      };
    }

    // Build timeline from order data
    const entries = buildTimeline(order);

    return {
      reference: order.orderNumber || order.id || 'Order',
      entries,
      customerEmail: order.customerEmail || (order as any).user?.email || undefined,
    };
  } catch (error) {
    console.error('[orderService] getOrderStatus failed', error);
    throw error;
  }
}

/**
 * Build timeline entries from order document
 */
function buildTimeline(order: any): OrderTimelineEntry[] {
  const entries: OrderTimelineEntry[] = [];
  const status = order.status || 'pending';

  // Use statusHistory if available
  if (Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
    return order.statusHistory.map((entry: any, index: number) => ({
      label: formatStatusLabel(entry.status || entry.label),
      date: entry.date ? formatDate(new Date(entry.date)) : undefined,
      status: determineEntryStatus(index, order.statusHistory.length, status),
    }));
  }

  // Otherwise, build from current status
  const stages = [
    { key: 'pending', label: 'Order received' },
    { key: 'processing', label: 'In production' },
    { key: 'quality_check', label: 'Quality check' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const statusIndex = stages.findIndex((s) => s.key === status);
  const currentIndex = statusIndex >= 0 ? statusIndex : 1;

  stages.forEach((stage, index) => {
    let entryStatus: 'complete' | 'current' | 'upcoming' = 'upcoming';
    if (index < currentIndex) {
      entryStatus = 'complete';
    } else if (index === currentIndex) {
      entryStatus = 'current';
    }

    const date = getDateForStage(order, stage.key, index, currentIndex);

    entries.push({
      label: stage.label,
      date: date ? formatDate(date) : undefined,
      status: entryStatus,
    });
  });

  return entries;
}

function formatStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Order received',
    processing: 'In production',
    quality_check: 'Quality check',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    return_pending: 'Return requested',
  };
  return labels[status] || status.replace(/_/g, ' ');
}

function determineEntryStatus(
  index: number,
  totalEntries: number,
  currentStatus: string
): 'complete' | 'current' | 'upcoming' {
  if (index < totalEntries - 1) return 'complete';
  if (currentStatus === 'delivered' || currentStatus === 'complete') return 'complete';
  return 'current';
}

function getDateForStage(order: any, stageKey: string, index: number, currentIndex: number): Date | null {
  // Check for specific date fields
  if (stageKey === 'shipped' && order.shipping?.shippedAt) {
    return new Date(order.shipping.shippedAt);
  }
  if (stageKey === 'delivered' && order.shipping?.deliveredAt) {
    return new Date(order.shipping.deliveredAt);
  }
  if (stageKey === 'pending' && order.createdAt) {
    return new Date(order.createdAt);
  }

  // For completed stages, use createdAt + offset
  if (index <= currentIndex && order.createdAt) {
    const baseDate = new Date(order.createdAt);
    baseDate.setDate(baseDate.getDate() + index * 2); // Add 2 days per stage
    return baseDate;
  }

  // For future stages, estimate
  if (index > currentIndex && order.createdAt) {
    const baseDate = new Date(order.createdAt);
    baseDate.setDate(baseDate.getDate() + index * 3); // Add 3 days per stage
    return baseDate;
  }

  return null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Create or update RMA for returns
 */
export async function createReturn(params: {
  orderId: string;
  option: 'return' | 'resize' | 'care';
  reason?: string;
  newSize?: string;
}): Promise<{ ok: boolean; message: string; rmaId?: string }> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: params.orderId },
          { id: params.orderId }
        ]
      }
    });

    if (!order) {
      return {
        ok: false,
        message: 'Order not found. Please verify your order number.',
      };
    }

    // Check eligibility
    const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const daysSinceOrder = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    const RETURN_WINDOW = 30;
    const RESIZE_WINDOW = 60;

    if (params.option === 'return' && daysSinceOrder > RETURN_WINDOW) {
      return {
        ok: false,
        message: `Return window (${RETURN_WINDOW} days) has expired. Please contact support for assistance.`,
      };
    }

    if (params.option === 'resize' && daysSinceOrder > RESIZE_WINDOW) {
      return {
        ok: false,
        message: `Resize window (${RESIZE_WINDOW} days) has expired. Please contact support for pricing.`,
      };
    }

    // Check for non-returnable items
    const items = order.items as any[] || [];
    const hasCustomTag = items.some((item: any) =>
      item.tags?.includes('custom') || item.tags?.includes('engraved')
    );

    if (hasCustomTag && params.option === 'return') {
      return {
        ok: false,
        message: 'Custom or engraved items cannot be returned. Contact support for exceptions.',
      };
    }

    // Generate RMA ID
    const rmaId = `RMA-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Update order status
    // Fetch current history to append
    const currentHistory = (order.statusHistory as any[]) || [];
    const newHistoryEntry = {
      status: `${params.option}_requested`,
      date: new Date(),
      label: `${params.option} requested`,
    };

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: params.option === 'return' ? 'return_pending' : order.status,
        returnInfo: {
          rmaId,
          option: params.option,
          reason: params.reason,
          newSize: params.newSize,
          requestedAt: new Date(),
        } as any,
        statusHistory: [...currentHistory, newHistoryEntry] as any,
        updatedAt: new Date()
      }
    });

    const messages = {
      return: `Return approved! Your RMA number is ${rmaId}. We'll email you a prepaid label within 24 hours.`,
      resize: `Resizing request received (RMA ${rmaId}). Our studio will reach out within 48 hours with options.`,
      care: `Care appointment scheduled (${rmaId}). We'll send cleaning instructions and prepaid shipping.`,
    };

    return {
      ok: true,
      message: messages[params.option],
      rmaId,
    };
  } catch (error) {
    console.error('[orderService] createReturn failed', error);
    throw error;
  }
}
