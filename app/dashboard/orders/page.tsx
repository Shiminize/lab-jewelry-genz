import Link from 'next/link'

import { getAdminOrderStats, listAdminOrders } from '@/services/admin/orders'
import { Typography } from '@/components/ui'

export default async function OrdersDashboardPage() {
  const [stats, orders] = await Promise.all([getAdminOrderStats(), listAdminOrders(120, true)])

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Typography as="h1" variant="heading">
          Orders
        </Typography>
        <Typography variant="body" className="text-text-secondary">
          Monitor revenue, fulfillment progress, and payment status. Select an order to review the details.
        </Typography>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={`$${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <StatCard label="Orders" value={stats.totalOrders.toLocaleString()} helper={`${stats.fulfilledOrders} fulfilled`} />
        <StatCard
          label="Average order value"
          value={`$${stats.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
        <StatCard
          label="Pending fulfillment"
          value={stats.pendingOrders.toLocaleString()}
          helper="Includes pending, confirmed, processing"
        />
      </section>

      <div className="overflow-hidden rounded-2xl border border-border-subtle shadow-soft">
        <table className="min-w-full divide-y divide-border-subtle text-sm">
          <thead className="bg-surface-panel">
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-text-muted">
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 font-semibold">Placed</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Payment</th>
              <th className="px-5 py-3 font-semibold text-center">Widget</th>
              <th className="px-5 py-3 font-semibold text-center">CSAT</th>
              <th className="px-5 py-3 font-semibold text-right">Total</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface-base text-text-secondary">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-5 py-4 font-semibold text-text-primary">{order.orderNumber}</td>
                <td className="px-5 py-4 text-xs text-text-muted">
                  {order.createdAt ? order.createdAt.toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-4">{order.customerEmail ?? 'Guest checkout'}</td>
                <td className="px-5 py-4 capitalize">{order.status}</td>
                <td className="px-5 py-4 capitalize">{order.paymentStatus ?? 'pending'}</td>
                <td className="px-5 py-4 text-center">
                  {order.widgetData?.hasWidgetInteraction ? (
                    <span className="inline-flex items-center rounded-full bg-accent-primary/10 px-2 py-0.5 text-xs font-semibold text-accent-primary" title="Customer used Concierge widget">
                      ✨
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-center">
                  {order.widgetData?.csatRating ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        order.widgetData.csatRating >= 4
                          ? 'bg-green-50 text-green-700'
                          : order.widgetData.csatRating === 3
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                      }`}
                      title={order.widgetData.csatNotes || undefined}
                    >
                      {order.widgetData.csatRating}/5
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-text-primary">
                  ${order.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/dashboard/orders/${encodeURIComponent(order.id)}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-sm text-text-muted">
                  No orders found yet. Once customers complete checkout, they will appear here.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="space-y-1 rounded-2xl border border-border-subtle bg-surface-base px-5 py-6 shadow-soft">
      <Typography variant="caption" className="uppercase tracking-[0.18em] text-text-muted">
        {label}
      </Typography>
      <Typography variant="title" className="text-text-primary">
        {value}
      </Typography>
      {helper ? (
        <Typography variant="caption" className="text-text-secondary">
          {helper}
        </Typography>
      ) : null}
    </div>
  )
}
