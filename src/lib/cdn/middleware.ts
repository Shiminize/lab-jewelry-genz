/**
 * CDN Middleware
 * 
 * Middleware to detect CDN cache status and add diagnostic headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectCDNInfo, createCDNDiagnosticHeader } from './detector';

/**
 * Add CDN diagnostic headers to API responses
 */
export function addCDNHeaders(request: NextRequest, response: NextResponse): NextResponse {
  // Only add CDN headers to API routes for diagnostics
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return response;
  }
  
  // Detect CDN info from incoming request headers
  const cdnInfo = detectCDNInfo(request.headers);
  
  // Add diagnostic header for client-side debugging
  const diagnosticHeader = createCDNDiagnosticHeader(cdnInfo);
  response.headers.set('X-CDN-Cache', diagnosticHeader);
  
  // Pass through original CDN headers for debugging (if present)
  if (cdnInfo.provider && Object.keys(cdnInfo.originalHeaders).length > 0) {
    // Add a summary header with original CDN status
    if (cdnInfo.cacheStatus) {
      response.headers.set('X-CDN-Original-Status', cdnInfo.cacheStatus);
    }
    
    // Optionally pass through specific headers (be selective to avoid header bloat)
    const importantHeaders = ['cf-cache-status', 'x-cache', 'cf-ray'];
    for (const headerName of importantHeaders) {
      const value = request.headers.get(headerName);
      if (value) {
        // Prefix with X-CDN- to avoid conflicts
        const passThruName = `X-CDN-${headerName.replace(/^(cf-|x-)/, '').replace(/-/g, '-')}`;
        response.headers.set(passThruName, value);
      }
    }
  }
  
  return response;
}

/**
 * Extract CDN info for metrics logging
 */
export function extractCDNInfoForMetrics(request: NextRequest): {
  cdnProvider?: string;
  cdnCacheStatus?: string;
  cdnNormalized?: string;
  cdnHeaders?: Record<string, string>;
} {
  const cdnInfo = detectCDNInfo(request.headers);
  
  if (!cdnInfo.provider) {
    return {};
  }
  
  return {
    cdnProvider: cdnInfo.provider,
    cdnCacheStatus: cdnInfo.cacheStatus || undefined,
    cdnNormalized: cdnInfo.normalized !== 'UNKNOWN' ? cdnInfo.normalized : undefined,
    cdnHeaders: Object.keys(cdnInfo.originalHeaders).length > 0 ? cdnInfo.originalHeaders : undefined,
  };
}
