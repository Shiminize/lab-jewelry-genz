'use client'

import React, { useState, useEffect } from 'react'
import { 
  Send, 
  Edit3, 
  Trash2, 
  Eye, 
  Play, 
  Pause, 
  Copy,
  Filter,
  Search,
  Plus,
  Calendar,
  Users,
  Mail,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  MoreVertical,
  Download,
  Target,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Campaign interface matching API structure
interface Campaign {
  _id: string
  name: string
  type: 'newsletter' | 'promotional' | 'abandoned-cart' | 'welcome-series' | 'product-launch' | 'seasonal'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  subject: string
  template: string
  segments: string[]
  content: {
    html: string
    text: string
    preheader?: string
  }
  analytics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    openRate: number
    clickRate: number
    revenue: number
  }
  createdAt: string
  updatedAt: string
  sentAt?: string
  creatorName?: string
}

interface CampaignSummary {
  totalCampaigns: number
  activeCampaigns: number
  draftCampaigns: number
  completedCampaigns: number
  totalSent: number
  totalOpened: number
  totalClicked: number
  totalRevenue: number
  avgOpenRate: number
  avgClickRate: number
}

interface CampaignsData {
  campaigns: Campaign[]
  summary: CampaignSummary
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Status badge component using approved color system
const StatusBadge = ({ status }: { status: Campaign['status'] }) => {
  const getStatusConfig = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return { 
          text: 'Active', 
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: Play
        }
      case 'draft':
        return { 
          text: 'Draft', 
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Edit3
        }
      case 'scheduled':
        return { 
          text: 'Scheduled', 
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock
        }
      case 'paused':
        return { 
          text: 'Paused', 
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Pause
        }
      case 'completed':
        return { 
          text: 'Completed', 
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        }
      case 'cancelled':
        return { 
          text: 'Cancelled', 
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle
        }
      default:
        return { 
          text: status, 
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border',
      config.className
    )}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  )
}

// Campaign type badge
const TypeBadge = ({ type }: { type: Campaign['type'] }) => {
  const getTypeConfig = (type: Campaign['type']) => {
    switch (type) {
      case 'newsletter':
        return { text: 'Newsletter', className: 'bg-blue-50 text-blue-700' }
      case 'promotional':
        return { text: 'Promotional', className: 'bg-purple-50 text-purple-700' }
      case 'abandoned-cart':
        return { text: 'Abandoned Cart', className: 'bg-orange-50 text-orange-700' }
      case 'welcome-series':
        return { text: 'Welcome Series', className: 'bg-green-50 text-green-700' }
      case 'product-launch':
        return { text: 'Product Launch', className: 'bg-red-50 text-red-700' }
      case 'seasonal':
        return { text: 'Seasonal', className: 'bg-indigo-50 text-indigo-700' }
      default:
        return { text: type, className: 'bg-gray-50 text-gray-700' }
    }
  }

  const config = getTypeConfig(type)

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 text-xs font-medium rounded border',
      config.className
    )}>
      {config.text}
    </span>
  )
}

// Performance metrics card
const MetricsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  format = 'number'
}: {
  title: string
  value: number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  format?: 'number' | 'currency' | 'percentage'
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

  return (
    <div className="text-foreground bg-white p-4 rounded-lg border space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium",
            trend === 'up' && "text-green-600",
            trend === 'down' && "text-red-600",
            trend === 'neutral' && "text-gray-600"
          )}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {formatValue(value, format)}
        </div>
        <BodyText size="sm" className="text-gray-600 bg-white">
          {title}
        </BodyText>
        {subtitle && (
          <BodyText size="xs" className="text-gray-600 bg-white">
            {subtitle}
          </BodyText>
        )}
      </div>
    </div>
  )
}

// Campaign list filters
const CampaignFilters = ({ 
  filters, 
  onFiltersChange,
  onSearch 
}: {
  filters: { status?: string; type?: string; search?: string }
  onFiltersChange: (filters: any) => void
  onSearch: (search: string) => void
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'abandoned-cart', label: 'Abandoned Cart' },
    { value: 'welcome-series', label: 'Welcome Series' },
    { value: 'product-launch', label: 'Product Launch' },
    { value: 'seasonal', label: 'Seasonal' }
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  return (
    <div className="text-foreground bg-white p-4 rounded-lg border space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 font-body text-foreground bg-white border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
            />
          </div>
        </form>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          className="px-3 py-2 font-body text-foreground bg-white border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={filters.type || ''}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
          className="px-3 py-2 font-body text-foreground bg-white border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          {typeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// Campaign actions dropdown
const CampaignActions = ({ 
  campaign, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onSend, 
  onPause, 
  onView 
}: {
  campaign: Campaign
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onSend: (id: string) => void
  onPause: (id: string) => void
  onView: (id: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const canSend = campaign.status === 'draft' || campaign.status === 'paused'
  const canPause = campaign.status === 'active'
  const canEdit = campaign.status !== 'completed'

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 p-0"
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-border rounded-lg shadow-lg py-1">
            <button
              onClick={() => { onView(campaign._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>

            {canEdit && (
              <button
                onClick={() => { onEdit(campaign._id); setIsOpen(false) }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Campaign
              </button>
            )}

            <button
              onClick={() => { onDuplicate(campaign._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>

            {canSend && (
              <button
                onClick={() => { onSend(campaign._id); setIsOpen(false) }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Campaign
              </button>
            )}

            {canPause && (
              <button
                onClick={() => { onPause(campaign._id); setIsOpen(false) }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pause Campaign
              </button>
            )}

            <div className="border-t border-border my-1" />

            <button
              onClick={() => { onDelete(campaign._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Campaign table row component
const CampaignRow = ({ 
  campaign, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onSend, 
  onPause, 
  onView 
}: {
  campaign: Campaign
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onSend: (id: string) => void
  onPause: (id: string) => void
  onView: (id: string) => void
}) => {
  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="px-4 py-4">
        <div className="space-y-1">
          <BodyText className="font-medium text-foreground">
            {campaign.name}
          </BodyText>
          <BodyText size="sm" className="text-gray-600 bg-white">
            {campaign.subject}
          </BodyText>
          <div className="flex items-center gap-2">
            <StatusBadge status={campaign.status} />
            <TypeBadge type={campaign.type} />
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-foreground">
            {campaign.analytics.sent.toLocaleString()}
          </div>
          <BodyText size="xs" className="text-gray-600 bg-white">
            Sent
          </BodyText>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-foreground">
            {campaign.analytics.openRate.toFixed(1)}%
          </div>
          <BodyText size="xs" className="text-gray-600 bg-white">
            Open Rate
          </BodyText>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-foreground">
            {campaign.analytics.clickRate.toFixed(1)}%
          </div>
          <BodyText size="xs" className="text-gray-600 bg-white">
            Click Rate
          </BodyText>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-foreground">
            ${campaign.analytics.revenue.toLocaleString()}
          </div>
          <BodyText size="xs" className="text-gray-600 bg-white">
            Revenue
          </BodyText>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="space-y-1">
          <BodyText size="sm" className="text-gray-600 bg-white">
            {campaign.creatorName || 'Unknown'}
          </BodyText>
          <BodyText size="xs" className="text-gray-600 bg-white">
            {new Date(campaign.createdAt).toLocaleDateString()}
          </BodyText>
        </div>
      </td>

      <td className="px-4 py-4">
        <CampaignActions
          campaign={campaign}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onSend={onSend}
          onPause={onPause}
          onView={onView}
        />
      </td>
    </tr>
  )
}

// Mobile campaign card
const CampaignCard = ({ 
  campaign, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onSend, 
  onPause, 
  onView 
}: {
  campaign: Campaign
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onSend: (id: string) => void
  onPause: (id: string) => void
  onView: (id: string) => void
}) => {
  return (
    <div className="text-foreground bg-white p-4 rounded-lg border space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <H3 className="text-foreground">{campaign.name}</H3>
          <BodyText size="sm" className="text-gray-600 bg-white">
            {campaign.subject}
          </BodyText>
          <div className="flex items-center gap-2">
            <StatusBadge status={campaign.status} />
            <TypeBadge type={campaign.type} />
          </div>
        </div>
        <CampaignActions
          campaign={campaign}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onSend={onSend}
          onPause={onPause}
          onView={onView}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-lg font-medium text-foreground">
            {campaign.analytics.sent.toLocaleString()}
          </div>
          <BodyText size="xs" className="text-gray-600 bg-muted">
            Sent
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-lg font-medium text-foreground">
            {campaign.analytics.openRate.toFixed(1)}%
          </div>
          <BodyText size="xs" className="text-gray-600 bg-muted">
            Open Rate
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-lg font-medium text-foreground">
            {campaign.analytics.clickRate.toFixed(1)}%
          </div>
          <BodyText size="xs" className="text-gray-600 bg-muted">
            Click Rate
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-lg font-medium text-foreground">
            ${campaign.analytics.revenue.toLocaleString()}
          </div>
          <BodyText size="xs" className="text-gray-600 bg-muted">
            Revenue
          </BodyText>
        </div>
      </div>

      {/* Meta */}
      <div className="flex justify-between items-center pt-2 border-t border-border">
        <BodyText size="sm" className="text-gray-600 bg-white">
          {campaign.creatorName || 'Unknown'}
        </BodyText>
        <BodyText size="sm" className="text-gray-600 bg-white">
          {new Date(campaign.createdAt).toLocaleDateString()}
        </BodyText>
      </div>
    </div>
  )
}

// Pagination component
const Pagination = ({ 
  pagination, 
  onPageChange 
}: {
  pagination: CampaignsData['pagination']
  onPageChange: (page: number) => void
}) => {
  if (pagination.totalPages <= 1) return null

  const pages = []
  const maxPages = 5
  let startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2))
  let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1)
  
  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between">
      <BodyText size="sm" className="text-gray-600 bg-background">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
        {pagination.total} campaigns
      </BodyText>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPrevPage}
        >
          Previous
        </Button>

        {pages.map(page => (
          <Button
            key={page}
            variant={page === pagination.page ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-8 h-8 p-0"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// Main Campaign Management Component
interface CampaignManagementProps {
  onCreateCampaign?: () => void
  onEditCampaign?: (id: string) => void
  onViewCampaign?: (id: string) => void
  onSendCampaign?: (id: string) => void
}

export default function CampaignManagement({
  onCreateCampaign,
  onEditCampaign,
  onViewCampaign,
  onSendCampaign
}: CampaignManagementProps = {}) {
  const [data, setData] = useState<CampaignsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{ status?: string; type?: string; search?: string }>({})
  const [page, setPage] = useState(1)

  // Fetch campaigns data
  const fetchCampaigns = async (currentPage = page, currentFilters = filters) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })

      if (currentFilters.status) params.append('status', currentFilters.status)
      if (currentFilters.type) params.append('type', currentFilters.type)
      if (currentFilters.search) params.append('search', currentFilters.search)

      const response = await fetch(`/api/admin/email-marketing/campaigns?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch campaigns')
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setPage(1)
    fetchCampaigns(1, newFilters)
  }

  // Handle search
  const handleSearch = (search: string) => {
    const newFilters = { ...filters, search }
    setFilters(newFilters)
    setPage(1)
    fetchCampaigns(1, newFilters)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchCampaigns(newPage, filters)
  }

  // Campaign actions
  const handleEdit = (id: string) => {
    if (onEditCampaign) {
      onEditCampaign(id)
    } else {
      console.log('Edit campaign:', id)
    }
  }

  const handleDuplicate = async (id: string) => {
    console.log('Duplicate campaign:', id)
    // TODO: Implement duplication
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    
    try {
      const response = await fetch(`/api/admin/email-marketing/campaigns/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      // Refresh data
      fetchCampaigns()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete campaign')
    }
  }

  const handleSend = (id: string) => {
    if (onSendCampaign) {
      onSendCampaign(id)
    } else {
      console.log('Send campaign:', id)
    }
  }

  const handlePause = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/email-marketing/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' })
      })

      if (!response.ok) {
        throw new Error('Failed to pause campaign')
      }

      // Refresh data
      fetchCampaigns()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to pause campaign')
    }
  }

  const handleView = (id: string) => {
    if (onViewCampaign) {
      onViewCampaign(id)
    } else {
      console.log('View campaign:', id)
    }
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="space-y-6">
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

  // Error state
  if (error) {
    return (
      <div className="text-foreground bg-white p-6 rounded-lg border text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <H2 className="mb-2 text-foreground">Failed to Load Campaigns</H2>
        <BodyText className="text-gray-600 bg-white mb-4">
          {error}
        </BodyText>
        <Button variant="primary" size="md" onClick={() => fetchCampaigns()}>
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Campaigns"
          value={data.summary.totalCampaigns}
          subtitle={`${data.summary.activeCampaigns} active`}
          icon={Send}
          trend="up"
        />
        <MetricsCard
          title="Emails Sent"
          value={data.summary.totalSent}
          subtitle="Total delivered"
          icon={Mail}
          trend="up"
        />
        <MetricsCard
          title="Avg Open Rate"
          value={data.summary.avgOpenRate}
          subtitle="Across all campaigns"
          icon={TrendingUp}
          format="percentage"
          trend="up"
        />
        <MetricsCard
          title="Total Revenue"
          value={data.summary.totalRevenue}
          subtitle="From email campaigns"
          icon={DollarSign}
          format="currency"
          trend="up"
        />
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <H2 className="text-foreground">Email Campaigns</H2>
          <BodyText className="text-gray-600 bg-background">
            Manage and monitor your email marketing campaigns
          </BodyText>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={() => fetchCampaigns()}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={onCreateCampaign}>
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Filters */}
      <CampaignFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* Campaigns List */}
      {data.campaigns.length === 0 ? (
        <div className="text-foreground bg-white p-8 rounded-lg border text-center">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <H2 className="mb-2 text-foreground">No Campaigns Found</H2>
          <BodyText className="text-gray-600 bg-white mb-6">
            {filters.search || filters.status || filters.type
              ? 'No campaigns match your current filters.'
              : 'Get started by creating your first email campaign.'
            }
          </BodyText>
          <Button variant="primary" size="md" onClick={onCreateCampaign}>
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block text-foreground bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Campaign
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">
                      Sent
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">
                      Open Rate
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">
                      Click Rate
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Created
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map(campaign => (
                    <CampaignRow
                      key={campaign._id}
                      campaign={campaign}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                      onSend={handleSend}
                      onPause={handlePause}
                      onView={handleView}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {data.campaigns.map(campaign => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onSend={handleSend}
                onPause={handlePause}
                onView={handleView}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}