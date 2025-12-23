# Homepage MongoDB Integration Audit Report

**Role**: Database Integration Specialist  
**Date**: January 15, 2025  
**Audit Scope**: Homepage API → MongoDB Connection & Data Sync  
**Environment**: Local Development (localhost:27017)

---

## Executive Summary

**Status**: 🟡 **PARTIAL INTEGRATION - DATA MISMATCH**

The homepage **technically connects to MongoDB** but falls back to hardcoded defaults because the **database schema doesn't match the application's expectations**. This creates a split-brain scenario where:
- ✅ **Widget** uses MongoDB successfully (6 products with `featuredInWidget=true`)
- ❌ **Homepage** queries MongoDB but finds no matching data (0 products with `metadata.displaySlots`)
- ⚠️ **Homepage** silently falls back to static content from `@/content/homepage`

---

## Technical Analysis

### 1. Data Flow Architecture

```
Homepage Component (src/app/page.tsx)
    ↓
getHomepageDisplayData() [src/services/neon/homepageService.ts]
    ↓
getHomepageDisplayEntries() [src/services/neon/catalogRepository.ts]
    ↓
MongoDB Query → { 'metadata.displaySlots.collectionOrder': { $exists: true } }
    ↓
Result: 0 documents found
    ↓
Falls back to: content.featuredProducts (static data)
```

### 2. Database Connection Status

**Connection**: ✅ **ACTIVE**
```
URI: mongodb://localhost:27017/glowglitch
Database: glowglitch
Collection: products
Status: Connected
```

**Products in Database**: **22 total**
- Widget-specific: **6 products** (have `featuredInWidget: true`)
- Homepage-specific: **0 products** (have `metadata.displaySlots`)
- Other: **16 products** (legacy/general catalog items)

### 3. Schema Mismatch

**What Homepage Expects** (from `catalogRepository.ts:221-241`):
```javascript
// Collection items (hero section)
{
  'metadata.displaySlots.collectionOrder': 1,  // EXISTS
  sort: { 'metadata.displaySlots.collectionOrder': 1 }
}

// Spotlight items (featured section)
{
  'metadata.displaySlots.spotlightOrder': 1,   // EXISTS
  sort: { 'metadata.displaySlots.spotlightOrder': 1 }
}
```

**What Database Has** (sample from actual product):
```javascript
{
  metadata: {
    status: 'active',
    featured: true,
    bestseller: false,
    accentTone: 'volt',
    tagline: '...',
    readyToShip: true,
    limitedDrop: false,
    primaryMetal: '...',
    // ❌ NO displaySlots field
  }
}
```

### 4. Current Behavior

**Homepage Query Results**:
```bash
# Collection items query
db.products.find({ 'metadata.displaySlots.collectionOrder': { $exists: true } })
→ 0 results

# Spotlight items query  
db.products.find({ 'metadata.displaySlots.spotlightOrder': { $exists: true } })
→ 0 results
```

**Fallback Mechanism**:
```typescript
// catalogRepository.ts:246-248
if (collectionEntries.length === 0 && spotlightEntries.length === 0) {
  return null  // Triggers fallback to static content
}
```

---

## Root Cause Analysis

### Primary Issue: **Seed Data Schema Mismatch**

**Two Different Seed Scripts**:

1. **Widget Seed** (`scripts/seed-database.js`)
   - Targets: Widget product recommendations
   - Schema:
     ```javascript
     {
       sku, title, price, category, metal,
       imageUrl,
       readyToShip: true,
       tags, shippingPromise, badges,
       featuredInWidget: true  // ✅ Widget field
       // ❌ NO metadata.displaySlots
     }
     ```

2. **Homepage Catalog Seed** (likely `scripts/seed-products.js` or similar)
   - Targets: Catalog/homepage products
   - Schema:
     ```javascript
     {
       name, category, pricing, metadata: {
         status, featured, bestseller,
         accentTone, tagline, readyToShip,
         primaryMetal, sustainability
         // ❌ NO displaySlots
       }
     }
     ```

**Missing**: A seed script that populates `metadata.displaySlots.collectionOrder` and `metadata.displaySlots.spotlightOrder` for homepage integration.

---

## Impact Assessment

### Current State

| Feature | MongoDB Connection | Data Match | Status |
|---------|-------------------|------------|--------|
| Widget | ✅ Connected | ✅ 6 products found | 🟢 **WORKING** |
| Homepage | ✅ Connected | ❌ 0 products found | 🟡 **FALLBACK MODE** |
| Catalog | ✅ Connected | ⚠️ Partial (22 general products) | 🟡 **MIXED** |

### User Experience Impact

**For End Users**: ⚠️ **Medium Priority**
- Homepage **appears to work** (shows static fallback content)
- No visible errors or broken UI
- **But**: Homepage content is **not dynamic** and cannot be managed via database
- **But**: Images may not match (fallback uses placeholder paths)

**For Content Managers**: 🔴 **High Priority**
- Cannot manage homepage collection items via database
- Cannot manage homepage spotlight products via database
- Changes to MongoDB don't reflect on homepage
- Unaware of the fallback mechanism (silent failure)

### Performance Impact

**Current**: 🟡 **Minor Overhead**
- Two unnecessary MongoDB queries on every homepage load
- Queries return 0 results, then fall back to static data
- ~10-20ms wasted per page load

---

## Recommendations

### Option 1: **Add displaySlots to Existing Products** (Quick Fix)

**Approach**: Update existing MongoDB products to include `metadata.displaySlots`

**Pros**:
- ✅ Quick implementation (~30 minutes)
- ✅ Minimal code changes
- ✅ Reuses existing 22 products
- ✅ Homepage immediately becomes dynamic

**Cons**:
- ❌ Manual selection of which products go where
- ❌ Doesn't add new products, just reorganizes existing ones
- ❌ May have schema inconsistencies if products lack required fields

**Implementation**:
```javascript
// New script: scripts/add-homepage-display-slots.js
const products = [
  { sku: 'CHAOS-RING-001', collectionOrder: 1, spotlightOrder: 1 },
  { sku: 'RING-READY-001', collectionOrder: 2, spotlightOrder: 2 },
  { sku: 'EAR-READY-001', collectionOrder: 3, spotlightOrder: 3 },
  // ... up to 6 for spotlight
];

for (const p of products) {
  await db.products.updateOne(
    { sku: p.sku },
    { $set: { 
      'metadata.displaySlots': {
        collectionOrder: p.collectionOrder,
        spotlightOrder: p.spotlightOrder
      }
    }}
  );
}
```

**Timeline**: 30-60 minutes

---

### Option 2: **Create Unified Seed Script** (Recommended)

**Approach**: Merge widget and homepage seed logic into one comprehensive script

**Pros**:
- ✅ Single source of truth for all product data
- ✅ Consistent schema across all products
- ✅ Both widget and homepage work from same dataset
- ✅ Easier to maintain long-term
- ✅ Can add image paths, displaySlots, and featuredInWidget in one pass

**Cons**:
- ❌ More upfront work (~2-3 hours)
- ❌ Requires refactoring existing seed scripts
- ❌ Need to define comprehensive product schema

**Implementation**:
```javascript
// New: scripts/seed-unified-products.js
const products = [
  {
    sku: 'RING-READY-001',
    name: 'Solaris Halo Ring',
    category: 'ring',
    price: 1299,
    imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
    
    // Widget fields
    featuredInWidget: true,
    readyToShip: true,
    tags: ['ready-to-ship', 'rings', 'engagement'],
    badges: ['Bestseller', 'Ready to Ship'],
    
    // Homepage fields
    metadata: {
      displaySlots: {
        collectionOrder: 1,
        spotlightOrder: 1
      },
      accentTone: 'volt',
      tagline: 'Lab diamond halo with coral glow pavé',
      featured: true,
      readyToShip: true,
      primaryMetal: '14k Yellow Gold'
    },
    
    // Catalog fields
    media: {
      primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
      gallery: [...]
    },
    pricing: { basePrice: 1299 },
    seo: { slug: 'solaris-halo-ring' }
  },
  // ... more products
];
```

**Timeline**: 2-3 hours

---

### Option 3: **Keep Separate Seeds + Sync Script** (Most Flexible)

**Approach**: Maintain separate widget/homepage seeds but add a sync script

**Pros**:
- ✅ Widget and homepage can evolve independently
- ✅ Preserves existing widget seed script (no regression risk)
- ✅ Allows different products for different purposes
- ✅ Sync script can run on-demand or scheduled

**Cons**:
- ❌ More complexity (3 scripts instead of 1)
- ❌ Risk of data drift between widget and homepage
- ❌ Need to remember to run sync script after updates

**Implementation**:
```javascript
// New: scripts/sync-widget-to-homepage.js
// Finds widget products and adds displaySlots
const widgetProducts = await db.products.find({ featuredInWidget: true }).toArray();

for (let i = 0; i < widgetProducts.length; i++) {
  await db.products.updateOne(
    { _id: widgetProducts[i]._id },
    { $set: {
      'metadata.displaySlots.spotlightOrder': i + 1,
      'metadata.accentTone': TONES[i % TONES.length]
    }}
  );
}

// Top 3 widget products also go to collection
await db.products.updateMany(
  { sku: { $in: ['RING-READY-001', 'RING-READY-002', 'EAR-READY-001'] } },
  { $set: { 'metadata.displaySlots.collectionOrder': { ... } } }
);
```

**Timeline**: 1-2 hours

---

## Comparison Matrix

| Criteria | Option 1: Add displaySlots | Option 2: Unified Seed | Option 3: Separate + Sync |
|----------|---------------------------|----------------------|--------------------------|
| **Time to Implement** | 30-60 min | 2-3 hours | 1-2 hours |
| **Maintenance Burden** | Low | Very Low | Medium |
| **Flexibility** | Low | Medium | High |
| **Risk of Regression** | Low | Medium | Low |
| **Long-term Scalability** | Poor | Excellent | Good |
| **Data Consistency** | Medium | Excellent | Medium |
| **Recommended for** | Quick demo/POC | Production systems | Multi-team environments |

---

## My Recommendation (as Database Specialist)

### 🎯 **Option 2: Unified Seed Script**

**Reasoning**:

1. **Single Source of Truth**: Eliminates schema drift and duplicate data issues
2. **Future-Proof**: Easy to add new fields (e.g., `metadata.seoTags`, `pricing.tiers`) to all products at once
3. **Developer Experience**: New developers only need to learn one seed format
4. **Audit Trail**: One script to version control, test, and validate
5. **Aligns with @Agent_DatabaseSpecialist mandate**: "Canonical seed management"

**Migration Path**:
1. Create `scripts/seed-unified-products.js` merging widget + homepage schemas
2. Define comprehensive product interface in TypeScript
3. Seed with 10-15 products covering all categories
4. Deprecate `scripts/seed-database.js` (widget-only)
5. Update documentation

**Success Metrics**:
- ✅ Homepage queries return >0 products
- ✅ Widget continues working without changes
- ✅ One `npm run seed` command populates everything
- ✅ All 3 areas (widget, homepage, catalog) use same data

---

## Immediate Actions Required

### Critical (Do Now)

1. **Decide on Option** (1, 2, or 3)
2. **Create Implementation Plan** based on chosen option
3. **Update `Agent/data-seed-status.md`** with findings

### High Priority (This Week)

4. **Implement Chosen Solution**
5. **Verify Homepage Pulls from MongoDB** (not fallback)
6. **Document Schema** for future developers

### Medium Priority (Next Sprint)

7. **Add Validation Script** to catch schema mismatches
8. **Create Database Fixtures** for testing
9. **Set up MongoDB Compass Queries** for QA team

---

## Environment Status

### Local Development ✅

```
MongoDB URI: mongodb://localhost:27017/glowglitch
Connection: ACTIVE
Collections: products (22 docs)
Widget Products: 6
Homepage Products: 0 ❌ (schema mismatch)
```

### Staging/Production ⚠️

**Unknown** - Audit required for:
- Connection string validity
- Seed data deployment strategy
- Schema version deployed
- Fallback behavior in production

---

## Testing Checklist

Before marking this issue as resolved:

- [ ] Homepage queries return >0 products from MongoDB
- [ ] Homepage renders actual database content (not fallback)
- [ ] Widget continues to work (regression test)
- [ ] Images display correctly (not 404s)
- [ ] At least 3 collection items show in hero
- [ ] At least 6 spotlight items show in spotlight section
- [ ] Product data matches expectations (name, price, category)
- [ ] Fallback mechanism still works if MongoDB is down
- [ ] Documentation updated with new schema

---

## Files Requiring Attention

### Code Files
1. `src/services/neon/catalogRepository.ts` - Homepage queries
2. `src/services/neon/homepageService.ts` - Fallback logic
3. `src/app/page.tsx` - Homepage component

### Seed Scripts
4. `scripts/seed-database.js` - Current widget seed
5. `scripts/seed-products.js` - Current catalog seed (if exists)
6. **NEW**: `scripts/seed-unified-products.js` (recommended)

### Documentation
7. `Agent/data-seed-status.md` - Update with audit findings
8. **NEW**: `docs/database/PRODUCT_SCHEMA.md` (recommended)

---

## Next Steps

**Awaiting Decision**:

Choose one of the three options and I will:

1. Create detailed implementation script
2. Define product schema interface
3. Write seed data for 10-15 products
4. Create validation tests
5. Update `Agent/data-seed-status.md`
6. Verify homepage integration

**Estimated Time to Resolution**:
- Option 1: 1 hour total
- Option 2: 4 hours total (recommended)
- Option 3: 2 hours total

---

**Report Prepared By**: Database Integration Specialist  
**Status**: ⏸️ Awaiting decision on Option 1, 2, or 3  
**Priority**: Medium-High (Homepage works but not dynamic)  
**Impact**: Content management, data consistency, maintainability

