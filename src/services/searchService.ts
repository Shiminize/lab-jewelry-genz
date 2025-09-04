/**
 * Search Service - Handles all search-related API interactions
 * Compliant with CLAUDE_RULES: Isolated API logic from UI components
 */

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  materials?: string[];
  gemstones?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  suggestions?: string[];
}

export interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  materials?: string[];
  gemstones?: string[];
  sortBy?: 'price' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch search results from the API
 * @param query - Search query string
 * @param filters - Optional filters to apply
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<SearchResponse>
 */
export async function fetchSearchResults(
  query: string,
  filters?: SearchFilters,
  signal?: AbortSignal
): Promise<SearchResponse> {
  try {
    const searchParams = new URLSearchParams({
      q: query,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.priceRange && { 
        minPrice: filters.priceRange[0].toString(),
        maxPrice: filters.priceRange[1].toString()
      }),
      ...(filters?.materials && { materials: filters.materials.join(',') }),
      ...(filters?.gemstones && { gemstones: filters.gemstones.join(',') }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.sortOrder && { sortOrder: filters.sortOrder })
    });

    const response = await fetch(`/api/products/search?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Search request failed');
    }

    return {
      results: data.data || [],
      totalCount: data.pagination?.total || 0,
      suggestions: data.suggestions || []
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during search');
  }
}

/**
 * Get search suggestions for autocomplete
 * @param query - Partial search query
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<string[]>
 */
export async function fetchSearchSuggestions(
  query: string,
  signal?: AbortSignal
): Promise<string[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const response = await fetch(`/api/products/suggestions?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      return []; // Non-critical failure, return empty suggestions
    }

    const data = await response.json();

    if (!data.success) {
      return [];
    }

    return data.data || [];
  } catch (error) {
    // Non-critical error, return empty suggestions
    console.warn('Failed to fetch search suggestions:', error);
    return [];
  }
}

/**
 * Get popular search terms
 * @param limit - Maximum number of terms to return
 * @returns Promise<string[]>
 */
export async function fetchPopularSearchTerms(limit: number = 10): Promise<string[]> {
  try {
    const response = await fetch(`/api/products/popular-searches?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.success) {
      return [];
    }

    return data.data || [];
  } catch (error) {
    console.warn('Failed to fetch popular search terms:', error);
    return [];
  }
}