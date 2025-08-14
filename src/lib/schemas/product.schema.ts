/**
 * Product Schema - MongoDB Model for Jewelry Product Catalog
 * Comprehensive product management with 3D assets, customization, and inventory
 * Supports luxury jewelry features and creator program integration
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

// Product types and interfaces
export type ProductType = 'ring' | 'necklace' | 'earrings' | 'bracelet' | 'pendant' | 'charm' | 'chain'
export type ProductStatus = 'active' | 'inactive' | 'out-of-stock' | 'discontinued' | 'coming-soon'
export type MaterialType = 'gold' | 'silver' | 'platinum' | 'titanium' | 'steel' | 'brass' | 'copper'
export type GemstoneType = 'diamond' | 'ruby' | 'sapphire' | 'emerald' | 'pearl' | 'topaz' | 'amethyst' | 'opal'

// 3D Asset interface
export interface Asset3D {
  modelUrl: string
  textureUrls: string[]
  thumbnailUrl: string
  fileSize: number
  format: 'glb' | 'gltf' | 'fbx' | 'obj'
  complexity: 'low' | 'medium' | 'high'
  isOptimized: boolean
  createdAt: Date
  updatedAt: Date
}

// Product dimension interface
export interface ProductDimensions {
  length: number
  width: number
  height: number
  weight: number
  unit: 'mm' | 'cm' | 'in'
  weightUnit: 'g' | 'oz'
}

// Customization option interface
export interface CustomizationOption {
  name: string
  type: 'color' | 'material' | 'size' | 'engraving' | 'gemstone'
  options: {
    value: string
    label: string
    priceModifier: number
    isDefault: boolean
    isAvailable: boolean
    hexColor?: string
    materialType?: MaterialType
    gemstoneType?: GemstoneType
  }[]
  required: boolean
  maxSelections: number
  description?: string
}

// Inventory tracking interface
export interface InventoryItem {
  sku: string
  variant: Record<string, string>
  quantity: number
  reserved: number
  price: number
  compareAtPrice?: number
  cost: number
  isTracked: boolean
  lowStockThreshold: number
  reorderPoint: number
  reorderQuantity: number
  supplier?: string
  supplierSku?: string
  lastRestocked?: Date
}

// SEO and metadata interface
export interface ProductSEO {
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  slug: string
  canonicalUrl?: string
  openGraphImage?: string
  structuredData?: Record<string, any>
}

// Product analytics interface
export interface ProductAnalytics {
  views: number
  uniqueViews: number
  addToCarts: number
  purchases: number
  conversionRate: number
  averageRating: number
  totalReviews: number
  wishlistAdds: number
  lastViewed?: Date
  trending: boolean
  trendingScore: number
}

// Main Product interface
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  
  // Basic Information
  name: string
  description: string
  shortDescription?: string
  type: ProductType
  status: ProductStatus
  
  // Categorization
  categories: mongoose.Types.ObjectId[]
  collections: mongoose.Types.ObjectId[]
  tags: string[]
  
  // Pricing
  basePrice: number
  compareAtPrice?: number
  cost: number
  currency: string
  taxable: boolean
  
  // Physical Properties
  dimensions: ProductDimensions
  materials: MaterialType[]
  gemstones: {
    type: GemstoneType
    carat?: number
    cut?: string
    clarity?: string
    color?: string
    certification?: string
  }[]
  
  // 3D Assets and Media
  assets3D: Asset3D[]
  images: {
    url: string
    alt: string
    isPrimary: boolean
    order: number
    isOptimized: boolean
  }[]
  videos?: {
    url: string
    type: 'product' | 'tutorial' | 'review'
    thumbnail: string
    duration: number
  }[]
  
  // Customization
  isCustomizable: boolean
  customizationOptions: CustomizationOption[]
  baseConfiguration: Record<string, string>
  minPrice: number
  maxPrice: number
  
  // Inventory Management
  inventory: InventoryItem[]
  trackInventory: boolean
  allowBackorders: boolean
  requiresShipping: boolean
  
  // Creator Program
  isCreatorExclusive: boolean
  creatorOnlyTiers: string[]
  commissionRate?: number
  creatorBenefits: string[]
  
  // SEO and Metadata
  seo: ProductSEO
  
  // Analytics
  analytics: ProductAnalytics
  
  // Relationships
  relatedProducts: mongoose.Types.ObjectId[]
  bundleProducts: {
    productId: mongoose.Types.ObjectId
    quantity: number
    discount: number
  }[]
  
  // Compliance and Quality
  certifications: {
    type: string
    issuer: string
    certificateNumber: string
    expiresAt?: Date
    documentUrl?: string
  }[]
  qualityGrade: 'standard' | 'premium' | 'luxury' | 'ultra-luxury'
  careInstructions: string[]
  
  // Availability
  availableFrom?: Date
  availableUntil?: Date
  isLimitedEdition: boolean
  limitedQuantity?: number
  
  // User-generated content
  featuredReviews: mongoose.Types.ObjectId[]
  userPhotos: {
    url: string
    userId: mongoose.Types.ObjectId
    approved: boolean
    featured: boolean
  }[]
}

// 3D Asset subdocument schema
const Asset3DSchema = new Schema<Asset3D>({
  modelUrl: { type: String, required: true },
  textureUrls: [{ type: String }],
  thumbnailUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  format: { type: String, enum: ['glb', 'gltf', 'fbx', 'obj'], required: true },
  complexity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  isOptimized: { type: Boolean, default: false }
}, { timestamps: true })

// Customization option subdocument schema
const CustomizationOptionSchema = new Schema<CustomizationOption>({
  name: { type: String, required: true },
  type: { type: String, enum: ['color', 'material', 'size', 'engraving', 'gemstone'], required: true },
  options: [{
    value: { type: String, required: true },
    label: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    hexColor: String,
    materialType: { type: String, enum: ['gold', 'silver', 'platinum', 'titanium', 'steel', 'brass', 'copper'] },
    gemstoneType: { type: String, enum: ['diamond', 'ruby', 'sapphire', 'emerald', 'pearl', 'topaz', 'amethyst', 'opal'] }
  }],
  required: { type: Boolean, default: false },
  maxSelections: { type: Number, default: 1 },
  description: String
})

// Inventory item subdocument schema
const InventoryItemSchema = new Schema<InventoryItem>({
  sku: { type: String, required: true, unique: true },
  variant: { type: Map, of: String },
  quantity: { type: Number, required: true, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  isTracked: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 5 },
  reorderPoint: { type: Number, default: 10 },
  reorderQuantity: { type: Number, default: 50 },
  supplier: String,
  supplierSku: String,
  lastRestocked: Date
})

// Main Product schema
const ProductSchema = new Schema<IProduct>({
  // Basic Information
  name: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  shortDescription: { type: String, maxlength: 500 },
  type: { 
    type: String, 
    enum: ['ring', 'necklace', 'earrings', 'bracelet', 'pendant', 'charm', 'chain'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'out-of-stock', 'discontinued', 'coming-soon'], 
    default: 'active' 
  },
  
  // Categorization
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  collections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
  tags: [{ type: String, maxlength: 50 }],
  
  // Pricing
  basePrice: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD', maxlength: 3 },
  taxable: { type: Boolean, default: true },
  
  // Physical Properties
  dimensions: {
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['mm', 'cm', 'in'], default: 'mm' },
    weightUnit: { type: String, enum: ['g', 'oz'], default: 'g' }
  },
  materials: [{ type: String, enum: ['gold', 'silver', 'platinum', 'titanium', 'steel', 'brass', 'copper'] }],
  gemstones: [{
    type: { type: String, enum: ['diamond', 'ruby', 'sapphire', 'emerald', 'pearl', 'topaz', 'amethyst', 'opal'], required: true },
    carat: Number,
    cut: String,
    clarity: String,
    color: String,
    certification: String
  }],
  
  // 3D Assets and Media
  assets3D: [Asset3DSchema],
  images: [{
    url: { type: String, required: true },
    alt: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isOptimized: { type: Boolean, default: false }
  }],
  videos: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['product', 'tutorial', 'review'], required: true },
    thumbnail: { type: String, required: true },
    duration: { type: Number, required: true }
  }],
  
  // Customization
  isCustomizable: { type: Boolean, default: false },
  customizationOptions: [CustomizationOptionSchema],
  baseConfiguration: { type: Map, of: String },
  minPrice: { type: Number, min: 0 },
  maxPrice: { type: Number, min: 0 },
  
  // Inventory Management
  inventory: [InventoryItemSchema],
  trackInventory: { type: Boolean, default: true },
  allowBackorders: { type: Boolean, default: false },
  requiresShipping: { type: Boolean, default: true },
  
  // Creator Program
  isCreatorExclusive: { type: Boolean, default: false },
  creatorOnlyTiers: [{ type: String, enum: ['bronze', 'silver', 'gold', 'platinum'] }],
  commissionRate: { type: Number, min: 0, max: 100 },
  creatorBenefits: [String],
  
  // SEO and Metadata
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: { type: String, required: true, unique: true },
    canonicalUrl: String,
    openGraphImage: String,
    structuredData: { type: Map, of: Schema.Types.Mixed }
  },
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    addToCarts: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    wishlistAdds: { type: Number, default: 0 },
    lastViewed: Date,
    trending: { type: Boolean, default: false },
    trendingScore: { type: Number, default: 0 }
  },
  
  // Relationships
  relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  bundleProducts: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    discount: { type: Number, default: 0, min: 0, max: 100 }
  }],
  
  // Compliance and Quality
  certifications: [{
    type: { type: String, required: true },
    issuer: { type: String, required: true },
    certificateNumber: { type: String, required: true },
    expiresAt: Date,
    documentUrl: String
  }],
  qualityGrade: { type: String, enum: ['standard', 'premium', 'luxury', 'ultra-luxury'], default: 'standard' },
  careInstructions: [String],
  
  // Availability
  availableFrom: Date,
  availableUntil: Date,
  isLimitedEdition: { type: Boolean, default: false },
  limitedQuantity: Number,
  
  // User-generated content
  featuredReviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  userPhotos: [{
    url: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approved: { type: Boolean, default: false },
    featured: { type: Boolean, default: false }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance optimization
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' })
ProductSchema.index({ 'seo.slug': 1 }, { unique: true })
ProductSchema.index({ type: 1, status: 1 })
ProductSchema.index({ basePrice: 1 })
ProductSchema.index({ 'analytics.trending': -1, 'analytics.trendingScore': -1 })
ProductSchema.index({ categories: 1 })
ProductSchema.index({ collections: 1 })
ProductSchema.index({ materials: 1 })
ProductSchema.index({ 'gemstones.type': 1 })
ProductSchema.index({ isCreatorExclusive: 1, creatorOnlyTiers: 1 })
ProductSchema.index({ availableFrom: 1, availableUntil: 1 })
ProductSchema.index({ createdAt: -1 })
ProductSchema.index({ 'analytics.averageRating': -1 })

// Virtual fields
ProductSchema.virtual('isAvailable').get(function() {
  const now = new Date()
  const availableFrom = this.availableFrom || new Date(0)
  const availableUntil = this.availableUntil || new Date('2099-12-31')
  
  return this.status === 'active' && 
         now >= availableFrom && 
         now <= availableUntil &&
         (!this.isLimitedEdition || (this.limitedQuantity && this.limitedQuantity > 0))
})

ProductSchema.virtual('totalInventory').get(function() {
  return this.inventory.reduce((total, item) => total + item.quantity, 0)
})

ProductSchema.virtual('averageRating').get(function() {
  return this.analytics.averageRating || 0
})

ProductSchema.virtual('primaryImage').get(function() {
  return this.images.find(img => img.isPrimary) || this.images[0]
})

ProductSchema.virtual('primary3DAsset').get(function() {
  return this.assets3D.find(asset => asset.complexity === 'high') || this.assets3D[0]
})

// Pre-save middleware
ProductSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.seo.slug) {
    this.seo.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  
  // Calculate price range for customizable products
  if (this.isCustomizable && this.customizationOptions.length > 0) {
    let minPrice = this.basePrice
    let maxPrice = this.basePrice
    
    this.customizationOptions.forEach(option => {
      option.options.forEach(opt => {
        if (opt.priceModifier > 0) {
          maxPrice += opt.priceModifier
        } else if (opt.priceModifier < 0) {
          minPrice += opt.priceModifier
        }
      })
    })
    
    this.minPrice = Math.max(0, minPrice)
    this.maxPrice = maxPrice
  }
  
  // Ensure only one primary image
  const primaryImages = this.images.filter(img => img.isPrimary)
  if (primaryImages.length > 1) {
    this.images.forEach((img, index) => {
      img.isPrimary = index === 0
    })
  } else if (primaryImages.length === 0 && this.images.length > 0) {
    this.images[0].isPrimary = true
  }
  
  next()
})

// Static methods
ProductSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ 'seo.slug': slug, status: 'active' })
}

ProductSchema.statics.findFeatured = function(limit: number = 8) {
  return this.find({ 
    status: 'active',
    'analytics.trending': true 
  })
  .sort({ 'analytics.trendingScore': -1 })
  .limit(limit)
  .populate('categories collections')
}

ProductSchema.statics.findByCategory = function(categoryId: string, limit?: number) {
  const query = this.find({ 
    categories: categoryId,
    status: 'active'
  }).populate('categories collections')
  
  if (limit) {
    query.limit(limit)
  }
  
  return query
}

ProductSchema.statics.searchProducts = function(searchTerm: string, filters?: any) {
  const query: any = {
    $text: { $search: searchTerm },
    status: 'active'
  }
  
  if (filters) {
    if (filters.priceMin || filters.priceMax) {
      query.basePrice = {}
      if (filters.priceMin) query.basePrice.$gte = filters.priceMin
      if (filters.priceMax) query.basePrice.$lte = filters.priceMax
    }
    
    if (filters.materials && filters.materials.length > 0) {
      query.materials = { $in: filters.materials }
    }
    
    if (filters.type) {
      query.type = filters.type
    }
  }
  
  return this.find(query)
    .populate('categories collections')
    .sort({ score: { $meta: 'textScore' } })
}

// Export the model
export const ProductModel: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
export default ProductModel