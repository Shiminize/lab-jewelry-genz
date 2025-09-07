/**
 * Security Utilities - Input Sanitization and Validation
 * CLAUDE_RULES compliant security layer for user inputs
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Simple approach without external dependencies for CLAUDE_RULES compliance
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Sanitize display name for material tags
 * Specific validation for jewelry material names
 */
export function sanitizeMaterialName(name: string): string {
  if (typeof name !== 'string') {
    return ''
  }
  
  // Allow only alphanumeric characters, spaces, hyphens, and parentheses
  const cleaned = name
    .replace(/[^a-zA-Z0-9\s\-()]/g, '')
    .trim()
    .substring(0, 50) // Limit length
  
  return cleaned
}

/**
 * Validate price values to prevent manipulation
 */
export function validatePrice(price: any): number {
  const numPrice = Number(price)
  
  if (isNaN(numPrice) || !isFinite(numPrice) || numPrice < 0) {
    return 0
  }
  
  // Reasonable price limits for jewelry (in USD)
  const MIN_PRICE = 0
  const MAX_PRICE = 100000
  
  return Math.min(Math.max(numPrice, MIN_PRICE), MAX_PRICE)
}

/**
 * Validate material ID against allowed values
 */
export function validateMaterialId(materialId: any): string | null {
  const allowedMaterials = [
    'platinum',
    '18k-white-gold', 
    '18k-yellow-gold',
    '18k-rose-gold'
  ]
  
  if (typeof materialId === 'string' && allowedMaterials.includes(materialId)) {
    return materialId
  }
  
  return null
}

/**
 * Generate CSRF token for forms
 * Simple implementation for basic protection
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return typeof token === 'string' && 
         typeof sessionToken === 'string' && 
         token.length === 64 && 
         token === sessionToken
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Get or create request history for this identifier
    const requests = this.requests.get(identifier) || []
    
    // Filter out old requests
    const recentRequests = requests.filter(time => time > windowStart)
    
    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    return true
  }
  
  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier)
    } else {
      this.requests.clear()
    }
  }
}

/**
 * Input validation schemas for common operations
 */
export const ValidationSchemas = {
  materialSelection: {
    productId: (value: any) => typeof value === 'string' && /^[a-zA-Z0-9-]{1,50}$/.test(value),
    materialId: (value: any) => validateMaterialId(value) !== null,
    price: (value: any) => validatePrice(value) > 0
  },
  
  userInput: {
    name: (value: any) => typeof value === 'string' && value.length >= 1 && value.length <= 100,
    email: (value: any) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: (value: any) => typeof value === 'string' && value.length <= 1000
  }
} as const

/**
 * Validate object against schema
 */
export function validateInput<T extends keyof typeof ValidationSchemas>(
  schema: T,
  data: Record<string, any>
): { isValid: boolean; errors: string[] } {
  const schemaRules = ValidationSchemas[schema]
  const errors: string[] = []
  
  for (const [key, validator] of Object.entries(schemaRules)) {
    if (!validator(data[key])) {
      errors.push(`Invalid ${key}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}