'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Layout,
  Code,
  Image,
  Mail,
  Settings,
  Calendar,
  Star,
  Filter,
  Grid3X3,
  List,
  Palette,
  Type,
  MousePointer
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Interfaces for email templates
interface EmailTemplate {
  _id: string
  name: string
  description: string
  category: 'marketing' | 'transactional' | 'newsletter' | 'promotional' | 'welcome' | 'abandoned-cart' | 'seasonal'
  type: 'html' | 'text' | 'mjml' | 'drag-drop'
  status: 'active' | 'inactive' | 'draft'
  content: {
    html: string
    text: string
    mjml?: string
    metadata?: {
      subject?: string
      preheader?: string
      variables?: string[]
    }
  }
  thumbnail?: string
  isDefault: boolean
  usageCount: number
  lastUsed?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  tags: string[]
  performance: {
    campaigns: number
    avgOpenRate: number
    avgClickRate: number
    totalSent: number
  }
}

interface TemplateAnalytics {
  totalTemplates: number
  activeTemplates: number
  topPerformingTemplates: EmailTemplate[]
  categoriesBreakdown: {
    category: string
    count: number
    avgPerformance: number
  }[]
  recentActivity: {
    templateId: string
    templateName: string
    action: 'created' | 'used' | 'edited'
    timestamp: string
  }[]
}

// Template category configuration
const templateCategories = [
  { 
    id: 'marketing', 
    label: 'Marketing', 
    icon: Mail,
    description: 'Promotional campaigns and offers',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    id: 'transactional', 
    label: 'Transactional', 
    icon: FileText,
    description: 'Order confirmations, receipts',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    id: 'newsletter', 
    label: 'Newsletter', 
    icon: Layout,
    description: 'Regular content updates',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  { 
    id: 'promotional', 
    label: 'Promotional', 
    icon: Star,
    description: 'Sales and discount campaigns',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  { 
    id: 'welcome', 
    label: 'Welcome', 
    icon: CheckCircle,
    description: 'New subscriber onboarding',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    id: 'abandoned-cart', 
    label: 'Abandoned Cart', 
    icon: AlertCircle,
    description: 'Cart recovery campaigns',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  { 
    id: 'seasonal', 
    label: 'Seasonal', 
    icon: Calendar,
    description: 'Holiday and seasonal campaigns',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  }
]

// Template type configuration
const templateTypes = [
  { id: 'html', label: 'HTML', icon: Code, description: 'Custom HTML templates' },
  { id: 'text', label: 'Text', icon: Type, description: 'Plain text templates' },
  { id: 'mjml', label: 'MJML', icon: Layout, description: 'Responsive MJML templates' },
  { id: 'drag-drop', label: 'Visual Builder', icon: MousePointer, description: 'Drag & drop editor' }
]

// Template status badge component
const StatusBadge = ({ status }: { status: EmailTemplate['status'] }) => {
  const getStatusConfig = (status: EmailTemplate['status']) => {
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

// Template category badge component
const CategoryBadge = ({ category }: { category: EmailTemplate['category'] }) => {
  const categoryConfig = templateCategories.find(c => c.id === category)
  if (!categoryConfig) return null

  const Icon = categoryConfig.icon

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border',
      categoryConfig.color
    )}>
      <Icon className="w-3 h-3" />
      {categoryConfig.label}
    </span>
  )
}

// Template type badge component
const TypeBadge = ({ type }: { type: EmailTemplate['type'] }) => {
  const typeConfig = templateTypes.find(t => t.id === type)
  if (!typeConfig) return null

  const Icon = typeConfig.icon

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border bg-muted text-foreground border-border">
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

// Template filters component
const TemplateFilters = ({ 
  filters, 
  onFiltersChange,
  onSearch 
}: {
  filters: { status?: string; category?: string; type?: string; search?: string }
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
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Search email templates"
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

        {/* Category Filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
          className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {templateCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={filters.type || ''}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
          className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Filter by template type"
        >
          <option value="">All Types</option>
          {templateTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// Template actions dropdown
const TemplateActions = ({ 
  template, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onView,
  onExport,
  onToggleStatus 
}: {
  template: EmailTemplate
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onExport: (id: string) => void
  onToggleStatus: (id: string) => void
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
              onClick={() => { onView(template._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Template
            </button>
            <button
              onClick={() => { onEdit(template._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Template
            </button>
            <button
              onClick={() => { onDuplicate(template._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={() => { onExport(template._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Template
            </button>
            <button
              onClick={() => { onToggleStatus(template._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {template.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { onDelete(template._id); setIsOpen(false) }}
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

// Template card component
const TemplateCard = ({ 
  template, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onView,
  onExport,
  onToggleStatus 
}: {
  template: EmailTemplate
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onExport: (id: string) => void
  onToggleStatus: (id: string) => void
}) => {
  return (
    <div className="text-foreground bg-background p-6 rounded-token-lg border hover:border-accent transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <H3 className="text-foreground">{template.name}</H3>
            <StatusBadge status={template.status} />
            {template.isDefault && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border bg-accent/10 text-accent border-accent">
                <Star className="w-3 h-3" />
                Default
              </span>
            )}
          </div>
          <BodyText size="sm" className="text-aurora-nav-muted bg-background mb-2">
            {template.description}
          </BodyText>
          <div className="flex items-center gap-2 mb-2">
            <CategoryBadge category={template.category} />
            <TypeBadge type={template.type} />
          </div>
          <div className="flex items-center gap-4 text-xs text-aurora-nav-muted bg-background">
            <span>Used {template.usageCount} times</span>
            <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
            {template.lastUsed && (
              <span>Last used {new Date(template.lastUsed).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <TemplateActions
          template={template}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onView={onView}
          onExport={onExport}
          onToggleStatus={onToggleStatus}
        />
      </div>

      {/* Template Preview */}
      <div className="mb-4">
        {template.thumbnail ? (
          <div className="w-full h-32 bg-muted rounded-token-lg border overflow-hidden">
            <img 
              src={template.thumbnail} 
              alt={`${template.name} preview`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-32 bg-muted rounded-token-lg border flex items-center justify-center">
            <FileText className="w-8 h-8 text-aurora-nav-muted" />
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            {template.performance.campaigns}
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Campaigns
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            {template.performance.avgOpenRate.toFixed(1)}%
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Open Rate
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            {template.performance.avgClickRate.toFixed(1)}%
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Click Rate
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            {template.performance.totalSent.toLocaleString()}
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Total Sent
          </BodyText>
        </div>
      </div>

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-muted text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main Template Management Component
export default function TemplateManagement({ 
  onCreateTemplate,
  onEditTemplate,
  onViewTemplate 
}: {
  onCreateTemplate?: () => void
  onEditTemplate?: (id: string) => void
  onViewTemplate?: (id: string) => void
}) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [analytics, setAnalytics] = useState<TemplateAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{ status?: string; category?: string; type?: string; search?: string }>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch templates and analytics
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.category) params.append('category', filters.category)
      if (filters.type) params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)

      const [templatesRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/email-marketing/templates?${params}`),
        fetch('/api/admin/email-marketing/templates/analytics')
      ])

      const templatesData = await templatesRes.json()
      const analyticsData = await analyticsRes.json()

      if (templatesData.success) {
        setTemplates(templatesData.data.templates || [])
      }

      if (analyticsData.success) {
        setAnalytics(analyticsData.data)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [filters])

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  // Handle search
  const handleSearch = (search: string) => {
    setFilters({ ...filters, search })
  }

  // Template actions
  const handleEdit = (id: string) => {
    if (onEditTemplate) {
      onEditTemplate(id)
    } else {
      console.log('Edit template:', id)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/email-marketing/templates/${id}/duplicate`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchTemplates() // Refresh list
      }
    } catch (err) {
      console.error('Failed to duplicate template:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const response = await fetch(`/api/admin/email-marketing/templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTemplates() // Refresh list
      }
    } catch (err) {
      console.error('Failed to delete template:', err)
    }
  }

  const handleView = (id: string) => {
    if (onViewTemplate) {
      onViewTemplate(id)
    } else {
      console.log('View template:', id)
    }
  }

  const handleExport = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/email-marketing/templates/${id}/export`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template-${id}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to export template:', err)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const template = templates.find(t => t._id === id)
      if (!template) return

      const newStatus = template.status === 'active' ? 'inactive' : 'active'
      
      const response = await fetch(`/api/admin/email-marketing/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchTemplates() // Refresh list
      }
    } catch (err) {
      console.error('Failed to toggle template status:', err)
    }
  }

  // Loading state
  if (loading && templates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-token-md">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-token-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-token-lg"></div>
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
        <H2 className="mb-2 text-foreground">Failed to Load Templates</H2>
        <BodyText className="text-aurora-nav-muted bg-background mb-4">
          {error}
        </BodyText>
        <Button variant="primary" size="md" onClick={fetchTemplates}>
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
            title="Total Templates"
            value={analytics.totalTemplates}
            subtitle={`${analytics.activeTemplates} active`}
            icon={FileText}
            trend="up"
          />
          <MetricCard
            title="Top Performance"
            value={analytics.topPerformingTemplates[0]?.performance.avgOpenRate || 0}
            subtitle="Best template open rate"
            icon={Star}
            format="percentage"
            trend="up"
          />
          <MetricCard
            title="Categories"
            value={analytics.categoriesBreakdown.length}
            subtitle="Template categories"
            icon={Layout}
            trend="neutral"
          />
          <MetricCard
            title="Recent Activity"
            value={analytics.recentActivity.length}
            subtitle="Templates modified this week"
            icon={Calendar}
            trend="up"
          />
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <H2 className="text-foreground">Email Templates</H2>
          <BodyText className="text-aurora-nav-muted bg-background">
            Create and manage reusable email templates for campaigns
          </BodyText>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-background border rounded-token-lg">
            <Button
              variant={viewMode === 'grid' ? 'accent' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'accent' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="secondary" size="md">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button variant="secondary" size="md" onClick={fetchTemplates}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={onCreateTemplate}>
            <Plus className="w-4 h-4" />
            New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TemplateFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-foreground bg-background p-8 rounded-token-lg border text-center">
          <FileText className="w-12 h-12 text-aurora-nav-muted mx-auto mb-4" />
          <H2 className="mb-2 text-foreground">No Templates Found</H2>
          <BodyText className="text-aurora-nav-muted bg-background mb-6">
            {filters.search || filters.status || filters.category || filters.type
              ? 'No templates match your current filters.'
              : 'Get started by creating your first email template.'}
          </BodyText>
          <Button variant="primary" size="md" onClick={onCreateTemplate}>
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'space-y-token-md'
        )}>
          {templates.map(template => (
            <TemplateCard
              key={template._id}
              template={template}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onView={handleView}
              onExport={handleExport}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}