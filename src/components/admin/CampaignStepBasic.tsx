'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { H2, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

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

interface CampaignStepBasicProps {
  formData: CampaignFormData
  onChange: (data: Partial<CampaignFormData>) => void
  errors: string[]
  className?: string
}

const campaignTypes = [
  { value: 'newsletter', label: 'Newsletter', description: 'Regular updates and news' },
  { value: 'promotional', label: 'Promotional', description: 'Sales and special offers' },
  { value: 'abandoned-cart', label: 'Abandoned Cart', description: 'Recover abandoned purchases' },
  { value: 'welcome-series', label: 'Welcome Series', description: 'New customer onboarding' },
  { value: 'product-launch', label: 'Product Launch', description: 'New product announcements' },
  { value: 'seasonal', label: 'Seasonal', description: 'Holiday and seasonal campaigns' }
]

export function CampaignStepBasic({ 
  formData, 
  onChange, 
  errors,
  className 
}: CampaignStepBasicProps) {
  return (
    <div className={`bg-background p-6 rounded-lg border space-y-6 ${className || ''}`}>
      <div>
        <H2 className="mb-4 text-foreground">Campaign Details</H2>
        <BodyText className="text-muted-foreground">
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

      <div className="space-y-6">
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
            className="w-full px-3 py-2 text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
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
                  <BodyText size="sm" className="text-muted-foreground">
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
            className="w-full px-3 py-2 text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          />
          <BodyText size="sm" className="text-muted-foreground mt-1">
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
            className="w-full px-3 py-2 text-foreground bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
          />
          <BodyText size="sm" className="text-muted-foreground mt-1">
            This text appears in email previews (optional)
          </BodyText>
        </div>
      </div>
    </div>
  )
}