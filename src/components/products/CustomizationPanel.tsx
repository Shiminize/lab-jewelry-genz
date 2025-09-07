'use client'

/**
 * Customization Panel Component - Refactored for CLAUDE_RULES compliance
 * Interactive panel for selecting product customization options
 * Supports materials, gemstones, sizes, finishes, and engraving
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MaterialSelection } from './customization/MaterialSelection'
import { GemstoneSelection } from './customization/GemstoneSelection'
import { SizeSelection } from './customization/SizeSelection'
import { EngravingSelection } from './customization/EngravingSelection'

interface CustomizationPanelProps {
  product: {
    id: string
    name: string
    price: {
      base: number
      current: number
      currency: string
    }
    customization: {
      materials?: Array<{
        id: string
        name: string
        priceModifier: number
        color: string
        metallic: number
        roughness: number
        description?: string
      }>
      gemstones?: Array<{
        id: string
        name: string
        priceModifier: number
        color: string
        size: string
        clarity: string
        description?: string
      }>
      sizes?: Array<{
        value: string
        label: string
        priceModifier: number
        description?: string
      }>
      finishes?: Array<{
        id: string
        name: string
        priceModifier: number
        description: string
      }>
      engraving?: {
        enabled: boolean
        maxLength: number
        fonts: string[]
        positions: string[]
        priceModifier: number
      }
    }
  }
  customization: {
    material?: string
    gemstone?: string
    size?: string
    finish?: string
    engraving?: string
  }
  onCustomizationChange: (key: string, value: string | undefined) => void
  customPrice: number
  customSKU: string
  isValid: boolean
}

export default function CustomizationPanel({
  product,
  customization,
  onCustomizationChange,
  customPrice,
  customSKU
}: CustomizationPanelProps) {
  const [activeSection, setActiveSection] = useState<string | null>('material')
  const [engravingText, setEngravingText] = useState(customization.engraving || '')
  const [selectedFont, setSelectedFont] = useState('classic')
  const [selectedPosition, setSelectedPosition] = useState('inside')

  // Handle engraving text change
  const handleEngravingChange = useCallback((text: string) => {
    setEngravingText(text)
    onCustomizationChange('engraving', text.trim() !== '' ? text : undefined)
  }, [onCustomizationChange])

  // Calculate price difference for an option
  const getPriceModifier = (modifier: number) => {
    if (modifier === 0) return null
    const sign = modifier > 0 ? '+' : ''
    return `${sign}$${modifier.toFixed(2)}`
  }

  // Render material options
  const renderMaterials = () => {
    if (!product.customization.materials?.length) return null

    return (
      <MaterialSelection
        materials={product.customization.materials}
        selectedMaterial={customization.material}
        onMaterialChange={(materialId) => onCustomizationChange('material', materialId)}
        customPrice={customPrice}
      />
    )
  }

  // Render gemstone options
  const renderGemstones = () => {
    if (!product.customization.gemstones?.length) return null

    return (
      <GemstoneSelection
        gemstones={product.customization.gemstones}
        selectedGemstone={customization.gemstone}
        onGemstoneChange={(gemstoneId) => onCustomizationChange('gemstone', gemstoneId)}
      />
    )
  }

  // Render size options
  const renderSizes = () => {
    if (!product.customization.sizes?.length) return null

    return (
      <SizeSelection
        sizes={product.customization.sizes}
        selectedSize={customization.size}
        onSizeChange={(size) => onCustomizationChange('size', size)}
      />
    )
  }

  // Render finish options
  const renderFinishes = () => {
    if (!product.customization.finishes?.length) return null

    return (
      <div className="space-y-token-md">
        <h3 className="text-lg font-semibold text-foreground">Finish</h3>
        <div className="space-y-token-sm">
          {product.customization.finishes.map((finish) => (
            <button
              key={finish.id}
              onClick={() => onCustomizationChange('finish', finish.id)}
              className={`w-full p-4 rounded-token-lg border-2 transition-all duration-200 text-left ${
                customization.finish === finish.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-border hover:border-border bg-background'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{finish.name}</div>
                  <div className="text-sm text-aurora-nav-muted mt-1">{finish.description}</div>
                </div>
                <div className="flex items-center space-x-token-sm">
                  {getPriceModifier(finish.priceModifier) && (
                    <div className="text-sm font-medium text-amber-600">
                      {getPriceModifier(finish.priceModifier)}
                    </div>
                  )}
                  {customization.finish === finish.id && (
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Render engraving options
  const renderEngraving = () => {
    if (!product.customization.engraving?.enabled) return null

    return (
      <EngravingSelection
        engraving={product.customization.engraving}
        engravingText={engravingText}
        onEngravingChange={handleEngravingChange}
        onEngravingUpdate={(engraving) => {
          setSelectedFont(engraving.font)
          setSelectedPosition(engraving.position)
        }}
      />
    )
  }

  const sections = [
    { id: 'material', label: 'Materials', component: renderMaterials },
    { id: 'gemstone', label: 'Stones', component: renderGemstones },
    { id: 'size', label: 'Size', component: renderSizes },
    { id: 'finish', label: 'Finish', component: renderFinishes },
    { id: 'engraving', label: 'Personalize', component: renderEngraving }
  ].filter(section => {
    // Only show sections that have content
    if (section.id === 'material') return product.customization.materials?.length > 0
    if (section.id === 'gemstone') return product.customization.gemstones?.length > 0
    if (section.id === 'size') return product.customization.sizes?.length > 0
    if (section.id === 'finish') return product.customization.finishes?.length > 0
    if (section.id === 'engraving') return product.customization.engraving?.enabled
    return false
  })

  return (
    <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Section Tabs */}
      <div className="border-b border-border bg-muted">
        <nav className="flex space-x-token-md p-4 overflow-x-auto" aria-label="Customization options">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={`whitespace-nowrap py-2 px-4 text-sm font-medium rounded-token-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'text-aurora-nav-muted hover:text-foreground hover:bg-muted'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeSection && (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {sections.find(s => s.id === activeSection)?.component()}
            </motion.div>
          )}
        </AnimatePresence>

        {!activeSection && (
          <div className="text-center py-8">
            <div className="text-aurora-nav-muted text-lg mb-2">Choose Your Perfect Style</div>
            <div className="text-muted-foreground text-sm">
              Select from the customization options above to personalize your jewelry
            </div>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="border-t border-border bg-muted px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-aurora-nav-muted">Total Price</div>
            <div className="text-2xl font-bold text-foreground">
              ${customPrice.toFixed(2)}
            </div>
            {customPrice !== product.price.base && (
              <div className="text-sm text-aurora-nav-muted line-through">
                ${product.price.base.toFixed(2)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-aurora-nav-muted">SKU</div>
            <div className="text-sm font-mono text-foreground">{customSKU}</div>
          </div>
        </div>
      </div>
    </div>
  )
}