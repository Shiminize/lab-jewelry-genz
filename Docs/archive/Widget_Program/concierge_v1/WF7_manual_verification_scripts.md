# WF7 – Manual Verification Scripts (Browser & API)

## Pre-Flight
1. Confirm `concierge.realEndpointsEnabled = true` in target environment.
2. Ensure `.env` points to real `/api/concierge/*` endpoints and Mongo seeded.
3. Prepare request headers: `Authorization: Bearer <CONCIERGE_API_KEY>`, unique `x-request-id`, optional `x-idempotency-key` for returns/capsule.
4. Reset widget session (clear storage) to capture fresh `sessionId`.

## Browser Workflow
### A. Product Discovery → Capsule
1. Prompt: “Show me ready-to-ship platinum rings under $4000.”
2. Verify product cards (≤10 items) display required fields.
3. Add two items to shortlist; confirm badge updates.
4. Click “Reserve capsule” → success text with expiration.
5. Database check: `db.capsuleHolds.findOne({ customerEmail: 'capsule+test@aurora.io' })`.

### B. Order Tracking → Subscription
1. Enter order `GG-11982`.
2. Validate timeline progression, masked tracking, ETA.
3. Subscribe to SMS updates; confirm masked destination.
4. DB check: `db.orderSubscriptions.findOne({ orderNumber: 'GG-11982' })`.

### C. Returns → CSAT
1. Initiate return for `GG-11982` line item; note `rmaId`, `labelUrl`.
2. Resubmit with same idempotency key – expect same response.
3. Submit CSAT rating `needs_follow_up`; ensure prompt removed.
4. DB checks: `returns`, `csatResponses` entries with matching sessionId.

### D. Stylist Escalation & Inspiration
1. Request stylist assistance with summary; confirm ticket id + SLA.
2. Upload image (<5 MB); verify pending badge.
3. DB checks: `stylistTickets`, `widgetInspiration` contain records.

## Postman/API Calls
Execute with real endpoints; record request/response IDs.
1. `POST /api/concierge/products` – validated matching product with DB.
2. `POST /api/concierge/orders/status` – confirm timeline arrays.
3. `POST /api/concierge/orders/returns` with idempotency key.
4. `POST /api/concierge/capsule` – test duplicate without idempotency key (409).
5. `POST /api/concierge/shortlist` – check upsert behavior.
6. `POST /api/concierge/inspiration` – test 15 MB fail (400).
7. `POST /api/concierge/stylist` – confirm queue position incrementing.
8. `POST /api/analytics/csat` – inspect stored rating.
9. `POST /api/concierge/order-updates` – duplicate detection.

## Evidence Collection
- Capture screenshots for each browser step.
- Save Postman responses with headers (status, latency).
- Record DB query outputs (redact PII) confirming writes.
- Log analytics event IDs from monitoring dashboard.

## Pass Criteria
- All flows succeed without fallback to stubs.
- DB records match expectations (fields, TTL values).
- No 5xx responses; guardrail errors only when triggered intentionally.
- Analytics events observed for each key action.

## Remediation Steps
- If failure occurs, document `requestId`, reproduction steps.
- Determine whether issue is data, backend, or UI.
- Reference WF8 triage guide for severity classification.

## Assumptions & Deltas (TODO-CONFIRM)
- Manual access to Mongo shell or viewer available in test environment.
- Upload validation possible in staging (mock asset accepted).
- Analytics dashboard accessible to verify events.

## Next Actions
- Schedule verification run before staging → prod cutover.
- Archive evidence in shared location for launch audit.
- Use script results to update readiness checklist (WF9).
