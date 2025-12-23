import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestId } from '@/lib/api-utils';
import { createLogger } from '@/lib/logging';
import { conciergeConfig } from '@/config/concierge';
import { getOptionalSession } from '@/lib/auth/session';

// SECURITY NOTE:
// We determine ownership using a canonical `ownerEmail` derived from provider results:
// priority: customer.email → customerEmail → email. Non-matching authenticated users receive 404 to avoid
// leaking order existence. Admins bypass this check.

const OrderLookupSchema = z
  .object({
    orderId: z.string().optional(),
    email: z.string().email().optional(),
    postalCode: z.string().min(3).optional(),
  })
  .refine((d) => !!d.orderId || (!!d.email && !!d.postalCode), {
    message: 'Provide orderId, or email + postalCode',
  })

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const session = await getOptionalSession();
  const body = await request.json().catch(() => ({}));
  const parsed = OrderLookupSchema.safeParse(body?.details ?? body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_REQUEST', issues: parsed.error.flatten() }, { status: 400 });
  }
  const details = parsed.data;

  // Security: If user provides email, it must match the session email
  if (details.email && details.email !== session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Invalid credentials' }, { status: 401 });
  }

  // If user is logged in, ensure they can only query their own orders unless an admin
  const userEmail = session?.user?.email;
  const isAdmin = session?.user?.role === 'admin';

  try {
    const log = createLogger({ reqId, route: 'support/order-status' });
    log.info('processing');
    // Use MongoDB service in localDb mode
    if (conciergeConfig.mode === 'localDb') {
      const { getOrderStatus } = await import('@/server/services/orderService');
      const result = await getOrderStatus({
        orderId: details.orderId,
        email: details.email,
        postalCode: details.postalCode,
      });

      if (result.error) {
        return NextResponse.json({ error: 'NOT_FOUND', message: result.error }, { status: 404 });
      }

      const ownerEmail = resolveOwnerEmail(result);
      if (!ownerEmail) {
        log.warn('missing_owner_email');
        if (userEmail && !isAdmin) {
          return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Order not found' }, { status: 404 });
        }
      } else if (result && userEmail && ownerEmail !== userEmail && !isAdmin) {
        log.warn('permission_denied', {
          userEmail,
          orderEmail: ownerEmail,
        });
        return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Order not found' }, { status: 404 });
      }

      log.info('success');
      return NextResponse.json({ ...result, requestId: reqId });
    }

    // Fall back to stub for other modes
    const { fetchOrderStatus } = await import('@/lib/concierge/services');
    const status = await fetchOrderStatus(details);
    const payload =
      status && typeof status === 'object' && !Array.isArray(status)
        ? (status as Record<string, unknown>)
        : { ok: Boolean(status) };

    const ownerEmail = resolveOwnerEmail(payload);
    if (!ownerEmail) {
      log.warn('missing_owner_email');
      if (userEmail && !isAdmin) {
        return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Order not found' }, { status: 404 });
      }
    } else if (payload && userEmail && ownerEmail !== userEmail && !isAdmin) {
      log.warn('permission_denied', {
        userEmail,
        orderEmail: ownerEmail,
      });
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ ...payload, requestId: reqId });
  } catch (error) {
    const log = createLogger({ reqId, route: 'support/order-status' });
    log.error('failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json(
      { error: 'ORDER_STATUS_FETCH_FAILED', message: 'Unable to fetch order status' },
      { status: 502 }
    );
  }
}

function resolveOwnerEmail(result: unknown): string | null {
  if (!result || typeof result !== 'object') {
    return null;
  }

  const candidate = result as Record<string, unknown>;
  const nestedCustomer = candidate.customer;
  if (nestedCustomer && typeof nestedCustomer === 'object') {
    const email = (nestedCustomer as Record<string, unknown>).email;
    if (typeof email === 'string') {
      return email;
    }
  }

  if (typeof candidate.customerEmail === 'string') {
    return candidate.customerEmail;
  }
  if (typeof candidate.email === 'string') {
    return candidate.email;
  }

  return null;
}
