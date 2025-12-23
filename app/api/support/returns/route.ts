import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestId } from '@/lib/api-utils';
import { withIdempotency } from '@/lib/idempotency';
import { createLogger } from '@/lib/logging';
import { conciergeConfig } from '@/config/concierge';

const ReturnSchema = z.object({
  selection: z
    .object({
      orderId: z.string().min(3),
      option: z.string().min(2),
      reason: z.string().min(2).optional(),
      newSize: z.union([z.string(), z.number()]).optional(),
    })
    .or(
      z.object({
        orderId: z.string().min(3),
        option: z.string().min(2),
        reason: z.string().min(2).optional(),
        newSize: z.union([z.string(), z.number()]).optional(),
      })
    ),
});

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const json = await request.json().catch(() => ({}));
  const parsed = ReturnSchema.safeParse({ selection: json?.selection ?? json });
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_REQUEST', issues: parsed.error.flatten() }, { status: 400 });
  }
  const selection = parsed.data.selection as any;

  try {
    const log = createLogger({ reqId, route: 'support/returns' });
    log.info('processing');
    // Use MongoDB service in localDb mode
    if (conciergeConfig.mode === 'localDb') {
      return withIdempotency(request, async () => {
        const { createReturn } = await import('@/server/services/orderService');
        const result = await createReturn({
          orderId: selection.orderId,
          option: selection.option,
          reason: selection.reason,
          newSize: selection.newSize,
        });
        log.info('success');
        return { body: { ...result, requestId: reqId } };
      });
    }

    // Fall back to stub for other modes
    const { submitReturn } = await import('@/lib/concierge/services');
    const result = await submitReturn(selection);
    const payload =
      result && typeof result === 'object' && !Array.isArray(result)
        ? (result as Record<string, unknown>)
        : { ok: Boolean(result) };
    return NextResponse.json({ ...payload, requestId: reqId });
  } catch (error) {
    const log = createLogger({ reqId, route: 'support/returns' });
    log.error('failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json(
      { error: 'RETURN_SUBMISSION_FAILED', message: 'Unable to process return request' },
      { status: 502 }
    );
  }
}
