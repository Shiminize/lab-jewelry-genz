'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'
import type { Material } from '@/types/customizer'

interface MaterialSelectorProps {
  selectedMaterial: Material | null
  onMaterialChange: (material: Material) => void
  className?: string
}

const AVAILABLE_MATERIALS: Material[] = [
  {
    id: 'recycled-gold',
    name: 'Recycled Gold',
    description: 'Sustainably sourced, responsibly crafted luxury',
    priceMultiplier: 1.0,
    color: 'var(--color-material-gold)' // Using CSS custom property for design token
  },
  {
    id: 'lab-platinum',
    name: 'Lab-Grown Platinum',
    description: 'Precision-engineered, zero-compromise elegance',
    priceMultiplier: 1.8,
    color: 'var(--color-material-platinum)' // Using CSS custom property for design token
  },
  {
    id: 'ethical-silver',
    name: 'Ethical Silver',
    description: 'Conscious craftsmanship, timeless brilliance',
    priceMultiplier: 0.3,
    color: 'var(--color-material-silver)' // Using CSS custom property for design token
  }
]

export function MaterialSelector({
  selectedMaterial,
  onMaterialChange,
  className
}: MaterialSelectorProps) {
  const [hoveredMaterial, setHoveredMaterial] = useState<string | null>(null)

  const handleMaterialSelect = (material: Material) => {
    onMaterialChange(material)
  }

  const MaterialOption = ({ material }: { material: Material }) => {
    const isSelected = selectedMaterial?.id === material.id
    const isHovered = hoveredMaterial === material.id

    return (
      <button
        onClick={() => handleMaterialSelect(material)}
        onMouseEnter={() => setHoveredMaterial(material.id)}
        onMouseLeave={() => setHoveredMaterial(null)}
        className={cn(
          'relative group w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          'hover:shadow-md active:scale-[0.98]',
          isSelected 
            ? 'border-accent bg-accent/10 shadow-md' 
            : 'border-border bg-background hover:border-accent/50'
        )}
        aria-label={`Select ${material.name} - ${material.description}`}
        role="radio"
        aria-checked={isSelected}
      >
        {/* Material color indicator */}
        <div className="flex items-start space-x-3">
          <div className="relative flex-shrink-0">
            <div 
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all',
                isSelected ? 'border-accent scale-110' : 'border-border group-hover:border-accent/50'
              )}
              style={{ backgroundColor: material.color }}
            />
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-3 h-3 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <H3 className={cn(
              'text-base font-semibold transition-colors',
              isSelected ? 'text-foreground' : 'text-foreground group-hover:text-accent'
            )}>
              {material.name}
            </H3>
            <BodyText className="text-sm text-foreground mt-1 leading-relaxed">
              {material.description}
            </BodyText>
            
            {/* Price modifier indicator */}
            <div className="flex items-center mt-2">
              {material.priceMultiplier !== 1.0 && (
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  material.priceMultiplier > 1 
                    ? 'bg-cta/10 text-cta' 
                    : 'bg-success/10 text-success'
                )}>
                  {material.priceMultiplier > 1 
                    ? `+${Math.round((material.priceMultiplier - 1) * 100)}%`
                    : `-${Math.round((1 - material.priceMultiplier) * 100)}%`
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className={cn(
          'absolute inset-0 rounded-lg bg-gradient-to-r from-accent/5 to-transparent',
          'opacity-0 transition-opacity duration-200',
          (isHovered || isSelected) && 'opacity-100'
        )} />
      </button>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-6">
        <H3 className="text-foreground mb-2">Choose Material</H3>
        <MutedText size="sm">
          Select the precious metal for your custom piece
        </MutedText>
      </div>

      <div 
        className="space-y-3"
        role="radiogroup" 
        aria-label="Material selection"
      >
        {AVAILABLE_MATERIALS.map((material) => (
          <MaterialOption key={material.id} material={material} />
        ))}
      </div>

      {/* Selected material summary for mobile */}
      {selectedMaterial && (
        <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg md:hidden">
          <BodyText className="text-sm font-medium text-foreground">
            Selected: {selectedMaterial.name}
          </BodyText>
          <MutedText size="sm" className="mt-1">
            {selectedMaterial.description}
          </MutedText>
        </div>
      )}
    </div>
  )
}