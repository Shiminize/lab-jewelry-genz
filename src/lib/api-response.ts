/**
 * API Response Utilities
 * Standardized response format for CLAUDE_RULES compliance
 */

import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId?: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

/**
 * Create successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  }
}

/**
 * Create error API response
 */
export function createErrorResponse(
  message: string,
  code?: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * NextJS response helpers
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: ApiResponse<T>['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(createSuccessResponse(data, meta), { status })
}

export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(createErrorResponse(message, code, details), { status })
}

/**
 * Handle API errors with proper response formatting
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof Error) {
    return errorResponse(error.message, 500, 'INTERNAL_ERROR', {
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }

  return errorResponse('Internal server error', 500, 'UNKNOWN_ERROR')
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  message: string,
  details?: any
): NextResponse<ApiResponse> {
  return errorResponse(message, 400, 'VALIDATION_ERROR', details)
}

/**
 * Not found error response
 */
export function notFoundResponse(resource: string): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND')
}

/**
 * Unauthorized error response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 401, 'UNAUTHORIZED')
}

/**
 * Forbidden error response
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 403, 'FORBIDDEN')
}

/**
 * Rate limit error response
 */
export function rateLimitResponse(): NextResponse<ApiResponse> {
  return errorResponse('Too many requests', 429, 'RATE_LIMIT_EXCEEDED')
}