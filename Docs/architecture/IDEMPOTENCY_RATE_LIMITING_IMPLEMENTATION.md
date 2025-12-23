# Idempotency & Rate Limiting Implementation

## Overview

Implemented idempotency headers and token-bucket rate limiting for admin dashboard PATCH operations.

## Components Created

### 1. Idempotency Cache (`src/lib/idempotency/cache.ts`)
- **Purpose**: Prevent duplicate PATCH requests from executing twice
- **Implementation**: In-memory cache with 60s TTL
- **Key format**: `{idempotency-key}:{sku}`
- **Response**: Returns cached result if same key+SKU seen within TTL
- **Warning**: Logs startup warning about Redis migration for multi-instance deployments

**Features**:
- Automatic cleanup every 30s
- JSON structured logging for cache hits
- TTL-based expiration
- Stats endpoint for monitoring

### 2. Token Bucket Rate Limiter (`src/lib/ratelimit/tokenBucket.ts`)
- **Purpose**: Limit admin API requests to 5 req/sec per IP
- **Implementation**: Token bucket algorithm with refill
- **Tokens**: 5 max, refills at 5/sec
- **Response**: Returns 429 with `Retry-After` header when exceeded
- **Warning**: Logs startup warning about Redis migration

**Features**:
- Per-IP tracking
- Automatic cleanup of stale buckets (5min idle)
- `X-RateLimit-Remaining` and `Retry-After` headers
- JSON structured logging for denials

### 3. API Route Updates (`src/app/api/admin/products/[sku]/route.ts`)

**Added**:
- Rate limit check (before auth)
- Idempotency key extraction from `X-Idempotency-Key` header
- Cache lookup before processing
- Cache storage after successful update
- `X-Idempotency-Replay: true` header on cache hits

**Flow**:
```
Request → Rate Limit Check → Auth Check → Idempotency Check → 
  ↓                                         ↓
  429 if exceeded                        Return cached if found
                                            ↓
                                         Process → Cache → Respond
```

### 4. Dashboard UI Updates (`src/app/dashboard/products/ProductsTable.tsx`)

**Added**:
- UUID v4 generator
- Per-SKU idempotency key tracking (60s TTL client-side)
- `X-Idempotency-Key` header in PATCH requests
- Detection of `X-Idempotency-Replay` header
- Rate limit error handling (429 with retry-after display)

**Features**:
- Reuses idempotency key if save clicked within 60s (prevents accidental double-click issues)
- Generates new key after 60s
- Shows "Saved (cached response)" for replayed requests
- Shows "Rate limit exceeded. Please wait Xs" for 429 responses

## Testing

### Manual Test (requires authentication)

1. **Idempotency Test**:
```bash
# First request
curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-dup-123" \
  -d '{"featuredInWidget":true}' \
  "http://localhost:3000/api/admin/products/RING-READY-001" \
  --cookie "your-session-cookie"

# Duplicate request (should return cached, check logs for "idempotency replay")
curl -s -i -X PATCH \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-dup-123" \
  -d '{"featuredInWidget":true}' \
  "http://localhost:3000/api/admin/products/RING-READY-001" \
  --cookie "your-session-cookie" \
  | grep "X-Idempotency-Replay"
# Should show: X-Idempotency-Replay: true
```

2. **Rate Limit Test**:
```bash
# Send 6+ rapid requests
for i in {1..7}; do
  echo "Request $i:"
  curl -s -o /dev/null -w "%{http_code}\n" -X PATCH \
    -H "Content-Type: application/json" \
    -H "X-Idempotency-Key: test-rate-$i" \
    -d '{"featuredInWidget":true}' \
    "http://localhost:3000/api/admin/products/RING-READY-001" \
    --cookie "your-session-cookie"
  sleep 0.1
done
# Should show: 200 x5, then 429 x2
```

### Expected Server Logs

**On Startup**:
```json
⚠️  Using in-memory idempotency cache. For production multi-instance deployments, migrate to Redis. See: https://redis.io/docs/manual/patterns/distributed-locks/
⚠️  Using in-memory rate limiter. For production multi-instance deployments, migrate to Redis. See: https://redis.io/docs/manual/patterns/rate-limiting/
```

**On Idempotency Cache Hit**:
```json
{"type":"idempotency","action":"replay","key":"test-dup-123","sku":"RING-READY-001","message":"Returning cached response for duplicate request"}
```

**On Rate Limit Denial**:
```json
{"type":"ratelimit","action":"deny","key":"192.168.1.100","tokens":"0.20","retryAfter":1}
```

## Implementation Notes

### Why In-Memory?
- **MVP/Single-Instance**: Perfect for development and single-server deployments
- **Zero Dependencies**: No Redis setup required
- **Fast**: No network latency
- **Simple**: Easy to debug and test

### Production Migration Path
For multi-instance deployments (load balancers, horizontal scaling):

1. **Idempotency**: Use Redis with `SET NX EX` for distributed locking
2. **Rate Limiting**: Use Redis with sliding window or token bucket pattern
3. **Alternative**: Use a dedicated service like Upstash, CloudFlare, or API Gateway rate limiting

### Configuration
- **Rate Limit**: 5 requests/second per IP (configurable in `tokenBucket.ts`)
- **Idempotency TTL**: 60 seconds (server-side)
- **Client Key Reuse**: 60 seconds (client-side)
- **Cleanup Intervals**:
  - Idempotency: 30 seconds
  - Rate Limiter: 60 seconds

## Security Considerations

1. **IP Spoofing**: Uses `X-Forwarded-For` header (trust proxy configuration)
2. **Cache Poisoning**: Keys are scoped per SKU (prevents cross-SKU replay)
3. **Memory Leaks**: Automatic cleanup prevents unbounded growth
4. **DoS Protection**: Rate limiting provides first line of defense

## Future Enhancements

- [ ] Redis backend for distributed deployments
- [ ] Configurable rate limits per role (admin vs merchandiser)
- [ ] Prometheus metrics export
- [ ] Idempotency key generation on server-side for POST requests
- [ ] Bulk operation idempotency support
- [ ] Rate limit by user ID instead of IP (more accurate for authenticated APIs)

## Files Modified

1. `src/lib/idempotency/cache.ts` (NEW)
2. `src/lib/ratelimit/tokenBucket.ts` (NEW)
3. `src/app/api/admin/products/[sku]/route.ts` (MODIFIED)
4. `src/app/dashboard/products/ProductsTable.tsx` (MODIFIED)

## Verification

✅ TypeScript compilation passes
✅ Idempotency cache logic validated
✅ Rate limiter logic validated  
✅ API route integration complete
✅ Dashboard UI integration complete
✅ Server startup warnings present
✅ Structured logging in place
