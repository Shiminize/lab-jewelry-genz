# Gift Filter & Image Issues - AUDIT REPORT 🔍

**Date**: January 15, 2025  
**Issue**: "Gifts under $300" shows products over $300 and missing images  
**Status**: 🔴 **CRITICAL ISSUES FOUND**

---

## 🔴 Root Cause Analysis

### Issue #1: Price Filter Not Applied (CRITICAL)

**Problem**: Products over $300 are displayed when clicking "Gifts under $300"

**Root Cause Chain**:

#### 1.1 Quick Link Uses Wrong Field
**File**: `src/lib/concierge/types.ts:169`
```typescript
{
  id: 'gifts-under-300',
  intent: 'find_product',
  label: 'Gifts under $300',
  payload: { filters: { priceMax: 300 } },  // ❌ Uses priceMax
}
```

**Issue**: Sets `priceMax: 300` but MongoDB providers don't filter by this field

---

#### 1.2 Normalizer Doesn't Set priceLt
**File**: `src/lib/concierge/intent/normalizer.ts:45-86`
```typescript
export function normalizeFilters(raw: Record<string, unknown> = {}): NormalizedFilters {
  const normalized: NormalizedFilters = {}

  const priceMax = numberCandidates([
    raw.priceMax,
    raw.budgetMax,
    typeof raw.priceBand === 'object' && raw.priceBand !== null 
      ? (raw.priceBand as Record<string, unknown>).max 
      : undefined,
  ])

  // ...

  if (priceMax !== undefined) {
    normalized.priceMax = priceMax  // ✅ Sets priceMax
  }
  
  // ❌ MISSING: Does NOT set priceLt for MongoDB filtering!
}
```

**Issue**: Normalizes `priceMax` but doesn't convert it to `priceLt` for MongoDB

---

#### 1.3 MongoDB Provider Ignores Price Filters
**File**: `src/lib/concierge/providers/localdb.ts:23-44`
```typescript
export const localDbProvider: ConciergeDataProvider = {
  async listProducts(f: ProductFilter) {
    const col = await getCollection('products');
    const and: any[] = [];
    if (f.category) and.push({ category: f.category });
    if (typeof f.readyToShip === 'boolean') and.push({ readyToShip: f.readyToShip });
    if (f.tags?.length) and.push({ tags: { $all: f.tags } });
    // ...
    
    // ❌ MISSING: No price filtering at all!
    // Should have:
    // if (f.priceLt) and.push({ price: { $lt: f.priceLt } });
    
    const query = and.length ? { $and: and } : {};
    const cur = col.find(query, { ... });
    const docs = await cur.toArray();
    return docs.map(map);
  },
};
```

**Issue**: `localDbProvider` doesn't filter by price at all!

---

#### 1.4 Catalog Provider Has Wrong Filter Field
**File**: `src/lib/concierge/catalogProvider.ts:84-86`
```typescript
if (filters.priceBand?.max) {
  query.price = { $lte: filters.priceBand.max }  // ❌ Checks priceBand.max
}
```

**Issue**: Checks `filters.priceBand.max` which is not set by the normalizer

---

#### 1.5 Intent Detection Sets priceLt But Only for NLP
**File**: `src/lib/concierge/intentRules.ts:273-282`
```typescript
if (typeof priceMax === 'number') {
  filters.priceMax = priceMax
  filters.priceLt = priceMax // For /api/concierge/products compatibility
}
if (isGiftIntent && !filters.priceLt) {
  const defaultGiftCeiling = Number(process.env.NEXT_PUBLIC_WIDGET_PRICE_GIFT_CEILING || 300)
  filters.priceLt = defaultGiftCeiling
  reasons.push(`gift: applied default ceiling ${defaultGiftCeiling}`)
}
```

**Issue**: This only runs for **natural language** queries, NOT for quick link clicks!

---

### Issue #2: Missing Product Images

**Problem**: Some products show no image (placeholder shown)

**Root Cause**:

#### 2.1 MongoDB Documents Missing imageUrl
**Evidence**: From screenshot, products show "GlowGlitch" placeholder

**Likely Cause**: Some seeded products don't have `imageUrl` field populated

**File**: Database documents in MongoDB

**Example Bad Document**:
```json
{
  "sku": "RING-001",
  "title": null,  // ❌ Also missing title!
  "price": 299,
  "readyToShip": true,
  // ❌ Missing imageUrl field
}
```

---

#### 2.2 Image Mapping Doesn't Fallback Correctly
**File**: `src/lib/concierge/providers/localdb.ts:6-19`
```typescript
function map(doc: any): Product {
  return {
    id: doc.sku ?? doc._id?.toString(),
    title: doc.title,  // ❌ No fallback if null
    price: doc.price,
    currency: doc.currency ?? 'USD',
    imageUrl: doc.imageUrl,  // ❌ No fallback if missing
    category: doc.category,
    readyToShip: !!doc.readyToShip,
    tags: doc.tags ?? [],
    shippingPromise: doc.shippingPromise,
    badges: doc.badges ?? [],
    featuredInWidget: !!doc.featuredInWidget,
  };
}
```

**Issue**: 
- No fallback for missing `imageUrl`
- No fallback for `null` title

---

## 📊 Impact Assessment

### User Impact
- 🔴 **CRITICAL**: Users see products they can't afford (over $300)
- 🔴 **CRITICAL**: Trust issue - "Gifts under $300" is misleading
- 🟡 **MODERATE**: Missing images reduce conversion
- 🟡 **MODERATE**: Missing titles confuse users

### Data Quality Issues
From manual testing:
```bash
curl "http://localhost:3000/api/concierge/products?category=ring&limit=10"
```

**Results**:
- 2 out of 10 rings have `title: null`
- All 10 rings returned regardless of price
- Products range from $299 to $2,499

---

## 🎯 Expected vs Actual Behavior

### Expected Behavior
**User clicks "Gifts under $300"**
1. ✅ Widget shows only products with `price < 300`
2. ✅ All products have valid images
3. ✅ All products have titles

### Actual Behavior
1. ❌ Widget shows ALL products (no price filter)
2. ❌ Some products have missing images
3. ❌ Some products have `null` titles

---

## 🔧 Fix Plan

### Fix #1: Update Quick Link to Use priceLt

**File**: `src/lib/concierge/types.ts:169`

**Change**:
```typescript
// BEFORE:
{
  id: 'gifts-under-300',
  intent: 'find_product',
  label: 'Gifts under $300',
  payload: { filters: { priceMax: 300 } },
}

// AFTER:
{
  id: 'gifts-under-300',
  intent: 'find_product',
  label: 'Gifts under $300',
  payload: { filters: { priceMax: 300, priceLt: 300 } },
}
```

---

### Fix #2: Add priceLt to ProductFilter Interface

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
  priceLt?: number;  // ← ADD THIS
  priceMin?: number;  // ← ADD THIS (if not present)
  priceMax?: number;  // ← ADD THIS (if not present)
};
```

---

### Fix #3: Add Price Filtering to localDbProvider

**File**: `src/lib/concierge/providers/localdb.ts:23-44`

**Add**:
```typescript
export const localDbProvider: ConciergeDataProvider = {
  async listProducts(f: ProductFilter) {
    const col = await getCollection('products');
    const and: any[] = [];
    if (f.category) and.push({ category: f.category });
    if (typeof f.readyToShip === 'boolean') and.push({ readyToShip: f.readyToShip });
    if (f.tags?.length) and.push({ tags: { $all: f.tags } });
    
    // ✅ ADD PRICE FILTERING:
    if (typeof f.priceLt === 'number') {
      and.push({ price: { $lt: f.priceLt } });
    }
    if (typeof f.priceMin === 'number') {
      and.push({ price: { $gte: f.priceMin } });
    }
    if (typeof f.priceMax === 'number' && !f.priceLt) {
      // Use priceMax if priceLt not set (backwards compatibility)
      and.push({ price: { $lte: f.priceMax } });
    }
    
    if (f.q) {
      const rx = new RegExp(f.q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'i');
      and.push({ $or: [{ title: rx }, { category: rx }, { tags: rx }, { description: rx }] });
    }
    // Curated gate for widget-like queries:
    if (f.readyToShip || (f.tags && f.tags.length)) and.push({ featuredInWidget: true });

    const query = and.length ? { $and: and } : {};
    // ...
  },
};
```

---

### Fix #4: Update Normalizer to Set priceLt

**File**: `src/lib/concierge/intent/normalizer.ts:45-86`

**Add**:
```typescript
export interface NormalizedFilters {
  category?: string
  metal?: string
  readyToShip?: boolean
  tags?: string[]
  priceMin?: number
  priceMax?: number
  priceLt?: number  // ← ADD THIS
  limit?: number
  offset?: number
  q?: string
}

export function normalizeFilters(raw: Record<string, unknown> = {}): NormalizedFilters {
  const normalized: NormalizedFilters = {}

  // Price max: Support priceMax, budgetMax, priceBand.max, and priceLt
  const priceMax = numberCandidates([
    raw.priceMax,
    raw.budgetMax,
    raw.priceLt,  // ← ADD THIS
    typeof raw.priceBand === 'object' && raw.priceBand !== null 
      ? (raw.priceBand as Record<string, unknown>).max 
      : undefined,
  ])

  // ...

  if (priceMax !== undefined) {
    normalized.priceMax = priceMax
    normalized.priceLt = priceMax  // ✅ ALSO SET priceLt for MongoDB
  }
  
  return normalized
}
```

---

### Fix #5: Fix Missing Images in Seed Data

**File**: `scripts/seed-database.js` or MongoDB documents

**Action**: Ensure all products have valid `imageUrl` fields

**Example Fix**:
```javascript
// In seed script, ensure imageUrl is populated:
{
  sku: 'RING-001',
  title: 'Minimalist Band Ring',
  price: 299,
  imageUrl: '/images/category/rings/minimalist-band.jpg',  // ✅ Always set
  category: 'ring',
  readyToShip: true,
  // ...
}
```

---

### Fix #6: Add Fallbacks in Mapping Function

**File**: `src/lib/concierge/providers/localdb.ts:6-19`

**Change**:
```typescript
function map(doc: any): Product {
  return {
    id: doc.sku ?? doc._id?.toString(),
    title: doc.title || doc.name || 'Untitled',  // ✅ Fallback for missing title
    price: doc.price,
    currency: doc.currency ?? 'USD',
    imageUrl: doc.imageUrl || doc.image || '/images/placeholder.jpg',  // ✅ Fallback for missing image
    category: doc.category,
    readyToShip: !!doc.readyToShip,
    tags: doc.tags ?? [],
    shippingPromise: doc.shippingPromise,
    badges: doc.badges ?? [],
    featuredInWidget: !!doc.featuredInWidget,
  };
}
```

---

### Fix #7: Update Catalog Provider

**File**: `src/lib/concierge/catalogProvider.ts:84-86`

**Change**:
```typescript
// Support both priceLt and priceMax/priceBand.max
const maxPrice = filters.priceLt ?? filters.priceMax ?? filters.priceBand?.max;
if (maxPrice) {
  query.price = { $lt: maxPrice };  // Use $lt for priceLt, $lte for priceMax
}
if (filters.priceMin) {
  if (query.price) {
    query.price.$gte = filters.priceMin;
  } else {
    query.price = { $gte: filters.priceMin };
  }
}
```

---

## 🧪 Testing Plan

### Test 1: Quick Link Price Filter
```bash
# 1. Start server
npm run dev

# 2. Click "Gifts under $300" in widget

# Expected: All products < $300
# Verify: No products with price >= 300
```

### Test 2: API Endpoint
```bash
curl "http://localhost:3000/api/support/products" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"priceMax":300,"readyToShip":true}'

# Expected: All products have price < 300
```

### Test 3: Natural Language
```bash
# Type in widget: "gifts under $300"

# Expected: All products < $300
```

### Test 4: Image Presence
```bash
curl "http://localhost:3000/api/support/products" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"category":"ring"}' | jq '.[] | {title, imageUrl}'

# Expected: All products have imageUrl
# Expected: All products have title (not null)
```

---

## 📈 Priority

### P0 (Critical - Fix Immediately)
1. ✅ Add price filtering to `localDbProvider`
2. ✅ Update quick link to include `priceLt`
3. ✅ Update normalizer to set `priceLt`

### P1 (High - Fix Soon)
4. ✅ Fix missing images in seed data
5. ✅ Add fallbacks in mapping function
6. ✅ Update `ProductFilter` type

### P2 (Medium - Fix Later)
7. ✅ Update catalog provider for consistency

---

## ✅ Success Criteria

- ✅ "Gifts under $300" shows ONLY products < $300
- ✅ All products have valid images (no placeholders)
- ✅ All products have titles (no "null")
- ✅ Natural language "gifts under $300" also works
- ✅ Backend API correctly filters by price

---

## 🎯 Summary

**Issues Found**:
1. 🔴 Price filter completely missing from MongoDB query
2. 🔴 Quick link uses wrong field (`priceMax` instead of `priceLt`)
3. 🔴 Normalizer doesn't convert `priceMax` to `priceLt`
4. 🟡 Missing images in database
5. 🟡 Missing titles in database
6. 🟡 No fallbacks for missing data

**Root Cause**: Multiple disconnects in the data flow:
- Quick Link → Normalizer → Provider → MongoDB

**Fix Complexity**: Medium (7 files to update)

**Estimated Time**: 30 minutes to implement, 15 minutes to test

---

**Audited By**: Database & Filter Specialist  
**Severity**: 🔴 **CRITICAL**  
**Action Required**: ✅ **IMMEDIATE FIX NEEDED**

