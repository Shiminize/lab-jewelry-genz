/**
 * Material Filter URL Utilities
 * Handles encoding/decoding of material filter parameters for shareable URLs
 * Follows CLAUDE_RULES.md performance and TypeScript standards
 */

import type { MaterialTag, MaterialTagFilter } from '@/types/material-tags'
import type { MetalType, StoneType } from '@/types/product-dto'

/**
 * Material filter URL parameters structure
 */
export interface MaterialFilterURLParams {
  /** Comma-separated metal types */
  metals?: string
  /** Comma-separated stone types */
  stones?: string
  /** Minimum carat weight */
  caratMin?: string
  /** Maximum carat weight */
  caratMax?: string
  /** Comma-separated material tag IDs */
  materialTags?: string
  /** Category filter */
  category?: string
  /** Subcategory filter */
  subcategory?: string
  /** Minimum price */
  minPrice?: string
  /** Maximum price */
  maxPrice?: string
  /** In stock filter */
  inStock?: string
  /** Featured filter */
  featured?: string
  /** Search query */
  q?: string
  /** Sort by */
  sortBy?: string
  /** Page number */
  page?: string
}

/**
 * Material filter state for component usage
 */
export interface MaterialFilterState {
  metals: string[]
  stones: string[]
  caratRange: { min?: number; max?: number }
  materialTags: string[]
  categories: string[]
  subcategories: string[]
  priceRange: { min?: number; max?: number }
  inStock: boolean
  featured: boolean
  searchQuery: string
  sortBy: string
  page: number
}

/**
 * Encodes material filter state into URL search parameters
 * 
 * @param filters - Material filter state
 * @returns URLSearchParams object ready for URL construction
 */
export function encodeMaterialFilters(filters: Partial<MaterialFilterState>): URLSearchParams {
  const params = new URLSearchParams()

  // Encode arrays as comma-separated strings
  if (filters.metals?.length) {
    params.set('metals', filters.metals.join(','))
  }
  
  if (filters.stones?.length) {
    params.set('stones', filters.stones.join(','))
  }
  
  if (filters.materialTags?.length) {
    params.set('materialTags', filters.materialTags.join(','))
  }
  
  if (filters.categories?.length) {
    params.set('categories', filters.categories.join(','))
  }
  
  if (filters.subcategories?.length) {
    params.set('subcategories', filters.subcategories.join(','))
  }

  // Encode carat range
  if (filters.caratRange?.min) {
    params.set('caratMin', filters.caratRange.min.toString())
  }
  
  if (filters.caratRange?.max) {
    params.set('caratMax', filters.caratRange.max.toString())
  }

  // Encode price range
  if (filters.priceRange?.min) {
    params.set('minPrice', filters.priceRange.min.toString())
  }
  
  if (filters.priceRange?.max) {
    params.set('maxPrice', filters.priceRange.max.toString())
  }

  // Encode boolean filters
  if (filters.inStock) {
    params.set('inStock', 'true')
  }
  
  if (filters.featured) {
    params.set('featured', 'true')
  }

  // Encode search and pagination
  if (filters.searchQuery) {
    params.set('q', filters.searchQuery)
  }
  
  if (filters.sortBy && filters.sortBy !== 'popularity') {
    params.set('sortBy', filters.sortBy)
  }
  
  if (filters.page && filters.page > 1) {
    params.set('page', filters.page.toString())
  }

  return params
}

/**
 * Decodes URL search parameters into material filter state
 * 
 * @param searchParams - URLSearchParams or string
 * @returns Material filter state with defaults
 */
export function decodeMaterialFilters(searchParams: URLSearchParams | string): MaterialFilterState {
  const params = typeof searchParams === 'string' 
    ? new URLSearchParams(searchParams) 
    : searchParams

  // Parse arrays from comma-separated strings
  const parseCommaSeparated = (value: string | null): string[] => {
    return value ? value.split(',').filter(Boolean).map(s => s.trim()) : []
  }

  // Parse number with validation
  const parseNumber = (value: string | null): number | undefined => {
    if (!value) return undefined
    const num = parseFloat(value)
    return isNaN(num) ? undefined : num
  }

  // Parse boolean
  const parseBoolean = (value: string | null): boolean => {
    return value === 'true'
  }

  return {
    metals: parseCommaSeparated(params.get('metals')),
    stones: parseCommaSeparated(params.get('stones')),
    materialTags: parseCommaSeparated(params.get('materialTags')),
    categories: parseCommaSeparated(params.get('categories')),
    subcategories: parseCommaSeparated(params.get('subcategories')),
    caratRange: {
      min: parseNumber(params.get('caratMin')),
      max: parseNumber(params.get('caratMax'))
    },
    priceRange: {
      min: parseNumber(params.get('minPrice')),
      max: parseNumber(params.get('maxPrice'))
    },
    inStock: parseBoolean(params.get('inStock')),
    featured: parseBoolean(params.get('featured')),
    searchQuery: params.get('q') || '',
    sortBy: params.get('sortBy') || 'popularity',
    page: parseNumber(params.get('page')) || 1
  }
}

/**
 * Creates a shareable URL with material filters
 * 
 * @param baseURL - Base URL without search parameters
 * @param filters - Material filter state
 * @returns Complete shareable URL
 */
export function createShareableURL(baseURL: string, filters: Partial<MaterialFilterState>): string {
  const params = encodeMaterialFilters(filters)
  const paramString = params.toString()
  
  if (!paramString) {
    return baseURL
  }
  
  const separator = baseURL.includes('?') ? '&' : '?'
  return `${baseURL}${separator}${paramString}`
}

/**
 * Converts MaterialTag objects to URL-compatible filter format
 * 
 * @param tags - Array of MaterialTag objects
 * @returns Partial filter state for URL encoding
 */
export function materialTagsToFilterState(tags: MaterialTag[]): Partial<MaterialFilterState> {
  const metals: string[] = []
  const stones: string[] = []
  const materialTagIds: string[] = []

  tags.forEach(tag => {
    // Collect tag IDs for direct filtering
    materialTagIds.push(tag.id)
    
    // Extract filter values by category
    switch (tag.category) {
      case 'metal':
        if (!metals.includes(tag.filterValue)) {
          metals.push(tag.filterValue)
        }
        break
      case 'stone':
        if (!stones.includes(tag.filterValue)) {
          stones.push(tag.filterValue)
        }
        break
      // Carat tags are handled differently as they don't map to discrete arrays
    }
  })

  return {
    metals: metals.length ? metals : undefined,
    stones: stones.length ? stones : undefined,
    materialTags: materialTagIds.length ? materialTagIds : undefined
  }
}

/**
 * Validates material filter parameters for safety
 * 
 * @param filters - Raw filter state to validate
 * @returns Validated and sanitized filter state
 */
export function validateMaterialFilters(filters: Partial<MaterialFilterState>): MaterialFilterState {
  // Define valid options for validation
  const validMetals: MetalType[] = ['silver', '14k-gold', '18k-gold', 'platinum']
  const validStones: StoneType[] = ['lab-diamond', 'moissanite', 'lab-emerald', 'lab-ruby', 'lab-sapphire']
  const validCategories = ['rings', 'necklaces', 'earrings', 'bracelets']
  const validSortOptions = ['popularity', 'price', 'name', 'newest', 'rating']

  // Validate and filter arrays
  const validateArray = (arr: string[] | undefined, validOptions: string[]): string[] => {
    if (!arr) return []
    return arr.filter(item => validOptions.includes(item))
  }

  // Validate number ranges
  const validateRange = (range: { min?: number; max?: number } | undefined) => {
    if (!range) return {}
    
    const result: { min?: number; max?: number } = {}
    
    if (range.min !== undefined && range.min >= 0) {
      result.min = Math.max(0, Math.min(100000, range.min))
    }
    
    if (range.max !== undefined && range.max >= 0) {
      result.max = Math.max(0, Math.min(100000, range.max))
    }
    
    // Ensure min <= max
    if (result.min !== undefined && result.max !== undefined && result.min > result.max) {
      [result.min, result.max] = [result.max, result.min]
    }
    
    return result
  }

  return {
    metals: validateArray(filters.metals, validMetals),
    stones: validateArray(filters.stones, validStones),
    materialTags: filters.materialTags?.filter(tag => 
      typeof tag === 'string' && tag.length > 0 && tag.length < 100
    ) || [],
    categories: validateArray(filters.categories, validCategories),
    subcategories: filters.subcategories?.filter(sub => 
      typeof sub === 'string' && sub.length > 0 && sub.length < 50
    ) || [],
    caratRange: validateRange(filters.caratRange),
    priceRange: validateRange(filters.priceRange),
    inStock: Boolean(filters.inStock),
    featured: Boolean(filters.featured),
    searchQuery: typeof filters.searchQuery === 'string' 
      ? filters.searchQuery.slice(0, 200).trim() 
      : '',
    sortBy: validSortOptions.includes(filters.sortBy || '') 
      ? filters.sortBy! 
      : 'popularity',
    page: Math.max(1, Math.min(1000, Math.floor(filters.page || 1)))
  }
}

/**
 * Debounced URL update hook utility
 * 
 * @param callback - Function to call with debounced value
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced update function
 */
export function createDebouncedURLUpdate(
  callback: (filters: Partial<MaterialFilterState>) => void,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null

  return (filters: Partial<MaterialFilterState>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      callback(filters)
      timeoutId = null
    }, delay)
  }
}

/**
 * Type guard for material filter URL parameters
 */
export function isMaterialFilterURLParams(obj: any): obj is MaterialFilterURLParams {
  if (!obj || typeof obj !== 'object') return false
  
  const validKeys = [
    'metals', 'stones', 'caratMin', 'caratMax', 'materialTags',
    'category', 'subcategory', 'minPrice', 'maxPrice',
    'inStock', 'featured', 'q', 'sortBy', 'page'
  ]
  
  return Object.keys(obj).every(key => validKeys.includes(key))
}

/**
 * Compares two filter states for equality (for preventing unnecessary updates)
 */
export function areFiltersEqual(
  a: Partial<MaterialFilterState>, 
  b: Partial<MaterialFilterState>
): boolean {
  // Helper to compare arrays
  const arraysEqual = (arr1?: string[], arr2?: string[]): boolean => {
    if (!arr1 && !arr2) return true
    if (!arr1 || !arr2) return false
    if (arr1.length !== arr2.length) return false
    return arr1.every((item, index) => item === arr2[index])
  }

  // Helper to compare range objects
  const rangesEqual = (
    range1?: { min?: number; max?: number }, 
    range2?: { min?: number; max?: number }
  ): boolean => {
    if (!range1 && !range2) return true
    if (!range1 || !range2) return false
    return range1.min === range2.min && range1.max === range2.max
  }

  return (
    arraysEqual(a.metals, b.metals) &&
    arraysEqual(a.stones, b.stones) &&
    arraysEqual(a.materialTags, b.materialTags) &&
    arraysEqual(a.categories, b.categories) &&
    arraysEqual(a.subcategories, b.subcategories) &&
    rangesEqual(a.caratRange, b.caratRange) &&
    rangesEqual(a.priceRange, b.priceRange) &&
    a.inStock === b.inStock &&
    a.featured === b.featured &&
    a.searchQuery === b.searchQuery &&
    a.sortBy === b.sortBy &&
    a.page === b.page
  )
}