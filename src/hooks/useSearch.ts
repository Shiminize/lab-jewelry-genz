/**
 * useSearch Hook - Manages search functionality and state
 * Compliant with CLAUDE_RULES: Isolated business logic from UI components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchSearchResults, 
  fetchSearchSuggestions,
  type SearchResult, 
  type SearchFilters 
} from '@/services/searchService';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  autoFocus?: boolean;
}

interface UseSearchReturn {
  // Search state
  query: string;
  results: SearchResult[];
  suggestions: string[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  totalCount: number;

  // Search controls
  setQuery: (query: string) => void;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;

  // Filters
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;

  // UI state
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const DEFAULT_OPTIONS: UseSearchOptions = {
  debounceMs: 300,
  minQueryLength: 2,
  autoFocus: false,
};

/**
 * Custom hook for search functionality
 * Handles debounced search, suggestions, filters, and error states
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { 
    debounceMs = DEFAULT_OPTIONS.debounceMs,
    minQueryLength = DEFAULT_OPTIONS.minQueryLength,
  } = { ...DEFAULT_OPTIONS, ...options };

  // State
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Perform search with current query and filters
   */
  const performSearch = useCallback(async (searchQuery: string, searchFilters?: SearchFilters) => {
    try {
      // Clear previous error
      setError(null);
      setIsSearching(true);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const response = await fetchSearchResults(
        searchQuery,
        searchFilters || filters,
        abortControllerRef.current.signal
      );

      setResults(response.results);
      setTotalCount(response.totalCount);
      setSuggestions(response.suggestions || []);

    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled, ignore
        }
        setError(err.message);
      } else {
        setError('An unexpected error occurred while searching');
      }
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsSearching(false);
    }
  }, [filters]);

  /**
   * Fetch search suggestions
   */
  const fetchSuggestions = useCallback(async (suggestionQuery: string) => {
    try {
      setIsLoading(true);

      // Cancel previous suggestions request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const suggestionResults = await fetchSearchSuggestions(
        suggestionQuery,
        abortControllerRef.current.signal
      );

      setSuggestions(suggestionResults);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.warn('Failed to fetch suggestions:', err.message);
      }
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle query change with debouncing
   */
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setError(null);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // If query is too short, clear results
    if (newQuery.length < minQueryLength!) {
      setResults([]);
      setSuggestions([]);
      setTotalCount(0);
      setIsOpen(false);
      return;
    }

    // Set up debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      if (newQuery.trim()) {
        setIsOpen(true);
        // Fetch suggestions immediately for better UX
        fetchSuggestions(newQuery);
        // Perform full search after debounce
        performSearch(newQuery);
      }
    }, debounceMs);
  }, [minQueryLength, debounceMs, fetchSuggestions, performSearch]);

  /**
   * Manually trigger search
   */
  const search = useCallback(async (searchQuery: string, searchFilters?: SearchFilters) => {
    setQuery(searchQuery);
    if (searchFilters) {
      setFilters(searchFilters);
    }
    await performSearch(searchQuery, searchFilters);
    setIsOpen(true);
  }, [performSearch]);

  /**
   * Clear search results and query
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setTotalCount(0);
    setError(null);
    setIsOpen(false);

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle filters change
   */
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // If there's a current query, re-search with new filters
    if (query && query.length >= minQueryLength!) {
      performSearch(query, newFilters);
    }
  }, [query, minQueryLength, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Close search on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return {
    // State
    query,
    results,
    suggestions,
    isLoading,
    isSearching,
    error,
    totalCount,

    // Controls
    setQuery: handleQueryChange,
    search,
    clearSearch,
    clearError,

    // Filters
    filters,
    setFilters: handleFiltersChange,

    // UI state
    isOpen,
    setIsOpen,
    inputRef,
  };
}