'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit3,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Order management interfaces
interface Order {
  _id: string
  orderNumber: string
  email: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingStatus: ShippingStatus
  total: number
  currency: string
  createdAt: string
  isGuest: boolean
  items: OrderItem[]
  shipping?: ShippingDetails
  userId?: {
    _id: string
    name: string
    email: string
  }
  guestDetails?: {
    firstName: string
    lastName: string
  }
  timeline: TimelineEvent[]
}

interface OrderItem {
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: any
  creator?: {
    creatorId: string
    commissionRate: number
    commissionAmount: number
  }
}

interface ShippingDetails {
  method: string
  carrier: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: string
  shippedAt?: string
  deliveredAt?: string
}

interface TimelineEvent {
  status: string
  message: string
  createdAt: string
  updatedBy?: string
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially-refunded'
type ShippingStatus = 'pending' | 'preparing' | 'shipped' | 'in-transit' | 'delivered' | 'failed'

interface OrderFilters {
  status?: string
  paymentStatus?: string
  shippingStatus?: string
  isGuest?: boolean
  dateFrom?: string
  dateTo?: string
  search?: string
}

interface OrderMetrics {
  totalOrders: number
  statusDistribution: Record<string, { count: number; totalValue: number }>
  averageOrderValue: number
  guestOrderPercentage: number
}

interface OrderManagementDashboardProps {
  onOrderSelect?: (orderId: string) => void
}

export default function OrderManagementDashboard({ onOrderSelect }: OrderManagementDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [filters, setFilters] = useState<OrderFilters>({})
  const [metrics, setMetrics] = useState<OrderMetrics | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Fetch orders with current filters and pagination
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      const result = await response.json()

      if (result.success) {
        setOrders(result.data.orders)
        setMetrics(result.data.metrics)
        setTotalPages(result.data.pagination.totalPages)
      } else {
        setError(result.error.message || 'Failed to fetch orders')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters, sortBy, sortOrder])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Handle bulk actions
  const handleBulkAction = async (action: string, updates: any = {}) => {
    if (selectedOrders.length === 0) return

    setBulkActionLoading(true)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          orderIds: selectedOrders,
          updates
        })
      })

      const result = await response.json()
      if (result.success) {
        setSelectedOrders([])
        fetchOrders()
        // Show success notification
      } else {
        setError(result.error.message || 'Bulk action failed')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Bulk action failed:', err)
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Handle CSV export
  const handleExport = async () => {
    if (selectedOrders.length === 0) return

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk-export',
          orderIds: selectedOrders
        })
      })

      const result = await response.json()
      if (result.success) {
        // Download CSV file
        const csvContent = convertToCSV(result.data.exportData)
        downloadCSV(csvContent, result.data.filename)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  // Status badge component
  const StatusBadge = ({ status, type = 'order' }: { status: string; type?: 'order' | 'payment' | 'shipping' }) => {
    const getStatusColor = (status: string, type: string) => {
      if (type === 'order') {
        switch (status) {
          case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
          case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
          case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200'
          case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
          case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
          case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
          case 'refunded': return 'bg-red-100 text-red-800 border-red-200'
          default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
      } else if (type === 'payment') {
        switch (status) {
          case 'completed': return 'bg-green-100 text-green-800 border-green-200'
          case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
          case 'failed': return 'bg-red-100 text-red-800 border-red-200'
          case 'refunded': return 'bg-orange-100 text-orange-800 border-orange-200'
          default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
      } else {
        switch (status) {
          case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
          case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200'
          case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
          default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
      }
    }

    return (
      <span className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
        getStatusColor(status, type)
      )}>
        {status.replace('-', ' ')}
      </span>
    )
  }

  // Metrics overview component
  const MetricsOverview = () => {
    if (!metrics) return null

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-foreground bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="sm" className="text-gray-600 bg-white">Total Orders</BodyText>
              <H3 className="text-xl text-foreground">{metrics.totalOrders.toLocaleString()}</H3>
            </div>
            <Package className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="text-foreground bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="sm" className="text-gray-600 bg-white">Avg Order Value</BodyText>
              <H3 className="text-xl text-foreground">${metrics.averageOrderValue.toFixed(0)}</H3>
            </div>
            <DollarSign className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="text-foreground bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="sm" className="text-gray-600 bg-white">Guest Orders</BodyText>
              <H3 className="text-xl text-foreground">{metrics.guestOrderPercentage.toFixed(1)}%</H3>
            </div>
            <User className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="text-foreground bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="sm" className="text-gray-600 bg-white">Processing</BodyText>
              <H3 className="text-xl text-foreground">
                {metrics.statusDistribution.processing?.count || 0}
              </H3>
            </div>
            <Clock className="w-8 h-8 text-accent" />
          </div>
        </div>
      </div>
    )
  }

  // Filters component
  const FiltersPanel = () => (
    <div className={cn(
      "text-foreground bg-white rounded-lg border shadow-sm transition-all duration-200",
      showFilters ? "p-4 mb-4" : "hidden"
    )}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Payment Status</label>
          <select
            value={filters.paymentStatus || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value || undefined }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Customer Type</label>
          <select
            value={filters.isGuest === undefined ? '' : filters.isGuest ? 'guest' : 'registered'}
            onChange={(e) => {
              const value = e.target.value
              setFilters(prev => ({ 
                ...prev, 
                isGuest: value === '' ? undefined : value === 'guest' 
              }))
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Customers</option>
            <option value="registered">Registered</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Search</label>
          <input
            type="text"
            placeholder="Order number, email..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="primary" size="sm" onClick={fetchOrders}>
          Apply Filters
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setFilters({})
            setCurrentPage(1)
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  )

  // Bulk actions bar
  const BulkActionsBar = () => {
    if (selectedOrders.length === 0) return null

    return (
      <div className="text-foreground bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BodyText className="text-foreground">
            {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
          </BodyText>
          
          <div className="flex flex-wrap gap-2">
            <select
              onChange={(e) => {
                const status = e.target.value
                if (status) {
                  handleBulkAction('bulk-status-update', { status, message: `Status updated to ${status} by admin` })
                }
                e.target.value = ''
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md"
              disabled={bulkActionLoading}
            >
              <option value="">Update Status...</option>
              <option value="confirmed">Mark as Confirmed</option>
              <option value="processing">Mark as Processing</option>
              <option value="shipped">Mark as Shipped</option>
              <option value="delivered">Mark as Delivered</option>
              <option value="cancelled">Mark as Cancelled</option>
            </select>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              disabled={bulkActionLoading}
            >
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedOrders([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Orders table component
  const OrdersTable = () => (
    <div className="text-foreground bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders(orders.map(order => order._id))
                    } else {
                      setSelectedOrders([])
                    }
                  }}
                  className="rounded border-gray-300 focus:ring-accent"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Payment</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(prev => [...prev, order._id])
                      } else {
                        setSelectedOrders(prev => prev.filter(id => id !== order._id))
                      }
                    }}
                    className="rounded border-gray-300 focus:ring-accent"
                  />
                </td>
                
                <td className="px-4 py-3">
                  <div>
                    <BodyText size="sm" className="font-medium text-foreground">
                      {order.orderNumber}
                    </BodyText>
                    <BodyText size="xs" className="text-gray-600 bg-white">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </BodyText>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div>
                    <BodyText size="sm" className="text-foreground">
                      {order.userId?.name || `${order.guestDetails?.firstName} ${order.guestDetails?.lastName}`}
                    </BodyText>
                    <BodyText size="xs" className="text-gray-600 bg-white">
                      {order.email}
                    </BodyText>
                    {order.isGuest && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800 mt-1">
                        Guest
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <StatusBadge status={order.status} type="order" />
                    {order.shipping?.trackingNumber && (
                      <BodyText size="xs" className="text-gray-600 bg-white">
                        {order.shipping.carrier} {order.shipping.trackingNumber}
                      </BodyText>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </td>

                <td className="px-4 py-3">
                  <BodyText size="sm" className="font-medium text-foreground">
                    ${order.total.toFixed(2)}
                  </BodyText>
                  <BodyText size="xs" className="text-gray-600 bg-white">
                    {order.currency}
                  </BodyText>
                </td>

                <td className="px-4 py-3">
                  <BodyText size="sm" className="text-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </BodyText>
                  <BodyText size="xs" className="text-gray-600 bg-white">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </BodyText>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openOrderDetail(order._id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openOrderEdit(order._id)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
        <BodyText size="sm" className="text-gray-600 bg-gray-50">
          Page {currentPage} of {totalPages}
        </BodyText>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  // Handle order selection for detail modal
  const openOrderDetail = (orderId: string) => {
    if (onOrderSelect) {
      onOrderSelect(orderId)
    }
  }

  const openOrderEdit = (orderId: string) => {
    if (onOrderSelect) {
      onOrderSelect(orderId)
    }
  }

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <H1 className="text-2xl text-foreground">Order Management</H1>
          <BodyText className="text-gray-600 bg-background">
            Manage customer orders, track fulfillment, and process status updates
          </BodyText>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", showFilters && "rotate-180")} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <BodyText className="text-red-800">{error}</BodyText>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      <MetricsOverview />

      {/* Filters Panel */}
      <FiltersPanel />

      {/* Bulk Actions */}
      <BulkActionsBar />

      {/* Orders Table */}
      <OrdersTable />
    </div>
  )
}

// Utility functions
function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  )
  
  return [headers, ...rows].join('\n')
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}