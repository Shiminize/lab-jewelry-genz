'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Send, 
  Trash2,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Mail,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Campaign interface following API structure
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

// Campaign list response structure
interface CampaignListResponse {
  campaigns: Campaign[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  summary: {
    totalCampaigns: number
    activeCampaigns: number
    draftCampaigns: number
    completedCampaigns: number
    avgOpenRate: number
    avgClickRate: number
  }
}

// Status badge component using approved colors
const StatusBadge = ({ status }: { status: Campaign['status'] }) => {
  const statusConfig = {
    draft: { 
      label: 'Draft', 
      className: 'text-gray-600 bg-muted border-border' 
    },
    scheduled: { 
      label: 'Scheduled', 
      className: 'text-accent bg-white border-accent' 
    },
    active: { 
      label: 'Active', 
      className: 'text-background bg-cta border-cta' 
    },
    paused: { 
      label: 'Paused', 
      className: 'text-foreground bg-background border-border' 
    },
    completed: { 
      label: 'Completed', 
      className: 'text-accent bg-white border-accent' 
    },
    cancelled: { 
      label: 'Cancelled', 
      className: 'text-gray-600 bg-muted border-border' 
    }
  }

  const config = statusConfig[status]
  
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
      config.className
    )}>
      {config.label}
    </span>
  )
}

// Campaign type badge
const TypeBadge = ({ type }: { type: Campaign['type'] }) => (
  <span className="text-gray-600 bg-muted px-2 py-1 rounded text-xs font-medium">
    {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
  </span>
)

// Performance metrics component
const PerformanceMetrics = ({ analytics }: { analytics: Campaign['analytics'] }) => (
  <div className="grid grid-cols-2 gap-2 text-xs">
    <div className="text-center">
      <div className="font-semibold text-foreground">{analytics.sent.toLocaleString()}</div>
      <div className="text-gray-600 bg-white">Sent</div>
    </div>
    <div className="text-center">
      <div className="font-semibold text-foreground">{analytics.openRate.toFixed(1)}%</div>
      <div className="text-gray-600 bg-white">Open Rate</div>
    </div>
  </div>
)

// Campaign actions dropdown
const CampaignActions = ({ 
  campaign, 
  onEdit, 
  onDuplicate, 
  onSend, 
  onDelete, 
  onView 
}: {
  campaign: Campaign
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onSend: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 text-foreground bg-white rounded-lg border shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => { onView(campaign._id); setIsOpen(false) }}
              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
            <button
              onClick={() => { onEdit(campaign._id); setIsOpen(false) }}
              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Campaign
            </button>
            <button
              onClick={() => { onDuplicate(campaign._id); setIsOpen(false) }}
              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </button>
            {campaign.status === 'draft' && (
              <button
                onClick={() => { onSend(campaign._id); setIsOpen(false) }}
                className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Campaign
              </button>
            )}
            <hr className="my-1 border-border" />
            <button
              onClick={() => { onDelete(campaign._id); setIsOpen(false) }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="text-foreground bg-white p-6 rounded-lg border">
        <div className="animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-48"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
            <div className="h-6 bg-muted rounded w-20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Error state
const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="text-foreground bg-white p-8 rounded-lg border text-center">
    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <H3 className="text-foreground mb-2">Unable to Load Campaigns</H3>
    <BodyText className="text-gray-600 bg-white mb-6">{message}</BodyText>
    <Button variant="primary" size="md" onClick={onRetry}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </div>
)

// Empty state
const EmptyState = ({ onCreateCampaign }: { onCreateCampaign: () => void }) => (
  <div className="text-foreground bg-white p-12 rounded-lg border text-center">
    <Mail className="w-16 h-16 text-gray-400 mx-auto mb-6" />
    <H2 className="text-foreground mb-2">No Campaigns Yet</H2>
    <BodyText className="text-gray-600 bg-white mb-8 max-w-md mx-auto">
      Create your first email campaign to start engaging with your customers. 
      Choose from templates or build from scratch.
    </BodyText>
    <Button variant="primary" size="lg" onClick={onCreateCampaign}>
      <Plus className="w-5 h-5 mr-2" />
      Create Your First Campaign
    </Button>
  </div>
)

// Main Campaign Management Component
export default function CampaignManagement({ onCreateCampaign }: { onCreateCampaign: () => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<CampaignListResponse['pagination'] | null>(null)
  const [summary, setSummary] = useState<CampaignListResponse['summary'] | null>(null)

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)

      const response = await fetch(`/api/admin/email-marketing/campaigns?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch campaigns')
      }

      setCampaigns(data.data.campaigns || [])
      setPagination(data.data.pagination)
      setSummary(data.data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [currentPage, statusFilter, typeFilter])

  // Filter campaigns by search term
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Campaign actions
  const handleEdit = (id: string) => {
    console.log('Edit campaign:', id)
    // TODO: Navigate to edit page
  }

  const handleDuplicate = async (id: string) => {
    console.log('Duplicate campaign:', id)
    // TODO: Implement duplication
  }

  const handleSend = (id: string) => {
    console.log('Send campaign:', id)
    // TODO: Open send interface
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    
    try {
      const response = await fetch(`/api/admin/email-marketing/campaigns/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCampaigns() // Refresh list
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err)
    }
  }

  const handleView = (id: string) => {
    console.log('View campaign:', id)
    // TODO: Navigate to details page
  }

  // Render content
  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={fetchCampaigns} />
  if (campaigns.length === 0 && searchTerm === '' && statusFilter === 'all') {
    return <EmptyState onCreateCampaign={onCreateCampaign} />
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-foreground bg-white p-6 rounded-lg border text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {summary.totalCampaigns}
            </div>
            <BodyText size="sm" className="text-gray-600 bg-white">
              Total Campaigns
            </BodyText>
          </div>
          <div className="text-foreground bg-white p-6 rounded-lg border text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {summary.activeCampaigns}
            </div>
            <BodyText size="sm" className="text-gray-600 bg-white">
              Active Campaigns
            </BodyText>
          </div>
          <div className="text-foreground bg-white p-6 rounded-lg border text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {summary.avgOpenRate.toFixed(1)}%
            </div>
            <BodyText size="sm" className="text-gray-600 bg-white">
              Avg Open Rate
            </BodyText>
          </div>
          <div className="text-foreground bg-white p-6 rounded-lg border text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {summary.avgClickRate.toFixed(1)}%
            </div>
            <BodyText size="sm" className="text-gray-600 bg-white">
              Avg Click Rate
            </BodyText>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="text-foreground bg-white p-6 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-foreground bg-white border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-foreground bg-white border border-border rounded-lg focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-foreground bg-white border border-border rounded-lg focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Types</option>
                <option value="newsletter">Newsletter</option>
                <option value="promotional">Promotional</option>
                <option value="welcome-series">Welcome Series</option>
                <option value="abandoned-cart">Abandoned Cart</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={fetchCampaigns}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="primary" size="md" onClick={onCreateCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign._id} className="text-foreground bg-white p-6 rounded-lg border hover:border-accent transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <H3 className="text-foreground">{campaign.name}</H3>
                  <StatusBadge status={campaign.status} />
                  <TypeBadge type={campaign.type} />
                </div>
                <BodyText className="text-gray-600 bg-white mb-1">
                  Subject: {campaign.subject}
                </BodyText>
                <BodyText size="sm" className="text-gray-600 bg-white">
                  Created {new Date(campaign.createdAt).toLocaleDateString()} by {campaign.creatorName || 'Admin'}
                </BodyText>
              </div>
              <CampaignActions
                campaign={campaign}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onSend={handleSend}
                onDelete={handleDelete}
                onView={handleView}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-foreground">
                  {campaign.analytics.sent.toLocaleString()}
                </div>
                <BodyText size="sm" className="text-gray-600 bg-muted">
                  Emails Sent
                </BodyText>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-foreground">
                  {campaign.analytics.openRate.toFixed(1)}%
                </div>
                <BodyText size="sm" className="text-gray-600 bg-muted">
                  Open Rate
                </BodyText>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-foreground">
                  {campaign.analytics.clickRate.toFixed(1)}%
                </div>
                <BodyText size="sm" className="text-gray-600 bg-muted">
                  Click Rate
                </BodyText>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-foreground">
                  ${campaign.analytics.revenue.toLocaleString()}
                </div>
                <BodyText size="sm" className="text-gray-600 bg-muted">
                  Revenue
                </BodyText>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-foreground bg-white p-4 rounded-lg border">
          <BodyText className="text-gray-600 bg-white">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} campaigns
          </BodyText>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="px-3 py-1 text-sm text-foreground">
              {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}