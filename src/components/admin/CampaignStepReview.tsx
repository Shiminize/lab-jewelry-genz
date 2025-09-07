'use client'

import React from 'react'
import { Eye, Mail, Users, Calendar, Clock, Send, Save } from 'lucide-react'
import { H2, H3, BodyText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'

interface Segment {
  _id: string
  name: string
  description: string
  customerCount: number
  isActive: boolean
}

interface Template {
  _id: string
  name: string
  description: string
  preview: string
  category: string
}

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

interface CampaignStepReviewProps {
  formData: CampaignFormData
  segments: Segment[]
  templates: Template[]
  onSendCampaign: () => void
  onSaveDraft: () => void
  loading?: boolean
  className?: string
}

export function CampaignStepReview({ 
  formData,
  segments,
  templates,
  onSendCampaign,
  onSaveDraft,
  loading = false,
  className 
}: CampaignStepReviewProps) {
  const selectedTemplate = templates.find(t => t._id === formData.template)
  const selectedSegments = segments.filter(s => formData.segments.includes(s._id))
  const totalAudience = selectedSegments.reduce((sum, segment) => sum + segment.customerCount, 0)

  const campaignTypeLabels = {
    'newsletter': 'Newsletter',
    'promotional': 'Promotional',
    'abandoned-cart': 'Abandoned Cart',
    'welcome-series': 'Welcome Series',
    'product-launch': 'Product Launch',
    'seasonal': 'Seasonal'
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="bg-background p-6 rounded-lg border">
        <div className="mb-6">
          <H2 className="text-foreground">Review & Send</H2>
          <BodyText className="text-muted-foreground">
            Review all campaign details before sending or saving as draft.
          </BodyText>
        </div>

        {/* Campaign Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <H3 className="flex items-center gap-2 mb-3 text-foreground">
                <Mail className="w-5 h-5" />
                Campaign Details
              </H3>
              <div className="space-y-2">
                <div>
                  <BodyText size="sm" className="text-muted-foreground">Name:</BodyText>
                  <BodyText className="text-foreground font-medium">{formData.name}</BodyText>
                </div>
                <div>
                  <BodyText size="sm" className="text-muted-foreground">Type:</BodyText>
                  <BodyText className="text-foreground font-medium">
                    {campaignTypeLabels[formData.type]}
                  </BodyText>
                </div>
                <div>
                  <BodyText size="sm" className="text-muted-foreground">Subject:</BodyText>
                  <BodyText className="text-foreground font-medium">{formData.subject}</BodyText>
                </div>
                {formData.preheader && (
                  <div>
                    <BodyText size="sm" className="text-muted-foreground">Preheader:</BodyText>
                    <BodyText className="text-foreground font-medium">{formData.preheader}</BodyText>
                  </div>
                )}
              </div>
            </div>

            {/* Template */}
            <div className="p-4 bg-muted rounded-lg">
              <H3 className="flex items-center gap-2 mb-3 text-foreground">
                <Eye className="w-5 h-5" />
                Template
              </H3>
              {selectedTemplate && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-background rounded flex items-center justify-center">
                    <Mail className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <BodyText className="text-foreground font-medium">{selectedTemplate.name}</BodyText>
                    <BodyText size="sm" className="text-muted-foreground">
                      {selectedTemplate.category}
                    </BodyText>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audience & Schedule */}
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <H3 className="flex items-center gap-2 mb-3 text-foreground">
                <Users className="w-5 h-5" />
                Target Audience
              </H3>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  {totalAudience.toLocaleString()} customers
                </div>
                <BodyText size="sm" className="text-muted-foreground">
                  Across {selectedSegments.length} segment{selectedSegments.length !== 1 ? 's' : ''}:
                </BodyText>
                <div className="space-y-1">
                  {selectedSegments.map(segment => (
                    <div key={segment._id} className="flex justify-between">
                      <BodyText size="sm" className="text-foreground">{segment.name}</BodyText>
                      <BodyText size="sm" className="text-muted-foreground">
                        {segment.customerCount.toLocaleString()}
                      </BodyText>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <H3 className="flex items-center gap-2 mb-3 text-foreground">
                {formData.trigger.type === 'immediate' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
                Send Schedule
              </H3>
              <div>
                {formData.trigger.type === 'immediate' ? (
                  <BodyText className="text-foreground font-medium">Send Immediately</BodyText>
                ) : (
                  <>
                    <BodyText className="text-foreground font-medium">Scheduled Send</BodyText>
                    <BodyText size="sm" className="text-muted-foreground">
                      {formData.trigger.scheduledAt ? 
                        new Date(formData.trigger.scheduledAt).toLocaleString() : 
                        'No date selected'
                      }
                    </BodyText>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="border-t pt-6">
          <H3 className="mb-4 text-foreground">Email Preview</H3>
          <div className="border rounded-lg overflow-hidden">
            {/* Email Header */}
            <div className="bg-muted p-4 border-b">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <BodyText size="sm" className="text-muted-foreground">From: GlowGlitch</BodyText>
                  <BodyText size="sm" className="text-muted-foreground">
                    To: {totalAudience.toLocaleString()} recipients
                  </BodyText>
                </div>
                <BodyText className="font-semibold text-foreground">{formData.subject}</BodyText>
                {formData.preheader && (
                  <BodyText size="sm" className="text-muted-foreground">{formData.preheader}</BodyText>
                )}
              </div>
            </div>
            {/* Email Content Preview */}
            <div className="p-4 bg-background max-h-64 overflow-auto">
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: formData.content.html }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={loading}
            className="min-w-[120px]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          
          <Button
            onClick={onSendCampaign}
            disabled={loading || !formData.name || !formData.subject || formData.segments.length === 0}
            className="min-w-[120px]"
          >
            <Send className="w-4 h-4 mr-2" />
            {formData.trigger.type === 'immediate' ? 'Send Now' : 'Schedule Campaign'}
          </Button>
        </div>
      </div>
    </div>
  )
}