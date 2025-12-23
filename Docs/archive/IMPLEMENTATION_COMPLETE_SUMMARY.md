# Concierge Widget Implementation — Recommendation Scope Status
Last updated: 2025-10-18

## Executive Summary
- Recommendation-only concierge features (product discovery, order status, returns/care, stylist escalation, shortlist, CSAT, order update opt-ins) are live and wired to MongoDB in `localDb` mode. Capsule reservations and inspiration uploads were removed from the 1.0 scope and should no longer be advertised as shipped.
- Admin dashboards exist for support, orders, analytics, and creators; they now surface stylist tickets, CSAT follow-ups, widget badges, shortlist/save activity, and attribution. Capsule-specific UI and API calls have been removed to avoid broken requests.
- Analytics instrumentation tracks `aurora_*` widget events (opens, intents, shortlist, CSAT, etc.) into MongoDB. Dashboards and documentation were updated to align with the active event catalog—no capsule stage is emitted.
- Automation is not yet production ready: `npm run build` now completes end-to-end after shoring up the in-memory Mongo stub, but `npm run verify:localdb` still requires a reachable MongoDB instance and open port bindings. These gaps must be closed before claiming full Phase 2 completion.

## Delivery Snapshot
| Area | Status | Notes |
|------|--------|-------|
| Core widget intents (product, order, returns, csat, stylist, shortlist, order updates) | ✅ Complete | All routes backed by MongoDB services in localDb mode; remote/stub fallbacks remain. |
| Capsule reservations & inspiration uploads | ❌ Removed | Code paths, APIs, and docs now mark these features as deferred for a future scope. |
| Support dashboard | ✅ Complete (capsule removed) | Shows stylist tickets + negative CSAT; no longer issues failing capsule fetch. |
| Orders dashboard enrichment | ✅ Complete | Widget badges, CSAT metrics, subscriptions render; capsule panels removed. |
| Concierge analytics dashboard | ✅ Complete | Uses updated funnel (opens → intent → action → shortlist) and live CSAT/timeseries metrics. |
| Creator attribution dashboard | ✅ Complete | Creator stats surface widget-assisted volume and revenue. |
| Analytics event catalog | ✅ Updated | Documents live event names (`aurora_widget_open`, `aurora_product_shortlisted`, etc.); capsule events removed. |
| OpenAPI + interface contracts | ✅ Updated | Reflect recommendation-only scope and required fields (e.g., stylist email). |
| Testing & build automation | ⚠️ Partial | `npm run build` now passes using the enhanced memory DB stub. `npm run verify:localdb` still fails (no MongoDB instance, sandbox blocks binding to 3002/3100). |

## What Ships Today
- **Widget UX**: Product carousel, filter modules, order timeline, returns flow, stylist escalation form, CSAT bar, shortlist actions, and order-update opt-ins.
- **Support tooling**: `/dashboard/support` highlights stylist tickets and negative CSAT, including filters, SLA badges, and transcript metadata.
- **Orders insights**: `/dashboard/orders` displays widget-assisted flags, CSAT score, subscription status, and any saved notes.
- **Analytics**: `/dashboard/analytics/concierge` reports widget opens, unique sessions, intent distribution, CSAT histogram, shortlist leaderboard, and funnel progression (no capsule stage).
- **Creator dashboard**: `/dashboard/creators` attributes orders, revenue, and commissions influenced by the concierge widget.

## Deferred / Follow-Up Work
- Restore capsule reservations and inspiration uploads behind a dedicated Phase 3 scope (requires new APIs, TTL collections, UI, and analytics).
- Ship `npm run verify:localdb` evidence by stubbing or provisioning MongoDB in CI (or adapting harness to memory DB), and document env/port requirements.
- Add rate limiting, structured logging, metrics export, and alert rules outlined for Phase 3.
- Author remaining documentation: production `.env` template, OpenAPI polishing, ops/incident runbooks, and support playbooks.
- Expand automated test coverage (unit for intent rules, integration tests for API routes, Playwright journeys, accessibility audit).

## Testing Status
- `npm run build` → ✅ Passes (2025-10-18) after enhancing the memory Mongo stub (`sort`, `aggregate`, `countDocuments` support).
- `npm run lint` → Passes locally (invoked as part of Next build).
- `npm run verify:localdb` → ⚠️ Fails without MongoDB and due to sandboxed port bindings (`MongoServerSelectionError`, `listen EPERM` on 3002/3100). Requires test DB or mocked services plus headless Playwright strategy.
- No current evidence for E2E, integration, or accessibility tests—identify owners before rollout.

## Known Risks
- Capsule-related collections (`capsuleHolds`, `widgetInspiration`) still exist in setup scripts but have no runtime callers; keep or remove once Phase 3 scope is defined to avoid confusion.
- Analytics funnel includes `aurora_intent_complete` counts that rely on widget scripts calling `trackEvent('intent_complete')`; ensure future flow changes preserve that signal.
- Admin dashboards assume data exists in MongoDB; seed scripts must be run before demos to prevent empty states.
- Security hardening (idempotency enforcement for non-localDb mode, rate limits, PII scrubbing) remains partially implemented—track as Phase 3 work.

## Next Steps
1. Provide a MongoDB instance (or harness-friendly mock) for `npm run verify:localdb`, or adapt the script to use the memory DB, then capture evidence under `Docs/concierge_v1/evidence/`.
2. Prioritize production hardening tasks (rate limiting, monitoring, alerting, feature flag rollout).
3. Revisit capsule/inspiration feature requirements if still in scope and size them for a future phase.
