# Concierge Widget – Link Integration Checklist

Use this runbook when connecting the widget to production services. It reflects the `Agent_WidgetLinkIntegrator.md` responsibilities.

## 1. Environment Setup
- Populate the following variables in `.env.local`/`.env.production`:
  - `CONCIERGE_PRODUCTS_ENDPOINT`
  - `CONCIERGE_ORDER_STATUS_ENDPOINT`
  - `CONCIERGE_RETURNS_ENDPOINT`
  - `CONCIERGE_CAPSULE_ENDPOINT`
  - `CONCIERGE_STYLIST_ENDPOINT`
  - `CONCIERGE_CSAT_ENDPOINT`
  - `CONCIERGE_SHORTLIST_ENDPOINT`
  - `CONCIERGE_INSPIRATION_ENDPOINT`
  - `CONCIERGE_ORDER_UPDATES_ENDPOINT`
  - Optional: `CONCIERGE_API_KEY` (Bearer token used by all concierge service calls)

## 2. Service Contracts
- Products search:
  - Method: `POST`
  - Body: `{ category?, budgetMin?, budgetMax?, metal?, readyToShip? }`
  - Response: `[{ id, title, price, image?, tags?, shippingPromise? }]`
- Order status:
  - Method: `POST`
  - Body: `{ orderId }` **or** `{ email, postalCode }`
  - Response: `{ reference, entries: [{ label, date?, status }] }`
- Returns/Resizing:
  - Method: `POST`
  - Body: `{ option: 'resize' | 'return' | 'care' }`
  - Response: `{ message }`
- Capsule reservation:
  - Method: `POST`
  - Body: `{ shortlist: ProductSummary[], ... }`
  - Response: `{ message, reservationId? }`
- Stylist ticket:
  - Method: `POST`
  - Body: `{ name?, email, notes?, timePreference?, shortlist, sessionId }`
  - Response: `{ ok: boolean, ticketId?, message? }`
- CSAT:
  - Method: `POST`
  - Body: `{ rating: 'great' | 'needs_follow_up', notes?, intent?, sessionId }`
  - Response: `{ ok: boolean }`
- Shortlist persistence:
  - Method: `POST`
  - Body: `{ sessionId, items: ProductSummary[] }`
  - Response: `{ ok: boolean, shortlistId? }`
- Inspiration upload:
  - Method: `POST` (multipart form)
  - Body: `file`, `sessionId`
  - Response: `{ ok: boolean, url? }`
- Order updates subscription:
  - Method: `POST`
  - Body: `{ sessionId, originIntent?, contact? }`
  - Response: `{ ok: boolean, message? }`

## 3. Implementation Notes
- `src/lib/concierge/services.ts` automatically routes to configured endpoints; if unset, it falls back to local stubs for dev.
- API routes under `src/app/api/support/*` call the service helpers and surface 502 errors when downstream requests fail.
- Front-end handlers (`executeIntent`) already pass the correct payload shape; only ensure external services accept the same structure.

## 4. Verification Steps
1. Start dev server with env variables pointed to staging endpoints.
2. Trigger each widget journey:
   - `Design ideas`, `Gifts under $300`, `Ready to ship` → expect live products.
   - `Track my order` → verify timeline pulls real milestones.
   - `Returns & resizing` → confirm resize/return responses.
   - `Reserve my capsule` → ensure reservation ID logged.
   - `Talk to stylist` → confirm ticket created in CRM.
   - CSAT → verify analytics store receives event.
3. Inspect browser Network tab to confirm 200 responses and no PII leakage.
4. Monitor server logs for 502 fallback errors.

> For local demos without live services, run `npm run seed:mock` to insert sample orders and rely on built-in concierge stubs.

## 5. Observability
- Add dashboard alerts for each endpoint (>=5 failures/5min).
- Log request IDs from downstream services and include in widget telemetry (`trackEvent` metadata).

## 6. Rollout
- Validate staging → production toggles by switching env endpoints.
- Keep stubs for local dev; they remain active when env vars are absent.

_Last updated: 2025-10-10_
