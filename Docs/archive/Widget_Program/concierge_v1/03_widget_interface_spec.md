# Step 3 – Widget Interface Spec v1

## Message Types
| type | required fields | optional fields | definition |
| - | - | - | - |
| `assistant_text` | `id`, `timestamp`, `text` | `tone`, `cta` | Plain prose response from the concierge assistant. |
| `product_card` | `id`, `timestamp`, `products[]` (each with `id`, `title`, `price`, `image`, `category`, `metal`, `readyToShip`, `badges`, `tags`, `shippingPromise`) | `caption`, `seeMoreUrl` | Grid of recommended products rendered inline. |
| `offer_card` | `id`, `timestamp`, `headline`, `description`, `cta.label`, `cta.intent` | `cta.payload`, `expiresAt` | Promotional or service offer surfaced contextually. |
| `escalation_form` | `id`, `timestamp`, `formId`, `fields[]` (`name`, `label`, `type`, `required`) | `prefill`, `submitLabel`, `slaMinutes` | Collects details for human stylist escalation. |
| `csat_bar` | `id`, `timestamp`, `prompt`, `scaleMin`, `scaleMax`, `intentContext` | `followUpCopy` | Inline customer satisfaction capture widget. |
| `order_status` | `id`, `timestamp`, `reference`, `entries[]` (`label`, `status`, `date`), `carrier`, `tracking`, `eta` | `exception`, `supportCta` | Order timeline visualization for progress tracking. |

## Emitted Intents & Payloads
| intent | payload fields | notes |
| - | - | - |
| `find_product` | `sessionId`; `filters:{category?, priceBand?, readyToShip?, metal?, tags?}` | Triggers product discovery call via products endpoint. |
| `track_order` | `sessionId`; `lookup:{orderNumber? | (email? + zip?)}` | Validates one complete lookup path before sending. |
| `return_exchange` | `sessionId`; `orderNumber`; `reason`; `items:[{lineId, action, notes?}]` | `action` ∈ {`return`, `resize`}; passes through to returns endpoint. |
| `sizing_repairs` | `sessionId`; `orderNumber?`; `notes` | Routed to stylist service when precise endpoint unavailable. |
| `care_warranty` | `sessionId`; `topic`; `contact?` | Surfaces knowledge base content or escalates. |
| `financing` | `sessionId`; `budgetRange?`; `contact?` | Currently informational; no backend call yet. |
| `stylist_contact` | `sessionId`; `customerEmail`; `summary`; `shortlistId?`; `uploads?` | Creates human stylist ticket. |
| `capsule_reserve` | `sessionId`; `shortlistId`; `customerEmail` | Requires idempotency on retry; reserves capsule. |
| `csat` | `sessionId`; `intent`; `rating`; `comment?` | Posts CSAT feedback to analytics endpoint. |
| `order_updates_subscribe` | `sessionId`; `orderNumber`; `contact:{email?/phone?, channel}`; `consent` | Subscribes customer to shipping notifications. |

## UI Copy Hooks
| hook | description | default copy |
| - | - | - |
| `shippingPromise` | Product card shipping message | "Ships in 2 business days" |
| `csatPrompt` | CSAT bar question | "How was your concierge experience?" |
| `escalationSlaText` | Escalation form SLA hint | "Human stylist will reply within 45 minutes." |
| `offerBadge` | Offer card badge text | "Concierge Exclusive" |

## End-to-End Transcripts
**Find My Ring**
1. Widget emits `find_product` with filters `{"category":"ring","readyToShip":true}`.
2. Service calls `/api/concierge/products` and receives `product_card` plus an optional `offer_card` encouraging capsule holds.
3. Customer selects "Reserve capsule" CTA, emitting `capsule_reserve`.
4. Capsule response returns `assistant_text` confirming `"Capsule reserved until <timestamp>."`

**Track My Order**
1. Widget emits `track_order` payload `{"orderNumber":"AUR-100045"}`.
2. Service retrieves order timeline via `/api/concierge/orders/status` and returns an `order_status` message.
3. Widget surfaces an `offer_card` prompting updates subscription; user opts in.
4. Emitted `order_updates_subscribe` completes and returns `assistant_text` acknowledging masked destination.

**Returns & Resizing**
1. Widget guides customer through reason capture and emits `return_exchange` with line items.
2. `/api/concierge/orders/returns` responds with RMA confirmation and label link displayed as `assistant_text` plus download CTA.
3. Widget immediately renders `csat_bar` to capture post-flow sentiment.

## Compatibility Note
- Clients must handle unknown message types gracefully by ignoring unrecognized `type` values.
- Increment `interfaceVersion` whenever new required fields are added; optional fields can be appended without a breaking change.

## Assumptions & Deltas (TODO-CONFIRM)
- `sizing_repairs` intent routes through stylist workflow until dedicated API exists.
- `financing` intent is informational only; future endpoint TBD.
- `interfaceVersion` default `1.0.0` and returned within session metadata (implementation detail to confirm).

## Next Actions
- Confirm future handling for `financing` and `care_warranty` intents once backend capabilities exist.
- Align message serialization fields with `src/lib/concierge/types.ts` definitions.
- Socialize compatibility note with frontend team to ensure graceful degradation.
