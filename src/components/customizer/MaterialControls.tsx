/**
 * MaterialControls - Material Selection UI
 * Redesigned with MinimalHoverCard for target hover state match
 * CLAUDE_RULES.md compliant with design system tokens
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { MinimalHoverCard } from '@/components/ui/MinimalHoverCard'
import type { MaterialControlsProps } from './types'

export const MaterialControls: React.FC<MaterialControlsProps> = ({
  materials,
  selectedMaterial,
  onMaterialChange,
  isDisabled = false,
  className
}) => {
  // Handle material selection with performance measurement
  const handleMaterialSelect = (materialId: string) => {
    if (isDisabled) return
    
    const startTime = performance.now()
    onMaterialChange(materialId as any)
    
    // CLAUDE_RULES: <100ms material switch requirement
    const switchTime = performance.now() - startTime
    console.log(`[MATERIAL SWITCH] ${materialId}: ${switchTime.toFixed(2)}ms`)
  }

  // Get material variant for MinimalHoverCard
  const getMaterialVariant = (materialId: string) => {
    const id = materialId.toLowerCase()
    if (id.includes('gold') && !id.includes('white') && !id.includes('rose')) return 'gold'
    if (id.includes('platinum')) return 'platinum'
    if (id.includes('rose')) return 'rose-gold'
    if (id.includes('white')) return 'white-gold'
    return 'default'
  }

  return (
    <div className={cn("flex flex-wrap gap-token-sm justify-center", className)}>
      {materials.map((material) => {
        const isSelected = selectedMaterial === material.id
        const variant = getMaterialVariant(material.id)
        
        return (
          <MinimalHoverCard
            key={material.id}
            variant={variant}
            isSelected={isSelected}
            disabled={isDisabled}
            onClick={() => handleMaterialSelect(material.id)}
            className="min-w-[140px] text-center"
          >
            <div className="flex flex-col items-center gap-token-sm">
              <span className="font-medium text-sm">
                {material.displayName}
              </span>
              {material.priceModifier !== 0 && (
                <span className="text-xs opacity-70">
                  {material.priceModifier > 0 ? '+' : ''}${material.priceModifier}
                </span>
              )}
            </div>
          </MinimalHoverCard>
        )
      })}
    </div>
  )
}

export default MaterialControls