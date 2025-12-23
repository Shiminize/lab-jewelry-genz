# Launch Packet Index (Aurora Concierge)

## Canary & Go-Live Artifacts
| ID | Document | Description |
| - | - | - |
| CL1 | [WF7 Manual Verification Scripts](./WF7_manual_verification_scripts.md) & [WF9 Go-Live Checklist](./WF9_go_live_checklist.md) | Re-verified staging journeys and recorded go-live Pass/Fail evidence. |
| CL2 | [Canary Rollout Plan](./CL2_canary_rollout_plan.md) | Stepwise 10→25→50→100% rollout with advance/stop criteria. |
| CL3 | [Live Monitoring Matrix](./CL3_live_monitoring_matrix.md) | Metrics, thresholds, alerts, and check cadence. |
| CL4 | [Day-0 Command Center Runbook](./CL4_day0_command_center.md) | Minute-by-minute launch operations script. |
| CL5 | [Rollback Decision Tree & Comms](./CL5_rollback_decision_tree.md) | Rollback triggers, customer banner copy, internal messaging. |
| CL6 | [Evidence Binder Spec](./CL6_evidence_binder_spec.md) | Folder structure, naming conventions, retention plan. |
| CL7 | [Scale-Up & Stabilize Plan](./CL7_scale_up_stabilize.md) | Phase durations, stability criteria, risk checks. |
| CL8 | [Performance & Load Validation Plan](./CL8_performance_load_plan.md) | Post-canary validation strategy and success criteria. |
| CL9 | [Security Follow-Through Checklist](./CL9_security_follow_through.md) | TTL/retention, AV scanning, rate limits, key rotation. |
| CL10 | [Green Light to 100% Brief](./CL10_green_light_brief.md) | Final rollout confirmation and remaining mitigations. |

> **Evidence Folder**: Populate `docs/concierge_v1/evidence/` per [CL6](./CL6_evidence_binder_spec.md) during rollout.

## Supporting References
- [WF10 Launch Packet](./WF10_launch_packet.md) – master artifact index & 7-day plan.
- [F6 Completion Certificate](./F6_completion_certificate_v2.md) – Mongo integration sign-off.

## 2-Minute Demo Talk Track
“Hi everyone—here’s the status of the Aurora Concierge rollout.

We’ve completed all pre-launch checks. The WF7 manual verification suite was rerun in staging and captured in our evidence binder, and the WF9 go-live checklist is fully green with references to env configs, monitoring dashboards, and Mongo seed validation. Feature flag control is ready; we’ll start with a ten percent canary.

Our rollout plan, documented in CL2, steps us through ten to twenty-five to fifty to one hundred percent, with clear stop conditions: latency over six hundred milliseconds, error rate over two percent, or gaps in analytics events. The live monitoring matrix in CL3 shows exactly what we’re watching—API latency, error rates, analytics completeness, database health—and we’ll log metrics every fifteen minutes during the early phases.

Day-zero operations are scripted minute-by-minute in CL4. If anything goes sideways, CL5 gives us an immediate rollback path with customer banner copy and stakeholder messaging ready to go. All evidence is organized per CL6, so screenshots, API responses, and analytics exports will feed our launch archive.

After the initial canary, the scale-up plan in CL7 guides us through stabilization, and CL8 outlines how we’ll validate performance and load using real traffic and manual bursts. Security items—TTL indexes, AV scanning, rate limits—are tracked in CL9 with planned follow-ups within forty-eight hours. Finally, CL10 is the green-light brief summarizing that all criteria are met and that we’re set to go to full traffic once the canary holds.

The next steps are: flip the flag to ten percent, run the abbreviated verification, monitor per the matrix, and expand when metrics stay within bounds. I’ll be on-call throughout the rollout and will circulate hourly updates. With that, we’re ready to proceed.”
