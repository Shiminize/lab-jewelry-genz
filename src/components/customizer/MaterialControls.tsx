/**
 * MaterialControls - Material Selection UI
 * Single responsibility: Handle material selection and display
 * CLAUDE_RULES.md compliant with design system tokens
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { MaterialControlsProps, Material } from './types'

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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Ultra-minimalist design - header removed for pure visual focus */}

      {/* Minimalist material selection - visual only */}
      <div className="grid grid-cols-4 gap-3">
        {materials.map((material) => {
          const isSelected = selectedMaterial === material.id
          
          return (
            <Button
              key={material.id}
              variant="ghost"
              onClick={() => handleMaterialSelect(material.id)}
              disabled={isDisabled}
              className={cn(
                "h-16 w-16 p-2 rounded-full transition-all duration-200 hover:scale-105",
                isSelected && "ring-2 ring-accent ring-offset-2 scale-110"
              )}
              aria-pressed={isSelected}
              aria-label={material.displayName}
              data-material={material.id}
            >
              {/* Pure visual material indicator */}
              <div 
                className={cn(
                  "w-10 h-10 rounded-full border shadow-sm transition-all duration-200",
                  isSelected ? "border-accent/50 shadow-md" : "border-border/20"
                )}
                style={{ 
                  backgroundColor: material.pbrProperties.color
                }}
              />
            </Button>
          )
        })}
      </div>

      {/* Minimalist design - no additional text or properties */}
    </div>
  )
}

export default MaterialControls