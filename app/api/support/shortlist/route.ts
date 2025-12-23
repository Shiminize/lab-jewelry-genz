import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestId } from '@/lib/api-utils';
import { withIdempotency } from '@/lib/idempotency';
import { createLogger } from '@/lib/logging';
import { conciergeConfig } from '@/config/concierge';

const ShortlistSchema = z.object({
  sessionId: z.string().min(6),
  items: z.array(z.any()).default([]),
});

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const body = await request.json().catch(() => ({}));
  const parsed = ShortlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_REQUEST', issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const log = createLogger({ reqId, route: 'support/shortlist' });
    log.info('processing');
    // Use MongoDB service in localDb mode
    if (conciergeConfig.mode === 'localDb') {
      return withIdempotency(request, async () => {
        const { saveShortlist } = await import('@/server/services/widgetService');
        const result = await saveShortlist({
          sessionId: parsed.data.sessionId,
          items: parsed.data.items || [],
        });
        log.info('success');
        return { body: { ...result, requestId: reqId } };
      });
    }

    // Fall back to stub for other modes
    const { persistShortlist } = await import('@/lib/concierge/services');
    const result = await persistShortlist(parsed.data ?? {});
    const payload =
      result && typeof result === 'object' && !Array.isArray(result)
        ? (result as Record<string, unknown>)
        : { ok: Boolean(result) };
    return NextResponse.json({ ...payload, requestId: reqId });
  } catch (error) {
    const log = createLogger({ reqId, route: 'support/shortlist' });
    log.error('failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json(
      { error: 'SHORTLIST_SAVE_FAILED', message: 'Unable to save shortlist' },
      { status: 502 }
    );
  }
}
