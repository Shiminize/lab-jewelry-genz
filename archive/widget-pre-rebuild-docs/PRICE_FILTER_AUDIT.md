# Price Filter Logic Audit - Multiple Sources of Truth

## Date: January 15, 2025

## Critical Issue: Inconsistent Price Filter Field Names

### Problem Summary
The "Gifts under $300" quick link is NOT working because there are **3 different field names** being used for price filtering across the codebase:

1. **`budgetMax`** - Used in quick links and UI forms
2. **`priceMax`** - Used in API routes and some providers  
3. **`priceBand.max`** - Used in intent detection and catalog provider

**Result**: The quick link sends `budgetMax: 300`, but the API and providers expect `priceMax` or `priceBand.max`, so the filter doesn't work.

---

## Field Name Usage Breakdown

### 1. `budgetMax` Usage

**File**: `src/lib/concierge/types.ts` (line 169)
```typescript
{
  id: 'gifts-under-300',
  intent: 'find_product',
  label: 'Gifts under $300',
  payload: { filters: { budgetMax: 300 } },  // ❌ WRONG FIELD NAME
},
```

**File**: `src/components/support/modules/ProductFilterForm.tsx` (lines 29, 125)
```typescript
const [budgetMax, setBudgetMax] = useState(...)
// Later submits:
budgetMax: Number(budgetMax),  // ❌ WRONG FIELD NAME
```

**File**: `src/lib/concierge/stubs/products.ts` (lines 42, 49)
```typescript
budgetMax: typeof filters?.budgetMax === 'number' ? (filters.budgetMax as number) : undefined,
if (typeof normalized.budgetMax === 'number' && item.price > normalized.budgetMax) {
  return false
}
```
✅ Stub provider DOES support `budgetMax` but other providers don't!

### 2. `priceMax` Usage

**File**: `src/app/api/support/products/route.ts` (line 14)
```typescript
priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
```

**File**: `src/lib/concierge/providers/localdb.ts` (line 37)
```typescript
if (typeof (f as any).priceMax === 'number') {
  and.push({ price: { ...(and.find((q) => q.price)?.price || {}), $lte: (f as any).priceMax } });
}
```

**File**: `src/lib/concierge/providers/remote.ts` (line 20)
```typescript
if (typeof anyFilter.priceMax === 'number') params.set('priceMax', String(anyFilter.priceMax));
```

**File**: `src/lib/concierge/providers/stub.ts` (line 82)
```typescript
if (typeof anyFilter.priceMax === 'number') {
  results = results.filter((p) => p.price <= anyFilter.priceMax);
}
```

### 3. `priceBand.max` Usage

**File**: `src/lib/concierge/intentRules.ts` (lines 127, 154, 167, 267)
```typescript
payload: { budgetMax: Number(matches[1]), filters: { priceBand: { max: Number(matches[1]) } } },
// Later:
if (typeof priceMax === 'number') {
  filters.priceBand = { max: priceMax }
}
```

**File**: `src/lib/concierge/catalogProvider.ts` (lines 83, 133, 197, 216, 232)
```typescript
if (filters.priceBand?.max) {
  query.price = { $lte: filters.priceBand.max }
}
```

---

## Data Flow Analysis

### Current Broken Flow (Quick Links)

```
Quick Link Click
    ↓
types.ts: { budgetMax: 300 }
    ↓
scripts.ts: executeIntent() → postJson('/api/support/products', { budgetMax: 300 })
    ↓
API Route: Extracts priceMax from query params (not body!) ❌
    ↓
services.ts: fetchProducts({ budgetMax: 300 })
    ↓
localDbProvider: Looks for priceMax, NOT budgetMax ❌
    ↓
MongoDB Query: No price filter applied ❌
    ↓
Returns ALL ready-to-ship products instead of just under $300
```

### Current Working Flow (Intent Detection from Text)

```
User types: "show me rings under 300"
    ↓
intentRules.ts: detectPriceCeiling() → returns 300
    ↓
intentRules.ts: Sets filters.priceBand = { max: 300 }
    ↓
scripts.ts: postJson('/api/support/products', { priceBand: { max: 300 } })
    ↓
API Route POST: Passes body through directly ✅
    ↓
services.ts: fetchProducts({ priceBand: { max: 300 } })
    ↓
localDbProvider: Doesn't recognize priceBand ❌ (but recognizes priceMax)
    ↓
Falls back to no filtering ❌
```

---

## Root Cause

**Multiple Sources of Truth**: Different parts of the codebase use different field names:

- **UI/Quick Links**: `budgetMax`
- **API/Providers**: `priceMax`
- **Intent Detection**: `priceBand.max`
- **Stub Provider**: Supports `budgetMax` (but real providers don't)

**No Normalization Layer**: There's no single place that normalizes all these field names to a consistent format before they reach the data providers.

---

## Recommended Solution: Establish Single Source of Truth

### Option 1: Use `priceMax` Everywhere (RECOMMENDED)

**Why**: 
- Most providers already use `priceMax`
- Simplest field name
- Easy to understand

**Changes Needed**:

1. **Update Quick Links** (`src/lib/concierge/types.ts`):
   ```typescript
   payload: { filters: { priceMax: 300 } },  // Change budgetMax → priceMax
   ```

2. **Update Product Filter Form** (`src/components/support/modules/ProductFilterForm.tsx`):
   ```typescript
   // Change budgetMax → priceMax everywhere
   const [priceMax, setPriceMax] = useState(...)
   priceMax: Number(priceMax),
   ```

3. **Update Stub Provider** (`src/lib/concierge/stubs/products.ts`):
   ```typescript
   // Support both budgetMax (legacy) and priceMax (new)
   priceMax: typeof filters?.priceMax === 'number' ? filters.priceMax 
           : typeof filters?.budgetMax === 'number' ? filters.budgetMax 
           : undefined,
   ```

4. **Update catalogProvider** to support `priceMax` alongside `priceBand.max`

5. **Update Types** (`src/lib/concierge/types.ts`):
   ```typescript
   export interface ProductFilters {
     category?: string
     priceMin?: number  // Add this
     priceMax?: number  // Change budgetMax → priceMax
     metal?: string
   }
   ```

### Option 2: Add Normalization Layer

Create a single function that normalizes all price filter formats:

```typescript
function normalizeFilters(filters: any): NormalizedFilters {
  const priceMax = filters.priceMax 
                ?? filters.budgetMax 
                ?? filters.priceBand?.max;
  
  return {
    ...filters,
    ...(priceMax ? { priceMax } : {}),
    // Remove old fields
    budgetMax: undefined,
    priceBand: undefined,
  };
}
```

Apply this in `services.ts` before calling any provider.

---

## Impact Assessment

### Currently Broken
- ❌ "Gifts under $300" quick link returns ALL products
- ❌ Product filter form with budget may not work correctly  
- ❌ Intent detection with `priceBand` may not filter properly
- ❌ Inconsistent behavior between text input and quick links

### After Fix
- ✅ "Gifts under $300" quick link returns only products ≤ $300
- ✅ All price filtering uses consistent field name
- ✅ Predictable behavior across all entry points
- ✅ Single source of truth for price filtering

---

## Testing Requirements

After implementing fix:

1. **Quick Link Test**:
   ```bash
   # Simulate quick link click
   curl -X POST http://localhost:3000/api/support/products \
     -H "Content-Type: application/json" \
     -d '{"priceMax": 300, "readyToShip": true}'
   ```
   Should return ONLY "Minimalist Band Ring" at $299

2. **Text Intent Test**:
   - Type "show me rings under 300" in widget
   - Should return same result as quick link

3. **Filter Form Test**:
   - Use product filter form with budget slider
   - Set max to $300
   - Should return only products ≤ $300

4. **Verify All Products**:
   ```bash
   curl -X POST http://localhost:3000/api/support/products \
     -H "Content-Type: application/json" \
     -d '{"readyToShip": true}'
   ```
   Should return 6 products (prices: $299, $899, $1299, $1499, $1899, $2499)

---

## Recommended Implementation Order

1. ✅ Update Quick Links to use `priceMax`
2. ✅ Update ProductFilterForm to use `priceMax`
3. ✅ Update stub provider to support both (backwards compat)
4. ✅ Add `priceMax` support to catalogProvider
5. ✅ Update TypeScript types
6. ✅ Test all scenarios
7. ✅ Update documentation

---

## Status: NEEDS FIXING

**Priority**: HIGH  
**Blocking**: "Gifts under $300" feature is non-functional  
**Effort**: Low (2-3 file changes)  
**Risk**: Low (backwards compatible with normalization layer)

