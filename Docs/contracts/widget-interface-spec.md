# Aurora Concierge Widget Interface Spec
Version: 1.0.0 (2025-10-10)

## 1. Supported Message Types
Widget messages use `{ id, role, type, payload, intent?, timestamp }`.

### 1.1 `assistant_text`
- Required: `payload.text` (string)
- Optional: `payload.copyHook` (string key), `payload.icon` (string), `intent`, `timestamp`
- Usage: display plain copy or reference a content hook; no markdown.

### 1.2 `product_card`
- Required: `payload.cards` (array of ProductCard)
  - ProductCard = `{ productId, name, specLine, price, currency, heroImage, readyToShip, shippingPromise, tags?, styleTags?, badges?, ctas? }`
- CTA entries follow `{ id, label }` where `id` maps to widget action (`shortlist`, `view_details`).

### 1.3 `offer_card` (deprecated)
- Not used in recommendation-only scope.

### 1.4 `escalation_form`
- Required: `{ heading, description, submitLabel }`
- Optional: `{ prefill: { name?, email?, phone? }, copyHook, fieldsOverride? }`
- Fields shown: `name`, `email`, `phone`, `notes`, `timePreference` (configurable).

### 1.5 `csat_bar`
- Required: `{ question }`
- Optional: `{ positiveLabel, negativeLabel, copyHook }`
- Triggers `csat` intent with rating.

### 1.6 `order_status`
- Required: `{ orderNumber, timeline: [{ label, status, timestamp, isCurrent? }] }`
- Optional: `{ shipping: { carrier, service, trackingNumber, trackingUrl, estimatedDelivery, deliveredAt }, escalationHint }`
- Status codes: `created`, `payment_captured`, `processing`, `shipped`, `out_for_delivery`, `delivered`, `exception`.

## 2. Widget-Emitted Intents
| Intent | Payload | Notes |
|--------|---------|-------|
| `find_product` | `{ sessionId, filters?: { category?, priceMin?, priceMax?, readyToShip?, metal? } }` | Sent on chips/CTA for recommendations. |
| `track_order` | `{ sessionId, orderNumber?, email?, postalCode? }` | Requires orderNumber OR email+postalCode. |
| `return_exchange` | `{ sessionId, orderNumber, option: 'resize'|'return'|'care', reason?, notes? }` | Idempotency via header. |
| `sizing_repairs` | `{ sessionId }` | Shortcut to escalate for resizing info. |
| `care_warranty` | `{ sessionId }` | Triggers care tips copy. |
| `financing` | `{ sessionId }` | Opens financing offer. |
| `stylist_contact` | `{ sessionId, contact?: { name?, email?, phone? } }` | After human handoff requests. |
| `csat` | `{ sessionId, rating: 'great'|'needs_follow_up', intent?, comment? }` | Post-flow feedback. |

Recommendation-only scope intentionally omits intents such as `capsule_reserve` and inspiration uploads—they will be reintroduced behind a future feature flag.

## 3. Configurable Copy Hooks & SLA Text
- `sla.processing.delay` → text when processing longer than SLA.
- `returns.expired` → copy for expired window.
- Hooks live in `content/widget.ts` with localization support.

## 4. End-to-End Examples

### 4.1 Journey: “Find my ring”
1. Widget emits `find_product` `{ sessionId: "sess_123", filters: { readyToShip: true, priceMax: 4000 } }`.
2. Service responds with messages:
   - `assistant_text` → “Here are ready-to-ship rings within your budget.”
   - `product_card` with two entries (Solaris Aura Ring, Constellation Ear Stack).
   

### 4.2 Journey: “Track my order”
1. Widget emits `track_order` `{ sessionId: "sess_track", orderNumber: "GG-12001" }`.
2. Service responds:
   - `order_status` timeline (created, processing with isCurrent true).
   - `assistant_text` summarizing estimate (copyHook `sla.processing.status`).
   - `csat_bar` question “Did Aurora help today?”
3. User taps negative → widget emits `csat` { rating: `needs_follow_up` }, auto-open `escalation_form`.

### 4.3 Journey: “Returns & resizing”
1. Widget emits `return_exchange` `{ sessionId: "sess_return", orderNumber: "GG-11982", option: "resize" }`.
2. Service responds:
   - `assistant_text` confirming eligibility + window.
   - `escalation_form` to capture ring size.
   - `offer_card` for care refresh (optional upsell).
3. Submission yields new `assistant_text` (copyHook `returns.confirmation`).

## 5. Compatibility Notes
- Future message types: clients must ignore unfamiliar `type` values gracefully, logging for diagnostics. Additive changes (optional fields, new message types) are backward compatible. Breaking changes (renaming/removing fields) require spec version bump (e.g., 1.1.0 → 2.0.0) and documentation in advance.
