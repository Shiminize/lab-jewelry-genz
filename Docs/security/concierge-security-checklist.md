# Aurora Concierge Security & Governance Checklist
Version: 1.0.0 (2025-10-10)

| Control Item | Description | Owner | Status (Yes/No) |
|--------------|-------------|-------|-----------------|
| Auth: Bearer scopes | All `CONCIERGE_*` endpoints require bearer key with scoped permissions (`products:read`, `orders:read`, `returns:write`, etc.). | Security Ops (Priya S.) | No |
| Auth: Key rotation | API keys rotated every 90 days; emergency revoke plan documented. | Platform Eng (Maya T.) | No |
| DB Least Privilege | Mongo users limited to required collections (`products`, `orders`, `widgetShortlists`, `capsuleHolds`); read-only where possible. | DBA (Evan L.) | No |
| PII Inventory | Identify PII fields (customer email, phone) in orders/stylist tickets; document storage locations. | Privacy Officer (Nina R.) | No |
| PII Retention | Define retention: orders per legal (7y), stylist tickets (1y), widget sessions (30d). | Privacy Officer (Nina R.) | No |
| Log Redaction | Ensure logs redact email, phone, order numbers (use hashed values). | DevOps (Alex W.) | No |
| Idempotency Headers | `/api/concierge/orders/returns`, `/api/concierge/capsule` require `x-idempotency-key`. Server stores hash to dedupe. | Backend Lead (Maya T.) | No |
| Replay Protection | Idempotency keys expire after 24h; reject duplicates. Documented in API. | Backend Lead (Maya T.) | No |
| Rate Limit per session | Enforce 60 req/min per sessionId, 120 req/min per IP. Burst 10/sec. | API Gateway Team (Leo M.) | No |
| Abuse Monitoring | Alerts on unusual spikes (bot detection). | Security Ops (Priya S.) | No |
| Upload MIME/size | `/api/concierge/inspiration` accepts image/* only, max 10MB. | Infra (Jamie C.) | No |
| AV Scanning | All uploads scanned via ClamAV/Lambda before public availability. | Infra (Jamie C.) | No |
| S3 Policy | Bucket enforces server-side encryption, presigned URL expiration ≤15m. | Infra (Jamie C.) | No |
| Audit Logging | Log requestId, sessionId, endpoint, status, latency (no secrets). | DevOps (Alex W.) | No |
| Log Retention | Retain audit logs 90 days in secured storage. | DevOps (Alex W.) | No |
| Access Control | Restrict log access to `security_ops` and `platform_eng` groups. | Security Ops (Priya S.) | No |

## Security Exception Process
1. Submit exception request with:
   - Control being exempted
   - Business justification
   - Duration (max 30 days)
   - Compensating controls
2. Approvals required: Security Ops Lead, Product Manager, Platform Engineering Lead.
3. Track exception in risk register; review weekly.
4. Upon expiry, either remediate control or renew with updated justification.
