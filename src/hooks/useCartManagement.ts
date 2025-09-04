/**
 * useCartManagement Hook - Manages cart functionality and state
 * Compliant with CLAUDE_RULES: Isolated business logic from UI components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyPromoCode,
  calculateShipping,
  type CartSummary,
  type AddToCartParams,
  type UpdateCartItemParams,
  type ShippingOption
} from '@/services/cartService';

interface UseCartOptions {
  autoFetch?: boolean;
  persistToStorage?: boolean;
  syncInterval?: number; // in milliseconds
}

interface UseCartReturn {
  // Cart state
  cart: CartSummary | null;
  loading: boolean;
  error: string | null;
  isUpdating: boolean;

  // Cart actions
  addItem: (params: AddToCartParams) => Promise<void>;
  updateItem: (params: UpdateCartItemParams) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  refreshCart: () => Promise<void>;

  // Promo code functionality
  promoCode: string;
  setPromoCode: (code: string) => void;
  applyPromo: () => Promise<void>;
  promoLoading: boolean;
  promoError: string | null;

  // Shipping functionality
  shippingOptions: ShippingOption[];
  calculateShippingCost: (address: any) => Promise<void>;
  shippingLoading: boolean;
  shippingError: string | null;

  // Computed values
  totalItems: number;
  subtotal: number;
  total: number;
  isEmpty: boolean;

  // Error handling
  clearError: () => void;
  clearPromoError: () => void;
  clearShippingError: () => void;
}

const DEFAULT_OPTIONS: UseCartOptions = {
  autoFetch: true,
  persistToStorage: true,
  syncInterval: 30000, // 30 seconds
};

/**
 * Custom hook for cart management
 * Handles all cart operations, state, and synchronization
 */
export function useCartManagement(options: UseCartOptions = {}): UseCartReturn {
  const {
    autoFetch = DEFAULT_OPTIONS.autoFetch,
    persistToStorage = DEFAULT_OPTIONS.persistToStorage,
    syncInterval = DEFAULT_OPTIONS.syncInterval,
  } = { ...DEFAULT_OPTIONS, ...options };

  // Cart state
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoLoading, setPromoLoading] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Shipping state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingLoading, setShippingLoading] = useState<boolean>(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch current cart from API
   */
  const handleFetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const cartData = await fetchCart(abortControllerRef.current.signal);
      setCart(cartData);

      // Persist to localStorage if enabled
      if (persistToStorage && cartData) {
        localStorage.setItem('cart_snapshot', JSON.stringify(cartData));
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled, ignore
        }
        setError(err.message);
      } else {
        setError('Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  }, [persistToStorage]);

  /**
   * Add item to cart
   */
  const handleAddItem = useCallback(async (params: AddToCartParams) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const updatedCart = await addToCart(params, abortControllerRef.current.signal);
      setCart(updatedCart);

      // Persist to localStorage if enabled
      if (persistToStorage) {
        localStorage.setItem('cart_snapshot', JSON.stringify(updatedCart));
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to add item to cart');
      }
    } finally {
      setIsUpdating(false);
    }
  }, [persistToStorage]);

  /**
   * Update cart item
   */
  const handleUpdateItem = useCallback(async (params: UpdateCartItemParams) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const updatedCart = await updateCartItem(params, abortControllerRef.current.signal);
      setCart(updatedCart);

      // Persist to localStorage if enabled
      if (persistToStorage) {
        localStorage.setItem('cart_snapshot', JSON.stringify(updatedCart));
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to update cart item');
      }
    } finally {
      setIsUpdating(false);
    }
  }, [persistToStorage]);

  /**
   * Remove item from cart
   */
  const handleRemoveItem = useCallback(async (itemId: string) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const updatedCart = await removeFromCart(itemId, abortControllerRef.current.signal);
      setCart(updatedCart);

      // Persist to localStorage if enabled
      if (persistToStorage) {
        localStorage.setItem('cart_snapshot', JSON.stringify(updatedCart));
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to remove cart item');
      }
    } finally {
      setIsUpdating(false);
    }
  }, [persistToStorage]);

  /**
   * Clear entire cart
   */
  const handleClearCart = useCallback(async () => {
    try {
      setIsUpdating(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      await clearCart(abortControllerRef.current.signal);
      
      // Reset cart state
      setCart({
        items: [],
        totalItems: 0,
        subtotal: 0,
        total: 0,
        currency: 'USD',
      });

      // Clear from localStorage if enabled
      if (persistToStorage) {
        localStorage.removeItem('cart_snapshot');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to clear cart');
      }
    } finally {
      setIsUpdating(false);
    }
  }, [persistToStorage]);

  /**
   * Apply promo code
   */
  const handleApplyPromo = useCallback(async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    try {
      setPromoLoading(true);
      setPromoError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const updatedCart = await applyPromoCode(promoCode, abortControllerRef.current.signal);
      setCart(updatedCart);

      // Persist to localStorage if enabled
      if (persistToStorage) {
        localStorage.setItem('cart_snapshot', JSON.stringify(updatedCart));
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setPromoError(err.message);
      } else {
        setPromoError('Failed to apply promo code');
      }
    } finally {
      setPromoLoading(false);
    }
  }, [promoCode, persistToStorage]);

  /**
   * Calculate shipping options
   */
  const handleCalculateShipping = useCallback(async (address: any) => {
    try {
      setShippingLoading(true);
      setShippingError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const options = await calculateShipping(address, abortControllerRef.current.signal);
      setShippingOptions(options);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setShippingError(err.message);
      } else {
        setShippingError('Failed to calculate shipping');
      }
    } finally {
      setShippingLoading(false);
    }
  }, []);

  /**
   * Clear error states
   */
  const clearError = useCallback(() => setError(null), []);
  const clearPromoError = useCallback(() => setPromoError(null), []);
  const clearShippingError = useCallback(() => setShippingError(null), []);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (persistToStorage) {
      const savedCart = localStorage.getItem('cart_snapshot');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (err) {
          console.warn('Failed to parse saved cart:', err);
          localStorage.removeItem('cart_snapshot');
        }
      }
    }
  }, [persistToStorage]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      handleFetchCart();
    }
  }, [autoFetch, handleFetchCart]);

  // Set up sync interval
  useEffect(() => {
    if (syncInterval && syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        handleFetchCart();
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [syncInterval, handleFetchCart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  // Computed values
  const totalItems = cart?.totalItems || 0;
  const subtotal = cart?.subtotal || 0;
  const total = cart?.total || 0;
  const isEmpty = totalItems === 0;

  return {
    // Cart state
    cart,
    loading,
    error,
    isUpdating,

    // Cart actions
    addItem: handleAddItem,
    updateItem: handleUpdateItem,
    removeItem: handleRemoveItem,
    clear: handleClearCart,
    refreshCart: handleFetchCart,

    // Promo code functionality
    promoCode,
    setPromoCode,
    applyPromo: handleApplyPromo,
    promoLoading,
    promoError,

    // Shipping functionality
    shippingOptions,
    calculateShippingCost: handleCalculateShipping,
    shippingLoading,
    shippingError,

    // Computed values
    totalItems,
    subtotal,
    total,
    isEmpty,

    // Error handling
    clearError,
    clearPromoError,
    clearShippingError,
  };
}