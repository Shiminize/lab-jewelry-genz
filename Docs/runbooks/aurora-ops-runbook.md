# Aurora Concierge Day-2 Ops Runbook
Version: 1.0.0 (2025-10-10)

## Deploy Process
1. Ensure staging is green (run `npm run lint`, `npm run test`, manual UAT script). Vendor integrations mocked.
2. Set feature flag `AURORA_WIDGET_ENABLED` to "staging" scope.
3. Deploy backend (`/api/concierge/*`) via CI pipeline (Git tag `aurora-x.y.z`).
4. Smoke test (find product, track order, returns) on staging.
5. Promote to production: toggle feature flag to targeting `admin` cohort for canary (5%).
6. Monitor for 30 minutes; if stable, rollout to 100%.

### Rollback
- Use previous deploy artifact `aurora-x.y.z-1` via CI “rollback” job.
- Disable feature flags: set `AURORA_WIDGET_ENABLED=false`; post message in #aurora-ops.
- Re-enable only after issue resolved.

## Monitoring
- Dashboards:
  - `Aurora/API`: 2xx/4xx/5xx, latency, rate limits.
  - `Aurora/Support Queue`: ticket backlog, capsule expiring count.
  - `Aurora/CSAT`: rolling 7-day satisfaction.
- Log Queries (Stackdriver/Datadog):
  - `severity>=ERROR service:aurora AND requestId:*`
  - `http.status=500 path:/api/concierge/*`
- Queue Depth: check `renderJobs` queue; alert if > 20 jobs pending for >10 minutes.
- CSAT anomaly detection: alert if `rating=needs_follow_up` ratio > 40% per hour.

## On-call & Escalation
- Primary: DevOps (Alex W.) pager.
- Secondary: Backend Lead (Maya T.).
- Security on-call for auth issues (Priya S.).
- Contact: Slack `#aurora-ops`, PagerDuty schedule `Aurora-Concierge`.
- Comms template:
  - “We’re investigating intermittent issues with Aurora Concierge [scope]. Next update in 30 minutes. Ref: incident #[ID].”

## Capacity Inputs
- Peak widget sessions: 500 concurrent.
- Product card payload avg: 2KB per card, 4 cards per response.
- Order lookups: up to 2,000/hour during peak.
- Returns/capsule requests: 200/hour.
