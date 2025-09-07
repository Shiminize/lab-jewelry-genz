'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, FileText, Mail, Target, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { CampaignStepBasic } from './CampaignStepBasic'
import { CampaignStepContent } from './CampaignStepContent'
import { CampaignStepAudience } from './CampaignStepAudience'
import { CampaignStepReview } from './CampaignStepReview'

// Wizard steps configuration
const wizardSteps = [
  { id: 'details', label: 'Campaign Details', icon: FileText },
  { id: 'content', label: 'Content & Template', icon: Mail },
  { id: 'targeting', label: 'Audience Targeting', icon: Target },
  { id: 'review', label: 'Review & Send', icon: CheckCircle }
] as const

type WizardStep = typeof wizardSteps[number]['id']

// Core interfaces
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

interface CampaignWizardProps {
  initialData?: Partial<CampaignFormData>
  segments: Segment[]
  templates: Template[]
  onSendCampaign: (data: CampaignFormData) => void
  onSaveDraft: (data: CampaignFormData) => void
  onCancel: () => void
  loading?: boolean
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
    <div className="bg-background p-6 rounded-lg border">
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
                  isCompleted && 'bg-aurora-emerald-flash/10 text-aurora-emerald-flash border-2 border-aurora-emerald-flash/20',
                  isCurrent && !isCompleted && 'bg-accent text-background border-2 border-accent',
                  !isCurrent && !isCompleted && isAccessible && 'bg-muted text-muted-foreground border-2 border-border hover:bg-muted',
                  !isAccessible && 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
              <div className="ml-3 text-left">
                <div className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </div>
              </div>
              {index < wizardSteps.length - 1 && (
                <div className={cn(
                  'w-12 h-px mx-4',
                  isCompleted ? 'bg-aurora-emerald-flash/30' : 'bg-border'
                )} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CampaignWizard({
  initialData = {},
  segments,
  templates,
  onSendCampaign,
  onSaveDraft,
  onCancel,
  loading = false
}: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('details')
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set())
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
    },
    ...initialData
  })

  const currentIndex = wizardSteps.findIndex(step => step.id === currentStep)
  const canGoNext = validateStep(currentStep, formData)
  const canGoPrevious = currentIndex > 0

  // Validation logic for each step
  function validateStep(step: WizardStep, data: CampaignFormData): boolean {
    switch (step) {
      case 'details':
        return !!(data.name && data.type && data.subject)
      case 'content':
        return !!(data.template && data.content.html)
      case 'targeting':
        return data.segments.length > 0
      case 'review':
        return true
      default:
        return false
    }
  }

  const getErrors = (step: WizardStep): string[] => {
    const errors: string[] = []
    
    switch (step) {
      case 'details':
        if (!formData.name) errors.push('Campaign name is required')
        if (!formData.type) errors.push('Campaign type is required')
        if (!formData.subject) errors.push('Subject line is required')
        break
      case 'content':
        if (!formData.template) errors.push('Template selection is required')
        if (!formData.content.html) errors.push('Email content is required')
        break
      case 'targeting':
        if (formData.segments.length === 0) errors.push('At least one audience segment is required')
        if (formData.trigger.type === 'scheduled' && !formData.trigger.scheduledAt) {
          errors.push('Scheduled date and time is required')
        }
        break
    }
    
    return errors
  }

  const handleFormChange = (data: Partial<CampaignFormData>) => {
    const newFormData = { ...formData, ...data }
    setFormData(newFormData)
    
    // Mark current step as completed if valid
    if (validateStep(currentStep, newFormData)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
    } else {
      setCompletedSteps(prev => {
        const newSet = new Set([...prev])
        newSet.delete(currentStep)
        return newSet
      })
    }
  }

  const goToNextStep = () => {
    if (canGoNext && currentIndex < wizardSteps.length - 1) {
      setCurrentStep(wizardSteps[currentIndex + 1].id)
    }
  }

  const goToPreviousStep = () => {
    if (canGoPrevious) {
      setCurrentStep(wizardSteps[currentIndex - 1].id)
    }
  }

  const goToStep = (step: WizardStep) => {
    const stepIndex = wizardSteps.findIndex(s => s.id === step)
    const isAccessible = stepIndex <= currentIndex || completedSteps.has(step)
    
    if (isAccessible) {
      setCurrentStep(step)
    }
  }

  const handleSendCampaign = () => {
    if (validateStep('targeting', formData)) {
      onSendCampaign(formData)
    }
  }

  const handleSaveDraft = () => {
    onSaveDraft(formData)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Progress */}
      <StepProgress 
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 'details' && (
          <CampaignStepBasic
            formData={formData}
            onChange={handleFormChange}
            errors={getErrors('details')}
          />
        )}

        {currentStep === 'content' && (
          <CampaignStepContent
            formData={formData}
            onChange={handleFormChange}
            errors={getErrors('content')}
            templates={templates}
          />
        )}

        {currentStep === 'targeting' && (
          <CampaignStepAudience
            formData={formData}
            onChange={handleFormChange}
            errors={getErrors('targeting')}
            segments={segments}
          />
        )}

        {currentStep === 'review' && (
          <CampaignStepReview
            formData={formData}
            segments={segments}
            templates={templates}
            onSendCampaign={handleSendCampaign}
            onSaveDraft={handleSaveDraft}
            loading={loading}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStep !== 'review' && (
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={!canGoPrevious || loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={goToNextStep}
              disabled={!canGoNext || loading}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}