/**
 * MaterialSelection - Extracted from CustomizationPanel for CLAUDE_RULES compliance
 * Handles material selection UI with Aurora Design System integration
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { customizationService } from '../../../services/CustomizationService'
import type { Material } from '../../../services/CustomizationService'

interface MaterialSelectionProps {
  materials?: Array<{
    id: string
    name: string
    priceModifier: number
    color: string
    metallic: number
    roughness: number
    description?: string
  }>
  selectedMaterial?: string
  onMaterialChange: (materialId: string) => void
  customPrice: number
}

export function MaterialSelection({
  materials = [],
  selectedMaterial,
  onMaterialChange,
  customPrice
}: MaterialSelectionProps) {
  // Use unified materials if none provided
  const availableMaterials = materials.length > 0 
    ? materials 
    : customizationService.getMaterials().map(m => ({
        id: m.id,
        name: m.name,
        priceModifier: m.priceModifier,
        color: m.color || 'var(--material-rose-gold, #FF6B9D)',
        metallic: m.pbrProperties.metalness,
        roughness: m.pbrProperties.roughness,
        description: m.displayName
      }))

  const getPriceModifier = (modifier: number) => {
    if (modifier === 0) return 'Base price'
    const sign = modifier > 0 ? '+' : ''
    return `${sign}$${modifier}`
  }

  const getPrismaticClass = (materialName: string) => {
    return customizationService.getPrismaticShadowClass(materialName as any) || ''
  }

  const getAuroraFocusClass = (materialName: string) => {
    return customizationService.getAuroraFocusClass(materialName as any) || 'focus:aurora-focus-default'
  }

  const getCheckmarkColorClass = (materialName: string) => {
    return customizationService.getCheckmarkColorClass(materialName as any) || ''
  }

  return (
    <div className="space-y-token-md">
      <h3 className="text-lg font-semibold text-foreground">Material</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableMaterials.map((material) => {
          const isSelected = selectedMaterial === material.id
          const prismaticClass = getPrismaticClass(material.name)
          const focusClass = getAuroraFocusClass(material.name)
          const checkmarkColorClass = getCheckmarkColorClass(material.name)
          
          return (
            <motion.button
              key={material.id}
              onClick={() => onMaterialChange(material.id)}
              data-testid="material-button"
              className={`
                relative p-4 rounded-token-lg transition-all duration-300 text-left
                ${isSelected 
                  ? `${prismaticClass} text-foreground` 
                  : 'border-2 border-border bg-background text-foreground hover:border-accent/50'
                }
                ${focusClass}
                focus:outline-none
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Material Preview */}
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                  style={{ 
                    backgroundColor: material.color,
                    background: `linear-gradient(135deg, ${material.color} 0%, ${material.color}cc 100%)`
                  }}
                />
                <div>
                  <h4 className="font-semibold text-foreground">
                    {material.description || material.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getPriceModifier(material.priceModifier)}
                  </p>
                </div>
              </div>

              {/* Material Properties */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Metallic: {(material.metallic * 100).toFixed(0)}%</div>
                <div>Roughness: {(material.roughness * 100).toFixed(0)}%</div>
              </div>

              {/* Selection Indicator - Material-specific colors */}
              {isSelected && (
                <motion.div
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${checkmarkColorClass || 'bg-accent'}`}
                  style={{
                    backgroundColor: checkmarkColorClass ? 'currentColor' : undefined,
                    opacity: checkmarkColorClass ? 0.9 : undefined
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className={`w-4 h-4 ${checkmarkColorClass ? 'text-white' : 'text-background'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Selected Material Summary */}
      {selectedMaterial && (
        <motion.div
          className="p-3 bg-muted rounded-token-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              Selected Material
            </span>
            <span className="text-sm font-semibold text-foreground">
              {availableMaterials.find(m => m.id === selectedMaterial)?.description || selectedMaterial}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default MaterialSelection