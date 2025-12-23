# Concierge Data Mapping & Validation

## A. Product Cards (Widget ← `products` collection)
| widget_field | source_path | type | transform | default | validation rule | example |
|--------------|-------------|------|-----------|---------|------------------|---------|
| title | `products.name` | string | Trim, Title Case | "GlowGlitch Product" | Must be non-empty; truncate at 80 chars | "Solaris Aura Ring" |
| specLine | `products.metadata.specLine` OR concat `primaryMetal` + `primaryGemstone` | string | If missing, build "{metal} · {primaryGemstone}" (skip null pieces) | "" | ≤120 chars | "14k yellow gold · lab diamond halo" |
| price | `products.pricing.basePrice` | number | Format currency (USD; >1000 no decimals) | 0 | Must be ≥0; if 0 display "Contact for pricing" | 3850 |
| currency | `products.pricing.currency` | string | Uppercase ISO | "USD" | ISO 4217; fallback USD | "USD" |
| heroImage | `products.media.primary` or `products.images.primary` | string (URI) | Select first non-empty; apply CDN params | Placeholder URL | Valid URI else fallback `https://cdn.glowglitch.com/placeholder.jpg` | `https://cdn.glowglitch.com/solaris.jpg` |
| tags | `products.metadata.tags` | array[string] | Lowercase, alphanumeric/underscore; limit 4 | `[]` | Drop invalid entries | `["halo", "lab_diamond"]` |
| styleTags | `products.styleTags` or same as tags | array[string] | Lowercase snake-case | `[]` | Optional | `["ear_stack"]` |
| readyToShip | `products.metadata.readyToShip` | boolean | none | false | If true but inventory 0 ⇒ treat as backordered | true |
| shippingPromise | `products.metadata.shippingPromise` | string | If readyToShip true and missing, set "Ships this week" | "Made to order" | ≤60 chars | "Ships this week" |
| metal | `products.metadata.primaryMetal` | string | Lowercase then Title Case | "Mixed metal" | Non-empty when available; fallback "Mixed metal" | "14k yellow gold" |
| badges | Derived: `metadata.bestsellerScore`, `metadata.limitedDrop`, `createdAt` | array[string] | Add "Bestseller" if score ≥0.8 or rank ≤50; "Limited drop" when true; "New" if created <30 days | `[]` | Max 3; unique | `["Bestseller"]` |
| shippingNote | `inventory.available` | string | If readyToShip false & available 0 → "Made on demand" | "" | Optional | "Made on demand" |

**Validation summary**
- Reject product if price null/negative.
- If readyToShip & inventory=0 → display "Ships in 4–6 weeks" + badge "Backordered".
- Log warning when hero image missing; use placeholder.
- Currency always formatted `$3,850` (>1000) or `$295.00` (<1000).

## B. Order Status Timeline (Widget ← `orders` collection)
| widget_field | source_path | type | transform | default | validation rule | example |
|--------------|-------------|------|-----------|---------|------------------|---------|
| timeline[] | `orders.statusHistory[]` | array | Normalize codes | [] | chronological | `[ {...} ]` |
| event.label | `statusHistory.label` or derived | string | Use mapping table per status | "" | Non-empty | "Order confirmed" |
| event.status | `statusHistory.code` | enum | Map vendor codes → {created, payment_captured, processing, shipped, out_for_delivery, delivered, exception} | created | Unknown → exception | "processing" |
| event.timestamp | `statusHistory.at` | datetime | ISO8601 | null | Required else infer | `2025-05-03T14:00:00Z` |
| event.isCurrent | derived | boolean | Latest non-terminal event flagged | false | Only one true | true |
| shipping.carrier | `orders.shipping.carrier` | string | Title Case | "GlowGlitch" | Optional | "UPS" |
| shipping.service | `orders.shipping.method` | string | Title Case | "" | Optional | "GlowExpress Overnight" |
| shipping.trackingNumber | `orders.shipping.trackingNumber` | string | Uppercase | "" | Optional | "1Z999AA10123456784" |
| shipping.trackingUrl | derived | string | Build from carrier + trackingNumber | "" | Valid URI if present | `https://ups.com/track?1Z...` |
| shipping.estimatedDelivery | `orders.shipping.estimatedDelivery` | datetime | ISO8601 | null | Optional | `2025-05-06T20:00:00Z` |
| shipping.deliveredAt | `orders.shipping.deliveredAt` | datetime | ISO8601 | null | Optional | `2025-05-04T17:30:00Z` |

**Inference rules**
- Use statusHistory when present. Otherwise: `created` from `createdAt`; `payment_captured` when `payment.status == 'captured'`; `processing` when order status ∈ {processing, confirmed}; `shipped` when trackingNumber exists; `out_for_delivery` when courier event (TODO carrier integration); `delivered` when `deliveredAt` set; else `exception`.

**SLA triggers**
- created→payment_captured >24h → concierge alert.
- payment_captured→processing >12h → escalate.
- processing→shipped >72h → escalate.
- shipped→delivered >18h past estimate → escalate.
- exception → immediate human intervention.

## C. Returns & Resizes
| widget_field | source_path | type | transform | default | validation rule | example |
|--------------|-------------|------|-----------|---------|------------------|---------|
| eligibility.state | Derived from order (status, delivery date, categories) | enum | Determine `eligible`, `resize_only`, `not_allowed` | not_allowed | Evaluate windows + categories exclusion | `eligible` |
| eligibility.reason | Derived | string | Human-readable explanation | "" | Provide copy for UI | "Within 30-day window." |
| window.return | Delivery date + 30 days | string | ISO date | null | If current date > window → block returns | `Return window ends 2025-05-15` |
| window.resize | Delivery date + 60 days | string | ISO date | null | If current date > window → block resize | `Resize window ends 2025-06-14` |
| excludedCategories | `orders.items[].category` | array[string] | If any ∈ {custom, engraved, final_sale}, mark not_allowed | [] | Block return path, allow escalate | `["custom"]` |
| idempotencyKey | Request header | string | Required; stored per order/option | none | Duplicate key => 409 | `return-gg-12001` |
| reentryPolicy | Derived from RMA history | string | `allow_resize_only`, `allow_care_only`, `blocked` | blocked | Determine ability to submit new request | `allow_resize_only` |

**Rules**
- Return eligibility: delivered ≤30 days, no excluded category.
- Resize eligibility: delivered ≤60 days, ring size within policy (TODO confirm 4–10).
- Multiple RMAs allowed once previous closed; duplicates with same idempotency key return 409.
- Orders with status `cancelled`/`chargeback` → `not_allowed` with copy "Return or resize unavailable.".

---

## Appendix: Edge & Null Handling

| # | Situation | Expected Widget Copy / Behavior |
|---|-----------|--------------------------------|
| 1 | Product price null | Hide card; log error "product.price_missing"; analytics alert. |
| 2 | Product price zero | Show "$0"? No → display "Contact for pricing"; disable CTA. |
| 3 | Hero image missing | Use placeholder image; badge "Preview". |
| 4 | Tags empty | Hide tag chips; no error. |
| 5 | readyToShip true but inventory 0 | Replace shipping promise with "Ships in 4–6 weeks"; add badge "Backordered". |
| 6 | Out-of-stock product with readyToShip false | Label "Made on demand"; keep card. |
| 7 | Order lookup not found | Message: "We couldn’t find that order. Double-check the number or email." |
| 8 | Order status exception | Show status "Needs attention"; auto-offer stylist escalation. |
| 9 | Return window expired | Copy: "Your order is outside our 30-day return window." Show escalate CTA. |
|10 | Custom/engraved item attempt return | Copy: "Custom and engraved pieces require concierge assistance." Route to stylist. |
|11 | Capsule duplicate submission | Copy: "Your capsule is already reserved. We’ll follow up soon." |
|12 | CSAT negative rating | Auto-open escalation form with contact prefilled. |
|13 | Inspiration upload fails | Toast: "Upload failed—email concierge@glowglitch.com and we’ll attach it manually." |
|14 | Order updates without consent | Prompt copy "Please accept order update consent to continue." |
|15 | Missing idempotency key on returns | API returns 400 `validation.idempotency_required`; widget copy: "Please retry—something went wrong saving your request." |

**Assumptions to confirm:**
- Final taxonomy for `products.category` and `primaryMetal` enumerations.
- Resize policy ring size bounds and excluded materials (e.g., titanium?).
- Carrier event feed availability for `out_for_delivery` detection.
