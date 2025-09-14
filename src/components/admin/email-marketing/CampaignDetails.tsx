'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Send, 
  Edit, 
  Copy, 
  Trash2,
  Play,
  Pause,
  Calendar,
  Users,
  Mail,
  TrendingUp,
  Eye,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'
import { Button } from '../../ui/Button'
import { H1, H2, H3, BodyText } from '../../foundation/Typography'
import { cn } from '../../../lib/utils'

// Interfaces
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
    unsubscribed: number
    bounced: number
  }
  createdAt: string
  updatedAt: string
  sentAt?: string
  scheduledAt?: string
  creatorName?: string
}

interface CampaignDetailsResponse {
  campaign: Campaign
  segments: Array<{
    _id: string
    name: string
    customerCount: number
  }>
  timeline: Array<{
    timestamp: string
    event: string
    description: string
    count?: number
  }>
}

// Status badge component
const StatusBadge = ({ status }: { status: Campaign['status'] }) => {
  const getStatusConfig = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return { 
          text: 'Active', 
          className: 'bg-success/10 text-success border-success/30',
          icon: Play
        }
      case 'draft':
        return { 
          text: 'Draft', 
          className: 'bg-muted text-foreground border-border',
          icon: Edit
        }
      case 'scheduled':
        return { 
          text: 'Scheduled', 
          className: 'bg-info/10 text-info border-info/30',
          icon: Clock
        }
      case 'paused':
        return { 
          text: 'Paused', 
          className: 'bg-warning/10 text-warning border-warning/30',
          icon: Pause
        }
      case 'completed':
        return { 
          text: 'Completed', 
          className: 'bg-success/10 text-success border-success/30',
          icon: CheckCircle
        }
      case 'cancelled':
        return { 
          text: 'Cancelled', 
          className: 'bg-error/10 text-error border-error/30',
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
      'inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border',
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
  percentage, 
  icon: Icon, 
  trend 
}: {
  title: string
  value: number
  percentage?: number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
}) => (
  <div className="text-foreground bg-background p-4 rounded-token-lg border space-y-3">
    <div className="flex items-center justify-between">
      <div className="w-8 h-8 bg-accent/10 rounded-token-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      {trend && (
        <div className={cn(
          "text-xs font-medium",
          trend === 'up' && "text-success",
          trend === 'down' && "text-error",
          trend === 'neutral' && "text-aurora-nav-muted"
        )}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </div>
      )}
    </div>
    <div>
      <div className="text-xl font-bold text-foreground">
        {value.toLocaleString()}
      </div>
      <div className="flex items-center justify-between">
        <BodyText size="sm" className="text-aurora-nav-muted bg-background">
          {title}
        </BodyText>
        {percentage !== undefined && (
          <BodyText size="sm" className="font-medium text-foreground">
            {percentage.toFixed(1)}%
          </BodyText>
        )}
      </div>
    </div>
  </div>
)

// Campaign timeline component
const CampaignTimeline = ({ timeline }: { timeline: CampaignDetailsResponse['timeline'] }) => (
  <div className="text-foreground bg-background p-6 rounded-token-lg border">
    <H3 className="mb-4 text-foreground">Campaign Timeline</H3>
    <div className="space-y-token-md">
      {timeline.map((event, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <BodyText className="font-medium text-foreground">
                {event.event}
              </BodyText>
              <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                {new Date(event.timestamp).toLocaleString()}
              </BodyText>
            </div>
            <BodyText size="sm" className="text-aurora-nav-muted bg-background">
              {event.description}
              {event.count && ` (${event.count.toLocaleString()})`}
            </BodyText>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Email preview component
const EmailPreview = ({ campaign }: { campaign: Campaign }) => (
  <div className="text-foreground bg-background p-6 rounded-token-lg border">
    <H3 className="mb-4 text-foreground">Email Preview</H3>
    
    <div className="border border-border rounded-token-lg overflow-hidden">
      {/* Email header */}
      <div className="bg-muted p-4 border-b border-border">
        <div className="text-sm font-medium text-foreground mb-1">
          Subject: {campaign.subject}
        </div>
        {campaign.content.preheader && (
          <div className="text-xs text-aurora-nav-muted">
            Preheader: {campaign.content.preheader}
          </div>
        )}
      </div>
      
      {/* Email content */}
      <div className="p-4 max-h-64 overflow-auto bg-background">
        <div 
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: campaign.content.html }}
        />
      </div>
      
      {/* Preview actions */}
      <div className="bg-muted p-3 border-t border-border flex gap-2">
        <Button variant="secondary" size="sm">
          <Eye className="w-4 h-4" />
          Full Preview
        </Button>
        <Button variant="secondary" size="sm">
          <Mail className="w-4 h-4" />
          Send Test
        </Button>
      </div>
    </div>
  </div>
)

// Main Campaign Details Component
export default function CampaignDetails({ 
  campaignId, 
  onBack, 
  onEdit,
  onSend 
}: {
  campaignId: string
  onBack: () => void
  onEdit?: (id: string) => void
  onSend?: (id: string) => void
}) {
  const [data, setData] = useState<CampaignDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error?.message || 'Failed to fetch campaign details')
        }

        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaign details')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaignDetails()
  }, [campaignId])

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-token-md">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-token-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded-token-lg"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="text-foreground bg-background p-6 rounded-token-lg border text-center">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <H2 className="mb-2 text-foreground">Failed to Load Campaign</H2>
        <BodyText className="text-aurora-nav-muted bg-background mb-4">
          {error || 'Campaign not found'}
        </BodyText>
        <Button variant="primary" size="md" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Button>
      </div>
    )
  }

  const { campaign, segments, timeline } = data
  const canEdit = campaign.status !== 'completed'
  const canSend = campaign.status === 'draft' || campaign.status === 'paused'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="md" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
          <div>
            <H1 className="text-foreground">{campaign.name}</H1>
            <div className="flex items-center gap-3">
              <StatusBadge status={campaign.status} />
              <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                Created {new Date(campaign.createdAt).toLocaleDateString()}
              </BodyText>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEdit && onEdit && (
            <Button variant="secondary" size="md" onClick={() => onEdit(campaign._id)}>
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
          {canSend && onSend && (
            <Button variant="primary" size="md" onClick={() => onSend(campaign._id)}>
              <Send className="w-4 h-4" />
              Send Campaign
            </Button>
          )}
          <Button variant="outline" size="md">
            <Copy className="w-4 h-4" />
            Duplicate
          </Button>
        </div>
      </div>

      {/* Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Emails Sent"
          value={campaign.analytics.sent}
          icon={Send}
          trend="up"
        />
        <MetricCard
          title="Emails Opened"
          value={campaign.analytics.opened}
          percentage={campaign.analytics.openRate}
          icon={Mail}
          trend="up"
        />
        <MetricCard
          title="Links Clicked"
          value={campaign.analytics.clicked}
          percentage={campaign.analytics.clickRate}
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Revenue Generated"
          value={campaign.analytics.revenue}
          icon={BarChart3}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Information */}
          <div className="text-foreground bg-background p-6 rounded-token-lg border">
            <H2 className="mb-4 text-foreground">Campaign Information</H2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                  Campaign Type
                </BodyText>
                <BodyText className="text-foreground capitalize">
                  {campaign.type.replace('-', ' ')}
                </BodyText>
              </div>
              <div>
                <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                  Subject Line
                </BodyText>
                <BodyText className="text-foreground">
                  {campaign.subject}
                </BodyText>
              </div>
              <div>
                <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                  Created By
                </BodyText>
                <BodyText className="text-foreground">
                  {campaign.creatorName || 'Unknown'}
                </BodyText>
              </div>
              <div>
                <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                  Last Updated
                </BodyText>
                <BodyText className="text-foreground">
                  {new Date(campaign.updatedAt).toLocaleDateString()}
                </BodyText>
              </div>
              {campaign.sentAt && (
                <div>
                  <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                    Sent Date
                  </BodyText>
                  <BodyText className="text-foreground">
                    {new Date(campaign.sentAt).toLocaleDateString()}
                  </BodyText>
                </div>
              )}
              {campaign.scheduledAt && (
                <div>
                  <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                    Scheduled For
                  </BodyText>
                  <BodyText className="text-foreground">
                    {new Date(campaign.scheduledAt).toLocaleDateString()}
                  </BodyText>
                </div>
              )}
            </div>
          </div>

          {/* Target Audience */}
          <div className="text-foreground bg-background p-6 rounded-token-lg border">
            <H2 className="mb-4 text-foreground">Target Audience</H2>
            <div className="space-y-3">
              {segments.map(segment => (
                <div key={segment._id} className="flex items-center justify-between p-3 bg-muted rounded-token-lg">
                  <BodyText className="text-foreground">{segment.name}</BodyText>
                  <BodyText size="sm" className="text-aurora-nav-muted bg-muted">
                    {segment.customerCount.toLocaleString()} customers
                  </BodyText>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <BodyText className="font-medium text-foreground">Total Recipients</BodyText>
                  <BodyText className="font-bold text-foreground">
                    {segments.reduce((sum, s) => sum + s.customerCount, 0).toLocaleString()}
                  </BodyText>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <CampaignTimeline timeline={timeline} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="text-foreground bg-background p-6 rounded-token-lg border">
            <H3 className="mb-4 text-foreground">Performance Summary</H3>
            <div className="space-y-token-md">
              <div className="flex justify-between items-center">
                <BodyText size="sm" className="text-aurora-nav-muted bg-background">Delivery Rate</BodyText>
                <BodyText className="font-medium text-foreground">
                  {campaign.analytics.sent > 0 
                    ? ((campaign.analytics.delivered / campaign.analytics.sent) * 100).toFixed(1)
                    : 0}%
                </BodyText>
              </div>
              <div className="flex justify-between items-center">
                <BodyText size="sm" className="text-aurora-nav-muted bg-background">Open Rate</BodyText>
                <BodyText className="font-medium text-foreground">
                  {campaign.analytics.openRate.toFixed(1)}%
                </BodyText>
              </div>
              <div className="flex justify-between items-center">
                <BodyText size="sm" className="text-aurora-nav-muted bg-background">Click Rate</BodyText>
                <BodyText className="font-medium text-foreground">
                  {campaign.analytics.clickRate.toFixed(1)}%
                </BodyText>
              </div>
              <div className="flex justify-between items-center">
                <BodyText size="sm" className="text-aurora-nav-muted bg-background">Unsubscribe Rate</BodyText>
                <BodyText className="font-medium text-foreground">
                  {campaign.analytics.sent > 0 
                    ? ((campaign.analytics.unsubscribed / campaign.analytics.sent) * 100).toFixed(2)
                    : 0}%
                </BodyText>
              </div>
              <div className="flex justify-between items-center">
                <BodyText size="sm" className="text-aurora-nav-muted bg-background">Bounce Rate</BodyText>
                <BodyText className="font-medium text-foreground">
                  {campaign.analytics.sent > 0 
                    ? ((campaign.analytics.bounced / campaign.analytics.sent) * 100).toFixed(2)
                    : 0}%
                </BodyText>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <EmailPreview campaign={campaign} />

          {/* Quick Actions */}
          <div className="text-foreground bg-background p-6 rounded-token-lg border">
            <H3 className="mb-4 text-foreground">Quick Actions</H3>
            <div className="space-y-token-sm">
              <Button variant="outline" size="md" className="w-full">
                <Download className="w-4 h-4" />
                Export Analytics
              </Button>
              <Button variant="outline" size="md" className="w-full">
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </Button>
              <Button variant="outline" size="md" className="w-full">
                <Settings className="w-4 h-4" />
                Campaign Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}