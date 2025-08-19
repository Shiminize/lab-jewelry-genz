/**
 * Product Customizer Schema Enhancement - Phase 3 Database Integration
 * Extends the existing product schema with 3D customizer specific fields
 */

import mongoose, { Schema } from 'mongoose'

// 3D Rendering Assets for Customizer
export interface CustomizerRenderingAssets {
  imageSequences: {
    materialId: string
    basePath: string
    frameCount: number
    format: 'webp' | 'jpg' | 'png' | 'avif'
    isGenerated: boolean
    generatedAt?: Date
    quality: 'low' | 'medium' | 'high'
  }[]
  
  models3D: {
    materialId: string
    glbPath: string
    textureSet: string[]
    optimizationLevel: 'low' | 'medium' | 'high'
    fileSize: number
    isOptimized: boolean
  }[]
  
  thumbnails: {
    materialId: string
    url: string
    size: 'small' | 'medium' | 'large'
    isOptimized: boolean
  }[]
}

// Enhanced Material Properties for 3D Rendering
export interface CustomizerMaterialProperties {
  // Physical Rendering Properties
  metalness: number        // 0-1 for 3D material rendering
  roughness: number        // 0-1 for surface roughness
  reflectivity: number     // 0-1 for material reflectivity
  color: string           // Hex color for material
  
  // Material Behavior
  environmentIntensity: number  // How much environment lighting affects the material
  normalMapStrength: number     // Strength of normal mapping effects
  emissiveColor?: string        // Color that material emits (for glowing effects)
  emissiveIntensity?: number    // Strength of emissive effect
  
  // Advanced Properties
  transparency?: number         // 0-1 for transparent materials like gems
  refractionIndex?: number      // For realistic gem rendering
  subsurfaceScattering?: number // For organic materials
  
  // Performance Optimization
  lodBias: number              // Level of detail bias for performance
  renderPriority: number       // Rendering priority (1-10)
}

// Enhanced Customization Option for 3D Customizer
export interface CustomizerOption extends mongoose.Document {
  name: string
  type: 'material' | 'gemstone' | 'size' | 'engraving' | 'setting' | 'finish'
  
  options: {
    value: string
    label: string
    description: string
    priceModifier: number
    isDefault: boolean
    isAvailable: boolean
    
    // 3D Rendering Properties
    materialProperties?: CustomizerMaterialProperties
    
    // Asset References
    renderingAssets: {
      imageSequencePath?: string
      model3DPath?: string
      thumbnailUrl?: string
    }
    
    // Compatibility
    compatibleWith: string[]     // Compatible with other option values
    incompatibleWith: string[]   // Incompatible with other option values
    
    // Inventory Tracking
    stockLevel: number
    isInStock: boolean
    leadTime?: number           // Days for custom options
    
    // UI/UX
    displayOrder: number
    hexColor?: string          // For color swatches
    iconUrl?: string          // For option icons
    previewUrl?: string       // Preview image URL
    
    // Analytics
    popularityScore: number   // How often this option is selected
    averageRating: number     // User rating for this option
  }[]
  
  // Configuration
  required: boolean
  maxSelections: number
  minSelections: number
  displayMode: 'grid' | 'list' | 'swatches' | 'dropdown'
  
  // Conditional Logic
  conditionalDisplay: {
    dependsOn: string         // Other option name this depends on
    requiredValue: string     // Required value to show this option
    operator: 'equals' | 'not-equals' | 'in' | 'not-in'
  }[]
  
  // Validation Rules
  validationRules: {
    rule: string             // Validation rule expression
    message: string          // Error message for validation failure
  }[]
}

// Product Variant Generation Configuration
export interface VariantGenerationConfig {
  enabled: boolean
  
  // Generation Rules
  autoGenerate: boolean                    // Automatically generate variants
  generateOn: ('material' | 'gemstone' | 'size')[]  // Which options trigger variant generation
  maxVariants: number                      // Maximum number of variants to generate
  
  // Naming Convention
  namingPattern: string                    // Pattern for variant names (e.g., "{product} - {material}")
  skuPattern: string                       // Pattern for variant SKUs
  
  // Asset Generation
  generateAssets: boolean                  // Whether to generate 3D assets for variants
  assetGenerationQueue: string             // Queue name for asset generation jobs
  
  // Performance
  cacheVariants: boolean                   // Cache generated variants
  cacheDuration: number                    // Cache duration in minutes
  
  // Quality Control
  requireApproval: boolean                 // Require manual approval for variants
  autoPublish: boolean                     // Auto-publish approved variants
}

// Customizer Performance Configuration
export interface CustomizerPerformanceConfig {
  // Loading Strategy
  loadingStrategy: 'eager' | 'lazy' | 'progressive'
  preloadFrames: number                    // Number of frames to preload
  
  // Quality Settings
  defaultQuality: 'low' | 'medium' | 'high'
  adaptiveQuality: boolean                 // Adapt quality based on device
  qualityThresholds: {
    lowEnd: string[]                       // User agents for low quality
    highEnd: string[]                      // User agents for high quality
  }
  
  // Caching
  enableBrowserCache: boolean
  cacheStrategy: 'memory' | 'indexeddb' | 'both'
  maxCacheSize: number                     // MB
  
  // Performance Monitoring
  enableMetrics: boolean
  metricsEndpoint?: string
  performanceThresholds: {
    loadTime: number                       // Max load time in ms
    frameRate: number                      // Min frame rate for smooth interaction
  }
}

// Schema definitions for the new fields
const CustomizerRenderingAssetsSchema = new Schema<CustomizerRenderingAssets>({
  imageSequences: [{
    materialId: { type: String, required: true },
    basePath: { type: String, required: true },
    frameCount: { type: Number, required: true, min: 1, max: 360 },
    format: { type: String, enum: ['webp', 'jpg', 'png', 'avif'], default: 'webp' },
    isGenerated: { type: Boolean, default: false },
    generatedAt: Date,
    quality: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  }],
  
  models3D: [{
    materialId: { type: String, required: true },
    glbPath: { type: String, required: true },
    textureSet: [String],
    optimizationLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    fileSize: { type: Number, required: true },
    isOptimized: { type: Boolean, default: false }
  }],
  
  thumbnails: [{
    materialId: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: String, enum: ['small', 'medium', 'large'], required: true },
    isOptimized: { type: Boolean, default: false }
  }]
})

const CustomizerMaterialPropertiesSchema = new Schema<CustomizerMaterialProperties>({
  // Physical Rendering Properties
  metalness: { type: Number, required: true, min: 0, max: 1, default: 1.0 },
  roughness: { type: Number, required: true, min: 0, max: 1, default: 0.1 },
  reflectivity: { type: Number, required: true, min: 0, max: 1, default: 0.9 },
  color: { type: String, required: true, match: /^#[0-9A-Fa-f]{6}$/ },
  
  // Material Behavior
  environmentIntensity: { type: Number, min: 0, max: 2, default: 1.0 },
  normalMapStrength: { type: Number, min: 0, max: 2, default: 1.0 },
  emissiveColor: { type: String, match: /^#[0-9A-Fa-f]{6}$/ },
  emissiveIntensity: { type: Number, min: 0, max: 1, default: 0 },
  
  // Advanced Properties
  transparency: { type: Number, min: 0, max: 1 },
  refractionIndex: { type: Number, min: 1, max: 3 },
  subsurfaceScattering: { type: Number, min: 0, max: 1 },
  
  // Performance Optimization
  lodBias: { type: Number, min: 0, max: 2, default: 1.0 },
  renderPriority: { type: Number, min: 1, max: 10, default: 5 }
})

const CustomizerOptionSchema = new Schema<CustomizerOption>({
  name: { type: String, required: true, maxlength: 100 },
  type: { 
    type: String, 
    enum: ['material', 'gemstone', 'size', 'engraving', 'setting', 'finish'], 
    required: true 
  },
  
  options: [{
    value: { type: String, required: true, maxlength: 50 },
    label: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    priceModifier: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    
    // 3D Rendering Properties
    materialProperties: CustomizerMaterialPropertiesSchema,
    
    // Asset References
    renderingAssets: {
      imageSequencePath: String,
      model3DPath: String,
      thumbnailUrl: String
    },
    
    // Compatibility
    compatibleWith: [String],
    incompatibleWith: [String],
    
    // Inventory Tracking
    stockLevel: { type: Number, default: 0, min: 0 },
    isInStock: { type: Boolean, default: true },
    leadTime: { type: Number, min: 0 },
    
    // UI/UX
    displayOrder: { type: Number, default: 0 },
    hexColor: { type: String, match: /^#[0-9A-Fa-f]{6}$/ },
    iconUrl: String,
    previewUrl: String,
    
    // Analytics
    popularityScore: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 }
  }],
  
  // Configuration
  required: { type: Boolean, default: false },
  maxSelections: { type: Number, default: 1, min: 1 },
  minSelections: { type: Number, default: 0, min: 0 },
  displayMode: { type: String, enum: ['grid', 'list', 'swatches', 'dropdown'], default: 'grid' },
  
  // Conditional Logic
  conditionalDisplay: [{
    dependsOn: { type: String, required: true },
    requiredValue: { type: String, required: true },
    operator: { type: String, enum: ['equals', 'not-equals', 'in', 'not-in'], default: 'equals' }
  }],
  
  // Validation Rules
  validationRules: [{
    rule: { type: String, required: true },
    message: { type: String, required: true }
  }]
})

const VariantGenerationConfigSchema = new Schema<VariantGenerationConfig>({
  enabled: { type: Boolean, default: true },
  
  // Generation Rules
  autoGenerate: { type: Boolean, default: false },
  generateOn: [{ type: String, enum: ['material', 'gemstone', 'size'] }],
  maxVariants: { type: Number, default: 50, min: 1, max: 1000 },
  
  // Naming Convention
  namingPattern: { type: String, default: '{product} - {material}', maxlength: 200 },
  skuPattern: { type: String, default: '{sku}-{material}', maxlength: 100 },
  
  // Asset Generation
  generateAssets: { type: Boolean, default: false },
  assetGenerationQueue: { type: String, default: 'asset-generation' },
  
  // Performance
  cacheVariants: { type: Boolean, default: true },
  cacheDuration: { type: Number, default: 60, min: 1 }, // minutes
  
  // Quality Control
  requireApproval: { type: Boolean, default: true },
  autoPublish: { type: Boolean, default: false }
})

const CustomizerPerformanceConfigSchema = new Schema<CustomizerPerformanceConfig>({
  // Loading Strategy
  loadingStrategy: { type: String, enum: ['eager', 'lazy', 'progressive'], default: 'progressive' },
  preloadFrames: { type: Number, default: 5, min: 1, max: 36 },
  
  // Quality Settings
  defaultQuality: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  adaptiveQuality: { type: Boolean, default: true },
  qualityThresholds: {
    lowEnd: [String],
    highEnd: [String]
  },
  
  // Caching
  enableBrowserCache: { type: Boolean, default: true },
  cacheStrategy: { type: String, enum: ['memory', 'indexeddb', 'both'], default: 'both' },
  maxCacheSize: { type: Number, default: 100, min: 10, max: 1000 }, // MB
  
  // Performance Monitoring
  enableMetrics: { type: Boolean, default: true },
  metricsEndpoint: String,
  performanceThresholds: {
    loadTime: { type: Number, default: 3000, min: 500 }, // ms
    frameRate: { type: Number, default: 30, min: 15 }    // fps
  }
})

// Extension fields to add to the existing ProductSchema
export const ProductCustomizerExtension = {
  // 3D Customizer Specific Fields
  customizerEnabled: { type: Boolean, default: false },
  customizerVersion: { type: String, default: '1.0.0' },
  
  // Enhanced Rendering Assets
  customizerAssets: CustomizerRenderingAssetsSchema,
  
  // Enhanced Customization Options (replaces basic customizationOptions)
  customizerOptions: [CustomizerOptionSchema],
  
  // Variant Generation Configuration
  variantGeneration: VariantGenerationConfigSchema,
  
  // Performance Configuration
  customizerPerformance: CustomizerPerformanceConfigSchema,
  
  // Customizer Metadata
  customizerMetadata: {
    lastUpdated: { type: Date, default: Date.now },
    lastValidation: Date,
    validationErrors: [String],
    warningMessages: [String],
    
    // Asset Generation Status
    assetGenerationStatus: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'pending'
    },
    assetGenerationProgress: { type: Number, min: 0, max: 100, default: 0 },
    lastAssetGeneration: Date,
    
    // Performance Metrics
    averageLoadTime: { type: Number, default: 0 },
    averageFrameRate: { type: Number, default: 0 },
    userSatisfactionScore: { type: Number, min: 0, max: 10, default: 0 },
    
    // Usage Statistics
    totalCustomizations: { type: Number, default: 0 },
    popularOptions: [{
      optionName: String,
      value: String,
      selectionCount: Number,
      percentage: Number
    }],
    
    // Quality Assurance
    qaStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs-review'],
      default: 'pending'
    },
    qaComments: [String],
    qaDate: Date
  }
}

// Indexes for the new fields
export const ProductCustomizerIndexes = [
  { 'customizerEnabled': 1 },
  { 'customizerAssets.imageSequences.materialId': 1 },
  { 'customizerAssets.models3D.materialId': 1 },
  { 'customizerOptions.type': 1, 'customizerOptions.options.isAvailable': 1 },
  { 'customizerOptions.options.popularityScore': -1 },
  { 'customizerMetadata.assetGenerationStatus': 1 },
  { 'customizerMetadata.qaStatus': 1 },
  { 'customizerMetadata.lastUpdated': -1 }
]

// Virtual fields for customizer
export const ProductCustomizerVirtuals = {
  hasCustomizerAssets: function() {
    return this.customizerAssets && 
           (this.customizerAssets.imageSequences.length > 0 || 
            this.customizerAssets.models3D.length > 0)
  },
  
  availableCustomizerOptions: function() {
    return this.customizerOptions?.filter((option: any) => 
      option.options.some((opt: any) => opt.isAvailable && opt.isInStock)
    ) || []
  },
  
  customizerReadyPercentage: function() {
    if (!this.customizerEnabled) return 0
    
    let score = 0
    let maxScore = 100
    
    // Basic configuration (20 points)
    if (this.customizerOptions && this.customizerOptions.length > 0) score += 20
    
    // Assets availability (40 points)
    const materialOptions = this.customizerOptions?.find((opt: any) => opt.type === 'material')
    if (materialOptions) {
      const totalMaterials = materialOptions.options.length
      const materialsWithAssets = materialOptions.options.filter((opt: any) => 
        opt.renderingAssets?.imageSequencePath || opt.renderingAssets?.model3DPath
      ).length
      
      score += (materialsWithAssets / totalMaterials) * 40
    }
    
    // Performance configuration (20 points)
    if (this.customizerPerformance) score += 20
    
    // Quality assurance (20 points)
    if (this.customizerMetadata?.qaStatus === 'approved') score += 20
    else if (this.customizerMetadata?.qaStatus === 'needs-review') score += 10
    
    return Math.round((score / maxScore) * 100)
  }
}

export {
  CustomizerRenderingAssetsSchema,
  CustomizerMaterialPropertiesSchema,
  CustomizerOptionSchema,
  VariantGenerationConfigSchema,
  CustomizerPerformanceConfigSchema
}