/**
 * SizeSelection - Extracted from CustomizationPanel for CLAUDE_RULES compliance
 * Handles size selection with ring size guidance
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SizeSelectionProps {
  sizes?: Array<{
    value: string
    label: string
    priceModifier: number
    description?: string
  }>
  selectedSize?: string
  onSizeChange: (size: string) => void
}

export function SizeSelection({
  sizes = [],
  selectedSize,
  onSizeChange
}: SizeSelectionProps) {
  // Default ring sizes if none provided
  const defaultSizes = [
    { value: '5', label: 'Size 5', priceModifier: 0, description: 'US Ring Size 5' },
    { value: '5.5', label: 'Size 5.5', priceModifier: 0, description: 'US Ring Size 5.5' },
    { value: '6', label: 'Size 6', priceModifier: 0, description: 'US Ring Size 6' },
    { value: '6.5', label: 'Size 6.5', priceModifier: 0, description: 'US Ring Size 6.5' },
    { value: '7', label: 'Size 7', priceModifier: 0, description: 'US Ring Size 7' },
    { value: '7.5', label: 'Size 7.5', priceModifier: 0, description: 'US Ring Size 7.5' },
    { value: '8', label: 'Size 8', priceModifier: 0, description: 'US Ring Size 8' },
    { value: '8.5', label: 'Size 8.5', priceModifier: 0, description: 'US Ring Size 8.5' },
    { value: '9', label: 'Size 9', priceModifier: 0, description: 'US Ring Size 9' }
  ]

  const availableSizes = sizes.length > 0 ? sizes : defaultSizes

  const getPriceModifier = (modifier: number) => {
    if (modifier === 0) return null
    const sign = modifier > 0 ? '+' : ''
    return `${sign}$${modifier}`
  }

  return (
    <div className="space-y-token-md">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Size</h3>
        <button 
          className="text-sm text-accent hover:text-accent/80 underline"
          onClick={() => window.open('/sizing', '_blank')}
        >
          Size Guide
        </button>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {availableSizes.map((size) => {
          const isSelected = selectedSize === size.value
          const priceModifier = getPriceModifier(size.priceModifier)
          
          return (
            <motion.button
              key={size.value}
              onClick={() => onSizeChange(size.value)}
              className={`
                relative p-3 rounded-token-lg border-2 transition-all duration-300 text-center
                ${isSelected 
                  ? 'border-accent bg-accent/10 text-foreground' 
                  : 'border-border bg-background text-foreground hover:border-accent/50'
                }
                focus:outline-none focus:aurora-focus-default
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="font-semibold text-sm">{size.label}</div>
              {priceModifier && (
                <div className="text-xs text-muted-foreground mt-1">
                  {priceModifier}
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className="w-3 h-3 text-background" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Size Information */}
      <div className="p-3 bg-muted/50 rounded-token-lg text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>Not sure about your size?</strong>
        </p>
        <p>
          Visit our <button 
            className="text-accent hover:text-accent/80 underline" 
            onClick={() => window.open('/sizing', '_blank')}
          >
            size guide
          </button> or use our virtual ring sizer for the perfect fit.
        </p>
      </div>

      {/* Selected Size Summary */}
      {selectedSize && (
        <motion.div
          className="p-3 bg-muted rounded-token-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              Selected Size
            </span>
            <span className="text-sm text-accent font-semibold">
              US Size {selectedSize}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SizeSelection