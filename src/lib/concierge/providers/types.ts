export type SortBy = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export type ProductFilter = {
  q?: string;
  category?: string;
  readyToShip?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
  priceLt?: number;
  priceMax?: number;
  priceMin?: number;
  metal?: string;
  sortBy?: SortBy;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category: string;
  metal?: string;
  readyToShip?: boolean;
  tags?: string[];
  shippingPromise?: string;
  badges?: string[];
  featuredInWidget?: boolean;
  slug?: string;
};

export interface ConciergeDataProvider {
  listProducts(filter: ProductFilter): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
}
