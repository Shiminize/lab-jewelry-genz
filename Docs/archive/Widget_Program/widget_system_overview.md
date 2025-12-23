# Aurora Concierge Widget — Code-Only Implementation Guide

> This document merges the prior “CHATGPT” architecture draft with the refined widget plan. It defines a deterministic, non-AI concierge system and a step-by-step implementation roadmap for engineering, CX, and product.

---

## 1. Objectives & Principles
- Deliver a luxury-feel support widget that solves top customer journeys (order tracking, capsule design, care, financing, human escalation) without any AI services.
- Keep behaviour deterministic, fully explainable, and cheap to operate.
- Optimise for mobile-first layouts, fast load times (<25 kb gzipped widget bundle), and WCAG 2.1 AA accessibility.
- Provide a modular architecture so future AI capabilities can plug in later without rewriting the foundation.

---

## 2. System Architecture Overview
```
WidgetShell (React)
├─ LauncherButton
├─ ConciergePanel (dialog)
│  ├─ PanelHeader
│  ├─ TranscriptArea
│  │  ├─ MessageList
│  │  ├─ InlineModules (OfferCard, EscalationForm, ProductCarousel, RMAStatus)
│  ├─ Composer
│  └─ QuickLinksRail (beneath composer)
└─ StateStore (useReducer / Zustand slice)

Backend (Next.js API routes or Express services)
├─ ChatOrchestrator (rule engine + session store)
├─ CatalogService
├─ OrderService
├─ ReturnsService
├─ CapsuleService
├─ StylistService / CRM hooks
└─ CSATService
```

### Data Sources
- Product catalog (SQL, Shopify GraphQL/REST, cached JSON).
- Orders/returns APIs.
- CRM or ticketing endpoint for stylist escalation.
- Static script definitions (`src/data/conciergeScripts.ts`) that power deterministic chat responses.

---

## 3. Intent & State Model (No AI)
### Supported Intents
```
find_product (with sub-filters: ear stack, rings, gifts, ready_to_ship)
track_order
return_exchange
sizing_repairs
care_warranty
financing
stylist_contact
capsule_reserve
csat
```

### Intent Detection
- **Primary**: UI quick links / CTA buttons map directly to intents.
- **Secondary**: Keyword rules (case-insensitive):
  - `track|where is my order|order status` → `track_order`
  - `return|exchange|resize` → `return_exchange`
  - `ring|earring|necklace|bracelet|engagement|solitaire` → `find_product`
  - `care|clean|polish|warranty` → `care_warranty`
  - `finance|affirm|klarna|pay over time` → `financing`
- **Command shortcuts**: `/track 12345`, `/gift 300`, `/size 6`.
- All detection lives in `src/lib/concierge/intentRules.ts`.

### Conversation State Machine
```
WELCOME → COLLECT_PRODUCT_PREFS → SHOW_RECS → (ADD_TO_BAG | CAPSULE_RESERVE)
WELCOME → TRACK_ORDER_INPUT → TRACK_ORDER_RESULT
WELCOME → RETURN_INIT → RETURN_OPTIONS → RMA_CREATED
WELCOME → ESCALATE_FORM → ESCALATION_SENT
WELCOME → CSAT_PROMPT → CSAT_STORED
```

Reducer actions:
```ts
type Action =
  | { type: 'OPEN_WIDGET' }
  | { type: 'CLOSE_WIDGET' }
  | { type: 'SEND_MESSAGE'; payload: GuestMessagePayload }
  | { type: 'INTENT_DETECTED'; intent: ConciergeIntent; data?: unknown }
  | { type: 'MODULE_PUSH'; module: ModulePayload }
  | { type: 'MODULE_DISMISS'; id: string };
```

---

## 4. Content & Script Strategy
- Maintain scripted responses per intent in `conciergeScripts.ts`:
  ```ts
  const scripts: Record<ConciergeIntent, ConciergeScript> = {
    find_product: {
      steps: [
        { type: 'text', message: 'Let’s match pieces to your vibe. What occasion are you shopping for?' },
        { type: 'module', component: 'ProductFilterForm', props: {...} },
      ],
    },
    track_order: {
      steps: [
        { type: 'text', message: 'I can check that right away—drop your order number or email + zip.' },
        { type: 'module', component: 'OrderLookupForm', props: {...} },
      ],
    },
    // ...
  }
  ```
- Escalation copy emphasises concierge benefits: “We’ll reply within one studio hour with renders, pricing, sizing confirmations.”
- Offer card triggers from deterministic rules (see §8).
- Messages stored as:
  ```ts
  interface WidgetMessage {
    id: string
    role: 'guest' | 'concierge'
    type: 'text' | 'module'
    payload: string | ModulePayload
    intent?: ConciergeIntent
    timestamp: number
  }
  ```

---

## 5. Deterministic Services & Rules
### Product Recommendations
- Filters: category, metal, stone, budget range, inventory (`in_stock = true`), `ready_to_ship`.
- Ranking:
  ```
  score = (0.4 * bestseller_score)
        + (0.2 * margin_score)
        + (0.2 * styleMatch)
        + (0.15 * promoMultiplier)
        - (0.15 * overBudgetPenalty)
  ```
- Return top N (e.g., 3) with “Add to bag”, “Compare”, “View 360” actions.
- Provide explanation text (“Ships by Friday · Lab diamond · Coral & Sky exclusive”).

### Order Tracking
- `/api/support/order-status` accepts `{ orderId }` or `{ email, postalCode }`.
- Response includes status timeline, expected ship/delivery dates, tracking URL.
- Widget shows timeline module + CTA to “Text me updates”.

### Returns & Resizing
- Config constants:
  - `RETURN_WINDOW_DAYS = 30`
  - `RESIZE_WINDOW_DAYS = 60`
  - `NON_RETURNABLE_TAGS = ['custom', 'engraved']`
- Flow: collect order id → verify eligibility → present options (resize, return, care appointment) → call `/api/support/returns`.

### Financing
- Provide deterministic plan info (`0% for 12 months via LuminousPay`) and CTA to start pre-qualification (link to existing flow).

### Stylist Escalation
- Form collects first name, email, preferred time, notes.
- POST `/api/support/stylist` writes ticket to CRM or sends email.

### CSAT
- Trigger after successful flows (order result, RMA created, capsule reserve). Store via `/api/support/csat`.

---

## 6. UI Layout & Styling
- Shell width: `max-w-[480px]`, `w-[calc(100vw-1rem)]` on mobile.
- Header gradient: `bg-gradient-to-r from-accent-primary to-accent-secondary`.
- Text readability: apply drop shadows (`drop-shadow-[0_4px_18px_rgba(15,15,45,0.4)]`) to header copy.
- Transcript: `overflow-y-auto`, `space-y-4`, bubble classes for guest vs concierge.
- Composer:
  - Input (`rounded-2xl`, `px-4`, `py-2`).
  - Send button gradient, disabled state reflecting `isSending`.
- Quick links rail below composer: pill buttons with border tokens, accessible focus rings.
- Inline actions row (Attach inspiration, Track order, Talk to stylist) remains under quick links.

---

## 7. Module Library
| Module            | Trigger                                      | Description                                                |
|-------------------|----------------------------------------------|------------------------------------------------------------|
| `ProductFilterForm` | `find_product` pathway                       | Collects category, budget, metals, stones.                 |
| `ProductCarousel` | After filters resolved                       | Shows top 3 SKUs with CTAs.                                |
| `OrderLookupForm` | `track_order`                                | Input fields for order number or email + postal code.      |
| `OrderTimeline`   | Returns from `OrderService`                  | Visual timeline with current milestone.                    |
| `ReturnOptions`   | `return_exchange`                           | Buttons for resize, return, care, each posting to API.     |
| `EscalationForm`  | “Talk to stylist” or negative CSAT sentiment | Captures contact details, promise 1-hour follow-up.        |
| `OfferCard`       | design-intent triggers (§8)                  | CTA for 48-hour capsule reservation.                       |
| `CSATPrompt`      | Post-flow                                    | Buttons for Great / Needs follow-up.                       |

All modules live under `src/components/support/modules/` and receive typed props.

---

## 8. Offer & Capsule Rules
- Show “Reserve your Aurora Capsule” card when any of:
  - User engages `find_product` and saves ≥2 SKUs to shortlist.
  - User completes design filter form with `ready_to_ship = false`.
  - User selects command with keywords `custom|design|render|mix metals`.
- Offer card CTA: on click call `CapsuleService.create` (creates 48-hour hold record, schedules 3D renders).
- Provide deterministic success message after creation (“Reserved! Expect renders in 48 hours.”).

---

## 9. Analytics & Telemetry
- Events to emit (`onEvent` callback or dataLayer):
  - `widget_open`, `widget_close`
  - `intent_select`, `intent_complete`
  - `product_add_to_shortlist`, `offer_capsule_reserve`
  - `order_track_success`, `return_label_created`
  - `escalation_submitted`
  - `csat_submitted`
- Log additional metadata (intent, journey path, CTA label) without PII.
- Provide optional session persistence (store state in `sessionStorage` keyed by user id).

---

## 10. Implementation Steps (Code Walkthrough)
### 1. Scaffold the Widget
- Create `WidgetShell` with portal mount (e.g., inside `layout.tsx`).
- Implement `useReducer` store with initial welcome message and default modules.
- Add keyboard trap (`useFocusTrap`) and `aria-modal` semantics.

### 2. Wire Intent Rules
- Build `detectIntent(message: string, explicitIntent?: ConciergeIntent)` returning `{ intent, payload }`.
- Unit test keyword coverage.

### 3. Create Script Handlers
- Build `executeIntent(intent, payload, session)` returning array of `WidgetMessage`.
- Each handler may invoke service functions (synchronous or `await fetch('/api/...')`).
- Update reducer to append returned messages and modules.

### 4. Build Modules & Forms
- Implement React components for each module, typed props, CSS via Tailwind utilities.
- Hook forms to dispatch actions (e.g., on submit send `INTENT_DETECTED` with payload).

### 5. Integrate Services
- `/api/support/order-status`: mock initially, then connect to real system.
- `/api/support/products`: respond to filter queries with curated results.
- `/api/support/returns`, `/api/support/stylist`, `/api/support/csat`, `/api/support/capsule`.
- Add error handling: fallback messages and escalate to stylist if service fails.

### 6. Build Quick Links Rail
- In composer footer, render quick intent buttons (Track order, Design ideas, etc.) calling `dispatchIntent`.
- Provide analytics `onEvent('intent_select', { intent })`.

### 7. Inline Actions & CSAT
- Implement inline action buttons (Attach inspiration, Track order, Talk to stylist) referencing same intents.
- CSAT prompt triggers once per session; store state to avoid repeats.

### 8. Styling & Motion Polish
- Apply gradients, shadows, reduced-motion alternatives.
- Ensure layout clamps to viewport height (`max-h-[min(720px,88vh)]`) with `overflow-hidden`.

### 9. Accessibility & Testing
- Keyboard navigation tests (Tab order, Esc to close, Enter to send).
- Screen reader announcements via `aria-live="polite"` on message list.
- Automated tests:
  - Jest unit tests for reducer, intent detection, services (mock fetch).
  - Playwright flows for each major intent.
  - axe-core accessibility scan.

### 10. Deployment Readiness
- Run `npm run lint`, `npm run typecheck`, `npm run test`.
- Measure bundle size (`next build` + `analyze`).
- Ship behind feature flag, run A/B test vs legacy widget.
- Document success metrics (deflection rate, capsule reservation CTR).

---

## 11. Extension Hooks & Future AI Option
- `registerModule(type, component)` utility to allow future modules without altering core.
- Introduce optional `useAiRouter` later: only uncertain free text routes to LLM while deterministic flows remain intact.
- Hooks for localization: wrap message copy with i18n `t()` to prepare for multilingual content.

---

## 12. Checklist Summary
1. [ ] Implement reducer + state machine.
2. [ ] Create deterministic scripts and modules.
3. [ ] Build backend services (order, products, returns, capsule, stylist, csat).
4. [ ] Integrate composer + quick links + inline actions.
5. [ ] Style header, transcript, modules; ensure mobile responsiveness.
6. [ ] Add analytics, logging, and session persistence.
7. [ ] Run full QA (unit, integration, accessibility).
8. [ ] Launch behind flag, monitor metrics, iterate.

---

**Maintainer Notes**
- Update this document whenever intents or modules change.
- Store script versions with CX sign-off; include changelog entries for new journeys.
- Keep deterministic behaviour first; only introduce AI as an opt-in enhancement once infrastructure and governance are ready.
