# Aurora Concierge Widget - Developer Quick Reference

**Last Updated**: January 15, 2025  
**Architecture**: Modular (Post-Strategic Rebuild)

---

## Quick Start

### Running the Widget Locally
```bash
npm run dev
# Widget appears bottom-right on all pages
# Click to open, ESC to close
```

### Building for Production
```bash
npm run build
# Build output in .next/
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         SupportWidget.tsx (72 lines)        │
│         Orchestrator - connects all parts    │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│   Hooks     │  │ UI Components│
│             │  │              │
│ useWidget   │  │ WidgetShell  │
│   State     │  │ Widget       │
│             │  │   Conversation│
│ useWidget   │  │ Widget       │
│   Actions   │  │   Composer   │
└─────────────┘  └──────────────┘
```

---

## File Structure

```
src/components/support/
├── SupportWidget.tsx          # Main entry point (orchestrator)
├── ErrorBoundary.tsx          # Error handling wrapper
│
├── Widget/                    # UI Components
│   ├── WidgetShell.tsx       # FAB + container + header
│   ├── WidgetConversation.tsx# Message display + modules
│   └── WidgetComposer.tsx    # Input + quick actions
│
├── hooks/                     # State & Logic
│   ├── useWidgetState.ts     # State management
│   └── useWidgetActions.ts   # Intent handlers
│
└── modules/                   # Message modules
    ├── ProductCarousel.tsx
    ├── OrderTimeline.tsx
    ├── ReturnOptions.tsx
    └── ... (7 more)

src/lib/concierge/
├── intent/
│   └── normalizer.ts         # Unified filter normalization
├── types.ts                  # All TypeScript types
├── scripts.ts                # executeIntent() logic
├── intentRules.ts            # Intent detection
├── services.ts               # API client functions
└── catalogProvider.ts        # Product data provider
```

---

## Common Tasks

### 1. Add a New Quick Link

**File**: `src/lib/concierge/types.ts`

```typescript
export const QUICK_LINKS: QuickLinkDefinition[] = [
  // ... existing links
  {
    id: 'new-link',
    intent: 'find_product', // or other intent
    label: 'Your Label',
    payload: { filters: { category: 'rings' } }, // optional
  },
]
```

**That's it!** The link will automatically appear in both:
- Intro section (first 2 links)
- Footer quick start (all links)

---

### 2. Add a New Intent

**Step 1**: Add to intent enum  
**File**: `src/lib/concierge/types.ts`
```typescript
export type ConciergeIntent =
  | 'find_product'
  | 'track_order'
  | 'your_new_intent' // ADD HERE
```

**Step 2**: Add handler  
**File**: `src/lib/concierge/scripts.ts`
```typescript
export async function executeIntent({ intent, payload, state }: ExecuteIntentArgs): Promise<IntentResponse> {
  switch (intent) {
    // ... existing cases
    case 'your_new_intent': {
      // Your logic here
      return {
        messages: [createMessage('concierge', 'Response text')],
        sessionPatch: { lastIntent: intent },
      }
    }
  }
}
```

**Step 3**: Add detection rule (optional)  
**File**: `src/lib/concierge/intentRules.ts`
```typescript
const keywordMap: Record<string, ConciergeIntent> = {
  // ... existing keywords
  'your keyword': 'your_new_intent',
}
```

---

### 3. Add a New Filter Type

**File**: `src/lib/concierge/intent/normalizer.ts`

```typescript
export interface NormalizedFilters {
  // ... existing fields
  yourNewFilter?: string // ADD HERE
}

export function normalizeFilters(raw: Record<string, unknown> = {}): NormalizedFilters {
  const normalized: NormalizedFilters = {}
  
  // ... existing normalization
  
  // Add your filter
  if (typeof raw.yourNewFilter === 'string') {
    normalized.yourNewFilter = raw.yourNewFilter
  }
  
  return normalized
}
```

**That's it!** The normalized filter will automatically work with:
- `services.ts` (fetchProducts)
- `catalogProvider.ts` (matches function)
- All data providers (stub, localDb, remote)

---

### 4. Update Widget Copy

**Intro Section**  
**File**: `src/components/support/Widget/WidgetConversation.tsx`
```typescript
<p className="mt-1 text-[13px] leading-relaxed text-[#1c1f22]">
  Choose a journey below or ask anything—replies are instant.
</p>
```

**Header**  
**File**: `src/components/support/Widget/WidgetShell.tsx`
```typescript
<Typography as="h2" variant="title">
  Let&apos;s craft your spark.
</Typography>
<p className="mt-2 text-sm leading-relaxed text-white/85">
  Share your vision—Aurora finds ready-to-ship pieces...
</p>
```

**Error Messages**  
**File**: `src/lib/concierge/scripts.ts`
```typescript
function buildErrorMessage(intent: ConciergeIntent): IntentResponse {
  return {
    messages: [
      createMessage('concierge', "I couldn't complete that request...")
    ],
    // ...
  }
}
```

---

### 5. Add a New Module Type

**Step 1**: Add type definition  
**File**: `src/lib/concierge/types.ts`
```typescript
export interface YourModulePayload {
  type: 'your-module'
  id: string
  // ... your fields
}

export type ModulePayload =
  | ProductFilterPayload
  | YourModulePayload // ADD HERE
  // ... other types
```

**Step 2**: Create component  
**File**: `src/components/support/modules/YourModule.tsx`
```typescript
export function YourModule({ payload, onAction, disabled }: YourModuleProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-[#e9ebee] bg-white p-4 shadow-sm">
      {/* Your UI here */}
    </section>
  )
}
```

**Step 3**: Add to renderer  
**File**: `src/components/support/modules/ModuleRenderer.tsx`
```typescript
export function ModuleRenderer({ module, onAction, isProcessing }: ModuleRendererProps) {
  switch (module.type) {
    // ... existing cases
    case 'your-module':
      return <YourModule payload={module} onAction={onAction} disabled={isProcessing} />
  }
}
```

---

### 6. Add Analytics Tracking

**Option 1**: Widget-level events  
**File**: `src/components/support/hooks/useWidgetActions.ts`
```typescript
trackEvent('your_event_name', {
  sessionId,
  requestId,
  yourCustomField: 'value',
})
```

**Option 2**: UI-level events  
**File**: Any component
```typescript
function trackEvent(event: string, detail?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  
  const prefixedEvent = event.startsWith('aurora_') ? event : `aurora_${event}`
  window.dispatchEvent(new CustomEvent('aurora-widget-event', { detail: { event: prefixedEvent, ...detail } }))
}
```

All events are automatically:
- Dispatched to `window.dataLayer` (Google Analytics)
- Sent to `/api/dev-analytics/collect` (dev environment)

---

### 7. Update Product Filters

**To add a new filter field**:

1. Add to `ProductFilters` interface  
   **File**: `src/lib/concierge/types.ts`
   ```typescript
   export interface ProductFilters {
     // ... existing
     yourNewFilter?: string
   }
   ```

2. Add normalization logic  
   **File**: `src/lib/concierge/intent/normalizer.ts`
   ```typescript
   if (typeof raw.yourNewFilter === 'string') {
     normalized.yourNewFilter = raw.yourNewFilter
   }
   ```

3. Add filtering logic  
   **File**: `src/lib/concierge/catalogProvider.ts`
   ```typescript
   function matches(product: Product, filters: NormalizedFilters): boolean {
     // ... existing checks
     if (filters.yourNewFilter && product.yourNewFilter !== filters.yourNewFilter) {
       return false
     }
     return true
   }
   ```

---

## Debugging Tips

### 1. Widget Not Appearing
```typescript
// Check feature flag
// File: src/lib/feature-flags.ts
console.log(isWidgetEnabled(userId))

// Check .env
NEXT_PUBLIC_CONCIERGE_ENABLED=true
```

### 2. Messages Not Showing
```typescript
// Check state in browser console
// Open widget, then in console:
document.querySelector('#glowglitch-aurora-widget')
```

### 3. Filters Not Working
```typescript
// Add debug logging to normalizer
// File: src/lib/concierge/intent/normalizer.ts
export function normalizeFilters(raw: Record<string, unknown> = {}): NormalizedFilters {
  console.log('[normalizer] Input:', raw)
  const normalized = { /* ... */ }
  console.log('[normalizer] Output:', normalized)
  return normalized
}
```

### 4. Intent Not Detected
```typescript
// Check detection logic
// File: src/lib/concierge/intentRules.ts
// Enable debug mode in .env:
IS_DEV=true

// Will log: [intent:v2] find_product { filters, reasons }
```

---

## Testing

### Manual Testing Checklist
```bash
# 1. Open widget
# 2. Try each quick link:
#    - Design ideas
#    - Gifts under $300
#    - Ready to ship
#    - Track my order
#    - Returns & resizing
# 3. Try natural language queries:
#    - "show me rings"
#    - "gifts under 200"
#    - "where is my order"
# 4. Try inline actions:
#    - Track order button
#    - Talk to stylist button
# 5. Test edge cases:
#    - Close with ESC key
#    - Close with X button
#    - Send empty message (should not send)
#    - Spam click Send (should be disabled during processing)
```

### Unit Testing (Future)
```bash
npm run test:unit
# Will run tests for hooks:
# - useWidgetState.test.ts
# - useWidgetActions.test.ts
```

### E2E Testing
```bash
npm run test:e2e
# Runs existing Playwright tests
```

---

## Performance Tips

### 1. Component Memoization
```typescript
// For expensive computations
const expensiveValue = useMemo(() => {
  return heavyCalculation(props.data)
}, [props.data])

// For components that rarely change
export const WidgetShell = React.memo(WidgetShellComponent)
```

### 2. Callback Stability
```typescript
// Always wrap callbacks in useCallback
const handleClick = useCallback(() => {
  // ...
}, [dependencies])
```

### 3. State Updates
```typescript
// Batch multiple updates
setShowIntro(false)
setInputValue('')
// React automatically batches these in event handlers
```

---

## Common Gotchas

### 1. Quote Escaping
```typescript
// ❌ Bad
'I'm here to help'

// ✅ Good
"I'm here to help"
// or
'I&apos;m here to help'
```

### 2. Apostrophes in JSX
```typescript
// ❌ Bad
<p>We're sorry</p>

// ✅ Good
<p>We&apos;re sorry</p>
```

### 3. State Ref Access
```typescript
// ❌ Bad - stale closure
const value = state.session.id

// ✅ Good - always fresh
const value = stateRef.current?.session.id
```

### 4. Type Assertions
```typescript
// Use sparingly, only when TypeScript can't infer correctly
const normalized = normalizeFilters(raw) as NormalizedFilters
```

---

## Key Contacts

**Widget Codeowner**: Development Team  
**UX/Design**: Design Team  
**Analytics**: Data Team  
**Documentation**: This file + `WIDGET_STRATEGIC_REBUILD_COMPLETE.md`

---

## Quick Links

- **Main Implementation**: `src/components/support/SupportWidget.tsx`
- **Types**: `src/lib/concierge/types.ts`
- **Intent Logic**: `src/lib/concierge/scripts.ts`
- **Filters**: `src/lib/concierge/intent/normalizer.ts`
- **Full Rebuild Docs**: `WIDGET_STRATEGIC_REBUILD_COMPLETE.md`
- **UX Fixes**: `WIDGET_UX_FIXES_FINAL.md`
- **Quick Start**: `WIDGET_QUICK_START.md`

---

## Version History

- **v2.0.0** (Jan 15, 2025): Strategic Rebuild - Modular architecture
- **v1.0.0** (Pre-Jan 15, 2025): Monolithic implementation (637 lines)

