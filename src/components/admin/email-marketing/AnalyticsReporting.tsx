'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Mail, 
  Users, 
  Send, 
  Eye, 
  MousePointer, 
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Target,
  Clock,
  Activity,
  Zap,
  FileText,
  Star
} from 'lucide-react'
import { Button } from '../../ui/Button'
import { H1, H2, H3, BodyText } from '../../foundation/Typography'
import { cn } from '../../../lib/utils'

// Interfaces for analytics data
interface AnalyticsMetrics {
  overview: {
    totalCampaigns: number
    totalSent: number
    totalDelivered: number
    totalOpened: number
    totalClicked: number
    totalUnsubscribed: number
    totalRevenue: number
    avgOpenRate: number
    avgClickRate: number
    avgDeliveryRate: number
    avgUnsubscribeRate: number
    conversionRate: number
  }
  performance: {
    periodComparison: {
      sent: { current: number; previous: number; change: number }
      openRate: { current: number; previous: number; change: number }
      clickRate: { current: number; previous: number; change: number }
      revenue: { current: number; previous: number; change: number }
    }
    topCampaigns: {
      _id: string
      name: string
      sent: number
      openRate: number
      clickRate: number
      revenue: number
    }[]
    topSegments: {
      _id: string
      name: string
      customers: number
      avgOpenRate: number
      avgClickRate: number
      revenue: number
    }[]
    topTemplates: {
      _id: string
      name: string
      usageCount: number
      avgOpenRate: number
      avgClickRate: number
    }[]
  }
  timeSeriesData: {
    date: string
    sent: number
    delivered: number
    opened: number
    clicked: number
    revenue: number
  }[]
  segmentBreakdown: {
    demographic: { name: string; value: number; percentage: number }[]
    geographic: { name: string; value: number; percentage: number }[]
    behavioral: { name: string; value: number; percentage: number }[]
  }
  deviceStats: {
    desktop: number
    mobile: number
    tablet: number
    unknown: number
  }
  engagementFlow: {
    step: string
    users: number
    dropoffRate: number
  }[]
}

// Date range options
const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' }
]

// Metric card component with trend indicators
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  format = 'number',
  trendValue,
  size = 'md'
}: {
  title: string
  value: number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  format?: 'number' | 'currency' | 'percentage'
  trendValue?: number
  size?: 'sm' | 'md' | 'lg'
}) => {
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-success'
      case 'down': return 'text-error'
      default: return 'text-aurora-nav-muted'
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return ArrowUp
      case 'down': return ArrowDown
      default: return null
    }
  }

  const TrendIcon = getTrendIcon(trend)

  return (
    <div className={cn(
      "text-foreground bg-background rounded-token-lg border space-y-3",
      size === 'lg' ? 'p-6' : size === 'sm' ? 'p-3' : 'p-4'
    )}>
      <div className="flex items-center justify-between">
        <div className={cn(
          "bg-accent/10 rounded-token-lg flex items-center justify-center",
          size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
        )}>
          <Icon className={cn(
            "text-accent",
            size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
          )} />
        </div>
        {trend && trendValue !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            getTrendColor(trend)
          )}>
            {TrendIcon && <TrendIcon className="w-3 h-3" />}
            {Math.abs(trendValue).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <div className={cn(
          "font-bold text-foreground",
          size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
        )}>
          {formatValue(value, format)}
        </div>
        <BodyText size="sm" className="text-aurora-nav-muted bg-background">
          {title}
        </BodyText>
        {subtitle && (
          <BodyText size="xs" className="text-aurora-nav-muted bg-background">
            {subtitle}
          </BodyText>
        )}
      </div>
    </div>
  )
}

// Top performers table component
const TopPerformersTable = ({ 
  title, 
  data, 
  columns,
  icon: Icon 
}: {
  title: string
  data: any[]
  columns: { key: string; label: string; format?: string }[]
  icon: React.ComponentType<{ className?: string }>
}) => {
  const formatValue = (value: any, format?: string) => {
    if (typeof value !== 'number') return value
    
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  return (
    <div className="text-foreground bg-background p-6 rounded-token-lg border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-accent/10 rounded-token-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <H3 className="text-foreground">{title}</H3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map(column => (
                <th key={column.key} className="text-left py-2 px-3 text-sm font-medium text-aurora-nav-muted bg-background">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((item, index) => (
              <tr key={index} className="border-b border-border/50">
                {columns.map(column => (
                  <td key={column.key} className="py-2 px-3 text-sm text-foreground">
                    {formatValue(item[column.key], column.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8">
          <BodyText className="text-aurora-nav-muted bg-background">
            No data available for the selected period
          </BodyText>
        </div>
      )}
    </div>
  )
}

// Engagement funnel component
const EngagementFunnel = ({ data }: { data: AnalyticsMetrics['engagementFlow'] }) => {
  const maxUsers = Math.max(...data.map(step => step.users))
  
  return (
    <div className="text-foreground bg-background p-6 rounded-token-lg border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-accent/10 rounded-token-lg flex items-center justify-center">
          <Activity className="w-4 h-4 text-accent" />
        </div>
        <H3 className="text-foreground">Email Engagement Funnel</H3>
      </div>
      
      <div className="space-y-token-md">
        {data.map((step, index) => {
          const percentage = (step.users / maxUsers) * 100
          const nextStep = data[index + 1]
          const dropoffRate = nextStep ? ((step.users - nextStep.users) / step.users) * 100 : 0
          
          return (
            <div key={step.step} className="space-y-token-sm">
              <div className="flex items-center justify-between">
                <BodyText className="font-medium text-foreground">
                  {step.step}
                </BodyText>
                <div className="flex items-center gap-4">
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    {step.users.toLocaleString()} users
                  </BodyText>
                  {index < data.length - 1 && (
                    <BodyText size="sm" className="text-error">
                      {dropoffRate.toFixed(1)}% dropoff
                    </BodyText>
                  )}
                </div>
              </div>
              <div className="w-full bg-muted rounded-token-lg h-6 relative overflow-hidden">
                <div 
                  className="bg-accent h-full rounded-token-lg transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BodyText size="xs" className="text-foreground font-medium">
                    {percentage.toFixed(1)}%
                  </BodyText>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Device breakdown chart
const DeviceBreakdown = ({ data }: { data: AnalyticsMetrics['deviceStats'] }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0)
  const devices = [
    { name: 'Desktop', value: data.desktop, color: 'bg-info' },
    { name: 'Mobile', value: data.mobile, color: 'bg-success' },
    { name: 'Tablet', value: data.tablet, color: 'bg-warning' },
    { name: 'Unknown', value: data.unknown, color: 'bg-muted' }
  ]

  return (
    <div className="text-foreground bg-background p-6 rounded-token-lg border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-accent/10 rounded-token-lg flex items-center justify-center">
          <Target className="w-4 h-4 text-accent" />
        </div>
        <H3 className="text-foreground">Device Breakdown</H3>
      </div>
      
      <div className="space-y-token-md">
        {devices.map(device => {
          const percentage = total > 0 ? (device.value / total) * 100 : 0
          
          return (
            <div key={device.name} className="space-y-token-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", device.color)} />
                  <BodyText className="text-foreground">{device.name}</BodyText>
                </div>
                <div className="flex items-center gap-4">
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    {device.value.toLocaleString()}
                  </BodyText>
                  <BodyText size="sm" className="text-foreground font-medium">
                    {percentage.toFixed(1)}%
                  </BodyText>
                </div>
              </div>
              <div className="w-full bg-muted rounded h-2">
                <div 
                  className={cn("h-full rounded transition-all duration-300", device.color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Main Analytics and Reporting Component
export default function AnalyticsReporting() {
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30d')
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' })

  // Fetch analytics data
  const fetchAnalytics = async (period = dateRange) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ period })
      if (period === 'custom' && customDateRange.start && customDateRange.end) {
        params.append('startDate', customDateRange.start)
        params.append('endDate', customDateRange.end)
      }

      const response = await fetch(`/api/admin/email-marketing/analytics?${params}`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.data)
      } else {
        throw new Error(data.error?.message || 'Failed to fetch analytics')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  // Handle date range change
  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange)
  }

  // Export analytics data
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ period: dateRange, format: 'csv' })
      if (dateRange === 'custom' && customDateRange.start && customDateRange.end) {
        params.append('startDate', customDateRange.start)
        params.append('endDate', customDateRange.end)
      }

      const response = await fetch(`/api/admin/email-marketing/analytics/export?${params}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `email-analytics-${dateRange}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to export analytics:', err)
    }
  }

  // Loading state
  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-token-md">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-token-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-token-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-foreground bg-background p-6 rounded-token-lg border text-center">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <H2 className="mb-2 text-foreground">Failed to Load Analytics</H2>
        <BodyText className="text-aurora-nav-muted bg-background mb-4">
          {error}
        </BodyText>
        <Button variant="primary" size="md" onClick={() => fetchAnalytics()}>
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <H2 className="text-foreground">Email Analytics & Reporting</H2>
          <BodyText className="text-aurora-nav-muted bg-background">
            Comprehensive insights into your email marketing performance
          </BodyText>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="md" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="secondary" size="md" onClick={() => fetchAnalytics()}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Custom Date Range */}
      {dateRange === 'custom' && (
        <div className="text-foreground bg-background p-4 rounded-token-lg border">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
              />
            </div>
            <div className="mt-6">
              <Button variant="primary" size="md" onClick={() => fetchAnalytics('custom')}>
                Apply Range
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Campaigns"
          value={analytics.overview.totalCampaigns}
          subtitle="Active campaigns"
          icon={Send}
          trend="up"
          trendValue={analytics.performance.periodComparison.sent.change}
        />
        <MetricCard
          title="Emails Sent"
          value={analytics.overview.totalSent}
          subtitle={`${analytics.overview.avgDeliveryRate.toFixed(1)}% delivered`}
          icon={Mail}
          trend={analytics.performance.periodComparison.sent.change > 0 ? 'up' : 'down'}
          trendValue={analytics.performance.periodComparison.sent.change}
        />
        <MetricCard
          title="Open Rate"
          value={analytics.overview.avgOpenRate}
          subtitle="Average across all campaigns"
          icon={Eye}
          format="percentage"
          trend={analytics.performance.periodComparison.openRate.change > 0 ? 'up' : 'down'}
          trendValue={analytics.performance.periodComparison.openRate.change}
        />
        <MetricCard
          title="Click Rate"
          value={analytics.overview.avgClickRate}
          subtitle="Average across all campaigns"
          icon={MousePointer}
          format="percentage"
          trend={analytics.performance.periodComparison.clickRate.change > 0 ? 'up' : 'down'}
          trendValue={analytics.performance.periodComparison.clickRate.change}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={analytics.overview.totalRevenue}
          subtitle="From email campaigns"
          icon={DollarSign}
          format="currency"
          trend={analytics.performance.periodComparison.revenue.change > 0 ? 'up' : 'down'}
          trendValue={analytics.performance.periodComparison.revenue.change}
        />
        <MetricCard
          title="Conversion Rate"
          value={analytics.overview.conversionRate}
          subtitle="Email to purchase"
          icon={Target}
          format="percentage"
          trend="up"
        />
        <MetricCard
          title="Unsubscribe Rate"
          value={analytics.overview.avgUnsubscribeRate}
          subtitle="Average across campaigns"
          icon={Users}
          format="percentage"
          trend={analytics.overview.avgUnsubscribeRate < 2 ? 'up' : 'down'}
        />
        <MetricCard
          title="List Growth"
          value={analytics.overview.totalOpened}
          subtitle="New subscribers this period"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformersTable
          title="Top Performing Campaigns"
          icon={Star}
          data={analytics.performance.topCampaigns}
          columns={[
            { key: 'name', label: 'Campaign' },
            { key: 'sent', label: 'Sent' },
            { key: 'openRate', label: 'Open Rate', format: 'percentage' },
            { key: 'revenue', label: 'Revenue', format: 'currency' }
          ]}
        />
        
        <TopPerformersTable
          title="Top Performing Segments"
          icon={Users}
          data={analytics.performance.topSegments}
          columns={[
            { key: 'name', label: 'Segment' },
            { key: 'customers', label: 'Customers' },
            { key: 'avgOpenRate', label: 'Open Rate', format: 'percentage' },
            { key: 'revenue', label: 'Revenue', format: 'currency' }
          ]}
        />
      </div>

      {/* Templates and Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformersTable
          title="Top Performing Templates"
          icon={FileText}
          data={analytics.performance.topTemplates}
          columns={[
            { key: 'name', label: 'Template' },
            { key: 'usageCount', label: 'Usage' },
            { key: 'avgOpenRate', label: 'Open Rate', format: 'percentage' },
            { key: 'avgClickRate', label: 'Click Rate', format: 'percentage' }
          ]}
        />
        
        <DeviceBreakdown data={analytics.deviceStats} />
      </div>

      {/* Engagement Funnel */}
      <EngagementFunnel data={analytics.engagementFlow} />
    </div>
  )
}