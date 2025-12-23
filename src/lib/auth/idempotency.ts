/**
 * Idempotency Key Manager
 * Prevents duplicate requests with the same idempotency key
 */

interface IdempotencyRecord {
  key: string
  result: any
  timestamp: number
  status: number
}

const idempotencyStore = new Map<string, IdempotencyRecord>()

const TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Check if request with idempotency key has been processed
 * 
 * @param key - Idempotency key from X-Idempotency-Key header
 * @returns Stored result if key exists, null otherwise
 */
export function checkIdempotency(key: string): IdempotencyRecord | null {
  if (!key) return null
  
  const record = idempotencyStore.get(key)
  if (!record) return null
  
  // Check if record is still valid (within TTL)
  if (Date.now() - record.timestamp > TTL) {
    idempotencyStore.delete(key)
    return null
  }
  
  return record
}

/**
 * Store result for idempotency key
 * 
 * @param key - Idempotency key
 * @param result - Response data
 * @param status - HTTP status code
 */
export function storeIdempotency(key: string, result: any, status: number): void {
  if (!key) return
  
  idempotencyStore.set(key, {
    key,
    result,
    status,
    timestamp: Date.now(),
  })
}

/**
 * Clean up expired idempotency records
 */
export function cleanupIdempotency() {
  const now = Date.now()
  
  for (const [key, record] of Array.from(idempotencyStore.entries())) {
    if (now - record.timestamp > TTL) {
      idempotencyStore.delete(key)
    }
  }
}

// Cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupIdempotency, 60 * 60 * 1000)
}

