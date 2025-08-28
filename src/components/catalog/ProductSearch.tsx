/**
 * Product Search and Filtering Component
 * Mobile-first design with advanced filtering capabilities
 * Implements PRD requirements for sub-3s search performance
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X, ChevronDown, Star, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { ProductCard } from '../products/ProductCard'
import { useWishlist } from '@/hooks/useWishlist'
import { 
  Product, 
  ProductSearchParams, 
  ProductSearchResult, 
  ProductCategory,
  ProductSubcategory 
} from '@/types/product'

interface ProductSearchProps {
  initialResults?: ProductSearchResult
  className?: string
}

export function ProductSearch({ initialResults, className }: ProductSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isInWishlist, toggleWishlist } = useWishlist()
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<ProductSearchResult | null>(initialResults || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<ProductSubcategory[]>([])
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({})
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [onlyFeatured, setOnlyFeatured] = useState(false)
  const [sortBy, setSortBy] = useState<'popularity' | 'price' | 'name' | 'newest'>('popularity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Debounced search function
  const performSearch = useCallback(async (params: ProductSearchParams) => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query string
      const queryParams = new URLSearchParams()
      
      if (params.query) queryParams.set('q', params.query)
      if (params.page && params.page > 1) queryParams.set('page', params.page.toString())
      if (params.limit) queryParams.set('limit', params.limit.toString())
      if (params.sortBy) queryParams.set('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)
      
      // Add filters
      if (params.filters?.category?.length) {
        queryParams.set('categories', params.filters.category.join(','))
      }
      if (params.filters?.subcategory?.length) {
        queryParams.set('subcategories', params.filters.subcategory.join(','))
      }
      if (params.filters?.priceRange?.min) {
        queryParams.set('minPrice', params.filters.priceRange.min.toString())
      }
      if (params.filters?.priceRange?.max) {
        queryParams.set('maxPrice', params.filters.priceRange.max.toString())
      }
      if (params.filters?.materials?.length) {
        queryParams.set('materials', params.filters.materials.join(','))
      }
      if (params.filters?.inStock) {
        queryParams.set('inStock', 'true')
      }
      if (params.filters?.featured) {
        queryParams.set('featured', 'true')
      }

      // Fetch results
      const response = await fetch(`/api/products?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const apiResponse = await response.json()
      
      // Transform API response to ProductSearchResult format
      const searchResult: ProductSearchResult = {
        products: apiResponse.data || [],
        pagination: apiResponse.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1
        },
        filters: {
          applied: {},
          available: {
            categories: [],
            priceRange: { min: 0, max: 10000 },
            materials: []
          }
        }
      }
      
      setResults(searchResult)

      // Update URL without triggering navigation
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`
      window.history.replaceState({}, '', newUrl)

    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Effect to handle search logic
  useEffect(() => {
    // Always run initial search after mount
    const timeoutId = setTimeout(() => {
      const searchParams: ProductSearchParams = {
        query: searchQuery || undefined,
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        filters: {
          category: selectedCategories.length ? selectedCategories : undefined,
          subcategory: selectedSubcategories.length ? selectedSubcategories : undefined,
          priceRange: (priceRange.min || priceRange.max) ? priceRange : undefined,
          materials: selectedMaterials.length ? selectedMaterials : undefined,
          inStock: onlyInStock || undefined,
          featured: onlyFeatured || undefined
        }
      }

      performSearch(searchParams)
    }, 50) // Small delay to prevent mount issues

    return () => clearTimeout(timeoutId)
  }, [
    searchQuery, currentPage, sortBy, sortOrder,
    selectedCategories, selectedSubcategories, priceRange,
    selectedMaterials, onlyInStock, onlyFeatured,
    performSearch // Include performSearch since it's stable
  ])

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedCategories.length) count++
    if (selectedSubcategories.length) count++
    if (priceRange.min || priceRange.max) count++
    if (selectedMaterials.length) count++
    if (onlyInStock) count++
    if (onlyFeatured) count++
    return count
  }, [selectedCategories, selectedSubcategories, priceRange, selectedMaterials, onlyInStock, onlyFeatured])

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedSubcategories([])
    setPriceRange({})
    setSelectedMaterials([])
    setOnlyInStock(false)
    setOnlyFeatured(false)
    setCurrentPage(1)
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aurora-nav-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Search products, collections, materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="product-search-input"
              className={cn(
                'w-full pl-10 pr-4 py-3 border border rounded-lg',
                'bg-background text-foreground placeholder:text-aurora-nav-muted',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                'transition-all duration-200'
              )}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border border rounded-lg',
              'bg-background hover:bg-muted transition-colors',
              'md:w-auto w-full justify-center'
            )}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-accent text-background text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform',
              showFilters && 'rotate-180'
            )} />
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <MutedText size="sm">Sort by:</MutedText>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border rounded px-3 py-1 bg-background text-foreground"
            >
              <option value="popularity">Popularity</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
              <option value="newest">Newest</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="border border rounded px-3 py-1 bg-background text-foreground"
            >
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>

          {results && (
            <MutedText size="sm">
              {results.pagination.total} products found
            </MutedText>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-muted border border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <H3>Filters</H3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-accent hover:text-accent-hover text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <BodyText className="font-semibold mb-2">Category</BodyText>
              <div className="space-y-2">
                {(['rings', 'necklaces', 'earrings', 'bracelets'] as ProductCategory[]).map(category => (
                  <label key={category} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category])
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category))
                        }
                      }}
                      className="rounded border"
                    />
                    <MutedText className="capitalize">{category}</MutedText>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <BodyText className="font-semibold mb-2">Price Range</BodyText>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ''}
                  onChange={(e) => setPriceRange({
                    ...priceRange,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2 border border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max || ''}
                  onChange={(e) => setPriceRange({
                    ...priceRange,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2 border border rounded text-sm"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <BodyText className="font-semibold mb-2">Quick Filters</BodyText>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded border"
                  />
                  <MutedText>In Stock</MutedText>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={onlyFeatured}
                    onChange={(e) => setOnlyFeatured(e.target.checked)}
                    className="rounded border"
                  />
                  <MutedText>Featured</MutedText>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
            <MutedText className="ml-3">Searching products...</MutedText>
          </div>
        )}

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <BodyText className="text-error">
              {error}
            </BodyText>
          </div>
        )}

        {results && !isLoading && (
          <>
            {/* Product Grid */}
            {results.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.products.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    isWishlisted={isInWishlist(product._id)}
                    onAddToWishlist={(productId) => toggleWishlist(productId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <H2 className="mb-2">No products found</H2>
                <BodyText className="text-muted mb-4">
                  Try adjusting your search or filters
                </BodyText>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-cta text-background rounded-lg hover:bg-cta-hover transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {results.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, results.pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          'px-3 py-2 border border rounded-lg',
                          currentPage === pageNum 
                            ? 'bg-accent text-background' 
                            : 'hover:bg-muted'
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(results.pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === results.pagination.totalPages}
                  className="px-3 py-2 border border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}