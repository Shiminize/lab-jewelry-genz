import type { ConciergeDataProvider, ProductFilter, Product } from './types';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

function map(doc: any): Product {
  // Map Prisma Product to internal Product interface
  return {
    id: doc.sku || doc.id,
    title: doc.name || 'Untitled Product',
    price: doc.basePrice ?? 0,
    currency: doc.currency ?? 'USD',
    imageUrl: doc.heroImage || (doc.gallery && doc.gallery[0]) || '',
    category: doc.category,
    readyToShip: (doc.metadata as any)?.readyToShip ?? false, // Stored in metadata in new schema? Or does Product have readyToShip? 
    // Schema check: Product has `status`, `featured`, `bestseller`. 
    // `readyToShip` was not in Product schema I viewed? 
    // Let me check Schema again.
    // Product schema: inventory, metadata. 
    // `readyToShip` was NOT in Product schema. 
    // I need to ensure `readyToShip` is handled. In `bulk-update` I put it in `metadata`.
    // So yes, `(doc.metadata as any)?.readyToShip`.

    tags: (doc.metadata as any)?.tags ?? [],
    shippingPromise: (doc.metadata as any)?.shippingPromise,
    badges: (doc.metadata as any)?.badges ?? [],
    featuredInWidget: (doc.metadata as any)?.featuredInWidget ?? false,
  };
}

export const localDbProvider: ConciergeDataProvider = {
  async listProducts(f: ProductFilter) {
    const andConditions: Prisma.ProductWhereInput[] = [];

    // Default to active products only
    andConditions.push({ status: 'active' });

    if (f.category) {
      // Special handling for 'ring' to match 'Rings' (plural) in DB
      // This prevents 'contains' matching 'Earrings'
      if (f.category.toLowerCase() === 'ring' || f.category.toLowerCase() === 'rings') {
        andConditions.push({
          OR: [
            { category: { equals: 'ring', mode: 'insensitive' } },
            { category: { equals: 'rings', mode: 'insensitive' } },
            { category: { equals: 'Ring', mode: 'insensitive' } },
            { category: { equals: 'Rings', mode: 'insensitive' } }
          ]
        });
      } else if (f.category.toLowerCase() === 'necklace' || f.category.toLowerCase() === 'necklaces') {
        andConditions.push({
          OR: [
            { category: { equals: 'necklace', mode: 'insensitive' } },
            { category: { equals: 'necklaces', mode: 'insensitive' } },
            { category: { equals: 'Necklace', mode: 'insensitive' } },
            { category: { equals: 'Necklaces', mode: 'insensitive' } }
          ]
        });
      } else {
        andConditions.push({ category: { equals: f.category, mode: 'insensitive' } });
      }
    }

    // JSON Metadata Filtering for Ready To Ship
    if (typeof f.readyToShip === 'boolean') {
      andConditions.push({ metadata: { path: ['readyToShip'], equals: f.readyToShip } });
    }

    // Featured in widget filter
    if ((f as any).featured === true) {
      andConditions.push({ metadata: { path: ['featuredInWidget'], equals: true } });
    }

    // Price Filtering
    if (f.priceMin !== undefined) {
      andConditions.push({ basePrice: { gte: f.priceMin } });
    }
    if (f.priceMax !== undefined) {
      andConditions.push({ basePrice: { lte: f.priceMax } });
    } else if (f.priceLt !== undefined) {
      andConditions.push({ basePrice: { lt: f.priceLt } });
    }

    // Search Query (Name, Description, Category)
    if (f.q) {
      andConditions.push({
        OR: [
          { name: { contains: f.q, mode: 'insensitive' } },
          { description: { contains: f.q, mode: 'insensitive' } },
          { category: { contains: f.q, mode: 'insensitive' } }
        ]
      });
    }

    // Construct final where clause
    const where: Prisma.ProductWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    // Determine Sort Order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { updatedAt: 'desc' };
    switch (f.sortBy) {
      case 'newest':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'price-asc':
        orderBy = { basePrice: 'asc' };
        break;
      case 'price-desc':
        orderBy = { basePrice: 'desc' };
        break;
      case 'featured':
        // If 'bestseller' column exists and is relevant, use it, otherwise newest
        orderBy = { bestseller: 'desc' };
        break;
    }

    try {
      const docs = await prisma.product.findMany({
        where,
        orderBy,
        skip: f.offset ?? 0,
        take: f.limit ?? 20,
      });

      return docs.map(map);
    } catch (error) {
      // Log error but don't crash, allowing service layer to decide (though service layer also catches)
      console.error('[localDbProvider] listProducts error:', error);
      throw error;
    }
  },

  async getProduct(id: string) {
    const doc = await prisma.product.findUnique({
      where: { sku: id } // Try SKU first
    }) || await prisma.product.findFirst({
      where: { id: id } // Fallback to ID
    });

    return doc ? map(doc) : null;
  },
};
