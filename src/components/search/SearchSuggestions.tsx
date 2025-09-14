'use client'

import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { cn } from '../../lib/utils'
import { BodyText, MutedText } from '../foundation/Typography'

interface AutocompleteSuggestion {
  text: string
  type: 'product' | 'category' | 'material' | 'gemstone' | 'brand'
  count: number
  featured?: boolean
}

interface SearchSuggestionsProps {
  suggestions: AutocompleteSuggestion[]
  isVisible: boolean
  selectedIndex: number
  onSuggestionClick: (suggestion: AutocompleteSuggestion) => void
  onSuggestionHover: (index: number) => void
  className?: string
}

const suggestionTypeColors = {
  product: 'text-foreground',
  category: 'text-accent',
  material: 'text-cta',
  gemstone: 'text-nebula-purple',
  brand: 'text-aurora-pink'
}

const suggestionTypeLabels = {
  product: 'Product',
  category: 'Category',
  material: 'Material',
  gemstone: 'Gemstone',
  brand: 'Brand'
}

export function SearchSuggestions({
  suggestions,
  isVisible,
  selectedIndex,
  onSuggestionClick,
  onSuggestionHover,
  className
}: SearchSuggestionsProps) {
  if (!isVisible || suggestions.length === 0) {
    return null
  }

  return (
    <div className={cn(
      'absolute top-full left-0 right-0 z-50 mt-1',
      'bg-background border border-border rounded-token-md shadow-token-lg',
      'max-h-96 overflow-y-auto',
      className
    )}>
      <div className="py-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.text}`}
            onClick={() => onSuggestionClick(suggestion)}
            onMouseEnter={() => onSuggestionHover(index)}
            className={cn(
              'w-full px-4 py-3 text-left hover:bg-muted transition-colors',
              'flex items-center justify-between group',
              selectedIndex === index && 'bg-muted'
            )}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <MagnifyingGlassIcon className="w-4 h-4 text-muted flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-token-sm">
                  <BodyText 
                    size="sm" 
                    className="truncate group-hover:text-foreground"
                  >
                    {suggestion.text}
                  </BodyText>
                  
                  {suggestion.featured && (
                    <span className="bg-accent text-background text-xs px-2 py-0.5 rounded-token-lg flex-shrink-0">
                      Featured
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-token-sm mt-1">
                  <MutedText 
                    size="xs" 
                    className={cn(
                      'capitalize',
                      suggestionTypeColors[suggestion.type]
                    )}
                  >
                    {suggestionTypeLabels[suggestion.type]}
                  </MutedText>
                  
                  {suggestion.count > 0 && (
                    <>
                      <span className="w-1 h-1 bg-muted rounded-full" />
                      <MutedText size="xs">
                        {suggestion.count} {suggestion.count === 1 ? 'result' : 'results'}
                      </MutedText>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-muted group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <MutedText size="xs">Enter</MutedText>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-2 bg-muted/20">
        <MutedText size="xs" className="text-center">
          Use ↑↓ keys to navigate, Enter to select, Esc to close
        </MutedText>
      </div>
    </div>
  )
}