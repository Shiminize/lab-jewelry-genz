'use client';

import { useEffect, useState } from 'react';
import { Typography } from '@/components/ui';

type StylistTicket = {
  ticketId: string;
  customerName?: string;
  customerEmail: string;
  status: string;
  priority: string;
  notes?: string;
  createdAt: string;
  shortlist?: Array<{ id: string; title: string; price: number }>;
};

type CsatFeedback = {
  _id: string;
  sessionId: string;
  rating: string | number;
  score: number;
  notes?: string;
  intent?: string;
  timestamp: string;
};

export default function SupportQueuePage() {
  const [tickets, setTickets] = useState<StylistTicket[]>([]);
  const [negativeCsat, setNegativeCsat] = useState<CsatFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'tickets' | 'csat'>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [ticketsRes, csatRes] = await Promise.all([
          fetch('/api/dashboard/support/tickets'),
          fetch('/api/dashboard/support/csat'),
        ]);

        if (ticketsRes.ok) {
          const data = await ticketsRes.json();
          setTickets(data.tickets || []);
        }

        if (csatRes.ok) {
          const data = await csatRes.json();
          setNegativeCsat(data.feedback || []);
        }
      } catch (error) {
        console.error('Failed to fetch support queue data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'border-border-subtle bg-warning/80 text-text-primary',
      active: 'border-border-subtle bg-success/80 text-text-primary',
      resolved: 'border-border-subtle bg-neutral-50 text-text-secondary',
      expired: 'border-border-subtle bg-error/85 text-text-primary',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.open}`}
      >
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: 'border-border-subtle bg-error/80 text-text-primary',
      normal: 'border-border-subtle bg-accent-secondary/60 text-text-primary',
      low: 'border-border-subtle bg-neutral-50 text-text-secondary',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[priority] || styles.normal}`}
      >
        {priority}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredTickets = filter === 'all' || filter === 'tickets' ? tickets : [];
  const filteredCsat = filter === 'all' || filter === 'csat' ? negativeCsat : [];

  const totalItems = tickets.length + negativeCsat.length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted">Loading support queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Typography as="h1" variant="title" className="mb-2">
          Support Queue
        </Typography>
        <p className="text-muted">
          Manage stylist tickets and customer feedback from the Aurora Concierge widget.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border-subtle bg-surface-base p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Open Tickets</p>
              <p className="mt-1 text-2xl font-semibold">{tickets.length}</p>
            </div>
            <div className="rounded-full border border-border-subtle bg-warning/80 p-3">
              <svg className="h-6 w-6 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface-base p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Negative CSAT</p>
              <p className="mt-1 text-2xl font-semibold">{negativeCsat.length}</p>
            </div>
            <div className="rounded-full border border-border-subtle bg-error/80 p-3">
              <svg className="h-6 w-6 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border-subtle">
        {[
          { key: 'all', label: `All (${totalItems})` },
          { key: 'tickets', label: `Tickets (${tickets.length})` },
          { key: 'csat', label: `CSAT Follow-ups (${negativeCsat.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              filter === tab.key
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-muted hover:border-border-strong hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <div className="rounded-lg border border-border-subtle bg-surface-base p-12 text-center shadow-soft">
          <svg className="mx-auto h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <Typography as="h3" variant="heading" className="mt-4">
            All clear!
          </Typography>
          <p className="mt-2 text-sm text-muted">No items in the support queue at the moment.</p>
        </div>
      )}

      {/* Stylist Tickets Table */}
      {filteredTickets.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-lg border border-border-subtle bg-surface-base shadow-soft">
          <div className="border-b border-border-subtle bg-neutral-50 px-6 py-3">
            <Typography as="h2" variant="heading">
              Stylist Tickets
            </Typography>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border-subtle bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-6 py-3">Ticket ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Shortlist</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.ticketId} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium">{ticket.ticketId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium">{ticket.customerName || 'N/A'}</p>
                        <p className="text-xs text-muted">{ticket.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                    <td className="px-6 py-4">{getPriorityBadge(ticket.priority)}</td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {ticket.shortlist?.length || 0} items
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(ticket.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button className="text-sm font-medium text-accent-primary hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Negative CSAT Table */}
      {filteredCsat.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-lg border border-border-subtle bg-surface-base shadow-soft">
          <div className="border-b border-border-subtle bg-neutral-50 px-6 py-3">
            <Typography as="h2" variant="heading">
              Negative CSAT Feedback
            </Typography>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border-subtle bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-6 py-3">Session ID</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Intent</th>
                  <th className="px-6 py-3">Notes</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredCsat.map((feedback) => (
                  <tr key={feedback._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-mono">{feedback.sessionId.slice(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-border-subtle bg-error/80 px-2.5 py-0.5 text-xs font-semibold text-text-primary">
                        {feedback.score}/5
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{feedback.rating}</td>
                    <td className="px-6 py-4 text-sm text-muted">{feedback.intent || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {feedback.notes ? (
                        <span className="max-w-xs truncate">{feedback.notes}</span>
                      ) : (
                        'No notes'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(feedback.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
