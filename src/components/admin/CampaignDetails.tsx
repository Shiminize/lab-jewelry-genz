'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Edit3, 
  Send, 
  Pause, 
  Play, 
  Copy, 
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  Users,
  Mail,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Campaign interface
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
    unsubscribed: number
    bounced: number
    openRate: number
    clickRate: number
    conversionRate: number
    revenue: number
  }
  createdAt: string
  updatedAt: string
  sentAt?: string
  completedAt?: string
  creatorName?: string
}

// Segment interface
interface Segment {
  _id: string
  name: string
  customerCount: number
}

// Analytics data interface
interface AnalyticsData {
  timeline: {
    date: string
    opens: number
    clicks: number
    revenue: number
  }[]
  topLinks: {
    url: string
    clicks: number
    clickRate: number
  }[]
  deviceBreakdown: {
    device: string
    count: number
    percentage: number
  }[]
  locationData: {
    country: string
    opens: number
    clicks: number
  }[]
}

// Status badge component
const StatusBadge = ({ status }: { status: Campaign['status'] }) => {
  const getStatusConfig = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return { 
          text: 'Active', 
          className: 'bg-aurora-emerald-flash/10 text-aurora-emerald-flash border-aurora-emerald-flash/20',
          icon: Play
        }
      case 'draft':
        return { 
          text: 'Draft', 
          className: 'bg-muted text-foreground border-border',
          icon: Edit3
        }
      case 'scheduled':
        return { 
          text: 'Scheduled', 
          className: 'bg-aurora-nebula-purple/10 text-aurora-nebula-purple border-aurora-nebula-purple/20',
          icon: Clock
        }
      case 'paused':
        return { 
          text: 'Paused', 
          className: 'bg-aurora-amber-glow/10 text-aurora-amber-glow border-aurora-amber-glow/20',
          icon: Pause
        }
      case 'completed':
        return { 
          text: 'Completed', 
          className: 'bg-aurora-emerald-flash/10 text-aurora-emerald-flash border-aurora-emerald-flash/20',
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
          className: 'bg-muted text-foreground border-border',
          icon: AlertCircle
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full border',
      config.className
    )}>
      <Icon className="w-4 h-4" />
      {config.text}
    </span>
  )
}

// Analytics metric card
const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format = 'number'
}: {
  title: string
  value: number
  change?: { value: number; isIncrease: boolean }
  icon: React.ComponentType<{ className?: string }>
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
    <div className="text-foreground bg-background p-6 rounded-token-lg border space-y-token-md">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-accent/10 rounded-token-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            change.isIncrease ? "text-aurora-emerald-flash" : "text-red-600"
          )}>
            {change.isIncrease ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(change.value)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {formatValue(value, format)}
        </div>
        <BodyText size="sm" className="text-aurora-nav-muted bg-background">
          {title}
        </BodyText>
      </div>
    </div>
  )
}

// Campaign actions component
const CampaignActions = ({ 
  campaign, 
  onEdit, 
  onDuplicate, 
  onSend, 
  onPause, 
  onResume, 
  onCancel, 
  onDelete,
  loading 
}: {
  campaign: Campaign
  onEdit: () => void
  onDuplicate: () => void
  onSend: () => void
  onPause: () => void
  onResume: () => void
  onCancel: () => void
  onDelete: () => void
  loading: boolean
}) => {
  const canEdit = ['draft', 'paused'].includes(campaign.status)
  const canSend = campaign.status === 'draft'
  const canPause = campaign.status === 'active'
  const canResume = campaign.status === 'paused'
  const canCancel = ['scheduled', 'active', 'paused'].includes(campaign.status)
  const canDelete = ['draft', 'cancelled', 'completed'].includes(campaign.status)

  return (
    <div className="flex flex-wrap gap-3">
      {canEdit && (
        <Button variant="secondary" size="md" onClick={onEdit} disabled={loading}>
          <Edit3 className="w-4 h-4" />
          Edit Campaign
        </Button>
      )}

      {canSend && (
        <Button variant="primary" size="md" onClick={onSend} disabled={loading}>
          <Send className="w-4 h-4" />
          Send Campaign
        </Button>
      )}

      {canPause && (
        <Button variant="secondary" size="md" onClick={onPause} disabled={loading}>
          <Pause className="w-4 h-4" />
          Pause
        </Button>
      )}

      {canResume && (
        <Button variant="primary" size="md" onClick={onResume} disabled={loading}>
          <Play className="w-4 h-4" />
          Resume
        </Button>
      )}

      <Button variant="outline" size="md" onClick={onDuplicate} disabled={loading}>
        <Copy className="w-4 h-4" />
        Duplicate
      </Button>

      <Button variant="outline" size="md" disabled={loading}>
        <Download className="w-4 h-4" />
        Export Data
      </Button>

      {canCancel && (
        <Button variant="outline" size="md" onClick={onCancel} disabled={loading}>
          <AlertCircle className="w-4 h-4" />
          Cancel
        </Button>
      )}

      {canDelete && (
        <Button variant="outline" size="md" onClick={onDelete} disabled={loading}>
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      )}
    </div>
  )
}

// Campaign timeline component
const CampaignTimeline = ({ 
  campaign 
}: { 
  campaign: Campaign 
}) => {
  const events = []

  // Add creation event
  events.push({
    date: campaign.createdAt,
    title: 'Campaign Created',
    description: `Created by ${campaign.creatorName || 'Unknown'}`,
    icon: Edit3,
    color: 'text-aurora-nebula-purple'
  })

  // Add sent event
  if (campaign.sentAt) {
    events.push({
      date: campaign.sentAt,
      title: 'Campaign Sent',
      description: `Sent to ${campaign.analytics.sent.toLocaleString()} recipients`,
      icon: Send,
      color: 'text-aurora-emerald-flash'
    })
  }

  // Add completion event
  if (campaign.completedAt) {
    events.push({
      date: campaign.completedAt,
      title: 'Campaign Completed',
      description: 'Campaign finished sending',
      icon: CheckCircle,
      color: 'text-aurora-emerald-flash'
    })
  }

  // Sort events by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="text-foreground bg-background p-6 rounded-token-lg border">
      <H3 className="mb-4 text-foreground">Campaign Timeline</H3>
      
      <div className="space-y-token-md">
        {events.map((event, index) => {
          const Icon = event.icon
          return (
            <div key={index} className="flex items-start gap-4">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center bg-background border-2',
                event.color === 'text-aurora-nebula-purple' && 'border-aurora-nebula-purple/20',
                event.color === 'text-aurora-emerald-flash' && 'border-aurora-emerald-flash/20'
              )}>
                <Icon className={cn('w-4 h-4', event.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{event.title}</div>
                <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                  {event.description}
                </BodyText>
                <BodyText size="xs" className="text-aurora-nav-muted bg-background">
                  {new Date(event.date).toLocaleDateString()} at{' '}
                  {new Date(event.date).toLocaleTimeString()}
                </BodyText>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Analytics charts component (simplified for this example)
const AnalyticsCharts = ({ 
  analytics 
}: { 
  analytics: AnalyticsData 
}) => {
  return (
    <div className="space-y-6">
      {/* Performance Over Time */}
      <div className="text-foreground bg-background p-6 rounded-token-lg border">
        <H3 className="mb-4 text-foreground">Performance Timeline</H3>
        
        {analytics.timeline.length > 0 ? (
          <div className="space-y-token-md">
            <BodyText className="text-aurora-nav-muted bg-background">
              Daily opens, clicks, and revenue data
            </BodyText>
            {/* Chart would go here - using placeholder for now */}
            <div className="h-64 bg-muted rounded-token-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-aurora-nav-muted mx-auto mb-2" />
                <BodyText className="text-aurora-nav-muted bg-muted">
                  Analytics Chart Placeholder
                </BodyText>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-aurora-nav-muted mx-auto mb-4" />
            <BodyText className="text-aurora-nav-muted bg-background">
              No analytics data available yet
            </BodyText>
          </div>
        )}
      </div>

      {/* Top Links */}
      {analytics.topLinks.length > 0 && (
        <div className="text-foreground bg-background p-6 rounded-token-lg border">
          <H3 className="mb-4 text-foreground">Top Clicked Links</H3>
          
          <div className="space-y-3">
            {analytics.topLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-token-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <ExternalLink className="w-4 h-4 text-accent flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground truncate">
                      {link.url}
                    </div>
                    <BodyText size="sm" className="text-aurora-nav-muted bg-muted">
                      {link.clicks} clicks ({link.clickRate.toFixed(1)}% rate)
                    </BodyText>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Breakdown */}
      {analytics.deviceBreakdown.length > 0 && (
        <div className="text-foreground bg-background p-6 rounded-token-lg border">
          <H3 className="mb-4 text-foreground">Device Breakdown</H3>
          
          <div className="space-y-3">
            {analytics.deviceBreakdown.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <BodyText className="text-foreground">{device.device}</BodyText>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background w-12 text-right">
                    {device.percentage.toFixed(1)}%
                  </BodyText>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main Campaign Details Component
export default function CampaignDetails({ 
  campaignId, 
  onBack, 
  onEdit 
}: {
  campaignId: string
  onBack: () => void
  onEdit: (id: string) => void
}) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch campaign data
  const fetchCampaign = async () => {
    try {
      setLoading(true)
      setError(null)

      const [campaignRes, segmentsRes] = await Promise.all([
        fetch(`/api/admin/email-marketing/campaigns/${campaignId}`),
        fetch('/api/admin/email-marketing/segments')
      ])

      const campaignData = await campaignRes.json()
      const segmentsData = await segmentsRes.json()

      if (!campaignRes.ok) {
        throw new Error(campaignData.error?.message || 'Failed to fetch campaign')
      }

      setCampaign(campaignData.data.campaign)
      
      if (segmentsData.success) {
        // Filter segments to only those used by this campaign
        const campaignSegments = segmentsData.data.segments.filter((s: Segment) =>
          campaignData.data.campaign.segments.includes(s._id)
        )
        setSegments(campaignSegments)
      }

      // Fetch analytics if campaign has been sent
      if (campaignData.data.campaign.sentAt) {
        try {
          const analyticsRes = await fetch(
            `/api/admin/email-marketing/campaigns/${campaignId}/analytics`
          )
          const analyticsData = await analyticsRes.json()
          
          if (analyticsRes.ok && analyticsData.success) {
            setAnalytics(analyticsData.data)
          }
        } catch (analyticsError) {
          console.error('Failed to fetch analytics:', analyticsError)
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  // Campaign actions
  const handleEdit = () => {
    onEdit(campaignId)
  }

  const handleDuplicate = async () => {
    try {
      setActionLoading(true)
      
      // TODO: Implement duplication API call

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to duplicate campaign')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign?')) return

    try {
      setActionLoading(true)
      
      const response = await fetch(
        `/api/admin/email-marketing/campaigns/${campaignId}/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testMode: false })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send campaign')
      }

      // Refresh campaign data
      fetchCampaign()
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send campaign')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePause = async () => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' })
      })

      if (!response.ok) {
        throw new Error('Failed to pause campaign')
      }

      fetchCampaign()
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to pause campaign')
    } finally {
      setActionLoading(false)
    }
  }

  const handleResume = async () => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })

      if (!response.ok) {
        throw new Error('Failed to resume campaign')
      }

      fetchCampaign()
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to resume campaign')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return

    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel campaign')
      }

      fetchCampaign()
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to cancel campaign')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return

    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      onBack() // Navigate back to campaign list
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete campaign')
    } finally {
      setActionLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-token-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded-token-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-foreground bg-background p-8 rounded-token-lg border text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <H2 className="mb-2 text-foreground">Failed to Load Campaign</H2>
            <BodyText className="text-aurora-nav-muted bg-background mb-6">
              {error || 'Campaign not found'}
            </BodyText>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="md" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
                Back to Campaigns
              </Button>
              <Button variant="primary" size="md" onClick={fetchCampaign}>
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalAudience = segments.reduce((sum, segment) => sum + segment.customerCount, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="md" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <H1 className="text-foreground">{campaign.name}</H1>
                <StatusBadge status={campaign.status} />
              </div>
              <BodyText className="text-aurora-nav-muted bg-background">
                {campaign.subject}
              </BodyText>
            </div>
          </div>

          <CampaignActions
            campaign={campaign}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onSend={handleSend}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            onDelete={handleDelete}
            loading={actionLoading}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Emails Sent"
            value={campaign.analytics.sent}
            icon={Mail}
          />
          <MetricCard
            title="Open Rate"
            value={campaign.analytics.openRate}
            icon={Eye}
            format="percentage"
          />
          <MetricCard
            title="Click Rate"
            value={campaign.analytics.clickRate}
            icon={Target}
            format="percentage"
          />
          <MetricCard
            title="Revenue"
            value={campaign.analytics.revenue}
            icon={DollarSign}
            format="currency"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="text-foreground bg-background p-6 rounded-token-lg border">
              <H2 className="mb-4 text-foreground">Campaign Information</H2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-token-md">
                  <div>
                    <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                      Campaign Type
                    </BodyText>
                    <div className="text-foreground font-medium capitalize">
                      {campaign.type.replace('-', ' ')}
                    </div>
                  </div>

                  <div>
                    <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                      Template
                    </BodyText>
                    <div className="text-foreground font-medium">
                      {campaign.template || 'Default'}
                    </div>
                  </div>

                  <div>
                    <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                      Created By
                    </BodyText>
                    <div className="text-foreground font-medium">
                      {campaign.creatorName || 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="space-y-token-md">
                  <div>
                    <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                      Created Date
                    </BodyText>
                    <div className="text-foreground font-medium">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {campaign.sentAt && (
                    <div>
                      <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                        Sent Date
                      </BodyText>
                      <div className="text-foreground font-medium">
                        {new Date(campaign.sentAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div>
                    <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                      Last Updated
                    </BodyText>
                    <div className="text-foreground font-medium">
                      {new Date(campaign.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preheader */}
              {campaign.content.preheader && (
                <div className="mt-6 pt-6 border-t border-border">
                  <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-2">
                    Preheader Text
                  </BodyText>
                  <BodyText className="text-foreground">
                    {campaign.content.preheader}
                  </BodyText>
                </div>
              )}
            </div>

            {/* Target Audience */}
            <div className="text-foreground bg-background p-6 rounded-token-lg border">
              <H2 className="mb-4 text-foreground">Target Audience</H2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-token-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {totalAudience.toLocaleString()}
                  </div>
                  <BodyText className="text-aurora-nav-muted bg-background">
                    Total recipients across {segments.length} segment{segments.length !== 1 ? 's' : ''}
                  </BodyText>
                </div>
              </div>

              <div className="space-y-3">
                {segments.map(segment => (
                  <div key={segment._id} className="flex justify-between items-center p-3 bg-muted rounded-token-lg">
                    <div className="font-medium text-foreground">
                      {segment.name}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {segment.customerCount.toLocaleString()}
                      </div>
                      <BodyText size="sm" className="text-aurora-nav-muted bg-muted">
                        customers
                      </BodyText>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Preview */}
            <div className="text-foreground bg-background p-6 rounded-token-lg border">
              <H2 className="mb-4 text-foreground">Email Preview</H2>
              
              <div className="border border-border rounded-token-lg overflow-hidden">
                {/* Email Header */}
                <div className="bg-muted p-4 border-b border-border">
                  <div className="text-sm">
                    <strong>Subject:</strong> {campaign.subject}
                  </div>
                  {campaign.content.preheader && (
                    <div className="text-sm text-aurora-nav-muted mt-1">
                      {campaign.content.preheader}
                    </div>
                  )}
                </div>
                
                {/* Email Content */}
                <div className="p-4 max-h-96 overflow-auto bg-background">
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: campaign.content.html }}
                  />
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            {analytics && (
              <AnalyticsCharts analytics={analytics} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Timeline */}
            <CampaignTimeline campaign={campaign} />

            {/* Quick Stats */}
            <div className="text-foreground bg-background p-6 rounded-token-lg border">
              <H3 className="mb-4 text-foreground">Quick Stats</H3>
              
              <div className="space-y-token-md">
                <div className="flex justify-between items-center">
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    Delivered
                  </BodyText>
                  <div className="font-medium text-foreground">
                    {campaign.analytics.delivered.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    Bounced
                  </BodyText>
                  <div className="font-medium text-foreground">
                    {campaign.analytics.bounced.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    Unsubscribed
                  </BodyText>
                  <div className="font-medium text-foreground">
                    {campaign.analytics.unsubscribed.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    Conversion Rate
                  </BodyText>
                  <div className="font-medium text-foreground">
                    {campaign.analytics.conversionRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}