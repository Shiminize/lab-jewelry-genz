'use client'

/**
 * Advanced Search Component - Aurora Design System Compliant
 * Orchestrates advanced search with filters, autocomplete, and suggestions
 * CLAUDE_RULES compliant: <300 lines with extracted components
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { debounce } from 'lodash'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { H2, BodyText } from '@/components/foundation/Typography'
import { AdvancedSearchFilters } from './AdvancedSearchFilters'
import { SearchSuggestions } from './SearchSuggestions'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface SearchFilters {
  category: string[]
  subcategory: string[]
  materials: string[]
  gemstones: string[]
  priceMin?: number
  priceMax?: number
  inStock: boolean
  featured: boolean
  newArrival: boolean
  rating?: number
  tags: string[]
}

interface AutocompleteSuggestion {
  text: string
  type: 'product' | 'category' | 'material' | 'gemstone' | 'brand'
  count: number
  featured?: boolean
}

interface FacetData {
  categories: Array<{ _id: string; count: number }>
  subcategories: Array<{ _id: string; count: number }>
  materials: Array<{ _id: string; count: number }>
  gemstones: Array<{ _id: string; count: number }>
  priceRanges: Array<{ _id: string; count: number }>
  ratings: Array<{ _id: number; count: number }>
}

const initialFilters: SearchFilters = {
  category: [],
  subcategory: [],
  materials: [],
  gemstones: [],
  inStock: false,
  featured: false,
  newArrival: false,
  tags: []
}

export default function AdvancedSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  
  // Data state
  const [facets, setFacets] = useState<FacetData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced autocomplete search
  const debouncedAutocomplete = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error('Autocomplete error:', error)
      }
    }, 300),
    []
  )

  // Load facets on mount
  useEffect(() => {
    const loadFacets = async () => {
      try {
        const response = await fetch('/api/search/facets')
        if (response.ok) {
          const data = await response.json()
          setFacets(data)
        }
      } catch (error) {
        console.error('Facets loading error:', error)
      }
    }

    loadFacets()
  }, [])

  // Handle query changes
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
    setSelectedSuggestionIndex(-1)
    
    if (newQuery.trim()) {
      debouncedAutocomplete(newQuery)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string = query) => {
    setIsLoading(true)
    setError(null)
    setShowSuggestions(false)

    // Build search URL
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','))
      } else if (typeof value === 'boolean' && value) {
        params.set(key, 'true')
      } else if (typeof value === 'number') {
        params.set(key, value.toString())
      }
    })

    // Navigate to search results
    router.push(`/search?${params.toString()}`)
  }, [query, filters, router])

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AutocompleteSuggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    handleSearch(suggestion.text)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // Clear filters
  const handleClearFilters = () => {
    setFilters(initialFilters)
    setShowFilters(false)
  }

  // Clear search
  const handleClearSearch = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    handleClearFilters()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <H2 className="mb-4">Advanced Search</H2>
        <BodyText className="text-muted">
          Find exactly what you're looking for with our comprehensive search tools
        </BodyText>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <Input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search for jewelry, categories, materials, gemstones..."
              className="pl-10 pr-12 h-12 text-base aurora-living-component aurora-interactive-shadow"
            />
            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-4 w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>

        {/* Search Suggestions */}
        <SearchSuggestions
          suggestions={suggestions}
          isVisible={showSuggestions}
          selectedIndex={selectedSuggestionIndex}
          onSuggestionClick={handleSuggestionSelect}
          onSuggestionHover={setSelectedSuggestionIndex}
        />
      </div>

      {/* Advanced Filters */}
      <AdvancedSearchFilters
        filters={filters}
        facets={facets}
        isVisible={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-token-md">
          <BodyText className="text-error">{error}</BodyText>
        </div>
      )}
    </div>
  )
}