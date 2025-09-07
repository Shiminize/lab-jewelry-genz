/**
 * EngravingSelection - Extracted from CustomizationPanel for CLAUDE_RULES compliance  
 * Handles personalized engraving with preview
 */

'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface EngravingSelectionProps {
  engraving?: {
    enabled: boolean
    maxLength: number
    fonts: string[]
    positions: string[]
    priceModifier: number
  }
  engravingText?: string
  onEngravingChange: (text: string) => void
  onEngravingUpdate?: (engraving: { text: string, font: string, position: string }) => void
}

export function EngravingSelection({
  engraving = {
    enabled: true,
    maxLength: 25,
    fonts: ['Classic', 'Script', 'Modern'],
    positions: ['Inside', 'Outside', 'Back'],
    priceModifier: 50
  },
  engravingText = '',
  onEngravingChange,
  onEngravingUpdate
}: EngravingSelectionProps) {
  const [selectedFont, setSelectedFont] = useState('Classic')
  const [selectedPosition, setSelectedPosition] = useState('Inside')

  const handleTextChange = useCallback((text: string) => {
    const truncatedText = text.substring(0, engraving.maxLength)
    onEngravingChange(truncatedText)
    
    if (onEngravingUpdate) {
      onEngravingUpdate({
        text: truncatedText,
        font: selectedFont,
        position: selectedPosition
      })
    }
  }, [engraving.maxLength, onEngravingChange, onEngravingUpdate, selectedFont, selectedPosition])

  const handleFontChange = (font: string) => {
    setSelectedFont(font)
    if (onEngravingUpdate) {
      onEngravingUpdate({
        text: engravingText,
        font: font,
        position: selectedPosition
      })
    }
  }

  const handlePositionChange = (position: string) => {
    setSelectedPosition(position)
    if (onEngravingUpdate) {
      onEngravingUpdate({
        text: engravingText,
        font: selectedFont,
        position: position
      })
    }
  }

  if (!engraving.enabled) {
    return null
  }

  const getPriceModifier = (modifier: number) => {
    if (modifier === 0) return 'Free'
    const sign = modifier > 0 ? '+' : ''
    return `${sign}$${modifier}`
  }

  return (
    <div className="space-y-token-md">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Engraving</h3>
        <span className="text-sm text-accent font-medium">
          {getPriceModifier(engraving.priceModifier)}
        </span>
      </div>

      {/* Engraving Text Input */}
      <div className="space-y-token-sm">
        <label className="block text-sm font-medium text-foreground">
          Your Message ({engravingText.length}/{engraving.maxLength})
        </label>
        <textarea
          value={engravingText}
          onChange={(e) => handleTextChange(e.target.value)}
          maxLength={engraving.maxLength}
          placeholder="Enter your personal message..."
          className="w-full p-3 border border-border rounded-token-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:aurora-focus-default transition-all duration-300"
          rows={2}
        />
      </div>

      {/* Font Selection */}
      <div className="space-y-token-sm">
        <label className="block text-sm font-medium text-foreground">Font Style</label>
        <div className="grid grid-cols-3 gap-2">
          {engraving.fonts.map((font) => (
            <motion.button
              key={font}
              onClick={() => handleFontChange(font)}
              className={`
                p-3 rounded-token-lg border-2 text-center transition-all duration-300
                ${selectedFont === font
                  ? 'border-accent bg-accent/10 text-foreground'
                  : 'border-border bg-background text-foreground hover:border-accent/50'
                }
                focus:outline-none focus:aurora-focus-default
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="text-sm font-medium"
                style={{ 
                  fontFamily: font === 'Script' ? 'cursive' : font === 'Modern' ? 'sans-serif' : 'serif' 
                }}
              >
                {font}
              </div>
              {engravingText && (
                <div 
                  className="text-xs text-muted-foreground mt-1 truncate"
                  style={{ 
                    fontFamily: font === 'Script' ? 'cursive' : font === 'Modern' ? 'sans-serif' : 'serif' 
                  }}
                >
                  {engravingText}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Position Selection */}
      <div className="space-y-token-sm">
        <label className="block text-sm font-medium text-foreground">Position</label>
        <div className="grid grid-cols-3 gap-2">
          {engraving.positions.map((position) => (
            <motion.button
              key={position}
              onClick={() => handlePositionChange(position)}
              className={`
                p-3 rounded-token-lg border-2 text-center transition-all duration-300
                ${selectedPosition === position
                  ? 'border-accent bg-accent/10 text-foreground'
                  : 'border-border bg-background text-foreground hover:border-accent/50'
                }
                focus:outline-none focus:aurora-focus-default
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium">{position}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {position === 'Inside' ? 'Hidden when worn' : 
                 position === 'Outside' ? 'Visible when worn' : 
                 'On the back'}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Engraving Preview */}
      {engravingText && (
        <motion.div
          className="p-4 bg-muted rounded-token-lg border border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-sm font-medium text-foreground mb-2">Preview</div>
          <div className="flex items-center justify-center p-6 bg-background rounded-token-lg border border-border/50">
            <div 
              className="text-foreground text-center"
              style={{ 
                fontFamily: selectedFont === 'Script' ? 'cursive' : selectedFont === 'Modern' ? 'sans-serif' : 'serif',
                fontSize: '16px'
              }}
            >
              {engravingText}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {selectedFont} font • {selectedPosition} placement
          </div>
        </motion.div>
      )}

      {/* Engraving Information */}
      <div className="p-3 bg-muted/50 rounded-token-lg text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>Personalization Details:</strong>
        </p>
        <ul className="space-y-1">
          <li>• Maximum {engraving.maxLength} characters including spaces</li>
          <li>• Hand-engraved by skilled craftspeople</li>
          <li>• Processing time: 3-5 additional business days</li>
          <li>• Engraved items cannot be returned or exchanged</li>
        </ul>
      </div>
    </div>
  )
}

export default EngravingSelection