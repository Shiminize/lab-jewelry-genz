# CL4 – Day-0 Command Center Runbook

## Timeline (Solo Owner)
| Time | Action |
| - | - |
| T-60 min | Confirm WF9 checklist Pass; verify monitoring dashboards; open feature-flag console; prep communication channels. |
| T-30 min | Run quick staging sanity checks (product search, order status); confirm Mongo access; ensure device ready for alerts. |
| T-10 min | Initialize “Canary Ops Log”; review stop criteria; notify stakeholders of imminent canary start. |
| T0 | Set `concierge.realEndpointsEnabled` to 10%; log action; perform product/order check in canary cohort; capture request IDs. |
| T+15 min | Review latency/error dashboards; log metrics; verify analytics events; inspect Mongo for new entries. |
| T+30 min | Execute returns + CSAT flow; capture evidence; send quick status update. |
| T+60 min | Validate metrics; decide whether to progress; prepare for Phase 2 if stable. |
| T+120 min | Toggle to 25%; log action; rerun capsule/stylist flow checks; continue monitoring every 15–30 min. |
| T+240 min | Evaluate metrics; plan transition to 50% at T+360 if stable; send stakeholder update. |
| T+360 min | Toggle to 50%; run full verification subset; monitor closely until end of day. |
| End of Day | Decide on 100% timing (same day or next morning); summarize Day 0 metrics and incidents. |

## Tools & Resources
- Monitoring dashboards (API latency/error, analytics, Mongo ops).
- Mongo CLI/GUI for spot queries.
- Ops log template (timestamp, metrics, request IDs, decisions).
- Communication templates (status updates, rollback notices).

## Incident Response
- If stop criteria met, follow CL5 rollback decision tree immediately.
- Document incident in WF8 template and communicate update.

## Assumptions & Deltas (TODO-CONFIRM)
- Solo Owner available throughout Day 0; no handoff needed.
- Flag changes propagate instantly (<1 min); verify after each toggle.
- Stakeholder contact list up-to-date for notifications. |

## Next Actions
- Execute runbook during canary day.
- Populate ops log and evidence binder (CL6) in real time.
- Use outputs to inform CL10 “Green Light” brief. |
