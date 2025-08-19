'use client'

import React, { useState } from 'react'
import { 
  PersonalGemstoneDNA, 
  ConsciousLuxuryJourney, 
  StyleEcosystem, 
  InvestmentImpact 
} from '@/components/navigation'
import { Button } from '@/components/ui/Button'
import { 
  Dna, Heart, Palette, TrendingUp, Sparkles, 
  Brain, Layers, Calculator, Eye, RotateCcw 
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavigationVariant = 'dna' | 'conscious' | 'ecosystem' | 'investment'

interface VariantOption {
  id: NavigationVariant
  name: string
  tagline: string
  description: string
  icon: React.ReactNode
  color: string
  features: string[]
  target: string
}

const navigationVariants: VariantOption[] = [
  {
    id: 'dna',
    name: 'Personal Gemstone DNA',
    tagline: 'Scientific Personalization',
    description: 'Makes users feel genetically matched to their perfect gemstones through scientific analysis and compatibility scoring.',
    icon: <Dna className="w-5 h-5" />,
    color: 'from-blue-500 to-purple-500',
    features: [
      'Genetic compatibility analysis',
      'Scientific personality matching', 
      'Lab-style results presentation',
      'DNA-based product recommendations'
    ],
    target: 'Precision seekers, quality-focused customers'
  },
  {
    id: 'conscious',
    name: 'Conscious Luxury Journey',
    tagline: 'Values-Driven Experience',
    description: 'Tracks environmental impact and ethical choices, making users feel their purchases create positive change.',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-green-500 to-blue-500',
    features: [
      'Impact tracking dashboard',
      'Environmental savings metrics',
      'Ethical sourcing highlights',
      'Legacy building features'
    ],
    target: 'Conscious consumers, sustainability advocates'
  },
  {
    id: 'ecosystem',
    name: 'Style Ecosystem',
    tagline: 'Lifestyle Integration',
    description: 'Seamlessly integrates jewelry choices with personal style and lifestyle, ensuring perfect harmony across all occasions.',
    icon: <Palette className="w-5 h-5" />,
    color: 'from-orange-500 to-pink-500',
    features: [
      'Multi-occasion styling',
      'Lifestyle integration mapping',
      'Style evolution tracking',
      'Synergy optimization'
    ],
    target: 'Style-conscious, lifestyle-focused customers'
  },
  {
    id: 'investment',
    name: 'Investment & Impact',
    tagline: 'Financial + Ethical Framework',
    description: 'Presents jewelry as smart financial decisions with positive social impact, appealing to investment-minded customers.',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-green-500 to-blue-500',
    features: [
      'ROI calculations and projections',
      'Portfolio performance tracking',
      'Market timing indicators',
      'ESG investment scoring'
    ],
    target: 'Investment-minded, financially savvy customers'
  }
]

export default function EnhancedNavigationDemo() {
  const [activeVariant, setActiveVariant] = useState<NavigationVariant>('dna')
  const [isSelecting, setIsSelecting] = useState(true)

  const renderNavigation = () => {
    switch (activeVariant) {
      case 'dna':
        return <PersonalGemstoneDNA />
      case 'conscious':
        return <ConsciousLuxuryJourney />
      case 'ecosystem':
        return <StyleEcosystem />
      case 'investment':
        return <InvestmentImpact />
      default:
        return <PersonalGemstoneDNA />
    }
  }

  const activeOption = navigationVariants.find(v => v.id === activeVariant)!

  if (isSelecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-headline font-bold text-foreground bg-white mb-2">
                Enhanced Smart Value Navigation
              </h1>
              <p className="text-gray-600 bg-white max-w-2xl mx-auto">
                Choose a navigation variant to see how psychological profiling and personalization 
                can strategically guide customers toward Moissanite + Silver products while making them feel unique.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Options Grid */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {navigationVariants.map((variant) => (
              <div
                key={variant.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setActiveVariant(variant.id)
                  setIsSelecting(false)
                }}
              >
                {/* Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                    `bg-gradient-to-br ${variant.color}`
                  )}>
                    {variant.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground bg-white mb-1">
                      {variant.name}
                    </h3>
                    <p className="text-sm text-gray-600 bg-white font-medium">
                      {variant.tagline}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 bg-white text-sm mb-4 leading-relaxed">
                  {variant.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 bg-white">Key Features:</h4>
                  <ul className="space-y-1">
                    {variant.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-xs text-gray-600 bg-white">
                        <Sparkles className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Audience */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 bg-white mb-2">Target Audience:</p>
                  <p className="text-xs font-medium text-gray-700 bg-white">{variant.target}</p>
                </div>

                {/* CTA */}
                <Button 
                  variant="primary" 
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveVariant(variant.id)
                    setIsSelecting(false)
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Navigation
                </Button>
              </div>
            ))}
          </div>

          {/* Strategy Notes */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-100 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground bg-background mb-2">
                    Strategic Framework
                  </h3>
                  <p className="text-gray-700 bg-background text-sm mb-3">
                    Each navigation variant uses sophisticated psychological profiling to guide customers 
                    toward our bread-and-butter products (Moissanite + 925 Silver) while making them feel unique and valued.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 bg-background mb-1">Personalization Engine:</h4>
                      <ul className="text-gray-600 bg-background space-y-0.5 text-xs">
                        <li>• Dynamic user profiling</li>
                        <li>• Behavioral adaptation</li>
                        <li>• Smart recommendations</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 bg-background mb-1">Revenue Optimization:</h4>
                      <ul className="text-gray-600 bg-background space-y-0.5 text-xs">
                        <li>• Strategic product placement</li>
                        <li>• Psychological anchoring</li>
                        <li>• Value perception enhancement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSelecting(true)}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Back to Selection</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                  `bg-gradient-to-br ${activeOption.color}`
                )}>
                  {activeOption.icon}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground bg-white text-sm">{activeOption.name}</h2>
                  <p className="text-xs text-gray-600 bg-white">{activeOption.tagline}</p>
                </div>
              </div>
            </div>

            {/* Quick Switcher */}
            <div className="hidden md:flex items-center space-x-2">
              {navigationVariants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={activeVariant === variant.id ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveVariant(variant.id)}
                  className="flex items-center space-x-1"
                >
                  {variant.icon}
                  <span className="hidden lg:inline">{variant.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Demo */}
      <div className="relative">
        {renderNavigation()}
      </div>

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground bg-white mb-3">
              Experience the {activeOption.name}
            </h2>
            <p className="text-gray-600 bg-white">
              This navigation uses {activeOption.tagline.toLowerCase()} to create a personalized experience 
              that naturally guides customers toward our highest-value products.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-foreground bg-white mb-3 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Personalization Features</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 bg-white">
                {activeOption.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-foreground bg-white mb-3 flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-green-600" />
                <span>Strategic Benefits</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 bg-white">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Increased conversion to Moissanite + Silver products</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Enhanced customer engagement and satisfaction</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Psychological anchoring toward higher-value purchases</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Reduced decision fatigue through smart curation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Implementation Notes */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-foreground bg-background mb-3">Implementation Strategy</h3>
            <p className="text-gray-700 bg-background text-sm leading-relaxed">
              This navigation variant specifically targets <strong>{activeOption.target.toLowerCase()}</strong> by 
              leveraging {activeOption.tagline.toLowerCase()} principles. Each interaction is designed to build 
              trust, demonstrate value, and naturally guide users toward our most profitable product combinations 
              while maintaining an authentic, personalized experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}