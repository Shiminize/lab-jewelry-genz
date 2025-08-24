'use client'

/**
 * Creator Statistics Component
 * Displays performance metrics and analytics for creators
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  TrendingUp, 
  DollarSign, 
  MousePointer, 
  ShoppingCart,
  Target,
  Calendar,
  Award,
  Eye
} from 'lucide-react'

interface Creator {
  id: string
  creatorCode: string
  displayName: string
  commissionRate: number
  minimumPayout: number
  status: string
  metrics: {
    totalClicks: number
    totalSales: number
    totalCommission: number
    conversionRate: number
    lastSaleDate?: string
  }
}

interface ConversionStats {
  allTime: {
    totalSales: number
    totalCommission: number
    totalOrderValue: number
  }
  period: {
    periodSales: number
    periodCommission: number
    periodOrderValue: number
  }
  clicks: {
    totalClicks: number
    conversions: number
  }
  conversionRate: string
  recentTransactions: Array<{
    id: string
    orderId: string
    commissionAmount: number
    orderAmount: number
    status: string
    createdAt: string
    type: string
  }>
  creator: {
    commissionRate: number
    minimumPayout: number
    status: string
  }
}

interface CreatorStatsProps {
  creator: Creator
}

export default function CreatorStats({ creator }: CreatorStatsProps) {
  const [stats, setStats] = useState<ConversionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/creators/conversions?period=${period}`)
      const result = await response.json()

      if (result.success) {
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <LoadingSpinner />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Performance Overview</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clicks */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.clicks.totalClicks.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500">Last {period} days</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.clicks.conversions.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.conversionRate || '0'}% conversion rate
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period Commission */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Period Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.period.periodCommission || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.period.periodSales || 0} sales
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.allTime.totalCommission || 0)}
                </p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Performance Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Commission Rate</div>
                <div className="text-lg font-semibold text-gray-900">
                  {creator.commissionRate}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Minimum Payout</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(creator.minimumPayout)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg. Order Value</div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats?.period.periodSales 
                    ? formatCurrency(stats.period.periodOrderValue / stats.period.periodSales)
                    : '$0.00'
                  }
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Sales</div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats?.allTime.totalSales.toLocaleString() || '0'}
                </div>
              </div>
            </div>

            {creator.metrics.lastSaleDate && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600">Last Sale</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(creator.metrics.lastSaleDate)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Recent Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentTransactions.length ? (
              <div className="space-y-3">
                {stats.recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Order #{transaction.orderId.slice(-8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.commissionAmount)}
                      </div>
                      <Badge 
                        variant={
                          transaction.status === 'paid' ? 'default' :
                          transaction.status === 'approved' ? 'secondary' :
                          transaction.status === 'pending' ? 'outline' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <div className="text-sm text-gray-500">No transactions yet</div>
                <div className="text-xs text-gray-400">
                  Start sharing your referral links to earn commissions!
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}