# MongoDB Atlas + Admin Dashboard Implementation Inventory

**Purpose**: Comprehensive list of existing documents and components for ChatGPT analysis  
**Goal**: Atlas Cloud migration + Admin UI for product management  
**Date**: January 15, 2025

---

## 📚 EXISTING DOCUMENTATION

### Database & Seeding

1. **`Agent/HOMEPAGE_MONGODB_AUDIT_REPORT.md`** (420 lines)
   - **Content**: Root cause analysis of homepage MongoDB integration
   - **Relevance**: Shows current MongoDB architecture, query patterns, schema design
   - **Key Sections**: Data flow, schema mismatch analysis, 3 resolution options
   - **Use For**: Understanding current MongoDB setup

2. **`Agent/UNIFIED_SEED_COMPLETE.md`** (580+ lines)
   - **Content**: Complete implementation report of unified seed script
   - **Relevance**: Documents current product schema, seeding process, verification
   - **Key Sections**: Product schema, indexes, verification results, migration notes
   - **Use For**: Understanding product data structure

3. **`Agent/data-seed-status.md`** (367 lines)
   - **Content**: Current database sync status, seed versions, outstanding issues
   - **Relevance**: Current state of database, what's deployed, what's pending
   - **Key Sections**: Sync status, seed package versions, validation, escalation log
   - **Use For**: Current production status baseline

4. **`UNIFIED_SEED_IMPLEMENTATION_PLAN.md`** (252 lines)
   - **Content**: Detailed implementation plan for unified seed
   - **Relevance**: Product schema design, migration strategy, success criteria
   - **Key Sections**: Schema definition, sample products, migration phases
   - **Use For**: Product data model reference

### Widget & API Documentation

5. **`WIDGET_DEVELOPER_GUIDE.md`** (499 lines)
   - **Content**: Complete developer guide for the widget system
   - **Relevance**: Widget architecture, data flow, API integration
   - **Key Sections**: Architecture, state management, API routes, troubleshooting
   - **Use For**: Understanding widget-database integration

6. **`WIDGET_QUICK_START.md`** (383 lines)
   - **Content**: Quick start guide for widget development
   - **Relevance**: Testing flows, API endpoints, MongoDB queries
   - **Key Sections**: Testing guides, API references, troubleshooting
   - **Use For**: Widget testing and verification

7. **`IMPLEMENTATION_COMPLETE_SUMMARY.md`** (53 lines)
   - **Content**: Overall project implementation status
   - **Relevance**: High-level view of what's complete
   - **Key Sections**: Phase completion status, next steps
   - **Use For**: Project context

8. **`Docs/Widget_Program/implementation-progress.md`** (269 lines)
   - **Content**: Detailed widget implementation progress tracker
   - **Relevance**: Widget features, API status, testing status
   - **Key Sections**: Feature checklist, API routes, testing progress
   - **Use For**: Widget feature inventory

### Environment & Configuration

9. **`.env.example`**
   - **Content**: Example environment variables
   - **Relevance**: Shows MongoDB connection pattern
   - **Key Variables**: `MONGODB_URI`, `MONGODB_DB`, `CONCIERGE_DATA_MODE`
   - **Use For**: Atlas connection string template

10. **`.env.production.template`**
    - **Content**: Production environment variables template
    - **Relevance**: Production MongoDB configuration
    - **Key Variables**: Production-specific settings
    - **Use For**: Atlas production setup

---

## 🗂️ CODE COMPONENTS

### Database Layer

#### 1. MongoDB Connection

**File**: `src/lib/mongodb.ts`
```typescript
// Core MongoDB connection logic
- getDatabase(): Returns MongoDB database instance
- Handles connection pooling
- Error handling for connection failures
```
**Relevance**: Will need to point to Atlas instead of localhost  
**Changes Needed**: Connection string configuration

#### 2. Catalog Repository

**File**: `src/services/neon/catalogRepository.ts` (259 lines)
```typescript
// Current MongoDB queries
- getCatalogProducts(limit): Fetch products for catalog
- getCatalogProductBySlug(slug): Get single product
- getHomepageDisplayEntries(): Get homepage collection/spotlight
```
**Relevance**: These queries will run against Atlas  
**Key Functions**:
- Line 119: `getCatalogProducts()` - General product listing
- Line 140: `getCatalogProductBySlug()` - Product detail page
- Line 216: `getHomepageDisplayEntries()` - Homepage products (uses `metadata.displaySlots`)

#### 3. Homepage Service

**File**: `src/services/neon/homepageService.ts` (49 lines)
```typescript
// Homepage data aggregation
- getHomepageDisplayData(): Transforms DB data for homepage
- mapEntryToFeaturedProduct(): Maps MongoDB docs to UI format
```
**Relevance**: Handles homepage product display  
**Key Logic**: Falls back to static content if MongoDB returns no results

### Widget Data Layer

#### 4. Widget Providers

**File**: `src/lib/concierge/providers/localdb.ts` (~150 lines)
```typescript
// MongoDB provider for widget
- listProducts(filters): Query products with filters
- Handles: price filtering, category, tags, readyToShip
```
**Relevance**: Widget queries for "Gifts under $300", "Ready to ship"  
**Key Filters**:
- `readyToShip: true`
- `priceMin`, `priceMax` (for "under $300")
- `tags` (for custom filtering)
- `featuredInWidget: true`

**File**: `src/lib/concierge/providers/stub.ts` (~100 lines)
```typescript
// Fallback in-memory data
- Used when MongoDB unavailable
```
**Relevance**: Fallback mechanism for Atlas downtime

**File**: `src/lib/concierge/providers/remote.ts`
```typescript
// Remote API provider (future use)
```

#### 5. Widget Services

**File**: `src/lib/concierge/services.ts` (~200 lines)
```typescript
// Client-side service layer
- fetchProducts(filters): Calls provider based on mode
- Falls back to stub if localDb fails
```
**Relevance**: Entry point for widget product queries

#### 6. Intent Scripts

**File**: `src/lib/concierge/scripts.ts` (~300 lines)
```typescript
// Handles user intents
- executeIntent('find_product', filters): Product search
- Enforces readyToShip: true for widget
- Handles price filtering for "Gifts under $300"
```
**Relevance**: Business logic for auto-screening

### Seeding Scripts

#### 7. Unified Seed Script

**File**: `scripts/seed-unified-products.js` (632 lines)
```javascript
// Comprehensive product seeding
- 10 product definitions with full schema
- Creates indexes for performance
- Built-in verification
```
**Relevance**: Will run against Atlas to populate production data  
**Key Features**:
- Products with `metadata.displaySlots` (homepage)
- Products with `featuredInWidget: true` (widget)
- Products with `price < 300` (auto "Gifts under $300")
- Products with `readyToShip: true`

#### 8. Legacy Seed Scripts

**File**: `scripts/seed-database.js` (deprecated)
**File**: `scripts/seed-products.js` (legacy)

---

## 🎨 UI COMPONENTS

### Homepage Components

#### 1. Hero Section

**File**: `src/components/homepage/HeroSection.tsx`
```typescript
// Displays featured collection items
- Receives collectionItems from MongoDB
- Falls back to static if empty
```
**Relevance**: Shows `metadata.displaySlots.collectionOrder 1-3`

#### 2. Product Cards

**File**: `src/components/ui/ProductCard.tsx`
```typescript
// Reusable product card component
```

### Widget Components

#### 3. Support Widget

**File**: `src/components/support/SupportWidget.tsx` (72 lines)
```typescript
// Main widget orchestrator
- Thin wrapper after strategic rebuild
- Imports WidgetShell, WidgetConversation, WidgetComposer
```

#### 4. Widget Sub-Components

**File**: `src/components/support/Widget/WidgetShell.tsx`
**File**: `src/components/support/Widget/WidgetConversation.tsx`
**File**: `src/components/support/Widget/WidgetComposer.tsx`

#### 5. Product Carousel

**File**: `src/components/support/modules/ProductCarousel.tsx`
```typescript
// Displays widget product recommendations
- Shows products from MongoDB
- "Save to shortlist" button
- Handles empty state
```
**Relevance**: Renders "Gifts under $300", "Ready to ship" results

### Dashboard Components (EXISTING)

#### 6. Dashboard Layout

**File**: `src/app/dashboard/layout.tsx`
```typescript
// Dashboard shell with navigation
```

#### 7. Existing Dashboard Pages

**File**: `src/app/dashboard/orders/page.tsx`
**File**: `src/app/dashboard/analytics/page.tsx`
**File**: `src/app/dashboard/support/page.tsx`

**Relevance**: Can extend with `/dashboard/products` page

---

## 🔌 API ROUTES

### Support/Widget APIs

#### 1. Product Search API

**File**: `src/app/api/support/products/route.ts`
```typescript
// POST /api/support/products
// Handles widget product queries with filters
```
**Relevance**: Main API for widget product recommendations

#### 2. Widget Support APIs

**File**: `src/app/api/support/shortlist/route.ts` - Save products
**File**: `src/app/api/support/order-status/route.ts` - Track orders
**File**: `src/app/api/support/returns/route.ts` - Returns flow

### Dashboard APIs (EXISTING)

#### 3. Admin APIs

**File**: `src/app/api/dashboard/support/tickets/route.ts`
**File**: `src/app/api/dashboard/analytics/concierge/route.ts`

**Relevance**: Pattern to follow for new product admin APIs

---

## 📊 DATA MODELS & TYPES

### Product Schema

#### 1. Type Definitions

**File**: `src/lib/concierge/types.ts`
```typescript
// Current widget types
- ConciergeIntent
- ProductFilterPayload
- WidgetMessage, WidgetSession
```

**File**: `src/lib/concierge/providers/types.ts`
```typescript
// Product interface
interface Product {
  id: string
  title?: string
  name?: string
  price: number
  category?: string
  image?: string
  tags?: string[]
  readyToShip?: boolean
  // ... more fields
}
```

### Current Product Schema (MongoDB)

**From**: `scripts/seed-unified-products.js`

```javascript
{
  // Core Identity
  sku: string,               // e.g., "RING-HERO-001"
  name: string,              // e.g., "Solaris Halo Ring"
  category: string,          // "ring", "necklace", "earring", "bracelet"
  
  // Pricing
  price: number,             // e.g., 1299 (widget uses this)
  pricing: {
    basePrice: number,
    currency: string
  },
  
  // Images
  imageUrl: string,          // Widget primary field
  media: {
    primary: string,
    gallery: string[]
  },
  images: {                  // Catalog uses this
    primary: string,
    gallery: string[]
  },
  
  // Widget-Specific
  readyToShip: boolean,      // 🎯 For "Ready to ship" filter
  featuredInWidget: boolean, // 🎯 For widget visibility
  tags: string[],            // e.g., ["ready-to-ship", "rings", "engagement"]
  badges: string[],          // e.g., ["Bestseller", "Ready to Ship"]
  shippingPromise: string,   // e.g., "Ships in 24h"
  
  // Homepage-Specific
  metadata: {
    displaySlots: {
      collectionOrder: number,   // 🎯 1-3 for hero section
      spotlightOrder: number     // 🎯 1-6 for spotlight
    },
    accentTone: 'volt' | 'cyan' | 'magenta' | 'lime',
    tagline: string,
    featured: boolean,
    readyToShip: boolean,
    primaryMetal: string,
    limitedDrop: boolean,
    status: string,
    bestseller: boolean
  },
  
  // Catalog-Specific
  description: string,
  seo: {
    slug: string
  },
  materials: Array<{name: string}>,
  gemstones: Array<{name: string}>,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 KEY BUSINESS LOGIC

### Auto-Screening Logic

#### 1. "Gifts under $300"

**Location**: `src/lib/concierge/providers/localdb.ts`
```typescript
// Line ~80
if (filters.priceMax) {
  query.price = { $lte: filters.priceMax }
}
```

**Intent Handler**: `src/lib/concierge/intentRules.ts`
```typescript
// Maps "/gift" command to priceMax: 300
{
  label: 'Gifts under $300',
  intent: 'find_product',
  payload: { priceMax: 300 }
}
```

**Result**: Any product with `price < 300` AND `readyToShip: true` auto-appears

#### 2. "Ready to Ship"

**Location**: `src/lib/concierge/providers/localdb.ts`
```typescript
// Enforced filter
if (filters.readyToShip !== false) {
  query.readyToShip = true
}
```

**Result**: Widget ONLY shows products with `readyToShip: true`

#### 3. Homepage Collection/Spotlight

**Location**: `src/services/neon/catalogRepository.ts`
```typescript
// Line 221-230: Collection items
db.products.find({
  'metadata.displaySlots.collectionOrder': { $exists: true }
}).sort({ 'metadata.displaySlots.collectionOrder': 1 }).limit(3)

// Line 232-241: Spotlight items
db.products.find({
  'metadata.displaySlots.spotlightOrder': { $exists: true }
}).sort({ 'metadata.displaySlots.spotlightOrder': 1 }).limit(6)
```

**Result**: Homepage auto-pulls products with `displaySlots` set

---

## 🔧 CONFIGURATION FILES

### 1. Next.js Config

**File**: `next.config.js`
- Image domains configuration (for Atlas-hosted images if needed)
- API route configuration

### 2. Package Scripts

**File**: `package.json`
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    // 🎯 WILL ADD: "seed:unified": "node scripts/seed-unified-products.js"
  }
}
```

### 3. TypeScript Config

**File**: `tsconfig.json`
- Path aliases (@/components, @/lib, etc.)

---

## 🚀 DEPLOYMENT CONTEXT

### Current Environment

**Local Development:**
```bash
MONGODB_URI=mongodb://localhost:27017/glowglitch
MONGODB_DB=glowglitch
CONCIERGE_DATA_MODE=localDb
```

**Status:**
- ✅ Homepage pulls from MongoDB (3 collection + 6 spotlight)
- ✅ Widget pulls from MongoDB (12 products)
- ✅ Auto-screening works ("Gifts under $300", "Ready to ship")
- ✅ Images load correctly

### Target Production Environment

**MongoDB Atlas:**
```bash
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/glowglitch?retryWrites=true&w=majority
MONGODB_DB=glowglitch
CONCIERGE_DATA_MODE=localDb
```

**Requirements:**
- ✅ Same auto-screening behavior
- ✅ Content managers can edit products
- ✅ No code changes for content updates

---

## 📋 WHAT'S MISSING (To Be Built)

### Admin Dashboard Components (NEW)

1. **`src/app/dashboard/products/page.tsx`** (NEW)
   - Product list view with checkboxes
   - Search, filter, sort functionality

2. **`src/app/dashboard/products/[id]/edit/page.tsx`** (NEW)
   - Individual product editor

3. **`src/components/dashboard/ProductTable.tsx`** (NEW)
   - Reusable product table component

4. **`src/components/dashboard/ProductEditForm.tsx`** (NEW)
   - Product editing form

### Admin API Routes (NEW)

5. **`src/app/api/admin/products/route.ts`** (NEW)
   - GET: List all products
   - POST: Create new product

6. **`src/app/api/admin/products/[id]/route.ts`** (NEW)
   - GET: Get single product
   - PATCH: Update product flags
   - DELETE: Delete product

7. **`src/app/api/admin/products/bulk-update/route.ts`** (NEW)
   - POST: Bulk update multiple products

### Authentication (EXISTING - MAY NEED EXTENSION)

8. **`src/lib/auth/`** (EXISTS)
   - May need role-based access control (RBAC)
   - Admin-only middleware for `/dashboard/products`

---

## 🔍 DEPENDENCIES

### Current Package Dependencies

**From**: `package.json`

**Database:**
- `mongodb`: ^6.x (MongoDB driver)

**Framework:**
- `next`: 15.x
- `react`: 19.x

**UI:**
- `tailwindcss`
- `lucide-react` (icons)

**Validation:**
- `zod` (schema validation)

**Will Need (Potentially):**
- `@tanstack/react-table` (for admin product table)
- `react-hook-form` (for product edit form)
- `@dnd-kit/core` (for drag-drop homepage reordering)

---

## 📈 PERFORMANCE CONSIDERATIONS

### Current Indexes (MongoDB)

**From**: `scripts/seed-unified-products.js`

```javascript
[
  { sku: 1 },  // unique
  { category: 1, readyToShip: 1 },
  { tags: 1 },
  { featuredInWidget: 1 },
  { 'metadata.displaySlots.collectionOrder': 1 },  // 🎯 Homepage hero
  { 'metadata.displaySlots.spotlightOrder': 1 },   // 🎯 Homepage spotlight
  { 'metadata.featured': 1 },
  { readyToShip: 1, featuredInWidget: 1 },
  { 'seo.slug': 1 }
]
```

**Will Need for Admin:**
- Compound index on `{ updatedAt: -1 }` (for "recently updated" sorting)
- Text index on `{ name: 'text', description: 'text' }` (for search)

---

## 🧪 TESTING INFRASTRUCTURE

### Existing Tests

**Widget Tests:**
- `tests/smoke/customizer-viewer-smoke.spec.ts`
- `tests/visual/homepage-hero.spec.ts`

**Relevance**: Need to verify Atlas migration doesn't break tests

### Will Need (New Tests)

- Admin dashboard E2E tests
- Product CRUD API tests
- Atlas connection tests

---

## 📖 DOCUMENTATION TO REFERENCE

### For MongoDB Atlas Setup

1. **`Agent/HOMEPAGE_MONGODB_AUDIT_REPORT.md`**
   - Section: "Database Connection Status"
   - Section: "Schema Mismatch"

2. **`Agent/UNIFIED_SEED_COMPLETE.md`**
   - Section: "Migration Strategy"
   - Section: "Rollback Procedure"

### For Admin Dashboard Design

3. **`WIDGET_DEVELOPER_GUIDE.md`**
   - Section: "Architecture Overview"
   - Section: "State Management"

4. **`src/app/dashboard/*/page.tsx`** (existing dashboards)
   - For UI patterns and auth patterns

### For Product Schema

5. **`scripts/seed-unified-products.js`**
   - Lines 1-632: Complete product schema reference

6. **`src/lib/concierge/providers/types.ts`**
   - TypeScript type definitions

---

## 🎯 IMPLEMENTATION PRIORITIES

### Phase 1: Atlas Migration (IMMEDIATE)

**References:**
- `Agent/UNIFIED_SEED_COMPLETE.md` → Migration notes
- `scripts/seed-unified-products.js` → Seed script to run on Atlas
- `.env.production.template` → Atlas connection string template

**Deliverables:**
1. MongoDB Atlas cluster created
2. `seed-unified-products.js` run on Atlas
3. Production `.env` updated with Atlas URI
4. Verification: Homepage + Widget work with Atlas

### Phase 2: Admin Dashboard (NEXT SPRINT)

**References:**
- `src/app/dashboard/*/page.tsx` → Existing dashboard patterns
- `src/app/api/dashboard/*/route.ts` → Existing API patterns
- `src/lib/concierge/providers/types.ts` → Product type definition

**Deliverables:**
1. `/dashboard/products` page
2. Product list with checkboxes
3. PATCH API to update product flags
4. Authentication/authorization

### Phase 3: Advanced Features (FUTURE)

**References:**
- Widget carousel for preview
- Homepage components for preview

**Deliverables:**
1. Bulk operations
2. Preview mode
3. Drag-drop reordering
4. Audit logging

---

## 📊 CURRENT STATUS SUMMARY

### ✅ What Works

- Local MongoDB with 32 products
- Homepage pulls 3 collection + 6 spotlight from DB
- Widget shows 12 products from DB
- Auto-screening for "Gifts under $300" (price < 300)
- Auto-screening for "Ready to ship" (readyToShip: true)
- Images load correctly from `/images/category/`

### ⏳ What's Pending

- MongoDB Atlas migration
- Admin dashboard UI
- Product management API
- Staging environment setup

### ❌ What's Missing

- Cloud database (still localhost)
- Non-technical UI for product management
- Bulk operations
- Audit trail

---

## 🔑 KEY FILES FOR CHATGPT ANALYSIS

### Critical Documents (Read First)

1. **`Agent/UNIFIED_SEED_COMPLETE.md`** - Implementation status, schema
2. **`scripts/seed-unified-products.js`** - Complete product data model
3. **`src/services/neon/catalogRepository.ts`** - MongoDB query patterns
4. **`src/lib/concierge/providers/localdb.ts`** - Widget filtering logic
5. **`.env.example`** - Environment configuration pattern

### Secondary References

6. **`WIDGET_DEVELOPER_GUIDE.md`** - Architecture overview
7. **`Agent/HOMEPAGE_MONGODB_AUDIT_REPORT.md`** - Database architecture
8. **`src/app/dashboard/*/page.tsx`** - Existing admin UI patterns

---

## 💡 QUESTIONS FOR CHATGPT TO ANSWER

### Atlas Migration

1. What's the step-by-step Atlas cluster setup?
2. How to migrate local MongoDB data to Atlas?
3. How to update connection strings securely?
4. How to verify the migration?

### Admin Dashboard

5. What components to build first (MVP)?
6. How to structure the product table UI?
7. What API routes are needed?
8. How to handle authentication for admin routes?
9. How to implement bulk operations?
10. How to add preview functionality?

### Auto-Screening

11. Is the current auto-screening logic production-ready?
12. Do we need additional indexes for performance?
13. How to handle edge cases (e.g., product exactly $300)?

### Deployment

14. What's the deployment checklist?
15. How to handle rollback if Atlas fails?
16. What monitoring/alerts to set up?

---

## 📁 FILE TREE REFERENCE

```
GenZJewelry_AUG_12/
├── Agent/
│   ├── HOMEPAGE_MONGODB_AUDIT_REPORT.md          ← Database architecture
│   ├── UNIFIED_SEED_COMPLETE.md                  ← Implementation status
│   ├── data-seed-status.md                       ← Current sync status
│   └── Agent_DatabaseSpecialist.md               ← Role definition
├── scripts/
│   ├── seed-unified-products.js                  ← Main seed script ⭐
│   ├── seed-database.js                          ← (deprecated)
│   └── seed-products.js                          ← (legacy)
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                        ← Dashboard shell
│   │   │   ├── orders/page.tsx                   ← Example dashboard
│   │   │   ├── analytics/page.tsx                ← Example dashboard
│   │   │   └── products/                         ← NEW (to be built)
│   │   ├── api/
│   │   │   ├── support/products/route.ts         ← Widget product API ⭐
│   │   │   ├── dashboard/*/route.ts              ← Existing admin APIs
│   │   │   └── admin/products/                   ← NEW (to be built)
│   │   └── page.tsx                              ← Homepage
│   ├── components/
│   │   ├── homepage/
│   │   │   └── HeroSection.tsx                   ← Uses displaySlots
│   │   ├── support/
│   │   │   ├── SupportWidget.tsx                 ← Widget orchestrator
│   │   │   ├── Widget/*.tsx                      ← Sub-components
│   │   │   └── modules/ProductCarousel.tsx       ← Shows products
│   │   └── dashboard/                            ← NEW (to be built)
│   ├── lib/
│   │   ├── mongodb.ts                            ← MongoDB connection ⭐
│   │   ├── concierge/
│   │   │   ├── providers/
│   │   │   │   ├── localdb.ts                    ← MongoDB queries ⭐
│   │   │   │   ├── stub.ts                       ← Fallback data
│   │   │   │   └── types.ts                      ← Product types
│   │   │   ├── services.ts                       ← Service layer
│   │   │   ├── scripts.ts                        ← Intent handlers
│   │   │   └── intentRules.ts                    ← Filter rules ⭐
│   │   └── auth/                                 ← Auth utilities
│   └── services/
│       └── neon/
│           ├── catalogRepository.ts              ← MongoDB queries ⭐
│           └── homepageService.ts                ← Homepage data
├── Docs/
│   └── Widget_Program/
│       └── implementation-progress.md            ← Feature tracker
├── .env.example                                  ← Env template
├── .env.production.template                      ← Production env
├── WIDGET_DEVELOPER_GUIDE.md                     ← Widget architecture
├── WIDGET_QUICK_START.md                         ← Widget guide
├── IMPLEMENTATION_COMPLETE_SUMMARY.md            ← Project status
└── UNIFIED_SEED_IMPLEMENTATION_PLAN.md           ← Schema reference

⭐ = Critical for Atlas migration & admin dashboard
```

---

## 🎯 SUMMARY FOR CHATGPT

**Current State:**
- Website runs on local MongoDB
- 32 products seeded with unified schema
- Auto-screening works (price < $300, readyToShip)
- Homepage + Widget pull from MongoDB

**Goal:**
- Migrate to MongoDB Atlas (cloud)
- Build admin UI for product management
- Enable non-technical users to manage products
- Maintain auto-screening functionality

**Key Challenges:**
1. Secure Atlas migration without downtime
2. Admin UI design for product flags (checkboxes)
3. Bulk operations for efficiency
4. Preview mode before publishing changes

**Available Resources:**
- Existing dashboard patterns (`src/app/dashboard/*`)
- Existing admin APIs (`src/app/api/dashboard/*`)
- Complete product schema (`scripts/seed-unified-products.js`)
- Working MongoDB queries (`src/lib/concierge/providers/localdb.ts`)

**Next Steps:**
1. Atlas cluster setup guide
2. Admin dashboard mockup
3. API route specifications
4. Implementation roadmap

---

**END OF INVENTORY**

Total Documents: 10 key documentation files  
Total Code Files: 25+ relevant components  
Total Lines of Reference Code: ~3,000+ lines  
Status: Ready for ChatGPT analysis

