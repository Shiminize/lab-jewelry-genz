/**
 * Security utilities for input sanitization and XSS prevention
 * Implements CLAUDE_RULES security requirements with isomorphic approach
 * Server-side compatible sanitization without browser dependencies
 */

/**
 * Core sanitization function for all inputs
 * Provides robust XSS prevention without DOM dependencies
 */
function sanitize(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/vbscript:/gi, '') // Remove vbscript: URLs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/&(?!#[0-9]+;|#x[0-9a-f]+;|[a-z]+;)/gi, '&amp;') // Encode unescaped ampersands
    .trim();
}

/**
 * Sanitizes user input to prevent XSS attacks
 * Used for search queries, form inputs, and user-generated content
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Additional length validation
  if (input.length > 1000) {
    console.warn('Input exceeds maximum length, truncating');
    input = input.substring(0, 1000);
  }

  return sanitize(input);
}

/**
 * Sanitizes search queries with additional validation
 * Prevents SQL injection and XSS in search functionality
 */
export function sanitizeSearchQuery(query: string | null | undefined): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters for search
  let sanitized = query
    .replace(/[<>'"]/g, '') // Remove HTML/JS characters
    .replace(/[;\\]/g, '') // Remove SQL injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Length limit for search queries
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitize(sanitized);
}

/**
 * Sanitizes URLs to prevent open redirect attacks
 * Validates internal navigation URLs
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '/';
  }

  // Remove any potential javascript: or data: URLs
  if (url.match(/^(javascript:|data:|vbscript:|file:)/i)) {
    console.warn('Potentially malicious URL blocked:', url);
    return '/';
  }

  // Ensure internal URLs only
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Allow only specific domains for external links
    const allowedDomains = [
      'localhost:3000',
      'localhost:3001',
      // Add production domains here
    ];
    
    try {
      const urlObj = new URL(url);
      if (!allowedDomains.some(domain => urlObj.host === domain)) {
        console.warn('External URL blocked:', url);
        return '/';
      }
    } catch (error) {
      console.warn('Invalid URL:', url);
      return '/';
    }
  }

  // Ensure URL starts with / for internal routing
  if (!url.startsWith('/')) {
    url = '/' + url;
  }

  return sanitize(url);
}

/**
 * Creates Content Security Policy headers
 * Prevents XSS by controlling resource loading
 */
export function getCSPHeaders(): Record<string, string> {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://uploads.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join('; ');

  return {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
}

/**
 * Rate limiting helper for navigation requests
 * Prevents abuse of navigation endpoints
 */
export class NavigationRateLimit {
  private static instances = new Map<string, { count: number; resetTime: number }>();
  
  static check(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now();
    const key = `nav_${identifier}`;
    
    const instance = this.instances.get(key);
    
    if (!instance || now > instance.resetTime) {
      this.instances.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (instance.count >= maxRequests) {
      return false;
    }
    
    instance.count++;
    return true;
  }
  
  static reset(identifier: string): void {
    this.instances.delete(`nav_${identifier}`);
  }
}

/**
 * Validates navigation data structure
 * Ensures navigation items are properly structured
 */
export interface SafeNavigationItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  children?: SafeNavigationItem[];
}

export function validateNavigationData(data: unknown): SafeNavigationItem[] {
  if (!Array.isArray(data)) {
    console.warn('Invalid navigation data: not an array');
    return [];
  }

  return data
    .filter((item): item is SafeNavigationItem => {
      if (!item || typeof item !== 'object') return false;
      
      const navItem = item as Record<string, unknown>;
      
      return (
        typeof navItem.id === 'string' &&
        typeof navItem.label === 'string' &&
        typeof navItem.href === 'string' &&
        navItem.id.length > 0 &&
        navItem.label.length > 0 &&
        navItem.href.length > 0
      );
    })
    .map((item) => ({
      id: sanitizeInput(item.id),
      label: sanitizeInput(item.label),
      href: sanitizeUrl(item.href),
      description: item.description ? sanitizeInput(item.description) : undefined,
      children: item.children ? validateNavigationData(item.children) : undefined
    }));
}

/**
 * Memory-safe cleanup utility
 * Prevents memory leaks from event listeners
 */
export class MemoryGuard {
  private static listeners = new Set<() => void>();
  
  static addCleanup(cleanup: () => void): void {
    this.listeners.add(cleanup);
  }
  
  static removeCleanup(cleanup: () => void): void {
    this.listeners.delete(cleanup);
  }
  
  static cleanupAll(): void {
    this.listeners.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    this.listeners.clear();
  }
}

// Export default sanitization function for convenience
export default sanitizeInput;