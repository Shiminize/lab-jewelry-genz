'use client'

import React from 'react'
import { Users, AlertCircle, Zap, Calendar } from 'lucide-react'
import { H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

interface Segment {
  _id: string
  name: string
  description: string
  customerCount: number
  isActive: boolean
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

interface CampaignStepAudienceProps {
  formData: CampaignFormData
  onChange: (data: Partial<CampaignFormData>) => void
  errors: string[]
  segments: Segment[]
  className?: string
}

export function CampaignStepAudience({ 
  formData, 
  onChange, 
  errors,
  segments,
  className 
}: CampaignStepAudienceProps) {
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
    <div className={`space-y-6 ${className || ''}`}>
      <div className="bg-background p-6 rounded-lg border">
        <div className="mb-4">
          <H2 className="text-foreground">Audience Targeting</H2>
          <BodyText className="text-muted-foreground">
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
            <BodyText size="sm" className="text-muted-foreground">
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
                  <BodyText size="sm" className="text-muted-foreground">
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
                  <BodyText size="sm" className="text-muted-foreground">
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
                  <BodyText size="sm" className="text-muted-foreground">
                    Choose a specific date and time to send
                  </BodyText>
                </div>
              </div>
            </label>

            {formData.trigger.type === 'scheduled' && (
              <div className="ml-8 mt-3">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Schedule Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.trigger.scheduledAt || ''}
                  onChange={(e) => onChange({ 
                    trigger: { 
                      ...formData.trigger, 
                      scheduledAt: e.target.value 
                    }
                  })}
                  className="px-3 py-2 text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}