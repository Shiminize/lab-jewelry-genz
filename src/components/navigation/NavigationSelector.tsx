'use client'

import React, { useState } from 'react'
import { MinimalistNavOption1 } from './MinimalistNavOption1'
import { MinimalistNavOption2 } from './MinimalistNavOption2'
import { MinimalistNavOption3 } from './MinimalistNavOption3'
import { Button } from '@/components/ui/Button'
import { Layers, Users, Brain, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavigationOption = 'option1' | 'option2' | 'option3'

interface NavigationSelectorProps {
  defaultOption?: NavigationOption
  showSelector?: boolean
}

const navigationOptions = [
  {
    id: 'option1' as NavigationOption,
    name: 'Volume-First Discovery',
    description: 'Direct promotion of Moissanite/925 Silver with price transparency',
    icon: <Layers className="w-5 h-5" />,
    color: 'from-cta/10 to-accent/10',
    borderColor: 'border-cta/20',
    features: [
      'Moissanite prominently featured',
      'Price savings calculator',
      'Quick ship options',
      'Volume incentives'
    ]
  },
  {
    id: 'option2' as NavigationOption,
    name: 'Creator-Led Discovery',
    description: 'Leveraging creator influence to drive Moissanite adoption',
    icon: <Users className="w-5 h-5" />,
    color: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-100',
    features: [
      'Creator stories & earnings',
      'Live content integration',
      'Social proof driven',
      'Community focused'
    ]
  },
  {
    id: 'option3' as NavigationOption,
    name: 'Smart Value Navigation',
    description: 'AI-driven personalization promoting volume products',
    icon: <Brain className="w-5 h-5" />,
    color: 'from-blue-50 to-green-50',
    borderColor: 'border-blue-100',
    features: [
      'AI recommendations',
      'Dynamic pricing',
      'Behavioral adaptation',
      'Value scoring system'
    ]
  }
]

export function NavigationSelector({ 
  defaultOption = 'option1',
  showSelector = true 
}: NavigationSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<NavigationOption>(defaultOption)
  const [isSelectorVisible, setIsSelectorVisible] = useState(showSelector)

  const renderNavigation = () => {
    switch(selectedOption) {
      case 'option1':
        return <MinimalistNavOption1 />
      case 'option2':
        return <MinimalistNavOption2 />
      case 'option3':
        return <MinimalistNavOption3 />
      default:
        return <MinimalistNavOption1 />
    }
  }

  return (
    <>
      {/* Selected Navigation */}
      {renderNavigation()}

      {/* Navigation Option Selector */}
      {isSelectorVisible && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground bg-white font-semibold text-lg">Navigation Options</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSelectorVisible(false)}
                className="w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {navigationOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={cn(
                    "w-full text-left rounded-xl border-2 transition-all",
                    selectedOption === option.id
                      ? `bg-gradient-to-r ${option.color} ${option.borderColor}`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        selectedOption === option.id
                          ? "bg-white/80 text-cta"
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground bg-background mb-1">
                          {option.name}
                        </h4>
                        <p className="text-sm text-gray-600 bg-background mb-2">
                          {option.description}
                        </p>
                        
                        {/* Features */}
                        <div className="grid grid-cols-2 gap-1">
                          {option.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-cta/60 rounded-full" />
                              <span className="text-xs text-gray-600 bg-background">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {selectedOption === option.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs font-medium text-cta bg-background">
                          Currently Active
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Info Text */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Test different navigation styles to optimize Moissanite/925 Silver conversions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Selector Button (when hidden) */}
      {!isSelectorVisible && (
        <button
          onClick={() => setIsSelectorVisible(true)}
          className="fixed bottom-4 right-4 z-50 bg-cta text-background px-4 py-2 rounded-full shadow-lg hover:bg-cta-hover transition-colors flex items-center space-x-2"
        >
          <Layers className="w-4 h-4" />
          <span className="text-sm font-medium">Navigation Options</span>
        </button>
      )}
    </>
  )
}