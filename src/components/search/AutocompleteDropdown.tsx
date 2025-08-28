'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Clock, TrendingUp, Tag, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutocompleteSuggestion {
  id: string
  text: string
  type: 'product' | 'category' | 'material' | 'style' | 'collection'
  count?: number
  featured?: boolean
  image?: string
  price?: number
}

interface AutocompleteDropdownProps {
  query: string
  onSelect: (suggestion: AutocompleteSuggestion) => void
  onQueryChange: (query: string) => void
  isVisible: boolean
  onVisibilityChange: (visible: boolean) => void
  className?: string
  placeholder?: string
}

export function AutocompleteDropdown({
  query,
  onSelect,
  onQueryChange,
  isVisible,
  onVisibilityChange,
  className,
  placeholder = "Search our collection"
}: AutocompleteDropdownProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent-searches')
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5))
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error)
    }
  }, [])

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=8`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      
      if (data.success && data.data?.suggestions) {
        setSuggestions(data.data.suggestions)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Autocomplete error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced suggestion fetching
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (query.trim() && isVisible) {
        fetchSuggestions(query)
      } else {
        setSuggestions([])
      }
    }, 200) // 200ms debounce for better performance

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, isVisible, fetchSuggestions])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isVisible) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex])
        } else if (query.trim()) {
          handleSearch(query)
        }
        break
      
      case 'Escape':
        e.preventDefault()
        onVisibilityChange(false)
        inputRef.current?.blur()
        break
    }
  }, [isVisible, selectedIndex, suggestions, query])

  // Handle suggestion selection
  const handleSelect = (suggestion: AutocompleteSuggestion) => {
    onSelect(suggestion)
    saveToRecentSearches(suggestion.text)
    onVisibilityChange(false)
  }

  // Handle direct search
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onQueryChange(searchQuery)
      saveToRecentSearches(searchQuery)
      onVisibilityChange(false)
    }
  }

  // Save search to recent searches
  const saveToRecentSearches = (search: string) => {
    try {
      const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recent-searches', JSON.stringify(updated))
    } catch (error) {
      console.warn('Failed to save recent search:', error)
    }
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        onVisibilityChange(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onVisibilityChange])

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string, featured?: boolean) => {
    if (featured) return <Sparkles className="w-4 h-4 text-accent" />
    
    switch (type) {
      case 'product': return <Search className="w-4 h-4 text-aurora-nav-muted" />
      case 'category': return <Tag className="w-4 h-4 text-aurora-nav-muted" />
      case 'material': return <TrendingUp className="w-4 h-4 text-aurora-nav-muted" />
      default: return <Search className="w-4 h-4 text-aurora-nav-muted" />
    }
  }

  // Show dropdown content
  const showSuggestions = suggestions.length > 0
  const showRecentSearches = !query.trim() && recentSearches.length > 0 && isVisible
  const showDropdown = isVisible && (showSuggestions || showRecentSearches || isLoading)

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aurora-nav-muted w-5 h-5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => onVisibilityChange(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full pl-10 pr-4 py-3 border border-border rounded-lg',
            'bg-background text-foreground placeholder:text-aurora-nav-muted',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            'transition-all duration-200'
          )}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-aurora-nav-border border-t-accent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-50',
            'bg-background border border-border rounded-lg shadow-lg',
            'max-h-96 overflow-y-auto'
          )}
          role="listbox"
        >
          {/* Recent Searches */}
          {showRecentSearches && (
            <>
              <div className="px-4 py-2 text-sm text-aurora-nav-muted border-b border-border bg-muted/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </div>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={`recent-${index}`}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-muted transition-colors',
                    'flex items-center gap-3 text-sm'
                  )}
                  onClick={() => handleSearch(search)}
                >
                  <Clock className="w-4 h-4 text-aurora-nav-muted" />
                  <span className="text-foreground">{search}</span>
                </button>
              ))}
              {suggestions.length > 0 && <div className="border-b border-border" />}
            </>
          )}

          {/* Suggestions */}
          {showSuggestions && (
            <>
              {!showRecentSearches && (
                <div className="px-4 py-2 text-sm text-aurora-nav-muted border-b border-border bg-muted/50">
                  Suggestions
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id || index}
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors',
                    'flex items-center gap-3',
                    selectedIndex === index ? 'bg-accent/10' : 'hover:bg-muted'
                  )}
                  onClick={() => handleSelect(suggestion)}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  {getSuggestionIcon(suggestion.type, suggestion.featured)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium truncate">
                        {suggestion.text}
                      </span>
                      {suggestion.featured && (
                        <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    {suggestion.count && (
                      <div className="text-xs text-aurora-nav-muted mt-0.5">
                        {suggestion.count} items
                      </div>
                    )}
                  </div>
                  
                  {suggestion.price && (
                    <div className="text-sm text-foreground font-medium">
                      ${suggestion.price.toLocaleString()}
                    </div>
                  )}
                </button>
              ))}
            </>
          )}

          {/* No results */}
          {query.length >= 2 && !isLoading && suggestions.length === 0 && (
            <div className="px-4 py-6 text-center text-aurora-nav-muted">
              <Search className="w-8 h-8 mx-auto mb-2 text-aurora-nav-muted" />
              <div className="text-sm">No suggestions found for &quot;{query}&quot;</div>
              <button
                className="mt-2 text-xs text-accent hover:underline"
                onClick={() => handleSearch(query)}
              >
                Search anyway
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}