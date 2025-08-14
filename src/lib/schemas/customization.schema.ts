/**
 * 3D Customization and Configuration Mongoose Schemas
 * Handles 3D product customization, saved configurations, and design sessions
 * Supports real-time price calculation and 3D model generation
 */

import mongoose, { Schema, Document } from 'mongoose'

// Customization status types
export type CustomizationStatus = 
  | 'draft'         // Work in progress
  | 'saved'         // Saved by user
  | 'shared'        // Shared with others
  | 'ordered'       // Converted to order
  | 'archived'      // Archived/deleted

// 3D Configuration interface
export interface CustomizationConfiguration {
  // Base product configuration
  productId: string
  productName: string
  basePrice: number
  
  // Material selection
  material: {
    id: string
    name: string
    type: string
    priceMultiplier: number
    texture?: string
    properties?: {
      color: string
      metallic: number
      roughness: number
      reflectivity: number
    }
  }
  
  // Gemstone configuration
  gemstone?: {
    id: string
    type: string
    carat: number
    color: string
    clarity: string
    cut: string
    priceMultiplier: number
    position?: {
      x: number
      y: number
      z: number
    }
    scale?: number
  }
  
  // Size configuration
  size: {
    id: string
    value: string
    measurement: {
      unit: string
      value: number
    }
    priceAdjustment: number
  }
  
  // Engraving configuration
  engraving?: {
    text: string
    font: string
    position: 'inside' | 'outside' | 'back'
    depth: number
    size: number
    pricePerCharacter: number
  }
  
  // Additional customizations
  personalizations?: {
    birthstones?: {
      stones: {
        id: string
        month: string
        color: string
        position: { x: number; y: number; z: number }
      }[]
    }
    initials?: {
      text: string
      font: string
      positions: { x: number; y: number; z: number }[]
    }
    customDates?: {
      date: string
      format: string
      position: { x: number; y: number; z: number }
    }[]
  }
  
  // 3D Model configuration
  model3D: {
    meshes: {
      id: string
      visible: boolean
      material: string
      color?: string
      opacity?: number
    }[]
    lighting: {
      ambient: { color: string; intensity: number }
      directional: { 
        color: string
        intensity: number
        position: { x: number; y: number; z: number }
      }[]
    }
    camera: {
      position: { x: number; y: number; z: number }
      target: { x: number; y: number; z: number }
      zoom: number
    }
    environment?: string
  }
  
  // Calculated pricing
  pricing: {
    basePrice: number
    materialCost: number
    gemstoneCost: number
    sizeCost: number
    engravingCost: number
    personalizationCost: number
    totalPrice: number
    currency: string
  }
}

// Customization session interface
export interface CustomizationDocument extends Document {
  userId?: string // Optional for guest sessions
  sessionId?: string // For guest users
  
  // Product and configuration
  productId: string
  configuration: CustomizationConfiguration
  
  // Session metadata
  name?: string
  description?: string
  status: CustomizationStatus
  version: number // For version control
  
  // 3D Assets
  assets: {
    modelSnapshot?: string // Base64 or URL to rendered image
    glbFile?: string // Generated GLB file URL
    thumbnails: string[] // Multiple angle thumbnails
    animations?: string[] // Animation file URLs
  }
  
  // Sharing and collaboration
  isPublic: boolean
  shareUrl?: string
  sharedWith: {
    userId?: string
    email?: string
    permission: 'view' | 'edit'
    sharedAt: Date
  }[]
  
  // Design history and versions
  history: {
    version: number
    configuration: CustomizationConfiguration
    changedBy: string
    changedAt: Date
    changeDescription?: string
  }[]
  
  // User interaction tracking
  analytics: {
    totalTime: number // Total time spent customizing
    interactions: number // Number of customization changes
    priceChecks: number // How many times price was calculated
    saves: number // Number of times saved
    shares: number // Number of times shared
    lastInteraction: Date
  }
  
  // Performance optimization
  renderSettings: {
    quality: 'low' | 'medium' | 'high'
    enableShadows: boolean
    enableReflections: boolean
    antiAliasing: boolean
    renderSize: { width: number; height: number }
  }
  
  // Conversion tracking
  conversion: {
    addedToCart: boolean
    addedToCartAt?: Date
    ordered: boolean
    orderedAt?: Date
    orderId?: string
  }
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastAccessedAt: Date
  expiresAt?: Date // For guest sessions
  
  // Methods
  updateConfiguration(config: Partial<CustomizationConfiguration>): Promise<void>
  calculatePrice(): number
  saveVersion(description?: string): Promise<void>
  generateShareUrl(): string
  generateThumbnails(): Promise<string[]>
  addToCart(): Promise<boolean>
  createOrder(): Promise<string>
}

// 3D Model Asset interface
export interface ModelAssetDocument extends Document {
  productId: string
  assetType: 'base' | 'material' | 'gemstone' | 'variant'
  
  // File information
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  
  // Asset metadata
  name: string
  description?: string
  tags: string[]
  
  // 3D specific properties
  geometry: {
    vertices: number
    faces: number
    materials: string[]
    boundingBox: {
      min: { x: number; y: number; z: number }
      max: { x: number; y: number; z: number }
    }
  }
  
  // Material properties (if material asset)
  materialProperties?: {
    type: 'metal' | 'gemstone' | 'fabric' | 'leather'
    pbr: {
      albedo?: string
      normal?: string
      roughness?: string
      metallic?: string
      ao?: string
    }
    properties: {
      color: string
      metallic: number
      roughness: number
      reflectivity: number
      transparency?: number
    }
  }
  
  // Quality levels
  qualityLevels: {
    low: {
      url: string
      vertices: number
      fileSize: number
    }
    medium: {
      url: string
      vertices: number
      fileSize: number
    }
    high: {
      url: string
      vertices: number
      fileSize: number
    }
  }
  
  // Performance metadata
  loadTime: number // Average load time in ms
  renderPerformance: {
    fps: number
    drawCalls: number
    memoryUsage: number
  }
  
  // Usage analytics
  downloads: number
  usageCount: number
  lastUsed: Date
  
  // Versioning
  version: string
  previousVersions: {
    version: string
    url: string
    changelog: string
    createdAt: Date
  }[]
  
  // Status
  status: 'processing' | 'ready' | 'error' | 'deprecated'
  processedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

// Customization configuration subdocument schema
const customizationConfigSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  material: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    priceMultiplier: { type: Number, required: true },
    texture: String,
    properties: {
      color: String,
      metallic: Number,
      roughness: Number,
      reflectivity: Number
    }
  },
  
  gemstone: {
    id: String,
    type: String,
    carat: Number,
    color: String,
    clarity: String,
    cut: String,
    priceMultiplier: Number,
    position: {
      x: Number,
      y: Number,
      z: Number
    },
    scale: Number
  },
  
  size: {
    id: { type: String, required: true },
    value: { type: String, required: true },
    measurement: {
      unit: String,
      value: Number
    },
    priceAdjustment: Number
  },
  
  engraving: {
    text: String,
    font: String,
    position: {
      type: String,
      enum: ['inside', 'outside', 'back']
    },
    depth: Number,
    size: Number,
    pricePerCharacter: Number
  },
  
  personalizations: {
    birthstones: {
      stones: [{
        id: String,
        month: String,
        color: String,
        position: {
          x: Number,
          y: Number,
          z: Number
        }
      }]
    },
    initials: {
      text: String,
      font: String,
      positions: [{
        x: Number,
        y: Number,
        z: Number
      }]
    },
    customDates: [{
      date: String,
      format: String,
      position: {
        x: Number,
        y: Number,
        z: Number
      }
    }]
  },
  
  model3D: {
    meshes: [{
      id: String,
      visible: Boolean,
      material: String,
      color: String,
      opacity: Number
    }],
    lighting: {
      ambient: {
        color: String,
        intensity: Number
      },
      directional: [{
        color: String,
        intensity: Number,
        position: {
          x: Number,
          y: Number,
          z: Number
        }
      }]
    },
    camera: {
      position: {
        x: Number,
        y: Number,
        z: Number
      },
      target: {
        x: Number,
        y: Number,
        z: Number
      },
      zoom: Number
    },
    environment: String
  },
  
  pricing: {
    basePrice: { type: Number, required: true },
    materialCost: { type: Number, default: 0 },
    gemstoneCost: { type: Number, default: 0 },
    sizeCost: { type: Number, default: 0 },
    engravingCost: { type: Number, default: 0 },
    personalizationCost: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  }
}, { _id: false })

// Main Customization schema
const customizationSchema = new Schema<CustomizationDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  sessionId: {
    type: String,
    sparse: true
  },
  
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  configuration: {
    type: customizationConfigSchema,
    required: true
  },
  
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['draft', 'saved', 'shared', 'ordered', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  
  assets: {
    modelSnapshot: String,
    glbFile: String,
    thumbnails: [String],
    animations: [String]
  },
  
  isPublic: {
    type: Boolean,
    default: false
  },
  shareUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  sharedWith: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  history: [{
    version: { type: Number, required: true },
    configuration: customizationConfigSchema,
    changedBy: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changeDescription: String
  }],
  
  analytics: {
    totalTime: { type: Number, default: 0 },
    interactions: { type: Number, default: 0 },
    priceChecks: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    lastInteraction: { type: Date, default: Date.now }
  },
  
  renderSettings: {
    quality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    enableShadows: { type: Boolean, default: true },
    enableReflections: { type: Boolean, default: true },
    antiAliasing: { type: Boolean, default: true },
    renderSize: {
      width: { type: Number, default: 800 },
      height: { type: Number, default: 600 }
    }
  },
  
  conversion: {
    addedToCart: { type: Boolean, default: false },
    addedToCartAt: Date,
    ordered: { type: Boolean, default: false },
    orderedAt: Date,
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    }
  },
  
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Model Asset schema
const modelAssetSchema = new Schema<ModelAssetDocument>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  assetType: {
    type: String,
    enum: ['base', 'material', 'gemstone', 'variant'],
    required: true
  },
  
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  tags: [String],
  
  geometry: {
    vertices: { type: Number, required: true },
    faces: { type: Number, required: true },
    materials: [String],
    boundingBox: {
      min: {
        x: Number,
        y: Number,
        z: Number
      },
      max: {
        x: Number,
        y: Number,
        z: Number
      }
    }
  },
  
  materialProperties: {
    type: {
      type: String,
      enum: ['metal', 'gemstone', 'fabric', 'leather']
    },
    pbr: {
      albedo: String,
      normal: String,
      roughness: String,
      metallic: String,
      ao: String
    },
    properties: {
      color: String,
      metallic: Number,
      roughness: Number,
      reflectivity: Number,
      transparency: Number
    }
  },
  
  qualityLevels: {
    low: {
      url: String,
      vertices: Number,
      fileSize: Number
    },
    medium: {
      url: String,
      vertices: Number,
      fileSize: Number
    },
    high: {
      url: String,
      vertices: Number,
      fileSize: Number
    }
  },
  
  loadTime: {
    type: Number,
    default: 0
  },
  renderPerformance: {
    fps: { type: Number, default: 60 },
    drawCalls: { type: Number, default: 1 },
    memoryUsage: { type: Number, default: 0 }
  },
  
  downloads: {
    type: Number,
    default: 0
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: Date,
  
  version: {
    type: String,
    required: true
  },
  previousVersions: [{
    version: String,
    url: String,
    changelog: String,
    createdAt: Date
  }],
  
  status: {
    type: String,
    enum: ['processing', 'ready', 'error', 'deprecated'],
    default: 'processing'
  },
  processedAt: Date
}, {
  timestamps: true
})

// Indexes for Customization schema
customizationSchema.index({ userId: 1, createdAt: -1 }, { sparse: true })
customizationSchema.index({ sessionId: 1 }, { sparse: true })
customizationSchema.index({ productId: 1, status: 1 })
customizationSchema.index({ shareUrl: 1 }, { unique: true, sparse: true })
customizationSchema.index({ status: 1, lastAccessedAt: -1 })
customizationSchema.index({ isPublic: 1, createdAt: -1 })
customizationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Compound indexes
customizationSchema.index({ userId: 1, productId: 1, status: 1 })
customizationSchema.index({ productId: 1, isPublic: 1, createdAt: -1 })

// Indexes for ModelAsset schema
modelAssetSchema.index({ productId: 1, assetType: 1 })
modelAssetSchema.index({ status: 1, createdAt: -1 })
modelAssetSchema.index({ tags: 1 })
modelAssetSchema.index({ usageCount: -1 })

// Pre-save middleware for customization
customizationSchema.pre('save', function(next) {
  this.lastAccessedAt = new Date()
  
  // Set expiration for guest sessions (30 days)
  if (!this.userId && this.sessionId && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
  
  // Generate share URL if public
  if (this.isPublic && !this.shareUrl) {
    this.shareUrl = this.generateShareUrl()
  }
  
  next()
})

// Instance methods for Customization
customizationSchema.methods.updateConfiguration = async function(
  config: Partial<CustomizationConfiguration>
): Promise<void> {
  // Save current version to history
  this.history.push({
    version: this.version,
    configuration: this.configuration,
    changedBy: this.userId || this.sessionId || 'anonymous',
    changedAt: new Date()
  })
  
  // Update configuration
  this.configuration = { ...this.configuration, ...config }
  this.version += 1
  this.analytics.interactions += 1
  
  // Recalculate price
  this.configuration.pricing.totalPrice = this.calculatePrice()
  this.analytics.priceChecks += 1
  
  await this.save()
}

customizationSchema.methods.calculatePrice = function(): number {
  const config = this.configuration
  let total = config.basePrice
  
  // Material cost
  if (config.material) {
    config.pricing.materialCost = config.basePrice * (config.material.priceMultiplier - 1)
    total *= config.material.priceMultiplier
  }
  
  // Gemstone cost
  if (config.gemstone) {
    config.pricing.gemstoneCost = config.basePrice * (config.gemstone.priceMultiplier - 1)
    total *= config.gemstone.priceMultiplier
  }
  
  // Size adjustment
  if (config.size) {
    config.pricing.sizeCost = config.size.priceAdjustment
    total += config.size.priceAdjustment
  }
  
  // Engraving cost
  if (config.engraving) {
    config.pricing.engravingCost = config.engraving.text.length * config.engraving.pricePerCharacter
    total += config.pricing.engravingCost
  }
  
  // Personalization cost
  config.pricing.personalizationCost = 0
  if (config.personalizations?.birthstones) {
    config.pricing.personalizationCost += config.personalizations.birthstones.stones.length * 50
  }
  if (config.personalizations?.initials) {
    config.pricing.personalizationCost += 25
  }
  if (config.personalizations?.customDates) {
    config.pricing.personalizationCost += config.personalizations.customDates.length * 20
  }
  
  total += config.pricing.personalizationCost
  
  return Math.round(total * 100) / 100
}

customizationSchema.methods.saveVersion = async function(description?: string): Promise<void> {
  this.status = 'saved'
  this.analytics.saves += 1
  
  if (description) {
    const lastHistory = this.history[this.history.length - 1]
    if (lastHistory) {
      lastHistory.changeDescription = description
    }
  }
  
  await this.save()
}

customizationSchema.methods.generateShareUrl = function(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `custom_${timestamp}_${random}`
}

customizationSchema.methods.generateThumbnails = async function(): Promise<string[]> {
  // In production, this would integrate with 3D rendering service
  // For now, return placeholder URLs
  const angles = ['front', 'side', 'back', 'top']
  const thumbnails = angles.map(angle => 
    `/api/render/thumbnail/${this._id}?angle=${angle}`
  )
  
  this.assets.thumbnails = thumbnails
  await this.save()
  
  return thumbnails
}

customizationSchema.methods.addToCart = async function(): Promise<boolean> {
  try {
    const CartModel = mongoose.model('Cart')
    let cart
    
    if (this.userId) {
      cart = await CartModel.findByUser(this.userId.toString())
    } else if (this.sessionId) {
      cart = await CartModel.findBySession(this.sessionId)
    }
    
    if (!cart) {
      cart = new CartModel({
        userId: this.userId,
        sessionId: this.sessionId,
        items: []
      })
    }
    
    await cart.addItem(
      this.productId.toString(),
      1,
      {
        material: this.configuration.material.id,
        gemstone: this.configuration.gemstone?.id,
        size: this.configuration.size.id,
        engraving: this.configuration.engraving,
        personalizations: this.configuration.personalizations
      }
    )
    
    this.conversion.addedToCart = true
    this.conversion.addedToCartAt = new Date()
    await this.save()
    
    return true
  } catch (error) {
    console.error('Error adding customization to cart:', error)
    return false
  }
}

// Static methods
customizationSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId, status: { $ne: 'archived' } })
    .sort({ lastAccessedAt: -1 })
}

customizationSchema.statics.findByProduct = function(productId: string) {
  return this.find({ 
    productId, 
    isPublic: true, 
    status: { $in: ['saved', 'shared'] }
  })
  .sort({ createdAt: -1 })
  .populate('userId', 'firstName lastName profileImage')
}

// Export models
export const CustomizationModel = mongoose.models.Customization || mongoose.model<CustomizationDocument>('Customization', customizationSchema)
export const ModelAssetModel = mongoose.models.ModelAsset || mongoose.model<ModelAssetDocument>('ModelAsset', modelAssetSchema)