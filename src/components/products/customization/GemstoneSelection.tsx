/**
 * GemstoneSelection - Extracted from CustomizationPanel for CLAUDE_RULES compliance
 * Handles gemstone selection with CLAUDE_RULES focus on lab-grown diamonds
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface GemstoneSelectionProps {
  gemstones?: Array<{
    id: string
    name: string
    priceModifier: number
    color: string
    size: string
    clarity: string
    description?: string
  }>
  selectedGemstone?: string
  onGemstoneChange: (gemstoneId: string) => void
}

export function GemstoneSelection({
  gemstones = [],
  selectedGemstone,
  onGemstoneChange
}: GemstoneSelectionProps) {
  // CLAUDE_RULES: Default to lab-grown gems if none provided
  const defaultGemstones = [
    {
      id: 'lab-diamond-1ct',
      name: 'Lab-Grown Diamond',
      priceModifier: 0,
      color: 'var(--stone-diamond, #FFFFFF)',
      size: '1 Carat',
      clarity: 'VVS1',
      description: 'Lab-Grown Diamond - Ethical & Sustainable'
    },
    {
      id: 'lab-diamond-0.75ct',
      name: 'Lab-Grown Diamond',
      priceModifier: -300,
      color: 'var(--stone-diamond, #FFFFFF)',
      size: '0.75 Carat',
      clarity: 'VS1',
      description: 'Lab-Grown Diamond - Smaller Size'
    },
    {
      id: 'lab-sapphire',
      name: 'Lab-Grown Sapphire',
      priceModifier: -500,
      color: 'var(--sapphire, #0066CC)',
      size: '1 Carat',
      clarity: 'VVS',
      description: 'Lab-Grown Sapphire - Ocean Blue'
    }
  ]

  const availableGemstones = gemstones.length > 0 ? gemstones : defaultGemstones

  const getPriceModifier = (modifier: number) => {
    if (modifier === 0) return 'Base price'
    const sign = modifier > 0 ? '+' : ''
    return `${sign}$${modifier}`
  }

  return (
    <div className="space-y-token-md">
      <h3 className="text-lg font-semibold text-foreground">Gemstone</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableGemstones.map((gemstone) => {
          const isSelected = selectedGemstone === gemstone.id
          
          return (
            <motion.button
              key={gemstone.id}
              onClick={() => onGemstoneChange(gemstone.id)}
              className={`
                relative p-4 rounded-token-lg border-2 transition-all duration-300 text-left
                ${isSelected 
                  ? 'border-emerald-flash bg-emerald-flash/10 text-foreground shadow-lg shadow-emerald-flash/20' 
                  : 'border-border bg-background text-foreground hover:border-emerald-flash/50'
                }
                focus:outline-none focus:aurora-focus-default
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Gemstone Preview */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                    style={{ backgroundColor: gemstone.color }}
                  />
                  {/* Diamond sparkle effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {gemstone.description || gemstone.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getPriceModifier(gemstone.priceModifier)}
                  </p>
                </div>
              </div>

              {/* Gemstone Specifications */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{gemstone.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clarity:</span>
                  <span>{gemstone.clarity}</span>
                </div>
              </div>

              {/* Lab-grown badge */}
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-flash/10 text-emerald-flash">
                  Lab-Grown
                </span>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 w-6 h-6 bg-emerald-flash rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Selected Gemstone Summary */}
      {selectedGemstone && (
        <motion.div
          className="p-3 bg-muted rounded-token-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              Selected Gemstone
            </span>
            <span className="text-sm text-emerald-flash font-semibold">
              {availableGemstones.find(g => g.id === selectedGemstone)?.description || selectedGemstone}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default GemstoneSelection