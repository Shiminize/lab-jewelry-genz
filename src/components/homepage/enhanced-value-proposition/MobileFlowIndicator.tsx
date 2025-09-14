'use client'

import React from 'react'
import type { EnhancedValueProp } from '../../../types/enhanced-value'

interface MobileFlowIndicatorProps {
  valueProps: EnhancedValueProp[]
  mobileBreakpoint: 'sm' | 'md' | 'lg'
}

export function MobileFlowIndicator({ 
  valueProps, 
  mobileBreakpoint 
}: MobileFlowIndicatorProps) {
  return (
    <div className={`${mobileBreakpoint}:hidden flex justify-center mt-8 space-x-token-sm`}>
      {valueProps.map((_, index) => (
        <div key={index} className="flex items-center">
          <div className="w-8 h-1 bg-aurora-pink rounded-full animate-aurora-shimmer-slow shadow-aurora-md" />
          {index < valueProps.length - 1 && (
            <div className="w-4 h-1 bg-aurora-pink/50 mx-1" />
          )}
        </div>
      ))}
    </div>
  )
}