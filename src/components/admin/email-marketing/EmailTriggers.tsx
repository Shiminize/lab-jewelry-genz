'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Zap, 
  Clock, 
  Mail, 
  ShoppingCart, 
  User, 
  Calendar,
  Edit, 
  Copy, 
  Trash2,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Settings,
  Play,
  Pause,
  Target,
  TrendingUp,
  Activity,
  Bell,
  Heart,
  Gift,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Interfaces for email triggers
interface EmailTrigger {
  _id: string
  name: string
  description: string
  type: 'welcome' | 'abandoned-cart' | 'post-purchase' | 'birthday' | 're-engagement' | 'win-back' | 'product-reminder' | 'review-request'
  status: 'active' | 'inactive' | 'draft'
  conditions: TriggerCondition[]
  actions: TriggerAction[]
  delay: {
    amount: number
    unit: 'minutes' | 'hours' | 'days' | 'weeks'
  }
  createdAt: string
  updatedAt: string
  lastTriggered?: string
  triggeredCount: number
  conversionRate: number
  revenue: number
}

interface TriggerCondition {
  event: string
  field?: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: string | number
  logic?: 'AND' | 'OR'
}

interface TriggerAction {
  type: 'send_email' | 'add_to_segment' | 'update_field' | 'send_notification'
  template?: string
  segment?: string
  field?: string
  value?: string | number
  delay?: number
}

interface TriggerAnalytics {
  totalTriggers: number
  activeTriggers: number
  totalTriggered: number
  avgConversionRate: number
  totalRevenue: number
  topPerformingTriggers: EmailTrigger[]
}

// Trigger type configuration
const triggerTypes = [
  { 
    id: 'welcome', 
    label: 'Welcome Series', 
    icon: User,
    description: 'Onboard new subscribers with welcome emails',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    id: 'abandoned-cart', 
    label: 'Abandoned Cart', 
    icon: ShoppingCart,
    description: 'Recover abandoned shopping carts',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  { 
    id: 'post-purchase', 
    label: 'Post-Purchase', 
    icon: Gift,
    description: 'Follow up after successful purchases',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    id: 'birthday', 
    label: 'Birthday', 
    icon: Calendar,
    description: 'Send birthday greetings and offers',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  { 
    id: 're-engagement', 
    label: 'Re-engagement', 
    icon: Target,
    description: 'Re-engage inactive subscribers',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  { 
    id: 'win-back', 
    label: 'Win-back', 
    icon: Heart,
    description: 'Win back churned customers',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  { 
    id: 'product-reminder', 
    label: 'Product Reminder', 
    icon: Bell,
    description: 'Remind about viewed or wishlisted products',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  { 
    id: 'review-request', 
    label: 'Review Request', 
    icon: Award,
    description: 'Request reviews after purchase',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
]

// Trigger status badge component
const StatusBadge = ({ status }: { status: EmailTrigger['status'] }) => {
  const getStatusConfig = (status: EmailTrigger['status']) => {
    switch (status) {
      case 'active':
        return { 
          text: 'Active', 
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: Play
        }
      case 'inactive':
        return { 
          text: 'Inactive', 
          className: 'bg-muted text-foreground border-border',
          icon: Pause
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

// Trigger type badge component
const TypeBadge = ({ type }: { type: EmailTrigger['type'] }) => {
  const typeConfig = triggerTypes.find(t => t.id === type)
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

// Trigger filters component
const TriggerFilters = ({ 
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
              placeholder="Search triggers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 font-body text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Search email triggers"
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
          aria-label="Filter by trigger type"
        >
          <option value="">All Types</option>
          {triggerTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// Trigger actions dropdown
const TriggerActions = ({ 
  trigger, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onView,
  onToggleStatus 
}: {
  trigger: EmailTrigger
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
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
              onClick={() => { onView(trigger._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={() => { onEdit(trigger._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Trigger
            </button>
            <button
              onClick={() => { onDuplicate(trigger._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={() => { onToggleStatus(trigger._id); setIsOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              {trigger.status === 'active' ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Trigger
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Activate Trigger
                </>
              )}
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { onDelete(trigger._id); setIsOpen(false) }}
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

// Trigger card component
const TriggerCard = ({ 
  trigger, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onView,
  onToggleStatus 
}: {
  trigger: EmailTrigger
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onToggleStatus: (id: string) => void
}) => {
  const formatDelay = (delay: EmailTrigger['delay']) => {
    const { amount, unit } = delay
    return `${amount} ${unit}${amount > 1 ? '' : ''}`.replace(/s$/, amount > 1 ? 's' : '')
  }

  return (
    <div className="text-foreground bg-background p-6 rounded-token-lg border hover:border-accent transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <H3 className="text-foreground">{trigger.name}</H3>
            <StatusBadge status={trigger.status} />
            <TypeBadge type={trigger.type} />
          </div>
          <BodyText size="sm" className="text-aurora-nav-muted bg-background mb-2">
            {trigger.description}
          </BodyText>
          <div className="flex items-center gap-4 text-xs text-aurora-nav-muted bg-background">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Delay: {formatDelay(trigger.delay)}</span>
            </div>
            <span>Created {new Date(trigger.createdAt).toLocaleDateString()}</span>
            {trigger.lastTriggered && (
              <span>Last triggered {new Date(trigger.lastTriggered).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <TriggerActions
          trigger={trigger}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onView={onView}
          onToggleStatus={onToggleStatus}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            {trigger.triggeredCount.toLocaleString()}
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Triggered
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            {trigger.conversionRate.toFixed(1)}%
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Conversion
          </BodyText>
        </div>
        <div className="text-center p-3 bg-muted rounded-token-lg">
          <div className="text-lg font-semibold text-foreground">
            ${trigger.revenue.toLocaleString()}
          </div>
          <BodyText size="xs" className="text-aurora-nav-muted bg-muted">
            Revenue
          </BodyText>
        </div>
      </div>

      {/* Conditions & Actions Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <BodyText size="xs" className="font-medium text-aurora-nav-muted bg-background mb-1">
              Conditions ({trigger.conditions.length})
            </BodyText>
            <BodyText size="xs" className="text-aurora-nav-muted bg-background">
              {trigger.conditions[0]?.event || 'No conditions'}
              {trigger.conditions.length > 1 && ` +${trigger.conditions.length - 1} more`}
            </BodyText>
          </div>
          <div>
            <BodyText size="xs" className="font-medium text-aurora-nav-muted bg-background mb-1">
              Actions ({trigger.actions.length})
            </BodyText>
            <BodyText size="xs" className="text-aurora-nav-muted bg-background">
              {trigger.actions[0]?.type.replace('_', ' ') || 'No actions'}
              {trigger.actions.length > 1 && ` +${trigger.actions.length - 1} more`}
            </BodyText>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Email Triggers Component
export default function EmailTriggers({ 
  onCreateTrigger,
  onEditTrigger,
  onViewTrigger 
}: {
  onCreateTrigger?: () => void
  onEditTrigger?: (id: string) => void
  onViewTrigger?: (id: string) => void
}) {
  const [triggers, setTriggers] = useState<EmailTrigger[]>([])
  const [analytics, setAnalytics] = useState<TriggerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{ status?: string; type?: string; search?: string }>({})

  // Fetch triggers and analytics
  const fetchTriggers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.type) params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)

      const [triggersRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/email-marketing/triggers?${params}`),
        fetch('/api/admin/email-marketing/triggers/analytics')
      ])

      const triggersData = await triggersRes.json()
      const analyticsData = await analyticsRes.json()

      if (triggersData.success) {
        setTriggers(triggersData.data.triggers || [])
      }

      if (analyticsData.success) {
        setAnalytics(analyticsData.data)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load triggers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTriggers()
  }, [filters])

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  // Handle search
  const handleSearch = (search: string) => {
    setFilters({ ...filters, search })
  }

  // Trigger actions
  const handleEdit = (id: string) => {
    if (onEditTrigger) {
      onEditTrigger(id)
    } else {
      console.log('Edit trigger:', id)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/email-marketing/triggers/${id}/duplicate`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchTriggers() // Refresh list
      }
    } catch (err) {
      console.error('Failed to duplicate trigger:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trigger?')) return
    
    try {
      const response = await fetch(`/api/admin/email-marketing/triggers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTriggers() // Refresh list
      }
    } catch (err) {
      console.error('Failed to delete trigger:', err)
    }
  }

  const handleView = (id: string) => {
    if (onViewTrigger) {
      onViewTrigger(id)
    } else {
      console.log('View trigger:', id)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const trigger = triggers.find(t => t._id === id)
      if (!trigger) return

      const newStatus = trigger.status === 'active' ? 'inactive' : 'active'
      
      const response = await fetch(`/api/admin/email-marketing/triggers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchTriggers() // Refresh list
      }
    } catch (err) {
      console.error('Failed to toggle trigger status:', err)
    }
  }

  // Loading state
  if (loading && triggers.length === 0) {
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
        <H2 className="mb-2 text-foreground">Failed to Load Triggers</H2>
        <BodyText className="text-aurora-nav-muted bg-background mb-4">
          {error}
        </BodyText>
        <Button variant="primary" size="md" onClick={fetchTriggers}>
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
            title="Total Triggers"
            value={analytics.totalTriggers}
            subtitle={`${analytics.activeTriggers} active`}
            icon={Zap}
            trend="up"
          />
          <MetricCard
            title="Times Triggered"
            value={analytics.totalTriggered}
            subtitle="Across all triggers"
            icon={Activity}
            trend="up"
          />
          <MetricCard
            title="Avg Conversion"
            value={analytics.avgConversionRate}
            subtitle="All trigger types"
            icon={TrendingUp}
            format="percentage"
            trend="up"
          />
          <MetricCard
            title="Total Revenue"
            value={analytics.totalRevenue}
            subtitle="From triggered emails"
            icon={Mail}
            format="currency"
            trend="up"
          />
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <H2 className="text-foreground">Email Triggers</H2>
          <BodyText className="text-aurora-nav-muted bg-background">
            Automate email sending based on customer behavior and events
          </BodyText>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={fetchTriggers}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={onCreateTrigger}>
            <Plus className="w-4 h-4" />
            New Trigger
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TriggerFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* Triggers Grid */}
      {triggers.length === 0 ? (
        <div className="text-foreground bg-background p-8 rounded-token-lg border text-center">
          <Zap className="w-12 h-12 text-aurora-nav-muted mx-auto mb-4" />
          <H2 className="mb-2 text-foreground">No Triggers Found</H2>
          <BodyText className="text-aurora-nav-muted bg-background mb-6">
            {filters.search || filters.status || filters.type
              ? 'No triggers match your current filters.'
              : 'Get started by creating your first automated email trigger.'}
          </BodyText>
          <Button variant="primary" size="md" onClick={onCreateTrigger}>
            <Plus className="w-4 h-4" />
            Create Trigger
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {triggers.map(trigger => (
            <TriggerCard
              key={trigger._id}
              trigger={trigger}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onView={handleView}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}