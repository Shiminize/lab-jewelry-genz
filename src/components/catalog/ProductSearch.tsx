/**
 * Product Search Component - Aurora Design System Compliant
 * Orchestrates search functionality using extracted components
 * CLAUDE_RULES compliant: <300 lines with service->hook->component architecture
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { H2, BodyText } from '@/components/foundation/Typography'
import { ProductSearchFilters } from './ProductSearchFilters'
import { ProductSearchResults } from './ProductSearchResults'
import { useWishlist } from '@/hooks/useWishlist'
import { 
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

  // Search function
  const performSearch = useCallback(async (params: ProductSearchParams) => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query string
      const queryParams = new URLSearchParams()
      
      if (params.query) queryParams.set('q', params.query)
      if (params.sortBy) queryParams.set('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)
      
      // Add filters
      if (params.filters?.category?.length) {
        queryParams.set('categories', params.filters.category.join(','))
      }
      if (params.filters?.materials?.length) {
        queryParams.set('materials', params.filters.materials.join(','))
      }
      if (params.filters?.priceRange?.min) {
        queryParams.set('minPrice', params.filters.priceRange.min.toString())
      }
      if (params.filters?.priceRange?.max) {
        queryParams.set('maxPrice', params.filters.priceRange.max.toString())
      }
      if (params.filters?.inStock) queryParams.set('inStock', 'true')
      if (params.filters?.featured) queryParams.set('featured', 'true')

      // Fetch results
      const response = await fetch(`/api/products?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const apiResponse = await response.json()
      setResults(apiResponse.data || { products: [], total: 0, hasMore: false })
      
      // Update URL
      router.replace(`/search?${queryParams.toString()}`, { scroll: false })

    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Handle search input changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    
    // Debounced search
    const timeoutId = setTimeout(() => {
      performSearch({
        query,
        sortBy,
        sortOrder,
        filters: {
          category: selectedCategories,
          subcategory: selectedSubcategories,
          priceRange: (priceRange.min || priceRange.max) ? priceRange : undefined,
          materials: selectedMaterials,
          inStock: onlyInStock,
          featured: onlyFeatured
        }
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch({
      query: searchQuery,
      sortBy,
      sortOrder,
      filters: {
        category: selectedCategories,
        subcategory: selectedSubcategories,
        priceRange: (priceRange.min || priceRange.max) ? priceRange : undefined,
        materials: selectedMaterials,
        inStock: onlyInStock,
        featured: onlyFeatured
      }
    })
  }

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    performSearch({
      query: searchQuery,
      sortBy,
      sortOrder,
      filters: {
        category: selectedCategories,
        subcategory: selectedSubcategories,
        priceRange: (priceRange.min || priceRange.max) ? priceRange : undefined,
        materials: selectedMaterials,
        inStock: onlyInStock,
        featured: onlyFeatured
      }
    })
  }, [searchQuery, sortBy, sortOrder, selectedCategories, selectedSubcategories, priceRange, selectedMaterials, onlyInStock, onlyFeatured, performSearch])

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedSubcategories([])
    setPriceRange({})
    setSelectedMaterials([])
    setOnlyInStock(false)
    setOnlyFeatured(false)
    setSortBy('popularity')
    setSortOrder('desc')
  }

  // Handle sort changes
  const handleSortChange = (newSortBy: typeof sortBy, newSortOrder: typeof sortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  // Effect to trigger search when filters change
  useEffect(() => {
    if (selectedCategories.length || selectedMaterials.length || priceRange.min || priceRange.max || onlyInStock || onlyFeatured) {
      handleFilterChange()
    }
  }, [selectedCategories, selectedMaterials, priceRange, onlyInStock, onlyFeatured, handleFilterChange])

  return (
    <div className={cn('max-w-7xl mx-auto px-token-md py-token-lg', className)}>
      {/* Page Header */}
      <div className="mb-token-lg">
        <H2 className="mb-token-md">Search Products</H2>
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <div className="relative">
            <Search 
              size={20} 
              className="absolute left-token-md top-1/2 -translate-y-1/2 text-muted" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search for rings, necklaces, earrings..."
              className={cn(
                'w-full pl-10 pr-token-md py-token-md border border-border rounded-token-md',
                'focus:ring-2 focus:ring-cta focus:border-cta',
                'placeholder:text-muted shadow-token-sm focus:shadow-token-md transition-shadow duration-300'
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-token-md top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filters */}
      <ProductSearchFilters
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        selectedCategories={selectedCategories}
        selectedSubcategories={selectedSubcategories}
        priceRange={priceRange}
        selectedMaterials={selectedMaterials}
        onlyInStock={onlyInStock}
        onlyFeatured={onlyFeatured}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onCategoryChange={setSelectedCategories}
        onSubcategoryChange={setSelectedSubcategories}
        onPriceRangeChange={setPriceRange}
        onMaterialChange={setSelectedMaterials}
        onStockFilterChange={setOnlyInStock}
        onFeaturedFilterChange={setOnlyFeatured}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        className="mb-token-xl"
      />

      {/* Results */}
      <ProductSearchResults
        results={results}
        searchQuery={searchQuery}
        isLoading={isLoading}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onAddToWishlist={toggleWishlist}
        onQuickView={(id) => router.push(`/products/${id}`)}
        onAddToCart={(id) => console.log('Add to cart:', id)} // TODO: Implement cart service
        isInWishlist={isInWishlist}
      />
    </div>
  )
}