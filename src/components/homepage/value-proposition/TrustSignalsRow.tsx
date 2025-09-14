'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'
import { MutedText } from '../../foundation/Typography'

const trustSignalVariants = cva(
  'inline-flex items-center gap-token-sm px-token-md py-token-xs rounded-34 text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-muted/50 text-foreground',
        accent: 'bg-accent/10 text-accent',
        success: 'bg-accent/20 text-accent'
      }
    },
    defaultVariants: {
      variant: 'accent'
    }
  }
)

interface TrustSignalsRowProps {
  showTrustSignals: boolean
  isAurora: boolean
  trackInteraction: (event: { action: string; signal: string }) => void
}

export function TrustSignalsRow({ 
  showTrustSignals, 
  isAurora, 
  trackInteraction 
}: TrustSignalsRowProps) {
  if (!showTrustSignals) return null

  return (
    <div className="mt-12 lg:mt-16 text-center">
      <MutedText className="mb-6 block">
        Join thousands who choose conscious luxury
      </MutedText>
      <div className="flex flex-wrap justify-center gap-token-md lg:gap-token-lg">
        <div 
          className={cn(
            trustSignalVariants({ variant: 'accent' }),
            isAurora ? 'hover:scale-105 transition-transform cursor-pointer' : ''
          )}
          onClick={() => trackInteraction({ action: 'trust_signal_click', signal: 'conflict_free' })}
        >
          <span>🌱</span>
          <span className="font-semibold">100% Conflict-Free</span>
        </div>
        <div 
          className={cn(
            trustSignalVariants({ variant: 'accent' }),
            isAurora ? 'hover:scale-105 transition-transform cursor-pointer' : ''
          )}
          onClick={() => trackInteraction({ action: 'trust_signal_click', signal: 'recycled_metal' })}
        >
          <span>♻️</span>
          <span className="font-semibold">Recycled Metal</span>
        </div>
        <div 
          className={cn(
            trustSignalVariants({ variant: 'accent' }),
            isAurora ? 'hover:scale-105 transition-transform cursor-pointer' : ''
          )}
          onClick={() => trackInteraction({ action: 'trust_signal_click', signal: 'lab_grown' })}
        >
          <span>🔬</span>
          <span className="font-semibold">Lab-Grown Certified</span>
        </div>
        <div 
          className={cn(
            trustSignalVariants({ variant: 'accent' }),
            isAurora ? 'hover:scale-105 transition-transform cursor-pointer' : ''
          )}
          onClick={() => trackInteraction({ action: 'trust_signal_click', signal: 'carbon_neutral' })}
        >
          <span>🌍</span>
          <span className="font-semibold">Carbon Neutral</span>
        </div>
      </div>
    </div>
  )
}