# WF8 – Defect Triage Guide

## Severity Levels
| Severity | Definition | Example | Expected Response |
| - | - | - | - |
| P0 – Critical Outage | Concierge widget non-functional or data corruption risk (e.g., all endpoints 5xx, returns creating duplicate RMAs) | Products endpoint fails for all requests | Immediate incident response; rollback feature flag; notify stakeholders. |
| P1 – Major Degradation | Core flow degraded but partial functionality remains (e.g., returns blocked, stylist tickets failing, order tracking inaccurate) | Capsule reserve failing with 500 but other flows ok | Fix within same day; communicate workaround. |
| P2 – Minor Bug | Non-critical issue with workaround; UI or data discrepancy | Badge copy typo, slower response but within SLA | Schedule fix in next sprint. |
| P3 – Cosmetic / Nice-to-have | Minor UI polish or enhancement request | Alignment issue, optional copy tweak | Add to backlog; prioritize later. |

## Ownership & Responsibilities
- **Investigations**: Solo Owner analyzes logs (requestId), DB state, analytics.
- **Backend Fixes**: Coordinate with future backend support; for now, document workaround.
- **Data Fixes**: Use Mongo scripts to adjust records safely (with backups).
- **Communication**: Solo Owner posts incident summaries and resolutions.

## Reproduction Template
```
Title:
Severity:
Environment:
Intent/Endpoint:
Steps to Reproduce:
Expected Result:
Actual Result:
Request ID(s):
Mongo Query Output:
Analytics Events Observed:
Workaround:
Resolution Plan:
```

## Triage Workflow
1. Log defect using template, assign severity.
2. Check WF5 guardrails and error copy for expected behavior vs bug.
3. For P0/P1, execute rollback (WF4) if needed.
4. Document findings in decision log (WF1 updated as necessary).
5. Upon resolution, note verification steps and update readiness checklist (WF9).

## Incident Communication Snippet
“Concierge widget experienced [issue] at [time]. Impact: [summary]. Mitigation: [steps taken]. Next actions: [plan]. Request IDs: [list].”

## Assumptions & Deltas (TODO-CONFIRM)
- Solo Owner remains primary responder; escalation path to be defined post-launch.
- Logging includes enough detail (requestId, error code) to diagnose quickly.
- Future team handoff will incorporate this guide into shared incident response runbook.

## Next Actions
- Integrate triage guide into operations documentation.
- Prepare canned responses for top failure scenarios (returns, order tracking).
- Align defect tracker (if used) with severity definitions above.
