/**
 * Jest polyfills for modern browser APIs and API testing
 * These are needed for testing components and API routes that use modern web APIs
 */

const { TextEncoder, TextDecoder } = require('util')

// Polyfill TextEncoder/TextDecoder
Object.assign(global, { TextDecoder, TextEncoder })

// Polyfill fetch
const { Request, Response, Headers, fetch } = require('undici')
Object.assign(global, { fetch, Headers, Request, Response })

// Polyfill URL
const { URL, URLSearchParams } = require('url')
Object.assign(global, { URL, URLSearchParams })

// Mock crypto for JWT and hashing operations
const crypto = require('crypto')

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => crypto.randomUUID(),
    subtle: {
      digest: async (algorithm, data) => {
        const hash = crypto.createHash(algorithm.replace('-', '').toLowerCase())
        hash.update(data)
        return hash.digest()
      }
    }
  }
})

// Mock performance API for timing measurements
global.performance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
  getEntriesByName: () => [],
  getEntriesByType: () => []
}

// Enhanced console mocking for cleaner test output
const originalConsole = { ...console }

global.console = {
  ...originalConsole,
  // Suppress expected error logs in tests unless verbose mode
  error: jest.fn((...args) => {
    if (process.env.NODE_ENV === 'test' && !process.env.JEST_VERBOSE) {
      return
    }
    originalConsole.error(...args)
  }),
  warn: jest.fn((...args) => {
    if (process.env.NODE_ENV === 'test' && !process.env.JEST_VERBOSE) {
      return
    }
    originalConsole.warn(...args)
  }),
  log: originalConsole.log,
  info: originalConsole.info,
  debug: originalConsole.debug
}

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'