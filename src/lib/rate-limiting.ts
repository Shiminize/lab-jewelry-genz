/**
 * Rate Limiting Service - Legacy Compatibility
 * Re-exports redis rate limiter for backward compatibility
 */

export {
  rateLimiter,
  RateLimitError,
  createRateLimiter,
  type RateLimitConfig,
  type RateLimitResult
} from './redis-rate-limiter'

export { default } from './redis-rate-limiter'