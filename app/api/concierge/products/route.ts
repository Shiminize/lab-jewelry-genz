import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/concierge/providers';
import type { ProductFilter } from '@/lib/concierge/providers/types';
import { logMetric } from '@/lib/metrics/logger';
import { productCache, AppCache } from '@/lib/cache/appCache';
import { extractCDNInfoForMetrics } from '@/lib/cdn/middleware';
import { detectCDNInfo, createCDNDiagnosticHeader } from '@/lib/cdn/detector';

export async function GET(req: Request) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Extract CDN info for metrics and headers (if request came through CDN)
  const cdnInfo = extractCDNInfoForMetrics(req as any);
  const cdnDetection = detectCDNInfo((req as any).headers);
  const cdnDiagnosticHeader = createCDNDiagnosticHeader(cdnDetection);
  
  try {
    const { searchParams } = new URL(req.url);
    
    // Generate canonical cache key
    const cacheKey = AppCache.canonicalizeKey(searchParams);
    
    // Check app-level cache (10s TTL)
    const cached = productCache.get(cacheKey);
    if (cached) {
      const latencyMs = Date.now() - startTime;
      
      // Log cache HIT
      logMetric({
        timestamp,
        endpoint: '/api/concierge/products',
        method: 'GET',
        status: 200,
        latencyMs,
        cache: 'HIT',
        params: {
          cacheKey: cacheKey.substring(0, 50),
        },
        ...cdnInfo,
      });
      
      // Return cached response with HIT header
      const headers: Record<string, string> = {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'X-App-Cache': 'HIT',
      };
      
      // Add CDN diagnostic header if CDN detected
      if (cdnDiagnosticHeader !== 'NONE') {
        headers['X-CDN-Cache'] = cdnDiagnosticHeader;
      }
      
      return NextResponse.json(cached, {
        status: 200,
        headers,
      });
    }
    
    // Parse sortBy param: featured, newest, price-asc, price-desc
    // Default: featured (featuredInWidget desc, updatedAt desc, price asc)
    const sortBy = searchParams.get('sortBy') || 'featured';
    
    const filter: ProductFilter = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      readyToShip: searchParams.get('readyToShip') === 'true' ? true
                : searchParams.get('readyToShip') === 'false' ? false : undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
      sortBy: sortBy as 'featured' | 'newest' | 'price-asc' | 'price-desc',
    };
    const featuredParam = searchParams.get('featured')
    if (featuredParam === 'true') {
      ;(filter as any).featured = true
    }
    const priceLt = Number(searchParams.get('priceLt') || NaN);
    const eff: any = Number.isFinite(priceLt) ? { ...filter, priceLt: Math.max(1, Math.min(100000, priceLt)) } : filter;

    const provider = getProvider();
    let items;
    try {
      items = await provider.listProducts(eff);
    } catch (err) {
      console.error('[route] concierge error', {
        provider: process.env.CONCIERGE_FAKE_PROVIDER === '1' ? 'fake' : process.env.CONCIERGE_DATA_MODE,
        err,
      });
      throw err;
    }
    const out = Number.isFinite(priceLt) ? items.filter(p => typeof p.price === 'number' && p.price < eff.priceLt) : items;
    
    // Store in app-level cache
    productCache.set(cacheKey, out);
    
    // Log metrics (cache MISS)
    const latencyMs = Date.now() - startTime;
    logMetric({
      timestamp,
      endpoint: '/api/concierge/products',
      method: 'GET',
      status: 200,
      latencyMs,
      cache: 'MISS',
      params: {
        sortBy,
        category: filter.category || '',
        readyToShip: String(filter.readyToShip || ''),
        cacheKey: cacheKey.substring(0, 50),
      },
      ...cdnInfo,
    });
    
    // Edge cache for public anonymous browsing
    // s-maxage=30: CDN can cache for 30 seconds
    // stale-while-revalidate=120: Serve stale content while revalidating for up to 120 seconds
    const headers: Record<string, string> = {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      'X-App-Cache': 'MISS',
    };
    
    // Add CDN diagnostic header if CDN detected
    if (cdnDiagnosticHeader !== 'NONE') {
      headers['X-CDN-Cache'] = cdnDiagnosticHeader;
    }
    
    return NextResponse.json(out, {
      status: 200,
      headers,
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const status = 503; // Service unavailable (e.g., Atlas unreachable)
    
    logMetric({
      timestamp,
      endpoint: '/api/concierge/products',
      method: 'GET',
      status,
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...cdnInfo,
    });
    
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status }
    );
  }
}
