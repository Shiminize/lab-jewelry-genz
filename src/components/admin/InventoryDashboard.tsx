'use client'

import React, { useState, useEffect } from 'react'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  RefreshCw,
  Filter,
  Search,
  Download,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

interface InventoryItem {
  _id: string
  name: string
  type: string
  category: string
  basePrice: number
  status: string
  inventory: Array<{
    sku: string
    quantity: number
    reserved: number
    cost: number
    lowStockThreshold: number
    reorderPoint: number
    supplier?: string
  }>
  totalInventory: number
  availableInventory: number
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock'
  analytics: {
    views: number
    purchases: number
  }
}

interface InventoryAlert {
  type: 'low-stock' | 'out-of-stock' | 'reorder-point'
  severity: 'low' | 'medium' | 'high' | 'critical'
  productId: string
  productName: string
  category: string
  message: string
  data: any
}

interface InventoryDashboardProps {
  className?: string
}

export default function InventoryDashboard({ className = '' }: InventoryDashboardProps) {
  const [products, setProducts] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [summary, setSummary] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'alerts' | 'analytics'>('overview')
  const [filters, setFilters] = useState({
    status: 'all',
    category: '',
    supplier: '',
    search: ''
  })
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showRestockModal, setShowRestockModal] = useState(false)

  // Fetch inventory data
  const fetchInventoryData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.category) params.append('category', filters.category)
      if (filters.supplier) params.append('supplier', filters.supplier)
      
      const [inventoryRes, alertsRes] = await Promise.all([
        fetch(`/api/admin/inventory?${params.toString()}`),
        fetch('/api/admin/inventory/alerts')
      ])
      
      const inventoryData = await inventoryRes.json()
      const alertsData = await alertsRes.json()
      
      if (inventoryData.success) {
        setProducts(inventoryData.data.products)
        setSummary(inventoryData.data.summary)
      }
      
      if (alertsData.success) {
        setAlerts(alertsData.data.alerts)
      }
    } catch (error) {
      console.error('Failed to fetch inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryData()
  }, [filters])

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    if (!filters.search) return true
    return product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
           product.category.toLowerCase().includes(filters.search.toLowerCase()) ||
           product.inventory.some(inv => inv.sku.toLowerCase().includes(filters.search.toLowerCase()))
  })

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'low-stock': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'out-of-stock': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-accent bg-accent/10 border-accent/20'
      default: return 'text-gray-600 bg-muted border-border'
    }
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <H1 className="text-foreground">Inventory Management</H1>
          <BodyText className="text-gray-600 bg-background">Monitor stock levels, alerts, and inventory analytics</BodyText>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowRestockModal(true)}
          >
            <Plus className="w-4 h-4" />
            Restock Items
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={fetchInventoryData}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-foreground bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="sm" className="text-gray-600 bg-white font-medium">Total Products</BodyText>
              <H3 className="text-foreground">{summary.totalProducts || 0}</H3>
            </div>
            <Package className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="text-foreground bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="sm" className="text-gray-600 bg-white font-medium">Inventory Value</BodyText>
              <H3 className="text-foreground">
                ${summary.totalInventoryValue?.toLocaleString() || 0}
              </H3>
            </div>
            <DollarSign className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="text-foreground bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="sm" className="text-gray-600 bg-white font-medium">Low Stock Alerts</BodyText>
              <H3 className="text-foreground">{summary.lowStockProducts || 0}</H3>
            </div>
            <AlertTriangle className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="text-foreground bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="sm" className="text-gray-600 bg-white font-medium">Out of Stock</BodyText>
              <H3 className="text-foreground">{summary.outOfStockProducts || 0}</H3>
            </div>
            <XCircle className="w-8 h-8 text-accent" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'accent' : 'ghost'}
                size="md"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'border-b-2 rounded-none py-4',
                  activeTab === tab.id
                    ? 'border-accent'
                    : 'border-transparent hover:border-border'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'alerts' && alerts.length > 0 && (
                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs ml-2">
                    {alerts.length}
                  </span>
                )}
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Alerts */}
          <div className="text-foreground bg-white rounded-lg border">
            <div className="p-6 border-b border-border">
              <H3 className="text-foreground">Recent Alerts</H3>
            </div>
            <div className="p-6">
              {alerts.slice(0, 5).length === 0 ? (
                <BodyText className="text-gray-600 bg-white text-center py-8">No active alerts</BodyText>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <BodyText className="font-medium text-foreground">{alert.productName}</BodyText>
                          <BodyText size="sm" className="text-gray-600 bg-white opacity-90">{alert.message}</BodyText>
                          <BodyText size="xs" className="text-gray-600 bg-white opacity-75 mt-1">{alert.category}</BodyText>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getAlertSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  />
                </div>
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStockStatusIcon(product.stockStatus)}
                          <span className="text-sm text-gray-900 capitalize">
                            {product.stockStatus.replace('-', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.availableInventory} / {product.totalInventory}
                        </div>
                        <div className="text-sm text-gray-500">Available / Total</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.basePrice}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.analytics?.views || 0} views</div>
                        <div className="text-sm text-gray-500">{product.analytics?.purchases || 0} sales</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedProducts([product._id])
                            setShowRestockModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
            </div>
            <div className="p-6">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-500">No inventory alerts at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5" />
                            <h4 className="font-medium">{alert.productName}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getAlertSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                          <div className="text-xs opacity-75">
                            <span>Category: {alert.category}</span>
                            {alert.data?.sku && <span className="ml-4">SKU: {alert.data.sku}</span>}
                            {alert.data?.available !== undefined && (
                              <span className="ml-4">Available: {alert.data.available}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProducts([alert.productId])
                            setShowRestockModal(true)
                          }}
                          className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Analytics</h3>
            <p className="text-gray-500">Advanced analytics coming soon...</p>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Restock Products</h3>
            <p className="text-gray-600 mb-4">Restock functionality will be implemented in the next phase.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRestockModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRestockModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}