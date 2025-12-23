# Aurora Concierge Analytics Event Catalog
Version: 1.0.0 (2025-10-10)

## Event Definitions (CSV-style)
```
Event,Description,Required Props,Optional Props,PII Policy
aurora_widget_open,Widget launcher opened,{sessionId,requestId,source},{userRole,entryPoint},No PII (session only)
aurora_intent_detected,Widget detected/received intent,{sessionId,requestId,intent},{source,filters},No PII beyond intent
aurora_intent_complete,Intent finished executing,{sessionId,requestId,intent},{durationMs,outcome},No PII beyond intent
aurora_products_shown,Product carousel rendered,{sessionId,requestId,intent,productIds},{offerId,readyToShipCount},Product IDs allowed; no customer PII
aurora_product_shortlisted,Product saved to shortlist,{sessionId,requestId,productId},{position,ctaId},No PII
aurora_product_shortlist_error,Shortlist failure surfaced,{sessionId,requestId,productId},{error},No PII
aurora_product_view,Guest clicked product detail,{sessionId,requestId,productId},{source},No PII
aurora_order_tracked,Order timeline fetched,{sessionId,requestId,intent},{orderNumberHash,status},Hash order numbers; no raw identifiers
aurora_return_initiated,Return/resize request submitted,{sessionId,requestId,orderNumberHash,option},{eligibilityState},Hash order numbers; no address data
aurora_stylist_ticket_created,Human ticket created,{sessionId,requestId,ticketId},{priority,queue},{contactEmailHash}
aurora_csat_submitted,CSAT rating completed,{sessionId,requestId,rating},{intent,commentLength},No raw comments stored; summarize length only
aurora_order_updates_subscribed,Order update opt-in,{sessionId,requestId,channel},{orderNumberHash},{channel=email? store hash only}
aurora_timeline_text_updates,Timeline SMS opted in via widget,{sessionId,requestId,success},{orderNumberHash},Hash order numbers
aurora_timeline_text_updates_error,Timeline SMS opt-in failed,{sessionId,requestId},{error},No PII
aurora_widget_close,Widget closed,{sessionId,requestId,source},-,No PII
aurora_inline_track_order,Quick action tapped,{sessionId,requestId},-,No PII
aurora_inline_stylist,Quick action tapped,{sessionId,requestId},-,No PII
```

## Event Schemas
- `sessionId` (string) – Widget session identifier.
- `requestId` (string) – Server-generated ID, matches x-request-id.
- `intent` (string enum) – concierge intents defined in widget spec.
- `productIds` (array[string]) – product identifiers rendered.
- `productId` (string) – single product identifier.
- `ticketId` (string) – stylist ticket identifier.
- `orderNumberHash` (string) – SHA-256 hash of order number with salt.
- `channel` (string enum: `sms`, `email`).
- PII rules: contact emails/phones must be hashed before emission; no free-form comments stored.

## Journey Event Sequences
### Find My Ring
```
aurora_widget_open → aurora_intent_detected(intent=find_product) → aurora_products_shown → aurora_product_shortlisted (optional) → aurora_csat_submitted
```

### Track My Order
```
aurora_widget_open → aurora_intent_detected(intent=track_order) → aurora_order_tracked → aurora_order_updates_subscribed (optional) → aurora_csat_submitted
```

### Returns & Resizing
```
aurora_widget_open → aurora_intent_detected(intent=return_exchange) → aurora_return_initiated → aurora_stylist_ticket_created (if escalation) → aurora_csat_submitted
```

## Sampling & Retention
- Sampling: 100% of events in staging; 100% in production until baseline is established. Evaluate sampling after 30 days; minimum 50% for high-volume events (`aurora_products_shown`).
- Retention: store raw events 180 days; aggregate metrics retained indefinitely. Apply GDPR deletion pipeline keyed by sessionId.
- Streaming: deliver to warehouse within 5 minutes via Kafka topic `aurora.events`.

## Attribution & Funnel
Primary funnels:
1. **Product Engagement Funnel**: `aurora_widget_open` → `aurora_products_shown` → `aurora_product_shortlisted`.
2. **Support Resolution Funnel**: `aurora_intent_detected(track_order)` → `aurora_order_tracked` → `aurora_stylist_ticket_created` → `aurora_csat_submitted` (rating=great).
3. **Return Funnel**: `aurora_intent_detected(return_exchange)` → `aurora_return_initiated` → `aurora_stylist_ticket_created` (if needed) → `aurora_csat_submitted`.

Attribution rules: credit conversions to last `aurora_intent_detected` preceding the conversion event within 30-minute session window.

## KPI Mapping (Appendix)
| KPI | Events | Calculation |
|-----|--------|-------------|
| Shortlist conversion rate | aurora_product_shortlisted / aurora_products_shown | % of product presentations leading to shortlist |
| Support resolution NPS proxy | aurora_csat_submitted (rating=great) / total CSAT | Customer satisfaction |
| Order tracking success | aurora_order_tracked / aurora_intent_detected(track_order) | Response success rate |
| Return automation rate | aurora_return_initiated / aurora_intent_detected(return_exchange) | % resolved without human intervention |
| Ticket escalation load | Count aurora_stylist_ticket_created per day | Staffing planning |
