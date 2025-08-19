'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sparkles, Grid, Layers, Zap } from 'lucide-react'

interface WireframeOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  layout: 'horizontal' | 'vertical' | 'grid'
}

const wireframeOptions: WireframeOption[] = [
  {
    id: 'option1',
    name: 'Hero-Focused Layout',
    description: 'Large hero section with minimal navigation, emphasizing Moissanite collection',
    icon: <Layers className="w-5 h-5" />,
    features: [
      'Full-screen Moissanite hero',
      'Simplified 4-item navigation',
      'Prominent 3D customizer CTA',
      'Floating social proof',
      'Creator program integration'
    ],
    layout: 'horizontal'
  },
  {
    id: 'option2', 
    name: 'Product-Grid Layout',
    description: 'Clean grid showcasing Moissanite products with streamlined sidebar navigation',
    icon: <Grid className="w-5 h-5" />,
    features: [
      'Left sidebar navigation',
      'Moissanite product grid',
      'Filter by metal/stone',
      'Quick customizer access',
      'Sustainability badges'
    ],
    layout: 'grid'
  },
  {
    id: 'option3',
    name: 'Story-Driven Layout', 
    description: 'Vertical storytelling approach highlighting sustainability and customization',
    icon: <Zap className="w-5 h-5" />,
    features: [
      'Progressive disclosure',
      'Moissanite education section',
      'Interactive 3D previews',
      'Creator spotlights',
      'Value comparison tools'
    ],
    layout: 'vertical'
  }
]

export function MinimalistWireframes() {
  const [selectedOption, setSelectedOption] = useState<string>(wireframeOptions[0].id)
  
  const selectedWireframe = wireframeOptions.find(option => option.id === selectedOption)

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-foreground bg-background font-headline font-bold text-3xl lg:text-4xl">
          Minimalist Layout Options
        </h2>
        <p className="text-gray-600 bg-background font-body text-lg max-w-3xl mx-auto">
          Three wireframe approaches to showcase our Moissanite + 925 Silver collection 
          while promoting the 3D customizer and creator program.
        </p>
      </div>

      {/* Option Selector */}
      <div className="flex flex-col lg:flex-row gap-4 justify-center">
        {wireframeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left space-y-3 ${
              selectedOption === option.id
                ? 'border-cta bg-cta/5'
                : 'border-gray-200 hover:border-cta/50 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${selectedOption === option.id ? 'bg-cta text-background' : 'bg-gray-100 text-gray-600'}`}>
                {option.icon}
              </div>
              <h3 className="text-foreground bg-background font-semibold">{option.name}</h3>
            </div>
            <p className="text-gray-600 bg-background text-sm">{option.description}</p>
          </button>
        ))}
      </div>

      {/* Wireframe Display */}
      {selectedWireframe && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground bg-white font-semibold text-xl flex items-center space-x-2">
              {selectedWireframe.icon}
              <span>{selectedWireframe.name}</span>
            </h3>
            <Button variant="primary" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Implement This Layout
            </Button>
          </div>

          {/* Wireframe Visualization */}
          <div className="bg-gray-50 rounded-xl p-6 min-h-96">
            {selectedWireframe.layout === 'horizontal' && <HorizontalWireframe />}
            {selectedWireframe.layout === 'grid' && <GridWireframe />}
            {selectedWireframe.layout === 'vertical' && <VerticalWireframe />}
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="text-foreground bg-white font-semibold">Key Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedWireframe.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-cta rounded-full" />
                  <span className="text-gray-600 bg-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Wireframe Components
function HorizontalWireframe() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="h-12 bg-white rounded-lg flex items-center justify-between px-4">
        <div className="w-24 h-6 bg-cta/20 rounded" />
        <div className="flex space-x-4">
          <div className="w-16 h-4 bg-gray-200 rounded" />
          <div className="w-20 h-4 bg-gray-200 rounded" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
          <div className="w-18 h-4 bg-cta/30 rounded" />
        </div>
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="h-64 bg-gradient-to-r from-cta/10 to-accent/10 rounded-lg p-6 flex items-center">
        <div className="w-1/2 space-y-4">
          <div className="w-3/4 h-8 bg-cta/30 rounded" />
          <div className="w-full h-4 bg-gray-300 rounded" />
          <div className="w-5/6 h-4 bg-gray-300 rounded" />
          <div className="flex space-x-3 mt-6">
            <div className="w-32 h-10 bg-cta rounded-lg" />
            <div className="w-28 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="w-1/2 flex justify-center">
          <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-cta" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-lg p-4 space-y-2">
            <div className="h-16 bg-gray-100 rounded" />
            <div className="w-3/4 h-3 bg-gray-200 rounded" />
            <div className="w-1/2 h-3 bg-cta/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function GridWireframe() {
  return (
    <div className="flex space-x-4">
      {/* Sidebar */}
      <div className="w-1/4 space-y-4">
        <div className="h-8 bg-cta/20 rounded" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-10 bg-cta rounded" />
      </div>

      {/* Main Content */}
      <div className="w-3/4 space-y-4">
        {/* Search/Filter Bar */}
        <div className="h-12 bg-white rounded-lg flex items-center justify-between px-4">
          <div className="w-48 h-8 bg-gray-100 rounded-full" />
          <div className="flex space-x-2">
            <div className="w-16 h-6 bg-gray-200 rounded" />
            <div className="w-16 h-6 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-3">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cta" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-200 rounded" />
                <div className="w-2/3 h-3 bg-gray-200 rounded" />
                <div className="w-1/2 h-4 bg-cta/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VerticalWireframe() {
  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="h-10 bg-white rounded-lg flex items-center justify-between px-4">
        <div className="w-20 h-6 bg-cta/20 rounded" />
        <div className="flex space-x-6">
          <div className="w-16 h-4 bg-gray-200 rounded" />
          <div className="w-20 h-4 bg-gray-200 rounded" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
        </div>
        <div className="w-24 h-6 bg-cta rounded" />
      </div>

      {/* Story Sections */}
      <div className="space-y-4">
        {/* Moissanite Introduction */}
        <div className="bg-gradient-to-r from-cta/5 to-transparent rounded-lg p-6 flex items-center space-x-6">
          <div className="w-24 h-24 bg-cta/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-cta" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="w-3/4 h-6 bg-cta/30 rounded" />
            <div className="w-full h-3 bg-gray-300 rounded" />
            <div className="w-5/6 h-3 bg-gray-300 rounded" />
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center space-y-3">
            <div className="w-12 h-12 bg-accent/20 rounded-full mx-auto" />
            <div className="w-3/4 h-4 bg-gray-200 rounded mx-auto" />
            <div className="w-1/2 h-3 bg-gray-200 rounded mx-auto" />
          </div>
          <div className="bg-white rounded-lg p-4 text-center space-y-3">
            <div className="w-12 h-12 bg-cta/20 rounded-full mx-auto" />
            <div className="w-3/4 h-4 bg-gray-200 rounded mx-auto" />
            <div className="w-1/2 h-3 bg-gray-200 rounded mx-auto" />
          </div>
          <div className="bg-white rounded-lg p-4 text-center space-y-3">
            <div className="w-12 h-12 bg-accent/30 rounded-full mx-auto" />
            <div className="w-3/4 h-4 bg-gray-200 rounded mx-auto" />
            <div className="w-1/2 h-3 bg-gray-200 rounded mx-auto" />
          </div>
        </div>

        {/* Creator Spotlight */}
        <div className="bg-white rounded-lg p-6 flex space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cta/20 to-accent/20 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="w-1/3 h-4 bg-gray-200 rounded" />
            <div className="w-full h-3 bg-gray-200 rounded" />
            <div className="w-3/4 h-3 bg-gray-200 rounded" />
          </div>
          <div className="w-20 h-8 bg-cta/20 rounded" />
        </div>
      </div>
    </div>
  )
}