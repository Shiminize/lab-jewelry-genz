# Aurora Concierge Incident Runbook
Version: 1.0.0 (2025-10-10)

## Triage Decision Tree
1. **Orders status failing** (5xx from `/orders/status`):
   - Check API logs for DB connectivity.
   - If DB issue: failover to read replica; disable timeline feature (set widget flag `AURORA_TIMELINE_ENABLED=false`).
2. **Returns API down** (409/5xx spikes):
   - Verify idempotency store; if degraded, disable returns (flag `AURORA_RETURNS_ENABLED=false`) and show banner copy.
3. **Capsule system down**:
   - Check `capsuleHolds` service/queue.
   - If unavailable, switch widget to safe-degrade: hide capsule offer card and set copy “Capsule reservations temporarily unavailable.”

## Customer-Facing Banners
- Add widget banner (assistant_text copy hook `outage.orders.timeline` = “We’re currently refreshing order timelines—please check back soon or email concierge@glowglitch.com.”)
- Returns outage copy: “Returns are temporarily paused while we upgrade our workshop systems.”
- Capsule outage copy: “Capsule reservations are currently on hold; concierge will reach out with updates.”

## RTO/RPO & Safe Degrade
- RTO: 30 minutes for order tracking, returns, capsule.
- RPO: 5 minutes (recent changes should be recoverable). Backups hourly.
- Safe degrade behaviors: hide affected CTA, surface escalation form, log event `aurora_outage_notice`.

## Insurance Steps
- Notify support lead (Sonya R.) and marketing for customer messaging.
- Update status page if >15 minutes outage.
