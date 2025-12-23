# Unified Seed Script Implementation Plan

**Option Selected**: Option 2 - Unified Seed Script  
**Role**: @Agent_DatabaseSpecialist  
**Date**: January 15, 2025  
**Estimated Time**: 2-3 hours

---

## Overview

Create a single, comprehensive seed script that populates MongoDB with products containing:
- ✅ Widget fields (`featuredInWidget`, `readyToShip`, `tags`, `badges`)
- ✅ Homepage fields (`metadata.displaySlots`, `accentTone`, `tagline`)
- ✅ Catalog fields (`media`, `pricing`, `seo`, `materials`)
- ✅ Image paths (pointing to actual `/images/category/*` files)

---

## Implementation Steps

### Step 1: Define Unified Product Schema (15 min)

Create TypeScript interface that encompasses all needs:
- Widget requirements
- Homepage requirements  
- Catalog requirements
- Future extensibility

### Step 2: Create Unified Seed Script (45 min)

Write `scripts/seed-unified-products.js` with:
- 10-15 comprehensive product definitions
- All required fields for widget + homepage + catalog
- Proper image paths to existing category images
- Sensible defaults and variety

### Step 3: Seed Sample Products (30 min)

Products to include:
- 3-4 rings (various price points, styles)
- 2-3 earrings
- 2-3 necklaces
- 1-2 bracelets
- Mix of ready-to-ship and made-to-order
- Range from $299 to $3850 (covers "Gifts under $300" filter)

### Step 4: Add Indexes & Validation (20 min)

Create MongoDB indexes for:
- `featuredInWidget` (widget queries)
- `metadata.displaySlots.collectionOrder` (homepage hero)
- `metadata.displaySlots.spotlightOrder` (homepage spotlight)
- `readyToShip`, `tags`, `category` (filtering)

### Step 5: Test & Verify (30 min)

Verify:
- Widget queries return products
- Homepage queries return products
- Images load correctly
- Filters work (price, category, etc.)
- No fallback to static content

### Step 6: Documentation (20 min)

Update:
- `Agent/data-seed-status.md`
- README with new seed command
- Schema documentation

---

## Product Schema Design

```typescript
interface UnifiedProduct {
  // Core Identity
  sku: string                    // Unique identifier
  name: string                   // Display name
  category: string               // ring, necklace, earring, bracelet
  
  // Pricing
  price: number                  // Widget uses this
  pricing?: {                    // Catalog uses this
    basePrice: number
    currency: string
  }
  
  // Images
  imageUrl: string               // Widget primary field
  media?: {                      // Catalog uses this
    primary: string
    gallery?: string[]
  }
  
  // Widget-Specific
  readyToShip: boolean
  featuredInWidget: boolean
  tags: string[]
  badges?: string[]
  shippingPromise?: string
  
  // Homepage-Specific
  metadata: {
    displaySlots?: {
      collectionOrder?: number   // 1-3 for hero section
      spotlightOrder?: number    // 1-6 for spotlight
    }
    accentTone: 'volt' | 'cyan' | 'magenta' | 'lime'
    tagline?: string
    featured?: boolean
    readyToShip?: boolean
    primaryMetal?: string
    limitedDrop?: boolean
  }
  
  // Catalog-Specific
  description?: string
  seo?: {
    slug: string
  }
  materials?: Array<{name: string}>
  gemstones?: Array<{name: string}>
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

---

## Sample Product Data

### Product 1: Solaris Halo Ring (Featured Everywhere)
```javascript
{
  sku: 'RING-READY-001',
  name: 'Solaris Halo Ring',
  category: 'ring',
  price: 1299,
  pricing: { basePrice: 1299, currency: 'USD' },
  
  imageUrl: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
  media: {
    primary: '/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg',
    gallery: ['/images/category/rings/16023_RND_0075CT_Y_1_1600X1600.jpg']
  },
  
  readyToShip: true,
  featuredInWidget: true,
  tags: ['ready-to-ship', 'rings', 'engagement', 'halo', 'bestseller'],
  badges: ['Bestseller', 'Ready to Ship'],
  shippingPromise: 'Ships in 24h',
  
  metadata: {
    displaySlots: {
      collectionOrder: 1,
      spotlightOrder: 1
    },
    accentTone: 'volt',
    tagline: 'Lab diamond halo with coral glow pavé',
    featured: true,
    readyToShip: true,
    primaryMetal: '14k Yellow Gold',
    limitedDrop: false
  },
  
  description: 'A stunning halo ring featuring lab-grown diamonds...',
  seo: { slug: 'solaris-halo-ring' },
  materials: [{ name: '14k Yellow Gold' }, { name: 'Lab Diamond' }],
  
  createdAt: new Date(),
  updatedAt: new Date()
}
```

---

## Migration Strategy

### Phase A: Backup Current Data
```bash
mongodump --uri="mongodb://localhost:27017/glowglitch" --out=backup/$(date +%Y%m%d)
```

### Phase B: Run Unified Seed
```bash
node scripts/seed-unified-products.js
```

### Phase C: Verify Results
```bash
# Widget products
mongosh --eval "db.products.find({featuredInWidget:true}).count()"

# Homepage collection items
mongosh --eval "db.products.find({'metadata.displaySlots.collectionOrder':{$exists:true}}).count()"

# Homepage spotlight items
mongosh --eval "db.products.find({'metadata.displaySlots.spotlightOrder':{$exists:true}}).count()"
```

---

## Success Criteria

- [ ] Script runs without errors
- [ ] 10-15 products seeded
- [ ] Widget queries return 6+ products
- [ ] Homepage collection queries return 3 products
- [ ] Homepage spotlight queries return 6 products
- [ ] All images load (no 404s)
- [ ] Price filters work
- [ ] Category filters work
- [ ] No fallback to static content on homepage
- [ ] Widget continues working
- [ ] Build passes

---

## Rollback Plan

If issues arise:
```bash
# Restore from backup
mongorestore --uri="mongodb://localhost:27017/glowglitch" backup/YYYYMMDD

# Or revert to widget-only seed
node scripts/seed-database.js
```

---

## Timeline

| Task | Duration | Status |
|------|----------|--------|
| Define schema | 15 min | ⏳ Pending |
| Create unified seed script | 45 min | ⏳ Pending |
| Define 10-15 products | 30 min | ⏳ Pending |
| Add indexes | 20 min | ⏳ Pending |
| Test & verify | 30 min | ⏳ Pending |
| Documentation | 20 min | ⏳ Pending |
| **Total** | **2h 40min** | |

---

**Ready to begin implementation**

