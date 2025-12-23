# Step 11 – Backend Integration Plan

## Workstreams
| area | objective |
| - | - |
| Endpoint activation | Replace stub URLs with environment-configured concierge endpoints, ensuring bearer auth + idempotency headers. |
| Data pipelines | Connect catalog/orders services to concierge collections (`widgetShortlists`, `capsuleHolds`, etc.). |
| Logging & analytics | Propagate `sessionId` and `requestId` through logs and events for traceability. |
| Dashboard data flows | Expose API endpoints powering `/dashboard/support` views. |

## Phased Migration
1. **Development validation**: operate with stubs matching production schemas; create manual contract checks for headers/fields.
2. **Staging switch**: configure env vars to staging endpoints, seed mock data, run smoke script, verify analytics ingestion.
3. **Production rollout**: enable feature flag for limited audience, monitor latency/error KPIs, expand once stable.

## Controls
- Real endpoints activated only after health checks (HTTP 200, latency < 300 ms) pass consistently.
- Stub fallback restricted to development; staging/production guard rails enforce real endpoints.
- Monitoring dashboards (API, analytics, dashboard data) established before traffic migration.

## Dependencies
- Catalog service maintains index with `readyToShip`, `primaryMetal`, `bestseller_score` fields.
- Orders API provides normalized timeline (statusHistory) with carrier/tracking data.
- Returns service supports idempotent REST contract with status lifecycle.
- Feature flag system supports per-session gating for gradual rollout.

## Assumptions & Deltas (TODO-CONFIRM)
- Staging endpoints ready with representative test data prior to migration.
- Health check endpoints exposed for each concierge service.
- Feature flag tooling capable of per-session or percentage rollouts.
- Rate limits documented to avoid throttling when production traffic ramps up.

## Next Actions
- Draft detailed runbook for staged rollout (dev → staging → prod) using this plan.
- Coordinate mock data seeding to support staging verification.
- Define monitoring success criteria before enabling production traffic.
