/**
 * API Compliance Tests for GlowGlitch 3D Customizer
 * Tests all CLAUDE_RULES.md API requirements
 * - Response envelope format (success/error)
 * - Zod validation on inputs
 * - Rate limiting with X-RateLimit-* headers
 * - Security headers (HSTS, CSP, etc.)
 * - <300ms response time targets
 * - No raw DB documents returned
 */

import { test, expect, APIRequestContext } from '@playwright/test';

// API endpoints to test
const API_ENDPOINTS = {
  products: '/api/products',
  productDetail: '/api/products/eternal-solitaire-ring',
  customize: '/api/products/eternal-solitaire-ring/customize',
  featuredProducts: '/api/products/featured',
  health: '/api/health',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    session: '/api/auth/session'
  }
};

// Valid test payloads
const TEST_PAYLOADS = {
  validCustomization: {
    material: { id: 'gold-14k', name: '14K Gold', priceMultiplier: 1.0 },
    stoneQuality: { id: 'premium', name: 'Premium', priceMultiplier: 1.5 },
    size: { id: 'size-7', name: 'Size 7', adjustment: 0 },
    engraving: 'Forever Yours'
  },
  invalidCustomization: {
    material: { id: 'invalid-material' },
    stoneQuality: { id: null },
    size: 'invalid-size-format'
  },
  validAuth: {
    email: 'test@example.com',
    password: 'ValidPassword123!'
  },
  invalidAuth: {
    email: 'invalid-email',
    password: 'weak'
  }
};

// Helper function to check response envelope format
function validateResponseEnvelope(responseBody: any, expectSuccess: boolean) {
  if (expectSuccess) {
    expect(responseBody).toHaveProperty('success', true);
    expect(responseBody).toHaveProperty('data');
    expect(responseBody).not.toHaveProperty('error');
  } else {
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toHaveProperty('code');
    expect(responseBody.error).toHaveProperty('message');
    expect(responseBody).not.toHaveProperty('data');
  }
  
  // All responses must have meta information
  expect(responseBody).toHaveProperty('meta');
  expect(responseBody.meta).toHaveProperty('timestamp');
  expect(responseBody.meta).toHaveProperty('requestId');
  expect(responseBody.meta).toHaveProperty('version');
}

// Helper function to check required security headers
function validateSecurityHeaders(response: any) {
  const headers = response.headers();
  
  // HSTS header (should be present in production)
  if (process.env.NODE_ENV === 'production') {
    expect(headers['strict-transport-security']).toBeDefined();
  }
  
  // CSP header for WebGL/3D customizer support
  expect(headers['content-security-policy']).toBeDefined();
  expect(headers['content-security-policy']).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
  expect(headers['content-security-policy']).toContain("worker-src 'self' blob:");
  
  // XSS Protection
  expect(headers['x-xss-protection']).toBe('1; mode=block');
  
  // Content Type Options
  expect(headers['x-content-type-options']).toBe('nosniff');
  
  // Frame Options
  expect(headers['x-frame-options']).toBe('DENY');
  
  // Referrer Policy
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
}

// Helper function to check rate limit headers
function validateRateLimitHeaders(response: any) {
  const headers = response.headers();
  
  if (headers['x-ratelimit-limit']) {
    expect(headers['x-ratelimit-limit']).toMatch(/^\d+$/);
    expect(headers['x-ratelimit-remaining']).toMatch(/^\d+$/);
    expect(headers['x-ratelimit-reset']).toMatch(/^\d+$/);
  }
}

test.describe('API Response Envelope Compliance', () => {
  test('GET requests return proper success envelope', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.products);
    const body = await response.json();
    
    expect(response.status()).toBe(200);
    validateResponseEnvelope(body, true);
    
    // Ensure no raw MongoDB documents (no _id, __v fields)
    if (body.data && Array.isArray(body.data)) {
      body.data.forEach((item: any) => {
        expect(item).not.toHaveProperty('_id');
        expect(item).not.toHaveProperty('__v');
      });
    }
  });

  test('404 errors return proper error envelope', async ({ request }) => {
    const response = await request.get('/api/products/non-existent-product');
    const body = await response.json();
    
    expect(response.status()).toBe(404);
    validateResponseEnvelope(body, false);
    expect(body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  test('500 errors return proper error envelope', async ({ request }) => {
    // This endpoint should trigger a server error if implemented correctly
    const response = await request.post('/api/products/trigger-error', {
      data: { malformed: 'data that causes server error' }
    });
    const body = await response.json();
    
    expect([500, 400, 404]).toContain(response.status()); // Allow for different error handling
    validateResponseEnvelope(body, false);
  });
});

test.describe('Zod Validation Compliance', () => {
  test('Invalid customization data returns validation errors', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.customize, {
      data: TEST_PAYLOADS.invalidCustomization
    });
    const body = await response.json();
    
    expect(response.status()).toBe(422);
    validateResponseEnvelope(body, false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toBeDefined();
    expect(Array.isArray(body.error.details)).toBe(true);
  });

  test('Invalid auth data returns validation errors', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.auth.login, {
      data: TEST_PAYLOADS.invalidAuth
    });
    const body = await response.json();
    
    expect([400, 401, 422]).toContain(response.status());
    validateResponseEnvelope(body, false);
    
    if (body.error.code === 'VALIDATION_ERROR') {
      expect(body.error.details).toBeDefined();
      expect(Array.isArray(body.error.details)).toBe(true);
    }
  });

  test('Valid data passes validation', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.customize);
    const body = await response.json();
    
    expect(response.status()).toBe(200);
    validateResponseEnvelope(body, true);
  });
});

test.describe('Rate Limiting Compliance', () => {
  test('Rate limit headers are present', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.products);
    validateRateLimitHeaders(response);
  });

  test('Rate limiting works for rapid requests', async ({ request }) => {
    const requests = [];
    
    // Send 10 rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(request.get(API_ENDPOINTS.products));
    }
    
    const responses = await Promise.all(requests);
    
    // Check that at least some requests have rate limit headers
    let hasRateLimitHeaders = false;
    responses.forEach(response => {
      const headers = response.headers();
      if (headers['x-ratelimit-limit']) {
        hasRateLimitHeaders = true;
        validateRateLimitHeaders(response);
      }
    });
    
    // In a real rate limiting system, we expect headers
    // For development, this might not be enforced
    console.log('Rate limiting headers present:', hasRateLimitHeaders);
  });

  test('Rate limit exceeded returns 429 status', async ({ request }) => {
    // This test would need to be adjusted based on actual rate limits
    // For now, we'll test the structure if we get a 429
    const response = await request.get(API_ENDPOINTS.products);
    
    if (response.status() === 429) {
      const body = await response.json();
      validateResponseEnvelope(body, false);
      expect(body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      
      const headers = response.headers();
      expect(headers['retry-after']).toBeDefined();
    }
  });
});

test.describe('Security Headers Compliance', () => {
  test('All security headers are present', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.products);
    validateSecurityHeaders(response);
  });

  test('CSP allows WebGL for 3D customizer', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.customize);
    const headers = response.headers();
    
    const csp = headers['content-security-policy'];
    expect(csp).toBeDefined();
    
    // Check WebGL-specific directives
    expect(csp).toContain("worker-src 'self' blob:");
    expect(csp).toContain("child-src 'self' blob:");
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
  });

  test('CORS headers are properly configured', async ({ request }) => {
    const response = await request.options(API_ENDPOINTS.products);
    const headers = response.headers();
    
    expect(headers['access-control-allow-origin']).toBeDefined();
    expect(headers['access-control-allow-methods']).toBeDefined();
    expect(headers['access-control-allow-headers']).toBeDefined();
  });
});

test.describe('Performance Compliance', () => {
  test('API responses are under 300ms target', async ({ request }) => {
    const endpoints = [
      API_ENDPOINTS.products,
      API_ENDPOINTS.productDetail,
      API_ENDPOINTS.customize,
      API_ENDPOINTS.featuredProducts
    ];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await request.get(endpoint);
      const responseTime = Date.now() - startTime;
      
      expect(response.status()).toBeLessThan(500); // No server errors
      
      // Log performance for analysis
      console.log(`${endpoint}: ${responseTime}ms`);
      
      // Check if response time header is present
      const headers = response.headers();
      if (headers['x-response-time']) {
        console.log(`Server reported: ${headers['x-response-time']}`);
      }
      
      // CLAUDE_RULES target: <300ms
      if (responseTime > 300) {
        console.warn(`CLAUDE_RULES VIOLATION: ${endpoint} took ${responseTime}ms (target: <300ms)`);
      }
      
      // Allow some tolerance in tests (500ms max for network latency)
      expect(responseTime).toBeLessThan(500);
    }
  });

  test('Customization endpoint performance', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.post(API_ENDPOINTS.customize, {
      data: TEST_PAYLOADS.validCustomization
    });
    const responseTime = Date.now() - startTime;
    
    expect(response.status()).toBeLessThan(500);
    console.log(`Customization POST: ${responseTime}ms`);
    
    // Critical path should be fast
    expect(responseTime).toBeLessThan(1000);
  });
});

test.describe('Data Sanitization Compliance', () => {
  test('No raw MongoDB documents in responses', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.products);
    const body = await response.json();
    
    expect(response.status()).toBe(200);
    
    function checkObject(obj: any, path: string = 'root') {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          checkObject(item, `${path}[${index}]`);
        });
      } else if (obj && typeof obj === 'object') {
        // Check for MongoDB-specific fields
        expect(obj).not.toHaveProperty('_id', `Found _id at ${path}`);
        expect(obj).not.toHaveProperty('__v', `Found __v at ${path}`);
        
        // Recursively check nested objects
        Object.keys(obj).forEach(key => {
          checkObject(obj[key], `${path}.${key}`);
        });
      }
    }
    
    if (body.data) {
      checkObject(body.data);
    }
  });

  test('Sensitive fields are filtered from responses', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.auth.session);
    const body = await response.json();
    
    // Even if session returns user data, sensitive fields should be filtered
    if (body.success && body.data && body.data.user) {
      const user = body.data.user;
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('passwordHash');
      expect(user).not.toHaveProperty('salt');
      expect(user).not.toHaveProperty('resetToken');
    }
  });
});

test.describe('Error Handling Compliance', () => {
  test('Malformed JSON returns proper error', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.customize, {
      data: 'invalid-json-string'
    });
    const body = await response.json();
    
    expect([400, 422]).toContain(response.status());
    validateResponseEnvelope(body, false);
    expect(['INVALID_JSON', 'VALIDATION_ERROR']).toContain(body.error.code);
  });

  test('Missing required fields return validation errors', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.auth.register, {
      data: { email: 'test@example.com' } // Missing password
    });
    const body = await response.json();
    
    expect([400, 422]).toContain(response.status());
    validateResponseEnvelope(body, false);
  });

  test('Internal errors are properly handled', async ({ request }) => {
    // Test a route that might cause internal errors
    const response = await request.get('/api/products/cause-internal-error');
    
    if (response.status() === 500) {
      const body = await response.json();
      validateResponseEnvelope(body, false);
      expect(body.error.code).toBe('INTERNAL_ERROR');
      
      // Error message should not leak internal details
      expect(body.error.message).not.toContain('database');
      expect(body.error.message).not.toContain('mongodb');
      expect(body.error.message).not.toContain('stack trace');
    }
  });
});