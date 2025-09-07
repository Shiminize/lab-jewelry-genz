'use client'

import React from 'react'
import { Star, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { H2, BodyText, MutedText } from '@/components/foundation/Typography'
import { ProductCard } from '../products/ProductCard'
import type { ProductSearchResult } from '@/types/product'

interface ProductSearchResultsProps {
  results: ProductSearchResult | null
  searchQuery: string
  isLoading: boolean
  error: string | null
  sortBy: 'popularity' | 'price' | 'name' | 'newest'
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: 'popularity' | 'price' | 'name' | 'newest', order: 'asc' | 'desc') => void
  onAddToWishlist: (productId: string) => void
  onQuickView: (productId: string) => void
  onAddToCart: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  className?: string
}

export function ProductSearchResults({
  results,
  searchQuery,
  isLoading,
  error,
  sortBy,
  sortOrder,
  onSortChange,
  onAddToWishlist,
  onQuickView,
  onAddToCart,
  isInWishlist,
  className
}: ProductSearchResultsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
        <MutedText className="mt-4">Searching products...</MutedText>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('bg-error/10 border border-error/20 rounded-token-md p-4', className)}>
        <BodyText className="text-error">
          {error}
        </BodyText>
      </div>
    )
  }

  // No results state
  if (results && results.products.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <H2 className="mb-4">No products found</H2>
        <MutedText>
          {searchQuery 
            ? `No results found for "${searchQuery}". Try adjusting your search or filters.`
            : 'No products match your current filters. Try adjusting your criteria.'
          }
        </MutedText>
      </div>
    )
  }

  if (!results) {
    return (
      <div className={cn('text-center py-12', className)}>
        <MutedText>Start searching to see results</MutedText>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <H2>
            {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
          </H2>
          <MutedText>
            {results.total} {results.total === 1 ? 'product' : 'products'} found
          </MutedText>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-4">
          <MutedText size="sm">Sort by:</MutedText>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [
                'popularity' | 'price' | 'name' | 'newest',
                'asc' | 'desc'
              ]
              onSortChange(newSortBy, newSortOrder)
            }}
            className="px-3 py-2 border border-border rounded-token-md text-sm focus:ring-2 focus:ring-cta focus:border-cta bg-background"
          >
            <option value="popularity-desc">Most Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="newest-desc">Newest First</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToWishlist={onAddToWishlist}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
            isWishlisted={isInWishlist(product._id)}
          />
        ))}
      </div>

      {/* Load More / Pagination */}
      {results.hasMore && (
        <div className="flex justify-center pt-8">
          <button
            className="px-4 py-2 bg-cta text-background rounded-token-md hover:bg-cta-hover transition-colors shadow-[0_2px_8px_color-mix(in_srgb,var(--nebula-purple)_20%,transparent)]"
          >
            Load More Products
          </button>
        </div>
      )}
    </div>
  )
}