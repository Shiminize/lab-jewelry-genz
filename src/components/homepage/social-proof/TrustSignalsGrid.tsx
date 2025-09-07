'use client'

import React from 'react'
import { H3, MutedText } from '@/components/foundation/Typography'
import type { TrustSignal } from './socialProofData'

interface TrustSignalsGridProps {
  signals: TrustSignal[]
}

export const TrustSignalsGrid: React.FC<TrustSignalsGridProps> = ({ signals }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {signals.map((signal, index) => (
      <div 
        key={index}
        className="text-center p-4 bg-muted/20 hover:bg-muted/30 transition-colors rounded-token-md"
      >
        <div className="flex items-center justify-center mb-2">
          <signal.icon className="w-8 h-8 text-accent" />
        </div>
        <H3 className="text-sm font-semibold mb-1">{signal.title}</H3>
        <MutedText className="text-xs mb-1">{signal.description}</MutedText>
        {signal.stat && (
          <MutedText className="text-xs font-medium text-accent">{signal.stat}</MutedText>
        )}
      </div>
    ))}
  </div>
)