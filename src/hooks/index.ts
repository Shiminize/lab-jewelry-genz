/**
 * Hooks Index - Central export point for all custom hooks
 * Compliant with CLAUDE_RULES: Clean hooks layer architecture
 */

// Export all architectural hooks
export { useSearch } from './useSearch';
export { useProducts, useProduct, useFeaturedProducts, useProductCategories } from './useProductData';
export { useCartManagement } from './useCartManagement';
export { useUserSession } from './useUserSession';

// UI behavior hooks
export { useScrollBehavior } from './useScrollBehavior';
export { useClickOutside } from './useClickOutside';

// Export existing domain-specific hooks (if any)
export { useCustomization } from './useCustomization';
export { useMobileNavigation } from './useMobileNavigation';
export { useWishlist } from './useWishlist';
// Real-time inventory hooks
export { 
  useInventoryAlerts,
  useInventoryMonitor, 
  useInventoryStats,
  useProductInventory,
  useStockReservation 
} from './useRealTimeInventory';
export { useCustomizableProduct } from './useCustomizableProduct';
// Type safety hooks
export {
  useDataValidation,
  useSafeEventHandlers,
  useSafeMaterial,
  useSafePriceCalculation,
  useSafeVariant
} from './useTypeSafety';
export { useWebSocket } from './useWebSocket';

// Re-export common types for convenience
export type {
  UseSearchReturn
} from './useSearch';

export type {
  UseProductsReturn,
  UseProductReturn,
  UseFeaturedProductsReturn,
  UseCategoriesReturn
} from './useProductData';

export type {
  UseCartReturn
} from './useCartManagement';

export type {
  UseUserSessionReturn
} from './useUserSession';

export type {
  UseScrollBehaviorOptions,
  ScrollBehaviorState
} from './useScrollBehavior';

export type {
  UseClickOutsideOptions
} from './useClickOutside';