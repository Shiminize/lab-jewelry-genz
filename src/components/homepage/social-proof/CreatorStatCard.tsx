/**
 * CreatorStatCard - Pure content component for creator program stat display
 * Extracted from CreatorProgramHighlight for CLAUDE_RULES compliance
 * Used with SelectableCard wrapper for consistent styling
 */

'use client'

import React from 'react'
import { H3, MutedText } from '@/components/foundation/Typography'

interface CreatorStatCardProps {
  title: string
  value: string
  description: string
  className?: string
}

export const CreatorStatCard: React.FC<CreatorStatCardProps> = ({ 
  title, 
  value, 
  description, 
  className = '' 
}) => (
  <div className={`text-center p-4 ${className}`} data-testid="creator-stat-card">
    {/* Value */}
    <H3 className="text-2xl font-bold text-accent mb-2">
      {value}
    </H3>
    
    {/* Title */}
    <H3 className="font-semibold text-foreground mb-1">
      {title}
    </H3>
    
    {/* Description */}
    <MutedText className="text-sm text-neutral-600">
      {description}
    </MutedText>
  </div>
)

export default CreatorStatCard