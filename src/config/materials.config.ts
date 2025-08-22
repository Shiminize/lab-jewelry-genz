/**
 * Standardized Material Configuration
 * CLAUDE_RULES.md Compliant - Optimized for <100ms material switching
 * 
 * Defines standard jewelry materials with scientifically accurate properties
 * for consistent rendering across all GLB models and generation pipeline
 */

export interface MaterialConfig {
  id: string
  name: string
  description: string
  properties: {
    metallic: number    // 0.0 = dielectric, 1.0 = metallic
    roughness: number   // 0.0 = mirror, 1.0 = matte
    color: [number, number, number] // RGB values (0.0-1.0)
  }
  priceModifier: number // Price adjustment from base price
  hexColor: string      // UI display color
  category: 'precious-metal' | 'alternative-metal' | 'alloy'
}

/**
 * Standard Materials for 3D Customizer
 * These materials are optimized for jewelry visualization
 * and correspond to real-world material properties
 */
export const STANDARD_MATERIALS: MaterialConfig[] = [
  {
    id: 'platinum',
    name: 'Platinum',
    description: 'Premium white metal with exceptional durability and hypoallergenic properties',
    properties: {
      metallic: 1.0,
      roughness: 0.1,
      color: [0.9, 0.9, 0.9]
    },
    priceModifier: 800,
    hexColor: '#E5E4E2',
    category: 'precious-metal'
  },
  {
    id: '18k-white-gold',
    name: '18K White Gold',
    description: 'Classic white gold alloy with rhodium plating for brilliant finish',
    properties: {
      metallic: 1.0,
      roughness: 0.15,
      color: [0.95, 0.95, 0.95]
    },
    priceModifier: 0, // Base price
    hexColor: '#F5F5F5',
    category: 'precious-metal'
  },
  {
    id: '18k-yellow-gold',
    name: '18K Yellow Gold',
    description: 'Traditional yellow gold with warm, rich color and timeless appeal',
    properties: {
      metallic: 1.0,
      roughness: 0.1,
      color: [1.0, 0.86, 0.57]
    },
    priceModifier: -100,
    hexColor: '#FFD700',
    category: 'precious-metal'
  },
  {
    id: '18k-rose-gold',
    name: '18K Rose Gold',
    description: 'Romantic rose gold with copper alloy for distinctive warm tone',
    properties: {
      metallic: 1.0,
      roughness: 0.12,
      color: [0.91, 0.71, 0.67]
    },
    priceModifier: 50,
    hexColor: '#E8B4B8',
    category: 'precious-metal'
  }
]

/**
 * Material lookup utilities
 */
export const getMaterialById = (id: string): MaterialConfig | undefined => {
  return STANDARD_MATERIALS.find(material => material.id === id)
}

export const getMaterialsByCategory = (category: MaterialConfig['category']): MaterialConfig[] => {
  return STANDARD_MATERIALS.filter(material => material.category === category)
}

/**
 * Path generation utilities for actual directory structure
 * Fixed to match existing /3d-sequences/ structure with unified naming
 */
export const generateMaterialPath = (modelId: string, materialId: string): string => {
  // 🔧 CRITICAL FIX: Map config material IDs to filesystem directory names
  const MATERIAL_ID_TO_FILESYSTEM_MAP: Record<string, string> = {
    'platinum': 'platinum',
    '18k-white-gold': 'white-gold',
    '18k-yellow-gold': 'yellow-gold', 
    '18k-rose-gold': 'rose-gold'
  }
  
  const filesystemMaterialId = MATERIAL_ID_TO_FILESYSTEM_MAP[materialId] || materialId
  
  console.log(`🔧 [PATH FIX] Material ID mapping: ${materialId} → ${filesystemMaterialId}`)
  
  // Convert separate model/material to unified directory naming that matches filesystem
  // Example: ring-classic-002 + 18k-rose-gold → ring-classic-002-rose-gold
  return `images/products/3d-sequences/${modelId}-${filesystemMaterialId}`
}

/**
 * Validation utilities
 */
export const validateMaterialProperties = (properties: MaterialConfig['properties']): boolean => {
  const { metallic, roughness, color } = properties
  
  return (
    metallic >= 0.0 && metallic <= 1.0 &&
    roughness >= 0.0 && roughness <= 1.0 &&
    color.length === 3 &&
    color.every(channel => channel >= 0.0 && channel <= 1.0)
  )
}

/**
 * Export default configuration for easy imports
 */
export default {
  materials: STANDARD_MATERIALS,
  getMaterialById,
  getMaterialsByCategory,
  generateMaterialPath,
  validateMaterialProperties
}