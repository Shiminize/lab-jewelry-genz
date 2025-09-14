/**
 * TrustSignalCard - Pure content component for trust signal display
 * Extracted from TrustSignalsGrid for CLAUDE_RULES compliance
 * Used with SelectableCard wrapper for consistent styling
 */

'use client'

import React from 'react'
import { H3, MutedText } from '@/components/foundation/Typography'
import type { TrustSignal } from './socialProofData'

interface TrustSignalCardProps {
  trustSignal: TrustSignal
  className?: string
}

export const TrustSignalCard: React.FC<TrustSignalCardProps> = ({ 
  trustSignal, 
  className = '' 
}) => (
  <div className={`text-center ${className}`} data-testid="trust-signal-card">
    {/* Icon */}
    <div className="flex items-center justify-center mb-3">
      <trustSignal.icon className="w-8 h-8 text-accent" />
    </div>
    
    {/* Title */}
    <H3 className="text-sm font-semibold mb-2 text-foreground">
      {trustSignal.title}
    </H3>
    
    {/* Description */}
    <MutedText className="text-xs mb-2 text-neutral-600">
      {trustSignal.description}
    </MutedText>
    
    {/* Stat (if available) */}
    {trustSignal.stat && (
      <MutedText className="text-xs font-medium text-accent">
        {trustSignal.stat}
      </MutedText>
    )}
  </div>
)

export default TrustSignalCard