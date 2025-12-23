import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestId } from '@/lib/api-utils';
import { withIdempotency } from '@/lib/idempotency';
import { createLogger } from '@/lib/logging';
import { conciergeConfig } from '@/config/concierge';

const StylistSchema = z.object({
  sessionId: z.string().min(6),
  name: z.string().min(1).optional(),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  notes: z.string().optional(),
  timePreference: z.string().optional(),
  shortlist: z.any().optional(),
  transcript: z.any().optional(),
});

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const body = await request.json().catch(() => ({}));
  const parsed = StylistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_REQUEST', issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const log = createLogger({ reqId, route: 'support/stylist' });
    log.info('processing');
    // Use MongoDB service in localDb mode
    if (conciergeConfig.mode === 'localDb') {
      return withIdempotency(request, async () => {
        const { createStylistTicket } = await import('@/server/services/widgetService');
        const result = await createStylistTicket({
          sessionId: parsed.data.sessionId,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          notes: parsed.data.notes,
          timePreference: parsed.data.timePreference,
          shortlist: parsed.data.shortlist,
          transcript: parsed.data.transcript,
        });
        log.info('success');
        return { body: { ...result, requestId: reqId } };
      });
    }

    // Fall back to stub for other modes
    const { createStylistTicket: createTicketStub } = await import('@/lib/concierge/services');
    const result = await createTicketStub(parsed.data ?? {});
    const payload =
      result && typeof result === 'object' && !Array.isArray(result)
        ? (result as Record<string, unknown>)
        : { ok: Boolean(result) };
    return NextResponse.json({ ...payload, requestId: reqId });
  } catch (error) {
    const log = createLogger({ reqId, route: 'support/stylist' });
    log.error('failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json(
      { error: 'STYLIST_REQUEST_FAILED', message: 'Unable to create stylist request' },
      { status: 502 }
    );
  }
}
