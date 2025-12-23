# Dashboard Data Contract & Flows — Aurora Concierge
Version: 1.0.0 (2025-10-10)

## Routes & Data Requirements

| Route | Data Requirements | UI Elements | Actions |
|-------|-------------------|-------------|---------|
| `/dashboard/orders` | Collections: `orders`, `csatFeedback`, `widgetOrderSubscriptions`, `analyticsEvents` (session metadata). Fields: orderNumber, status, totals.total, statusHistory, shipping.trackingNumber, csat.score, csat.notes, subscription.channels, analytics sessionId. Sort: `createdAt` desc. Pagination: 30 per page with cursor. Drilldown fetch `/dashboard/orders/{id}` including items, timeline events, concierge notes, widget interaction summary. | Timeline badge (concierge status), CSAT badge (smiley/flag), subscription pill (SMS/email). Detail view: timeline component, shipping card, CSAT history, widget session card. | Actions: “Escalate to stylist”, “Resend tracking email”, “View transcript”. |
| `/dashboard/support/queue` | Collections: `stylistTickets` (open), `csatFeedback` (rating = needs_follow_up). Aggregation by `createdAt`. Sort: `priority desc`, then `createdAt` asc. Pagination: 50 per page with filters (ticket type). Drilldown: `/dashboard/support/tickets/{id}` showing contact info, transcript summary, shortlist. | List tabs: Stylist Tickets, CSAT follow-ups. Each item shows customer, status, SLA countdown, CTA. | Actions: “Assign to concierge”, “Mark in progress”, “Complete”. |

## Data Refresh Cadence
- Orders dashboard: poll API every 60 seconds for list; use WebSocket/webhook when order status updates pushed.
- Support queue: Webhook `stylist_ticket.updated`, `csat.trigger`. Poll fallback every 2 minutes.

## Permissions & Roles
- `admin` role: full access to all views, actions.
- `support_lead`: access to `/dashboard/support/queue`; read-only orders timeline.
- `concierge_agent`: access to support queue; limited actions (assign to self, mark completed). No access to financial order data (hide totals).
- `viewer`: read-only access to orders list (no actions).

## Drilldown Data Fields
- Orders detail: `orders.items`, `orders.timeline` (normalized), `widgetOrderSubscriptions.history`, `csatFeedback` with timestamps, `analyticsEvents` session metadata, `stylistTickets` link if created.
- Support ticket detail: `stylistTickets.summary`, `transcript`, `shortlist`, `customer preferences`, `assignedTo`, `slaDeadline`.
- Capsule detail: Removed (recommendation-only scope).

**Webhook Endpoints (recommended)**
- `POST /internal/webhooks/orders/status` → updates timeline cache.
- `POST /internal/webhooks/support/ticket` → update support queue.
- (Removed) Capsule-related webhooks.
- `POST /internal/webhooks/csat` → push new follow-up tasks.

**Polling Fallback**
- Orders list: `GET /internal/orders?cursor=...`
- Support queue: `GET /internal/support/tasks?since=...`
- (Removed) Capsule holds endpoint.
