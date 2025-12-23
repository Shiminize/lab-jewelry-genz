# CL2 – Canary Rollout Plan

## Phase Progression
| Phase | Flag Percentage | Minimum Duration | Verification Activities |
| - | - | - | - |
| 0 | 0% (pre-launch) | Until WF9 complete | Final WF7 runs, evidence capture, monitoring setup |
| 1 | 10% canary | ≥ 2 hours | Product + order status checks; metrics snapshots every 15 minutes |
| 2 | 25% | ≥ 4 hours | Capsule + stylist flows; Mongo growth check; stakeholder update |
| 3 | 50% | ≥ 6 hours (or end of day) | Returns + CSAT retest; dashboard view confirmation |
| 4 | 100% | After Phase 3 stability | Full WF7 rerun and transition to 7-day plan |

## Advance Criteria (per phase)
- p95 latency ≤ 500 ms across concierge endpoints for three consecutive 5-minute windows.
- HTTP error rate < 1%; no 5xx spikes.
- Analytics events (`aurora_*`) logged for each journey without gaps > 10 minutes.
- Mongo health: no abnormal slow queries or lock contention.
- No P0/P1 incidents recorded in WF8 log.

## Hold / Rollback Triggers
- Latency ≥ 600 ms sustained > 10 minutes.
- Error rate ≥ 2% for > 5 minutes.
- Analytics events missing > 15 minutes.
- Any P0/P1 incident (critical outage, data risk).

## Per-Phase Tasks
- **Phase 1**: Execute abbreviated WF7 flows; log request IDs; check analytics/monitoring every 15 minutes; record metrics in ops log.
- **Phase 2**: Repeat verification for capsule/stylist flows; review Mongo collections for expected growth; send update to stakeholders.
- **Phase 3**: Run return + CSAT flows; inspect `/dashboard/support`; assess load/performance; decide on overnight plan.
- **Phase 4**: Toggle to 100% once criteria met; rerun full WF7; start WF10 7-day plan.

## Documentation
- Record each phase change in “Canary Ops Log” with timestamp, metrics snapshot, request IDs, and go/no-go rationale.
- Store evidence in `docs/concierge_v1/evidence/canary_day0/` per CL6 spec.

## Assumptions & Deltas (TODO-CONFIRM)
- Feature flag platform supports percentage rollout without redeploy.
- Cohort selection based on session ensures intended exposure rate.
- Monitoring dashboards allow filtering by flag cohort for accurate metrics.

## Next Actions
- Execute Phase 0 tasks (CL1) before toggling flag.
- Follow command center runbook (CL4) during Day 0.
- Use rollback plan (CL5) if triggers met.
