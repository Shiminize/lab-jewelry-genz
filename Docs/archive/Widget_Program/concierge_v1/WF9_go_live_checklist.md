# WF9 – Go-Live Checklist

| Item | Criteria | Status (Pass/Fail) | Notes |
| - | - | - | - |
| Environment Config | All `CONCIERGE_*` env vars set to production endpoints; stubs disabled |  |  |
| Feature Flag | `concierge.realEndpointsEnabled` set to planned rollout value (e.g., 10% canary) |  |  |
| Mongo Seeds | `products`, `orders`, concierge collections ready; seed validation queries executed |  |  |
| Monitoring | Dashboards for latency, error rate, analytics event completeness live |  |  |
| Smoke Tests | WF7 script run in staging with all passes documented |  |  |
| Acceptance Criteria | WF6 criteria verified and signed |  |  |
| Security Controls | Bearer key rotation schedule, rate limiting, AV scanning confirmed |  |  |
| Data Guardrails | WF5 validations functioning (spot-check warnings, error copy) |  |  |
| Rollback Plan | Feature flag rollback rehearsed; instructions accessible |  |  |
| Triage Preparedness | WF8 guide reviewed; communication templates ready |  |  |
| Launch Communications | Launch announcement prepared, stakeholder list updated |  |  |
| Post-Launch Plan | 7-day monitoring & review schedule defined |  |  |

**Instructions**
1. Populate Status column with Pass/Fail prior to go-live.
2. Add Notes including dates, evidence links (screenshots, logs).
3. All items must be Pass before production flag raised to 100%.
4. Archive completed checklist in launch packet (WF10).

## Assumptions & Deltas (TODO-CONFIRM)
- Evidence collected from staging and production canary runs accessible for auditing.
- Security verification (rate limiting, AV scans) completed or temporary mitigations documented.
- Stakeholder list maintained by Solo Owner; adjust as team grows.

## Next Actions
- Fill checklist during launch readiness review.
- Attach supporting documents/screenshots to each Pass entry.
- Use checklist status as gating artifact for final “Go” decision.
