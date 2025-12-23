import { NextResponse } from 'next/server'

export function getClientIP(request: Request): string {
  // Prefer standard proxy headers; fallback to empty
  const header = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  return header || (request.headers.get('x-real-ip') || '') || 'unknown'
}

export function createErrorResponse(
  code: string,
  message: string,
  details: unknown[] = [],
  status = 400,
  meta?: Record<string, unknown>
) {
  const response = NextResponse.json({ error: code, message, details, ...(meta ? { meta } : {}) }, { status })
  return response
}

export function getRequestId(request: Request): string {
  return request.headers.get('x-request-id') || crypto.randomUUID?.() || `req-${Date.now()}`
}


