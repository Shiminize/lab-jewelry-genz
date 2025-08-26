'use client'

/**
 * Commission Transaction Timeline Visualization
 * Shows commission flow over time with different status categories
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react'

interface CommissionData {
  date: string
  earned: number
  approved: number
  paid: number
  pending: number
  totalCreators: number
}

interface CommissionSummary {
  totalEarned: number
  totalApproved: number
  totalPaid: number
  totalPending: number
  conversionRate: number
  averageCommission: number
}

const mockCommissionData: CommissionData[] = [
  { date: '2024-08-01', earned: 1200, approved: 950, paid: 800, pending: 400, totalCreators: 15 },
  { date: '2024-08-02', earned: 1450, approved: 1100, paid: 950, pending: 500, totalCreators: 17 },
  { date: '2024-08-03', earned: 1680, approved: 1250, paid: 1100, pending: 580, totalCreators: 19 },
  { date: '2024-08-04', earned: 1520, approved: 1380, paid: 1250, pending: 270, totalCreators: 18 },
  { date: '2024-08-05', earned: 1890, approved: 1520, paid: 1380, pending: 510, totalCreators: 22 },
  { date: '2024-08-06', earned: 2150, approved: 1890, paid: 1520, pending: 630, totalCreators: 25 },
  { date: '2024-08-07', earned: 1980, approved: 2150, paid: 1890, pending: 260, totalCreators: 23 },
  { date: '2024-08-08', earned: 2380, approved: 1980, paid: 2150, pending: 380, totalCreators: 27 },
  { date: '2024-08-09', earned: 2610, approved: 2380, paid: 1980, pending: 630, totalCreators: 29 },
  { date: '2024-08-10', earned: 2450, approved: 2610, paid: 2380, pending: 270, totalCreators: 28 },
  { date: '2024-08-11', earned: 2890, approved: 2450, paid: 2610, pending: 840, totalCreators: 32 },
  { date: '2024-08-12', earned: 3120, approved: 2890, paid: 2450, pending: 670, totalCreators: 35 },
  { date: '2024-08-13', earned: 2980, approved: 3120, paid: 2890, pending: 230, totalCreators: 33 },
  { date: '2024-08-14', earned: 3350, approved: 2980, paid: 3120, pending: 580, totalCreators: 38 }
]

export default function CommissionTimelineChart() {
  const [data, setData] = useState<CommissionData[]>(mockCommissionData)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [summary, setSummary] = useState<CommissionSummary>({
    totalEarned: 0,
    totalApproved: 0,
    totalPaid: 0,
    totalPending: 0,
    conversionRate: 0,
    averageCommission: 0
  })

  useEffect(() => {
    // Calculate summary statistics
    const totalEarned = data.reduce((sum, item) => sum + item.earned, 0)
    const totalApproved = data.reduce((sum, item) => sum + item.approved, 0)
    const totalPaid = data.reduce((sum, item) => sum + item.paid, 0)
    const totalPending = data.reduce((sum, item) => sum + item.pending, 0)
    const avgCreators = data.reduce((sum, item) => sum + item.totalCreators, 0) / data.length
    
    setSummary({
      totalEarned,
      totalApproved,
      totalPaid,
      totalPending,
      conversionRate: (totalPaid / totalEarned) * 100,
      averageCommission: totalEarned / avgCreators
    })
  }, [data])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 capitalize">{entry.dataKey}:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Status data for the bar chart
  const statusData = [
    { status: 'Pending', amount: summary.totalPending, color: '#F59E0B' }, // Aurora: Enhanced warning amber
    { status: 'Approved', amount: summary.totalApproved, color: '#10B981' }, // Aurora: Enhanced success green
    { status: 'Paid', amount: summary.totalPaid, color: '#6B46C1' } // Aurora: Nebula Purple
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Commission Timeline</h2>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Total Earned</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalEarned)}
              </div>
              <div className="text-sm text-gray-500">
                Avg per creator: {formatCurrency(summary.averageCommission)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Paid</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalPaid)}
              </div>
              <div className="text-sm text-gray-500">
                {summary.conversionRate.toFixed(1)}% payout rate
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalPending)}
              </div>
              <Badge variant="secondary" className="mt-1">
                Awaiting Review
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Approved</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalApproved)}
              </div>
              <Badge variant="outline" className="mt-1 text-green-700 border-green-300">
                Ready for Payout
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commission Flow Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Commission Flow Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earned"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                  name="Earned"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stackId="2"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  name="Approved"
                />
                <Area
                  type="monotone"
                  dataKey="paid"
                  stackId="3"
                  stroke="#6B46C1"
                  fill="#6B46C1"
                  fillOpacity={0.1}
                  name="Paid"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Commission Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statusData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  type="category"
                  dataKey="status" 
                  stroke="#666"
                  fontSize={12}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Status Legend */}
            <div className="mt-4 space-y-2">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.status}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}