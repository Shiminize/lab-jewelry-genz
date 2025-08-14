'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface EngravingInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  className?: string
}

const POPULAR_ENGRAVINGS = [
  'Forever Yours',
  'Always & Forever',
  'My Heart',
  'True Love',
  'Soul Mate',
  'Till Infinity',
  'You & Me',
  'Love Always'
]

const ENGRAVING_FONTS = [
  { id: 'script', name: 'Script', preview: 'Love Always', style: 'font-serif italic' },
  { id: 'block', name: 'Block', preview: 'LOVE ALWAYS', style: 'font-sans uppercase tracking-wider' },
  { id: 'cursive', name: 'Cursive', preview: 'Love Always', style: 'font-serif' }
]

export function EngravingInput({
  value,
  onChange,
  maxLength = 25,
  className
}: EngravingInputProps) {
  const [selectedFont, setSelectedFont] = useState(ENGRAVING_FONTS[0])
  const [showPreview, setShowPreview] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [validationMessage, setValidationMessage] = useState('')

  const remainingChars = maxLength - value.length

  // Validate engraving text
  useEffect(() => {
    if (value.length === 0) {
      setIsValid(true)
      setValidationMessage('')
      return
    }

    // Check for invalid characters (basic validation)
    const invalidChars = /[^a-zA-Z0-9\s&.,'-]/
    if (invalidChars.test(value)) {
      setIsValid(false)
      setValidationMessage('Only letters, numbers, spaces, and basic punctuation allowed')
      return
    }

    if (value.length > maxLength) {
      setIsValid(false)
      setValidationMessage(`Maximum ${maxLength} characters allowed`)
      return
    }

    setIsValid(true)
    setValidationMessage('')
  }, [value, maxLength])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
  }

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <H3 className="text-foreground">Engraving Preview</H3>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Close preview"
            >
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-muted/20 rounded-lg p-6 text-center mb-6">
            <div className="bg-accent/10 rounded-full w-32 h-32 mx-auto flex items-center justify-center mb-4">
              <div className="w-24 h-24 border-2 border-accent/30 rounded-full flex items-center justify-center">
                <span className={cn(
                  'text-foreground text-xs',
                  selectedFont.style
                )}>
                  {value || 'Your message'}
                </span>
              </div>
            </div>
            <MutedText size="sm">
              Preview shows approximate sizing and placement
            </MutedText>
          </div>

          <Button
            onClick={() => setShowPreview(false)}
            variant="primary"
            className="w-full"
          >
            Looks Perfect!
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-6">
        <H3 className="text-foreground mb-2">Personalize</H3>
        <MutedText size="sm">
          Add a personal message to make this piece uniquely yours
        </MutedText>
      </div>

      <div className="space-y-6">
        {/* Engraving input */}
        <div className="relative">
          <Input
            value={value}
            onChange={handleInputChange}
            placeholder="Your message of love"
            maxLength={maxLength}
            error={!isValid ? validationMessage : undefined}
            className={cn(
              'text-center text-lg py-3',
              selectedFont.style
            )}
            aria-label="Engraving text input"
          />
          
          <div className="flex items-center justify-between mt-2">
            <MutedText size="sm" className={cn(
              'transition-colors',
              remainingChars < 5 ? 'text-error' : 'text-muted'
            )}>
              {remainingChars} characters remaining
            </MutedText>
            
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="text-xs"
              >
                Preview
              </Button>
            )}
          </div>
        </div>

        {/* Font selection */}
        <div>
          <BodyText className="text-sm font-medium text-foreground mb-3">
            Font Style
          </BodyText>
          <div className="grid grid-cols-3 gap-2">
            {ENGRAVING_FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => setSelectedFont(font)}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all text-center',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  selectedFont.id === font.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-background hover:border-accent/50'
                )}
                aria-label={`Select ${font.name} font`}
              >
                <div className={cn('text-sm text-foreground mb-1', font.style)}>
                  {font.preview}
                </div>
                <MutedText size="sm">{font.name}</MutedText>
              </button>
            ))}
          </div>
        </div>

        {/* Popular suggestions */}
        <div>
          <BodyText className="text-sm font-medium text-foreground mb-3">
            Popular Messages
          </BodyText>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ENGRAVINGS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'px-3 py-2 text-sm rounded-full border transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                  'hover:border-accent hover:bg-accent/10',
                  value === suggestion
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border bg-background text-muted hover:text-foreground'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Engraving info */}
        <div className="p-4 bg-muted/20 rounded-lg space-y-3">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-cta mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <BodyText className="text-sm font-medium text-foreground">
                Engraving Details
              </BodyText>
              <MutedText size="sm" className="mt-1">
                Hand-engraved by master artisans. Allow 3-5 additional business days for personalized pieces.
              </MutedText>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <MutedText size="sm">Engraving cost</MutedText>
            <BodyText className="text-sm font-semibold text-foreground">
              {value ? '+$75' : 'Free (no engraving)'}
            </BodyText>
          </div>
        </div>

        {/* Clear button */}
        {value && (
          <Button
            variant="ghost"
            onClick={() => onChange('')}
            className="w-full"
          >
            Remove Engraving
          </Button>
        )}
      </div>

      {/* Preview modal */}
      {showPreview && <PreviewModal />}
    </div>
  )
}