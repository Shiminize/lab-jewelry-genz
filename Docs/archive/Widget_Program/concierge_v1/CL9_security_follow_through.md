# CL9 – Security Follow-Through Checklist

## Data Retention & TTL
| Collection | Policy | Status |
| - | - | - |
| `capsuleHolds` | TTL index: expire 3 days after `expiresAt` | TODO-CONFIRM – ensure index created in production |
| `widgetShortlists` | TTL 180 days after `updatedAt` | TODO-CONFIRM – schedule index creation or manual purge job |
| `widgetInspiration` | TTL 180 days after `createdAt` | TODO-CONFIRM – confirm AV pipeline applied before expiry |
| `returns` | Retain 365 days; manual archive after 1 year | Planned – document archival procedure |
| `csatResponses` | Retain 365 days; anonymize after 90 days | TODO-CONFIRM – verify anonymization script |
| `orderSubscriptions` | Retain 180 days post-delivery; ensure hashed contact and consent timestamp | In progress – monitor for duplicates |

## AV Scanning
- **Current State**: Staging uses stub scanner marking uploads `pending_review`; production integration pending.
- **Action**: Before enabling uploads in production, confirm AV scanning service (ClamAV or vendor) accessible and configured.
- **Mitigation**: If AV not ready, restrict inspiration uploads to staging or mark all as `pending_review` with manual review before use.
- **Evidence**: Store AV scan logs or configuration screenshots in evidence binder.

## Rate Limiting & Abuse Protection
- **API Gateway**: Configure per-IP rate limit (recommend 60 req/min) and per-session throttle (services.ts enforces 1 req/sec).
- **Returns & Capsule**: Validate idempotency enforcement to prevent spamming; consider additional limit (e.g., 3 attempts/hour per session).
- **Monitoring**: Check for unusual spikes in traffic; log and triage using WF8 if suspicious.

## Key Rotation & Secrets Management
- `CONCIERGE_API_KEY`: Rotate every 30 days; log rotation date/time; ensure both old/new keys valid during transition.
- Hash salt for order subscriptions stored securely; verify access limited to backend service.

## Logging & PII Hygiene
- Confirm logs mask emails/phones (using placeholder `***`).
- Avoid storing raw request payloads containing PII in logs; rely on requestId references.

## Outstanding Actions
1. Create TTL indexes in production for `capsuleHolds`, `widgetShortlists`, `widgetInspiration` (document commands and evidence).
2. Confirm or integrate AV scanning pipeline before enabling uploads in production; if deferred, document temporary manual review process.
3. Configure rate-limit policies in API gateway; record configuration screenshot for evidence.
4. Schedule next API key rotation date and add reminder to ops calendar.
5. Validate anonymization job for `csatResponses` after 90 days; if not yet implemented, plan script (no code provided here, just schedule).

## Assumptions & Deltas (TODO-CONFIRM)
- TTL index creation requires coordination with DBA; ensure commands executed and confirmed.
- AV scanning vendor/service available; if not, restrict uploads or store notes in CL5/CL10 for exception.
- API gateway supports required rate-limit configuration; document fallback (e.g., WAF rules) if limitations exist.

## Next Actions
- Update WF9 checklist once TTL and rate-limit configurations verified.
- Capture evidence (config screenshots/logs) in CL6 binder.
- Note any exceptions in final “Green Light” brief (CL10) for transparency.
