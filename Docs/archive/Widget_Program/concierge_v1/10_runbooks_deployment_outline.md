# Step 10 – Runbooks & Deployment Plan Outline

## Day-2 Ops Runbook
- **Monitoring scope**: API latency (p95 < 500 ms), error rate < 1%, stylist ticket queue depth, capsule expirations within 12 hours, CSAT rating distribution.
- **Daily tasks**: review dashboard health widgets, verify seed jobs completed, rotate `CONCIERGE_API_KEY` every 30 days, audit analytics sampling, confirm stubs disabled outside development.
- **Alert response**: follow triage playbooks for API 5xx spikes, widget error bursts, analytics ingestion failures; notify via pager and email.
- **Communication templates**: customer-facing banner snippets for partial outages, stakeholder update template, post-incident report outline.

## Incident Runbook
- **Decision tree**: classify incident (products, orders, returns, capsule, stylist, analytics); determine severity; escalate if outage > 30 minutes.
- **Safe degrade behaviors**: switch to informative assistant copy, enable callback queue, disable capsule CTA while service recovers.
- **Recovery objectives**: RTO 60 minutes; RPO 15 minutes for concierge-related data stores.
- **Evidence capture**: log request IDs, snapshot dashboards, record timeline of actions.

## Deployment Plan
- **Environments**: development (stubs), staging (real endpoints with seeded data), production.
- **Pre-flight checks**: confirm env vars present, database migrations applied, feature flags configured, observability dashboards active.
- **Deployment steps**: build artifact, run smoke tests (Step 6), stage rollout with 10% traffic canary before full enable.
- **Rollback**: toggle feature flag to revert, revert traffic split, clear caches, send rollback notice.
- **Post-deploy verification**: validate analytics events, run order + return smoke tests, review dashboard for fresh data.

## Assumptions & Deltas (TODO-CONFIRM)
- Alert thresholds align with infrastructure capacity limits.
- API key rotation every 30 days meets security expectations; adjust if 15-day cadence required.
- Pager/email communication channels accessible for all on-call rotations.
- Feature flag rollback sufficient without redeploying binaries.

## Next Actions
- Flesh out triage playbooks per incident class.
- Document notification recipients and escalation ladders.
- Schedule periodic runbook rehearsal, including feature-flag rollback.
