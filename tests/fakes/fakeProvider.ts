import type { ConciergeDataProvider, Product, ProductFilter } from '@/lib/concierge/providers/types';
import data from '../fixtures/products.json';

function map(d: any): Product {
  return {
    id: d.sku,
    title: d.title,
    price: d.price,
    currency: d.currency || 'USD',
    imageUrl: d.imageUrl,
    category: d.category,
    readyToShip: !!d.readyToShip,
    tags: d.tags || [],
    shippingPromise: d.shippingPromise,
    badges: d.badges || [],
    featuredInWidget: !!d.featuredInWidget,
  };
}
const rows = (data as any[]).map(map);

console.info('[fakeProvider] Loaded %d fixture rows', rows.length);

export const fakeProvider: ConciergeDataProvider = {
  async listProducts(f: ProductFilter & { featured?: boolean; priceLt?: number }) {
    let out = rows.slice();

    if (f.category) {
      out = out.filter((p) => (p.category || '').toLowerCase() === f.category!.toLowerCase());
    }

    if (typeof f.readyToShip === 'boolean') {
      out = out.filter((p) => !!p.readyToShip === f.readyToShip);
    }

    if (f.tags?.length) {
      out = out.filter((p) => f.tags!.every((t) => (p.tags || []).includes(t)));
    }

    if ((f as any).featured) {
      out = out.filter((p) => p.featuredInWidget === true);
    }

    if (Number.isFinite((f as any).priceLt)) {
      const limit = Number((f as any).priceLt);
      out = out.filter((p) => typeof p.price === 'number' && p.price < limit);
    }

    out.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    const start = f.offset ?? 0;
    const end = start + (f.limit ?? 20);
    return out.slice(start, end);
  },

  async getProduct(id: string) {
    return rows.find((p) => p.id === id) ?? null;
  },
};

export default fakeProvider;
