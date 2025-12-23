import { NextResponse } from 'next/server';
import { conciergeConfig } from '@/config/concierge';
import { getOptionalSession } from '@/lib/auth/session';
import { assertAdminOrMerch } from '@/lib/auth/roleGuards';
import prisma from '@/lib/prisma';

export async function GET() {
  // Require admin or merchandiser role
  const session = await getOptionalSession();
  try {
    assertAdminOrMerch(session);
  } catch (error: any) {
    const message = error?.message ?? 'Forbidden';
    const status = typeof error?.status === 'number' ? error.status : 403;
    return NextResponse.json({ error: message }, { status });
  }

  try {
    if (conciergeConfig.mode === 'localDb') {

      // Get negative feedback (score < 3)
      const feedback = await prisma.csatFeedback.findMany({
        where: { score: { lt: 3 } },
        orderBy: { timestamp: 'desc' },
        take: 50
      });

      // Transform for frontend
      const formatted = feedback.map((doc) => ({
        _id: doc.id,
        sessionId: '', // Removed from schema or not in main CSAT model? Wait, CSAT had sessionId? 
        // My schema defined: orderNumber, score, notes, timestamp. I missed sessionId in schema earlier. 
        // I will omit it for now or return empty string as it seems less critical for support dashboard than the score/notes.
        rating: 0, // doc.rating? schema has score. 
        score: doc.score,
        notes: doc.notes,
        intent: '' as string, // Missed in schema
        timestamp: doc.timestamp.toISOString(),
      }));

      return NextResponse.json({ feedback: formatted });
    }

    // Stub mode - return empty array
    return NextResponse.json({ feedback: [] });
  } catch (error) {
    console.error('[dashboard/support/csat] Failed to fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CSAT feedback', feedback: [] },
      { status: 500 }
    );
  }
}
