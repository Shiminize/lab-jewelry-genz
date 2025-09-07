'use client'

import React from 'react'
import { BodyText } from '@/components/foundation/Typography'
import { TRUST_INDICATORS } from './previewData'

export function TrustIndicators() {
  return (
    <div className="col-span-full mt-12 lg:mt-16 pt-8 lg:pt-12 border-t border-border">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {TRUST_INDICATORS.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl lg:text-2xl">{item.icon}</span>
            </div>
            <BodyText className="text-foreground/60 font-medium text-sm lg:text-base">
              {item.text}
            </BodyText>
          </div>
        ))}
      </div>
    </div>
  )
}