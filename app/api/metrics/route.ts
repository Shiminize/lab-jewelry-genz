import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/lib/auth/session';
import { assertAdminOrMerch } from '@/lib/auth/roleGuards';
import { redisMetricsAdapter } from '@/lib/metrics/redisAdapter';
import { getP95Latency, getMetricsSummary } from '@/lib/metrics/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/metrics
 * 
 * Returns metrics summary including P95 latency from Redis (if available)
 * Falls back to in-memory metrics if Redis not connected
 * 
 * Query params:
 * - days: Number of days to look back (default: 1)
 * - source: 'redis' | 'memory' | 'both' (default: 'both')
 */
export async function GET(req: Request) {
  try {
    // RBAC: Only admin/merch can access metrics
    const session = await getOptionalSession();
    assertAdminOrMerch(session);

    const { searchParams } = new URL(req.url);
    const days = Math.max(1, Math.min(7, Number(searchParams.get('days') || 1))); // 1-7 days
    const source = searchParams.get('source') || 'both';

    let redisMetrics = null;
    let memoryMetrics = null;

    // Get Redis metrics if requested and available
    if ((source === 'redis' || source === 'both') && redisMetricsAdapter.isConnected()) {
      try {
        redisMetrics = await redisMetricsAdapter.getMetricsSummary(days);
      } catch (error) {
        console.error('Failed to get Redis metrics:', error);
      }
    }

    // Get in-memory metrics if requested
    if (source === 'memory' || source === 'both') {
      memoryMetrics = {
        ...getMetricsSummary(),
        timeRange: 'current session (in-memory)',
        cacheHitRate: 0, // Not tracked in memory
        errorRate: 0,    // Not tracked in memory
        p50LatencyMs: 0, // Not calculated in memory
        avgLatencyMs: 0, // Not calculated in memory
      };
    }

    const response = {
      timestamp: new Date().toISOString(),
      redis: {
        connected: redisMetricsAdapter.isConnected(),
        metrics: redisMetrics,
      },
      memory: {
        metrics: memoryMetrics,
      },
      summary: {
        // Prefer Redis metrics if available, fallback to memory
        primarySource: redisMetrics ? 'redis' : 'memory',
        p95LatencyMs: redisMetrics?.p95LatencyMs || memoryMetrics?.p95LatencyMs || 0,
        totalRequests: redisMetrics?.totalRequests || memoryMetrics?.totalRequests || 0,
        cacheHitRate: redisMetrics?.cacheHitRate || 0,
        errorRate: redisMetrics?.errorRate || 0,
        timeRange: redisMetrics?.timeRange || memoryMetrics?.timeRange || 'unknown',
      },
      config: {
        daysRequested: days,
        sourceRequested: source,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store', // Don't cache metrics
      },
    });

  } catch (error) {
    if ((error as any).status === 403) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.error('[metrics] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
