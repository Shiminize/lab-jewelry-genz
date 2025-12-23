import type { ConciergeDataProvider, ProductFilter, Product } from './types';

/**
 * Stub provider for local development without database dependencies.
 * Returns mock data for all product queries.
 */

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'RING-STUB-001',
    title: 'Aurora Solitaire Ring',
    price: 2499,
    currency: 'USD',
    imageUrl: '/images/mock/ring-solitaire.jpg',
    category: 'ring',
    readyToShip: true,
    tags: ['ready-to-ship', 'solitaire', 'engagement'],
    shippingPromise: 'Ships within 2 business days',
    badges: ['Ready to Ship', 'Best Seller'],
    featuredInWidget: true,
  },
  {
    id: 'RING-STUB-002',
    title: 'Coral Sky Stacking Ring',
    price: 899,
    currency: 'USD',
    imageUrl: '/images/mock/ring-stack.jpg',
    category: 'ring',
    readyToShip: true,
    tags: ['ready-to-ship', 'stackable', 'everyday'],
    shippingPromise: 'Ships this week',
    badges: ['Ready to Ship'],
    featuredInWidget: true,
  },
  {
    id: 'RING-STUB-003',
    title: 'Rose Gold Petite Band',
    price: 420,
    currency: 'USD',
    imageUrl: '/images/mock/ring-rose.jpg',
    category: 'ring',
    metal: '14k_rose',
    readyToShip: true,
    tags: ['ready-to-ship', 'gift', 'rose gold'],
    shippingPromise: 'Ships within 24 hours',
    badges: ['Ready to Ship', 'Under $500'],
    featuredInWidget: true,
  },
  {
    id: 'NECK-STUB-002',
    title: 'Everyday Lariat Necklace',
    price: 320,
    currency: 'USD',
    imageUrl: '/images/mock/necklace-lariat.jpg',
    category: 'necklace',
    metal: '14k_rose',
    readyToShip: true,
    tags: ['ready-to-ship', 'gift', 'rose gold'],
    shippingPromise: 'Ships this week',
    badges: ['Ready to Ship', 'Under $500'],
    featuredInWidget: true,
  },
  {
    id: 'EAR-STUB-001',
    title: 'Holographic Ear Climbers',
    price: 1299,
    currency: 'USD',
    imageUrl: '/images/mock/ear-climber.jpg',
    category: 'earring',
    readyToShip: false,
    tags: ['custom', 'ear-stack', 'statement'],
    shippingPromise: 'Made to order - 3-4 weeks',
    badges: ['Made to Order'],
    featuredInWidget: true,
  },
  {
    id: 'NECK-STUB-001',
    title: 'Lab Diamond Pendant',
    price: 1899,
    currency: 'USD',
    imageUrl: '/images/mock/pendant.jpg',
    category: 'necklace',
    readyToShip: true,
    tags: ['ready-to-ship', 'lab-grown', 'gift'],
    shippingPromise: 'Ships within 1 business day',
    badges: ['Ready to Ship', 'Eco-Certified'],
    featuredInWidget: true,
  },
];

export const stubProvider: ConciergeDataProvider = {
  async listProducts(filter: ProductFilter): Promise<Product[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    let results = [...MOCK_PRODUCTS];

    // Apply filters
    if (filter.category) {
      const targetCategory = filter.category.toLowerCase();
      results = results.filter((p) => (p.category ?? '').toLowerCase() === targetCategory);
    }

    // Enforce ready-to-ship for recommendation-only
    results = results.filter((p) => p.readyToShip === true);
    // Price filters (optional via any-cast)
    const anyFilter = filter as any;
    if (typeof anyFilter.priceMin === 'number') {
      results = results.filter((p) => p.price >= anyFilter.priceMin);
    }
    if (typeof anyFilter.priceMax === 'number') {
      results = results.filter((p) => p.price <= anyFilter.priceMax);
    }

    if (filter.tags?.length) {
      results = results.filter((p) => filter.tags!.some((tag) => p.tags?.includes(tag)));
    }

    if (filter.q) {
      const query = filter.q.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    // Apply offset and limit
    const offset = filter.offset ?? 0;
    const limit = filter.limit ?? 20;
    results = results.slice(offset, offset + limit);

    return results;
  },

  async getProduct(id: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  },
};
