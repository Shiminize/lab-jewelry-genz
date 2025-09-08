'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Mail, 
  Users, 
  FileText, 
  Send,
  Eye,
  Settings,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H1, H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Interfaces
interface Template {
  _id: string
  name: string
  description: string
  category: 'marketing' | 'transactional' | 'automation' | 'newsletter'
  type: string
  preview: {
    thumbnail: string
  }
}

interface Segment {
  _id: string
  name: string
  description: string
  customerCount: number
  type: string
}

interface CampaignData {
  name: string
  type: 'newsletter' | 'promotional' | 'abandoned-cart' | 'welcome-series' | 'product-launch' | 'seasonal'
  subject: string
  preheader: string
  template: string
  segments: string[]
  content: {
    html: string
    text: string
  }
  sendOptions: {
    sendImmediately: boolean
    scheduledAt?: Date
    testEmail?: string
  }
}

// Step indicator component
const StepIndicator = ({ 
  currentStep, 
  totalSteps, 
  stepLabels 
}: { 
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}) => (
  <div className="flex items-center justify-between mb-8">
    {stepLabels.map((label, index) => {
      const stepNumber = index + 1
      const isActive = currentStep === stepNumber
      const isCompleted = currentStep > stepNumber
      
      return (
        <div key={stepNumber} className="flex items-center">
          <div className="flex items-center">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2',
              isCompleted 
                ? 'bg-cta text-background border-cta' 
                : isActive 
                  ? 'bg-accent text-foreground border-accent'
                  : 'text-aurora-nav-muted bg-background border-border'
            )}>
              {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
            </div>
            <div className="ml-3 text-sm">
              <div className={cn(
                'font-medium',
                isActive ? 'text-foreground' : 'text-aurora-nav-muted'
              )}>
                {label}
              </div>
            </div>
          </div>
          
          {index < stepLabels.length - 1 && (
            <div className={cn(
              'flex-1 h-0.5 mx-4',
              isCompleted ? 'bg-cta' : 'bg-border'
            )} />
          )}
        </div>
      )
    })}
  </div>
)

// Step 1: Campaign Details
const CampaignDetailsStep = ({ 
  data, 
  onChange, 
  errors 
}: { 
  data: Partial<CampaignData>
  onChange: (updates: Partial<CampaignData>) => void
  errors: Record<string, string>
}) => (
  <div className="space-y-6">
    <div>
      <H2 className="text-foreground mb-2">Campaign Details</H2>
      <BodyText className="text-aurora-nav-muted bg-background">
        Start by giving your campaign a name and selecting the type.
      </BodyText>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Campaign Name *
        </label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Enter campaign name"
          className={cn(
            'w-full px-4 py-3 text-foreground bg-background border rounded-token-lg focus:ring-2 focus:ring-accent focus:border-transparent',
            errors.name ? 'border-red-500' : 'border-border'
          )}
        />
        {errors.name && (
          <BodyText size="sm" className="text-red-600 mt-1">
            {errors.name}
          </BodyText>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Campaign Type *
        </label>
        <select
          value={data.type || ''}
          onChange={(e) => onChange({ type: e.target.value as CampaignData['type'] })}
          className={cn(
            'w-full px-4 py-3 text-foreground bg-background border rounded-token-lg focus:ring-2 focus:ring-accent focus:border-transparent',
            errors.type ? 'border-red-500' : 'border-border'
          )}
        >
          <option value="">Select campaign type</option>
          <option value="newsletter">Newsletter</option>
          <option value="promotional">Promotional</option>
          <option value="welcome-series">Welcome Series</option>
          <option value="abandoned-cart">Abandoned Cart</option>
          <option value="product-launch">Product Launch</option>
          <option value="seasonal">Seasonal</option>
        </select>
        {errors.type && (
          <BodyText size="sm" className="text-red-600 mt-1">
            {errors.type}
          </BodyText>
        )}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        Email Subject Line *
      </label>
      <input
        type="text"
        value={data.subject || ''}
        onChange={(e) => onChange({ subject: e.target.value })}
        placeholder="Enter email subject line"
        className={cn(
          'w-full px-4 py-3 text-foreground bg-background border rounded-token-lg focus:ring-2 focus:ring-accent focus:border-transparent',
          errors.subject ? 'border-red-500' : 'border-border'
        )}
      />
      {errors.subject && (
        <BodyText size="sm" className="text-red-600 mt-1">
          {errors.subject}
        </BodyText>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        Preheader Text
      </label>
      <input
        type="text"
        value={data.preheader || ''}
        onChange={(e) => onChange({ preheader: e.target.value })}
        placeholder="Optional preview text that appears after the subject line"
        className="w-full px-4 py-3 text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:border-transparent"
      />
      <BodyText size="sm" className="text-aurora-nav-muted bg-background mt-1">
        This text appears in email previews alongside your subject line.
      </BodyText>
    </div>
  </div>
)

// Step 2: Content & Template
const ContentTemplateStep = ({ 
  data, 
  onChange, 
  templates, 
  loadingTemplates, 
  errors 
}: { 
  data: Partial<CampaignData>
  onChange: (updates: Partial<CampaignData>) => void
  templates: Template[]
  loadingTemplates: boolean
  errors: Record<string, string>
}) => (
  <div className="space-y-6">
    <div>
      <H2 className="text-foreground mb-2">Content & Template</H2>
      <BodyText className="text-aurora-nav-muted bg-background">
        Choose a template and customize your email content.
      </BodyText>
    </div>

    {/* Template Selection */}
    <div>
      <label className="block text-sm font-medium text-foreground mb-4">
        Email Template *
      </label>
      
      {loadingTemplates ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-token-lg mb-3"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template._id}
              onClick={() => onChange({ template: template._id })}
              className={cn(
                'p-4 rounded-token-lg border-2 cursor-pointer transition-colors',
                data.template === template._id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50'
              )}
            >
              <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                <FileText className="w-8 h-8 text-aurora-nav-muted" />
              </div>
              <H3 className="text-foreground text-sm mb-1">{template.name}</H3>
              <BodyText size="xs" className="text-aurora-nav-muted bg-background">
                {template.description}
              </BodyText>
            </div>
          ))}
        </div>
      )}
      
      {errors.template && (
        <BodyText size="sm" className="text-red-600 mt-2">
          {errors.template}
        </BodyText>
      )}
    </div>

    {/* Content Editor */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          HTML Content
        </label>
        <textarea
          value={data.content?.html || ''}
          onChange={(e) => onChange({ 
            content: { ...data.content, html: e.target.value } 
          })}
          placeholder="Enter HTML content..."
          rows={12}
          className="w-full px-4 py-3 text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:border-transparent font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Plain Text Content
        </label>
        <textarea
          value={data.content?.text || ''}
          onChange={(e) => onChange({ 
            content: { ...data.content, text: e.target.value } 
          })}
          placeholder="Enter plain text content..."
          rows={12}
          className="w-full px-4 py-3 text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>
    </div>
  </div>
)

// Step 3: Audience Targeting
const AudienceTargetingStep = ({ 
  data, 
  onChange, 
  segments, 
  loadingSegments, 
  errors 
}: { 
  data: Partial<CampaignData>
  onChange: (updates: Partial<CampaignData>) => void
  segments: Segment[]
  loadingSegments: boolean
  errors: Record<string, string>
}) => {
  const handleSegmentToggle = (segmentId: string) => {
    const currentSegments = data.segments || []
    const newSegments = currentSegments.includes(segmentId)
      ? currentSegments.filter(id => id !== segmentId)
      : [...currentSegments, segmentId]
    
    onChange({ segments: newSegments })
  }

  return (
    <div className="space-y-6">
      <div>
        <H2 className="text-foreground mb-2">Audience Targeting</H2>
        <BodyText className="text-aurora-nav-muted bg-background">
          Select which customer segments should receive this campaign.
        </BodyText>
      </div>

      {loadingSegments ? (
        <div className="space-y-token-md">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse text-foreground bg-background p-4 rounded-token-lg border">
              <div className="flex items-center justify-between">
                <div className="space-y-token-sm">
                  <div className="h-5 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-48"></div>
                </div>
                <div className="h-6 w-6 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-token-md">
          {segments.map((segment) => (
            <div
              key={segment._id}
              className={cn(
                'text-foreground bg-background p-4 rounded-token-lg border-2 cursor-pointer transition-colors',
                (data.segments || []).includes(segment._id)
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50'
              )}
              onClick={() => handleSegmentToggle(segment._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <H3 className="text-foreground mb-1">{segment.name}</H3>
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background mb-2">
                    {segment.description}
                  </BodyText>
                  <div className="flex items-center gap-4">
                    <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                      {segment.customerCount.toLocaleString()} customers
                    </BodyText>
                    <span className="text-xs px-2 py-1 bg-muted text-aurora-nav-muted rounded">
                      {segment.type}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  'w-6 h-6 rounded border-2 flex items-center justify-center',
                  (data.segments || []).includes(segment._id)
                    ? 'bg-accent border-accent'
                    : 'border-border'
                )}>
                  {(data.segments || []).includes(segment._id) && (
                    <Check className="w-4 h-4 text-foreground" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.segments && (
        <BodyText size="sm" className="text-red-600">
          {errors.segments}
        </BodyText>
      )}

      {/* Summary */}
      {data.segments && data.segments.length > 0 && (
        <div className="text-foreground bg-muted p-4 rounded-token-lg">
          <H3 className="text-foreground mb-2">Campaign Reach</H3>
          <BodyText className="text-foreground">
            This campaign will be sent to{' '}
            <strong>
              {segments
                .filter(s => data.segments!.includes(s._id))
                .reduce((total, s) => total + s.customerCount, 0)
                .toLocaleString()}
            </strong>{' '}
            customers across {data.segments.length} segment{data.segments.length > 1 ? 's' : ''}.
          </BodyText>
        </div>
      )}
    </div>
  )
}

// Step 4: Review & Send
const ReviewSendStep = ({ 
  data, 
  onChange, 
  onSendTest,
  onCreateCampaign 
}: { 
  data: CampaignData
  onChange: (updates: Partial<CampaignData>) => void
  onSendTest: (email: string) => void
  onCreateCampaign: () => void
}) => {
  const [testEmail, setTestEmail] = useState('')

  return (
    <div className="space-y-6">
      <div>
        <H2 className="text-foreground mb-2">Review & Send</H2>
        <BodyText className="text-aurora-nav-muted bg-background">
          Review your campaign details and choose how to proceed.
        </BodyText>
      </div>

      {/* Campaign Summary */}
      <div className="text-foreground bg-background p-6 rounded-token-lg border">
        <H3 className="text-foreground mb-4">Campaign Summary</H3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <BodyText size="sm" className="text-aurora-nav-muted bg-background mb-1">Campaign Name</BodyText>
            <BodyText className="text-foreground">{data.name}</BodyText>
          </div>
          <div>
            <BodyText size="sm" className="text-aurora-nav-muted bg-background mb-1">Campaign Type</BodyText>
            <BodyText className="text-foreground">
              {data.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </BodyText>
          </div>
          <div>
            <BodyText size="sm" className="text-aurora-nav-muted bg-background mb-1">Subject Line</BodyText>
            <BodyText className="text-foreground">{data.subject}</BodyText>
          </div>
          <div>
            <BodyText size="sm" className="text-aurora-nav-muted bg-background mb-1">Recipients</BodyText>
            <BodyText className="text-foreground">{data.segments.length} segment(s) selected</BodyText>
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className="text-foreground bg-background p-6 rounded-token-lg border">
        <H3 className="text-foreground mb-4">Send Test Email</H3>
        <BodyText className="text-aurora-nav-muted bg-background mb-4">
          Send a test email to yourself to preview how it will look.
        </BodyText>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-4 py-2 text-foreground bg-background border border-border rounded-token-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <Button
            variant="secondary"
            size="md"
            onClick={() => onSendTest(testEmail)}
            disabled={!testEmail}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Test
          </Button>
        </div>
      </div>

      {/* Send Options */}
      <div className="text-foreground bg-background p-6 rounded-token-lg border">
        <H3 className="text-foreground mb-4">Send Options</H3>
        <div className="space-y-token-md">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="sendOption"
              checked={data.sendOptions?.sendImmediately !== false}
              onChange={() => onChange({ 
                sendOptions: { ...data.sendOptions, sendImmediately: true } 
              })}
              className="w-4 h-4 text-accent"
            />
            <div>
              <BodyText className="text-foreground">Send immediately</BodyText>
              <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                Campaign will be sent as soon as you click create
              </BodyText>
            </div>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="sendOption"
              checked={data.sendOptions?.sendImmediately === false}
              onChange={() => onChange({ 
                sendOptions: { ...data.sendOptions, sendImmediately: false } 
              })}
              className="w-4 h-4 text-accent"
            />
            <div>
              <BodyText className="text-foreground">Save as draft</BodyText>
              <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                Save campaign to send later
              </BodyText>
            </div>
          </label>
        </div>
      </div>

      {/* Final Actions */}
      <div className="flex justify-center">
        <Button variant="primary" size="lg" onClick={onCreateCampaign}>
          <Mail className="w-5 h-5 mr-2" />
          {data.sendOptions?.sendImmediately !== false ? 'Create & Send Campaign' : 'Save Campaign'}
        </Button>
      </div>
    </div>
  )
}

// Main Campaign Wizard Component
export default function CampaignWizard({ 
  campaignId,
  onClose,
  onCancel, 
  onComplete 
}: { 
  campaignId?: string
  onClose?: () => void
  onCancel?: () => void
  onComplete: (campaign: any) => void
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [campaignData, setCampaignData] = useState<Partial<CampaignData>>({
    sendOptions: { sendImmediately: true }
  })
  const [templates, setTemplates] = useState<Template[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [loadingSegments, setLoadingSegments] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)

  const stepLabels = ['Details', 'Content', 'Audience', 'Review']

  // Fetch templates
  useEffect(() => {
    if (currentStep === 2) {
      setLoadingTemplates(true)
      fetch('/api/admin/email-marketing/templates')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTemplates(data.data.templates || [])
          }
        })
        .finally(() => setLoadingTemplates(false))
    }
  }, [currentStep])

  // Fetch segments
  useEffect(() => {
    if (currentStep === 3) {
      setLoadingSegments(true)
      fetch('/api/admin/email-marketing/segments')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSegments(data.data.segments || [])
          }
        })
        .finally(() => setLoadingSegments(false))
    }
  }, [currentStep])

  // Update campaign data
  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...updates }))
    setErrors({}) // Clear errors when data changes
  }

  // Validate current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!campaignData.name) newErrors.name = 'Campaign name is required'
        if (!campaignData.type) newErrors.type = 'Campaign type is required'
        if (!campaignData.subject) newErrors.subject = 'Subject line is required'
        break
      
      case 2:
        if (!campaignData.template) newErrors.template = 'Please select a template'
        break
      
      case 3:
        if (!campaignData.segments || campaignData.segments.length === 0) {
          newErrors.segments = 'Please select at least one audience segment'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation
  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, stepLabels.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Send test email
  const handleSendTest = async (email: string) => {
    try {
      // TODO: Implement test email sending

    } catch (error) {
      console.error('Failed to send test email:', error)
    }
  }

  // Create campaign
  const handleCreateCampaign = async () => {
    if (!validateStep()) return

    setCreating(true)
    try {
      const response = await fetch('/api/admin/email-marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignData.name,
          type: campaignData.type,
          subject: campaignData.subject,
          template: campaignData.template,
          segments: campaignData.segments,
          content: campaignData.content,
          createdBy: 'admin' // TODO: Get from auth context
        })
      })

      const data = await response.json()

      if (response.ok) {
        onComplete(data.data.campaign)
      } else {
        throw new Error(data.error?.message || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setCreating(false)
    }
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CampaignDetailsStep
            data={campaignData}
            onChange={updateCampaignData}
            errors={errors}
          />
        )
      case 2:
        return (
          <ContentTemplateStep
            data={campaignData}
            onChange={updateCampaignData}
            templates={templates}
            loadingTemplates={loadingTemplates}
            errors={errors}
          />
        )
      case 3:
        return (
          <AudienceTargetingStep
            data={campaignData}
            onChange={updateCampaignData}
            segments={segments}
            loadingSegments={loadingSegments}
            errors={errors}
          />
        )
      case 4:
        return (
          <ReviewSendStep
            data={campaignData as CampaignData}
            onChange={updateCampaignData}
            onSendTest={handleSendTest}
            onCreateCampaign={handleCreateCampaign}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="text-foreground bg-background max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-token-lg">
        {/* Header */}
        <div className="text-foreground bg-background p-6 border-b border-border rounded-t-lg">
          <div className="flex items-center justify-between">
            <H1 className="text-foreground">Create New Campaign</H1>
            <Button variant="ghost" size="sm" onClick={onClose || onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step Indicator */}
          <StepIndicator
            currentStep={currentStep}
            totalSteps={stepLabels.length}
            stepLabels={stepLabels}
          />

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="secondary"
                size="md"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={nextStep}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Loading overlay for final step */}
          {creating && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="text-foreground bg-background p-8 rounded-token-lg text-center">
                <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                <H3 className="text-foreground">Creating Campaign...</H3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}