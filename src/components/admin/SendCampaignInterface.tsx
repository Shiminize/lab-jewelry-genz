'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Send, 
  Calendar,
  Clock,
  Users,
  Mail,
  Eye,
  CheckCircle,
  AlertCircle,
  TestTube,
  Zap,
  Target,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Interfaces
interface Campaign {
  _id: string
  name: string
  type: string
  status: string
  subject: string
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
}

interface Segment {
  _id: string
  name: string
  description: string
  customerCount: number
  isActive: boolean
}

interface SendOptions {
  testMode: boolean
  testEmails: string[]
  sendTime: 'immediate' | 'scheduled'
  scheduledAt?: string
  timezone: string
  throttleRate?: number
  excludeUnsubscribed: boolean
  trackOpens: boolean
  trackClicks: boolean
}

interface SendProgress {
  status: 'preparing' | 'sending' | 'completed' | 'failed'
  sent: number
  total: number
  failed: number
  progress: number
  estimatedTimeRemaining?: number
  errors?: string[]
}

// Test email management component
const TestEmailManager = ({ 
  testEmails, 
  onChange 
}: {
  testEmails: string[]
  onChange: (emails: string[]) => void
}) => {
  const [newEmail, setNewEmail] = useState('')

  const addEmail = () => {
    if (newEmail && !testEmails.includes(newEmail) && isValidEmail(newEmail)) {
      onChange([...testEmails, newEmail])
      setNewEmail('')
    }
  }

  const removeEmail = (email: string) => {
    onChange(testEmails.filter(e => e !== email))
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Enter test email address..."
          className="flex-1 px-3 py-2 font-body text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          onKeyPress={(e) => e.key === 'Enter' && addEmail()}
        />
        <Button 
          variant="secondary" 
          size="md" 
          onClick={addEmail}
          disabled={!newEmail || !isValidEmail(newEmail) || testEmails.includes(newEmail)}
        >
          Add
        </Button>
      </div>

      {testEmails.length > 0 && (
        <div className="space-y-2">
          <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background">
            Test Recipients ({testEmails.length})
          </BodyText>
          <div className="space-y-1">
            {testEmails.map(email => (
              <div key={email} className="flex items-center justify-between p-2 bg-muted rounded">
                <BodyText size="sm" className="text-foreground">
                  {email}
                </BodyText>
                <button
                  onClick={() => removeEmail(email)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Send progress component
const SendProgressDisplay = ({ 
  progress 
}: { 
  progress: SendProgress 
}) => {
  const getStatusConfig = (status: SendProgress['status']) => {
    switch (status) {
      case 'preparing':
        return {
          icon: Settings,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          text: 'Preparing to send...'
        }
      case 'sending':
        return {
          icon: Send,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          text: 'Sending in progress...'
        }
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          text: 'Send completed successfully'
        }
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          text: 'Send failed'
        }
    }
  }

  const config = getStatusConfig(progress.status)
  const Icon = config.icon

  return (
    <div className={cn(
      'p-6 rounded-lg border',
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={cn('w-6 h-6', config.color)} />
        <H3 className="text-foreground">{config.text}</H3>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <BodyText size="sm" className="text-foreground">
            Progress: {progress.sent} of {progress.total} sent
          </BodyText>
          <BodyText size="sm" className="text-foreground">
            {progress.progress.toFixed(1)}%
          </BodyText>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">
            {progress.sent}
          </div>
          <BodyText size="sm" className="text-aurora-nav-muted">
            Sent
          </BodyText>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">
            {progress.total - progress.sent - progress.failed}
          </div>
          <BodyText size="sm" className="text-aurora-nav-muted">
            Remaining
          </BodyText>
        </div>
        <div className="text-center">
          <div className={cn(
            "text-lg font-bold",
            progress.failed > 0 ? "text-red-600" : "text-foreground"
          )}>
            {progress.failed}
          </div>
          <BodyText size="sm" className="text-aurora-nav-muted">
            Failed
          </BodyText>
        </div>
      </div>

      {/* Time Estimate */}
      {progress.estimatedTimeRemaining && progress.status === 'sending' && (
        <BodyText size="sm" className="text-aurora-nav-muted mb-4">
          Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining / 60)} minutes
        </BodyText>
      )}

      {/* Errors */}
      {progress.errors && progress.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <BodyText size="sm" className="font-medium text-red-800 mb-2">
            Errors encountered:
          </BodyText>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {progress.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Main Send Campaign Interface Component
export default function SendCampaignInterface({ 
  campaignId, 
  onBack, 
  onComplete 
}: {
  campaignId: string
  onBack: () => void
  onComplete: () => void
}) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState<SendProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [sendOptions, setSendOptions] = useState<SendOptions>({
    testMode: false,
    testEmails: [],
    sendTime: 'immediate',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    excludeUnsubscribed: true,
    trackOpens: true,
    trackClicks: true
  })

  // Fetch campaign data
  useEffect(() => {
    const fetchData = async () => {
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
          const campaignSegments = segmentsData.data.segments.filter((s: Segment) =>
            campaignData.data.campaign.segments.includes(s._id)
          )
          setSegments(campaignSegments)
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaign')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [campaignId])

  // Send test email
  const sendTestEmail = async () => {
    if (sendOptions.testEmails.length === 0) {
      alert('Please add at least one test email address')
      return
    }

    try {
      setSending(true)

      const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testMode: true,
          testEmails: sendOptions.testEmails,
          trackOpens: sendOptions.trackOpens,
          trackClicks: sendOptions.trackClicks
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send test email')
      }

      alert(`Test email sent successfully to ${sendOptions.testEmails.length} recipient(s)`)

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send test email')
    } finally {
      setSending(false)
    }
  }

  // Send campaign
  const sendCampaign = async () => {
    if (!confirm(
      sendOptions.sendTime === 'immediate' 
        ? 'Are you sure you want to send this campaign immediately?' 
        : 'Are you sure you want to schedule this campaign?'
    )) {
      return
    }

    try {
      setSending(true)
      setSendProgress({
        status: 'preparing',
        sent: 0,
        total: totalAudience,
        failed: 0,
        progress: 0
      })

      const response = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testMode: false,
          sendTime: sendOptions.sendTime,
          scheduledAt: sendOptions.scheduledAt,
          timezone: sendOptions.timezone,
          throttleRate: sendOptions.throttleRate,
          excludeUnsubscribed: sendOptions.excludeUnsubscribed,
          trackOpens: sendOptions.trackOpens,
          trackClicks: sendOptions.trackClicks
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send campaign')
      }

      // Simulate progress updates (in real implementation, this would come from webhooks/polling)
      if (sendOptions.sendTime === 'immediate') {
        simulateProgress()
      } else {
        setSendProgress({
          status: 'completed',
          sent: 0,
          total: totalAudience,
          failed: 0,
          progress: 100
        })
        setTimeout(() => {
          onComplete()
        }, 2000)
      }

    } catch (error) {
      setSendProgress({
        status: 'failed',
        sent: 0,
        total: totalAudience,
        failed: totalAudience,
        progress: 0,
        errors: [error instanceof Error ? error.message : 'Failed to send campaign']
      })
    } finally {
      setSending(false)
    }
  }

  // Simulate sending progress (replace with real progress tracking)
  const simulateProgress = () => {
    let sent = 0
    const total = totalAudience
    const interval = setInterval(() => {
      sent += Math.floor(Math.random() * 50) + 10
      if (sent >= total) {
        sent = total
        setSendProgress({
          status: 'completed',
          sent,
          total,
          failed: 0,
          progress: 100
        })
        clearInterval(interval)
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        const progress = (sent / total) * 100
        const estimatedTimeRemaining = ((total - sent) / (sent / 10)) * 1000 // rough estimate
        setSendProgress({
          status: 'sending',
          sent,
          total,
          failed: 0,
          progress,
          estimatedTimeRemaining
        })
      }
    }, 1000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-foreground bg-background p-8 rounded-lg border text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <H2 className="mb-2 text-foreground">Failed to Load Campaign</H2>
            <BodyText className="text-aurora-nav-muted bg-background mb-6">
              {error || 'Campaign not found'}
            </BodyText>
            <Button variant="primary" size="md" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              Back to Campaign
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalAudience = segments.reduce((sum, segment) => sum + segment.customerCount, 0)

  // If sending is in progress, show progress interface
  if (sendProgress) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div>
              <H1 className="text-foreground">Sending: {campaign.name}</H1>
              <BodyText className="text-aurora-nav-muted bg-background">
                Campaign send in progress
              </BodyText>
            </div>
          </div>

          <SendProgressDisplay progress={sendProgress} />

          {sendProgress.status === 'completed' && (
            <div className="text-center">
              <Button variant="primary" size="lg" onClick={onComplete}>
                <CheckCircle className="w-5 h-5" />
                View Campaign Details
              </Button>
            </div>
          )}

          {sendProgress.status === 'failed' && (
            <div className="text-center">
              <Button variant="outline" size="lg" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
                Back to Campaign
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="md" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to Campaign
          </Button>
          <div>
            <H1 className="text-foreground">Send Campaign: {campaign.name}</H1>
            <BodyText className="text-aurora-nav-muted bg-background">
              Configure send options and launch your email campaign
            </BodyText>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Send Mode */}
            <div className="text-foreground bg-background p-6 rounded-lg border">
              <H2 className="mb-4 text-foreground">Send Mode</H2>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="testMode"
                    checked={!sendOptions.testMode}
                    onChange={() => setSendOptions({ ...sendOptions, testMode: false })}
                    className="mt-1"
                  />
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium text-foreground">Live Campaign</div>
                      <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                        Send to all selected audience segments
                      </BodyText>
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="testMode"
                    checked={sendOptions.testMode}
                    onChange={() => setSendOptions({ ...sendOptions, testMode: true })}
                    className="mt-1"
                  />
                  <div className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium text-foreground">Test Mode</div>
                      <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                        Send test emails to specific addresses
                      </BodyText>
                    </div>
                  </div>
                </label>
              </div>

              {/* Test Email Configuration */}
              {sendOptions.testMode && (
                <div className="mt-6 pt-6 border-t border-border">
                  <H3 className="mb-4 text-foreground">Test Email Recipients</H3>
                  <TestEmailManager
                    testEmails={sendOptions.testEmails}
                    onChange={(emails) => setSendOptions({ ...sendOptions, testEmails: emails })}
                  />
                </div>
              )}
            </div>

            {/* Send Timing */}
            {!sendOptions.testMode && (
              <div className="text-foreground bg-background p-6 rounded-lg border">
                <H2 className="mb-4 text-foreground">Send Timing</H2>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sendTime"
                      value="immediate"
                      checked={sendOptions.sendTime === 'immediate'}
                      onChange={(e) => setSendOptions({ ...sendOptions, sendTime: e.target.value as any })}
                      className="mt-1"
                    />
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-accent" />
                      <div>
                        <div className="font-medium text-foreground">Send Immediately</div>
                        <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                          Start sending right after confirmation
                        </BodyText>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sendTime"
                      value="scheduled"
                      checked={sendOptions.sendTime === 'scheduled'}
                      onChange={(e) => setSendOptions({ ...sendOptions, sendTime: e.target.value as any })}
                      className="mt-1"
                    />
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-accent" />
                      <div>
                        <div className="font-medium text-foreground">Schedule for Later</div>
                        <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                          Choose a specific date and time
                        </BodyText>
                      </div>
                    </div>
                  </label>
                </div>

                {sendOptions.sendTime === 'scheduled' && (
                  <div className="mt-6 pt-6 border-t border-border space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Scheduled Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={sendOptions.scheduledAt || ''}
                        onChange={(e) => setSendOptions({ ...sendOptions, scheduledAt: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                        className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Timezone
                      </label>
                      <select
                        value={sendOptions.timezone}
                        onChange={(e) => setSendOptions({ ...sendOptions, timezone: e.target.value })}
                        className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Options */}
            <div className="text-foreground bg-background p-6 rounded-lg border">
              <H2 className="mb-4 text-foreground">Send Options</H2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendOptions.excludeUnsubscribed}
                    onChange={(e) => setSendOptions({ ...sendOptions, excludeUnsubscribed: e.target.checked })}
                  />
                  <div>
                    <div className="font-medium text-foreground">Exclude Unsubscribed</div>
                    <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                      Automatically exclude unsubscribed users
                    </BodyText>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendOptions.trackOpens}
                    onChange={(e) => setSendOptions({ ...sendOptions, trackOpens: e.target.checked })}
                  />
                  <div>
                    <div className="font-medium text-foreground">Track Opens</div>
                    <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                      Track when emails are opened
                    </BodyText>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendOptions.trackClicks}
                    onChange={(e) => setSendOptions({ ...sendOptions, trackClicks: e.target.checked })}
                  />
                  <div>
                    <div className="font-medium text-foreground">Track Clicks</div>
                    <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                      Track when links are clicked
                    </BodyText>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Summary */}
            <div className="text-foreground bg-background p-6 rounded-lg border">
              <H3 className="mb-4 text-foreground">Campaign Summary</H3>
              
              <div className="space-y-4">
                <div>
                  <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                    Campaign Name
                  </BodyText>
                  <div className="text-foreground font-medium">{campaign.name}</div>
                </div>

                <div>
                  <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                    Subject Line
                  </BodyText>
                  <div className="text-foreground font-medium">{campaign.subject}</div>
                </div>

                <div>
                  <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-1">
                    Campaign Type
                  </BodyText>
                  <div className="text-foreground font-medium capitalize">
                    {campaign.type.replace('-', ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Summary */}
            <div className="text-foreground bg-background p-6 rounded-lg border">
              <H3 className="mb-4 text-foreground">Target Audience</H3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {sendOptions.testMode ? sendOptions.testEmails.length : totalAudience.toLocaleString()}
                  </div>
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    {sendOptions.testMode ? 'Test recipients' : 'Total recipients'}
                  </BodyText>
                </div>
              </div>

              {!sendOptions.testMode && (
                <div className="space-y-2">
                  {segments.map(segment => (
                    <div key={segment._id} className="flex justify-between items-center text-sm">
                      <span className="text-foreground">{segment.name}</span>
                      <span className="text-aurora-nav-muted">{segment.customerCount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email Preview */}
            <div className="text-foreground bg-background p-6 rounded-lg border">
              <H3 className="mb-4 text-foreground">Email Preview</H3>
              
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted p-3 border-b border-border">
                  <div className="text-sm font-medium">{campaign.subject}</div>
                  {campaign.content.preheader && (
                    <div className="text-xs text-aurora-nav-muted mt-1">
                      {campaign.content.preheader}
                    </div>
                  )}
                </div>
                <div className="p-3 max-h-32 overflow-auto bg-background">
                  <div 
                    className="text-xs"
                    dangerouslySetInnerHTML={{ __html: campaign.content.html }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {sendOptions.testMode ? (
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full"
                  onClick={sendTestEmail}
                  disabled={sending || sendOptions.testEmails.length === 0}
                >
                  <TestTube className="w-5 h-5" />
                  Send Test Email
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full"
                  onClick={sendCampaign}
                  disabled={sending || (sendOptions.sendTime === 'scheduled' && !sendOptions.scheduledAt)}
                >
                  {sendOptions.sendTime === 'immediate' ? (
                    <>
                      <Send className="w-5 h-5" />
                      Send Campaign Now
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Schedule Campaign
                    </>
                  )}
                </Button>
              )}

              <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}