# Aurora Concierge Deployment & Rollback Plan
Version: 1.0.0 (2025-10-10)

## Environment Matrix
| Env Var | Staging Value | Production Value |
|---------|---------------|------------------|
| `CONCIERGE_PRODUCTS_ENDPOINT` | `https://staging.api.glowglitch.com/api/concierge/products` | `https://api.glowglitch.com/api/concierge/products` |
| `CONCIERGE_ORDER_STATUS_ENDPOINT` | `https://staging.api.glowglitch.com/api/concierge/orders/status` | `https://api.glowglitch.com/api/concierge/orders/status` |
| `CONCIERGE_RETURNS_ENDPOINT` | `https://staging.api.glowglitch.com/api/concierge/orders/returns` | `https://api.glowglitch.com/api/concierge/orders/returns` |
| `CONCIERGE_CAPSULE_ENDPOINT` | `https://staging.api.glowglitch.com/api/concierge/capsule` | `https://api.glowglitch.com/api/concierge/capsule` |
| `CONCIERGE_STYLIST_ENDPOINT` | `https://staging.api.glowglitch.com/api/concierge/stylist` | `https://api.glowglitch.com/api/concierge/stylist` |
| `CONCIERGE_CSAT_ENDPOINT` | `https://staging.api.glowglitch.com/api/analytics/csat` | `https://api.glowglitch.com/api/analytics/csat` |
| `CONCIERGE_SHORTLIST_ENDPOINT` | `https://staging.api.glowglitch.com/api/concierge/shortlist` | `https://api.glowglitch.com/api/concierge/shortlist` |
| `CONCIERGE_INSPIRATION_ENDPOINT` | `https://staging.api.glowglitch.com/api/concierge/inspiration` | `https://api.glowglitch.com/api/concierge/inspiration` |
| `CONCIERGE_ORDER_UPDATES_ENDPOINT` | `https://staging.api.glowglitch.com/api/concierge/order-updates` | `https://api.glowglitch.com/api/concierge/order-updates` |
| `CONCIERGE_API_KEY` | Stored in staging vault secret `aurora-staging-api-key` | Production vault `aurora-prod-api-key` |

## Deployment Steps & Gates
| Step | Owner | Duration | Description | Go/No-Go Criteria |
|------|-------|----------|-------------|-------------------|
| 1 | DevOps (Alex W.) | 30 min | Verify environment matrix: staging `.env` points to staging endpoints; production `.env` to prod endpoints (`CONCIERGE_*`). Document in release ticket. | **No-Go** if any endpoint unset/mismatched. |
| 2 | Platform Eng (Maya T.) | 15 min | Pre-flight: fetch secrets from vault, ensure Mongo indexes exist (`widgetShortlists.sessionId`, `capsuleHolds.expiresAt`). Confirm `AURORA_FAKE_MODE=false`. | **No-Go** if indexes missing or stubs enabled. |
| 3 | QA Lead (Jamie P.) | 30 min | Smoke checklist on staging (1 interaction each: Find Product, Track Order, Returns, Capsule, Stylist, CSAT). Capture requestIds. | **No-Go** if any fail. |
| 4 | DevOps | 10 min | Deploy staging services (`/api/concierge/*`). Monitor logs for 10 min. | **No-Go** if 5xx spikes. |
| 5 | Product Manager (Omar V.) | 15 min | Approve staging results (widget + dashboard views). | **No-Go** without PM sign-off. |
| 6 | DevOps | 10 min | Deploy to production; enable feature flag `AURORA_WIDGET_ENABLED` at 5% canary. | **No-Go** if deploy fails. |
| 7 | Ops On-call | 30 min | Monitor canary: latency < thresholds, error rate <0.5%, CSAT stable. | **No-Go** if metrics outside green. |
| 8 | DevOps | 5 min | Ramp flag to 100% if canary healthy. | Pause if amber/red metrics. |
| 9 | Analytics (Leo M.) | 15 min | Post-deploy queries & KPI check (capsule conversion, CSAT). Document in release notes. | Rollback if KPIs degrade significantly (>20% drop). |

## Pre-Flight Checklist
- Secrets present: `CONCIERGE_API_KEY`, bucket credentials.
- Mongo indexes: `widgetShortlists.sessionId`, `capsuleHolds.expiresAt`, `csatFeedback.sessionId`.
- Stubs disabled: `AURORA_USE_STUBS=false`.

## Smoke Checklist
1. Find Product → expect `assistant_text`, `product_card`, `offer_card` messages.
2. Track Order → `order_status`, `csat_bar`.
3. Returns → `assistant_text`, `escalation_form`.
4. Capsule → `offer_card`, `assistant_text` confirmation.
5. Stylist → `escalation_form` → `assistant_text` ack.
6. CSAT → `csat_bar` → `aurora_csat_submitted` event.

## Rollback
- Disable feature flags: `AURORA_WIDGET_ENABLED=false`, `AURORA_TIMELINE_ENABLED=false`, `AURORA_RETURNS_ENABLED=false`.
- Redeploy previous stable build.
- Clear widget session cache (Redis) & CDN caches for widget bundle.
- Notify #aurora-ops, post incident note, silence alerts as needed.

## Post-Deploy Verification
- Metrics: latency p95 < SLO, 5xx <0.5%, `aurora_capsule_reserved` events recorded.
- Queries:
  - `SELECT COUNT(*) FROM aurora.events WHERE event='aurora_products_shown' AND timestamp>DEPLOY`
  - `SELECT AVG(rating='needs_follow_up') FROM aurora.events WHERE event='aurora_csat_submitted' AND timestamp>DEPLOY`
  - Log check: `http.status>=500 path:/api/concierge/*` (should be empty).
- Dashboard KPIs: capsule conversion vs baseline (±10%), open tickets queued < threshold.
