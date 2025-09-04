/**
 * Cart Service - Handles all cart-related API interactions
 * Compliant with CLAUDE_RULES: Isolated API logic from UI components
 */

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  customizations?: {
    material?: string;
    gemstone?: string;
    size?: string;
    engraving?: string;
  };
  product: {
    name: string;
    price: number;
    image: string;
    sku: string;
  };
  totalPrice: number;
  addedAt: string;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total: number;
  currency: string;
}

export interface AddToCartParams {
  productId: string;
  quantity: number;
  customizations?: {
    material?: string;
    gemstone?: string;
    size?: string;
    engraving?: string;
  };
}

export interface UpdateCartItemParams {
  itemId: string;
  quantity?: number;
  customizations?: {
    material?: string;
    gemstone?: string;
    size?: string;
    engraving?: string;
  };
}

/**
 * Fetch current cart contents
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<CartSummary>
 */
export async function fetchCart(signal?: AbortSignal): Promise<CartSummary> {
  try {
    const response = await fetch('/api/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to fetch cart');
    }

    return data.data || {
      items: [],
      totalItems: 0,
      subtotal: 0,
      total: 0,
      currency: 'USD'
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while fetching cart');
  }
}

/**
 * Add item to cart
 * @param params - Add to cart parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<CartSummary>
 */
export async function addToCart(
  params: AddToCartParams,
  signal?: AbortSignal
): Promise<CartSummary> {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to add to cart: ${response.status}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to add item to cart');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while adding to cart');
  }
}

/**
 * Update cart item
 * @param params - Update cart item parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<CartSummary>
 */
export async function updateCartItem(
  params: UpdateCartItemParams,
  signal?: AbortSignal
): Promise<CartSummary> {
  try {
    const response = await fetch(`/api/cart/${params.itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        quantity: params.quantity,
        customizations: params.customizations,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to update cart item: ${response.status}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to update cart item');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while updating cart item');
  }
}

/**
 * Remove item from cart
 * @param itemId - Cart item ID
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<CartSummary>
 */
export async function removeFromCart(
  itemId: string,
  signal?: AbortSignal
): Promise<CartSummary> {
  try {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to remove cart item: ${response.status}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to remove cart item');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while removing cart item');
  }
}

/**
 * Clear entire cart
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<void>
 */
export async function clearCart(signal?: AbortSignal): Promise<void> {
  try {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to clear cart: ${response.status}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to clear cart');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while clearing cart');
  }
}

/**
 * Apply promo code to cart
 * @param promoCode - Promo code to apply
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<CartSummary>
 */
export async function applyPromoCode(
  promoCode: string,
  signal?: AbortSignal
): Promise<CartSummary> {
  try {
    const response = await fetch('/api/cart/promo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code: promoCode }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Invalid promo code');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to apply promo code');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while applying promo code');
  }
}

/**
 * Calculate shipping cost for cart
 * @param shippingAddress - Shipping address details
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<Array<ShippingOption>>
 */
export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
}

export async function calculateShipping(
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  signal?: AbortSignal
): Promise<ShippingOption[]> {
  try {
    const response = await fetch('/api/cart/shipping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ address: shippingAddress }),
      signal,
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
    console.warn('Failed to calculate shipping:', error);
    return [];
  }
}