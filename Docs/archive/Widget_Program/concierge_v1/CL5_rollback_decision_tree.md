# CL5 – Rollback Decision Tree & Communications

## Decision Flow
1. **Detect Issue**: Alert triggers (latency, error rate), failed verification, analytics outage, or P0/P1 defect.
2. **Assess Severity**:
   - P0 Critical: widget unusable / data risk → immediate rollback.
   - P1 Major: core flow broken → rollback unless workaround acceptable.
3. **Rollback Steps**:
   - Set `concierge.realEndpointsEnabled` to previous safe level (or 0% for stubs).
   - Confirm via logs that requests route to stubs.
   - Trigger customer/internal communications (see below).
4. **Post-Rollback**:
   - Capture metrics snapshot, request IDs, logs.
   - Document incident using WF8 template.
   - Investigate root cause; reattempt rollout only after fix verified in staging.

## Customer-Facing Banner Copy
“**Concierge pause** – Our stylist team is tuning the experience. You can still email concierge@aurora.com or request a call. We’ll be back shortly!”

## Internal Communication Template
- **Immediate Alert (Slack/Email)**
  “⚠️ Concierge rollback executed at [time]. Reason: [summary]. Flag reverted to stubs. Investigating request IDs [list]. Next update in 30 minutes.”
- **Follow-up Update**
  Outline impact, mitigation steps, ETA for fix, and whether manual assistance is needed.

## Re-Enable Criteria
- Root cause identified and resolved.
- Verification rerun in staging (WF7 subset).
- Monitoring thresholds met for at least 30 minutes in canary reattempt.
- Stakeholders notified before flag increase.

## Assumptions & Deltas (TODO-CONFIRM)
- Feature flag change effective immediately; if latency >1 min, note in ops log.
- Customer banner configurable in widget; if not, use assistant text fallback.
- Stakeholder list includes support, product, and leadership—maintained by Solo Owner.

## Next Actions
- Keep banner copy and internal templates accessible during launch.
- Update ops log with rollback events and resolutions.
- Incorporate learnings into WF8 triage records and post-launch retrospective.
