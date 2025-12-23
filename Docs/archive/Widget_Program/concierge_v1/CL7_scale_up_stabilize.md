# CL7 – Scale-Up & Stabilize Plan

## Schedule Overview
| Phase | Flag % | Duration (minimum) | Activities |
| - | - | - | - |
| Phase 1 | 10% | ≥ 2 hours | Live monitoring, WF7 subset verification, analytics spot-check |
| Phase 2 | 25% | ≥ 4 hours | Capsule & stylist flows, Mongo growth checks, stakeholder update |
| Phase 3 | 50% | ≥ 6 hours | Returns & CSAT retest, dashboard data inspection, end-of-day decision |
| Phase 4 | 100% | Until stabilization (≥24 hours) | Full WF7 rerun, start 7-day plan, gather feedback |

## Stability Criteria (per phase)
- Latency p95 ≤ 500 ms for all concierge endpoints (three consecutive 5-min windows).
- Error rate < 1% sustained; no 5xx spikes.
- Analytics events recorded for each monitored journey (no gaps > 10 minutes).
- Mongo collections growing within expected bounds (no runaway entries or duplicates).
- No P0/P1 incidents recorded; WF8 triage log shows zero critical issues.

## Risk Checks
| Risk | Mitigation |
| - | - |
| Sudden latency spike | Pause rollout; inspect DB ops and recent changes; revert to previous phase if unresolved within 15 minutes. |
| High error rate (>=2%) | Check request IDs for data issues; consider temporary fallback to stubs; communicate to stakeholders. |
| Analytics outage | Confirm instrumentation; if platform issue, note as known gap but proceed cautiously; escalate before scaling. |
| Capsule/return duplication | Monitor DB for duplicate entries; if detected, freeze capsule/return flows, apply hotfix before scale-up. |
| Support queue overload | Check `stylistTickets` open count; if exceeding threshold (e.g., 20), adjust SLA messaging or temporarily cap escalations. |
| CSAT low-score spike | Investigate cause; ensure follow-up tasks; may highlight underlying issue requiring pause. |

## Daily Stabilization Tasks (Post-100%)
1. Morning (Day 1–7): review dashboards, analytics, Mongo counts; document findings.
2. Midday: check support queue, capsule expiry status, returns in progress.
3. Evening: compile summary (Wins/Risks/Asks) for stakeholders.
4. End of Week: retrospective notes per WF10 plan.

## Assumptions & Deltas (TODO-CONFIRM)
- Monitoring data latency minimal (<5 minutes); adjust cadence if slower.
- “Expected bounds” for collection growth defined by seed baseline (e.g., shortlists increase modestly with user traffic).
- Support team aware of potential ticket influx; Solo Owner monitors queue metrics.

## Next Actions
- Apply schedule when executing CL2 rollout.
- Record stability observations in ops log.
- Transition to 7-day plan once 100% rollout stable.
