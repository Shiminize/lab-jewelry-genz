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

      const tickets = await prisma.stylistTicket.findMany({
        where: { status: 'open' },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      // Transform for frontend
      const formatted = tickets.map((doc) => ({
        ticketId: doc.ticketId,
        customerName: doc.customerName,
        customerEmail: doc.customerEmail,
        customerPhone: doc.customerPhone,
        status: doc.status,
        priority: doc.priority || 'normal',
        notes: doc.notes,
        timePreference: doc.timePreference,
        shortlist: doc.shortlist, // Json field
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      }));

      return NextResponse.json({ tickets: formatted });
    }

    // Stub mode - return empty array
    return NextResponse.json({ tickets: [] });
  } catch (error) {
    console.error('[dashboard/support/tickets] Failed to fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets', tickets: [] },
      { status: 500 }
    );
  }
}
