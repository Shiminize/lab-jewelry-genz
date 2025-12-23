# Step 1 – Config & Routing Spec

## Config Spec
| Env Var | Meaning | Expected URL Pattern | Stub Fallback URL | Required Headers |
| - | - | - | - | - |
| CONCIERGE_PRODUCTS_ENDPOINT | Product discovery POST endpoint for widget intents | `https://<host>/api/concierge/products` | `/api/stub/concierge/products` | `Authorization: Bearer <token>`, `x-request-id` |
| CONCIERGE_ORDER_STATUS_ENDPOINT | Order status lookup POST (orderNumber or email+zip) | `https://<host>/api/concierge/orders/status` | `/api/stub/concierge/orders/status` | `Authorization`, `x-request-id` |
| CONCIERGE_RETURNS_ENDPOINT | Return/resize initiation POST | `https://<host>/api/concierge/orders/returns` | `/api/stub/concierge/orders/returns` | `Authorization`, `x-request-id`, `x-idempotency-key` (when available) |
| CONCIERGE_CAPSULE_ENDPOINT | Capsule hold POST for shortlist reservations | `https://<host>/api/concierge/capsule` | `/api/stub/concierge/capsule` | `Authorization`, `x-request-id`, `x-idempotency-key` (when available) |
| CONCIERGE_STYLIST_ENDPOINT | Human stylist ticket creation POST | `https://<host>/api/concierge/stylist` | `/api/stub/concierge/stylist` | `Authorization`, `x-request-id` |
| CONCIERGE_CSAT_ENDPOINT | CSAT capture POST | `https://<host>/api/analytics/csat` | `/api/stub/concierge/analytics/csat` | `Authorization`, `x-request-id` |
| CONCIERGE_SHORTLIST_ENDPOINT | Shortlist persistence POST | `https://<host>/api/concierge/shortlist` | `/api/stub/concierge/shortlist` | `Authorization`, `x-request-id` |
| CONCIERGE_INSPIRATION_ENDPOINT | Inspiration upload metadata POST | `https://<host>/api/concierge/inspiration` | `/api/stub/concierge/inspiration` | `Authorization`, `x-request-id` |
| CONCIERGE_ORDER_UPDATES_ENDPOINT | Order-updates subscription POST | `https://<host>/api/concierge/order-updates` | `/api/stub/concierge/order-updates` | `Authorization`, `x-request-id` |

_All concierge calls include the bearer key sourced from `CONCIERGE_API_KEY`._

## Routing Table
| Intent (from `intentRules.ts`) | Endpoint Env | Required Request Fields | Required Headers | Success Response Summary |
| - | - | - | - | - |
| `find_product` | CONCIERGE_PRODUCTS_ENDPOINT | `sessionId:string`; `filters:{category?:string, priceBand?:string, readyToShip?:boolean, metal?:string, tags?:string[]}` | `Authorization`, `x-request-id` | `{products:[{id,title,price,category,metal,readyToShip,badges,tags,image,shippingPromise}]}` |
| `track_order` | CONCIERGE_ORDER_STATUS_ENDPOINT | `sessionId:string`; `lookup:{orderNumber?:string, email?:string, zip?:string}` (must supply orderNumber or email+zip) | `Authorization`, `x-request-id` | `{reference, entries[{label,status,date}], carrier, tracking, eta, exception?}` |
| `return_exchange` | CONCIERGE_RETURNS_ENDPOINT | `sessionId:string`; `orderNumber:string`; `reason:string`; `items:[{lineId:string, action:"return"|"resize", notes?:string}]` | `Authorization`, `x-request-id`, `x-idempotency-key` | `{rmaId,labelUrl,status,orderId,idempotencyKeyEcho?}` |
| `capsule_reserve` | CONCIERGE_CAPSULE_ENDPOINT | `sessionId:string`; `shortlistId:string`; `customerEmail:string` | `Authorization`, `x-request-id`, `x-idempotency-key` | `{capsuleId,expiresAt,shortlistCount,idempotencyKeyEcho?}` |
| `stylist_contact` | CONCIERGE_STYLIST_ENDPOINT | `sessionId:string`; `customerEmail:string`; `transcriptSummary:string`; `shortlistId?:string`; `uploads?:string[]` | `Authorization`, `x-request-id` | `{ok:boolean,ticketId,slaMinutes,queuePosition?}` |
| `csat` | CONCIERGE_CSAT_ENDPOINT | `sessionId:string`; `intent:string`; `rating:number(1-5)`; `comment?:string` | `Authorization`, `x-request-id` | `{ok,rating,sessionId,requestId,storedAt,agentNotified?}` |
| `shortlist_save` | CONCIERGE_SHORTLIST_ENDPOINT | `sessionId:string`; `products:[{productId:string, variantId?:string}]`; `customerEmail?:string` | `Authorization`, `x-request-id` | `{shortlistId,items,sessionId,createdAt,updatedAt}` |
| `inspiration_upload` | CONCIERGE_INSPIRATION_ENDPOINT | `sessionId:string`; `uploadId:string`; `metadata:{type:"image"|"video", caption?:string, source:string}` | `Authorization`, `x-request-id` | `{ok,url,originalFileName,contentType,sizeBytes,inspirationId,moderationStatus?}` |
| `order_updates_subscribe` | CONCIERGE_ORDER_UPDATES_ENDPOINT | `sessionId:string`; `orderNumber:string`; `contact:{email?:string, phone?:string, channel:"email"|"sms"}`; `consent:boolean` | `Authorization`, `x-request-id` | `{ok,subscriptionId,channel,maskedDestination,nextUpdateEta?}` |

## `.env.local` Example
```
CONCIERGE_PRODUCTS_ENDPOINT=http://localhost:3000/api/stub/concierge/products
CONCIERGE_ORDER_STATUS_ENDPOINT=http://localhost:3000/api/stub/concierge/orders/status
CONCIERGE_RETURNS_ENDPOINT=http://localhost:3000/api/stub/concierge/orders/returns
CONCIERGE_CAPSULE_ENDPOINT=http://localhost:3000/api/stub/concierge/capsule
CONCIERGE_STYLIST_ENDPOINT=http://localhost:3000/api/stub/concierge/stylist
CONCIERGE_CSAT_ENDPOINT=http://localhost:3000/api/stub/concierge/analytics/csat
CONCIERGE_SHORTLIST_ENDPOINT=http://localhost:3000/api/stub/concierge/shortlist
CONCIERGE_INSPIRATION_ENDPOINT=http://localhost:3000/api/stub/concierge/inspiration
CONCIERGE_ORDER_UPDATES_ENDPOINT=http://localhost:3000/api/stub/concierge/order-updates
```

## Frontend Usage Flow
1. `config.ts` resolves each endpoint by reading the env var and falling back to the stub URL when unset.
2. `services.ts` pulls URLs from `config.ts`, generates a fresh `x-request-id` when needed, attaches headers (including `x-idempotency-key` for returns and capsule retries), and performs the POST.
3. `scripts.ts` maps widget intents to service methods; `SupportWidget.tsx` dispatches intents without embedding URL logic.

## Assumptions & Deltas (TODO-CONFIRM)
- `contact` object for order updates supports exactly one channel per request.
- `filters.priceBand` uses string tokens such as `"<2500"`, `"2500-5000"`, `"5000+"`.
- All concierge endpoints share the same bearer scope provided by `CONCIERGE_API_KEY`.
- `requestId` may be omitted in payloads because the header is authoritative; `services.ts` will auto-populate missing values.

## Next Actions
- Validate the above assumptions with backend stakeholders.
- Document the `x-idempotency-key` format expectations once confirmed.
- Ensure local stub routes mirror these shapes for QA.
