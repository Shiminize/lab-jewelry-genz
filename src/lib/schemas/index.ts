/**
 * Schema Index - Central exports for all MongoDB schemas
 * Provides unified access to all database models
 */

// Export User schema and types
export { UserModel, default as User } from './user.schema'
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