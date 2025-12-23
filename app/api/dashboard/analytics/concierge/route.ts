import { NextRequest, NextResponse } from 'next/server';
import { conciergeConfig } from '@/config/concierge';
import { getOptionalSession } from '@/lib/auth/session';
import { assertAdminOrMerch } from '@/lib/auth/roleGuards';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
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
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';

    // Calculate date range
    const now = new Date();
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    if (conciergeConfig.mode === 'localDb') {

      // Get all events in date range
      const events = await prisma.widgetAnalyticsEvent.findMany({
        where: {
          createdAt: { gte: startDate }
        }
      });

      // Calculate summary metrics
      // Note: `sessionId` is not top level on WidgetAnalyticsEvent in my schema I made.
      // I only added `id`, `event`, `metadata`, `createdAt`.
      // SessionId is likely in `metadata`. I need to parse it.

      const parsedEvents = events.map(e => ({
        ...e,
        sessionId: (e.metadata as any)?.sessionId || 'unknown',
        detail: (e.metadata as any)?.detail || {},
      }));

      const uniqueSessions = new Set(parsedEvents.map((e) => e.sessionId).filter(Boolean)).size;
      const widgetOpens = parsedEvents.filter((e) => e.event === 'aurora_widget_open').length;

      const summary = {
        totalSessions: uniqueSessions,
        totalEvents: parsedEvents.length,
        uniqueSessions,
        widgetOpens,
        averageEventsPerSession: uniqueSessions > 0 ? parsedEvents.length / uniqueSessions : 0,
      };

      // Intent distribution
      const intentEvents = parsedEvents.filter(
        (e) => e.event === 'aurora_intent_detected' || e.event === 'aurora_intent_complete'
      );
      const intentCounts = new Map<string, number>();
      intentEvents.forEach((e) => {
        const intent = e.detail?.intent || 'unknown';
        intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
      });

      const totalIntents = Array.from(intentCounts.values()).reduce((a, b) => a + b, 0);
      const intentDistribution = Array.from(intentCounts.entries())
        .map(([intent, count]) => ({
          intent,
          count,
          percentage: totalIntents > 0 ? (count / totalIntents) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // CSAT distribution
      const csatFeedback = await prisma.csatFeedback.findMany({
        where: { timestamp: { gte: startDate } }
      });

      const csatCounts = new Map<number, number>();
      csatFeedback.forEach((f) => {
        const score = f.score || 3;
        csatCounts.set(score, (csatCounts.get(score) || 0) + 1);
      });

      const totalCsat = csatFeedback.length;
      const csatDistribution = [1, 2, 3, 4, 5].map((score) => ({
        score,
        count: csatCounts.get(score) || 0,
        percentage: totalCsat > 0 ? ((csatCounts.get(score) || 0) / totalCsat) * 100 : 0,
      }));

      // Top shortlisted products
      const shortlistEvents = parsedEvents.filter((e) => e.event === 'aurora_product_shortlisted');
      const productCounts = new Map<string, number>();
      shortlistEvents.forEach((e) => {
        const productId = e.detail?.productId || 'unknown';
        productCounts.set(productId, (productCounts.get(productId) || 0) + 1);
      });

      const topProducts = Array.from(productCounts.entries())
        .map(([productId, count]) => ({ productId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Conversion funnel
      const opens = parsedEvents.filter((e) => e.event === 'aurora_widget_open').length;
      const intentDetected = parsedEvents.filter((e) => e.event === 'aurora_intent_detected').length;
      const intentComplete = parsedEvents.filter((e) => e.event === 'aurora_intent_complete').length;
      const productsShown = parsedEvents.filter((e) => e.event === 'aurora_products_shown').length;
      const productShortlisted = parsedEvents.filter((e) => e.event === 'aurora_product_shortlisted').length;

      const conversionFunnel = [
        { stage: 'Widget Opened', count: opens, percentage: 100 },
        {
          stage: 'Intent Detected',
          count: intentDetected,
          percentage: opens > 0 ? (intentDetected / opens) * 100 : 0,
        },
        {
          stage: 'Action Completed',
          count: intentComplete,
          percentage: opens > 0 ? (intentComplete / opens) * 100 : 0,
        },
        {
          stage: 'Products Viewed',
          count: productsShown,
          percentage: opens > 0 ? (productsShown / opens) * 100 : 0,
        },
        {
          stage: 'Product Shortlisted',
          count: productShortlisted,
          percentage: opens > 0 ? (productShortlisted / opens) * 100 : 0,
        },
      ];

      // Time series data (simplified - by day)
      const dayBuckets = new Map<string, { opens: number; sessions: Set<string> }>();
      parsedEvents.forEach((e) => {
        const date = new Date(e.createdAt).toISOString().split('T')[0];
        if (!dayBuckets.has(date)) {
          dayBuckets.set(date, { opens: 0, sessions: new Set() });
        }
        const bucket = dayBuckets.get(date)!;
        if (e.event === 'aurora_widget_open') {
          bucket.opens++;
        }
        if (e.sessionId) {
          bucket.sessions.add(e.sessionId);
        }
      });

      const timeSeriesData = Array.from(dayBuckets.entries())
        .map(([date, data]) => ({
          date,
          opens: data.opens,
          sessions: data.sessions.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return NextResponse.json({
        summary,
        intentDistribution,
        csatDistribution,
        topProducts,
        conversionFunnel,
        timeSeriesData,
      });
    }

    // Stub mode - return empty data
    return NextResponse.json({
      summary: {
        totalSessions: 0,
        totalEvents: 0,
        uniqueSessions: 0,
        widgetOpens: 0,
        averageEventsPerSession: 0,
      },
      intentDistribution: [],
      csatDistribution: [],
      topProducts: [],
      conversionFunnel: [],
      timeSeriesData: [],
    });
  } catch (error) {
    console.error('[dashboard/analytics/concierge] Failed to fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
