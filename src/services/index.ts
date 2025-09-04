/**
 * Services Index - Central export point for all service modules
 * Compliant with CLAUDE_RULES: Clean service layer architecture
 */

// Export all services
export * from './searchService';
export * from './productService';
export * from './cartService';
export * from './authService';
export * from './navigation';

// Re-export common types for convenience
export type {
  SearchResult,
  SearchResponse,
  SearchFilters
} from './searchService';

export type {
  Product,
  ProductSpecification,
  ProductListParams,
  ProductListResponse
} from './productService';

export type {
  CartItem,
  CartSummary,
  AddToCartParams,
  UpdateCartItemParams,
  ShippingOption
} from './cartService';

export type {
  User,
  RegisterParams,
  LoginParams,
  AuthResponse,
  UpdateProfileParams,
  AddressParams
} from './authService';

// Navigation service types
export type {
  NavigationCategory,
  NavigationSubcategory,
  FeaturedProduct,
  NavigationItem,
  MegaMenuData,
  QuickLink,
  PromotionalBanner,
  NavigationUIState,
  MobileNavigationState,
  NavigationPreferences,
  NavigationMetrics
} from './navigation';