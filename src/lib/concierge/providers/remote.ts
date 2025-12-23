import type { ConciergeDataProvider, ProductFilter, Product } from './types';
import { conciergeConfig } from '@/config/concierge';

/**
 * Remote API provider for production use.
 * Calls external microservices for product data.
 */

function buildQueryString(filter: ProductFilter): string {
  const params = new URLSearchParams();

  if (filter.q) params.set('q', filter.q);
  if (filter.category) params.set('category', filter.category);
  // Enforce ready-to-ship for recommendation-only
  params.set('readyToShip', 'true');
  if (filter.tags?.length) params.set('tags', filter.tags.join(','));
  // Price filters (optional)
  const anyFilter = filter as any;
  if (typeof anyFilter.priceMin === 'number') params.set('priceMin', String(anyFilter.priceMin));
  if (typeof anyFilter.priceMax === 'number') params.set('priceMax', String(anyFilter.priceMax));
  if (filter.limit) params.set('limit', filter.limit.toString());
  if (filter.offset) params.set('offset', filter.offset.toString());

  return params.toString();
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  // Merge existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => headers.set(key, value));
  }

  if (conciergeConfig.remote.apiKey) {
    headers.set('Authorization', `Bearer ${conciergeConfig.remote.apiKey}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), conciergeConfig.remote.timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const remoteApiProvider: ConciergeDataProvider = {
  async listProducts(filter: ProductFilter): Promise<Product[]> {
    const baseUrl = conciergeConfig.remote.baseUrl;
    if (!baseUrl) {
      throw new Error('CONCIERGE_API_BASE not configured');
    }

    const queryString = buildQueryString(filter);
    const url = `${baseUrl}/products${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`Remote API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.products ?? [];
    } catch (error) {
      console.error('[remoteApiProvider] listProducts failed', error);
      throw error;
    }
  },

  async getProduct(id: string): Promise<Product | null> {
    const baseUrl = conciergeConfig.remote.baseUrl;
    if (!baseUrl) {
      throw new Error('CONCIERGE_API_BASE not configured');
    }

    const url = `${baseUrl}/products/${encodeURIComponent(id)}`;

    try {
      const response = await fetchWithAuth(url);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Remote API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[remoteApiProvider] getProduct failed', error);
      throw error;
    }
  },
};

