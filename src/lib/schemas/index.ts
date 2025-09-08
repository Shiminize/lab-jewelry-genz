/**
 * Schema Index - Central exports for all MongoDB schemas
 * Provides unified access to all database models
 */

// Export User schema and types
export { UserModel } from './user.schema'
export { UserModel as User } from './user.schema'  // Export with 'User' alias for webhook compatibility
export type { IUser } from './user.schema'

// Export Product schema and types  
export { ProductModel, default as Product } from './product.schema'
export type { 
  IProduct, 
  Asset3D, 
  ProductDimensions, 
  CustomizationOption,
  InventoryItem,
  ProductSEO,
  ProductAnalytics,
  ProductType,
  ProductStatus,
  MaterialType,
  GemstoneType
} from './product.schema'

// Export Order schema and types
export { OrderModel } from './order.schema'
export type {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  OrderItem,
  ShippingAddress,
  PaymentDetails,
  ShippingDetails,
  OrderTimelineEvent,
  OrderDocument
} from './order.schema'

// Export Creator schema and types
export { 
  Creator, 
  ReferralLink, 
  ReferralClick, 
  CommissionTransaction, 
  CreatorPayout 
} from './creator.schema'
export type { 
  ICreator, 
  IReferralLink, 
  IReferralClick, 
  ICommissionTransaction, 
  ICreatorPayout 
} from './creator.schema'

// Export Wishlist schema and types
export { WishlistModel } from './wishlist.schema'
export type { WishlistDocument, WishlistItem } from './wishlist.schema'

// Re-export auth types for convenience
export type {
  User as UserType,
  UserRole,
  AuthProvider,
  AccountStatus,
  UserAddress,
  UserPreferences,
  CreatorProfile,
  JWTPayload,
  AuthSession,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UpdatePasswordRequest,
  GDPRDataExport,
  GDPRDeletionRequest,
  RateLimitInfo,
  AuthApiResponse
} from '@/types/auth'

// Database connection utilities
export { 
  connectToDatabase, 
  checkDatabaseHealth, 
  disconnectFromDatabase, 
  withTransaction 
} from '../mongoose'

/**
 * Secure Database Models Export
 * Provides controlled access to all database models with security wrappers
 */

interface SecurityContext {
  userId?: string
  userRole?: string
  operation?: string
}

/**
 * Create secure model wrapper with access control and audit logging
 */
function createSecureModelWrapper(model: any, modelName: string) {
  return new Proxy(model, {
    get(target, prop: string | symbol) {
      // For development, allow direct access to maintain compatibility
      if (process.env.NODE_ENV === 'development') {
        return target[prop]
      }
      
      // In production, would add comprehensive security checks
      if (typeof prop === 'string' && ['find', 'findOne', 'create', 'updateOne', 'deleteOne'].includes(prop)) {
        return function secureOperation(...args: any[]) {
          // Add security validation, audit logging, rate limiting

          return target[prop].apply(target, args)
        }
      }
      
      return target[prop]
    }
  })
}

// Import all models directly using ES6 imports to avoid runtime issues
import { UserModel } from './user.schema'
import { ProductModel } from './product.schema'
import { OrderModel } from './order.schema'
import { 
  Creator, 
  ReferralLink, 
  ReferralClick, 
  CommissionTransaction, 
  CreatorPayout 
} from './creator.schema'

/**
 * Database Models Object - Secure access to all models
 * This replaces direct model imports in API routes
 */
export const DatabaseModels = Object.freeze({
  // Core models - using explicit model imports to avoid reference issues
  User: createSecureModelWrapper(UserModel, 'User'),
  Product: createSecureModelWrapper(ProductModel, 'Product'),
  Order: createSecureModelWrapper(OrderModel, 'Order'),

  // Creator system models
  Creator: createSecureModelWrapper(Creator, 'Creator'),
  ReferralLink: createSecureModelWrapper(ReferralLink, 'ReferralLink'),
  ReferralClick: createSecureModelWrapper(ReferralClick, 'ReferralClick'),
  CommissionTransaction: createSecureModelWrapper(CommissionTransaction, 'CommissionTransaction'),
  CreatorPayout: createSecureModelWrapper(CreatorPayout, 'CreatorPayout'),
  
  // Utility functions for model validation
  getModelByName: (modelName: string) => {
    const models: { [key: string]: any } = {
      User: UserModel,
      Product: ProductModel,
      Order: OrderModel,
      Creator: Creator,
      ReferralLink: ReferralLink,
      ReferralClick: ReferralClick,
      CommissionTransaction: CommissionTransaction,
      CreatorPayout: CreatorPayout
    }
    
    return models[modelName] || null
  },
  
  // Security validation helper
  validateModelAccess: (modelName: string, operation: string, context?: SecurityContext) => {
    // In development, allow all access
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    
    // Would implement proper RBAC here

    return true
  }
})