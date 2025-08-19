/**
 * Application Constants
 * Centralized configuration values and enums for better organization
 */

/**
 * Database collections enum for type safety
 * Moved from database.ts for better separation of concerns
 */
export const Collections = {
  PRODUCTS: 'products',
  USERS: 'users',
  ORDERS: 'orders',
  CREATORS: 'creators',
  REVIEWS: 'reviews',
  MATERIALS: 'materials',
  GEMSTONES: 'gemstones',
  SIZES: 'sizes'
} as const

export type CollectionName = typeof Collections[keyof typeof Collections]

/**
 * API Configuration Constants
 */
export const API_CONSTANTS = {
  DEFAULT_TIMEOUT: 5000,
  MAX_RETRY_ATTEMPTS: 3,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100
} as const

/**
 * Performance Configuration
 */
export const PERFORMANCE_CONSTANTS = {
  CLAUDE_RULES_TARGET_MS: 300, // Target response time
  QUERY_TIMEOUT_MS: 250,
  IMAGE_PRELOAD_COUNT: 3,
  PAGINATION_DEFAULT_LIMIT: 20
} as const

/**
 * Security Configuration
 */
export const SECURITY_CONSTANTS = {
  JWT_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCK_TIME: 30 * 60 * 1000 // 30 minutes
} as const