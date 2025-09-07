/**
 * Inventory Dashboard Component
 * Real-time inventory monitoring and management interface
 */

'use client'

import React, { useState } from 'react'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  Clock,
  BarChart3,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { InventoryAlerts } from './InventoryAlerts'
import { InventoryStatus } from './InventoryStatus'
import { 
  useInventoryMonitor, 
  useInventoryStats, 
  useInventoryAlerts 
} from '@/hooks/useRealTimeInventory'
import { InventoryUpdate } from '@/lib/realtime-inventory'

interface InventoryDashboardProps {
  className?: string
}

export function InventoryDashboard({ className }: InventoryDashboardProps) {
  const {
    allInventory,
    connectionStatus,
    isLoading,
    inStockProducts,
    lowStockProducts,
    outOfStockProducts,
    getInventoryByStatus
  } = useInventoryMonitor()

  const { stats, isHealthy, needsAttention } = useInventoryStats()
  const { alerts } = useInventoryAlerts()

  const [selectedView, setSelectedView] = useState<'overview' | 'products' | 'alerts'>('overview')
  const [statusFilter, setStatusFilter] = useState<InventoryUpdate['status'] | 'all'>('all')

  // Filter products based on status
  const filteredProducts = React.useMemo(() => {
    if (statusFilter === 'all') return allInventory
    return getInventoryByStatus(statusFilter)
  }, [allInventory, statusFilter, getInventoryByStatus])

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse space-y-token-md">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-token-lg" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-token-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <H2>Inventory Dashboard</H2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                connectionStatus.connected ? 'bg-success' : 'bg-destructive'
              )} />
              <MutedText size="sm">
                {connectionStatus.connected ? 'Connected' : 'Disconnected'}
              </MutedText>
            </div>
            <MutedText size="sm">
              {connectionStatus.subscribers} active monitors
            </MutedText>
            <MutedText size="sm">
              Last updated: {new Date().toLocaleTimeString()}
            </MutedText>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Products"
          value={stats.total}
          icon={Package}
          trend={{ value: 0, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="In Stock"
          value={stats.inStock}
          icon={TrendingUp}
          trend={{ value: stats.stockHealthPercentage, isPositive: isHealthy }}
          color="green"
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStock}
          icon={AlertTriangle}
          trend={{ value: stats.lowStock, isPositive: false }}
          color="yellow"
        />
        <StatsCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={TrendingDown}
          trend={{ value: stats.outOfStock, isPositive: false }}
          color="red"
        />
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryHealthOverview stats={stats} isHealthy={isHealthy} />
        </div>
        <div>
          <QuickStats stats={stats} alerts={alerts} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'products', label: 'Products' },
          { key: 'alerts', label: 'Alerts', count: alerts.length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setSelectedView(key as any)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              selectedView === key
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-accent text-background rounded-full">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {selectedView === 'overview' && (
          <OverviewTab 
            inventory={allInventory} 
            stats={stats}
            inStockProducts={inStockProducts}
            lowStockProducts={lowStockProducts}
            outOfStockProducts={outOfStockProducts}
          />
        )}

        {selectedView === 'products' && (
          <ProductsTab
            inventory={filteredProducts}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        )}

        {selectedView === 'alerts' && (
          <div className="max-w-4xl">
            <InventoryAlerts variant="panel" />
          </div>
        )}
      </div>
    </div>
  )
}

// Stats Card Component
interface StatsCardProps {
  title: string
  value: number
  icon: React.ElementType
  trend: { value: number; isPositive: boolean }
  color: 'blue' | 'green' | 'yellow' | 'red'
}

function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  }

  return (
    <div className="p-4 border border-border rounded-token-lg bg-background">
      <div className="flex items-center justify-between">
        <div>
          <MutedText size="sm" className="mb-1">{title}</MutedText>
          <BodyText size="xl" weight="bold">{value}</BodyText>
        </div>
        <div className={cn('p-2 rounded-token-lg', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend.value > 0 && (
        <div className="flex items-center gap-1 mt-2">
          {trend.isPositive ? (
            <TrendingUp className="w-3 h-3 text-success" />
          ) : (
            <TrendingDown className="w-3 h-3 text-destructive" />
          )}
          <MutedText size="xs">
            {trend.value}{color === 'green' ? '%' : ''} {trend.isPositive ? 'healthy' : 'need attention'}
          </MutedText>
        </div>
      )}
    </div>
  )
}

// Inventory Health Overview
function InventoryHealthOverview({ stats, isHealthy }: { stats: any; isHealthy: boolean }) {
  return (
    <div className="p-6 border border-border rounded-token-lg bg-background">
      <div className="flex items-center justify-between mb-4">
        <H3>Inventory Health</H3>
        <div className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          isHealthy ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
        )}>
          {isHealthy ? 'Healthy' : 'Needs Attention'}
        </div>
      </div>

      <div className="space-y-token-md">
        <div className="flex items-center justify-between">
          <BodyText>Overall Health Score</BodyText>
          <BodyText weight="semibold">{stats.stockHealthPercentage}%</BodyText>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              stats.stockHealthPercentage >= 80 ? 'bg-success' :
              stats.stockHealthPercentage >= 60 ? 'bg-warning' : 'bg-destructive'
            )}
            style={{ width: `${stats.stockHealthPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <BodyText weight="semibold" className="text-success">{stats.inStock}</BodyText>
            <MutedText size="sm">In Stock</MutedText>
          </div>
          <div className="text-center">
            <BodyText weight="semibold" className="text-warning">{stats.lowStock}</BodyText>
            <MutedText size="sm">Low Stock</MutedText>
          </div>
          <div className="text-center">
            <BodyText weight="semibold" className="text-destructive">{stats.outOfStock}</BodyText>
            <MutedText size="sm">Out of Stock</MutedText>
          </div>
        </div>
      </div>
    </div>
  )
}

// Quick Stats
function QuickStats({ stats, alerts }: { stats: any; alerts: any[] }) {
  return (
    <div className="space-y-token-md">
      <div className="p-4 border border-border rounded-token-lg bg-background">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-accent" />
          <BodyText weight="medium">Quick Stats</BodyText>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <MutedText size="sm">Total Quantity</MutedText>
            <BodyText size="sm">{stats.totalQuantity}</BodyText>
          </div>
          <div className="flex justify-between">
            <MutedText size="sm">Available</MutedText>
            <BodyText size="sm">{stats.totalAvailable}</BodyText>
          </div>
          <div className="flex justify-between">
            <MutedText size="sm">Reserved</MutedText>
            <BodyText size="sm">{stats.totalReserved}</BodyText>
          </div>
          <div className="flex justify-between">
            <MutedText size="sm">Average Stock</MutedText>
            <BodyText size="sm">{stats.averageStock}</BodyText>
          </div>
        </div>
      </div>

      <div className="p-4 border border-border rounded-token-lg bg-background">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <BodyText weight="medium">Active Alerts</BodyText>
        </div>
        <div className="space-y-token-sm">
          <div className="flex justify-between">
            <MutedText size="sm">Critical</MutedText>
            <BodyText size="sm" className="text-destructive">
              {alerts.filter(a => a.severity === 'error').length}
            </BodyText>
          </div>
          <div className="flex justify-between">
            <MutedText size="sm">Warning</MutedText>
            <BodyText size="sm" className="text-warning">
              {alerts.filter(a => a.severity === 'warning').length}
            </BodyText>
          </div>
          <div className="flex justify-between">
            <MutedText size="sm">Info</MutedText>
            <BodyText size="sm" className="text-success">
              {alerts.filter(a => a.severity === 'success').length}
            </BodyText>
          </div>
        </div>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ 
  inventory, 
  stats, 
  inStockProducts, 
  lowStockProducts, 
  outOfStockProducts 
}: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InventoryStatusGrid title="In Stock Products" products={inStockProducts} />
        <InventoryStatusGrid title="Low Stock Products" products={lowStockProducts} />
        <InventoryStatusGrid title="Out of Stock Products" products={outOfStockProducts} />
      </div>
    </div>
  )
}

// Products Tab
function ProductsTab({ 
  inventory, 
  statusFilter, 
  onStatusFilterChange 
}: {
  inventory: InventoryUpdate[]
  statusFilter: InventoryUpdate['status'] | 'all'
  onStatusFilterChange: (status: InventoryUpdate['status'] | 'all') => void
}) {
  return (
    <div className="space-y-token-md">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <MutedText>Filter by status:</MutedText>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as any)}
          className="border border-border rounded px-3 py-1 text-sm"
        >
          <option value="all">All Products</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map(item => (
          <InventoryStatus
            key={item.productId}
            productId={item.productId}
            variant="detailed"
            showDetails
            showReservations
          />
        ))}
      </div>
    </div>
  )
}

// Inventory Status Grid
function InventoryStatusGrid({ 
  title, 
  products 
}: { 
  title: string
  products: InventoryUpdate[] 
}) {
  return (
    <div className="border border-border rounded-token-lg p-4">
      <BodyText weight="medium" className="mb-4">{title}</BodyText>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {products.length === 0 ? (
          <MutedText size="sm" className="text-center py-4">
            No products in this category
          </MutedText>
        ) : (
          products.slice(0, 5).map(item => (
            <div key={item.productId} className="flex items-center justify-between p-2 bg-muted/20 rounded">
              <div>
                <BodyText size="sm">{item.sku}</BodyText>
                <MutedText size="xs">{item.productId}</MutedText>
              </div>
              <BodyText size="sm" weight="medium">
                {item.available}
              </BodyText>
            </div>
          ))
        )}
        {products.length > 5 && (
          <MutedText size="xs" className="text-center">
            +{products.length - 5} more items
          </MutedText>
        )}
      </div>
    </div>
  )
}