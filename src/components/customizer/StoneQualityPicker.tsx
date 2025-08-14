'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Tooltip } from '@/components/ui/Tooltip'
import type { StoneQuality } from '@/types/customizer'

interface StoneQualityPickerProps {
  selectedQuality: StoneQuality | null
  onQualityChange: (quality: StoneQuality) => void
  className?: string
}

const STONE_QUALITIES: StoneQuality[] = [
  {
    id: 'premium',
    name: 'Premium',
    description: 'Exceptional clarity, lab-perfected brilliance beyond nature\'s limits',
    priceMultiplier: 2.0,
    grade: 'premium'
  },
  {
    id: 'signature',
    name: 'Signature',
    description: 'Meticulously selected, each stone tells a unique story',
    priceMultiplier: 1.4,
    grade: 'signature'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Certified quality, ethically created, beautifully pure',
    priceMultiplier: 1.0,
    grade: 'classic'
  }
]

const QUALITY_DETAILS = {
  premium: {
    clarity: 'FL-VVS1',
    color: 'D-F',
    cut: 'Ideal',
    certification: 'IGI Certified',
    features: ['Maximum brilliance', 'Flawless appearance', 'Investment grade']
  },
  signature: {
    clarity: 'VVS2-VS1',
    color: 'G-H',
    cut: 'Excellent',
    certification: 'GCAL Certified',
    features: ['High brilliance', 'Near-flawless', 'Perfect for daily wear']
  },
  classic: {
    clarity: 'VS2-SI1',
    color: 'I-J',
    cut: 'Very Good',
    certification: 'IGI Certified',
    features: ['Beautiful brilliance', 'Eye-clean', 'Exceptional value']
  }
}

export function StoneQualityPicker({
  selectedQuality,
  onQualityChange,
  className
}: StoneQualityPickerProps) {
  const [expandedQuality, setExpandedQuality] = useState<string | null>(null)

  const handleQualitySelect = (quality: StoneQuality) => {
    onQualityChange(quality)
  }

  const QualityBadge = ({ grade }: { grade: 'premium' | 'signature' | 'classic' }) => {
    const badgeStyles = {
      premium: 'bg-gradient-to-r from-accent to-cta text-foreground',
      signature: 'bg-cta/20 text-cta border border-cta/30',
      classic: 'bg-muted/50 text-foreground border border-border'
    }

    return (
      <div className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        badgeStyles[grade]
      )}>
        {grade.charAt(0).toUpperCase() + grade.slice(1)}
      </div>
    )
  }

  const QualityTooltip = ({ quality }: { quality: StoneQuality }) => {
    const details = QUALITY_DETAILS[quality.grade]
    
    return (
      <div className="space-y-2">
        <div className="font-semibold text-background">{quality.name} Grade</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Clarity: {details.clarity}</div>
          <div>Color: {details.color}</div>
          <div>Cut: {details.cut}</div>
          <div className="col-span-2">{details.certification}</div>
        </div>
        <div className="pt-1 border-t border-background/20">
          <div className="text-xs space-y-1">
            {details.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-background rounded-full" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const QualityOption = ({ quality }: { quality: StoneQuality }) => {
    const isSelected = selectedQuality?.id === quality.id
    const isExpanded = expandedQuality === quality.id

    return (
      <div className="border border-border rounded-lg overflow-hidden bg-background">
        <button
          onClick={() => handleQualitySelect(quality)}
          className={cn(
            'w-full p-4 text-left transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
            'hover:bg-muted/30 active:scale-[0.99]',
            isSelected && 'bg-accent/10 border-accent'
          )}
          aria-label={`Select ${quality.name} stone quality`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <H3 className={cn(
                  'text-lg font-semibold transition-colors',
                  isSelected ? 'text-foreground' : 'text-foreground'
                )}>
                  {quality.name}
                </H3>
                <QualityBadge grade={quality.grade} />
                
                <Tooltip 
                  content={<QualityTooltip quality={quality} />}
                  position="top"
                >
                  <button 
                    className="p-1 rounded-full hover:bg-muted/50 transition-colors"
                    aria-label={`Learn more about ${quality.name} quality`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </Tooltip>
              </div>
              
              <BodyText className="text-sm text-muted mb-3 leading-relaxed">
                {quality.description}
              </BodyText>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-muted">Price adjustment:</span>
                  <span className={cn(
                    'font-semibold',
                    quality.priceMultiplier > 1 ? 'text-cta' : 'text-success'
                  )}>
                    {quality.priceMultiplier > 1 
                      ? `+${Math.round((quality.priceMultiplier - 1) * 100)}%`
                      : quality.priceMultiplier < 1
                      ? `-${Math.round((1 - quality.priceMultiplier) * 100)}%`
                      : 'Included'
                    }
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedQuality(isExpanded ? null : quality.id)
                  }}
                  className="text-muted hover:text-foreground transition-colors"
                  aria-label={`${isExpanded ? 'Hide' : 'Show'} ${quality.name} details`}
                >
                  <svg 
                    className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-180')} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="ml-4 flex-shrink-0">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </button>

        {/* Expanded details */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-border bg-muted/20 animate-slide-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <MutedText size="sm" className="font-medium mb-1">Clarity</MutedText>
                <BodyText className="text-sm">{QUALITY_DETAILS[quality.grade].clarity}</BodyText>
              </div>
              <div>
                <MutedText size="sm" className="font-medium mb-1">Color</MutedText>
                <BodyText className="text-sm">{QUALITY_DETAILS[quality.grade].color}</BodyText>
              </div>
              <div>
                <MutedText size="sm" className="font-medium mb-1">Cut</MutedText>
                <BodyText className="text-sm">{QUALITY_DETAILS[quality.grade].cut}</BodyText>
              </div>
              <div>
                <MutedText size="sm" className="font-medium mb-1">Certified</MutedText>
                <BodyText className="text-sm">{QUALITY_DETAILS[quality.grade].certification}</BodyText>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <H3 className="text-foreground">Select Stone</H3>
          <Tooltip 
            content="What makes a premium stone? Our lab-grown diamonds are graded using the same standards as mined diamonds: Cut, Color, Clarity, and Carat."
            position="top"
          >
            <button 
              className="p-1 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Learn about stone quality grading"
            >
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </Tooltip>
        </div>
        <MutedText size="sm">
          Choose the diamond quality that matches your vision
        </MutedText>
      </div>

      <div className="space-y-4">
        {STONE_QUALITIES.map((quality) => (
          <QualityOption key={quality.id} quality={quality} />
        ))}
      </div>

      {/* Educational note */}
      <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <BodyText className="text-sm text-foreground font-medium mb-2">
          Lab-Grown vs Mined Diamonds
        </BodyText>
        <MutedText size="sm" className="leading-relaxed">
          Lab-grown diamonds are chemically identical to mined diamonds, created with cutting-edge technology. 
          We offer identical brilliance with 100% transparency and zero environmental impact.
        </MutedText>
      </div>
    </div>
  )
}