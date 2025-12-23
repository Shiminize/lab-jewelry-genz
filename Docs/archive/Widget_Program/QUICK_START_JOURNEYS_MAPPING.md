# Quick Start Journeys - Component & Handler Analysis

## Overview

The "QUICK START JOURNEYS" section renders clickable chips that trigger different intents in the support widget. There are two implementations:

1. **Main Quick Links** (in widget footer) - `src/lib/concierge/types.ts`
2. **Product Filter Chips** (in conversation area) - `src/components/support/modules/QuickLinkChips.tsx`

---

## 1. Main Quick Links (Widget Footer)

### Location: `src/lib/concierge/types.ts`

```typescript
export const QUICK_LINKS: QuickLinkDefinition[] = [
  { id: 'design-ideas', intent: 'find_product', label: 'Design ideas' },
  {
    id: 'gifts-under-300',
    intent: 'find_product',
    label: 'Gifts under $300',
    payload: { filters: { priceMax: 300 } },
  },
  {
    id: 'ready-to-ship',
    intent: 'find_product',
    label: 'Ready to ship',
    payload: { filters: { readyToShip: true } },
  },
  { id: 'track-order', intent: 'track_order', label: 'Track my order' },
  { id: 'returns-resizing', intent: 'return_exchange', label: 'Returns & resizing' },
]
```

### Rendered In: `src/components/support/Widget/WidgetComposer.tsx`

**Lines 67-79:**
```typescript
<div className="flex flex-wrap gap-2">
  {QUICK_LINKS.map((link) => (
    <button
      key={link.id}
      type="button"
      onClick={() => onQuickLink(link.intent, link.payload)}
      disabled={isProcessing}
      className="inline-flex items-center gap-2 rounded-full border border-[#e9ebee] bg-white px-3 py-2.5 text-[#1c1f22] transition hover:border-[#c8a96e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a96e] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {link.label}
    </button>
  ))}
</div>
```

**Element Type**: `<button>` (not a link)

**Handler**: `onQuickLink(link.intent, link.payload)`

---

## 2. Product Filter Chips (Conversation Area)

### Location: `src/components/support/modules/QuickLinkChips.tsx`

**Lines 23-54:**
```typescript
const QUICK_LINKS: QuickLink[] = [
  {
    id: 'gifts-under-300',
    label: 'Gifts under $300',
    params: { readyToShip: 'true', priceLt: 300 }
  },
  {
    id: 'ready-to-ship',
    label: 'Ready to ship',
    params: { readyToShip: 'true' }
  },
  {
    id: 'rings',
    label: 'Rings',
    params: { category: 'ring', readyToShip: 'true' }
  },
  {
    id: 'necklaces',
    label: 'Necklaces',
    params: { category: 'necklace', readyToShip: 'true' }
  },
  {
    id: 'earrings',
    label: 'Earrings',
    params: { category: 'earring', readyToShip: 'true' }
  },
  {
    id: 'bracelets',
    label: 'Bracelets',
    params: { category: 'bracelet', readyToShip: 'true' }
  }
]
```

**Element Type**: `<button>` with WCAG AA+ accessibility features

**Handler**: `onClick={() => handleClick(link, index)}` → `onLinkClick(link.params)`

**Accessibility Features**:
- 44px+ touch targets
- Horizontal scrolling with snap points
- Keyboard arrow navigation with roving tabindex
- Skip link for screen readers

---

## 3. Handler Flow

### Entry Point: `src/components/support/SupportWidget.tsx`

**Lines 56, 63:**
```typescript
<WidgetConversation
  onQuickLink={actions.handleQuickLink}
/>
<WidgetComposer
  onQuickLink={actions.handleQuickLink}
/>
```

### Handler Implementation: `src/components/support/hooks/useWidgetActions.ts`

**Lines 266-272:**
```typescript
const handleQuickLink = useCallback(
  (intent: ConciergeIntent, payload?: Record<string, unknown>) => {
    setShowIntro?.(false)
    runIntent(intent, { source: 'explicit', ...(payload ?? {}) })
  },
  [runIntent, setShowIntro]
)
```

### Intent Execution: `src/lib/concierge/scripts.ts`

**Lines 65-100:**
```typescript
export async function executeIntent({ intent, payload, state }: ExecuteIntentArgs): Promise<IntentResponse> {
  switch (intent) {
    case 'find_product': {
      if (data.action === 'submit-product-filters' || data.filters) {
        try {
          const filtersPayload = {
            ...(data.filters || data),
            sessionId: state.session.id,
            ...(requestId ? { requestId } : {}),
          }
          const products = await postJson<Product[]>('/api/support/products', filtersPayload)
          
          const modules: ModulePayload[] = [
            {
              type: 'product-carousel',
              id: 'product-carousel',
              products: products,
              footerCtaLabel: 'Save to shortlist',
            },
          ]
          
          return {
            messages: [
              createMessage('concierge', 'Here are ready-to-ship pieces that match your preferences.'),
              createMessage('concierge', modules[0])
            ],
            sessionPatch: { lastIntent: 'find_product' },
          }
        } catch (error) {
          return buildErrorMessage('find_product')
        }
      }
    }
    case 'track_order': {
      // Returns order lookup module
    }
    case 'return_exchange': {
      // Returns return options module
    }
    // ... other intents
  }
}
```

---

## 4. Label → Filter Mapping

### Main Quick Links

| Label | Intent | Payload | Handler Result |
|-------|--------|---------|----------------|
| **Design ideas** | `find_product` | `undefined` | ⚠️ **UNWIRED** - No filters provided, likely shows empty state or featured products |
| **Gifts under $300** | `find_product` | `{ filters: { priceMax: 300 } }` | ✅ Fetches products with price ≤ $300 |
| **Ready to ship** | `find_product` | `{ filters: { readyToShip: true } }` | ✅ Fetches ready-to-ship products |
| **Track my order** | `track_order` | `undefined` | ✅ Shows order lookup form |
| **Returns & resizing** | `return_exchange` | `undefined` | ✅ Shows return options |

### Product Filter Chips

| Label | Params | API Call |
|-------|--------|----------|
| **Gifts under $300** | `{ readyToShip: 'true', priceLt: 300 }` | `/api/support/products?readyToShip=true&priceLt=300` |
| **Ready to ship** | `{ readyToShip: 'true' }` | `/api/support/products?readyToShip=true` |
| **Rings** | `{ category: 'ring', readyToShip: 'true' }` | `/api/support/products?category=ring&readyToShip=true` |
| **Necklaces** | `{ category: 'necklace', readyToShip: 'true' }` | `/api/support/products?category=necklace&readyToShip=true` |
| **Earrings** | `{ category: 'earring', readyToShip: 'true' }` | `/api/support/products?category=earring&readyToShip=true` |
| **Bracelets** | `{ category: 'bracelet', readyToShip: 'true' }` | `/api/support/products?category=bracelet&readyToShip=true` |

---

## 5. Configuration Structure

### Intent Type Definitions

```typescript
export type ConciergeIntent =
  | 'find_product'
  | 'track_order'
  | 'return_exchange'
  | 'sizing_repairs'
  | 'care_warranty'
  | 'financing'
  | 'stylist_contact'
  | 'csat'
```

### Quick Link Definition

```typescript
export type QuickLinkDefinition = {
  id: string
  intent: ConciergeIntent
  label: string
  description?: string
  payload?: Record<string, unknown>
}
```

---

## 6. Additional Inline Actions

### Location: `src/components/support/Widget/WidgetComposer.tsx`

**Lines 83-98:**
```typescript
<button
  type="button"
  onClick={() => onInlineAction('track')}
  title="Check your latest studio timeline"
>
  Track order
</button>
<button
  type="button"
  onClick={() => onInlineAction('stylist')}
  title="Escalate to a GlowGlitch stylist"
>
  Talk to stylist
</button>
```

**Handler**: `src/components/support/hooks/useWidgetActions.ts`

**Lines 274-285:**
```typescript
const handleInlineAction = useCallback(
  (action: 'track' | 'stylist') => {
    setShowIntro?.(false)
    if (action === 'track') {
      trackEvent('inline_track_order')
      return runIntent('track_order', { source: 'inline' })
    }
    trackEvent('inline_stylist')
    return runIntent('stylist_contact', { source: 'inline' })
  },
  [runIntent, setShowIntro]
)
```

---

## 7. Key Findings

### ✅ Wired & Working

1. **Gifts under $300** - Fully wired with `priceMax: 300` filter
2. **Ready to ship** - Fully wired with `readyToShip: true` filter
3. **Track my order** - Triggers order lookup intent
4. **Returns & resizing** - Triggers return/exchange intent
5. **Category filters** (Rings, Necklaces, etc.) - Fully wired with category params

### ⚠️ Partially Wired

6. **Design ideas** - Intent exists but NO payload/filters provided
   - Will call `find_product` with empty filters
   - Likely shows empty state or falls back to featured products
   - **Recommendation**: Add payload like `{ filters: { featured: true } }` or similar

### 🔧 Implementation Notes

- All chips use **buttons**, not links (good for SPA behavior)
- Two separate implementations for different use cases
- Main quick links focus on intents (track, return, find)
- Product chips focus on specific product filters
- "Design ideas" is the **only unwired** quick link in the main set

---

## 8. Recommendations

### To Wire "Design ideas":

**Option A: Show featured products**
```typescript
{
  id: 'design-ideas',
  intent: 'find_product',
  label: 'Design ideas',
  payload: { filters: { featured: true, limit: 12 } }
}
```

**Option B: Show all categories**
```typescript
{
  id: 'design-ideas',
  intent: 'find_product',
  label: 'Design ideas',
  payload: { filters: { limit: 20 } } // No specific filters, just limit
}
```

**Option C: Custom intent**
```typescript
// Add new intent type
export type ConciergeIntent =
  | 'design_inspiration' // NEW
  | 'find_product'
  // ... rest

// Handle in executeIntent
case 'design_inspiration': {
  // Show curated inspiration content or featured collections
}
```

---

## Summary

**Files Involved**:
1. `src/lib/concierge/types.ts` - Quick link definitions & intent types
2. `src/components/support/Widget/WidgetComposer.tsx` - Renders main quick links
3. `src/components/support/modules/QuickLinkChips.tsx` - Renders product filter chips
4. `src/components/support/hooks/useWidgetActions.ts` - Handler implementation
5. `src/lib/concierge/scripts.ts` - Intent execution & API calls
6. `src/components/support/SupportWidget.tsx` - Connects handlers to components

**Status**: 4/5 main quick links fully wired, 1 partially unwired (Design ideas)
