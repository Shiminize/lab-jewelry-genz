import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getAdminOrder } from '@/services/admin/orders'
import OrderActions from './OrderActions'

interface OrderDetailPageProps {
  params: { id: string }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await getAdminOrder(decodeURIComponent(params.id), true)
  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link href="/dashboard/orders" className="text-xs uppercase tracking-[0.18em] text-accent-primary">
          ← Back to orders
        </Link>
        <h1 className="text-3xl font-semibold text-text-primary">Order {order.orderNumber}</h1>
        <p className="text-sm text-text-secondary">
          Status: <span className="capitalize">{order.status}</span> · Payment: <span className="capitalize">{order.paymentStatus}</span>
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <InfoCard title="Actions">
          <OrderActions
            orderId={order.id}
            status={order.status}
            total={order.total}
            paymentStatus={order.paymentStatus ?? 'pending'}
          />
        </InfoCard>
        <InfoCard title="Status History">
          {/* Assuming statusHistory is available on the order object. If not, we might need to cast it or update the interface. 
               The interface AdminOrderDetail doesn't show statusHistory, checking implementation...
               It seems getAdminOrder doesn't return statusHistory strictly typed or included in the implementation yet.
               I should update getAdminOrder to include it.
            */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-accent-primary"></div>
              <div>
                <p className="text-sm font-medium capitalize">{order.status}</p>
                <p className="text-xs text-text-secondary">Current Status</p>
              </div>
            </div>
          </div>
        </InfoCard>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <InfoCard title="Customer">
          <p className="text-sm text-text-primary">{order.customerEmail ?? 'Guest checkout'}</p>
          {order.createdAt ? (
            <p className="text-xs text-text-secondary">Placed on {order.createdAt.toLocaleString()}</p>
          ) : null}
        </InfoCard>
        <InfoCard title="Totals">
          <p className="text-2xl font-semibold text-text-primary">
            ${order.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </InfoCard>
      </section>

      <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-base px-6 py-6 shadow-soft">
        <h2 className="text-lg font-semibold text-text-primary">Line items</h2>
        <div className="divide-y divide-border-subtle">
          {order.items.length ? (
            order.items.map((item, index) => (
              <div key={`${item.productId ?? index}-${index}`} className="flex flex-col gap-1 py-3 text-sm text-text-secondary">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-text-primary">{item.name ?? 'Product'}</span>
                  <span>${item.subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <p className="text-xs text-text-muted">
                  Qty: {item.quantity} × ${item.unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-text-muted">No items recorded for this order.</p>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <InfoCard title="Shipping">
          {order.shipping?.method ? <p className="text-sm text-text-primary">{order.shipping.method}</p> : null}
          {order.shipping?.carrier ? <p className="text-xs text-text-secondary">Carrier: {order.shipping.carrier}</p> : null}
          {order.shipping?.trackingNumber ? (
            <p className="text-xs text-text-secondary">Tracking: {order.shipping.trackingNumber}</p>
          ) : null}
        </InfoCard>
        <InfoCard title="Creator commission">
          {order.creator?.creatorId ? (
            <>
              <p className="text-sm text-text-primary">Creator ID: {order.creator.creatorId}</p>
              <p className="text-xs text-text-secondary">
                Commission {order.creator.commissionRate ? `${order.creator.commissionRate * 100}%` : '—'} · $
                {(order.creator.commissionAmount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </>
          ) : (
            <p className="text-sm text-text-secondary">No creator commission associated.</p>
          )}
        </InfoCard>
      </section>

      {order.widgetData?.hasWidgetInteraction ? (
        <section className="space-y-4 rounded-2xl border border-accent-primary/20 bg-accent-primary/5 px-6 py-6 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h2 className="text-lg font-semibold text-text-primary">Concierge Widget Interaction</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {order.widgetData.csatRating ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Customer Satisfaction</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${order.widgetData.csatRating >= 4
                      ? 'bg-green-50 text-green-700'
                      : order.widgetData.csatRating === 3
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                      }`}
                  >
                    {order.widgetData.csatRating}/5
                  </span>
                  {order.widgetData.csatTimestamp ? (
                    <span className="text-xs text-text-muted">
                      {order.widgetData.csatTimestamp.toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
                {order.widgetData.csatNotes ? (
                  <p className="text-sm text-text-secondary italic">&quot;{order.widgetData.csatNotes}&quot;</p>
                ) : null}
              </div>
            ) : null}
            {order.widgetData.orderSubscription ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Order Updates Subscription</p>
                <div className="flex flex-col gap-1">
                  {order.widgetData.orderSubscription.email ? (
                    <span className="text-sm text-text-secondary">✓ Email updates enabled</span>
                  ) : null}
                  {order.widgetData.orderSubscription.sms ? (
                    <span className="text-sm text-text-secondary">
                      ✓ SMS updates: {order.widgetData.orderSubscription.phone || 'enabled'}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            {order.widgetData.sessionNotes ? (
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Session Notes</p>
                <p className="text-sm text-text-secondary">{order.widgetData.sessionNotes}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-2xl border border-border-subtle bg-surface-base px-6 py-6 shadow-soft">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}
