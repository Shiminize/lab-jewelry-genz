'use client'

/**
 * Commission History Component
 * Displays commission transactions and payout history for creators
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface CommissionTransaction {
  id: string
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

interface Payout {
  id: string
  amount: number
  currency: string
  paymentMethod: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  payoutDate: string
  completedAt?: string
  failureReason?: string
  paymentReference?: string
  transactionCount: number
}

export default function CommissionHistory() {
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts'>('transactions')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [activeTab, statusFilter, periodFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'transactions') {
        await fetchTransactions()
      } else {
        await fetchPayouts()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    // For now, we'll use the conversion stats endpoint
    // In a real app, you'd have a dedicated transactions endpoint
    const response = await fetch('/api/creators/conversions?period=365')
    const result = await response.json()

    if (result.success) {
      setTransactions(result.data.stats.recentTransactions || [])
    }
  }

  const fetchPayouts = async () => {
    // Mock payout data - in a real app, you'd fetch from /api/creators/payouts
    setPayouts([
      {
        id: '1',
        amount: 125.50,
        currency: 'USD',
        paymentMethod: 'PayPal',
        status: 'completed',
        payoutDate: '2024-01-15T00:00:00Z',
        completedAt: '2024-01-16T10:30:00Z',
        paymentReference: 'PP-2024-001',
        transactionCount: 8
      },
      {
        id: '2',
        amount: 89.25,
        currency: 'USD',
        paymentMethod: 'Bank Transfer',
        status: 'processing',
        payoutDate: '2024-02-01T00:00:00Z',
        transactionCount: 5
      }
    ])
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
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-aurora-emerald-flash" />
      case 'processing':
      case 'approved':
        return <Clock className="w-4 h-4 text-aurora-nebula-purple" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-aurora-amber-glow" />
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-aurora-nav-muted" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'default'
      case 'processing':
      case 'approved':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'cancelled':
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner text="Loading commission history..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Commission History</h2>
          <p className="text-sm text-aurora-nav-muted">
            Track your earnings and payout history
          </p>
        </div>
        <Button variant="outline" className="flex items-center space-x-token-sm">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-aurora-nav-muted hover:text-foreground hover:border-border'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payouts'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-aurora-nav-muted hover:text-foreground hover:border-border'
            }`}
          >
            Payouts
          </button>
        </nav>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-token-sm">
              <Filter className="w-4 h-4 text-aurora-nav-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-border rounded-token-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-token-sm">
              <Calendar className="w-4 h-4 text-aurora-nav-muted" />
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="border border-border rounded-token-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'transactions' ? (
        // Transactions List
        <div className="space-y-token-md">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-lg font-medium text-foreground mb-2">No transactions found</div>
                <p className="text-aurora-nav-muted">
                  Your commission transactions will appear here once you start making sales.
                </p>
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-token-md">
                      <div className="flex items-center space-x-token-sm">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <div className="font-medium text-foreground">
                            Order #{transaction.orderId.slice(-8)}
                          </div>
                          <div className="text-sm text-aurora-nav-muted">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-lg text-foreground">
                        {formatCurrency(transaction.commissionAmount)}
                      </div>
                      <div className="text-sm text-aurora-nav-muted">
                        {transaction.commissionRate}% of {formatCurrency(transaction.orderAmount)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-token-md">
                      <Badge variant={getStatusColor(transaction.status)} className="capitalize">
                        {transaction.status}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/orders/${transaction.orderId}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {transaction.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-token-lg">
                      <div className="text-sm text-aurora-nav-muted">{transaction.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        // Payouts List
        <div className="space-y-token-md">
          {payouts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-lg font-medium text-foreground mb-2">No payouts yet</div>
                <p className="text-aurora-nav-muted">
                  Your payouts will appear here once you reach the minimum payout threshold.
                </p>
              </CardContent>
            </Card>
          ) : (
            payouts.map((payout) => (
              <Card key={payout.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-token-md">
                      <div className="flex items-center space-x-token-sm">
                        {getStatusIcon(payout.status)}
                        <div>
                          <div className="font-medium text-foreground">
                            Payout #{payout.id}
                          </div>
                          <div className="text-sm text-aurora-nav-muted">
                            {payout.transactionCount} transactions • {payout.paymentMethod}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-lg text-foreground">
                        {formatCurrency(payout.amount, payout.currency)}
                      </div>
                      <div className="text-sm text-aurora-nav-muted">
                        Scheduled: {formatDate(payout.payoutDate)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-token-md">
                      <Badge variant={getStatusColor(payout.status)} className="capitalize">
                        {payout.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-aurora-nav-muted">Payment Method:</span>
                      <div className="font-medium">{payout.paymentMethod}</div>
                    </div>
                    
                    {payout.paymentReference && (
                      <div>
                        <span className="text-aurora-nav-muted">Reference:</span>
                        <div className="font-medium font-mono">{payout.paymentReference}</div>
                      </div>
                    )}
                    
                    {payout.completedAt && (
                      <div>
                        <span className="text-aurora-nav-muted">Completed:</span>
                        <div className="font-medium">{formatDate(payout.completedAt)}</div>
                      </div>
                    )}
                    
                    {payout.failureReason && (
                      <div>
                        <span className="text-aurora-nav-muted">Failure Reason:</span>
                        <div className="font-medium text-red-600">{payout.failureReason}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(transactions.reduce((sum, t) => sum + t.commissionAmount, 0))}
              </div>
              <div className="text-sm text-aurora-nav-muted">Total Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="text-sm text-aurora-nav-muted">Total Paid Out</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(
                  transactions.filter(t => ['pending', 'approved'].includes(t.status))
                    .reduce((sum, t) => sum + t.commissionAmount, 0)
                )}
              </div>
              <div className="text-sm text-aurora-nav-muted">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}