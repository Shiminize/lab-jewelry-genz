# Redis Metrics Implementation

## Overview

Implemented a Redis metrics adapter that stores latency samples with rolling window histogram in Redis while maintaining backward compatibility with in-memory logging. The system gracefully falls back to in-memory-only mode when Redis is not available.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Request                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                logMetric()                                  │
│              ├─ In-Memory Buffer (1000 samples)            │
│              ├─ Console.log (JSON)                         │
│              └─ Redis Storage (async, non-blocking)        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Redis Storage                                  │
│              Key: concierge:metrics:YYYY-MM-DD             │
│              Value: List of JSON samples                   │
│              TTL: 7 days                                   │
│              Max: 10,000 samples per day                   │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. **Redis Adapter** (`src/lib/metrics/redisAdapter.ts`)

**Key Features**:
- ✅ **Graceful fallback**: No-op if REDIS_URL not set
- ✅ **Daily partitioning**: `concierge:metrics:YYYY-MM-DD`
- ✅ **Capped lists**: Max 10,000 samples per day
- ✅ **Auto-expiry**: 7-day TTL on keys
- ✅ **Atomic operations**: Redis pipeline for consistency
- ✅ **Error handling**: Silent failures don't impact requests

**Data Structure**:
```typescript
interface MetricSample {
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  latencyMs: number;
  cache?: 'HIT' | 'MISS';
  params?: Record<string, string>;
}
```

**Redis Keys**:
```
concierge:metrics:2025-10-23  → List of JSON samples for Oct 23
concierge:metrics:2025-10-24  → List of JSON samples for Oct 24
...
```

**Storage Operations**:
```typescript
// Store sample (atomic pipeline)
pipeline.lPush(key, JSON.stringify(sample));
pipeline.lTrim(key, 0, 9999); // Keep latest 10K
pipeline.expire(key, 7 * 24 * 60 * 60); // 7 days TTL
await pipeline.exec();
```

### 2. **Enhanced Metrics Logger** (`src/lib/metrics/logger.ts`)

**Before**:
```typescript
export function logMetric(entry: MetricEntry) {
  latencyBuffer.push(entry.latencyMs);
  console.log(JSON.stringify({ type: 'metric', ...entry }));
}
```

**After**:
```typescript
export function logMetric(entry: MetricEntry) {
  // In-memory (unchanged)
  latencyBuffer.push(entry.latencyMs);
  console.log(JSON.stringify({ type: 'metric', ...entry }));
  
  // Redis (new, async, non-blocking)
  redisMetricsAdapter.storeSample(entry).catch(error => {
    // Silent failure - don't impact main request flow
  });
}
```

**Backward Compatibility**: ✅ All existing functionality preserved

### 3. **Metrics API Endpoint** (`src/app/api/metrics/route.ts`)

**Endpoint**: `GET /api/metrics`

**Authentication**: ✅ Admin/Merchandiser only (`assertAdminOrMerch`)

**Query Parameters**:
- `days`: Number of days to look back (1-7, default: 1)
- `source`: Data source (`redis` | `memory` | `both`, default: `both`)

**Response Structure**:
```json
{
  "timestamp": "2025-10-23T22:00:00.000Z",
  "redis": {
    "connected": true,
    "metrics": {
      "totalRequests": 1250,
      "p95LatencyMs": 45,
      "p50LatencyMs": 25,
      "avgLatencyMs": 28.5,
      "cacheHitRate": 0.65,
      "errorRate": 0.02,
      "timeRange": "last 1 day(s)"
    }
  },
  "memory": {
    "metrics": {
      "totalRequests": 150,
      "p95LatencyMs": 42,
      "bufferSize": 150,
      "timeRange": "current session (in-memory)"
    }
  },
  "summary": {
    "primarySource": "redis",
    "p95LatencyMs": 45,
    "totalRequests": 1250,
    "cacheHitRate": 0.65,
    "errorRate": 0.02,
    "timeRange": "last 1 day(s)"
  },
  "config": {
    "daysRequested": 1,
    "sourceRequested": "both"
  }
}
```

## Configuration

### Environment Variables

**Required for Redis**:
```bash
REDIS_URL=redis://localhost:6379
# or
REDIS_URL=redis://user:pass@host:port/db
# or
REDIS_URL=rediss://... # for SSL
```

**Optional (defaults work fine)**:
```bash
# These are hardcoded but could be made configurable
METRICS_MAX_SAMPLES_PER_DAY=10000
METRICS_RETENTION_DAYS=7
```

### Fallback Behavior

**With Redis**:
- ✅ Metrics stored in Redis with 7-day retention
- ✅ Survives server restarts
- ✅ Aggregated statistics across time windows
- ✅ Cache hit rates and error rates tracked

**Without Redis** (REDIS_URL not set):
- ✅ Graceful fallback to in-memory only
- ✅ No errors or warnings (just info log)
- ✅ All existing functionality works
- ❌ Metrics reset on server restart
- ❌ Limited to current session data

## Testing

### Test Script (`scripts/test-redis-metrics.mjs`)

```bash
node scripts/test-redis-metrics.mjs
```

**Tests**:
1. ✅ Generates metrics data (5 API requests)
2. ✅ Verifies auth protection (403 without auth)
3. ✅ Checks Redis connection status
4. ✅ Shows expected response structure

### Manual Testing

#### Without Redis
```bash
# 1. Ensure REDIS_URL not set
unset REDIS_URL

# 2. Restart server
npm run start

# 3. Generate metrics
curl "http://localhost:3000/api/concierge/products?q=test&limit=1"

# 4. Check logs (should show Redis fallback message)
# "REDIS_URL not set. Metrics will not persist across restarts."
```

#### With Redis
```bash
# 1. Set Redis URL
export REDIS_URL="redis://localhost:6379"

# 2. Restart server
npm run start

# 3. Generate metrics
for i in {1..10}; do
  curl "http://localhost:3000/api/concierge/products?q=test$i&limit=1"
done

# 4. Check Redis
redis-cli LLEN concierge:metrics:$(date +%Y-%m-%d)
# Should show ~10 samples

# 5. Check metrics endpoint (with admin auth)
curl -H "Authorization: Bearer admin-token" \
  "http://localhost:3000/api/metrics?days=1"

# 6. Restart server and verify persistence
npm run start
curl -H "Authorization: Bearer admin-token" \
  "http://localhost:3000/api/metrics?days=1"
# Should still show Redis metrics from before restart
```

## Performance Impact

### Storage Overhead
- **Per sample**: ~200 bytes JSON
- **Per day**: ~2MB (10K samples × 200 bytes)
- **Per week**: ~14MB (7 days retention)

### Request Latency
- **Redis write**: Async, non-blocking
- **Impact on API**: ~0ms (fire-and-forget)
- **Fallback**: Silent, no performance impact

### Memory Usage
- **In-memory buffer**: 1000 samples × 8 bytes = 8KB
- **Redis client**: ~1-2MB overhead
- **Total**: Negligible

## Monitoring

### Redis Health
```bash
# Check connection
redis-cli ping

# Check metrics keys
redis-cli KEYS "concierge:metrics:*"

# Check sample count
redis-cli LLEN concierge:metrics:2025-10-23

# Check sample content
redis-cli LRANGE concierge:metrics:2025-10-23 0 2
```

### Application Logs
```bash
# Redis connection status
grep "metrics-redis" server.log

# Sample storage errors
grep "Failed to store sample" server.log

# Metrics collection
grep '"type":"metric"' server.log | tail -5
```

### Metrics Endpoint
```bash
# Check Redis vs memory metrics
curl -H "Auth: admin" "/api/metrics?source=both"

# Historical data
curl -H "Auth: admin" "/api/metrics?days=7"

# Redis-only data
curl -H "Auth: admin" "/api/metrics?source=redis"
```

## Production Considerations

### Redis Setup
- **Persistence**: Enable RDB or AOF for durability
- **Memory**: Allocate ~50MB for metrics (conservative)
- **Network**: Low latency to app servers preferred
- **Clustering**: Single instance sufficient for metrics

### Scaling
- **High traffic**: Consider sampling (store 1 in N requests)
- **Multiple instances**: All instances can write to same Redis
- **Retention**: Adjust TTL based on storage constraints

### Security
- **Redis auth**: Use AUTH if Redis exposed
- **Network**: Keep Redis on private network
- **Endpoint auth**: Admin/merch only (already implemented)

### Monitoring
- **Redis availability**: Monitor connection status
- **Storage growth**: Alert if keys grow unexpectedly
- **API latency**: Ensure Redis writes don't block requests

## Migration Path

### Phase 1: Deploy (Current)
- ✅ Redis adapter deployed
- ✅ Fallback mode active (no Redis required)
- ✅ Metrics endpoint available

### Phase 2: Enable Redis
- [ ] Set REDIS_URL in production
- [ ] Verify Redis connection in logs
- [ ] Monitor storage growth

### Phase 3: Optimize
- [ ] Add sampling for high-traffic endpoints
- [ ] Implement metrics aggregation
- [ ] Add alerting on anomalies

## Files Created/Modified

### Created
1. **`src/lib/metrics/redisAdapter.ts`** - Redis storage adapter
2. **`src/app/api/metrics/route.ts`** - Metrics read endpoint
3. **`scripts/test-redis-metrics.mjs`** - Test script
4. **`docs/REDIS_METRICS_IMPLEMENTATION.md`** - This documentation

### Modified
5. **`src/lib/metrics/logger.ts`** - Added Redis integration
6. **`package.json`** - Added redis dependency

## Rollback Plan

If issues arise:

1. **Disable Redis**: Remove REDIS_URL environment variable
2. **Restart**: Application will fallback to in-memory only
3. **Verify**: Check logs for fallback message
4. **Cleanup**: Optionally remove Redis keys

No code changes needed - fallback is automatic.

---

**Status**: ✅ COMPLETE
**Redis**: ✅ Optional (graceful fallback)
**Auth**: ✅ Admin/merch protected
**Performance**: ✅ Non-blocking async storage
**Testing**: ✅ Verified without Redis
**Ready**: ✅ Production deployment
