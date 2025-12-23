'use client';

import { useEffect, useState } from 'react';
import { Typography } from '@/components/ui';

type AnalyticsData = {
  summary: {
    totalSessions: number;
    totalEvents: number;
    uniqueSessions: number;
    widgetOpens: number;
    averageEventsPerSession: number;
  };
  intentDistribution: Array<{ intent: string; count: number; percentage: number }>;
  csatDistribution: Array<{ score: number; count: number; percentage: number }>;
  topProducts: Array<{ productId: string; count: number }>;
  conversionFunnel: Array<{ stage: string; count: number; percentage: number }>;
  timeSeriesData: Array<{ date: string; opens: number; sessions: number }>;
};

export default function ConciergeAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard/analytics/concierge?range=${dateRange}`);
        if (res.ok) {
          const analytics = await res.json();
          setData(analytics);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Typography as="h1" variant="title">
          Concierge Analytics
        </Typography>
        <p className="mt-4 text-muted">No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Typography as="h1" variant="title" className="mb-2">
            Concierge Analytics
          </Typography>
          <p className="text-muted">Widget performance metrics and user behavior insights</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                dateRange === range
                  ? 'border-accent-primary/60 bg-accent-primary text-surface-base'
                  : 'border-border-subtle bg-neutral-50 text-text-secondary hover:border-border-strong hover:bg-neutral-100'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-border-subtle bg-surface-base p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Widget Opens</p>
          <p className="mt-2 text-3xl font-bold">{data.summary.widgetOpens.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-base p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Unique Sessions</p>
          <p className="mt-2 text-3xl font-bold">{data.summary.uniqueSessions.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-base p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Events</p>
          <p className="mt-2 text-3xl font-bold">{data.summary.totalEvents.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-base p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Avg Events/Session</p>
          <p className="mt-2 text-3xl font-bold">{data.summary.averageEventsPerSession.toFixed(1)}</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-base p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Sessions</p>
          <p className="mt-2 text-3xl font-bold">{data.summary.totalSessions.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Intent Distribution */}
        <div className="rounded-lg border border-border-subtle bg-surface-base p-6 shadow-soft">
          <Typography as="h2" variant="heading" className="mb-4">
            Intent Distribution
          </Typography>
          {data.intentDistribution.length > 0 ? (
            <div className="space-y-3">
              {data.intentDistribution.map((item) => (
                <div key={item.intent}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{item.intent.replace(/_/g, ' ')}</span>
                    <span className="text-muted">
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full bg-accent-primary transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No intent data yet</p>
          )}
        </div>

        {/* CSAT Distribution */}
        <div className="rounded-lg border border-border-subtle bg-surface-base p-6 shadow-soft">
          <Typography as="h2" variant="heading" className="mb-4">
            CSAT Score Distribution
          </Typography>
          {data.csatDistribution.length > 0 ? (
            <div className="space-y-3">
              {data.csatDistribution.map((item) => {
                const toneScale = [
                  'bg-error',
                  'bg-warning',
                  'bg-accent-secondary',
                  'bg-accent-primary/80',
                  'bg-accent-primary',
                ];
                return (
                  <div key={item.score}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.score} Star{item.score !== 1 ? 's' : ''}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`h-3 w-3 ${i < item.score ? 'text-accent-secondary' : 'text-neutral-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-muted">
                        {item.count} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className={`h-full ${toneScale[item.score - 1] ?? 'bg-accent-primary'} transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted">No CSAT data yet</p>
          )}
        </div>

        {/* Top Products */}
        <div className="rounded-lg border border-border-subtle bg-surface-base p-6 shadow-soft">
          <Typography as="h2" variant="heading" className="mb-4">
            Top Shortlisted Products
          </Typography>
          {data.topProducts.length > 0 ? (
            <div className="space-y-2">
              {data.topProducts.slice(0, 10).map((item, index) => (
                <div key={item.productId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-50 text-xs font-semibold text-muted">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item.productId}</span>
                  </div>
                  <span className="text-muted">{item.count} times</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No product data yet</p>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="rounded-lg border border-border-subtle bg-surface-base p-6 shadow-soft">
          <Typography as="h2" variant="heading" className="mb-4">
            Conversion Funnel
          </Typography>
          {data.conversionFunnel.length > 0 ? (
            <div className="space-y-4">
              {data.conversionFunnel.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <span className="text-sm text-muted">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-lg bg-neutral-50">
                    <div
                      className="flex h-full items-center justify-end bg-accent-primary px-3 text-xs font-semibold text-surface-base transition-all"
                      style={{ width: `${stage.percentage}%` }}
                    >
                      {stage.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No funnel data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
