/**
 * MaterialEditor Component
 * Visual editor for material properties with real-time preview
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  RotateCcw,
  Palette,
  Sparkles,
  Waves,
  Sun
} from 'lucide-react'

interface Material {
  id: string
  name: string
  metallic: number
  roughness: number
  color: [number, number, number]
  isDefault: boolean
  description?: string
}

interface MaterialPreset {
  id: string
  name: string
  materials: Material[]
  description: string
}

export function MaterialEditor() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [presets, setPresets] = useState<MaterialPreset[]>([])
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  // Initialize with default materials
  useEffect(() => {
    const defaultMaterials: Material[] = [
      {
        id: 'platinum',
        name: 'Platinum',
        metallic: 1.0,
        roughness: 0.1,
        color: [0.9, 0.9, 0.9],
        isDefault: true,
        description: 'Premium white metal with high reflectivity'
      },
      {
        id: '18k-white-gold',
        name: '18K White Gold',
        metallic: 1.0,
        roughness: 0.15,
        color: [0.95, 0.95, 0.95],
        isDefault: true,
        description: 'Classic elegance with subtle warmth'
      },
      {
        id: '18k-yellow-gold',
        name: '18K Yellow Gold',
        metallic: 1.0,
        roughness: 0.1,
        color: [1.0, 0.86, 0.57],
        isDefault: true,
        description: 'Timeless warmth and luxury'
      },
      {
        id: '18k-rose-gold',
        name: '18K Rose Gold',
        metallic: 1.0,
        roughness: 0.12,
        color: [0.91, 0.71, 0.67],
        isDefault: true,
        description: 'Modern romance with copper undertones'
      }
    ]

    const defaultPresets: MaterialPreset[] = [
      {
        id: 'jewelry-standard',
        name: 'Jewelry Standard',
        description: 'Standard precious metal materials for jewelry',
        materials: defaultMaterials
      },
      {
        id: 'antique-collection',
        name: 'Antique Collection',
        description: 'Aged metals with increased roughness for vintage appeal',
        materials: defaultMaterials.map(m => ({
          ...m,
          id: `${m.id}-antique`,
          name: `${m.name} (Antique)`,
          roughness: m.roughness + 0.3,
          isDefault: false
        }))
      }
    ]

    setMaterials(defaultMaterials)
    setPresets(defaultPresets)
    setActivePreset('jewelry-standard')
    setSelectedMaterial('platinum')
  }, [])

  const selectedMaterialData = materials.find(m => m.id === selectedMaterial)

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ))
  }

  const createNewMaterial = () => {
    const newMaterial: Material = {
      id: `custom-${Date.now()}`,
      name: 'Custom Material',
      metallic: 0.8,
      roughness: 0.2,
      color: [0.8, 0.8, 0.8],
      isDefault: false,
      description: 'Custom material configuration'
    }
    
    setMaterials(prev => [...prev, newMaterial])
    setSelectedMaterial(newMaterial.id)
    setIsCreatingNew(false)
  }

  const duplicateMaterial = (material: Material) => {
    const newMaterial: Material = {
      ...material,
      id: `${material.id}-copy-${Date.now()}`,
      name: `${material.name} Copy`,
      isDefault: false
    }
    
    setMaterials(prev => [...prev, newMaterial])
    setSelectedMaterial(newMaterial.id)
  }

  const deleteMaterial = (id: string) => {
    const material = materials.find(m => m.id === id)
    if (material?.isDefault) return // Can't delete default materials
    
    setMaterials(prev => prev.filter(m => m.id !== id))
    if (selectedMaterial === id) {
      setSelectedMaterial(materials[0]?.id || null)
    }
  }

  const resetToDefaults = () => {
    const defaultMaterial = materials.find(m => m.isDefault && m.id === selectedMaterial)
    if (defaultMaterial && selectedMaterialData) {
      // Reset to original default values
      const originalDefaults = {
        'platinum': { metallic: 1.0, roughness: 0.1, color: [0.9, 0.9, 0.9] as [number, number, number] },
        '18k-white-gold': { metallic: 1.0, roughness: 0.15, color: [0.95, 0.95, 0.95] as [number, number, number] },
        '18k-yellow-gold': { metallic: 1.0, roughness: 0.1, color: [1.0, 0.86, 0.57] as [number, number, number] },
        '18k-rose-gold': { metallic: 1.0, roughness: 0.12, color: [0.91, 0.71, 0.67] as [number, number, number] }
      }
      
      const defaults = originalDefaults[selectedMaterial as keyof typeof originalDefaults]
      if (defaults) {
        updateMaterial(selectedMaterial, defaults)
      }
    }
  }

  const rgbToHex = (rgb: [number, number, number]) => {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')
    return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
  }

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return [r, g, b]
  }

  const getPreviewStyle = (material: Material) => ({
    background: `linear-gradient(45deg, 
      rgb(${Math.round(material.color[0] * 255)}, ${Math.round(material.color[1] * 255)}, ${Math.round(material.color[2] * 255)}),
      rgb(${Math.round(material.color[0] * 255 * 0.8)}, ${Math.round(material.color[1] * 255 * 0.8)}, ${Math.round(material.color[2] * 255 * 0.8)})
    )`,
    filter: `brightness(${1 - material.roughness * 0.3}) contrast(${1 + material.metallic * 0.5})`
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Material List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Materials</CardTitle>
              <Button
                size="sm"
                onClick={() => setIsCreatingNew(true)}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                  selectedMaterial === material.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setSelectedMaterial(material.id)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={getPreviewStyle(material)}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{material.name}</h4>
                    <p className="text-xs text-gray-500 truncate">
                      M: {material.metallic.toFixed(1)} R: {material.roughness.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {material.isDefault && (
                      <Badge variant="outline" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isCreatingNew && (
              <div className="p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Create new material?</span>
                  <div className="flex space-x-1">
                    <Button size="sm" onClick={createNewMaterial} className="h-6 text-xs">
                      Create
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsCreatingNew(false)} className="h-6 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Presets */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Presets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activePreset === preset.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => setActivePreset(preset.id)}
              >
                <h4 className="font-medium text-sm">{preset.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                <div className="flex mt-2 space-x-1">
                  {preset.materials.slice(0, 4).map((material) => (
                    <div
                      key={material.id}
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={getPreviewStyle(material)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Material Editor */}
      <div className="lg:col-span-2">
        {selectedMaterialData ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Edit Material: {selectedMaterialData.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateMaterial(selectedMaterialData)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  {selectedMaterialData.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetToDefaults}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  )}
                  {!selectedMaterialData.isDefault && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMaterial(selectedMaterialData.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Live Preview
                  </label>
                  <div className="aspect-square border border-gray-300 rounded-lg p-4 bg-gradient-to-br from-gray-100 to-gray-200">
                    <div 
                      className="w-full h-full rounded-full shadow-lg"
                      style={getPreviewStyle(selectedMaterialData)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Basic Properties */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Material Name
                    </label>
                    <Input
                      value={selectedMaterialData.name}
                      onChange={(e) => updateMaterial(selectedMaterialData.id, { name: e.target.value })}
                      placeholder="Enter material name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Description
                    </label>
                    <Input
                      value={selectedMaterialData.description || ''}
                      onChange={(e) => updateMaterial(selectedMaterialData.id, { description: e.target.value })}
                      placeholder="Enter description"
                    />
                  </div>
                </div>
              </div>

              {/* Material Properties */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Color */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Base Color
                  </label>
                  <div className="space-y-3">
                    <input
                      type="color"
                      value={rgbToHex(selectedMaterialData.color)}
                      onChange={(e) => updateMaterial(selectedMaterialData.id, { 
                        color: hexToRgb(e.target.value) 
                      })}
                      className="w-full h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <div className="text-xs text-gray-500">
                      RGB: {selectedMaterialData.color.map(c => Math.round(c * 255)).join(', ')}
                    </div>
                  </div>
                </div>

                {/* Metallic */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Metallic ({selectedMaterialData.metallic.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedMaterialData.metallic}
                    onChange={(e) => updateMaterial(selectedMaterialData.id, { 
                      metallic: parseFloat(e.target.value) 
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Dielectric</span>
                    <span>Metallic</span>
                  </div>
                </div>

                {/* Roughness */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Waves className="w-4 h-4 mr-2" />
                    Roughness ({selectedMaterialData.roughness.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedMaterialData.roughness}
                    onChange={(e) => updateMaterial(selectedMaterialData.id, { 
                      roughness: parseFloat(e.target.value) 
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Mirror</span>
                    <span>Rough</span>
                  </div>
                </div>
              </div>

              {/* Material Science Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Sun className="w-4 h-4 mr-2" />
                  Material Properties Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <strong>Metallic:</strong> Controls how metal-like the surface appears.
                    <br />• 0.0 = Dielectric (plastic, ceramic)
                    <br />• 1.0 = Metallic (gold, silver, platinum)
                  </div>
                  <div>
                    <strong>Roughness:</strong> Controls surface smoothness and reflections.
                    <br />• 0.0 = Perfect mirror finish
                    <br />• 1.0 = Completely rough, matte finish
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <Palette className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No material selected</h3>
            <p className="mt-2 text-sm text-gray-500">
              Select a material from the list to start editing
            </p>
          </div>
        )}
      </div>
    </div>
  )
}