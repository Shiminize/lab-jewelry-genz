'use client'

/**
 * Admin Commission Management Component
 * Allows admins to view and manage commission transactions
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronDown
} from 'lucide-react'

interface CommissionTransaction {
  _id: string
  creatorId: string
  creatorName: string
  creatorCode: string
  orderId: string
  commissionRate: number
  orderAmount: number
  commissionAmount: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  type: 'sale' | 'return' | 'adjustment'
  notes?: string
  createdAt: string
  processedAt?: string
  paidAt?: string
}

interface Analytics {
  totalCommissions: number
  totalPayouts: number
  pendingCommissions: number
  activeCreators: number
  topCreators: Array<{
    creatorId: string
    displayName: string
    totalCommissions: number
    totalSales: number
  }>
}

interface CommissionData {
  transactions: CommissionTransaction[]
  analytics: Analytics
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
  }
}

export default function CommissionManagement() {
  const [data, setData] = useState<CommissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [bulkAction, setBulkAction] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCommissions()
  }, [currentPage, statusFilter, searchTerm])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/commissions?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId)
      } else {
        return [...prev, transactionId]
      }
    })
  }

  const handleSelectAll = () => {
    if (!data?.transactions) return

    if (selectedTransactions.length === data.transactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(data.transactions.map(t => t._id))
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTransactions.length === 0) return

    if (bulkAction === 'approve') {
      await approveTransactions()
    }
    // Add other bulk actions as needed
  }

  const approveTransactions = async () => {
    try {
      setSubmitting(true)
      const response = await fetch('/api/admin/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionIds: selectedTransactions,
          adminNotes: 'Bulk approved via admin dashboard'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSelectedTransactions([])
        setBulkAction('')
        fetchCommissions() // Refresh data
        alert(`Successfully approved ${result.data.approved} transactions`)
      } else {
        alert(result.error?.message || 'Failed to approve transactions')
      }
    } catch (error) {
      console.error('Error approving transactions:', error)
      alert('Failed to approve transactions')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
      case 'approved':
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <LoadingSpinner text="Loading commission data..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commission Management</h1>
        <p className="text-gray-600">Monitor and manage creator commissions</p>
      </div>

      {/* Analytics Cards */}
      {data?.analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.analytics.totalCommissions)}
                  </div>
                  <div className="text-sm text-gray-500">Total Commissions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.analytics.totalPayouts)}
                  </div>
                  <div className="text-sm text-gray-500">Total Payouts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.analytics.pendingCommissions)}
                  </div>
                  <div className="text-sm text-gray-500">Pending Approval</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.analytics.activeCreators}
                  </div>
                  <div className="text-sm text-gray-500">Active Creators</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by creator name, code, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedTransactions.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedTransactions.length} selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Bulk Actions</option>
                  <option value="approve">Approve Selected</option>
                </select>
                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || submitting}
                  size="sm"
                >
                  {submitting ? 'Processing...' : 'Apply'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      {!data?.transactions || data.transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">No transactions found</div>
            <p className="text-gray-500">
              {statusFilter !== 'all' || searchTerm
                ? 'Try adjusting your filters'
                : 'Commission transactions will appear here'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.length === data.transactions.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Creator</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Order</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Commission</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction._id)}
                          onChange={() => handleTransactionSelect(transaction._id)}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{transaction.creatorName}</div>
                          <div className="text-sm text-gray-500 font-mono">{transaction.creatorCode}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm">#{transaction.orderId.slice(-8)}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(transaction.orderAmount)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-amber-600">
                          {formatCurrency(transaction.commissionAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.commissionRate}% rate
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transaction.status)}
                          <Badge variant={getStatusColor(transaction.status)} className="capitalize">
                            {transaction.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{formatDate(transaction.createdAt)}</div>
                        {transaction.processedAt && (
                          <div className="text-xs text-gray-500">
                            Processed: {formatDate(transaction.processedAt)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} transactions
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
                <span className="text-sm text-gray-600">
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