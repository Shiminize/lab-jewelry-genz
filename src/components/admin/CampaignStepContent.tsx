'use client'

import React, { useState } from 'react'
import { Mail, AlertCircle } from 'lucide-react'
import { H2, H3, BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

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

interface CampaignStepContentProps {
  formData: CampaignFormData
  onChange: (data: Partial<CampaignFormData>) => void
  errors: string[]
  templates: Template[]
  className?: string
}

export function CampaignStepContent({ 
  formData, 
  onChange, 
  errors,
  templates,
  className 
}: CampaignStepContentProps) {
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
    <div className={`space-y-6 ${className || ''}`}>
      <div className="bg-background p-6 rounded-lg border">
        <div className="mb-4">
          <H2 className="text-foreground">Content & Template</H2>
          <BodyText className="text-muted-foreground">
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
                  <Mail className="w-8 h-8 text-muted-foreground" />
                </div>
                <H3 className="text-sm font-medium text-foreground mb-1">
                  {template.name}
                </H3>
                <BodyText size="sm" className="text-muted-foreground">
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
        <div className="bg-background p-6 rounded-lg border">
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
            <BodyText size="sm" className="text-muted-foreground mt-1">
              Plain text version for email clients that don't support HTML
            </BodyText>
          </div>
        </div>
      )}
    </div>
  )
}