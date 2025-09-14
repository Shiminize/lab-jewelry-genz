import React from 'react'

export interface EnhancedValueProp {
  id: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  headline: string
  description: string
  trustSignals: Array<{
    icon: React.ComponentType<{ className?: string; size?: number }>
    text: string
    description?: string
  }>
  details?: string
}