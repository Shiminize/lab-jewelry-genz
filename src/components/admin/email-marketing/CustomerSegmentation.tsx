'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Target, 
  TrendingUp, 
  Edit, 
  Copy, 
  Trash2,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Settings,
  Download,
  BarChart3,
  Calendar,
  Mail,
  ShoppingCart,
  DollarSign,
  MapPin,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Interfaces for customer segments
interface CustomerSegment {
  _id: string
  name: string
  description: string
  type: 'demographic' | 'behavioral' | 'geographic' | 'psychographic' | 'purchase-based' | 'engagement'
  status: 'active' | 'inactive' | 'draft'
  customerCount: number
  conditions: SegmentCondition[]
  createdAt: string
  updatedAt: string
  lastUsed?: string
  campaignsUsed: number
  revenue?: number
  avgOrderValue?: number
  conversionRate?: number
}

interface SegmentCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in'
  value: string | number | string[]
  logic?: 'AND' | 'OR'
}

interface SegmentAnalytics {
  totalCustomers: number
  segments: number
  activeSegments: number
  avgSegmentSize: number
  topPerformingSegments: CustomerSegment[]
  segmentPerformance: {
    name: string
    revenue: number
    conversionRate: number
    customerCount: number
  }[]
}

// Segment type configuration
const segmentTypes = [
  { 
    id: 'demographic', 
    label: 'Demographic', 
    icon: Users,
    description: 'Age, gender, location, income level',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    id: 'behavioral', 
    label: 'Behavioral', 
    icon: Target,
    description: 'Purchase history, website activity, engagement',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    id: 'geographic', 
    label: 'Geographic', 
    icon: MapPin,
    description: 'Location, timezone, shipping preferences',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  { 
    id: 'psychographic', 
    label: 'Psychographic', 
    icon: TrendingUp,
    description: 'Interests, values, lifestyle preferences',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  { 
    id: 'purchase-based', 
    label: 'Purchase-Based', 
    icon: ShoppingCart,
    description: 'Order frequency, amount spent, product preferences',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  { 
    id: 'engagement', 
    label: 'Engagement', 
    icon: Mail,
    description: 'Email opens, clicks, subscription preferences',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  }
]

// Segment status badge component
const StatusBadge = ({ status }: { status: CustomerSegment['status'] }) => {
  const getStatusConfig = (status: CustomerSegment['status']) => {
    switch (status) {
      case 'active':
        return { 
          text: 'Active', 
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        }
      case 'inactive':
        return { 
          text: 'Inactive', 
          className: 'bg-muted text-foreground border-border',
          icon: AlertCircle
        }
      case 'draft':
        return { 
          text: 'Draft', 
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Edit
        }
      default:
        return { 
          text: status, 
          className: 'bg-muted text-foreground border-border',
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

// Segment type badge component
const TypeBadge = ({ type }: { type: CustomerSegment['type'] }) => {
  const typeConfig = segmentTypes.find(t => t.id === type)
  if (!typeConfig) return null

  const Icon = typeConfig.icon

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border',
      typeConfig.color
    )}>
      <Icon className="w-3 h-3" />
      {typeConfig.label}
    </span>
  )
}

// Analytics metric card
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  format = 'number'
}: {
  title: string
  value: number
  subtitle: string
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
    <div className="text-foreground bg-background p-4 rounded-token-lg border space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 bg-accent/10 rounded-token-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium",
            trend === 'up' && "text-green-600",
            trend === 'down' && "text-red-600",
            trend === 'neutral' && "text-aurora-nav-muted"
          )}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>
      <div>
        <div className="text-xl font-bold text-foreground">
          {formatValue(value, format)}
        </div>
        <BodyText size="sm" className="text-aurora-nav-muted bg-background mb-1">
          {title}
        </BodyText>
        <BodyText size="xs" className="text-aurora-nav-muted bg-background">
          {subtitle}
        </BodyText>
      </div>
    </div>
  )
}

// Segment filters component
const SegmentFilters = ({ 
  filters, 
  onFiltersChange,
  onSearch 
}: {
  filters: { status?: string; type?: string; search?: string }
  onFiltersChange: (filters: any) => void
  onSearch: (search: string) => void
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  return (
    <div className="text-foreground bg-background p-4 rounded-token-lg border space-y-token-md">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-aurora-nav-muted" />
            <input
              type="text"
              placeholder="Search segments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Search customer segments"
            />
          </div>
        </form>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>

        {/* Type Filter */}
        <select
          value={filters.type || ''}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
          className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Filter by segment type"
        >
          <option value="">All Types</option>
          {segmentTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// Segment actions dropdown
const SegmentActions = ({ 
  segment, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onView,
  onAnalytics 
}: {
  segment: CustomerSegment
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onAnalytics: (id: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 p-0"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-8 z-20 w-48 bg-background border border-border rounded-token-lg shadow-lg py-1">
            <button
              onClick={() => { onView(segment._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={() => { onAnalytics(segment._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </button>
            <button
              onClick={() => { onEdit(segment._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Segment
            </button>
            <button
              onClick={() => { onDuplicate(segment._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { onDelete(segment._id); setIsOpen(false) }}
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

// Segment card component
const SegmentCard = ({ 
  segment, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onView,
  onAnalytics 
}: {
  segment: CustomerSegment
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onAnalytics: (id: string) => void
}) => {
  return (
    <div className="text-foreground bg-background p-6 rounded-token-lg border hover:border-accent transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <H3 className="text-foreground">{segment.name}</H3>
            <StatusBadge status={segment.status} />
            <TypeBadge type={segment.type} />
          </div>
          <BodyText size="sm" className="text-aurora-nav-muted bg-background mb-2">
            {segment.description}
          </BodyText>
          <div className="flex items-center gap-4 text-xs text-aurora-nav-muted bg-background">
            <span>Created {new Date(segment.createdAt).toLocaleDateString()}</span>
            {segment.lastUsed && (
              <span>Last used {new Date(segment.lastUsed).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <SegmentActions
          segment={segment}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onView={onView}
          onAnalytics={onAnalytics}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            {segment.customerCount.toLocaleString()}
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Customers
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            {segment.campaignsUsed}
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Campaigns
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            {(segment.conversionRate || 0).toFixed(1)}%
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Conversion
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            ${(segment.revenue || 0).toLocaleString()}
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Revenue
          </BodyText>
        </div>
      </div>
    </div>
  )
}

// Main Customer Segmentation Component
export default function CustomerSegmentation({ 
  onCreateSegment,
  onEditSegment,
  onViewSegment 
}: {
  onCreateSegment?: () => void
  onEditSegment?: (id: string) => void
  onViewSegment?: (id: string) => void
}) {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [analytics, setAnalytics] = useState<SegmentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{ status?: string; type?: string; search?: string }>({})

  // Fetch segments and analytics
  const fetchSegments = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.type) params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)

      const [segmentsRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/email-marketing/segments?${params}`),
        fetch('/api/admin/email-marketing/segments/analytics')
      ])

      const segmentsData = await segmentsRes.json()
      const analyticsData = await analyticsRes.json()

      if (segmentsData.success) {
        setSegments(segmentsData.data.segments || [])
      }

      if (analyticsData.success) {
        setAnalytics(analyticsData.data)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load segments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSegments()
  }, [filters])

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  // Handle search
  const handleSearch = (search: string) => {
    setFilters({ ...filters, search })
  }

  // Segment actions
  const handleEdit = (id: string) => {
    if (onEditSegment) {
      onEditSegment(id)
    } else {

    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/email-marketing/segments/${id}/duplicate`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchSegments() // Refresh list
      }
    } catch (err) {
      console.error('Failed to duplicate segment:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return
    
    try {
      const response = await fetch(`/api/admin/email-marketing/segments/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSegments() // Refresh list
      }
    } catch (err) {
      console.error('Failed to delete segment:', err)
    }
  }

  const handleView = (id: string) => {
    if (onViewSegment) {
      onViewSegment(id)
    } else {

    }
  }

  const handleAnalytics = (id: string) => {

    // TODO: Navigate to segment analytics view
  }

  // Loading state
  if (loading && segments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-token-md">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-token-lg"></div>
            ))}
          </div>
          <div className="space-y-token-md">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-token-lg"></div>
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
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <H2 className="mb-2 text-foreground">Failed to Load Segments</H2>
        <BodyText className="text-aurora-nav-muted bg-background mb-4">
          {error}
        </BodyText>
        <Button variant="primary" size="md" onClick={fetchSegments}>
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Customers"
            value={analytics.totalCustomers}
            subtitle="In all segments"
            icon={Users}
            trend="up"
          />
          <MetricCard
            title="Active Segments"
            value={analytics.activeSegments}
            subtitle={`${analytics.segments} total segments`}
            icon={Target}
            trend="neutral"
          />
          <MetricCard
            title="Avg Segment Size"
            value={analytics.avgSegmentSize}
            subtitle="Customers per segment"
            icon={BarChart3}
            trend="up"
          />
          <MetricCard
            title="Performance"
            value={analytics.segmentPerformance[0]?.conversionRate || 0}
            subtitle="Top segment conversion"
            icon={TrendingUp}
            format="percentage"
            trend="up"
          />
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <H2 className="text-foreground">Customer Segments</H2>
          <BodyText className="text-aurora-nav-muted bg-background">
            Create and manage targeted customer segments for email campaigns
          </BodyText>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={fetchSegments}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={onCreateSegment}>
            <Plus className="w-4 h-4" />
            New Segment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <SegmentFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* Segments Grid */}
      {segments.length === 0 ? (
        <div className="text-foreground bg-background p-8 rounded-token-lg border text-center">
          <Target className="w-12 h-12 text-aurora-nav-muted mx-auto mb-4" />
          <H2 className="mb-2 text-foreground">No Segments Found</H2>
          <BodyText className="text-aurora-nav-muted bg-background mb-6">
            {filters.search || filters.status || filters.type
              ? 'No segments match your current filters.'
              : 'Get started by creating your first customer segment.'}
          </BodyText>
          <Button variant="primary" size="md" onClick={onCreateSegment}>
            <Plus className="w-4 h-4" />
            Create Segment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {segments.map(segment => (
            <SegmentCard
              key={segment._id}
              segment={segment}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onView={handleView}
              onAnalytics={handleAnalytics}
            />
          ))}
        </div>
      )}
    </div>
  )
}