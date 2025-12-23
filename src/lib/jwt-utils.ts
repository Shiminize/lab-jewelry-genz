import { NextResponse } from 'next/server'

export type RateLimitWindow = {
  allowed: boolean
  remaining: number
  resetMs: number
  limit: number
}

const rateLimitBuckets: Map<string, { count: number; resetAt: number; limit: number }> = new Map()

export const AUTH_ERRORS = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitWindow {
  const now = Date.now()
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs, limit })
    return { allowed: true, remaining: limit - 1, resetMs: windowMs, limit }
  }

  if (bucket.count >= bucket.limit) {
    return { allowed: false, remaining: 0, resetMs: Math.max(0, bucket.resetAt - now), limit: bucket.limit }
  }

  bucket.count += 1
  rateLimitBuckets.set(key, bucket)
  return { allowed: true, remaining: Math.max(0, bucket.limit - bucket.count), resetMs: Math.max(0, bucket.resetAt - now), limit: bucket.limit }
}

export function getRateLimitHeaders(info: RateLimitWindow): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(info.limit),
    'X-RateLimit-Remaining': String(info.remaining),
    'X-RateLimit-Reset': String(Math.ceil(info.resetMs / 1000)),
  }
}

export function tooManyRequests(message = 'Too many requests', info?: RateLimitWindow): NextResponse {
  const response = NextResponse.json({ error: AUTH_ERRORS.RATE_LIMIT_EXCEEDED, message }, { status: 429 })
  if (info) {
    const headers = getRateLimitHeaders(info)
    Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v))
  }
  return response
}


