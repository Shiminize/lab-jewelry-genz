# Concierge Widget Backend Integration Plan

> Prepared by Agent_WidgetLinkIntegrator & Agent/data-seed-status – Oct 2025  
> Goal: connect the concierge widget to production APIs, document data dependencies, and align dashboard hand‑offs.

---

## 1. Data Inventory & Seed Status

### Product Catalog
- **Source**: MongoDB `products` collection. Populated via `scripts/seed-database.js` using `generate-full-seed-cjs`.
- **Fields**: `name`, `pricing.basePrice`, `category`, `metadata.readyToShip`, `metadata.accentTone`, `media`, etc.
- **Existing APIs**:
  - `GET /api/neon/catalog` (`services/neon/catalogRepository.ts`) – returns preview cards (no server-side filtering yet).

### Orders
- **Source**: MongoDB `orders` collection. Accessed by `src/services/admin/orders.ts`.
- **Schema Highlights**: `orderNumber`, `status`, `totals.total`, `items[]`, `payment.status`, `shipping.trackingNumber`, `customerEmail`.
- **Dashboards**: `/dashboard/orders` reads summaries & stats.
- **Current gaps**: No public API to expose timeline/status by order number; no returns/progress endpoints.

### Materials & Gemstones
- Seeded alongside products (`seed-database.js`). Useful for concierge filters, but not yet exposed via API.

### Creators / CRM
- `scripts/seed-creators.js` (optional) seeds `creators` collection. Dashboard `/dashboard/creators` consumes this data.
- Concierge escalation should link to CRM/ticket system; currently only stubbed.

### Widget Session Data (new requirement)
- No existing collections. We will introduce:
  - `widgetShortlists` – stores `{ sessionId, items[], createdAt }`.
  - `widgetInspiration` – stores upload metadata `{ sessionId, assetUrl, originalFileName }`.
  - `widgetOrderSubscriptions` – stores SMS/email opt-ins for shipping updates.

---

## 2. Environment Variables & Target Endpoints

The widget now reads the following variables:

| Env Var | Purpose | Recommended Endpoint / Collection |
|---------|---------|------------------------------------|
| `CONCIERGE_PRODUCTS_ENDPOINT` | Product recommendations | `POST /api/concierge/products` (new) querying `products` collection with filters (category, price, readyToShip, metal). |
| `CONCIERGE_ORDER_STATUS_ENDPOINT` | Order timeline | `POST /api/concierge/orders/status` returning timeline events derived from `orders` docs (`statusHistory`, `shipping`). |
| `CONCIERGE_RETURNS_ENDPOINT` | Resize/return flows | `POST /api/concierge/orders/returns` updating `orders` collection or hitting fulfillment microservice. |
| `CONCIERGE_CAPSULE_ENDPOINT` | 48h hold & render kickoff | `POST /api/concierge/capsule` creating entry in new `capsuleHolds` collection and enqueuing render job. |
| `CONCIERGE_STYLIST_ENDPOINT` | Human escalation | `POST /api/concierge/stylist` writing to CRM (Zendesk/Airtable) + `widgetShortlists`. |
| `CONCIERGE_CSAT_ENDPOINT` | Satisfaction logging | `POST /api/analytics/csat` capturing intent, rating, sessionId (write to `analyticsEvents`). |
| `CONCIERGE_SHORTLIST_ENDPOINT` | Persist shortlist | `POST /api/concierge/shortlist` storing curated items per session (`widgetShortlists`). |
| `CONCIERGE_INSPIRATION_ENDPOINT` | Inspiration upload | `POST /api/concierge/inspiration` streaming to storage (S3) and storing metadata in `widgetInspiration`. |
| `CONCIERGE_ORDER_UPDATES_ENDPOINT` | SMS/email opt-in | `POST /api/concierge/order-updates` hooking to notifications service (Twilio, Braze). |
| `CONCIERGE_API_KEY` | Shared bearer token for concierge microservices. |

> Until production endpoints exist, local dev uses stubs in `src/lib/concierge/stubs/*`.

---

## 3. Implementation Workstream

### 3.1 Backend APIs
1. **Create concierge proxy routes** under `src/app/api/concierge/*` or dedicated serverless functions that:
   - Validate payloads (`zod` schema).
   - Query Mongo collections or downstream services.
   - Map responses to widget contracts defined in `src/lib/concierge/scripts.ts`.
2. **Products**: extend `getCatalogProducts` to accept filters. Example query:  
   ```ts
   db.collection('products').find({
     ...(filters.category ? { category: filters.category } : {}),
     ...(filters.readyToShip ? { 'metadata.readyToShip': true } : {}),
     ...(filters.budgetMax ? { 'pricing.basePrice': { $lte: filters.budgetMax } } : {}),
     ...(filters.metal ? { 'metadata.primaryMetal': filters.metal } : {}),
   })
   ```
3. **Order timeline**: reuse `listAdminOrders` helpers, but compute timeline array (`created`, `processing`, `shipped`, `delivered`). Populate from `order.statusHistory` (if present) or inference based on fields (`shipping.trackingNumber`, `shipping.deliveredAt`).
4. **Returns**: update `orders` doc (`status: 'return_pending'`), generate RMA id, email label. Integrate with fulfillment service if available.
5. **Capsule holds**: design `capsuleHolds` collection: `{ sessionId, shortlist, customerEmail?, expiresAt }`. Trigger render job via existing pipeline (if none, queue message).
6. **Stylist tickets**: call CRM (Airtable/Zendesk). Include widget transcript (last N messages), shortlist, uploads.
7. **CSAT**: write to `analyticsEvents` or dedicated `csatFeedback` collection with intent + rating.
8. **Order updates**: store subscription request and forward to notifications microservice.

### 3.2 Data Persistence Enhancements
- **Widget Sessions**: for resiliency, add backend session store keyed by sessionId storing `messages`, `shortlistId`, `inspirationUrls`. Use TTL index (e.g., expire after 30 days).
- **Uploads**: integrate with existing asset pipeline (S3/Cloudinary). The current stub returns static URL; replace with signed upload.
- **Local testing**: run `npm run seed:mock` to insert synthetic orders (IDs `GG-12001` etc.) so dashboards and widget flows have sample data before live endpoints are connected.

### 3.3 Dashboard Integration
1. **Orders Dashboard**
   - Add column/indicator for `orders.supportTickets` or `orders.csatRating`.
   - Link “View” page to show timeline events submitted via concierge (including subscription status & widget notes).
2. **Support Queue View (new)**
   - Create `/dashboard/support` summarizing:
     - Open stylist tickets generated by widget.
     - Capsule reservations awaiting follow-up.
     - Negative CSAT responses needing action.
   - Data source: new collections (`capsuleHolds`, `widgetSessions`, `csatFeedback`).
3. **Creators Dashboard**
   - If escalation associates `creatorId`, surface conversions credited via widget interactions.

### 3.4 Analytics & Logging
- Replace `trackEvent` stub with a hook that pushes to analytics service:
  - Event payload: `{ event, sessionId, intent, success, requestId }`.
  - Ensure each backend proxy logs `requestId` (generate with `crypto.randomUUID()`).
- Instrument dashboards to read aggregated metrics (e.g., number of widget escalations, CSAT rating distribution).

### 3.5 Security & Governance
- Store `CONCIERGE_API_KEY` in vault/secrets manager; rotate regularly.
- Validate file uploads (size, mime type) before forwarding to storage.
- Ensure returns endpoint guards against duplicate requests (idempotency token).

---

## 4. Step-by-Step Rollout Plan
1. **Define API contracts** using OpenAPI specs for each `CONCIERGE_*` endpoint (share with backend team).
2. **Implement backend services** (staging first), update `.env.local` to point to staging URLs, verify widget behavior.
3. **Add database indexes** for new collections (`widgetShortlists`, `widgetInspiration`, `capsuleHolds`).
4. **Extend dashboards** to surface concierge data (support view, order detail enrichment).
5. **QA**: run widget journeys end-to-end on staging (include inspiration upload, returns, capsule hold).
6. **Monitoring**: configure alerting on new routes (5xx threshold, queue delays).
7. **Deploy to production** with feature flag; monitor analytics and logs before full rollout.

---

## 5. Deliverables & Owners
| Deliverable | Owner | Notes |
|-------------|-------|-------|
| OpenAPI specs & env var documentation | Platform/API team | Reference this document. |
| Concierge service endpoints | Backend team | Implement with auth + logging. |
| Storage pipeline for uploads | Infra/DevOps | Provide signed upload capability. |
| Dashboard updates (`/dashboard/support`) | Dashboard/frontend team | Fetch data from new collections. |
| Analytics pipeline (`aurora_*` events) | Data/analytics team | Build dashboards, retention queries. |

---

**Summary**: UI is ready; next steps are wiring real APIs and exposing concierge activity in the admin dashboards. Use this plan to coordinate between backend, frontend, analytics, and ops teams. Update this document as services go live.
