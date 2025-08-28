'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Send, 
  Eye, 
  Users, 
  Mail, 
  FileText, 
  Target,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// Wizard steps
const wizardSteps = [
  { id: 'details', label: 'Campaign Details', icon: FileText },
  { id: 'content', label: 'Content & Template', icon: Mail },
  { id: 'targeting', label: 'Audience Targeting', icon: Target },
  { id: 'review', label: 'Review & Send', icon: CheckCircle }
] as const

type WizardStep = typeof wizardSteps[number]['id']

// Campaign form data interface
interface CampaignFormData {
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
  trigger: {
    type: 'immediate' | 'scheduled'
    scheduledAt?: string
  }
}

// Segment interface
interface Segment {
  _id: string
  name: string
  description: string
  customerCount: number
  isActive: boolean
}

// Template interface
interface Template {
  _id: string
  name: string
  description: string
  preview: string
  category: string
}

// Step progress indicator
const StepProgress = ({ 
  currentStep, 
  completedSteps,
  onStepClick 
}: {
  currentStep: WizardStep
  completedSteps: Set<WizardStep>
  onStepClick: (step: WizardStep) => void
}) => {
  const currentIndex = wizardSteps.findIndex(step => step.id === currentStep)

  return (
    <div className="text-foreground bg-background p-6 rounded-lg border">
      <div className="flex items-center justify-between">
        {wizardSteps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = completedSteps.has(step.id)
          const isCurrent = step.id === currentStep
          const isAccessible = index <= currentIndex || isCompleted

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={!isAccessible}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  isCompleted && 'bg-green-100 text-green-800 border-2 border-green-200',
                  isCurrent && !isCompleted && 'bg-accent text-background border-2 border-accent',
                  !isCurrent && !isCompleted && isAccessible && 'bg-muted text-aurora-nav-muted border-2 border-border hover:bg-muted',
                  !isAccessible && 'bg-muted text-aurora-nav-muted border-2 border-border cursor-not-allowed'
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </button>

              {index < wizardSteps.length - 1 && (
                <div className={cn(
                  'w-16 h-0.5 mx-4',
                  (isCompleted || (index < currentIndex)) ? 'bg-green-200' : 'bg-muted'
                )} />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <H3 className="text-foreground">
          {wizardSteps.find(step => step.id === currentStep)?.label}
        </H3>
        <BodyText size="sm" className="text-aurora-nav-muted bg-background">
          Step {currentIndex + 1} of {wizardSteps.length}
        </BodyText>
      </div>
    </div>
  )
}

// Form validation helper
const validateStep = (step: WizardStep, formData: CampaignFormData): string[] => {
  const errors: string[] = []

  switch (step) {
    case 'details':
      if (!formData.name.trim()) errors.push('Campaign name is required')
      if (!formData.subject.trim()) errors.push('Subject line is required')
      if (!formData.type) errors.push('Campaign type is required')
      break
    case 'content':
      if (!formData.template) errors.push('Template selection is required')
      if (!formData.content.html.trim()) errors.push('Email content is required')
      break
    case 'targeting':
      if (formData.segments.length === 0) errors.push('At least one audience segment is required')
      break
    case 'review':
      // No additional validation needed for review step
      break
  }

  return errors
}

// Campaign Details Step
const DetailsStep = ({ 
  formData, 
  onChange, 
  errors 
}: {
  formData: CampaignFormData
  onChange: (data: Partial<CampaignFormData>) => void
  errors: string[]
}) => {
  const campaignTypes = [
    { value: 'newsletter', label: 'Newsletter', description: 'Regular updates and news' },
    { value: 'promotional', label: 'Promotional', description: 'Sales and special offers' },
    { value: 'abandoned-cart', label: 'Abandoned Cart', description: 'Recover abandoned purchases' },
    { value: 'welcome-series', label: 'Welcome Series', description: 'New customer onboarding' },
    { value: 'product-launch', label: 'Product Launch', description: 'New product announcements' },
    { value: 'seasonal', label: 'Seasonal', description: 'Holiday and seasonal campaigns' }
  ]

  return (
    <div className="text-foreground bg-background p-6 rounded-lg border space-y-6">
      <div>
        <H2 className="mb-4 text-foreground">Campaign Details</H2>
        <BodyText className="text-aurora-nav-muted bg-background">
          Set up the basic information for your email campaign.
        </BodyText>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <BodyText size="sm" className="font-medium text-red-800">
              Please fix the following errors:
            </BodyText>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Enter campaign name..."
            className="w-full px-3 py-2 font-body text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          />
        </div>

        {/* Campaign Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Campaign Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaignTypes.map(type => (
              <label
                key={type.value}
                className={cn(
                  'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                  formData.type === type.value
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50'
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) => onChange({ type: e.target.value as any })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-foreground">{type.label}</div>
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    {type.description}
                  </BodyText>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Subject Line *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            placeholder="Enter email subject line..."
            className="w-full px-3 py-2 font-body text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          />
          <BodyText size="sm" className="text-aurora-nav-muted bg-background mt-1">
            Keep it under 50 characters for better open rates
          </BodyText>
        </div>

        {/* Preheader */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Preheader Text
          </label>
          <input
            type="text"
            value={formData.preheader}
            onChange={(e) => onChange({ preheader: e.target.value })}
            placeholder="Preview text that appears after subject line..."
            className="w-full px-3 py-2 font-body text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          />
          <BodyText size="sm" className="text-aurora-nav-muted bg-background mt-1">
            This text appears in email previews (optional)
          </BodyText>
        </div>
      </div>
    </div>
  )
}

// Content & Template Step
const ContentStep = ({ 
  formData, 
  onChange, 
  errors,
  templates 
}: {
  formData: CampaignFormData
  onChange: (data: Partial<CampaignFormData>) => void
  errors: string[]
  templates: Template[]
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    templates.find(t => t._id === formData.template) || null
  )

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    onChange({ 
      template: template._id,
      content: {
        ...formData.content,
        html: template.preview // Load template HTML
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-foreground bg-background p-6 rounded-lg border">
        <div className="mb-4">
          <H2 className="text-foreground">Content & Template</H2>
          <BodyText className="text-aurora-nav-muted bg-background">
            Choose a template and customize your email content.
          </BodyText>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <BodyText size="sm" className="font-medium text-red-800">
                Please fix the following errors:
              </BodyText>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Email Template *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template._id}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer transition-colors',
                  selectedTemplate?._id === template._id
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50'
                )}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-aurora-nav-muted" />
                </div>
                <H3 className="text-sm font-medium text-foreground mb-1">
                  {template.name}
                </H3>
                <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                  {template.description}
                </BodyText>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs bg-muted text-foreground rounded">
                    {template.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Editor */}
      {selectedTemplate && (
        <div className="text-foreground bg-background p-6 rounded-lg border">
          <H3 className="mb-4 text-foreground">Email Content</H3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HTML Editor */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                HTML Content *
              </label>
              <textarea
                value={formData.content.html}
                onChange={(e) => onChange({ 
                  content: { ...formData.content, html: e.target.value }
                })}
                placeholder="Enter HTML content..."
                className="w-full h-64 px-3 py-2 font-mono text-sm text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
              />
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Preview
              </label>
              <div className="h-64 border border-border rounded-lg overflow-auto bg-background">
                <div 
                  className="p-4 text-sm"
                  dangerouslySetInnerHTML={{ __html: formData.content.html }}
                />
              </div>
            </div>
          </div>

          {/* Text Version */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Plain Text Version
            </label>
            <textarea
              value={formData.content.text}
              onChange={(e) => onChange({ 
                content: { ...formData.content, text: e.target.value }
              })}
              placeholder="Plain text version (auto-generated if empty)..."
              className="w-full h-32 px-3 py-2 font-mono text-sm text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
            />
            <BodyText size="sm" className="text-aurora-nav-muted bg-background mt-1">
              Plain text version for email clients that don't support HTML
            </BodyText>
          </div>
        </div>
      )}
    </div>
  )
}

// Audience Targeting Step
const TargetingStep = ({ 
  formData, 
  onChange, 
  errors,
  segments 
}: {
  formData: CampaignFormData
  onChange: (data: Partial<CampaignFormData>) => void
  errors: string[]
  segments: Segment[]
}) => {
  const handleSegmentToggle = (segmentId: string) => {
    const currentSegments = formData.segments
    const updatedSegments = currentSegments.includes(segmentId)
      ? currentSegments.filter(id => id !== segmentId)
      : [...currentSegments, segmentId]
    
    onChange({ segments: updatedSegments })
  }

  const selectedSegments = segments.filter(s => formData.segments.includes(s._id))
  const totalAudience = selectedSegments.reduce((sum, segment) => sum + segment.customerCount, 0)

  return (
    <div className="space-y-6">
      <div className="text-foreground bg-background p-6 rounded-lg border">
        <div className="mb-4">
          <H2 className="text-foreground">Audience Targeting</H2>
          <BodyText className="text-aurora-nav-muted bg-background">
            Select customer segments to target with this campaign.
          </BodyText>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <BodyText size="sm" className="font-medium text-red-800">
                Please fix the following errors:
              </BodyText>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Audience Summary */}
        {selectedSegments.length > 0 && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-accent" />
              <H3 className="text-foreground">Selected Audience</H3>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {totalAudience.toLocaleString()} customers
            </div>
            <BodyText size="sm" className="text-aurora-nav-muted bg-accent/5">
              Across {selectedSegments.length} segment{selectedSegments.length !== 1 ? 's' : ''}
            </BodyText>
          </div>
        )}

        {/* Segment Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Customer Segments *
          </label>
          <div className="space-y-3">
            {segments.map(segment => (
              <label
                key={segment._id}
                className={cn(
                  'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                  formData.segments.includes(segment._id)
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50',
                  !segment.isActive && 'opacity-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={formData.segments.includes(segment._id)}
                  onChange={() => handleSegmentToggle(segment._id)}
                  disabled={!segment.isActive}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <H3 className="text-foreground">{segment.name}</H3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {segment.customerCount.toLocaleString()} customers
                      </span>
                      {!segment.isActive && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    {segment.description}
                  </BodyText>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Send Options */}
        <div className="mt-6 pt-6 border-t border-border">
          <H3 className="mb-4 text-foreground">Send Options</H3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="triggerType"
                value="immediate"
                checked={formData.trigger.type === 'immediate'}
                onChange={(e) => onChange({ 
                  trigger: { type: 'immediate' }
                })}
              />
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                <div>
                  <div className="font-medium text-foreground">Send Immediately</div>
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    Send the campaign right after review
                  </BodyText>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="triggerType"
                value="scheduled"
                checked={formData.trigger.type === 'scheduled'}
                onChange={(e) => onChange({ 
                  trigger: { ...formData.trigger, type: 'scheduled' }
                })}
              />
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                <div>
                  <div className="font-medium text-foreground">Schedule for Later</div>
                  <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                    Choose a specific date and time to send
                  </BodyText>
                </div>
              </div>
            </label>
          </div>

          {formData.trigger.type === 'scheduled' && (
            <div className="mt-4 ml-8">
              <label className="block text-sm font-medium text-foreground mb-2">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.trigger.scheduledAt || ''}
                onChange={(e) => onChange({ 
                  trigger: { ...formData.trigger, scheduledAt: e.target.value }
                })}
                className="px-3 py-2 font-body text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Review & Send Step
const ReviewStep = ({ 
  formData, 
  segments,
  templates,
  onSaveDraft,
  onSendCampaign 
}: {
  formData: CampaignFormData
  segments: Segment[]
  templates: Template[]
  onSaveDraft: () => void
  onSendCampaign: () => void
}) => {
  const selectedSegments = segments.filter(s => formData.segments.includes(s._id))
  const selectedTemplate = templates.find(t => t._id === formData.template)
  const totalAudience = selectedSegments.reduce((sum, segment) => sum + segment.customerCount, 0)

  return (
    <div className="space-y-6">
      <div className="text-foreground bg-background p-6 rounded-lg border">
        <div className="mb-6">
          <H2 className="text-foreground">Review & Send</H2>
          <BodyText className="text-aurora-nav-muted bg-background">
            Review your campaign details before sending.
          </BodyText>
        </div>

        {/* Campaign Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <div>
              <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background">
                Campaign Name
              </BodyText>
              <div className="text-foreground font-medium">{formData.name}</div>
            </div>

            <div>
              <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background">
                Type
              </BodyText>
              <div className="text-foreground font-medium capitalize">
                {formData.type.replace('-', ' ')}
              </div>
            </div>

            <div>
              <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background">
                Subject Line
              </BodyText>
              <div className="text-foreground font-medium">{formData.subject}</div>
            </div>

            {formData.preheader && (
              <div>
                <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background">
                  Preheader
                </BodyText>
                <div className="text-foreground font-medium">{formData.preheader}</div>
              </div>
            )}
          </div>

          {/* Audience & Template */}
          <div className="space-y-4">
            <div>
              <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background">
                Template
              </BodyText>
              <div className="text-foreground font-medium">
                {selectedTemplate?.name || 'Unknown Template'}
              </div>
            </div>

            <div>
              <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background">
                Target Audience
              </BodyText>
              <div className="text-foreground font-medium">
                {totalAudience.toLocaleString()} customers
              </div>
              <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                Across {selectedSegments.length} segment{selectedSegments.length !== 1 ? 's' : ''}
              </BodyText>
            </div>

            <div>
              <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background">
                Send Method
              </BodyText>
              <div className="text-foreground font-medium">
                {formData.trigger.type === 'immediate' ? 'Send Immediately' : 'Scheduled'}
              </div>
              {formData.trigger.type === 'scheduled' && formData.trigger.scheduledAt && (
                <BodyText size="sm" className="text-aurora-nav-muted bg-background">
                  {new Date(formData.trigger.scheduledAt).toLocaleString()}
                </BodyText>
              )}
            </div>
          </div>
        </div>

        {/* Selected Segments */}
        <div className="mb-6">
          <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-3">
            Selected Segments
          </BodyText>
          <div className="space-y-2">
            {selectedSegments.map(segment => (
              <div key={segment._id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-foreground">{segment.name}</div>
                  <BodyText size="sm" className="text-aurora-nav-muted bg-muted">
                    {segment.description}
                  </BodyText>
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
        <div>
          <BodyText size="sm" className="font-medium text-aurora-nav-muted bg-background mb-3">
            Email Preview
          </BodyText>
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Email Header */}
            <div className="bg-muted p-4 border-b border-border">
              <div className="text-sm">
                <strong>Subject:</strong> {formData.subject}
              </div>
              {formData.preheader && (
                <div className="text-sm text-aurora-nav-muted mt-1">
                  {formData.preheader}
                </div>
              )}
            </div>
            
            {/* Email Content */}
            <div className="p-4 max-h-64 overflow-auto bg-background">
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: formData.content.html }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
          <Button variant="secondary" size="md" onClick={onSaveDraft} className="flex-1">
            <Save className="w-4 h-4" />
            Save as Draft
          </Button>
          
          {formData.trigger.type === 'immediate' ? (
            <Button variant="primary" size="md" onClick={onSendCampaign} className="flex-1">
              <Send className="w-4 h-4" />
              Send Campaign Now
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={onSendCampaign} className="flex-1">
              <Calendar className="w-4 h-4" />
              Schedule Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Campaign Wizard Component
export default function CampaignWizard({ 
  onComplete, 
  onCancel 
}: {
  onComplete: (campaign: any) => void
  onCancel: () => void
}) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('details')
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set())
  const [loading, setLoading] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])
  const [templates, setTemplates] = useState<Template[]>([])

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    type: 'newsletter',
    subject: '',
    preheader: '',
    template: '',
    segments: [],
    content: {
      html: '',
      text: ''
    },
    trigger: {
      type: 'immediate'
    }
  })

  // Load segments and templates
  useEffect(() => {
    const loadData = async () => {
      try {
        const [segmentsRes, templatesRes] = await Promise.all([
          fetch('/api/admin/email-marketing/segments'),
          fetch('/api/admin/email-marketing/templates')
        ])

        const segmentsData = await segmentsRes.json()
        const templatesData = await templatesRes.json()

        if (segmentsData.success) {
          setSegments(segmentsData.data.segments || [])
        }

        if (templatesData.success) {
          setTemplates(templatesData.data.templates || [])
        }
      } catch (error) {
        console.error('Failed to load wizard data:', error)
      }
    }

    loadData()
  }, [])

  // Update form data
  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // Validate current step
  const validateCurrentStep = () => {
    return validateStep(currentStep, formData)
  }

  // Go to next step
  const goToNextStep = () => {
    const errors = validateCurrentStep()
    if (errors.length > 0) return

    setCompletedSteps(prev => new Set([...prev, currentStep]))
    
    const currentIndex = wizardSteps.findIndex(step => step.id === currentStep)
    if (currentIndex < wizardSteps.length - 1) {
      setCurrentStep(wizardSteps[currentIndex + 1].id)
    }
  }

  // Go to previous step
  const goToPreviousStep = () => {
    const currentIndex = wizardSteps.findIndex(step => step.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(wizardSteps[currentIndex - 1].id)
    }
  }

  // Jump to step
  const goToStep = (step: WizardStep) => {
    setCurrentStep(step)
  }

  // Save as draft
  const saveDraft = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/email-marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'draft'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to save campaign')
      }

      onComplete(result.data.campaign)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  // Send campaign
  const sendCampaign = async () => {
    try {
      setLoading(true)

      // Create campaign first
      const createResponse = await fetch('/api/admin/email-marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: formData.trigger.type === 'immediate' ? 'active' : 'scheduled'
        })
      })

      const createResult = await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(createResult.error?.message || 'Failed to create campaign')
      }

      // Send campaign if immediate
      if (formData.trigger.type === 'immediate') {
        const sendResponse = await fetch(
          `/api/admin/email-marketing/campaigns/${createResult.data.campaign._id}/send`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testMode: false })
          }
        )

        const sendResult = await sendResponse.json()

        if (!sendResponse.ok) {
          throw new Error(sendResult.error?.message || 'Failed to send campaign')
        }
      }

      onComplete(createResult.data.campaign)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send campaign')
    } finally {
      setLoading(false)
    }
  }

  // Render current step
  const renderCurrentStep = () => {
    const errors = validateCurrentStep()

    switch (currentStep) {
      case 'details':
        return (
          <DetailsStep
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )
      case 'content':
        return (
          <ContentStep
            formData={formData}
            onChange={updateFormData}
            errors={errors}
            templates={templates}
          />
        )
      case 'targeting':
        return (
          <TargetingStep
            formData={formData}
            onChange={updateFormData}
            errors={errors}
            segments={segments}
          />
        )
      case 'review':
        return (
          <ReviewStep
            formData={formData}
            segments={segments}
            templates={templates}
            onSaveDraft={saveDraft}
            onSendCampaign={sendCampaign}
          />
        )
      default:
        return null
    }
  }

  const currentIndex = wizardSteps.findIndex(step => step.id === currentStep)
  const canGoNext = currentIndex < wizardSteps.length - 1
  const canGoPrevious = currentIndex > 0
  const errors = validateCurrentStep()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="md" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Button>
            <div>
              <H2 className="text-foreground">Create Email Campaign</H2>
              <BodyText className="text-aurora-nav-muted bg-background">
                Set up your email marketing campaign step by step
              </BodyText>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <StepProgress
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />

        {/* Step Content */}
        {renderCurrentStep()}

        {/* Navigation */}
        {currentStep !== 'review' && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="md"
              onClick={goToPreviousStep}
              disabled={!canGoPrevious}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={goToNextStep}
              disabled={!canGoNext || errors.length > 0}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="text-foreground bg-background p-6 rounded-lg border text-center">
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
              <BodyText className="text-foreground">
                {currentStep === 'review' ? 'Processing campaign...' : 'Saving...'}
              </BodyText>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}