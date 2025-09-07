'use client'

import React from 'react'
import { H3, BodyText } from '@/components/foundation/Typography'
import type { Material, StoneQuality } from '@/types/customizer'
import type { SettingOption } from './previewData'

interface PriceSummaryProps {
  material: Material | null
  stoneQuality: StoneQuality | null
  setting: SettingOption
  currentPrice: number
}

export function PriceSummary({
  material,
  stoneQuality,
  setting,
  currentPrice
}: PriceSummaryProps) {
  return (
    <div className="bg-background border border-accent/20 rounded-token-md p-4 lg:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <H3 className="text-foreground bg-background text-lg">Your Design</H3>
          <BodyText className="text-foreground/60 text-sm">
            {material?.name} • {stoneQuality?.name} • {setting.name}
          </BodyText>
        </div>
        <div className="text-right">
          <div className="text-3xl lg:text-4xl font-headline text-foreground bg-background">
            ${currentPrice.toLocaleString()}
          </div>
          <BodyText className="text-foreground/60 text-sm">Starting price</BodyText>
        </div>
      </div>
    </div>
  )
}