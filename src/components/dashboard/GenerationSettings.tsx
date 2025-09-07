/**
 * Generation Settings Component
 * Customizable settings for 3D sequence generation
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  Settings, 
  Sliders, 
  Image, 
  FileImage, 
  Palette,
  Lightbulb,
  Maximize,
  Clock,
  Save,
  RotateCcw
} from 'lucide-react'

export interface GenerationConfig {
  imageCount: number
  imageSize: { width: number; height: number }
  imageFormats: string[]
  qualitySettings: {
    avif: number
    webp: number
    png: number
  }
  lighting: 'studio' | 'natural' | 'dramatic' | 'soft'
  background: 'transparent' | 'white' | 'black' | 'gradient'
  rotationAxis: 'y' | 'x' | 'z'
  antialiasing: boolean
  outputColorSpace: 'srgb' | 'rec2020' | 'p3'
  maxConcurrentJobs: number
}

const DEFAULT_CONFIG: GenerationConfig = {
  imageCount: 36,
  imageSize: { width: 1024, height: 1024 },
  imageFormats: ['avif', 'webp', 'png'],
  qualitySettings: {
    avif: 80,
    webp: 85,
    png: 9
  },
  lighting: 'studio',
  background: 'transparent',
  rotationAxis: 'y',
  antialiasing: true,
  outputColorSpace: 'srgb',
  maxConcurrentJobs: 2
}

const PRESET_CONFIGS = {
  'fast': {
    ...DEFAULT_CONFIG,
    imageCount: 24,
    imageSize: { width: 512, height: 512 },
    imageFormats: ['webp'],
    qualitySettings: { avif: 60, webp: 70, png: 6 },
    antialiasing: false
  },
  'balanced': DEFAULT_CONFIG,
  'high-quality': {
    ...DEFAULT_CONFIG,
    imageCount: 72,
    imageSize: { width: 2048, height: 2048 },
    qualitySettings: { avif: 90, webp: 95, png: 9 },
    antialiasing: true
  },
  'web-optimized': {
    ...DEFAULT_CONFIG,
    imageCount: 36,
    imageSize: { width: 800, height: 800 },
    imageFormats: ['avif', 'webp'],
    qualitySettings: { avif: 75, webp: 80, png: 6 }
  }
}

interface GenerationSettingsProps {
  config: GenerationConfig
  onConfigChange: (config: GenerationConfig) => void
  isGenerating?: boolean
  className?: string
}

export function GenerationSettings({ 
  config, 
  onConfigChange, 
  isGenerating = false,
  className = ''
}: GenerationSettingsProps) {
  const [localConfig, setLocalConfig] = useState<GenerationConfig>(config)
  const [hasChanges, setHasChanges] = useState(false)

  const updateConfig = (updates: Partial<GenerationConfig>) => {
    const newConfig = { ...localConfig, ...updates }
    setLocalConfig(newConfig)
    setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(config))
  }

  const applyPreset = (presetName: keyof typeof PRESET_CONFIGS) => {
    const preset = PRESET_CONFIGS[presetName]
    setLocalConfig(preset)
    setHasChanges(JSON.stringify(preset) !== JSON.stringify(config))
  }

  const saveSettings = () => {
    onConfigChange(localConfig)
    setHasChanges(false)
  }

  const resetSettings = () => {
    setLocalConfig(config)
    setHasChanges(false)
  }

  const getEstimatedFileSize = () => {
    const { imageCount, imageSize, imageFormats } = localConfig
    const pixelCount = imageSize.width * imageSize.height
    
    // Rough estimation based on format and quality
    const avgSizePerImage = imageFormats.reduce((acc, format) => {
      switch (format) {
        case 'avif': return acc + (pixelCount * 0.5) // Very efficient
        case 'webp': return acc + (pixelCount * 0.8) // Good compression
        case 'png': return acc + (pixelCount * 3) // Larger but lossless
        default: return acc
      }
    }, 0)

    const totalSize = avgSizePerImage * imageCount
    return formatFileSize(totalSize)
  }

  const getEstimatedDuration = () => {
    const { imageCount } = localConfig
    const secondsPerFrame = localConfig.imageSize.width > 1024 ? 3 : 2
    const totalSeconds = imageCount * secondsPerFrame
    
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Presets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Generation Settings
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={resetSettings}
                disabled={!hasChanges || isGenerating}
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={saveSettings}
                disabled={!hasChanges || isGenerating}
                className="flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-token-md">
            <div>
              <label className="text-sm font-medium mb-2 block">Quick Presets</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(PRESET_CONFIGS).map(([name, preset]) => (
                  <Button
                    key={name}
                    size="sm"
                    variant="outline"
                    onClick={() => applyPreset(name as keyof typeof PRESET_CONFIGS)}
                    disabled={isGenerating}
                    className="text-xs capitalize"
                  >
                    {name.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-aurora-nav-muted">Estimated Size</p>
                <p className="font-medium text-lg">{getEstimatedFileSize()}</p>
              </div>
              <div>
                <p className="text-aurora-nav-muted">Est. Duration</p>
                <p className="font-medium text-lg">{getEstimatedDuration()}</p>
              </div>
              <div>
                <p className="text-aurora-nav-muted">Total Images</p>
                <p className="font-medium text-lg">{localConfig.imageCount * localConfig.imageFormats.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Image Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Image Count</label>
              <div className="space-y-token-sm">
                <Input
                  type="number"
                  min="12"
                  max="360"
                  step="12"
                  value={localConfig.imageCount}
                  onChange={(e) => updateConfig({ imageCount: parseInt(e.target.value) || 36 })}
                  disabled={isGenerating}
                />
                <p className="text-xs text-aurora-nav-muted">
                  Number of frames for 360° rotation (12-360, multiples of 12)
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Image Size</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="256"
                  max="4096"
                  step="256"
                  value={localConfig.imageSize.width}
                  onChange={(e) => updateConfig({ 
                    imageSize: { 
                      ...localConfig.imageSize, 
                      width: parseInt(e.target.value) || 1024 
                    }
                  })}
                  disabled={isGenerating}
                  placeholder="Width"
                />
                <Input
                  type="number"
                  min="256"
                  max="4096"
                  step="256"
                  value={localConfig.imageSize.height}
                  onChange={(e) => updateConfig({ 
                    imageSize: { 
                      ...localConfig.imageSize, 
                      height: parseInt(e.target.value) || 1024 
                    }
                  })}
                  disabled={isGenerating}
                  placeholder="Height"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Output Formats</label>
            <div className="grid grid-cols-3 gap-3">
              {['avif', 'webp', 'png'].map((format) => (
                <label key={format} className="flex items-center space-x-token-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.imageFormats.includes(format)}
                    onChange={(e) => {
                      const formats = e.target.checked
                        ? [...localConfig.imageFormats, format]
                        : localConfig.imageFormats.filter(f => f !== format)
                      updateConfig({ imageFormats: formats })
                    }}
                    disabled={isGenerating}
                    className="rounded"
                  />
                  <span className="text-sm font-medium uppercase">{format}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            Quality Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">AVIF Quality</label>
              <div className="space-y-token-sm">
                <Input
                  type="range"
                  min="20"
                  max="100"
                  value={localConfig.qualitySettings.avif}
                  onChange={(e) => updateConfig({
                    qualitySettings: {
                      ...localConfig.qualitySettings,
                      avif: parseInt(e.target.value)
                    }
                  })}
                  disabled={isGenerating}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-aurora-nav-muted">
                  <span>Lower size</span>
                  <span>{localConfig.qualitySettings.avif}%</span>
                  <span>Higher quality</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">WebP Quality</label>
              <div className="space-y-token-sm">
                <Input
                  type="range"
                  min="20"
                  max="100"
                  value={localConfig.qualitySettings.webp}
                  onChange={(e) => updateConfig({
                    qualitySettings: {
                      ...localConfig.qualitySettings,
                      webp: parseInt(e.target.value)
                    }
                  })}
                  disabled={isGenerating}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-aurora-nav-muted">
                  <span>Lower size</span>
                  <span>{localConfig.qualitySettings.webp}%</span>
                  <span>Higher quality</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">PNG Compression</label>
              <div className="space-y-token-sm">
                <Input
                  type="range"
                  min="0"
                  max="9"
                  value={localConfig.qualitySettings.png}
                  onChange={(e) => updateConfig({
                    qualitySettings: {
                      ...localConfig.qualitySettings,
                      png: parseInt(e.target.value)
                    }
                  })}
                  disabled={isGenerating}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-aurora-nav-muted">
                  <span>Faster</span>
                  <span>Level {localConfig.qualitySettings.png}</span>
                  <span>Smaller</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rendering Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Rendering Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Lighting Style</label>
              <select
                value={localConfig.lighting}
                onChange={(e) => updateConfig({ lighting: e.target.value as GenerationConfig['lighting'] })}
                disabled={isGenerating}
                className="w-full px-3 py-2 border rounded-token-md text-sm"
              >
                <option value="studio">Studio (Professional)</option>
                <option value="natural">Natural (Outdoor)</option>
                <option value="dramatic">Dramatic (High contrast)</option>
                <option value="soft">Soft (Diffused)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Background</label>
              <select
                value={localConfig.background}
                onChange={(e) => updateConfig({ background: e.target.value as GenerationConfig['background'] })}
                disabled={isGenerating}
                className="w-full px-3 py-2 border rounded-token-md text-sm"
              >
                <option value="transparent">Transparent</option>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-token-sm cursor-pointer">
              <input
                type="checkbox"
                checked={localConfig.antialiasing}
                onChange={(e) => updateConfig({ antialiasing: e.target.checked })}
                disabled={isGenerating}
                className="rounded"
              />
              <span className="text-sm font-medium">Enable Antialiasing</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GenerationSettings