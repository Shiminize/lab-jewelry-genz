'use client'

/**
 * Customization Panel Component
 * Interactive panel for selecting product customization options
 * Supports materials, gemstones, sizes, finishes, and engraving
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  customSKU,
  isValid
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Choose Your Material</h3>
        <p className="text-sm text-gray-600 mb-4">Select from our collection of recycled precious metals</p>
        <div className="grid grid-cols-2 gap-3">
          {product.customization.materials.map((material) => (
            <button
              key={material.id}
              onClick={() => onCustomizationChange('material', material.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                customization.material === material.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* Material Color Preview */}
              <div
                className="w-8 h-8 rounded-full mb-3 border-2 border-gray-200"
                style={{ backgroundColor: material.color }}
              />
              
              <div className="space-y-1">
                <div className="font-medium text-gray-900">{material.name}</div>
                {material.description && (
                  <div className="text-xs text-gray-600">{material.description}</div>
                )}
                {getPriceModifier(material.priceModifier) && (
                  <div className="text-sm font-medium text-amber-600">
                    {getPriceModifier(material.priceModifier)}
                  </div>
                )}
              </div>

              {customization.material === material.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Render gemstone options
  const renderGemstones = () => {
    if (!product.customization.gemstones?.length) return null

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Gemstone</h3>
        <div className="grid grid-cols-2 gap-3">
          {product.customization.gemstones.map((gemstone) => (
            <button
              key={gemstone.id}
              onClick={() => onCustomizationChange('gemstone', gemstone.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                customization.gemstone === gemstone.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* Gemstone Color Preview */}
              <div
                className="w-8 h-8 rounded-full mb-3 border-2 border-gray-200 relative overflow-hidden"
                style={{ backgroundColor: gemstone.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40" />
              </div>
              
              <div className="space-y-1">
                <div className="font-medium text-gray-900">{gemstone.name}</div>
                <div className="text-xs text-gray-600">
                  {gemstone.size} • {gemstone.clarity}
                </div>
                {gemstone.description && (
                  <div className="text-xs text-gray-600">{gemstone.description}</div>
                )}
                {getPriceModifier(gemstone.priceModifier) && (
                  <div className="text-sm font-medium text-amber-600">
                    {getPriceModifier(gemstone.priceModifier)}
                  </div>
                )}
              </div>

              {customization.gemstone === gemstone.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Render size options
  const renderSizes = () => {
    if (!product.customization.sizes?.length) return null

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Size</h3>
        <div className="grid grid-cols-4 gap-2">
          {product.customization.sizes.map((size) => (
            <button
              key={size.value}
              onClick={() => onCustomizationChange('size', size.value)}
              className={`relative p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                customization.size === size.value
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="font-medium text-gray-900">{size.label}</div>
              {getPriceModifier(size.priceModifier) && (
                <div className="text-xs font-medium text-amber-600 mt-1">
                  {getPriceModifier(size.priceModifier)}
                </div>
              )}

              {customization.size === size.value && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Render finish options
  const renderFinishes = () => {
    if (!product.customization.finishes?.length) return null

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Finish</h3>
        <div className="space-y-2">
          {product.customization.finishes.map((finish) => (
            <button
              key={finish.id}
              onClick={() => onCustomizationChange('finish', finish.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                customization.finish === finish.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{finish.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{finish.description}</div>
                </div>
                <div className="flex items-center space-x-2">
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

    const { maxLength, fonts, positions, priceModifier } = product.customization.engraving

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Make It Personal</h3>
          {priceModifier > 0 && (
            <div className="text-sm font-medium text-amber-600">
              +${priceModifier.toFixed(2)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Engraving Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Engraving Text
            </label>
            <textarea
              value={engravingText}
              onChange={(e) => handleEngravingChange(e.target.value)}
              maxLength={maxLength}
              placeholder="Add your personal message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              rows={3}
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-500">
                Max {maxLength} characters
              </div>
              <div className="text-xs text-gray-500">
                {engravingText.length}/{maxLength}
              </div>
            </div>
          </div>

          {/* Font Selection */}
          {fonts?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map((font) => (
                  <button
                    key={font}
                    onClick={() => setSelectedFont(font)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center capitalize ${
                      selectedFont === font
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Position Selection */}
          {positions?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                {positions.map((position) => (
                  <button
                    key={position}
                    onClick={() => setSelectedPosition(position)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center capitalize ${
                      selectedPosition === position
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Section Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-4 p-4 overflow-x-auto" aria-label="Customization options">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={`whitespace-nowrap py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
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
            <div className="text-gray-500 text-lg mb-2">Choose Your Perfect Style</div>
            <div className="text-gray-400 text-sm">
              Select from the customization options above to personalize your jewelry
            </div>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Total Price</div>
            <div className="text-2xl font-bold text-gray-900">
              ${customPrice.toFixed(2)}
            </div>
            {customPrice !== product.price.base && (
              <div className="text-sm text-gray-500 line-through">
                ${product.price.base.toFixed(2)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">SKU</div>
            <div className="text-sm font-mono text-gray-900">{customSKU}</div>
          </div>
        </div>
      </div>
    </div>
  )
}