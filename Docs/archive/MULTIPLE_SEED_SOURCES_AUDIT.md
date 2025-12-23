# Multiple Seed Sources Audit Report

**Date**: January 15, 2025  
**Issue**: Products displaying without titles (showing `null` or `undefined`)  
**Root Cause**: Multiple seed scripts using different field names (`title` vs `name`)

---

## 🔍 Problem Discovered

**Symptom**: Widget shows products with missing titles:
- Product 1: "Minimalist Band Ring" ✅
- Product 2: (no title displayed) ❌

**API Response**:
```json
{
  "title": "Minimalist Band Ring",
  "name": null,
  "sku": "GIFT-UNDER-300-001"
}
{
  "title": null,
  "name": "Minimalist Band Ring",
  "sku": "GIFT-SPOT-001"
}
```

---

## 🗃️ MongoDB Data Inconsistency

```
SKU: GIFT-UNDER-300-001
  title: "Minimalist Band Ring"  ✅
  name: undefined
  
SKU: GIFT-SPOT-001
  title: undefined
  name: "Minimalist Band Ring"  ✅
```

---

## 📂 Multiple Seed Sources Found

### Source #1: `scripts/seed-database.js`
**Field Used**: `title`

```javascript
{
  sku: 'GIFT-UNDER-300-001',
  title: 'Minimalist Band Ring',  // ✅ Uses 'title'
  price: 299,
  category: 'ring',
  // ...
}
```

### Source #2: `scripts/seed-unified-products.js`
**Field Used**: `name`

```javascript
{
  sku: 'GIFT-SPOT-001',
  name: 'Minimalist Band Ring',  // ❌ Uses 'name'
  category: 'ring',
  price: 299,
  // ...
}
```

---

## 🧩 API Data Flow

### Widget API Chain:
```
1. Widget → POST /api/support/products
   ↓
2. /api/support/products/route.ts → fetchProducts()
   ↓
3. services.ts → normalizeFilters() → provider
   ↓
4. localDbProvider → MongoDB query
   ↓
5. map() function transforms document
   ↓
6. Returns: { title: doc.title || doc.name }
```

### Current Mapping (Already Fixed):
```typescript
// src/lib/concierge/providers/localdb.ts
function map(doc: any): Product {
  return {
    id: doc.sku ?? doc._id?.toString(),
    title: doc.title || doc.name || 'Untitled Product',  // ✅ Fallback added
    price: doc.price,
    imageUrl: doc.imageUrl || doc.image,  // ✅ Fallback added
    // ...
  };
}
```

---

## 📊 All Seed Scripts Analysis

| Script | Purpose | Field for Title | Field for Image |
|--------|---------|----------------|-----------------|
| `seed-database.js` | Widget products | `title` | `imageUrl` |
| `seed-unified-products.js` | Homepage/Catalog | `name` | `imageUrl`, `media.primary`, `images.primary` |
| `seed-products.js` | Legacy? | Unknown | Unknown |
| `seed-mock-orders.js` | Order data | N/A | N/A |
| `seed-creators.js` | Creator users | N/A | N/A |
| `seed-admin-user.js` | Admin users | N/A | N/A |

---

## 🎯 Root Cause Summary

### Why Multiple Field Names?

1. **`seed-database.js`** (Widget-focused):
   - Uses simple schema: `title`, `imageUrl`, `price`
   - Created for widget product recommendations
   - Lightweight fields

2. **`seed-unified-products.js`** (Homepage/Catalog-focused):
   - Uses comprehensive schema: `name`, `media`, `images`, `pricing`, `metadata`
   - Created for homepage hero sections and catalog listings
   - Enterprise-level fields

3. **No Unified Schema**:
   - Two different teams/phases of development
   - No single source of truth
   - Inconsistent field naming conventions

---

## ✅ Current Status (COMPLETELY FIXED)

### Fix #1: MongoDB Projection ✅
```typescript
// src/lib/concierge/providers/localdb.ts (Line 49)
projection: { sku:1, title:1, name:1, price:1, currency:1, imageUrl:1, image:1, ... }
//                          ^^^^^ Added 'name' to projection
```

### Fix #2: Provider Mapping ✅
```typescript
// src/lib/concierge/providers/localdb.ts (Line 9)
title: doc.title || doc.name || 'Untitled Product',
imageUrl: doc.imageUrl || doc.image,
```

### Fix #3: Response Normalization ✅
```typescript
// src/lib/concierge/intent/normalizer.ts (Lines 124-129)
const title = typeof product.title === 'string' && product.title.length > 0
  ? product.title
  : typeof product.name === 'string' && product.name.length > 0
    ? product.name
    : 'Untitled Product'
```

**Result**: Widget now displays ALL product titles correctly! 🎉

---

## 🔧 Recommended Solutions

### Option A: **Data Normalization** (Recommended)
**Fix the data at the source**

**Pros**:
- ✅ Clean, consistent database
- ✅ Predictable queries
- ✅ No runtime fallbacks needed
- ✅ Better performance

**Cons**:
- Requires database migration
- Need to update all seed scripts

**Implementation**:
1. Choose canonical field name (`title` or `name`)
2. Update `seed-unified-products.js` to use `title`
3. Create migration script to normalize existing data
4. Deprecate fallback logic after migration

---

### Option B: **Keep Current Fallback** (Quick Fix - Already Done)
**Runtime mapping handles inconsistency**

**Pros**:
- ✅ Already implemented
- ✅ Works immediately
- ✅ No data migration needed
- ✅ Backward compatible

**Cons**:
- ❌ Technical debt remains
- ❌ Multiple field names in database
- ❌ Confusing for developers
- ❌ Slight performance overhead

**Current Status**: This is already in place and working!

---

### Option C: **Unified Seed Script** (Long-term)
**Single source of truth for all data**

**Pros**:
- ✅ One script to rule them all
- ✅ Consistent schema
- ✅ Easier maintenance
- ✅ Clear ownership

**Cons**:
- Requires refactoring existing scripts
- Need to merge schemas carefully
- Migration path for existing data

---

## 🚀 Recommended Action Plan

### Immediate (Already Done ✅):
- ✅ Fallback logic in `localdb.ts` handles both `title` and `name`
- ✅ Widget displays correctly

### Short-term (Recommended):
1. **Standardize on `title`** field for all products
2. Update `seed-unified-products.js`:
   ```javascript
   {
     sku: 'GIFT-SPOT-001',
     title: 'Minimalist Band Ring',  // Change from 'name'
     name: 'Minimalist Band Ring',   // Keep for backward compat
     // ...
   }
   ```
3. Add both fields during transition period
4. Create data migration script

### Long-term:
1. Merge `seed-database.js` and `seed-unified-products.js` into one
2. Define canonical schema
3. Remove fallback logic once data is clean
4. Add schema validation

---

## 📝 Data Migration Script (Optional)

```javascript
// scripts/normalize-product-titles.js
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('glowglitch').collection('products');

  // Normalize: if 'name' exists but 'title' doesn't, copy name → title
  const result = await col.updateMany(
    { name: { $exists: true }, title: { $exists: false } },
    [{ $set: { title: '$name' } }]
  );
  
  console.log(`✅ Normalized ${result.modifiedCount} products`);
  
  await client.close();
}

main().catch(console.error);
```

---

## 🎯 Summary

| Item | Status |
|------|--------|
| **Problem**: Products missing titles | ✅ Fixed (fallback logic) |
| **Root Cause**: Multiple seed scripts | 🟡 Identified |
| **Data Consistency**: Inconsistent schema | ⚠️ Needs normalization |
| **Widget Display**: Now working | ✅ Fixed |
| **Recommendation**: Standardize on `title` | 📋 Pending |

---

## 📌 Key Takeaways

1. **Two Active Seed Scripts**:
   - `seed-database.js` → Widget products (`title`)
   - `seed-unified-products.js` → Homepage/Catalog (`name`)

2. **Code Already Handles This**:
   - Fallback: `doc.title || doc.name || 'Untitled Product'`
   - Widget displays correctly now ✅

3. **Next Steps**:
   - Decide: Keep fallback OR migrate data?
   - Standardize field naming conventions
   - Consider merging seed scripts

---

**Report By**: Database Schema Auditor  
**Status**: ✅ Widget Fixed, 🟡 Data Normalization Pending  
**Priority**: Low (working workaround in place)

