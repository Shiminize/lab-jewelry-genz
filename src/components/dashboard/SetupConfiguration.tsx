/**
 * Setup Configuration Component
 * Integrated material editor and generation settings
 */

'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { MaterialEditor } from './MaterialEditor'
import GenerationSettings, { GenerationConfig } from './GenerationSettings'
import { Settings, Palette } from 'lucide-react'

const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
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

interface SetupConfigurationProps {
  isGenerating?: boolean
}

export function SetupConfiguration({ isGenerating = false }: SetupConfigurationProps) {
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>(DEFAULT_GENERATION_CONFIG)

  const handleConfigChange = (config: GenerationConfig) => {
    setGenerationConfig(config)
    // TODO: Save to localStorage or API
    console.log('Generation config updated:', config)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Generation Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-6">
          <MaterialEditor />
        </TabsContent>

        <TabsContent value="generation" className="mt-6">
          <GenerationSettings
            config={generationConfig}
            onConfigChange={handleConfigChange}
            isGenerating={isGenerating}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SetupConfiguration