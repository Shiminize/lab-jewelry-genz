# WF10 – Launch Packet (Aurora Concierge Widget)

## Artifact Index
| # | Document | Purpose |
| - | - | - |
| 1 | `01_config_routing_spec.md` | Env-driven routing matrix & stub fallbacks |
| 2 | `02_stub_shapes_spec.md` | Future-proof response contracts |
| 3 | `03_widget_interface_spec.md` | Message/intent contract & journeys |
| 4 | `04_data_mapping_validation.md` | Catalog/orders → widget field mapping |
| 5 | `05_analytics_event_catalog.md` | aurora_* events, funnels, retention |
| 6 | `06_smoke_demo_script.md` | 15-minute QA flow |
| 7 | `07_security_preflight.md` | Security/privacy checklist |
| 8 | `08_dashboard_support_spec.md` | Dashboard data contract |
| 9 | `09_evidence_certificate.md` | Planning completion status |
| 10 | `10_runbooks_deployment_outline.md` | Ops & deployment outline |
| 11 | `11_backend_integration_plan.md` | Migration from stubs to real endpoints |
| 12 | `12_qa_uat_plan.md` | QA/UAT coverage |
| 13 | `13_production_readiness_checklist.md` | Launch gating items |
| 14 | `F1-F6` docs | Mongo readiness, query plan, cutover, validation suite, completion certificate |
| 15 | `WF1`–`WF9` docs | Decision log, playbooks, guardrails, acceptance criteria, verification scripts, triage guide, go-live checklist |

## Launch Readiness Snapshot
- Feature Flag: `concierge.realEndpointsEnabled` targeting 10% canary → 100% after stability.
- All documentation centralized in `docs/concierge_v1/` with this packet as index.
- Manual verification script (WF7) and go-live checklist (WF9) to be completed immediately before launch.
- No open TODO-CONFIRM items; safe defaults recorded in WF1.

## Next 7-Day Plan
| Day | Focus | Actions |
| - | - | - |
| Day 0 (Launch) | Canary rollout | Run WF9 checklist; enable flag 10%; monitor metrics hourly; log findings. |
| Day 1 | Data validation | Execute F4 data quality checks; review analytics events; confirm no anomalies. |
| Day 2 | Dashboard verification | Verify `/dashboard/support` data views with live traffic; collect feedback. |
| Day 3 | Security follow-up | Confirm rate limiting & AV scanning logs; rotate API key if scheduled. |
| Day 4 | Customer feedback | Review CSAT submissions; ensure low-score follow-ups processed. |
| Day 5 | Capsule & shortlist audit | Inspect `capsuleHolds`, `widgetShortlists` for TTL cleanup and duplicates. |
| Day 6–7 | Post-launch review | Summarize launch metrics, incident log (if any), plan enhancements; prep retrospective notes. |

## Communication Plan
- Launch announcement: Share summary + readiness status to stakeholders on Day 0.
- Daily update (Days 0–3): Quick note covering wins, risks, asks.
- Post-launch retrospective: Deliver within one week summarizing metrics and lessons.

## Assumptions & Deltas (TODO-CONFIRM)
- Monitoring and analytics dashboards accessible during 7-day plan.
- Solo Owner responsible for executing plan; future team integration TBD.
- Performance stress testing scheduled separately if required.

## Next Actions
- Complete WF7 verification and WF9 checklist leading into Day 0.
- Store this launch packet with links to evidence for audit trail.
- Begin daily plan execution once canary live.
