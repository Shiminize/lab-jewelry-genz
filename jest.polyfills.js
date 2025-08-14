/**
 * Jest polyfills for modern browser APIs
 * These are needed for testing components that use modern web APIs
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