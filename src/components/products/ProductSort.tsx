'use client'

import React, { useState } from 'react'
import { ChevronDown, Grid, List, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BodyText, MutedText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

export interface SortOption {
  key: string
  label: string
  order: 'asc' | 'desc'
}

export interface SortAndViewProps {
  sortBy: string
  onSortChange: (sortBy: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (viewMode: 'grid' | 'list') => void
  totalResults: number
  currentPage?: number
  resultsPerPage?: number
  isLoading?: boolean
  className?: string
}

const sortOptions: SortOption[] = [
  { key: 'featured', label: 'Featured', order: 'desc' },
  { key: 'name-asc', label: 'Name (A-Z)', order: 'asc' },
  { key: 'name-desc', label: 'Name (Z-A)', order: 'desc' },
  { key: 'price-asc', label: 'Price (Low to High)', order: 'asc' },
  { key: 'price-desc', label: 'Price (High to Low)', order: 'desc' },
  { key: 'newest', label: 'Newest First', order: 'desc' },
  { key: 'popularity', label: 'Most Popular', order: 'desc' },
  { key: 'rating', label: 'Highest Rated', order: 'desc' },
]

export function ProductSort({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalResults,
  currentPage = 1,
  resultsPerPage = 24,
  isLoading = false,
  className
}: SortAndViewProps) {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)

  const currentSortOption = sortOptions.find(option => option.key === sortBy) || sortOptions[0]

  const getResultsText = () => {
    if (isLoading) return 'Loading...'
    
    if (totalResults === 0) return 'No results'
    
    const startResult = (currentPage - 1) * resultsPerPage + 1
    const endResult = Math.min(currentPage * resultsPerPage, totalResults)
    
    if (startResult === endResult) {
      return `Showing ${startResult} of ${totalResults.toLocaleString()} results`
    }
    
    return `Showing ${startResult}-${endResult} of ${totalResults.toLocaleString()} results`
  }

  return (
    <div className={cn('flex items-center justify-between flex-wrap gap-4', className)}>
      {/* Results count */}
      <div className="flex items-center space-x-4">
        <MutedText size="md">
          {getResultsText()}
        </MutedText>
      </div>

      {/* Sort and view controls */}
      <div className="flex items-center space-x-4">
        {/* Sort dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="min-w-[180px] justify-between"
            disabled={isLoading}
          >
            <span className="flex items-center">
              <BodyText size="sm" className="mr-2">Sort by:</BodyText>
              <BodyText size="sm" weight="medium">
                {currentSortOption.label}
              </BodyText>
            </span>
            <ChevronDown 
              size={16} 
              className={cn(
                'ml-2 transition-transform',
                isSortDropdownOpen ? 'rotate-180' : ''
              )} 
            />
          </Button>

          {/* Dropdown menu */}
          {isSortDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsSortDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-64 bg-background border border-border rounded-lg shadow-lg py-2 z-20">
                {sortOptions.map((option) => (
                  <button
                    key={option.key}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-muted/20 transition-colors',
                      option.key === sortBy ? 'bg-accent/10 text-accent font-medium' : 'text-foreground'
                    )}
                    onClick={() => {
                      onSortChange(option.key)
                      setIsSortDropdownOpen(false)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-none border-r border-border"
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-none"
            aria-label="List view"
          >
            <List size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Simplified sort-only component
interface ProductSortOnlyProps {
  sortBy: string
  onSortChange: (sortBy: string) => void
  options?: SortOption[]
  isLoading?: boolean
  className?: string
}

export function ProductSortOnly({
  sortBy,
  onSortChange,
  options = sortOptions,
  isLoading = false,
  className
}: ProductSortOnlyProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const currentOption = options.find(option => option.key === sortBy) || options[0]

  return (
    <div className={cn('relative inline-block', className)}>
      <Button
        variant="outline"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="min-w-[160px] justify-between"
        disabled={isLoading}
      >
        <span>{currentOption.label}</span>
        <ChevronDown 
          size={16} 
          className={cn(
            'ml-2 transition-transform',
            isDropdownOpen ? 'rotate-180' : ''
          )} 
        />
      </Button>

      {isDropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-full min-w-[200px] bg-background border border-border rounded-lg shadow-lg py-2 z-20">
            {options.map((option) => (
              <button
                key={option.key}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-muted/20 transition-colors',
                  option.key === sortBy ? 'bg-accent/10 text-accent font-medium' : 'text-foreground'
                )}
                onClick={() => {
                  onSortChange(option.key)
                  setIsDropdownOpen(false)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}