# Aurora Concierge QA & UAT Plan
Version: 1.0.0 (2025-10-10)

## Test Matrix (Journeys)
| TC ID | Journey | Preconditions | Steps | Expected Responses | Negative Tests | SLA Assertions |
|-------|---------|---------------|-------|--------------------|----------------|----------------|
| TC-J1 | Find Product | Seeded products (readyToShip ring, price < 4000) | 1. Open widget. 2. Click “Design ideas”. 3. Filter ready-to-ship. | assistant_text summary, product_card with 2 entries, offer_card. | Invalid filter (priceMin>priceMax) returns 400. | Product response < 300ms; ready-to-ship inference correct. |
| TC-J2 | Track Order | Order `GG-12001` with statusHistory, tracking. | 1. Open widget. 2. Select “Track my order”. 3. Enter order number. | order_status timeline, assistant_text, csat_bar. | Order not found -> error copy; missing lookup fields -> 400. | Timeline to render < 500ms; status inference matches DB. |
| TC-J3 | Returns/Resizing | Order eligible for resize, within 60 days. | 1. Open widget. 2. “Returns & resizing”. 3. Choose resize. | assistant_text with eligibility, escalation_form, offer_card. | Return outside window -> copy “outside 30-day”. Duplicate idempotency -> 409. | Eligibility evaluation < 400ms; duplicate detection works. |
| TC-J4 | Capsule Reserve | Session with shortlist items. | 1. Shortlist two products. 2. Click “Reserve my capsule”. | offer_card CTA emits `capsule_reserve`, assistant_text confirmation. | Missing idempotency -> 400; duplicate key -> 409. | Capsule reservation < 400ms; expiry timestamp set. |
| TC-J5 | Stylist Escalation | Ticket queue available. | 1. Trigger escalation form. 2. Submit contact info. | assistant_text ack, csat optional, queue entry. | Missing email -> validation error; ticket backlog full -> escalate to lead. | Ticket creation < 500ms; ack copy accurate. |
| TC-J6 | CSAT Flow | Completed journey. | 1. After response, answer CSAT. | csat_bar records rating, negative opens escalation form. | Duplicate CSAT -> ignore; rating invalid -> 400. | Event logged within 5s; negative triggers escalate. |

## Edge-Case Suite
| TC ID | Scenario | Expected Behavior |
|-------|----------|-------------------|
| TC-E1 | Product inventory zero after shortlist | Widget shows backordered badge and shipping note. |
| TC-E2 | Capsule expired (expiresAt < now) | Offer card copy “Hold expired”; provide renew CTA. |
| TC-E3 | Invalid RMA (duplicate) | API returns 409; widget copy instructs contact concierge. |
| TC-E4 | Carrier delay update | Timeline adds “Delayed” event; SLA copy triggered. |
| TC-E5 | Missing price | Product hidden; error logged. |
| TC-E6 | Return outside window | Copy “outside 30-day window” + escalate CTA. |

## Test Case Traceability Table
| TC ID | Requirement Reference | Pass Criteria |
|-------|-----------------------|--------------|
| TC-J1 | Widget spec §1, API `/products` | Product card renders with accurate price/spec line; offer CTA emits `capsule_reserve`. |
| TC-J2 | Orders spec §2, `/orders/status` | Timeline statuses map correctly; CSAT appears post-response. |
| TC-J3 | Returns spec §C, `/orders/returns` | Eligibility states reflect policy; duplicates blocked. |
| TC-J4 | Capsule spec §3, `/capsule` | Hold created with expiry; duplicate prevented. |
| TC-J5 | Stylist spec §4, `/stylist` | Ticket created; user sees confirmation. |
| TC-J6 | Analytics spec §5, `/csat` | Rating stored; negative triggers escalation form. |
| TC-E1 | Data mapping §A | Backordered copy & badge displayed. |
| TC-E2 | Capsule spec §3 | Expired capsule triggers renew flow. |
| TC-E3 | Returns spec §C | Duplicate RMA returns 409 and copy displayed. |
| TC-E4 | Orders spec §B | Delay event escalates properly. |
| TC-E5 | Data mapping §A | Missing price -> card hidden, log entry. |
| TC-E6 | Returns spec §C | Outside window copy + escalate CTA. |

## UAT Script (10 Tasks)
1. Launch widget from homepage; note welcome copy. (Screenshot: welcome banner.)
2. Use “Design ideas” quick start; select ready-to-ship filter; capture product carousel. (Screenshot: product card.)
3. Save a product to shortlist; verify confirmation toast. (Screenshot: toast.)
4. Click “Reserve my capsule”; complete hold form; confirm success message. (Screenshot: confirmation.)
5. Track order `GG-12001`; ensure timeline matches dashboard. (Screenshot: timeline.)
6. Subscribe to SMS updates; confirm badge/ack. (Screenshot: subscription pill.)
7. Initiate resize; fill escalation form; confirm ticket ID. (Screenshot: escalation success.)
8. Submit CSAT negative rating; verify escalation auto-opens. (Screenshot: csat & form.)
9. Visit dashboard `/dashboard/support/queue`; ensure new ticket visible. (Screenshot: queue row.)
10. Visit `/dashboard/capsules`; filter by “Expires <12h”; confirm hold entry. (Screenshot: capsule table.)

**Instructions:** Non-technical stakeholders should capture before/after screenshots, note timestamps, and record request IDs shown in the UI footer/devtools.
