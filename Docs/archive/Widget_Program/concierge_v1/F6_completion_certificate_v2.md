# Step F6 – Functional Completion Certificate (Widget + Mongo, v2)

## Scope
- Widget intents wired to real `/api/concierge/*` endpoints backed by seeded MongoDB collections.
- End-to-end verification executed per F5 script (browser + Postman) with successful outcomes.
- Mongo collections (`products`, `orders`, `widgetShortlists`, `capsuleHolds`, `returns`, `stylistTickets`, `widgetInspiration`, `csatResponses`, `orderSubscriptions`) populated and validated.
- Feature flag `concierge.realEndpointsEnabled` enabled in staging for testing, ready for production canary.

## Evidence Summary
| area | proof | status |
| - | - | - |
| Products discovery | `/api/concierge/products` Postman response + Mongo docs cross-checked | ✅ |
| Order tracking | Timeline for `GG-11982` verified in widget and DB | ✅ |
| Returns | RMA created with idempotent behavior, `returns` collection entry confirmed | ✅ |
| Capsule holds | Capsule reservation recorded with `expiresAt`, duplicate attempt handled | ✅ |
| Shortlist persistence | Shortlist saved and retrievable; DB entry inspected | ✅ |
| Stylist tickets | Ticket creation response + `stylistTickets` document | ✅ |
| Inspiration uploads | Metadata stored with `moderationStatus` = `pending_review` | ✅ |
| Order updates subscription | Subscription acknowledgement and DB record | ✅ |
| CSAT capture | Rating stored with `agentNotified` for low score | ✅ |
| Analytics events | `aurora_*` events observed with sessionId/requestId | ✅ |

## Remaining TODO-CONFIRM
- Confirm postal code availability or define alternative secondary lookup for order status. 
- Finalize TTL and retention policies for concierge collections (capsule, shortlist, inspiration, returns).
- Validate upload scanning pipeline in production environment.
- Monitor performance under load (stress test to confirm indexes suffice).

## Sign-off
- **Owner / Approver**: Solo Owner (Integration Autopilot)
- **Date**: 2024-08-12
- **Statement**: “Aurora Concierge widget now operates end-to-end against Mongo-backed concierge endpoints. All critical journeys pass the F5 verification script, and the data layer meets readiness criteria pending noted TODO-CONFIRM items.”

## Next Steps
- Address outstanding TODO-CONFIRM items before production rollout.
- Execute cutover plan (F3) for production canary, followed by full rollout.
- Schedule post-launch monitoring review and data quality spot-check within first 72 hours.
