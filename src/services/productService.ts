/**
 * Product Service - Handles all product-related API interactions
 * Compliant with CLAUDE_RULES: Isolated API logic from UI components
 */

export interface ProductSpecification {
  materials: string[];
  gemstone?: {
    type: 'lab-grown diamond' | 'moissanite';
    carat: number;
    color: string;
    clarity: string;
    cut: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  customizable: {
    metals: string[];
    stones: string[];
    sizes: string[];
    engraving: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'rings' | 'necklaces' | 'earrings' | 'bracelets';
  subcategory?: string;
  basePrice: number;
  originalPrice?: number;
  images: {
    primary: string;
    gallery: string[];
    thumbnail: string;
    model3D?: string;
  };
  specifications: ProductSpecification;
  inventory: {
    sku: string;
    quantity: number;
    available: number;
  };
  metadata: {
    featured: boolean;
    bestseller: boolean;
    newArrival: boolean;
    status: 'active' | 'inactive' | 'discontinued';
  };
  seo: {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  priceMin?: number;
  priceMax?: number;
  materials?: string[];
  gemstones?: string[];
  sortBy?: 'name' | 'price' | 'popularity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  products: Product[];
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
}

/**
 * Fetch products list with optional filtering and pagination
 * @param params - Query parameters for filtering and pagination
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<ProductListResponse>
 */
export async function fetchProducts(
  params?: ProductListParams,
  signal?: AbortSignal
): Promise<ProductListResponse> {
  try {
    const searchParams = new URLSearchParams();

    // Add pagination parameters
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    // Add filter parameters
    if (params?.category) searchParams.append('category', params.category);
    if (params?.subcategory) searchParams.append('subcategory', params.subcategory);
    if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString());
    if (params?.bestseller !== undefined) searchParams.append('bestseller', params.bestseller.toString());
    if (params?.newArrival !== undefined) searchParams.append('newArrival', params.newArrival.toString());
    if (params?.priceMin) searchParams.append('priceMin', params.priceMin.toString());
    if (params?.priceMax) searchParams.append('priceMax', params.priceMax.toString());
    if (params?.materials) searchParams.append('materials', params.materials.join(','));
    if (params?.gemstones) searchParams.append('gemstones', params.gemstones.join(','));
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `/api/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to fetch products');
    }

    return {
      products: data.data || [],
      pagination: data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      filters: data.filters || { categories: [], materials: [], priceRange: { min: 0, max: 0 } }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while fetching products');
  }
}

/**
 * Fetch a single product by ID
 * @param productId - Product ID
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<Product>
 */
export async function fetchProductById(
  productId: string,
  signal?: AbortSignal
): Promise<Product> {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to fetch product');
    }

    if (!data.data) {
      throw new Error('Product not found');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while fetching product');
  }
}

/**
 * Fetch featured products
 * @param limit - Maximum number of products to return
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<Product[]>
 */
export async function fetchFeaturedProducts(
  limit: number = 6,
  signal?: AbortSignal
): Promise<Product[]> {
  try {
    const params: ProductListParams = {
      featured: true,
      limit,
      sortBy: 'popularity',
      sortOrder: 'desc'
    };

    const response = await fetchProducts(params, signal);
    return response.products;
  } catch (error) {
    console.warn('Failed to fetch featured products:', error);
    return [];
  }
}

/**
 * Fetch product categories with counts
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<Array<{name: string, count: number}>>
 */
export async function fetchProductCategories(
  signal?: AbortSignal
): Promise<Array<{ name: string; count: number; slug: string }>> {
  try {
    const response = await fetch('/api/products/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.warn('Failed to fetch product categories:', error);
    return [];
  }
}

/**
 * Check product inventory availability
 * @param productId - Product ID
 * @param quantity - Desired quantity
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<boolean>
 */
export async function checkProductAvailability(
  productId: string,
  quantity: number = 1,
  signal?: AbortSignal
): Promise<boolean> {
  try {
    const response = await fetch(`/api/inventory/${productId}?quantity=${quantity}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    if (!data.success) {
      return false;
    }

    return data.data?.available >= quantity;
  } catch (error) {
    console.warn('Failed to check product availability:', error);
    return false;
  }
}