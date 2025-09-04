/**
 * useProductData Hook - Manages product data fetching and state
 * Compliant with CLAUDE_RULES: Isolated business logic from UI components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchProducts,
  fetchProductById,
  fetchFeaturedProducts,
  fetchProductCategories,
  checkProductAvailability,
  type Product,
  type ProductListParams,
  type ProductListResponse
} from '@/services/productService';

interface UseProductsOptions {
  autoFetch?: boolean;
  initialParams?: ProductListParams;
}

interface UseProductsReturn {
  // Data state
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: Array<{ name: string; count: number }>;
    materials: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };

  // Actions
  fetchProducts: (params?: ProductListParams) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;

  // Current parameters
  currentParams: ProductListParams;
  setParams: (params: ProductListParams) => void;
}

interface UseProductOptions {
  productId?: string;
  autoFetch?: boolean;
}

interface UseProductReturn {
  // Data state
  product: Product | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProduct: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
  checkAvailability: (quantity?: number) => Promise<boolean>;
}

interface UseFeaturedProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCategoriesReturn {
  categories: Array<{ name: string; count: number; slug: string }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing products list with filtering and pagination
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { autoFetch = true, initialParams = {} } = options;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    categories: [] as Array<{ name: string; count: number }>,
    materials: [] as Array<{ name: string; count: number }>,
    priceRange: { min: 0, max: 0 },
  });
  const [currentParams, setCurrentParams] = useState<ProductListParams>(initialParams);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch products with given parameters
   */
  const handleFetchProducts = useCallback(async (params?: ProductListParams) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = params || currentParams;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const response: ProductListResponse = await fetchProducts(
        searchParams,
        abortControllerRef.current.signal
      );

      setProducts(response.products);
      setPagination(response.pagination);
      setFilters(response.filters);

      if (params) {
        setCurrentParams(params);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled, ignore
        }
        setError(err.message);
      } else {
        setError('Failed to fetch products');
      }
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  /**
   * Refetch with current parameters
   */
  const refetch = useCallback(async () => {
    await handleFetchProducts(currentParams);
  }, [handleFetchProducts, currentParams]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update parameters and optionally fetch
   */
  const setParams = useCallback((params: ProductListParams) => {
    setCurrentParams(params);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      handleFetchProducts();
    }
  }, [autoFetch, handleFetchProducts]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    filters,
    fetchProducts: handleFetchProducts,
    refetch,
    clearError,
    currentParams,
    setParams,
  };
}

/**
 * Hook for managing single product data
 */
export function useProduct(options: UseProductOptions = {}): UseProductReturn {
  const { productId, autoFetch = true } = options;

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentProductIdRef = useRef<string | undefined>(productId);

  /**
   * Fetch single product by ID
   */
  const handleFetchProduct = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      currentProductIdRef.current = id;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const productData = await fetchProductById(id, abortControllerRef.current.signal);
      setProduct(productData);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled, ignore
        }
        setError(err.message);
      } else {
        setError('Failed to fetch product');
      }
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refetch current product
   */
  const refetch = useCallback(async () => {
    if (currentProductIdRef.current) {
      await handleFetchProduct(currentProductIdRef.current);
    }
  }, [handleFetchProduct]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check product availability
   */
  const handleCheckAvailability = useCallback(async (quantity: number = 1): Promise<boolean> => {
    if (!currentProductIdRef.current) {
      return false;
    }

    try {
      return await checkProductAvailability(currentProductIdRef.current, quantity);
    } catch (err) {
      console.warn('Failed to check availability:', err);
      return false;
    }
  }, []);

  // Auto-fetch on mount if productId provided
  useEffect(() => {
    if (autoFetch && productId) {
      handleFetchProduct(productId);
    }
  }, [autoFetch, productId, handleFetchProduct]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    product,
    loading,
    error,
    fetchProduct: handleFetchProduct,
    refetch,
    clearError,
    checkAvailability: handleCheckAvailability,
  };
}

/**
 * Hook for featured products
 */
export function useFeaturedProducts(limit: number = 6): UseFeaturedProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const featuredProducts = await fetchFeaturedProducts(limit, abortControllerRef.current.signal);
      setProducts(featuredProducts);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    products,
    loading,
    error,
    refetch: handleFetch,
  };
}

/**
 * Hook for product categories
 */
export function useProductCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Array<{ name: string; count: number; slug: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const categoryData = await fetchProductCategories(abortControllerRef.current.signal);
      setCategories(categoryData);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: handleFetch,
  };
}