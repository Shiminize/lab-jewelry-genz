/**
 * CDN Cache Status Detector
 * 
 * Detects and normalizes CDN cache status headers from various providers
 * (Cloudflare, Fastly, Akamai, AWS CloudFront, etc.)
 */

export interface CDNInfo {
  provider: string | null;
  cacheStatus: string | null;
  originalHeaders: Record<string, string>;
  normalized: 'HIT' | 'MISS' | 'BYPASS' | 'EXPIRED' | 'UNKNOWN';
}

/**
 * Known CDN cache status headers and their providers
 */
const CDN_HEADERS = {
  // Cloudflare
  'cf-cache-status': 'cloudflare',
  'cf-ray': 'cloudflare',
  
  // Fastly
  'x-cache': 'fastly',
  'x-served-by': 'fastly',
  'x-cache-hits': 'fastly',
  
  // Akamai
  'x-akamai-request-id': 'akamai',
  'x-check-cacheable': 'akamai',
  
  // AWS CloudFront
  'x-amz-cf-pop': 'cloudfront',
  'x-amz-cf-id': 'cloudfront',
  
  // KeyCDN
  'x-edge-location': 'keycdn',
  
  // MaxCDN/StackPath
  'x-pull-zone': 'maxcdn',
  
  // Generic/Other
  'x-cdn-cache': 'generic',
  'x-cache-status': 'generic',
} as const;

/**
 * Normalize cache status values to standard format
 */
function normalizeCacheStatus(provider: string, status: string): CDNInfo['normalized'] {
  const statusLower = status.toLowerCase();
  
  switch (provider) {
    case 'cloudflare':
      // Cloudflare: HIT, MISS, EXPIRED, STALE, BYPASS, REVALIDATED, etc.
      if (statusLower.includes('hit') || statusLower.includes('stale')) return 'HIT';
      if (statusLower.includes('miss')) return 'MISS';
      if (statusLower.includes('expired')) return 'EXPIRED';
      if (statusLower.includes('bypass')) return 'BYPASS';
      break;
      
    case 'fastly':
      // Fastly: HIT, MISS, PASS, ERROR, etc.
      if (statusLower.includes('hit')) return 'HIT';
      if (statusLower.includes('miss')) return 'MISS';
      if (statusLower.includes('pass') || statusLower.includes('bypass')) return 'BYPASS';
      break;
      
    case 'akamai':
      // Akamai: Hit, Miss, RefreshHit, etc.
      if (statusLower.includes('hit')) return 'HIT';
      if (statusLower.includes('miss')) return 'MISS';
      break;
      
    case 'cloudfront':
      // CloudFront: Hit, Miss, RefreshHit, OriginShield, etc.
      if (statusLower.includes('hit')) return 'HIT';
      if (statusLower.includes('miss')) return 'MISS';
      break;
      
    default:
      // Generic normalization
      if (statusLower.includes('hit')) return 'HIT';
      if (statusLower.includes('miss')) return 'MISS';
      if (statusLower.includes('expired')) return 'EXPIRED';
      if (statusLower.includes('bypass') || statusLower.includes('pass')) return 'BYPASS';
  }
  
  return 'UNKNOWN';
}

/**
 * Detect CDN provider and cache status from request headers
 */
export function detectCDNInfo(headers: Headers): CDNInfo {
  const cdnInfo: CDNInfo = {
    provider: null,
    cacheStatus: null,
    originalHeaders: {},
    normalized: 'UNKNOWN',
  };
  
  // Check for CDN headers
  for (const [headerName, provider] of Object.entries(CDN_HEADERS)) {
    const headerValue = headers.get(headerName);
    if (headerValue) {
      cdnInfo.originalHeaders[headerName] = headerValue;
      
      // Set provider if not already detected
      if (!cdnInfo.provider) {
        cdnInfo.provider = provider;
      }
      
      // Extract cache status from specific headers
      if (headerName === 'cf-cache-status' || 
          headerName === 'x-cache' || 
          headerName === 'x-cache-status') {
        cdnInfo.cacheStatus = headerValue;
        cdnInfo.normalized = normalizeCacheStatus(provider, headerValue);
      }
    }
  }
  
  // Special handling for Fastly x-cache header format
  if (cdnInfo.provider === 'fastly' && cdnInfo.originalHeaders['x-cache']) {
    const xCache = cdnInfo.originalHeaders['x-cache'];
    // Fastly format: "HIT, MISS" or "HIT" or "MISS"
    const parts = xCache.split(',').map(s => s.trim());
    const lastStatus = parts[parts.length - 1];
    cdnInfo.cacheStatus = lastStatus;
    cdnInfo.normalized = normalizeCacheStatus('fastly', lastStatus);
  }
  
  return cdnInfo;
}

/**
 * Create X-CDN-Cache header value for client diagnostics
 */
export function createCDNDiagnosticHeader(cdnInfo: CDNInfo): string {
  if (!cdnInfo.provider) {
    return 'NONE';
  }
  
  const parts = [cdnInfo.provider.toUpperCase()];
  
  if (cdnInfo.normalized !== 'UNKNOWN') {
    parts.push(cdnInfo.normalized);
  }
  
  if (cdnInfo.cacheStatus && cdnInfo.cacheStatus !== cdnInfo.normalized) {
    parts.push(`(${cdnInfo.cacheStatus})`);
  }
  
  return parts.join(':');
}

/**
 * Extract CDN headers for logging
 */
export function extractCDNHeadersForLogging(headers: Headers): Record<string, string> {
  const cdnHeaders: Record<string, string> = {};
  
  for (const headerName of Object.keys(CDN_HEADERS)) {
    const value = headers.get(headerName);
    if (value) {
      cdnHeaders[headerName] = value;
    }
  }
  
  return cdnHeaders;
}

/**
 * Check if request is coming through a CDN
 */
export function isCDNRequest(headers: Headers): boolean {
  return Object.keys(CDN_HEADERS).some(header => headers.has(header));
}
