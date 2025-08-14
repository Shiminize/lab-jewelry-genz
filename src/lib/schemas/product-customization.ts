/**
 * Product Customization Validation Schemas
 * CLAUDE_RULES.md compliant Zod validation for 3D customizer API endpoints
 * Integrates with seed product data structure
 */

import { z } from 'zod'

// Material options schema based on seed product data
export const MaterialSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceMultiplier: z.number().min(0.5).max(3.0), // Reasonable price range
  description: z.string().optional(),
  sustainability: z.string().optional(),
  color: z.string().optional(), // For 3D rendering
  properties: z.object({
    metalness: z.number().min(0).max(1).optional(),
    roughness: z.number().min(0).max(1).optional(),
    color: z.string().optional()
  }).optional()
})

// Stone quality schema
export const StoneQualitySchema = z.object({
  id: z.string(),
  name: z.string(),
  priceMultiplier: z.number().min(0.8).max(2.5),
  description: z.string().optional(),
  certification: z.string().optional(),
  properties: z.object({
    clarity: z.string().optional(),
    cut: z.string().optional(),
    color: z.string().optional(),
    sparkle: z.number().min(0).max(1).optional()
  }).optional()
})

// Customization options schema
export const CustomizationOptionsSchema = z.object({
  material: MaterialSchema.nullable(),
  stoneQuality: StoneQualitySchema.nullable(),
  size: z.object({
    id: z.string(),
    name: z.string(),
    value: z.number().min(3).max(15), // US ring sizes
    isHalfSize: z.boolean().optional()
  }).nullable(),
  engraving: z.string().max(25).optional(),
  specialOptions: z.record(z.any()).optional() // For product-specific options
})

// Product customization response schema
export const ProductCustomizationSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    basePrice: z.number().min(0),
    originalPrice: z.number().min(0).optional(),
    keyFeatures: z.array(z.string()),
    socialAppeal: z.string().optional(),
    targetEmotion: z.string().optional(),
    modelPath: z.string().optional() // Path to 3D model
  }),
  availableMaterials: z.array(MaterialSchema),
  availableStones: z.array(StoneQualitySchema),
  availableSizes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value: z.number(),
    isHalfSize: z.boolean().optional()
  })),
  sustainability: z.object({
    materials: z.string().optional(),
    packaging: z.string().optional(),
    carbonNeutral: z.string().optional(),
    certifications: z.array(z.string()).optional()
  }).optional(),
  pricing: z.object({
    basePrice: z.number(),
    materialUpgrades: z.record(z.number()),
    stoneUpgrades: z.record(z.number()),
    engravingCost: z.number(),
    specialOptionsCosts: z.record(z.number()).optional()
  }),
  metadata: z.object({
    category: z.string(),
    tags: z.array(z.string()).optional(),
    genZAppeal: z.string().optional(),
    instagramability: z.string().optional()
  }).optional()
})

// Request validation schemas
export const ProductCustomizationRequestSchema = z.object({
  productId: z.string().min(1)
})

export const SaveCustomizationRequestSchema = z.object({
  productId: z.string().min(1),
  customization: CustomizationOptionsSchema,
  name: z.string().max(100).optional(),
  isPublic: z.boolean().optional()
})

export const ShareCustomizationRequestSchema = z.object({
  productId: z.string().min(1),
  customization: CustomizationOptionsSchema,
  shareOptions: z.object({
    includePrice: z.boolean().optional(),
    includeMessage: z.string().max(280).optional(),
    platform: z.enum(['url', 'social', 'email']).optional()
  }).optional()
})

// Price calculation schema
export const PriceCalculationSchema = z.object({
  basePrice: z.number().min(0),
  materialCost: z.number(),
  stoneCost: z.number(),
  engravingCost: z.number(),
  specialOptionsCosts: z.record(z.number()).optional(),
  total: z.number().min(0),
  savings: z.number().optional(),
  financing: z.object({
    monthlyPayment: z.number(),
    term: z.number(),
    provider: z.string()
  }).optional()
})

// Export types for TypeScript
export type Material = z.infer<typeof MaterialSchema>
export type StoneQuality = z.infer<typeof StoneQualitySchema>
export type CustomizationOptions = z.infer<typeof CustomizationOptionsSchema>
export type ProductCustomization = z.infer<typeof ProductCustomizationSchema>
export type PriceCalculation = z.infer<typeof PriceCalculationSchema>
export type ProductCustomizationRequest = z.infer<typeof ProductCustomizationRequestSchema>
export type SaveCustomizationRequest = z.infer<typeof SaveCustomizationRequestSchema>
export type ShareCustomizationRequest = z.infer<typeof ShareCustomizationRequestSchema>