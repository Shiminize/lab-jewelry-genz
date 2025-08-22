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
      {/* Section header */}
      <div>
        <h3 className="font-headline text-lg text-foreground mb-2">
          Metal Type
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred metal finish
        </p>
      </div>

      {/* Material selection grid */}
      <div className="grid grid-cols-2 gap-3">
        {materials.map((material) => {
          const isSelected = selectedMaterial === material.id
          
          return (
            <Button
              key={material.id}
              variant={isSelected ? 'primary' : 'secondary'}
              onClick={() => handleMaterialSelect(material.id)}
              disabled={isDisabled}
              className={cn(
                "justify-start h-auto p-4 transition-all duration-200",
                isSelected && "ring-2 ring-cta ring-offset-2"
              )}
              aria-pressed={isSelected}
              data-material={material.id}
            >
              <div className="flex items-center space-x-3 w-full">
                {/* Material color indicator */}
                <div 
                  className="w-5 h-5 rounded-full border-2 border-border shadow-sm flex-shrink-0"
                  style={{ 
                    backgroundColor: material.pbrProperties.color,
                    boxShadow: `inset 0 1px 2px rgba(0,0,0,0.1)`
                  }}
                  aria-hidden="true"
                />
                
                {/* Material details */}
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-sm truncate">
                    {material.displayName}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center space-x-2">
                    <span>
                      {material.priceModifier >= 0 ? '+' : ''}
                      ${Math.abs(material.priceModifier)}
                    </span>
                    {isSelected && (
                      <span className="text-cta">✓</span>
                    )}
                  </div>
                </div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Material properties info - CLAUDE_RULES: Material-only focus */}
      {selectedMaterial && (
        <div className="mt-4 p-3 bg-muted/10 rounded-lg">
          {(() => {
            const selectedMat = materials.find(m => m.id === selectedMaterial)
            if (!selectedMat) return null
            
            return (
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  {selectedMat.displayName} Properties
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Durability:</span>{' '}
                    {selectedMat.id === 'platinum' ? 'Excellent' : 'Very Good'}
                  </div>
                  <div>
                    <span className="font-medium">Finish:</span>{' '}
                    {selectedMat.pbrProperties.roughness < 0.1 ? 'High Shine' : 'Satin'}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Lab-grown compliance notice */}
      <div className="text-xs text-accent p-2 bg-accent/10 rounded">
        ✨ All materials ethically sourced with lab-grown gems only
      </div>
    </div>
  )
}

export default MaterialControls