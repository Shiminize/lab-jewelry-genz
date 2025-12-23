import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestId } from '@/lib/api-utils';
import { withIdempotency } from '@/lib/idempotency';
import { createLogger } from '@/lib/logging';
import { conciergeConfig } from '@/config/concierge';

const CsatSchema = z.object({
  sessionId: z.string().min(6),
  rating: z.number().min(1).max(5),
  notes: z.string().optional(),
  intent: z.string().optional(),
  orderNumber: z.string().optional(),
});

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const body = await request.json().catch(() => ({}));
  const parsed = CsatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_REQUEST', issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const log = createLogger({ reqId, route: 'support/csat' });
    log.info('processing');
    // Use DB service (formerly "localDb")
    if (conciergeConfig.mode === 'localDb') {
      return withIdempotency(request, async () => {
        const { saveCsatFeedback } = await import('@/server/services/widgetService');
        const result = await saveCsatFeedback({
          sessionId: parsed.data.sessionId,
          rating: parsed.data.rating,
          notes: parsed.data.notes,
          intent: parsed.data.intent,
          orderNumber: parsed.data.orderNumber,
        });
        log.info('success');
        return { body: { ...result, requestId: reqId } };
      });
    }

    // Fall back to stub for other modes
    const { submitCsat } = await import('@/lib/concierge/services');
    const result = await submitCsat(parsed.data ?? {});
    const payload =
      result && typeof result === 'object' && !Array.isArray(result)
        ? (result as Record<string, unknown>)
        : { ok: Boolean(result) };
    return NextResponse.json({ ...payload, requestId: reqId });
  } catch (error) {
    const log = createLogger({ reqId, route: 'support/csat' });
    log.error('failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json(
      { error: 'CSAT_SUBMISSION_FAILED', message: 'Unable to save feedback' },
      { status: 502 }
    );
  }
}
