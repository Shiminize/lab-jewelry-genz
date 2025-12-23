# CRITICAL: Price Filter Not Working - Complete Audit

**Date**: January 15, 2025  
**Issue**: "Gifts under $300" returns products over $300  
**Severity**: 🔴 **CRITICAL** - Production Blocker  
**Environment**: MongoDB Atlas (via localDb mode)

---

## 🔴 Confirmed Issue

**Test**:
```bash
curl -X POST "http://localhost:3000/api/support/products" \
  -H "Content-Type: application/json" \
  -d '{"filters":{"priceMax":300}}'
```

**Result**: Returns 24 products, **9 of them over $300**:
- Solaris Halo Ring: $1,299 ❌
- Lumen Pavé Ring: $1,499 ❌
- Nebula Solitaire: $999 ❌
- Aurora Solitaire Ring: $2,499 ❌
- Nebula Custom Ring: $999 ❌
- Coral Sky Studs: $899 ❌
- Lab Diamond Pendant: $1,899 ❌
- Untitled: $1,299 ❌
- Untitled: $899 ❌

---

## 🔍 Root Cause Analysis

### Issue #1: Nested Filters Object Not Flattened

**Widget sends**:
```typescript
{
  "filters": {
    "priceMax": 300
  }
}
```

**services.ts receives and processes**:
```typescript
export async function fetchProducts(filters: Record<string, unknown>) {
  const { sessionId: _sessionId, ...rawFilters } = filters ?? {}
  // rawFilters = { filters: { priceMax: 300 } }  ❌ NESTED!
  
  const normalizedFilters = normalizeFilters(rawFilters)
  // normalizer receives { filters: { priceMax: 300 } }
  // expects { priceMax: 300 }
}
```

**Problem**: The normalizer never sees `priceMax` because it's nested under `filters`!

---

### Issue #2: Normalizer Can't Find Nested priceMax

**File**: `src/lib/concierge/intent/normalizer.ts:49-55`

```typescript
export function normalizeFilters(raw: Record<string, unknown> = {}): NormalizedFilters {
  const normalized: NormalizedFilters = {}

  // Price max: Support priceMax, budgetMax, and priceBand.max
  const priceMax = numberCandidates([
    raw.priceMax,        // ❌ undefined (it's at raw.filters.priceMax)
    raw.budgetMax,       // ❌ undefined
    typeof raw.priceBand === 'object' && raw.priceBand !== null 
      ? (raw.priceBand as Record<string, unknown>).max 
      : undefined,
  ])
  
  // priceMax = undefined ❌
  // So normalized.priceMax never gets set!
}
```

---

### Issue #3: MongoDB Provider Has No Price Filter

**File**: `src/lib/concierge/providers/localdb.ts:23-44`

```typescript
export const localDbProvider: ConciergeDataProvider = {
  async listProducts(f: ProductFilter) {
    const col = await getCollection('products');
    const and: any[] = [];
    if (f.category) and.push({ category: f.category });
    if (typeof f.readyToShip === 'boolean') and.push({ readyToShip: f.readyToShip });
    if (f.tags?.length) and.push({ tags: { $all: f.tags } });
    // ❌ NO PRICE FILTERING!
    // Even if priceLt/priceMax were passed, they're ignored
    
    const query = and.length ? { $and: and } : {};
    const docs = await cur.toArray();
    return docs.map(map);
  },
};
```

**Problem**: Even if the filter made it through, MongoDB query doesn't use it!

---

### Issue #4: Catalog Provider Used Instead

**File**: `src/lib/concierge/services.ts:37-38`

```typescript
const provider = getProductCatalogProvider('localDb')
products = await provider.getProducts(normalizedFilters as Record<string, unknown>)
```

**Which provider is used?**

**File**: `src/lib/concierge/catalogProvider.ts:184-186`

```typescript
case 'localDb':
  return {
    getProducts: (filters) => fetchLocalDbProducts(filters),
  }
```

**fetchLocalDbProducts does**:
```typescript
async function fetchLocalDbProducts(filters: ProductFilters): Promise<Product[]> {
  const normalized = normalizeFilters(filters)
  const mongoResults = await fetchMongoProducts(normalized)
  if (mongoResults && mongoResults.length) {
    return mongoResults  // ← Returns unfiltered results
  }
  // ...
}
```

**fetchMongoProducts does**:
```typescript
async function fetchMongoProducts(filters: NormalizedFilters): Promise<Product[] | null> {
  // ...
  const query: Record<string, unknown> = {}
  if (filters.category) {
    query.category = filters.category
  }
  if (filters.readyToShip !== undefined) {
    query.readyToShip = filters.readyToShip
  }
  if (filters.priceBand?.max) {  // ❌ Checks priceBand.max (not set)
    query.price = { $lte: filters.priceBand.max }
  }
  // ❌ Doesn't check filters.priceMax!
  // ❌ Doesn't check filters.priceLt!
  
  const docs = await collection.find(query).limit(24).toArray()
  return docs  // Returns ALL products, no price filter
}
```

---

## 📊 Complete Data Flow (Current - BROKEN)

```
1. User clicks "Gifts under $300"
   ↓
2. Widget sends POST /api/support/products
   Body: { "filters": { "priceMax": 300 } }
   ↓
3. route.ts calls fetchProducts(body)
   ↓
4. services.ts extracts: { filters: { priceMax: 300 } }
   ↓
5. normalizeFilters({ filters: { priceMax: 300 } })
   Looks for raw.priceMax → undefined ❌
   Result: {}
   ↓
6. getProductCatalogProvider('localDb').getProducts({})
   ↓
7. fetchLocalDbProducts({})
   ↓
8. fetchMongoProducts({})
   ↓
9. MongoDB query: {} (no filters!)
   ↓
10. Returns ALL 24 products ❌
```

---

## 🎯 What Should Happen

```
1. User clicks "Gifts under $300"
   ↓
2. Widget sends: { "filters": { "priceMax": 300 } }
   ↓
3. Flatten to: { "priceMax": 300 }
   ↓
4. Normalize to: { "priceMax": 300, "priceLt": 300 }
   ↓
5. MongoDB query: { price: { $lt: 300 } }
   ↓
6. Return ONLY products < $300 ✅
```

---

## 🔧 Required Fixes

### Fix #1: Flatten Filters in services.ts

**File**: `src/lib/concierge/services.ts:23-25`

**Change**:
```typescript
export async function fetchProducts(filters: Record<string, unknown>) {
  const { sessionId: _sessionId, ...rawFilters } = filters ?? {}
  
  // ✅ FIX: Flatten nested filters object
  const flatFilters = rawFilters.filters && typeof rawFilters.filters === 'object'
    ? { ...rawFilters, ...(rawFilters.filters as Record<string, unknown>) }
    : rawFilters
  
  const normalizedFilters = normalizeFilters(flatFilters)
  // ...
}
```

---

### Fix #2: Add priceLt to normalizer output

**File**: `src/lib/concierge/intent/normalizer.ts:84-86`

**Change**:
```typescript
if (priceMax !== undefined) {
  normalized.priceMax = priceMax
  normalized.priceLt = priceMax  // ✅ ADD: For MongoDB $lt query
}
```

---

### Fix #3: Update NormalizedFilters type

**File**: `src/lib/concierge/intent/normalizer.ts:27-37`

**Add**:
```typescript
export interface NormalizedFilters {
  category?: string
  metal?: string
  readyToShip?: boolean
  tags?: string[]
  priceMin?: number
  priceMax?: number
  priceLt?: number  // ✅ ADD THIS
  limit?: number
  offset?: number
  q?: string
}
```

---

### Fix #4: Add price filtering to fetchMongoProducts

**File**: `src/lib/concierge/catalogProvider.ts:84-86`

**Change**:
```typescript
// Support priceLt (preferred), priceMax, and legacy priceBand.max
const priceCeiling = filters.priceLt ?? filters.priceMax ?? filters.priceBand?.max
if (priceCeiling) {
  query.price = { $lt: priceCeiling }
}

if (filters.priceMin) {
  if (query.price) {
    query.price.$gte = filters.priceMin
  } else {
    query.price = { $gte: filters.priceMin }
  }
}
```

---

### Fix #5: Add price filtering to localDbProvider

**File**: `src/lib/concierge/providers/localdb.ts:23-44`

**Add after line 28**:
```typescript
// ✅ ADD PRICE FILTERING:
if (typeof f.priceLt === 'number') {
  and.push({ price: { $lt: f.priceLt } });
}
if (typeof f.priceMax === 'number' && !f.priceLt) {
  and.push({ price: { $lte: f.priceMax } });
}
if (typeof f.priceMin === 'number') {
  and.push({ price: { $gte: f.priceMin } });
}
```

---

### Fix #6: Update ProductFilter type

**File**: `src/lib/concierge/providers/types.ts`

**Add**:
```typescript
export type ProductFilter = {
  q?: string;
  category?: string;
  readyToShip?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
  priceLt?: number;   // ✅ ADD
  priceMax?: number;  // ✅ ADD
  priceMin?: number;  // ✅ ADD
};
```

---

### Fix #7: Update catalog provider NormalizedFilters type

**File**: `src/lib/concierge/catalogProvider.ts:195-203`

**Change**:
```typescript
export type NormalizedFilters = {
  category?: string
  readyToShip?: boolean
  metal?: string
  priceBand?: { max?: number }
  tags?: string[]
  priceMax?: number
  priceMin?: number
  priceLt?: number  // ✅ ADD
}
```

---

## 🧪 Testing

### Test 1: POST API (Widget behavior)
```bash
curl -X POST "http://localhost:3000/api/support/products" \
  -H "Content-Type: application/json" \
  -d '{"filters":{"priceMax":300}}' | jq '.[] | select(.price >= 300)'

# Expected: NO OUTPUT (no products >= $300)
```

### Test 2: Direct filter
```bash
curl -X POST "http://localhost:3000/api/support/products" \
  -H "Content-Type: application/json" \
  -d '{"priceMax":300}' | jq '.[] | select(.price >= 300)'

# Expected: NO OUTPUT
```

### Test 3: Widget UI
1. Click "Gifts under $300"
2. Verify ALL products shown are < $300

### Test 4: MongoDB Atlas connection
```bash
# Verify using Atlas, not localhost
grep MONGODB_URI .env.local

# Should be: mongodb+srv://... (Atlas)
# Not: mongodb://localhost:... (local)
```

---

## 🚨 MongoDB Atlas vs Localhost

**Current .env.local**:
```
CONCIERGE_DATA_MODE=localDb
MONGODB_URI=mongodb://localhost:27017/glowglitch...
```

**Should be** (for Atlas):
```
CONCIERGE_DATA_MODE=localDb
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/glowglitch?retryWrites=true&w=majority
```

**Note**: You mentioned using MongoDB Atlas, but .env.local points to localhost!

---

## ✅ Priority Order

### P0 - CRITICAL (Blocks production)
1. ✅ Fix #1: Flatten nested filters in services.ts
2. ✅ Fix #4: Add price filtering to fetchMongoProducts
3. ✅ Fix #5: Add price filtering to localDbProvider

### P1 - HIGH (Complete the fix)
4. ✅ Fix #2: Add priceLt to normalizer
5. ✅ Fix #3: Update NormalizedFilters type
6. ✅ Fix #6: Update ProductFilter type
7. ✅ Fix #7: Update catalog NormalizedFilters type

### P2 - VERIFY
8. ✅ Update .env.local to use Atlas URI (if not already)
9. ✅ Test all scenarios
10. ✅ Verify images are populated

---

## 📈 Impact

**Before Fix**:
- 🔴 "Gifts under $300" shows 24 products
- 🔴 9 products (37.5%) are OVER $300
- 🔴 Most expensive: $2,499 (833% over limit!)
- 🔴 User trust destroyed

**After Fix**:
- ✅ Only products < $300 shown
- ✅ User trust maintained
- ✅ Accurate filtering

---

## 🎯 Summary

**Root Causes**:
1. 🔴 Widget sends nested `{filters: {priceMax}}` instead of flat `{priceMax}`
2. 🔴 services.ts doesn't flatten nested filters
3. 🔴 MongoDB queries don't include price filtering
4. 🔴 localDbProvider ignores price fields entirely

**Files to Fix**: 7 files
**Lines to Change**: ~30 lines
**Estimated Time**: 20 minutes to fix, 10 minutes to test
**Severity**: CRITICAL - blocks production launch

---

**Audited By**: Full-Stack Debugging Specialist  
**Status**: 🔴 **PRODUCTION BLOCKER**  
**Action**: ✅ **IMMEDIATE FIX REQUIRED**

