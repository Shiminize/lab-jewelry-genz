'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { H3 } from '@/components/foundation/Typography'
import type { Material, StoneQuality } from '@/types/customizer'
import type { SettingOption } from './previewData'

const quickSelectorVariants = cva(
  'group flex items-center justify-between rounded-lg shadow-token-sm hover:shadow-token-md transition-shadow duration-token-normal cursor-pointer touch-manipulation hover:brightness-115 hover:scale-101 hover:-translate-y-0.5 relative overflow-hidden aurora-pink-sweep-effect',
  {
    variants: {
      state: {
        default: 'bg-background text-foreground shadow-sm hover:shadow-md hover:bg-surface-hover active:bg-surface-active luxury-emotional-trigger',
        selected: 'bg-gradient-to-br from-nebula-purple/10 to-aurora-pink/5 text-foreground shadow-lg shadow-nebula-purple/20 romantic-emotional-trigger',
        disabled: 'opacity-50 cursor-not-allowed pointer-events-none'
      },
      size: {
        compact: 'p-3 text-sm min-h-[48px]',
        standard: 'p-4 text-base min-h-[56px] sm:min-h-[64px]'
      }
    },
    defaultVariants: {
      state: 'default',
      size: 'standard'
    }
  }
)

interface QuickSelectorProps {
  label: string
  options: Material[] | StoneQuality[] | SettingOption[]
  selected: Material | StoneQuality | SettingOption | null
  onSelect: (option: Material | StoneQuality | SettingOption) => void
  type: 'material' | 'stone' | 'setting'
}

// Helper function to get Aurora focus class based on material type (Fixes CSS specificity conflict)
function getQuickSelectorFocusClass(option: Material | StoneQuality | SettingOption, type: string): string {
  // Only apply material-specific focus for materials
  if (type !== 'material') {
    return 'focus:aurora-focus-default'
  }

  const materialOption = option as Material
  const name = materialOption.name?.toLowerCase() || ''
  
  if (name.includes('gold') && !name.includes('rose') && !name.includes('white')) {
    return 'focus:aurora-focus-gold'
  }
  if (name.includes('rose') && name.includes('gold')) {
    return 'focus:aurora-focus-rose-gold'
  }
  if (name.includes('platinum') || name.includes('white')) {
    return 'focus:aurora-focus-platinum'
  }
  return 'focus:aurora-focus-default'
}

// Helper function to get psychological trigger class based on material type
function getPsychologyTriggerClass(option: Material | StoneQuality | SettingOption, type: string): string {
  if (type !== 'material') {
    return ''
  }

  const materialOption = option as Material
  const name = materialOption.name?.toLowerCase() || ''
  
  if (name.includes('rose') && name.includes('gold')) {
    return 'romantic-emotional-trigger'
  }
  if (name.includes('gold') || name.includes('platinum')) {
    return 'luxury-emotional-trigger'
  }
  
  return ''
}

export function QuickSelector({ 
  label, 
  options, 
  selected, 
  onSelect, 
  type 
}: QuickSelectorProps) {
  const handleKeyDown = (event: React.KeyboardEvent, option: Material | StoneQuality | SettingOption) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(option)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const currentIndex = options.findIndex(opt => opt.id === option.id)
      let nextIndex: number
      
      if (event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % options.length
      } else {
        nextIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1
      }
      
      const nextButton = document.querySelector(`[data-option-id="${options[nextIndex].id}"]`) as HTMLButtonElement
      if (nextButton) {
        nextButton.focus()
      }
    }
  }

  return (
    <div className="space-y-token-md" role="radiogroup" aria-labelledby={`${type}-selector-label`}>
      <H3 id={`${type}-selector-label`} className="text-sm font-medium text-foreground">
        {label}
      </H3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {options.map((option) => {
          const isSelected = selected?.id === option.id
          const auroraFocusClass = getQuickSelectorFocusClass(option, type)
          const psychologyClass = getPsychologyTriggerClass(option, type)
          return (
            <button
              key={option.id}
              data-option-id={option.id}
              onClick={() => onSelect(option)}
              onKeyDown={(e) => handleKeyDown(e, option)}
              className={cn(
                quickSelectorVariants({ 
                  state: isSelected ? 'selected' : 'default',
                  size: 'standard'
                }),
                'w-full focus:outline-none',
                auroraFocusClass,
                psychologyClass
              )}
              role="radio"
              aria-checked={isSelected}
              aria-describedby={`${option.id}-description`}
              tabIndex={isSelected ? 0 : -1}
            >
              <div className="flex items-center space-x-token-md flex-1">
                {type === 'material' && (
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-border shadow-sm flex-shrink-0"
                    style={{ backgroundColor: (option as Material).color || 'var(--material-rose-gold, #FF6B9D)' }}
                    aria-hidden="true"
                  />
                )}
                {type === 'stone' && (
                  <div className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-nebula-purple w-full h-full">
                      <path d="M12 2L15.5 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L8.5 8.5L12 2Z" />
                    </svg>
                  </div>
                )}
                {type === 'setting' && (
                  <div className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-nebula-purple w-full h-full">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                )}
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate text-sm sm:text-base">
                    {option.name}
                  </div>
                  <div id={`${option.id}-description`} className="text-xs text-foreground/60 truncate">
                    {option.description}
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="flex-shrink-0 ml-3" aria-hidden="true">
                  <div className="w-6 h-6 bg-nebula-purple rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}