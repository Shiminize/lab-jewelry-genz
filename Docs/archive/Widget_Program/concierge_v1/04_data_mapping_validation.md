# Step 4 – Data Mapping & Validation v1

## Section A – Product Cards
| widget_field | source_path | type | transform | default | validation rule | example |
| - | - | - | - | - | - | - |
| title | products.name | string | Normalize to Title Case | "Aurora Piece" | Must be non-empty string | "Emerald Halo Ring" |
| price | products.pricing.basePrice | number | Round to 2 decimals | 0.00 | Must be greater than 0 | 3250.00 |
| currency | products.pricing.currency | string | Uppercase ISO 4217 | "USD" | Must be 3-letter code | "USD" |
| shippingPromise | products.metadata.readyToShip | string | If true ⇒ "Ships in 2 business days" else map lead time | "Made to order" | readyToShip boolean must exist | "Ships in 2 business days" |
| readyToShip | products.metadata.readyToShip | boolean | Cast to boolean | false | Required | true |
| metal | products.metadata.primaryMetal | string | Lowercase and validate against enum (`platinum`, `14k_yellow`, `14k_white`, `14k_rose`) | "platinum" | Value must exist in enum | "platinum" |
| tags | products.tags | string[] | Deduplicate, lowercase, limit to 10 | [] | Entries ≤20 chars each | ["halo", "art-deco"] |
| badges | products.metadata.badges or derived from bestseller_score | string[] | If `bestseller_score >= 0.9` add "Bestseller" | [] | Badge labels from approved list | ["Bestseller"] |
| image | products.assets.primary.url | string | Enforce HTTPS and fallback placeholder | "https://cdn.aurora.com/placeholders/product.png" | Must start with https:// | "https://cdn.aurora.com/products/emerald-halo.jpg" |

**Validation Rules**
- Missing price ⇒ drop card from response and log warning.
- Inventory `available = 0` ⇒ suppress card unless `metadata.overrideInventory = true`.
- Negative price or missing metal ⇒ raise `CATALOG_DATA_INVALID` diagnostic.

## Section B – Order Status Timeline
| widget_field | source_path | type | transform | default | validation rule | example |
| - | - | - | - | - | - | - |
| reference | orders.orderNumber | string | Uppercase | N/A | Required | "AUR-100045" |
| entries[].label | orders.statusHistory[].displayLabel | string | Fallback to label map for status code | "Order Placed" | Must not be empty | "Packed & Ready" |
| entries[].status | orders.statusHistory[].code | string | Normalize to {created, payment_captured, processing, shipped, out_for_delivery, delivered, exception} | "processing" | Must map to known code | "shipped" |
| entries[].date | orders.statusHistory[].timestamp | string (ISO 8601) | Convert to UTC ISO string | Current timestamp | Must be valid timestamp | "2024-08-11T18:30:00Z" |
| carrier | orders.shipping.carrier | string | Uppercase short name | "UPS" | Required when status ≥ shipped | "UPS" |
| tracking | orders.shipping.trackingNumber | string | Mask middle digits (pattern `1Z***5678`) | "" | Required when carrier present | "1Z***5678" |
| eta | orders.shipping.estimatedArrival | string (ISO 8601) | Use earliest future ETA or derive `shipped + 3 days` | null | Must be future timestamp | "2024-08-14T20:00:00Z" |
| exception | orders.statusHistory where code=exception | string | Take most recent description | null | Optional | "Carrier delay due to weather" |

**SLA Triggers**
- `processing` lasting >48h ⇒ escalate to support queue.
- `shipped` without tracking update after 24h ⇒ escalate.
- `out_for_delivery` longer than 48h without `delivered` ⇒ customer outreach.

## Section C – Returns & Resizes
| widget_field | source_path | type | transform | default | validation rule | example |
| - | - | - | - | - | - | - |
| eligibility | compare `orders.purchaseDate` to `policy.returnWindowDays` | boolean | `today - purchaseDate <= returnWindowDays` | false | Custom items (`products.metadata.isCustom`) are ineligible | true |
| resizeEligibility | products.metadata.canResize | boolean | Validate ring size bounds (TODO) | false | If false ⇒ route to stylist | true |
| status | returns.status | string | Map backend code to {return_pending, label_issued, resize_scheduled, refund_sent, inspection_in_progress} | "return_pending" | Must be in set | "label_issued" |
| idempotencyKeyEcho | headers[`x-idempotency-key`] | string | Echo when present | null | ≤64 characters | "idem-abc123" |
| rmaId | returns.rmaId | string | Uppercase | Required | "RMA-9087" |
| labelUrl | returns.assets.labelUrl | string (URL) | Enforce HTTPS | null | Required when status ≥ `label_issued` | "https://cdn.aurora.com/labels/RMA-9087.pdf" |

## Edge & Null Handling Appendix
| case | trigger | expected widget copy |
| - | - | - |
| Missing price | `products.pricing.basePrice` null | "We’re confirming pricing—please check back shortly." |
| Inventory zero | `inventory.available = 0` | "Currently unavailable. Explore similar styles." |
| Unknown metal | Metal not in enum | "Mixed metal finish (confirm with stylist)." |
| Missing statusHistory | `orders.statusHistory` absent | "Tracking details coming soon." |
| No tracking number | Carrier present but tracking missing | "Carrier is preparing your tracking number. Check back within 24 hours." |
| ETA past due | `eta < now` | "Delivery running late — we’re monitoring this." |
| Return window closed | `daysSincePurchase > returnWindowDays` | "This order is outside our return window. Let’s connect you with a stylist." |
| Resize not allowed | `canResize = false` | "This piece cannot be resized; a stylist will share options." |
| Capsule already active | Active capsule not expired | "You already have a capsule reserved until <expiresAt>. We’ll refresh it for you." |
| CSAT low rating | `rating <= 2` | "Thanks for the feedback—we’ll reach out soon." |

## Assumptions & Deltas (TODO-CONFIRM)
- Return window default 30 days; resize allowed within ±2 ring sizes.
- Additional return statuses (`refund_sent`, `inspection_in_progress`) to be confirmed by operations.
- Masking pattern `1Z***5678` meets security requirements.
- Bestseller badge threshold remains `bestseller_score >= 0.9`.

## Next Actions
- Confirm policy parameters (return window, resize bounds) with Concierge Ops.
- Implement validation checks inside data loaders once backend is ready.
- Extend edge-case copy deck with localization once tone review is complete.
