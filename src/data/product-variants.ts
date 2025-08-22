/**
 * Legacy File - Converted to Pure CSS 3D Bridge Service Mode
 * 
 * This file previously contained hardcoded variants (RING_VARIANTS, DEFAULT_VARIANT, getVariantById)
 * but has been completely removed per CLAUDE_RULES.md Section 92-97 compliance.
 * 
 * All product variant data now comes exclusively from the bridge service API.
 * See: src/hooks/useCustomizableProduct.ts for the new CSS 3D data source.
 */

import type { ProductVariant, Material } from '@/types/customizer'

/**
 * @deprecated Legacy hardcoded variants removed
 * Use bridge service API via useCustomizableProduct hook instead
 */
export const LEGACY_SYSTEM_REMOVED = true

// Minimal placeholder images for development only
export const PLACEHOLDER_IMAGES = {
  ring: '/images/jewelry-placeholder.webp',
  necklace: '/images/necklace-placeholder.webp',
  earrings: '/images/earrings-placeholder.webp',
  bracelet: '/images/bracelet-placeholder.webp'
}

/**
 * All legacy exports removed:
 * - RING_VARIANTS -> Use bridge service API
 * - DEFAULT_VARIANT -> Use bridge service API
 * - getVariantById -> Use bridge service API
 * - getVariantsByMaterial -> Use bridge service API
 * 
 * CSS 3D customizer now uses pure bridge service integration for all data.
 */