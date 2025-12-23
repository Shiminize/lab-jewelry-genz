# CL3 – Live Monitoring Matrix

| Metric Category | What to Watch | Query / Filter | Threshold | Alert / Action | Cadence |
| - | - | - | - | - | - |
| API Latency | p95 latency for `/api/concierge/products`, `/orders/status`, `/orders/returns`, `/capsule` | Observability dashboard filtered by endpoint & flag cohort | Target ≤ 500 ms; warn ≥ 550 ms; critical ≥ 600 ms | Warning: investigate logs; Critical: hold rollout/rollback | Every 15 min (Phase 1–2), 30 min thereafter |
| API Reliability | HTTP error rate (4xx/5xx %) | `count(status>=400)/total` per endpoint (5-min window) | <1% target; alert ≥1.5%; critical ≥2% | Warning: review request IDs; Critical: rollback to prior phase | Same as above |
| Analytics Completeness | `aurora_*` events per intent | Analytics dashboard with 10-min rolling window | Should never drop to zero; gap >15 min triggers alert | Verify instrumentation; pause rollout if absent | Hourly |
| Mongo Health | Slow ops, error logs | `db.currentOp()` & log dashboard | Slow ops <5/min; warn at >5 slow ops/min | Tune query/index; if persistent, hold rollout | Daily during canary, ad hoc on alerts |
| Collection Growth | `widgetShortlists`, `capsuleHolds`, `returns`, `csatResponses`, `orderSubscriptions` counts | Mongo queries hourly | Growth consistent with traffic; highlight anomalies | Investigate duplicates; consider freeze if runaway | Hourly Day 0 |
| Support Queue | `stylistTickets` open count; capsules expiring <2h | Mongo query/dashboard | Maintain <20 open tickets | If higher, notify support; adjust flows | Twice daily |
| Front-end Errors | Widget console/Sentry errors | Filter by release tag | Zero new critical errors | Investigate; patch; consider rollback | Hourly |
| Feature Flag State | Current rollout % | Flag console/dash | Should match planned phase | Correct and log if mismatch | At each phase change |

**Alert Routing**: Warnings/critical alerts send email/SMS to Solo Owner. Responses documented in ops log with timestamp and outcome.

**On-Call Schedule**: Solo Owner monitors continuously during Phase 1; checks every 30 minutes post-Phase 1; remains on-call (SMS alerts) after hours.

## Assumptions & Deltas (TODO-CONFIRM)
- Monitoring tools provide near-real-time data (<5 min delay).
- Alerting platform configured for Solo Owner; verify contact channels before launch.
- Analytics dashboard supports intent-level filtering; if not, capture raw event logs for verification.

## Next Actions
- Validate dashboard filters prior to Phase 1.
- Set up ops log template for recording metrics & responses.
- Align alert severity responses with CL5 rollback plan.
