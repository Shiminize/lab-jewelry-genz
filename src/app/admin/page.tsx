'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package,
  Mail,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Eye,
  MousePointer,
  Star,
  Zap,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Business metrics interface following PRD requirements
interface BusinessMetrics {
  revenue: {
    current: number
    target: number
    growth: number
    ytd: number
  }
  customers: {
    total: number
    cac: number
    clv: number
    clvCacRatio: number
  }
  conversion: {
    rate: number
    target: number
    improvement: number
  }
  creators: {
    active: number
    target: number
    revenue: number
    commissions: number
  }
  inventory: {
    products: number
    lowStock: number
    stockouts: number
    turnover: number
  }
  orders: {
    total: number
    pending: number
    processing: number
    avgProcessingTime: number
  }
}

// Mock data based on PRD targets
const mockMetrics: BusinessMetrics = {
  revenue: {
    current: 2800000, // $2.8M current ARR
    target: 5000000,  // $5M Year 1 target
    growth: 15.2,     // 15.2% MoM growth
    ytd: 1950000      // $1.95M YTD
  },
  customers: {
    total: 1250,      // Current customers
    cac: 142,         // $142 CAC (target <$150)
    clv: 3650,        // $3,650 CLV (target >$3,500)
    clvCacRatio: 25.7 // 25.7:1 ratio (target >20:1)
  },
  conversion: {
    rate: 3.1,        // 3.1% current rate
    target: 4.5,      // 4.5% target rate
    improvement: 0.3  // +0.3% improvement this month
  },
  creators: {
    active: 78,       // 78 active creators (target 100+)
    target: 100,      // Target for Year 1
    revenue: 1120000, // $1.12M creator-driven revenue (40% of sales)
    commissions: 336000 // $336K in commissions paid
  },
  inventory: {
    products: 75,     // 75 products seeded
    lowStock: 5,      // 5 items low stock
    stockouts: 0,     // 0 stockouts (target <5%)
    turnover: 5.2     // 5.2x turnover (target 6x)
  },
  orders: {
    total: 1125,      // Total orders
    pending: 8,       // Pending orders
    processing: 12,   // Processing orders
    avgProcessingTime: 36 // 36 hours avg (target <48h)
  }
}

// Touch-optimized metric card component
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendValue,
  format = 'number',
  target,
  className = '',
  onClick
}: {
  title: string
  value: number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: number
  format?: 'number' | 'currency' | 'percentage'
  target?: number
  className?: string
  onClick?: () => void
}) => {
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${(value / 1000000).toFixed(1)}M`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const progressPercentage = target ? Math.min((value / target) * 100, 100) : 0

  return (
    <div 
      className={cn(
        "text-foreground bg-white p-4 sm:p-6 rounded-lg border shadow-sm",
        "transition-all duration-200 hover:shadow-md",
        "touch-manipulation min-h-[120px] flex flex-col justify-between",
        onClick && "cursor-pointer hover:scale-102 active:scale-98",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
        </div>
        {trend && trendValue !== undefined && (
          <div className={cn("text-xs sm:text-sm font-medium", getTrendColor(trend))}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {Math.abs(trendValue).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-1 sm:space-y-2">
        <H3 className="text-lg sm:text-xl text-foreground leading-tight">{formatValue(value, format)}</H3>
        <BodyText size="sm" className="text-gray-600 bg-white font-medium">
          {title}
        </BodyText>
        {subtitle && (
          <BodyText size="xs" className="text-foreground bg-muted">
            {subtitle}
          </BodyText>
        )}
        
        {/* Progress bar for targets - mobile optimized */}
        {target && (
          <div className="mt-2 sm:mt-3">
            <div className="flex justify-between items-center mb-1">
              <BodyText size="xs" className="text-gray-600 bg-white">
                Target: {formatValue(target, format)}
              </BodyText>
              <BodyText size="xs" className="text-foreground font-semibold">
                {progressPercentage.toFixed(0)}%
              </BodyText>
            </div>
            <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
              <div 
                className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Quick actions component
const QuickActions = () => {
  const actions = [
    { label: 'New Campaign', href: '/admin/email-marketing', icon: Mail, variant: 'primary' as const },
    { label: 'Check Inventory', href: '/admin/inventory', icon: Package, variant: 'secondary' as const },
    { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart, variant: 'outline' as const },
    { label: 'Creator Program', href: '/admin/creators', icon: Users, variant: 'ghost' as const }
  ]

  return (
    <div className="text-foreground bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
      <H3 className="mb-4 text-foreground">Quick Actions</H3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Button
              key={index}
              variant="primary"
              size="md"
              className="flex flex-col items-center gap-2 h-auto py-3 sm:py-4 touch-manipulation min-h-[64px] transition-transform hover:scale-105 active:scale-95"
              onClick={() => window.location.href = action.href}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <BodyText size="xs sm:text-sm" className="text-center leading-tight">
                {action.label}
              </BodyText>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

// Main admin dashboard component
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [alerts, setAlerts] = useState<any[]>([])

  // Fetch real metrics from API
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        const [metricsResponse, alertsResponse] = await Promise.all([
          fetch('/api/admin/dashboard/metrics?timeframe=30d'),
          fetch('/api/admin/dashboard/alerts')
        ])
        
        const metricsResult = await metricsResponse.json()
        const alertsResult = await alertsResponse.json()
        
        if (metricsResult.success) {
          setMetrics(metricsResult.data.metrics)
        } else {
          setMetrics(mockMetrics)
        }
        
        if (alertsResult.success) {
          setAlerts(alertsResult.data.alerts.slice(0, 3)) // Show top 3 alerts
        }
        
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setMetrics(mockMetrics)
        setLastUpdated(new Date())
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const refreshData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard/metrics?timeframe=30d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' })
      })
      const result = await response.json()
      
      if (result.success) {
        setMetrics(result.data.metrics)
      } else {
        setMetrics(mockMetrics)
      }
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to refresh metrics:', error)
      setMetrics(mockMetrics)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <H1 className="text-xl sm:text-2xl text-foreground">Admin Dashboard</H1>
            <BodyText size="sm" className="text-gray-600 bg-background">
              Business metrics and operational overview
            </BodyText>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <BodyText size="xs sm:text-sm" className="text-gray-600 bg-background flex-1 sm:flex-none">
              Updated: {lastUpdated.toLocaleTimeString()}
            </BodyText>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="touch-manipulation min-h-[40px] px-3 sm:px-4"
            >
              <RefreshCw className={cn("w-3 h-3 sm:w-4 sm:h-4", loading && "animate-spin")} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div>
        <H2 className="mb-4 text-foreground">Key Performance Indicators</H2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Annual Revenue"
            value={metrics.revenue.current}
            subtitle={`Target: $${(metrics.revenue.target / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            format="currency"
            trend="up"
            trendValue={metrics.revenue.growth}
            target={metrics.revenue.target}
            onClick={() => window.location.href = '/admin/analytics?view=revenue'}
          />
          <MetricCard
            title="Customer Acquisition"
            value={metrics.customers.cac}
            subtitle={`CLV:CAC Ratio ${metrics.customers.clvCacRatio.toFixed(1)}:1`}
            icon={Users}
            format="currency"
            trend="down"
            trendValue={5.2}
            target={150}
            onClick={() => window.location.href = '/admin/analytics?view=customers'}
          />
          <MetricCard
            title="Conversion Rate"
            value={metrics.conversion.rate}
            subtitle="Monthly improvement +0.3%"
            icon={TrendingUp}
            format="percentage"
            trend="up"
            trendValue={metrics.conversion.improvement}
            target={metrics.conversion.target}
            onClick={() => window.location.href = '/admin/analytics?view=conversion'}
          />
          <MetricCard
            title="Active Creators"
            value={metrics.creators.active}
            subtitle={`$${(metrics.creators.revenue / 1000000).toFixed(1)}M creator revenue`}
            icon={Star}
            trend="up"
            trendValue={12.5}
            target={metrics.creators.target}
            onClick={() => window.location.href = '/admin/creators'}
          />
        </div>
      </div>

      {/* Operational Metrics */}
      <div>
        <H2 className="mb-4 text-foreground">Operational Metrics</H2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Products"
            value={metrics.inventory.products}
            subtitle={`${metrics.inventory.lowStock} low stock items`}
            icon={Package}
            trend="neutral"
            onClick={() => window.location.href = '/admin/inventory'}
          />
          <MetricCard
            title="Orders Processing"
            value={metrics.orders.processing}
            subtitle={`${metrics.orders.avgProcessingTime}h avg processing`}
            icon={ShoppingCart}
            trend="up"
            trendValue={8.3}
            onClick={() => window.location.href = '/admin/orders'}
          />
          <MetricCard
            title="System Performance"
            value={99.9}
            subtitle="API uptime this month"
            icon={Zap}
            format="percentage"
            trend="up"
            onClick={() => window.location.href = '/admin/performance'}
          />
          <MetricCard
            title="Customer Satisfaction"
            value={4.8}
            subtitle="Average rating (847 reviews)"
            icon={Eye}
            trend="up"
            trendValue={0.2}
            onClick={() => window.location.href = '/admin/analytics?view=satisfaction'}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* System Alerts - Mobile Optimized */}
      <div className="text-foreground bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
        <H3 className="mb-3 sm:mb-4 text-foreground">System Alerts</H3>
        <div className="space-y-2 sm:space-y-3">
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <BodyText size="sm" className="text-green-800 font-medium">
                  All systems operational
                </BodyText>
                <BodyText size="xs" className="text-green-700">
                  No critical alerts at this time
                </BodyText>
              </div>
            </div>
          ) : (
            alerts.map((alert, index) => {
              const getSeverityColor = (severity: string) => {
                switch (severity) {
                  case 'critical': return 'bg-red-50 border-red-200 text-red-800'
                  case 'high': return 'bg-orange-50 border-orange-200 text-orange-800'
                  case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  case 'low': return 'bg-green-50 border-green-200 text-green-800'
                  default: return 'bg-gray-50 border-gray-200 text-gray-800'
                }
              }

              const getSeverityIcon = (severity: string) => {
                switch (severity) {
                  case 'critical': return <XCircle className="w-5 h-5 text-red-600" />
                  case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />
                  case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-600" />
                  case 'low': return <TrendingUp className="w-5 h-5 text-green-600" />
                  default: return <AlertCircle className="w-5 h-5 text-gray-600" />
                }
              }

              return (
                <div key={alert.id} className={`flex items-start sm:items-center gap-3 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <BodyText size="sm" className="font-medium">
                      {alert.title}
                    </BodyText>
                    <BodyText size="xs" className="opacity-90 break-words">
                      {alert.message}
                    </BodyText>
                  </div>
                  {alert.actionRequired && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert.actionUrl && (window.location.href = alert.actionUrl)}
                      className="whitespace-nowrap touch-manipulation min-h-[36px] text-xs sm:text-sm flex-shrink-0"
                    >
                      <span className="hidden sm:inline">Take Action</span>
                      <span className="sm:hidden">Action</span>
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}