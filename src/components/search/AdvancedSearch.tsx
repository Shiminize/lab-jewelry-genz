'use client'

/**
 * Advanced Search Component
 * Comprehensive search interface with filters, autocomplete, and faceted search
 * Phase 2: Scale & Optimize implementation
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { debounce } from 'lodash'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

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

export default function AdvancedSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<SearchFilters>({
    category: [],
    subcategory: [],
    materials: [],
    gemstones: [],
    inStock: false,
    featured: false,
    newArrival: false,
    tags: []
  })
  
  // UI state
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [facets, setFacets] = useState<FacetData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Sort options
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc')
  
  // Debounced autocomplete
  const debouncedAutocomplete = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }
      
      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=8`)
        const data = await response.json()
        
        if (data.success) {
          setSuggestions(data.data.suggestions)
        }
      } catch (error) {
        console.error('Autocomplete error:', error)
      }
    }, 300),
    []
  )
  
  // Handle search query change
  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (value.trim()) {
      debouncedAutocomplete(value)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }
  
  // Execute search
  const executeSearch = useCallback(async () => {
    setIsLoading(true)
    setShowSuggestions(false)
    
    // Build search URL
    const params = new URLSearchParams()
    
    if (query.trim()) params.set('q', query.trim())
    if (sortBy !== 'relevance') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)
    
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
    
    params.set('facets', 'true')
    
    try {
      // Navigate to search results
      router.push(`/search?${params.toString()}`)
      
      // Fetch facets for filter counts
      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()
      
      if (data.success && data.data.facets) {
        setFacets(data.data.facets)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [query, filters, sortBy, sortOrder, router])
  
  // Handle filter changes
  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }
  
  // Handle array filter toggle
  const toggleArrayFilter = (filterType: keyof SearchFilters, value: string) => {
    const currentArray = filters[filterType] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    handleFilterChange(filterType, newArray)
  }
  
  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: [],
      subcategory: [],
      materials: [],
      gemstones: [],
      inStock: false,
      featured: false,
      newArrival: false,
      tags: []
    })
  }
  
  // Handle suggestion selection
  const selectSuggestion = (suggestion: AutocompleteSuggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    
    // If it's a category/material/gemstone, add to filters
    if (suggestion.type === 'category') {
      toggleArrayFilter('category', suggestion.text)
    } else if (suggestion.type === 'material') {
      toggleArrayFilter('materials', suggestion.text)
    } else if (suggestion.type === 'gemstone') {
      toggleArrayFilter('gemstones', suggestion.text)
    }
    
    // Execute search
    setTimeout(executeSearch, 100)
  }
  
  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        count += value.length
      } else if (typeof value === 'boolean' && value) {
        count += 1
      } else if (typeof value === 'number') {
        count += 1
      }
    })
    return count
  }, [filters])
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for jewelry, materials, or styles..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executeSearch()
                }
                if (e.key === 'Escape') {
                  setShowSuggestions(false)
                }
              }}
              className="pl-10 pr-4"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/60" />
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-b-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-muted flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{suggestion.text}</span>
                      <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                        {suggestion.type}
                      </span>
                      {suggestion.featured && (
                        <span className="text-xs px-2 py-1 bg-cta/20 text-cta rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-foreground/60 group-hover:text-foreground">
                      {suggestion.count} items
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Button 
            onClick={executeSearch}
            disabled={isLoading}
            className="px-6"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
            ) : (
              'Search'
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 relative"
          >
            <FunnelIcon className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cta text-background text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 p-6 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <div className="flex gap-2">
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              <div className="space-y-2">
                {facets?.categories?.map((category) => (
                  <label key={category._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category._id)}
                      onChange={() => toggleArrayFilter('category', category._id)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">
                      {category._id} ({category.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Material Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Materials</label>
              <div className="space-y-2">
                {facets?.materials?.map((material) => (
                  <label key={material._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.materials.includes(material._id)}
                      onChange={() => toggleArrayFilter('materials', material._id)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">
                      {material._id} ({material.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={filters.priceMin || ''}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.priceMax || ''}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>
            
            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium mb-2">Quick Filters</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Featured Products</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.newArrival}
                    onChange={(e) => handleFilterChange('newArrival', e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">New Arrivals</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium mb-3">Sort By</h4>
            <div className="flex gap-4 flex-wrap">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'price', label: 'Price' },
                { value: 'popularity', label: 'Popularity' },
                { value: 'rating', label: 'Rating' },
                { value: 'newest', label: 'Newest' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.value}
                    checked={sortBy === option.value}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-full border-border"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            
            {sortBy === 'price' && (
              <div className="mt-3 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sortOrder"
                    value="asc"
                    checked={sortOrder === 'asc'}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="rounded-full border-border"
                  />
                  <span className="text-sm">Low to High</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sortOrder"
                    value="desc"
                    checked={sortOrder === 'desc'}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="rounded-full border-border"
                  />
                  <span className="text-sm">High to Low</span>
                </label>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button onClick={executeSearch} disabled={isLoading} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      )}
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              return value.map((item) => (
                <span
                  key={`${key}-${item}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
                >
                  {item}
                  <button
                    onClick={() => toggleArrayFilter(key as keyof SearchFilters, item)}
                    className="hover:bg-accent/30 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))
            } else if (typeof value === 'boolean' && value) {
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
                >
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  <button
                    onClick={() => handleFilterChange(key as keyof SearchFilters, false)}
                    className="hover:bg-accent/30 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}