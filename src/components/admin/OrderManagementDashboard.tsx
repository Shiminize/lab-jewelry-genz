'use client'

import { useMemo } from 'react'

interface OrderRecord {
  id: string
  customer: string
  email: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: number
  placedAt: string
}

const SAMPLE_ORDERS: OrderRecord[] = [
  {
    id: 'GG-1043',
    customer: 'Mina Chen',
    email: 'mina.chen@example.com',
    status: 'delivered',
    total: 486.2,
    items: 3,
    placedAt: '2025-09-12T18:42:00Z'
  },
  {
    id: 'GG-1042',
    customer: 'Aiden Rivera',
    email: 'aiden.rivera@example.com',
    status: 'shipped',
    total: 312.5,
    items: 2,
    placedAt: '2025-09-12T11:16:00Z'
  },
  {
    id: 'GG-1041',
    customer: 'Jada Roman',
    email: 'jada.roman@example.com',
    status: 'processing',
    total: 219.0,
    items: 1,
    placedAt: '2025-09-11T22:05:00Z'
  },
  {
    id: 'GG-1040',
    customer: 'Leo Summers',
    email: 'leo.summers@example.com',
    status: 'pending',
    total: 158.75,
    items: 2,
    placedAt: '2025-09-11T17:48:00Z'
  },
  {
    id: 'GG-1039',
    customer: 'Alina Patel',
    email: 'alina.patel@example.com',
    status: 'delivered',
    total: 742.4,
    items: 4,
    placedAt: '2025-09-10T20:32:00Z'
  }
]

const STATUS_LABEL: Record<OrderRecord['status'], string> = {
  cancelled: 'Cancelled',
  delivered: 'Delivered',
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped'
}

export default function OrderManagementDashboard() {
  const metrics = useMemo(() => {
    const totalOrders = SAMPLE_ORDERS.length
    const totalRevenue = SAMPLE_ORDERS.reduce((sum, order) => sum + order.total, 0)
    const averageValue = totalOrders === 0 ? 0 : totalRevenue / totalOrders

    const statusCounts = SAMPLE_ORDERS.reduce<Record<OrderRecord['status'], number>>((acc, order) => {
      acc[order.status] += 1
      return acc
    }, {
      cancelled: 0,
      delivered: 0,
      pending: 0,
      processing: 0,
      shipped: 0
    })

    return {
      totalOrders,
      totalRevenue,
      averageValue,
      statusCounts
    }
  }, [])

  const exportOrders = () => {
    const csv = convertToCSV(SAMPLE_ORDERS)
    downloadCSV(csv, 'glowglitch-orders.csv')
  }

  return (
    <div className='space-y-6 text-void-50'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-semibold text-void-50'>Order Management</h1>
          <p className='text-sm text-void-300'>Snapshot of recent orders and fulfillment momentum.</p>
        </div>
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={exportOrders}
            className='rounded-pill bg-gradient-tertiary px-4 py-2 font-medium text-void-950 shadow-neon-digital transition hover:brightness-110'
          >
            Export CSV
          </button>
          <button
            type='button'
            className='rounded-pill border border-void-500/40 px-4 py-2 font-medium text-void-100 transition hover:bg-void-800/60'
          >
            View Full Report
          </button>
        </div>
      </header>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <StatCard title='Total Orders' value={metrics.totalOrders.toLocaleString()} caption='Last 7 days'/>
        <StatCard title='Revenue' value={`$${metrics.totalRevenue.toFixed(2)}`} caption='Gross sales'/>
        <StatCard title='Average Order Value' value={`$${metrics.averageValue.toFixed(2)}`} caption='Per checkout'/>
        <StatCard
          title='Delivered Rate'
          value={`${Math.round((metrics.statusCounts.delivered / Math.max(metrics.totalOrders, 1)) * 100)}%`}
          caption='Completed shipments'
        />
      </section>

      <section className='rounded-ultra border border-void-700/40 bg-void-900/60'>
        <div className='flex flex-col gap-2 border-b border-void-800/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <h2 className='text-xl font-semibold text-void-50'>Status Distribution</h2>
          <span className='text-xs uppercase tracking-[0.25em] text-void-400'>Updated hourly</span>
        </div>
        <div className='space-y-3 px-6 py-4'>
          {Object.entries(metrics.statusCounts).map(([status, count]) => {
            const ratio = metrics.totalOrders === 0 ? 0 : (count / metrics.totalOrders)
            return (
              <div key={status} className='space-y-1'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='uppercase tracking-[0.25em] text-void-300'>{STATUS_LABEL[status as OrderRecord['status']]}</span>
                  <span className='font-medium text-void-50'>{count}</span>
                </div>
                <div className='h-2 rounded-full bg-void-700/60'>
                  <div
                    className='h-full rounded-full bg-gradient-digital transition-all duration-300'
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className='rounded-ultra border border-void-700/40 bg-void-900/60'>
        <div className='border-b border-void-800/60 px-6 py-4'>
          <h2 className='text-xl font-semibold text-void-50'>Recent Orders</h2>
        </div>
        <div className='overflow-x-auto px-6 py-4'>
          <table className='min-w-full divide-y divide-void-800/60 text-left text-sm'>
            <thead className='uppercase tracking-[0.25em] text-void-400'>
              <tr>
                <th className='py-3 pr-6 font-normal'>Order</th>
                <th className='py-3 pr-6 font-normal'>Customer</th>
                <th className='py-3 pr-6 font-normal'>Status</th>
                <th className='py-3 pr-6 font-normal'>Total</th>
                <th className='py-3 font-normal'>Placed</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-void-900'>
              {SAMPLE_ORDERS.map((order) => (
                <tr key={order.id} className='text-void-200'>
                  <td className='py-3 pr-6 text-void-50'>{order.id}</td>
                  <td className='py-3 pr-6'>
                    <div className='font-medium text-void-50'>{order.customer}</div>
                    <div className='text-xs text-void-400'>{order.email}</div>
                  </td>
                  <td className='py-3 pr-6'>
                    <span className='rounded-full bg-void-800/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-void-200'>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className='py-3 pr-6 font-medium text-void-50'>${order.total.toFixed(2)}</td>
                  <td className='py-3 text-void-300'>{new Date(order.placedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  caption: string
}

function StatCard({ title, value, caption }: StatCardProps) {
  return (
    <div className='rounded-ultra border border-void-700/40 bg-void-900/60 px-6 py-5'>
      <span className='text-xs uppercase tracking-[0.25em] text-void-400'>{title}</span>
      <div className='mt-2 text-2xl font-semibold text-void-50'>{value}</div>
      <p className='text-sm text-void-400'>{caption}</p>
    </div>
  )
}

function convertToCSV(records: OrderRecord[]): string {
  if (records.length === 0) {
    return ''
  }

  const header = ['Order ID', 'Customer', 'Email', 'Status', 'Total', 'Items', 'Placed At']
  const rows = records.map((record) => [
    record.id,
    record.customer,
    record.email,
    STATUS_LABEL[record.status],
    record.total.toFixed(2),
    record.items.toString(),
    new Date(record.placedAt).toISOString()
  ])

  return [header, ...rows].map((line) => line.map(escapeCell).join(',')).join('\n')
}

function escapeCell(value: string): string {
  if (value.includes(',') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
