
'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { H3, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface MaterialProperties {
  metalness: number
  roughness: number
  color: string
  reflectivity?: number
  clearcoat?: number
  clearcoatRoughness?: number
  envMapIntensity?: number
}

interface AdvancedMaterialEditorProps {
  initialMaterial: MaterialProperties
  onMaterialChange: (material: MaterialProperties) => void
  className?: string
  disabled?: boolean
}

export function AdvancedMaterialEditor({
  initialMaterial,
  onMaterialChange,
  className,
  disabled = false
}: AdvancedMaterialEditorProps) {
  const [material, setMaterial] = useState<MaterialProperties>(initialMaterial)
  const [preset, setPreset] = useState<string>('custom')
  const [isRealTime, setIsRealTime] = useState(true)

  // Material presets for quick selection
  const presets = {
    'polished-gold': {
      metalness: 1.0,
      roughness: 0.1,
      color: '#FFD700',
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      envMapIntensity: 1.0
    },
    'brushed-silver': {
      metalness: 1.0,
      roughness: 0.3,
      color: '#C0C0C0',
      reflectivity: 0.7,
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.8
    },
    'matte-platinum': {
      metalness: 1.0,
      roughness: 0.7,
      color: '#E5E4E2',
      reflectivity: 0.4,
      clearcoat: 0.0,
      clearcoatRoughness: 1.0,
      envMapIntensity: 0.5
    },
    'rose-gold': {
      metalness: 1.0,
      roughness: 0.15,
      color: '#E8B4B8',
      reflectivity: 0.85,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      envMapIntensity: 0.9
    }
  }

  // Update material with debouncing for performance
  const updateMaterial = useCallback((newMaterial: MaterialProperties) => {
    setMaterial(newMaterial)
    
    if (isRealTime) {
      // Real-time updates for premium users
      onMaterialChange(newMaterial)
    }
  }, [onMaterialChange, isRealTime])

  // Apply preset
  const applyPreset = useCallback((presetName: string) => {
    if (presetName in presets) {
      const presetMaterial = presets[presetName as keyof typeof presets]
      setPreset(presetName)
      updateMaterial(presetMaterial)
    }
  }, [updateMaterial])

  // Handle slider changes
  const handleSliderChange = useCallback((property: keyof MaterialProperties, value: number) => {
    const newMaterial = { ...material, [property]: value }
    updateMaterial(newMaterial)
    setPreset('custom')
  }, [material, updateMaterial])

  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    const newMaterial = { ...material, color }
    updateMaterial(newMaterial)
    setPreset('custom')
  }, [material, updateMaterial])

  // Apply changes button for non-real-time mode
  const applyChanges = useCallback(() => {
    onMaterialChange(material)
  }, [material, onMaterialChange])

  // Slider component
  const MaterialSlider = ({ 
    label, 
    property, 
    min = 0, 
    max = 1, 
    step = 0.01, 
    unit = '' 
  }: {
    label: string
    property: keyof MaterialProperties
    min?: number
    max?: number
    step?: number
    unit?: string
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <MutedText size="sm" className="font-medium">{label}</MutedText>
        <MutedText size="sm" className="text-accent">
          {((material[property] as number) || 0).toFixed(2)}{unit}
        </MutedText>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={(material[property] as number) || 0}
        onChange={(e) => handleSliderChange(property, parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  )

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <H3>Advanced Material Editor</H3>
        <div className="flex items-center space-x-2">
          <Button
            variant={isRealTime ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsRealTime(!isRealTime)}
            disabled={disabled}
          >
            {isRealTime ? '⚡ Live' : '👁️ Preview'}
          </Button>
        </div>
      </div>

      {/* Material Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(presets).map(([name, presetMaterial]) => (
              <Button
                key={name}
                variant={preset === name ? 'primary' : 'outline'}
                size="sm"
                onClick={() => applyPreset(name)}
                disabled={disabled}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: presetMaterial.color }}
                  />
                  <span className="text-xs capitalize">
                    {name.replace('-', ' ')}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Base Color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={material.color}
                onChange={(e) => handleColorChange(e.target.value)}
                disabled={disabled}
                className="w-12 h-12 rounded-lg border border-border cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={material.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Physical Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MaterialSlider
            label="Metalness"
            property="metalness"
            min={0}
            max={1}
          />
          <MaterialSlider
            label="Roughness"
            property="roughness"
            min={0}
            max={1}
          />
          <MaterialSlider
            label="Reflectivity"
            property="reflectivity"
            min={0}
            max={1}
          />
        </CardContent>
      </Card>

      {/* Advanced Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Finish & Coating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MaterialSlider
            label="Clear Coat"
            property="clearcoat"
            min={0}
            max={1}
          />
          <MaterialSlider
            label="Clear Coat Roughness"
            property="clearcoatRoughness"
            min={0}
            max={1}
          />
          <MaterialSlider
            label="Environment Reflection"
            property="envMapIntensity"
            min={0}
            max={2}
          />
        </CardContent>
      </Card>

      {/* Apply Button for Preview Mode */}
      {!isRealTime && (
        <div className="flex justify-center">
          <Button
            onClick={applyChanges}
            disabled={disabled}
            className="w-full"
          >
            Apply Material Changes
          </Button>
        </div>
      )}

      {/* Material Summary */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="pt-4">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Preset:</span>
              <span className="capitalize">{preset.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Update Mode:</span>
              <span>{isRealTime ? 'Real-time' : 'Preview'}</span>
            </div>
            <div className="flex justify-between">
              <span>Finish:</span>
              <span>
                {material.roughness < 0.3 ? 'High Gloss' : 
                 material.roughness < 0.6 ? 'Satin' : 'Matte'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}