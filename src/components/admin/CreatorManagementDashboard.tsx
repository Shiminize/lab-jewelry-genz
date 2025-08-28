'use client'

import React, { useState, useEffect } from 'react'
import { 
  User, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Download,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react'

interface Creator {
  _id: string
  creatorCode: string
  displayName: string
  email: string
  status: 'pending' | 'approved' | 'suspended' | 'inactive'
  commissionRate: number
  metrics: {
    totalClicks: number
    totalSales: number
    totalCommission: number
    conversionRate: number
  }
  stats: {
    totalLinks: number
    totalClicks: number
    totalConversions: number
    pendingCommissions: number
    approvedCommissions: number
    paidCommissions: number
    totalCommissions: number
    totalPayouts: number
    lastPayoutDate?: string
  }
  createdAt: string
  approvedAt?: string
}

interface CreatorManagementDashboardProps {
  onCreatorSelect: (creatorId: string) => void
}

export default function CreatorManagementDashboard({ onCreatorSelect }: CreatorManagementDashboardProps) {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCreators, setSelectedCreators] = useState<string[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    tier: 'all',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const fetchCreators = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.tier !== 'all') params.append('tier', filters.tier)

      const response = await fetch(`/api/admin/creators?${params}`)
      const data = await response.json()

      if (data.success) {
        setCreators(data.data.creators)
        setMetrics(data.data.metrics)
        setPagination(data.data.pagination)
      } else {
        console.error('Failed to fetch creators:', data.error)
      }
    } catch (error) {
      console.error('Error fetching creators:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCreators()
  }, [filters])

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleCreatorSelect = (creatorId: string) => {
    setSelectedCreators(prev => 
      prev.includes(creatorId) 
        ? prev.filter(id => id !== creatorId)
        : [...prev, creatorId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCreators.length === creators.length) {
      setSelectedCreators([])
    } else {
      setSelectedCreators(creators.map(c => c._id))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedCreators.length === 0) return

    setBulkActionLoading(true)
    try {
      let updates: any = {}
      
      if (action === 'approve') {
        updates = { notes: 'Bulk approved by admin' }
      } else if (action === 'suspend') {
        updates = { reason: 'Bulk suspended by admin' }
      }

      const response = await fetch('/api/admin/creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          creatorIds: selectedCreators,
          updates
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchCreators()
        setSelectedCreators([])
      } else {
        console.error('Bulk action failed:', data.error)
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          creatorIds: selectedCreators.length > 0 ? selectedCreators : creators.map(c => c._id)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Convert to CSV and download
        const csvContent = convertToCSV(data.data.exportData)
        downloadCSV(csvContent, data.data.filename)
      }
    } catch (error) {
      console.error('Error exporting creators:', error)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(','))
    return [headers, ...rows].join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'suspended': return <XCircle className="h-4 w-4 text-red-500" />
      case 'inactive': return <AlertTriangle className="h-4 w-4 text-aurora-nav-muted" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200'
      case 'inactive': return 'bg-muted text-foreground border-border'
      default: return 'bg-muted text-foreground border-border'
    }
  }

  const getTierBadge = (stats: any) => {
    const monthlyRevenue = stats.totalCommissions || 0
    let tier = 'Bronze'
    let color = 'bg-orange-100 text-orange-800'
    
    if (monthlyRevenue >= 1000) {
      tier = 'Silver'
      color = 'bg-muted text-foreground'
    }
    if (monthlyRevenue >= 5000) {
      tier = 'Gold'
      color = 'bg-yellow-100 text-yellow-800'
    }
    if (monthlyRevenue >= 10000) {
      tier = 'Platinum'
      color = 'bg-purple-100 text-purple-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {tier}
      </span>
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-testid="metrics-overview">
          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-aurora-nav-muted">Total Creators</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalCreators}</p>
              </div>
              <Users className="h-8 w-8 text-coral-gold" />
            </div>
          </div>

          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-aurora-nav-muted">Pending Applications</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.pendingApplications}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-aurora-nav-muted">Active Creators</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeCreators}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-aurora-nav-muted">Approval Rate</p>
                <p className="text-2xl font-bold text-coral-gold">
                  {metrics.totalCreators > 0 
                    ? Math.round((metrics.activeCreators / metrics.totalCreators) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-coral-gold" />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-background p-6 rounded-lg shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-aurora-nav-muted" />
            <input
              type="text"
              placeholder="Search creators by name, email, or code..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-coral-gold focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          {/* Refresh */}
          <button
            onClick={fetchCreators}
            className="px-4 py-2 text-sm font-medium text-white bg-coral-gold rounded-lg hover:bg-coral-gold/90 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="filters-panel">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-coral-gold focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Performance Tier</label>
              <select
                value={filters.tier}
                onChange={(e) => handleFilterChange('tier', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-coral-gold focus:border-transparent"
              >
                <option value="all">All Tiers</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Items per page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-coral-gold focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCreators.length > 0 && (
        <div className="bg-coral-gold/10 border border-coral-gold/20 rounded-lg p-4" data-testid="bulk-actions-bar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-coral-gold">
                {selectedCreators.length} creators selected
              </span>
              <button
                onClick={() => setSelectedCreators([])}
                className="text-sm text-aurora-nav-muted hover:text-foreground"
              >
                Clear Selection
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                disabled={bulkActionLoading}
                className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                disabled={bulkActionLoading}
                className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
              >
                Suspend
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-foreground bg-muted rounded hover:bg-muted transition-colors"
              >
                <Download className="h-3 w-3" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creators Table */}
      <div className="bg-background rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y border-border" data-testid="creators-table">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCreators.length === creators.length && creators.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border text-coral-gold focus:ring-coral-gold"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-aurora-nav-muted uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-aurora-nav-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-aurora-nav-muted uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-aurora-nav-muted uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-aurora-nav-muted uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-aurora-nav-muted uppercase tracking-wider">
                  Commission Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-aurora-nav-muted uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-aurora-nav-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y border-border">
              {creators.map((creator) => (
                <tr key={creator._id} className="hover:bg-muted">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCreators.includes(creator._id)}
                      onChange={() => handleCreatorSelect(creator._id)}
                      className="rounded border-border text-coral-gold focus:ring-coral-gold"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-coral-gold/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-coral-gold" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {creator.displayName}
                        </div>
                        <div className="text-sm text-aurora-nav-muted">
                          {creator.email}
                        </div>
                        <div className="text-xs text-aurora-nav-muted">
                          Code: {creator.creatorCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(creator.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(creator.status)}`}>
                        {creator.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTierBadge(creator.stats)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                      <div>Clicks: {creator.stats.totalClicks.toLocaleString()}</div>
                      <div>Conversions: {creator.stats.totalConversions}</div>
                      <div>Rate: {((creator.stats.totalConversions / Math.max(creator.stats.totalClicks, 1)) * 100).toFixed(1)}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                      <div>Total: {formatCurrency(creator.stats.totalCommissions)}</div>
                      <div className="text-green-600">Paid: {formatCurrency(creator.stats.paidCommissions)}</div>
                      <div className="text-yellow-600">Pending: {formatCurrency(creator.stats.pendingCommissions)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">
                      {creator.commissionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-aurora-nav-muted">
                    {formatDate(creator.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCreatorSelect(creator._id)}
                        className="p-1 text-aurora-nav-muted hover:text-coral-gold transition-colors"
                        aria-label="View creator details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-aurora-nav-muted hover:text-aurora-nav-muted transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-background px-4 py-3 border-t border-border sm:px-6" data-testid="pagination">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-foreground">
                    Showing page{' '}
                    <span className="font-medium">{pagination.page}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span>{' '}
                    ({pagination.total} total creators)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-background text-sm font-medium text-aurora-nav-muted hover:bg-muted disabled:opacity-50"
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-background text-sm font-medium text-aurora-nav-muted hover:bg-muted disabled:opacity-50"
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {creators.length === 0 && !loading && (
        <div className="text-center py-12 bg-background rounded-lg border border-border">
          <Users className="mx-auto h-12 w-12 text-aurora-nav-muted" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No creators found</h3>
          <p className="mt-1 text-sm text-aurora-nav-muted">
            {filters.search || filters.status !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No creators have applied yet.'
            }
          </p>
        </div>
      )}
    </div>
  )
}