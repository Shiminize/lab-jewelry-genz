# Widget Data Persistence - Critical Audit Fixes

## Executive Summary

Fixed three critical data persistence bugs that prevented widget interaction data from appearing in dashboards:

1. ✅ **orderNumber persistence** - Widget services now store orderNumber for lookups
2. ✅ **CSAT numeric ratings** - Enrichment now uses numeric `score` field instead of string `rating`
3. ✅ **Creator stats deduplication** - Removed duplicate metric

---

## Issue 1: Widget Data Lookups Never Succeeded (CRITICAL)

### Problem

**Impact**: ✨ badges never appeared, CSAT ratings were blank, widget interaction panels were empty, creator widget stats always showed zero.

**Root Cause**: Data schema mismatch between write and read paths.

**Write paths** (`src/server/services/widgetService.ts`):
- `saveCsatFeedback()` - Stored sessionId, rating, notes, intent
- `createCapsuleHold()` - Stored sessionId, customerEmail, shortlist
- `subscribeOrderUpdates()` - Stored sessionId, orderId, email, phone

**Read paths** (`src/services/admin/order-widget-enrichment.ts`, `src/services/admin/creatorStats.ts`):
- Queried `csatFeedback` by `orderNumber`
- Queried `capsuleHolds` by `orderNumber`
- Queried `widgetOrderSubscriptions` by `orderNumber`

**Result**: All lookups returned empty → `hasWidgetInteraction` always false.

### Fix

Added `orderNumber` field to all widget service functions and API routes:

#### 1. Updated Service Functions

**File**: `src/server/services/widgetService.ts`

```typescript
// BEFORE
export async function saveCsatFeedback(params: {
  sessionId: string;
  rating: string | number;
  notes?: string;
  intent?: string;
}): Promise<{ ok: boolean }>

// AFTER
export async function saveCsatFeedback(params: {
  sessionId: string;
  rating: string | number;
  notes?: string;
  intent?: string;
  orderNumber?: string;  // ← ADDED
}): Promise<{ ok: boolean }>
```

Applied same pattern to:
- `createCapsuleHold()` - Added `orderNumber?: string`
- `subscribeOrderUpdates()` - Added `orderNumber?: string` + fixed `sms` field

#### 2. Updated API Routes

**Files**: 
- `src/app/api/support/csat/route.ts`
- `src/app/api/support/capsule/route.ts`
- `src/app/api/support/order-updates/route.ts`

```typescript
// BEFORE
const result = await saveCsatFeedback({
  sessionId: body.sessionId,
  rating: body.rating,
  notes: body.notes,
  intent: body.intent,
});

// AFTER
const result = await saveCsatFeedback({
  sessionId: body.sessionId,
  rating: body.rating,
  notes: body.notes,
  intent: body.intent,
  orderNumber: body.orderNumber,  // ← ADDED
});
```

#### 3. Added Database Indexes

**File**: `src/server/services/widgetService.ts`

Added `orderNumber` indexes to all widget collections for efficient lookups:

```typescript
// In saveCsatFeedback()
await col.createIndex({ orderNumber: 1 }).catch(() => {});

// In createCapsuleHold()
await col.createIndex({ orderNumber: 1 }).catch(() => {});

// In subscribeOrderUpdates()
await col.createIndex({ orderNumber: 1 }).catch(() => {});
```

---

## Issue 2: CSAT Rating Logic Can't Render Badges (CRITICAL)

### Problem

**Impact**: CSAT ratings never appeared in orders dashboard because numeric comparisons failed on string values.

**Root Cause**: Data type mismatch.

**Storage** (`widgetService.saveCsatFeedback`):
```typescript
const doc = {
  rating: params.rating,  // 'great', 'good', 'okay', etc. (string)
  score: 5,              // Numeric equivalent
  // ...
};
```

**Enrichment** (`order-widget-enrichment.ts`):
```typescript
csatRating: csatDoc?.rating,  // 'great' (string)
```

**Dashboard** (`src/app/dashboard/orders/page.tsx`):
```typescript
order.widgetData.csatRating >= 4  // ❌ 'great' >= 4 → false
```

### Fix

Updated enrichment to use numeric `score` field:

**File**: `src/services/admin/order-widget-enrichment.ts`

```typescript
// BEFORE
return {
  hasWidgetInteraction,
  csatRating: csatDoc?.rating,  // ❌ string like 'great'
  csatNotes: csatDoc?.notes,
  csatTimestamp: csatDoc?.timestamp,

// AFTER
return {
  hasWidgetInteraction,
  csatRating: csatDoc?.score,  // ✅ numeric 1-5
  csatNotes: csatDoc?.notes,
  csatTimestamp: csatDoc?.timestamp,
```

Applied to both:
- `getOrderWidgetData()` - Single order lookups
- `enrichOrdersWithWidgetData()` - Bulk order lookups

---

## Issue 3: Creator Stats Double-Count Zeros (MINOR)

### Problem

**Impact**: Redundant metric in `CreatorWidgetStats` interface.

**Root Cause**: Both `totalWidgetAssistedSales` and `widgetAssistedOrders` represented the same count (`widgetAssistedOrders.length`).

### Fix

Removed duplicate `widgetAssistedOrders` metric:

**File**: `src/services/admin/creatorStats.ts`

```typescript
// BEFORE
export interface CreatorWidgetStats {
  totalWidgetAssistedSales: number
  totalWidgetAssistedRevenue: number
  widgetAssistedOrders: number       // ← DUPLICATE
  widgetAssistedCommission: number
  creatorBreakdown: Array<...>
}

// AFTER
export interface CreatorWidgetStats {
  totalWidgetAssistedSales: number   // Order count
  totalWidgetAssistedRevenue: number
  widgetAssistedCommission: number
  creatorBreakdown: Array<...>
}
```

---

## Testing Verification

### Build Status

```bash
$ npm run build
✓ Compiled successfully

$ npm run lint
✓ No linter errors
```

### Data Flow Verification

**Widget → Storage → Dashboard**

```
┌─────────────────────┐
│ Widget sends CSAT   │
│ { sessionId: "...", │
│   orderNumber: "...",│  ← NOW INCLUDED
│   rating: "great" } │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ API Route passes    │
│ orderNumber to      │
│ widgetService       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ MongoDB Storage     │
│ csatFeedback:       │
│ { orderNumber: "...",│  ← NOW STORED
│   score: 5,         │  ← NUMERIC
│   rating: "great" } │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Enrichment Query    │
│ .find({ orderNumber:│  ← NOW FINDS DATA
│   "GG-12001" })     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Dashboard Display   │
│ csatRating: 5       │  ← NUMERIC WORKS
│ if (rating >= 4)    │  ✅ true
│   → green badge     │
└─────────────────────┘
```

---

## Files Modified (8)

### Backend Services (2)
1. `src/server/services/widgetService.ts` - Added orderNumber persistence + indexes
2. `src/services/admin/order-widget-enrichment.ts` - Fixed CSAT rating field

### API Routes (3)
3. `src/app/api/support/csat/route.ts` - Pass orderNumber to service
4. `src/app/api/support/capsule/route.ts` - Pass orderNumber to service
5. `src/app/api/support/order-updates/route.ts` - Pass orderNumber + sms to service

### Analytics (1)
6. `src/services/admin/creatorStats.ts` - Removed duplicate metric

### No Dashboard Changes Required
- Orders dashboard (`src/app/dashboard/orders/page.tsx`) - Already correct
- Order detail page (`src/app/dashboard/orders/[id]/page.tsx`) - Already correct
- Creators dashboard (`src/app/dashboard/creators/page.tsx`) - Already correct

---

## Widget Integration Notes

### For Widget Developers

The widget needs to pass `orderNumber` when available in context:

```typescript
// When submitting CSAT after order tracking
await fetch('/api/support/csat', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: widgetSessionId,
    rating: 'great',
    notes: 'Super helpful!',
    intent: 'order_tracking',
    orderNumber: currentOrder?.orderNumber,  // ← Include if available
  }),
});

// When creating capsule reservation
await fetch('/api/support/capsule', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: widgetSessionId,
    customerEmail: 'user@example.com',
    shortlist: selectedProducts,
    orderNumber: relatedOrder?.orderNumber,  // ← Include if available
  }),
});

// When subscribing to order updates
await fetch('/api/support/order-updates', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: widgetSessionId,
    orderNumber: trackedOrder.orderNumber,  // ← Required for this intent
    email: 'user@example.com',
    phone: '+1-555-0123',
    sms: true,
  }),
});
```

### Context Detection

Widget should extract `orderNumber` from:
- Order tracking intent responses
- Return/resize request flows
- Product recommendations related to existing orders
- Post-purchase interactions

---

## Database Schema Updates

### New Fields

**csatFeedback collection:**
```javascript
{
  sessionId: String,
  rating: String,      // 'great', 'good', etc.
  score: Number,       // 1-5 numeric
  notes: String,
  intent: String,
  orderNumber: String, // ← NEW
  timestamp: Date,
  createdAt: Date,
}
```

**capsuleHolds collection:**
```javascript
{
  reservationId: String,
  sessionId: String,
  shortlist: Array,
  customerEmail: String,
  customerName: String,
  orderNumber: String, // ← NEW
  status: String,
  reservedAt: Date,
  expiresAt: Date,
  createdAt: Date,
}
```

**widgetOrderSubscriptions collection:**
```javascript
{
  sessionId: String,
  originIntent: String,
  orderId: String,
  orderNumber: String, // ← NEW
  email: Boolean,
  phone: String,
  sms: Boolean,        // ← FIXED (was missing)
  subscribedAt: Date,
  createdAt: Date,
}
```

### New Indexes

```javascript
// csatFeedback
db.csatFeedback.createIndex({ orderNumber: 1 })

// capsuleHolds
db.capsuleHolds.createIndex({ orderNumber: 1 })

// widgetOrderSubscriptions
db.widgetOrderSubscriptions.createIndex({ orderNumber: 1 })
```

---

## Expected Dashboard Behavior

### Before Fixes:
- ✨ Badge column: Always showed "—"
- CSAT column: Always showed "—"
- Order detail widget panel: Never rendered
- Creator widget stats: Always zero

### After Fixes (when orderNumber is passed):
- ✨ Badge column: Shows sparkle icon for widget interactions
- CSAT column: Shows 1-5 rating with color coding:
  - 🟢 Green (4-5): Positive
  - 🟡 Yellow (3): Neutral
  - 🔴 Red (1-2): Negative
- Order detail widget panel: Shows CSAT, capsule link, subscription status
- Creator widget stats: Shows accurate counts and revenue

---

## Migration Notes

### Existing Data

Existing widget interactions stored **before this fix** will NOT retroactively link to orders because they don't have `orderNumber` field.

**Options:**
1. Accept data gap (recommended for MVP)
2. Run backfill script to link sessions to orders via:
   - Email matching
   - SessionId → analyticsEvents → metadata.orderNumber
   - Timestamp correlation

### Going Forward

All new widget interactions (after deployment) will correctly store and display in dashboards.

---

## Deployment Checklist

- [x] Build passes without errors
- [x] Linter clean
- [x] TypeScript types updated
- [x] Database indexes added automatically
- [x] API routes accept new fields
- [ ] Widget updated to pass orderNumber
- [ ] Test with real order numbers in staging
- [ ] Verify dashboard displays widget data
- [ ] Monitor MongoDB index creation logs

---

**Status**: Fixes Complete ✅  
**Build**: Passing ✅  
**Breaking Changes**: None (backward compatible)  
**Next Step**: Update widget to pass `orderNumber` in API calls

