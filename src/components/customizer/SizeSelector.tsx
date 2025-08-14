'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import type { RingSize } from '@/types/customizer'

interface SizeSelectorProps {
  selectedSize: RingSize | null
  onSizeChange: (size: RingSize) => void
  className?: string
}

const AVAILABLE_SIZES: RingSize[] = [
  { id: 'size-5', size: 5, name: '5', isAvailable: true },
  { id: 'size-5.5', size: 5.5, name: '5.5', isAvailable: true },
  { id: 'size-6', size: 6, name: '6', isAvailable: true },
  { id: 'size-6.5', size: 6.5, name: '6.5', isAvailable: true },
  { id: 'size-7', size: 7, name: '7', isAvailable: true },
  { id: 'size-7.5', size: 7.5, name: '7.5', isAvailable: true },
  { id: 'size-8', size: 8, name: '8', isAvailable: true },
  { id: 'size-8.5', size: 8.5, name: '8.5', isAvailable: true },
  { id: 'size-9', size: 9, name: '9', isAvailable: true },
  { id: 'size-9.5', size: 9.5, name: '9.5', isAvailable: true },
  { id: 'size-10', size: 10, name: '10', isAvailable: true },
  { id: 'size-10.5', size: 10.5, name: '10.5', isAvailable: true },
  { id: 'size-11', size: 11, name: '11', isAvailable: true },
  { id: 'size-11.5', size: 11.5, name: '11.5', isAvailable: true },
  { id: 'size-12', size: 12, name: '12', isAvailable: true }
]

const SIZE_GUIDE = {
  5: { diameter: '15.7mm', circumference: '49.3mm' },
  5.5: { diameter: '16.1mm', circumference: '50.6mm' },
  6: { diameter: '16.5mm', circumference: '51.9mm' },
  6.5: { diameter: '16.9mm', circumference: '53.1mm' },
  7: { diameter: '17.3mm', circumference: '54.4mm' },
  7.5: { diameter: '17.7mm', circumference: '55.7mm' },
  8: { diameter: '18.1mm', circumference: '56.9mm' },
  8.5: { diameter: '18.5mm', circumference: '58.2mm' },
  9: { diameter: '18.9mm', circumference: '59.5mm' },
  9.5: { diameter: '19.3mm', circumference: '60.8mm' },
  10: { diameter: '19.8mm', circumference: '62.1mm' },
  10.5: { diameter: '20.2mm', circumference: '63.4mm' },
  11: { diameter: '20.6mm', circumference: '64.6mm' },
  11.5: { diameter: '21.0mm', circumference: '65.9mm' },
  12: { diameter: '21.4mm', circumference: '67.2mm' }
}

export function SizeSelector({
  selectedSize,
  onSizeChange,
  className
}: SizeSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const handleSizeSelect = (size: RingSize) => {
    if (size.isAvailable) {
      onSizeChange(size)
    }
  }

  const SizeButton = ({ size }: { size: RingSize }) => {
    const isSelected = selectedSize?.id === size.id
    const sizeInfo = SIZE_GUIDE[size.size as keyof typeof SIZE_GUIDE]

    return (
      <Tooltip
        content={
          sizeInfo ? (
            <div className="text-center">
              <div className="font-medium mb-1">Size {size.name}</div>
              <div className="text-xs">
                <div>Diameter: {sizeInfo.diameter}</div>
                <div>Circumference: {sizeInfo.circumference}</div>
              </div>
            </div>
          ) : `Size ${size.name}`
        }
        disabled={!size.isAvailable}
      >
        <button
          onClick={() => handleSizeSelect(size)}
          disabled={!size.isAvailable}
          className={cn(
            'relative w-12 h-12 rounded-full border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
            'hover:scale-110 active:scale-95',
            size.isAvailable
              ? isSelected
                ? 'border-accent bg-accent text-foreground shadow-md scale-110'
                : 'border-border bg-background text-foreground hover:border-accent/50 hover:shadow-sm'
              : 'border-border bg-background/30 text-gray-600 cursor-not-allowed opacity-50'
          )}
          aria-label={`Select ring size ${size.name}`}
          aria-pressed={isSelected}
        >
          <span className={cn(
            'text-sm font-semibold transition-colors',
            isSelected && 'text-foreground'
          )}>
            {size.name}
          </span>
          
          {isSelected && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-2.5 h-2.5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      </Tooltip>
    )
  }

  const SizeGuideModal = () => (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <H3 className="text-foreground">Ring Size Guide</H3>
            <button
              onClick={() => setShowSizeGuide(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Close size guide"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg">
              <BodyText className="font-medium text-foreground mb-2">
                How to Find Your Size
              </BodyText>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Wrap a string around your finger</li>
                <li>Mark where the string overlaps</li>
                <li>Measure the string length in mm</li>
                <li>Find your size in the chart below</li>
              </ol>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 grid grid-cols-3 text-sm font-medium text-foreground">
                <div>Size</div>
                <div>Diameter</div>
                <div>Circumference</div>
              </div>
              {Object.entries(SIZE_GUIDE).map(([size, measurements]) => (
                <div 
                  key={size} 
                  className={cn(
                    'px-4 py-2 grid grid-cols-3 text-sm border-b border-border last:border-b-0',
                    selectedSize?.size === parseFloat(size) && 'bg-accent/10'
                  )}
                >
                  <div className="font-medium">{size}</div>
                  <div className="text-gray-600">{measurements.diameter}</div>
                  <div className="text-gray-600">{measurements.circumference}</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-muted/20 rounded-lg">
              <BodyText className="text-sm font-medium text-foreground mb-2">
                Tips for Accurate Sizing
              </BodyText>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Measure at the end of the day when fingers are largest</li>
                <li>Ensure the ring slides over your knuckle comfortably</li>
                <li>Consider the width - wider bands fit tighter</li>
                <li>When in doubt, size up rather than down</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowSizeGuide(false)}
              className="flex-1"
            >
              Close Guide
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // In a real app, this would open a contact form or chat
                setShowSizeGuide(false)
              }}
              className="flex-1"
            >
              Get Expert Help
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <H3 className="text-foreground">Define Size</H3>
          <button
            onClick={() => setShowSizeGuide(true)}
            className="text-sm text-cta hover:text-cta-hover transition-colors font-medium"
          >
            Size Guide
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <MutedText size="sm">
            Select your perfect ring size
          </MutedText>
          <MutedText size="sm" className="hidden md:block">
            Find your perfect fit with our interactive sizer
          </MutedText>
          <MutedText size="sm" className="md:hidden">
            Tap to measure
          </MutedText>
        </div>
      </div>

      {/* Size grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-6">
        {AVAILABLE_SIZES.map((size) => (
          <SizeButton key={size.id} size={size} />
        ))}
      </div>

      {/* Selected size info */}
      {selectedSize && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <BodyText className="font-medium text-foreground">
                Selected Size: {selectedSize.name}
              </BodyText>
              <MutedText size="sm">
                {SIZE_GUIDE[selectedSize.size as keyof typeof SIZE_GUIDE]?.circumference} circumference
              </MutedText>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSizeGuide(true)}
            >
              View Details
            </Button>
          </div>
        </div>
      )}

      {/* Size guide modal */}
      {showSizeGuide && <SizeGuideModal />}

      {/* Free resizing note */}
      <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <BodyText className="text-sm font-medium text-foreground">
              Free Resizing Included
            </BodyText>
            <MutedText size="sm">
              Complimentary resizing within 30 days if the fit isn't perfect
            </MutedText>
          </div>
        </div>
      </div>
    </div>
  )
}