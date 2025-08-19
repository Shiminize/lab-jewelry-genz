'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Send, 
  Users, 
  Zap, 
  TrendingUp, 
  Plus, 
  RefreshCw,
  Mail,
  Target,
  Activity,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Email marketing sections following UI designer specifications
const emailSections = [
  { id: 'overview', label: 'Dashboard', icon: BarChart3 },
  { id: 'campaigns', label: 'Campaigns', icon: Send },
  { id: 'segments', label: 'Segments', icon: Users },
  { id: 'triggers', label: 'Triggers', icon: Zap },
  { id: 'templates', label: 'Templates', icon: Mail },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp }
] as const

type EmailSection = typeof emailSections[number]['id']

// Interface for dashboard metrics (CLAUDE_RULES API envelope compliant)
interface DashboardMetrics {
  totalCampaigns: number
  activeCampaigns: number
  totalSegments: number
  activeSegments: number
  totalTriggers: number
  activeTriggers: number
  emailsSent: number
  openRate: number
  clickRate: number
  revenue: number
}

// Loading state component following approved colors
const LoadingState = () => (
  <div className="p-6 bg-white rounded-lg border">
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="w-6 h-6 text-accent animate-spin" />
        <BodyText className="ml-2 text-foreground">Loading dashboard data...</BodyText>
      </div>
    </div>
  </div>
)

// Error state component using approved typography/background combinations
const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="text-foreground bg-white p-6 rounded-lg border">
    <div className="flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-red-500" />
      <BodyText className="text-foreground">{message}</BodyText>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="w-4 h-4" />
        Retry
      </Button>
    </div>
  </div>
)

// Metrics card component using approved design tokens
const MetricsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend 
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
}) => (
  <div className="text-foreground bg-white p-6 rounded-lg border space-y-3">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      {trend && (
        <div className={cn(
          "text-sm font-medium",
          trend === 'up' && "text-green-600",
          trend === 'down' && "text-red-600",
          trend === 'neutral' && "text-gray-600"
        )}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </div>
      )}
    </div>
    <div>
      <H3 className="text-foreground">{value}</H3>
      <BodyText size="sm" className="text-gray-600 bg-background">
        {title}
      </BodyText>
      <BodyText size="xs" className="text-foreground bg-muted">
        {subtitle}
      </BodyText>
    </div>
  </div>
)

// Overview content component
const OverviewContent = ({ 
  metrics, 
  onCreateCampaign 
}: { 
  metrics: DashboardMetrics | null
  onCreateCampaign: () => void
}) => {
  if (!metrics) return null

  const metricsCards = [
    {
      title: 'Total Campaigns',
      value: metrics.totalCampaigns,
      subtitle: `${metrics.activeCampaigns} active`,
      icon: Send,
      trend: 'up' as const
    },
    {
      title: 'Customer Segments',
      value: metrics.totalSegments,
      subtitle: `${metrics.activeSegments} active`,
      icon: Users,
      trend: 'neutral' as const
    },
    {
      title: 'Email Triggers',
      value: metrics.totalTriggers,
      subtitle: `${metrics.activeTriggers} active`,
      icon: Zap,
      trend: 'up' as const
    },
    {
      title: 'Emails Sent',
      value: metrics.emailsSent.toLocaleString(),
      subtitle: `${metrics.openRate}% open rate`,
      icon: Mail,
      trend: 'up' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricsCards.map((card, index) => (
          <MetricsCard key={index} {...card} />
        ))}
      </div>

      {/* Performance Summary */}
      <div className="text-foreground bg-white p-6 rounded-lg border">
        <H2 className="mb-4 text-foreground">Performance Overview</H2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-background bg-foreground p-2 rounded mb-1">
              {metrics.openRate}%
            </div>
            <BodyText size="sm" className="text-gray-600 bg-muted">
              Average Open Rate
            </BodyText>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">
              {metrics.clickRate}%
            </div>
            <BodyText size="sm" className="text-gray-600 bg-muted">
              Average Click Rate
            </BodyText>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">
              ${metrics.revenue.toLocaleString()}
            </div>
            <BodyText size="sm" className="text-gray-600 bg-muted">
              Email Revenue
            </BodyText>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="text-foreground bg-white p-6 rounded-lg border">
        <H2 className="mb-4 text-foreground">Quick Actions</H2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="md" onClick={onCreateCampaign}>
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
          <Button variant="secondary" size="md">
            <Users className="w-4 h-4" />
            Create Segment
          </Button>
          <Button variant="secondary" size="md">
            <Zap className="w-4 h-4" />
            Setup Trigger
          </Button>
          <Button variant="outline" size="md">
            <TrendingUp className="w-4 h-4" />
            View Analytics
          </Button>
          <Button variant="accent" size="md">
            <Activity className="w-4 h-4" />
            Performance Insights
          </Button>
          <div className="text-accent bg-white p-2 rounded border">
            <BodyText size="sm" className="text-accent bg-white">Quick tip: Use segments to target specific customer groups</BodyText>
          </div>
        </div>
      </div>
    </div>
  )
}

// Import campaign management components
import CampaignManagement from './CampaignManagement'
import CampaignWizard from './email-marketing/CampaignWizard'
import CampaignDetails from './email-marketing/CampaignDetails'
import SendCampaignInterface from './SendCampaignInterface'
import CustomerSegmentation from './email-marketing/CustomerSegmentation'
import EmailTriggers from './email-marketing/EmailTriggers'
import TemplateManagement from './email-marketing/TemplateManagement'
import AnalyticsReporting from './email-marketing/AnalyticsReporting'

// Campaign management state
type CampaignView = 'list' | 'create' | 'details' | 'edit' | 'send'

// Placeholder content for other sections
const PlaceholderContent = ({ section }: { section: string }) => (
  <div className="text-foreground bg-white p-8 rounded-lg border text-center">
    <H2 className="mb-4 text-foreground">{section} Management</H2>
    <BodyText className="text-gray-600 bg-white mb-6">
      This section is coming soon. Full {section.toLowerCase()} management functionality will be available here.
    </BodyText>
    <Button variant="primary" size="md">
      Get Started
    </Button>
  </div>
)

// Main Email Marketing Dashboard Component
export default function EmailMarketingDashboard() {
  const [activeSection, setActiveSection] = useState<EmailSection>('overview')
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Campaign management state
  const [campaignView, setCampaignView] = useState<CampaignView>('list')
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)

  // Fetch dashboard metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch data from multiple APIs in parallel
      const [campaignsRes, segmentsRes, triggersRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/email-marketing/campaigns'),
        fetch('/api/admin/email-marketing/segments'),
        fetch('/api/admin/email-marketing/triggers'),
        fetch('/api/admin/email-marketing/analytics?period=30d')
      ])

      const [campaignsData, segmentsData, triggersData, analyticsData] = await Promise.all([
        campaignsRes.json(),
        segmentsRes.json(),
        triggersRes.json(),
        analyticsRes.json()
      ])

      // Aggregate metrics from API responses
      const dashboardMetrics: DashboardMetrics = {
        totalCampaigns: campaignsData.data?.summary?.totalCampaigns || 0,
        activeCampaigns: campaignsData.data?.summary?.activeCampaigns || 0,
        totalSegments: segmentsData.data?.summary?.totalSegments || 0,
        activeSegments: segmentsData.data?.summary?.activeSegments || 0,
        totalTriggers: triggersData.data?.summary?.totalTriggers || 0,
        activeTriggers: triggersData.data?.summary?.activeTriggers || 0,
        emailsSent: analyticsData.data?.overview?.sent || 0,
        openRate: parseFloat(analyticsData.data?.overview?.openRate || '0'),
        clickRate: parseFloat(analyticsData.data?.overview?.clickRate || '0'),
        revenue: analyticsData.data?.overview?.revenue || 0
      }

      setMetrics(dashboardMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  // Campaign management handlers
  const handleCreateCampaign = () => {
    setCampaignView('create')
  }

  const handleCampaignCreated = (campaign: any) => {
    setCampaignView('list')
    setActiveSection('campaigns')
    // Refresh metrics
    fetchMetrics()
  }

  const handleEditCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId)
    setCampaignView('edit')
  }

  const handleViewCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId)
    setCampaignView('details')
  }

  const handleSendCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId)
    setCampaignView('send')
  }

  const handleBackToCampaigns = () => {
    setCampaignView('list')
    setSelectedCampaignId(null)
    setActiveSection('campaigns')
  }

  // Mobile navigation (touch-optimized)
  const mobileNavigation = (
    <div className="md:hidden bg-white border rounded-lg p-2 mb-4">
      <select 
        value={activeSection}
        onChange={(e) => setActiveSection(e.target.value as EmailSection)}
        className="w-full p-3 font-body text-foreground bg-white border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
        aria-label="Email marketing sections"
      >
        {emailSections.map(section => (
          <option key={section.id} value={section.id}>
            {section.label}
          </option>
        ))}
      </select>
    </div>
  )

  // Render content based on active section
  const renderContent = () => {
    if (loading) return <LoadingState />
    if (error) return <ErrorState message={error} onRetry={fetchMetrics} />

    switch (activeSection) {
      case 'overview':
        return <OverviewContent metrics={metrics} onCreateCampaign={handleCreateCampaign} />
      case 'campaigns':
        return renderCampaignContent()
      case 'segments':
        return (
          <CustomerSegmentation
            onCreateSegment={() => console.log('Create segment')}
            onEditSegment={(id) => console.log('Edit segment:', id)}
            onViewSegment={(id) => console.log('View segment:', id)}
          />
        )
      case 'triggers':
        return (
          <EmailTriggers
            onCreateTrigger={() => console.log('Create trigger')}
            onEditTrigger={(id) => console.log('Edit trigger:', id)}
            onViewTrigger={(id) => console.log('View trigger:', id)}
          />
        )
      case 'templates':
        return (
          <TemplateManagement
            onCreateTemplate={() => console.log('Create template')}
            onEditTemplate={(id) => console.log('Edit template:', id)}
            onViewTemplate={(id) => console.log('View template:', id)}
          />
        )
      case 'analytics':
        return <AnalyticsReporting />
      default:
        return <PlaceholderContent section="Dashboard" />
    }
  }

  // Render campaign management content
  const renderCampaignContent = () => {
    switch (campaignView) {
      case 'create':
        return (
          <CampaignWizard
            onComplete={handleCampaignCreated}
            onCancel={handleBackToCampaigns}
          />
        )
      case 'details':
        return selectedCampaignId ? (
          <CampaignDetails
            campaignId={selectedCampaignId}
            onBack={handleBackToCampaigns}
            onEdit={handleEditCampaign}
          />
        ) : (
          <CampaignManagement />
        )
      case 'edit':
        return selectedCampaignId ? (
          <CampaignWizard
            campaignId={selectedCampaignId}
            onComplete={handleCampaignCreated}
            onCancel={handleBackToCampaigns}
          />
        ) : (
          <CampaignManagement />
        )
      case 'send':
        return selectedCampaignId ? (
          <SendCampaignInterface
            campaignId={selectedCampaignId}
            onBack={handleBackToCampaigns}
            onComplete={() => handleViewCampaign(selectedCampaignId)}
          />
        ) : (
          <CampaignManagement />
        )
      case 'list':
      default:
        return (
          <CampaignManagement
            onCreateCampaign={handleCreateCampaign}
            onEditCampaign={handleEditCampaign}
            onViewCampaign={handleViewCampaign}
            onSendCampaign={handleSendCampaign}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6 text-foreground bg-background">
        
        {/* Header Section - Typography combination #3: text-foreground bg-white */}
        <div className="text-foreground bg-white p-6 rounded-lg border space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <H1 className="text-foreground">Email Marketing</H1>
              <BodyText className="text-gray-600 bg-white">
                Manage campaigns, segments, and automation
              </BodyText>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="md" onClick={handleCreateCampaign}>
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
              <Button variant="secondary" size="md" onClick={fetchMetrics}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileNavigation}

        {/* Desktop Navigation - Following inventory pattern */}
        <div className="hidden md:block bg-white rounded-lg border">
          <nav 
            className="border-b border-border"
            role="tablist"
            aria-label="Email marketing sections"
          >
            <div className="-mb-px flex space-x-8 px-6">
              {emailSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? 'accent' : 'ghost'}
                    size="md"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'border-b-2 rounded-none py-4',
                      isActive
                        ? 'border-accent'
                        : 'border-transparent hover:border-border'
                    )}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${section.id}`}
                    id={`tab-${section.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </Button>
                )
              })}
            </div>
          </nav>

          {/* Tab Content */}
          <div 
            className="p-6"
            role="tabpanel"
            id={`panel-${activeSection}`}
            aria-labelledby={`tab-${activeSection}`}
          >
            {renderContent()}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden">
          {renderContent()}
        </div>

      </div>
    </div>
  )
}