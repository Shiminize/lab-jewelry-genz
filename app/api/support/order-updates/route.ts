import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestId } from '@/lib/api-utils';
import { withIdempotency } from '@/lib/idempotency';
import { conciergeConfig } from '@/config/concierge';

const SubscribeSchema = z.object({
  sessionId: z.string().min(6),
  originIntent: z.string().optional(),
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  sms: z.boolean().optional(),
});

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const body = await request.json().catch(() => ({}));
  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_REQUEST', issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    // Use MongoDB service in localDb mode
    if (conciergeConfig.mode === 'localDb') {
      return withIdempotency(request, async () => {
        const { subscribeOrderUpdates } = await import('@/server/services/widgetService');
        const result = await subscribeOrderUpdates({
          sessionId: parsed.data.sessionId,
          originIntent: parsed.data.originIntent,
          orderId: parsed.data.orderId,
          orderNumber: parsed.data.orderNumber,
          email: parsed.data.email,
          phone: parsed.data.phone,
          sms: parsed.data.sms,
        });
        return { body: { ...result, requestId: reqId } };
      });
    }

    // Fall back to stub for other modes
    const { subscribeOrderUpdates: subscribeStub } = await import('@/lib/concierge/services');
    const result = await subscribeStub(parsed.data ?? {});
    const payload =
      result && typeof result === 'object' && !Array.isArray(result)
        ? (result as Record<string, unknown>)
        : { ok: Boolean(result) };
    return NextResponse.json({ ...payload, requestId: reqId });
  } catch (error) {
    console.error('[order-updates] endpoint failed', error);
    return NextResponse.json(
      { error: 'ORDER_UPDATES_SUBSCRIPTION_FAILED', message: 'Unable to subscribe to order updates' },
      { status: 502 }
    );
  }
}
