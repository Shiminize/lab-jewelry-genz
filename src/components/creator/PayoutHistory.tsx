'use client'

/**
 * Payout History Component
 * Displays creator's payout history and status
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  DollarSign,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'

interface Payout {
  _id: string
  amount: number
  currency: string
  paymentMethod: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  payoutDate: string
  completedAt?: string
  failureReason?: string
  paymentReference?: string
  transactionCount: number
  transactionIds: string[]
}

interface PayoutHistoryData {
  payouts: Payout[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
  }
}

export default function PayoutHistory() {
  const [data, setData] = useState<PayoutHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [cancelling, setCancelling] = useState<string>('')

  useEffect(() => {
    fetchPayouts()
  }, [currentPage, statusFilter])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/creators/payouts?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelPayout = async (payoutId: string) => {
    if (!confirm('Are you sure you want to cancel this payout? The commission will be returned to your available balance.')) {
      return
    }

    try {
      setCancelling(payoutId)
      const response = await fetch(`/api/creators/payouts/${payoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'cancel' })
      })

      if (response.ok) {
        fetchPayouts() // Refresh the list
      } else {
        const result = await response.json()
        alert(result.error?.message || 'Failed to cancel payout')
      }
    } catch (error) {
      console.error('Error cancelling payout:', error)
      alert('Failed to cancel payout')
    } finally {
      setCancelling('')
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-aurora-nav-muted" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusDescription = (payout: Payout) => {
    switch (payout.status) {
      case 'pending':
        return 'Waiting for processing'
      case 'processing':
        return 'Payment is being processed'
      case 'completed':
        return payout.completedAt ? `Completed ${formatDate(payout.completedAt)}` : 'Payment completed'
      case 'failed':
        return payout.failureReason || 'Payment failed'
      default:
        return 'Unknown status'
    }
  }

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner text="Loading payout history..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Payout History</h2>
          <p className="text-sm text-aurora-nav-muted">
            Track your payout requests and payment status
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-aurora-nav-muted" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payouts List */}
      {!data?.payouts || data.payouts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-aurora-nav-muted mx-auto mb-4" />
            <div className="text-lg font-medium text-foreground mb-2">No payouts found</div>
            <p className="text-aurora-nav-muted">
              {statusFilter !== 'all' 
                ? 'No payouts match your filter criteria'
                : 'Your payout requests will appear here once you submit them'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.payouts.map((payout) => (
            <Card key={payout._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Payout Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(payout.status)}
                        <div>
                          <div className="font-medium text-foreground">
                            {formatCurrency(payout.amount, payout.currency)}
                          </div>
                          <div className="text-sm text-aurora-nav-muted">
                            {payout.transactionCount} transactions • {payout.paymentMethod}
                          </div>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(payout.status)} className="capitalize">
                        {payout.status}
                      </Badge>
                    </div>

                    <div className="text-sm text-aurora-nav-muted">
                      {getStatusDescription(payout)}
                    </div>

                    {payout.paymentReference && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-aurora-nav-muted">Reference:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          {payout.paymentReference}
                        </code>
                      </div>
                    )}

                    <div className="text-xs text-aurora-nav-muted">
                      Requested: {formatDate(payout.payoutDate)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-32 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4">
                    <div className="flex lg:flex-col gap-2">
                      {payout.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelPayout(payout._id)}
                          disabled={cancelling === payout._id}
                          className="flex-1 lg:flex-none text-red-600 hover:text-red-700"
                        >
                          {cancelling === payout._id ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // TODO: Open payout details modal or navigate to details page
                          console.log('View details for payout:', payout._id)
                        }}
                        className="flex-1 lg:flex-none"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-aurora-nav-muted">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} payouts
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={data.pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-aurora-nav-muted">
                  Page {data.pagination.page} of {data.pagination.pages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={data.pagination.page === data.pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}