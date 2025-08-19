/**
 * Enhanced Product Search Component
 * Advanced search with intelligent filtering, suggestions, and real-time results
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Star, 
  Heart, 
  Grid3X3,
  List,
  SlidersHorizontal,
  Zap,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '../products/ProductCard'
import { ProductFilters } from '../products/ProductFilters'
import { useWishlist } from '@/hooks/useWishlist'
import {
  encodeMaterialFilters,
  decodeMaterialFilters,
  validateMaterialFilters,
  createDebouncedURLUpdate,
  areFiltersEqual,
  materialTagsToFilterState,
  type MaterialFilterState
} from '@/lib/material-filter-url-utils'
import type { MaterialTag } from '@/types/material-tags'

interface SearchResult {
  products: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    applied: Record<string, any>
    available: {
      categories: string[]
      materials: string[]
      gemstones: string[]
      priceRanges: { min: number; max: number; label: string }[]
      sizes: string[]
      colors: string[]
      cuts: string[]
      clarities: string[]
    }
  }
  suggestions?: any[]
  analytics?: {
    searchTime: number
    resultCount: number
    popularFilters: string[]
  }
}

interface EnhancedProductSearchProps {
  initialResults?: SearchResult
  className?: string
}

// View modes for product display
type ViewMode = 'grid' | 'list' | 'compact'

// Sort options with advanced sorting
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity', icon: TrendingUp },
  { value: 'price', label: 'Price: Low to High', icon: null },
  { value: 'newest', label: 'Newest First', icon: null },
  { value: 'rating', label: 'Highest Rated', icon: Star },
  { value: 'name', label: 'Name A-Z', icon: null }
]

export function EnhancedProductSearch({ initialResults, className }: EnhancedProductSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult | null>(initialResults || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Enhanced filter state with URL parameter support
  const [materialFilters, setMaterialFilters] = useState<MaterialFilterState>(() => {
    // Initialize from URL parameters with validation
    const urlFilters = decodeMaterialFilters(searchParams)
    return validateMaterialFilters(urlFilters)
  })
  
  // Legacy filter state for backward compatibility
  const [activeFilters, setActiveFilters] = useState({
    categories: materialFilters.categories,
    subcategories: materialFilters.subcategories,
    materials: [...materialFilters.metals, ...materialFilters.stones],
    gemstones: materialFilters.stones,
    priceRange: materialFilters.priceRange,
    sizes: searchParams.get('sizes')?.split(',') || [],
    colors: searchParams.get('colors')?.split(',') || [],
    cuts: searchParams.get('cuts')?.split(',') || [],
    clarities: searchParams.get('clarities')?.split(',') || [],
    inStock: materialFilters.inStock,
    featured: materialFilters.featured,
    onSale: searchParams.get('onSale') === 'true',
    customizable: searchParams.get('customizable') === 'true',
    sustainable: searchParams.get('sustainable') === 'true',
    certification: searchParams.get('certification')?.split(',') || []
  })
  
  // Sort and pagination from material filters
  const [sortBy, setSortBy] = useState(materialFilters.sortBy)
  const [currentPage, setCurrentPage] = useState(materialFilters.page)
  const [itemsPerPage] = useState(20)
  
  // Debounced URL update function for performance
  const debouncedURLUpdate = useMemo(
    () => createDebouncedURLUpdate((filters: Partial<MaterialFilterState>) => {
      const params = encodeMaterialFilters(filters)
      const newURL = `${window.location.pathname}?${params.toString()}`
      
      // Use replaceState to avoid breaking browser history for rapid filter changes
      window.history.replaceState({}, '', newURL)
    }, 300),
    []
  )

  // Mock filter options - in production, this would come from API
  const filterOptions = useMemo(() => ({
    categories: ['rings', 'necklaces', 'earrings', 'bracelets'],
    subcategories: ['engagement-rings', 'wedding-bands', 'fashion-rings', 'pendants', 'chains'],
    materials: ['gold', 'white-gold', 'rose-gold', 'platinum', 'silver'],
    gemstones: ['diamond', 'emerald', 'ruby', 'sapphire', 'moissanite'],
    priceRanges: [
      { min: 0, max: 500, label: 'Under $500' },
      { min: 500, max: 1000, label: '$500 - $1,000' },
      { min: 1000, max: 2000, label: '$1,000 - $2,000' },
      { min: 2000, max: 5000, label: '$2,000 - $5,000' },
      { min: 5000, max: 10000, label: '$5,000 - $10,000' }
    ],
    sizes: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9'],
    colors: ['white', 'yellow', 'rose', 'black', 'blue', 'green'],
    cuts: ['round', 'princess', 'oval', 'emerald', 'cushion', 'marquise'],
    clarities: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2']
  }), [])

  // Debounced search function
  const performSearch = useCallback(async (searchParams: any = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      
      if (searchQuery) queryParams.set('q', searchQuery)
      if (currentPage > 1) queryParams.set('page', currentPage.toString())
      queryParams.set('limit', itemsPerPage.toString())
      queryParams.set('sortBy', sortBy)

      // Add material filters to query
      if (materialFilters.metals.length > 0) {
        queryParams.set('metals', materialFilters.metals.join(','))
      }
      if (materialFilters.stones.length > 0) {
        queryParams.set('stones', materialFilters.stones.join(','))
      }
      if (materialFilters.materialTags.length > 0) {
        queryParams.set('materialTags', materialFilters.materialTags.join(','))
      }
      if (materialFilters.categories.length > 0) {
        queryParams.set('categories', materialFilters.categories.join(','))
      }
      if (materialFilters.subcategories.length > 0) {
        queryParams.set('subcategories', materialFilters.subcategories.join(','))
      }
      if (materialFilters.caratRange.min) {
        queryParams.set('caratMin', materialFilters.caratRange.min.toString())
      }
      if (materialFilters.caratRange.max) {
        queryParams.set('caratMax', materialFilters.caratRange.max.toString())
      }
      if (materialFilters.priceRange.min) {
        queryParams.set('minPrice', materialFilters.priceRange.min.toString())
      }
      if (materialFilters.priceRange.max) {
        queryParams.set('maxPrice', materialFilters.priceRange.max.toString())
      }
      if (materialFilters.inStock) {
        queryParams.set('inStock', 'true')
      }
      if (materialFilters.featured) {
        queryParams.set('featured', 'true')
      }

      const startTime = performance.now()
      
      // Fetch results
      const response = await fetch(`/api/products?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const apiResponse = await response.json()
      const searchTime = performance.now() - startTime

      // Transform API response to our format
      const searchResult: SearchResult = {
        products: apiResponse.data || [],
        pagination: apiResponse.pagination || {
          page: 1,
          limit: itemsPerPage,
          total: 0,
          totalPages: 1
        },
        filters: {
          applied: {
            ...activeFilters,
            materialFilters
          },
          available: filterOptions
        },
        analytics: {
          searchTime,
          resultCount: apiResponse.pagination?.total || 0,
          popularFilters: []
        }
      }

      setResults(searchResult)
      
      // Update URL without triggering navigation
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`
      window.history.replaceState({}, '', newUrl)

    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search products. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, currentPage, itemsPerPage, sortBy, activeFilters, filterOptions])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [performSearch])
  
  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const newSearchParams = new URLSearchParams(window.location.search)
      const newFilters = validateMaterialFilters(decodeMaterialFilters(newSearchParams))
      
      // Update all state from URL without triggering new URL updates
      setMaterialFilters(newFilters)
      setSearchQuery(newFilters.searchQuery)
      setSortBy(newFilters.sortBy)
      setCurrentPage(newFilters.page)
      
      // Update legacy filters for compatibility
      setActiveFilters({
        categories: newFilters.categories,
        subcategories: newFilters.subcategories,
        materials: [...newFilters.metals, ...newFilters.stones],
        gemstones: newFilters.stones,
        priceRange: newFilters.priceRange,
        sizes: activeFilters.sizes,
        colors: activeFilters.colors,
        cuts: activeFilters.cuts,
        clarities: activeFilters.clarities,
        inStock: newFilters.inStock,
        featured: newFilters.featured,
        onSale: activeFilters.onSale,
        customizable: activeFilters.customizable,
        sustainable: activeFilters.sustainable,
        certification: activeFilters.certification
      })
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeFilters])
  
  // Handle material filter changes with URL sync
  const handleMaterialFiltersChange = useCallback((newFilters: Partial<MaterialFilterState>) => {
    const validatedFilters = validateMaterialFilters({
      ...materialFilters,
      ...newFilters,
      page: 1 // Reset page on filter change
    })
    
    // Only update if filters actually changed
    if (!areFiltersEqual(materialFilters, validatedFilters)) {
      setMaterialFilters(validatedFilters)
      setCurrentPage(1)
      
      // Update legacy activeFilters for backward compatibility
      setActiveFilters({
        categories: validatedFilters.categories,
        subcategories: validatedFilters.subcategories,
        materials: [...validatedFilters.metals, ...validatedFilters.stones],
        gemstones: validatedFilters.stones,
        priceRange: validatedFilters.priceRange,
        sizes: activeFilters.sizes, // Keep existing non-material filters
        colors: activeFilters.colors,
        cuts: activeFilters.cuts,
        clarities: activeFilters.clarities,
        inStock: validatedFilters.inStock,
        featured: validatedFilters.featured,
        onSale: activeFilters.onSale,
        customizable: activeFilters.customizable,
        sustainable: activeFilters.sustainable,
        certification: activeFilters.certification
      })
      
      debouncedURLUpdate(validatedFilters)
    }
  }, [materialFilters, activeFilters, debouncedURLUpdate])
  
  // Legacy filter change handler for backward compatibility
  const handleFiltersChange = (newFilters: typeof activeFilters) => {
    setActiveFilters(newFilters)
    setCurrentPage(1)
    
    // Convert legacy filters to material filter format
    const materialFilterUpdates: Partial<MaterialFilterState> = {
      categories: newFilters.categories,
      subcategories: newFilters.subcategories,
      priceRange: newFilters.priceRange,
      inStock: newFilters.inStock,
      featured: newFilters.featured
    }
    
    handleMaterialFiltersChange(materialFilterUpdates)
  }

  // Handle search input changes with URL sync
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
    
    const newFilters = {
      ...materialFilters,
      searchQuery: value,
      page: 1
    }
    
    setMaterialFilters(newFilters)
    debouncedURLUpdate(newFilters)
  }, [materialFilters, debouncedURLUpdate])

  // Handle material tag clicks from ProductCard components
  const handleMaterialTagClick = useCallback((tag: MaterialTag) => {
    const currentTags = materialFilters.materialTags
    let newTags: string[]
    
    // Toggle tag selection
    if (currentTags.includes(tag.id)) {
      // Remove tag
      newTags = currentTags.filter(tagId => tagId !== tag.id)
    } else {
      // Add tag
      newTags = [...currentTags, tag.id]
    }
    
    // Convert tag to filter components
    const tagFilterState = materialTagsToFilterState([tag])
    
    // Update material filters with tag selection
    const updatedFilters: Partial<MaterialFilterState> = {
      materialTags: newTags
    }
    
    // Also update specific metal/stone filters if applicable
    if (tag.category === 'metal') {
      const currentMetals = materialFilters.metals
      const metalValue = tag.filterValue
      
      if (currentTags.includes(tag.id)) {
        // Remove metal filter
        updatedFilters.metals = currentMetals.filter(metal => metal !== metalValue)
      } else {
        // Add metal filter
        updatedFilters.metals = currentMetals.includes(metalValue) 
          ? currentMetals 
          : [...currentMetals, metalValue]
      }
    }
    
    if (tag.category === 'stone') {
      const currentStones = materialFilters.stones
      const stoneValue = tag.filterValue
      
      if (currentTags.includes(tag.id)) {
        // Remove stone filter
        updatedFilters.stones = currentStones.filter(stone => stone !== stoneValue)
      } else {
        // Add stone filter
        updatedFilters.stones = currentStones.includes(stoneValue)
          ? currentStones
          : [...currentStones, stoneValue]
      }
    }
    
    handleMaterialFiltersChange(updatedFilters)
  }, [materialFilters, handleMaterialFiltersChange])

  // Handle sort changes with URL sync
  const handleSortChange = useCallback((newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(1)
    
    const newFilters = {
      ...materialFilters,
      sortBy: newSort,
      page: 1
    }
    
    setMaterialFilters(newFilters)
    debouncedURLUpdate(newFilters)
  }, [materialFilters, debouncedURLUpdate])

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId: string) => {
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId)
      } else {
        await addToWishlist(productId)
      }
    } catch (error) {
      console.error('Wishlist error:', error)
    }
  }

  // Clear search and filters with URL sync
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    
    const clearedFilters: MaterialFilterState = {
      metals: [],
      stones: [],
      caratRange: {},
      materialTags: [],
      categories: [],
      subcategories: [],
      priceRange: {},
      inStock: false,
      featured: false,
      searchQuery: '',
      sortBy: 'popularity',
      page: 1
    }
    
    setMaterialFilters(clearedFilters)
    setCurrentPage(1)
    setSortBy('popularity')
    
    // Clear legacy filters
    setActiveFilters({
      categories: [],
      subcategories: [],
      materials: [],
      gemstones: [],
      priceRange: {},
      sizes: [],
      colors: [],
      cuts: [],
      clarities: [],
      inStock: false,
      featured: false,
      onSale: false,
      customizable: false,
      sustainable: false,
      certification: []
    })
    
    // Update URL immediately for clear action
    const params = encodeMaterialFilters(clearedFilters)
    const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, '', newURL)
    
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [debouncedURLUpdate])

  // Active filter count from material filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    
    if (materialFilters.metals.length > 0) count++
    if (materialFilters.stones.length > 0) count++
    if (materialFilters.materialTags.length > 0) count++
    if (materialFilters.categories.length > 0) count++
    if (materialFilters.subcategories.length > 0) count++
    if (materialFilters.caratRange.min || materialFilters.caratRange.max) count++
    if (materialFilters.priceRange.min || materialFilters.priceRange.max) count++
    if (materialFilters.inStock) count++
    if (materialFilters.featured) count++
    
    return count
  }, [materialFilters])

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Search Header */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products, collections, materials..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border rounded-lg bg-background text-foreground placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              data-testid="enhanced-search-input"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-foreground p-2 min-h-11 min-w-11 flex items-center justify-center rounded"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Search Stats and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Results count */}
            <MutedText>
              {isLoading ? 'Searching...' : (
                results ? `${results.pagination.total} products found` : 'Enter search terms'
              )}
              {results?.analytics?.searchTime && (
                <span className="ml-2">({results.analytics.searchTime.toFixed(0)}ms)</span>
              )}
            </MutedText>
            
            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="md" onClick={clearSearch}>
                Clear all ({activeFilterCount})
              </Button>
            )}
          </div>

          {/* View and Sort Controls */}
          <div className="flex items-center gap-4">
            {/* View Mode */}
            <div className="flex items-center border border rounded-lg">
              {[
                { mode: 'grid' as ViewMode, icon: Grid3X3 },
                { mode: 'list' as ViewMode, icon: List },
                { mode: 'compact' as ViewMode, icon: SlidersHorizontal }
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'p-3 min-h-11 min-w-11 transition-colors flex items-center justify-center',
                    viewMode === mode 
                      ? 'bg-accent text-background' 
                      : 'text-gray-600 hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <ProductFilters
            filters={{
              priceRange: activeFilters.priceRange || [0, 10000],
              categories: activeFilters.categories || [],
              materials: activeFilters.materials || [],
              stoneTypes: activeFilters.gemstones || [],
              stoneQualities: activeFilters.clarities || [],
              sizes: activeFilters.sizes || [],
              inStock: activeFilters.inStock || false
            }}
            onFiltersChange={(filters) => {
              handleFiltersChange({
                priceRange: filters.priceRange,
                categories: filters.categories,
                materials: filters.materials,
                gemstones: filters.stoneTypes,
                clarities: filters.stoneQualities,
                sizes: filters.sizes,
                inStock: filters.inStock
              })
            }}
            onClearFilters={() => handleFiltersChange({})}
            className="max-w-xs"
          />
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {error && (
          <div className="text-center py-12">
            <BodyText className="text-destructive mb-4">{error}</BodyText>
            <Button onClick={() => performSearch()}>Try Again</Button>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {results && !isLoading && results.products.length > 0 && (
          <div className={cn(
            viewMode === 'grid' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
            viewMode === 'list' && 'space-y-4',
            viewMode === 'compact' && 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'
          )}>
            {results.products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                variant={viewMode === 'compact' ? 'compact' : 'standard'}
                onAddToWishlist={() => handleWishlistToggle(product._id)}
                onMaterialTagClick={handleMaterialTagClick}
                isWishlisted={isInWishlist(product._id)}
                className={viewMode === 'list' ? 'flex' : ''}
              />
            ))}
          </div>
        )}

        {results && !isLoading && results.products.length === 0 && (
          <div className="text-center py-12">
            <H2 className="mb-2">No products found</H2>
            <BodyText className="text-muted mb-4">
              Try adjusting your search terms or filters
            </BodyText>
            <Button onClick={clearSearch}>Clear Search</Button>
          </div>
        )}

        {/* Pagination */}
        {results && results.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, results.pagination.totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    size="md"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              disabled={currentPage === results.pagination.totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}