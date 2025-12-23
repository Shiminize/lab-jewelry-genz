# UAT Toggle Plan — REAL Concierge Endpoints

Date: 2025-10-15  
Author: Automation (REAL Endpoint Swap & UAT Verification)

## Current Signals
- `src/lib/concierge/config.ts` expects the following environment variables for REAL wiring:
  - `CONCIERGE_PRODUCTS_ENDPOINT`
  - `CONCIERGE_ORDER_STATUS_ENDPOINT`
  - `CONCIERGE_RETURNS_ENDPOINT`
  - `CONCIERGE_CAPSULE_ENDPOINT`
  - `CONCIERGE_STYLIST_ENDPOINT`
  - `CONCIERGE_CSAT_ENDPOINT`
  - `CONCIERGE_INSPIRATION_ENDPOINT` (optional – defaults to stub if omitted)
  - `CONCIERGE_ORDER_UPDATES_ENDPOINT` (for SMS opt-ins)
  - `CONCIERGE_API_KEY` (Bearer token automatically sent when present)
- Feature flags documented for launch governance:
  - `concierge.realEndpointsEnabled`
  - `analytics.devMirrorEnabled`

## Forward Toggle (UAT)
1. **Configure environment**  
   - Set each `CONCIERGE_*_ENDPOINT` to its UAT-hosted REAL concierge URL.  
   - Provide `CONCIERGE_API_KEY=<uat-service-key>` for authenticated requests.  
   - Explicitly disable DEV mirrors: `analytics.devMirrorEnabled = false`.
2. **Enable REAL concierge flag**  
   - Set `concierge.realEndpointsEnabled = true` for the UAT cohort (100%).  
   - Confirm the widget reads REAL endpoints by validating `/api/support/*` calls proxy to external hosts.
3. **Smoke verification before full suite**  
   - Hit `/api/support/products` with a single filter payload; confirm 200 + non-stub response.  
   - POST `/api/support/returns` with idempotency header; expect 200.
4. **Lock UAT state**  
   - Document requestIds in `docs/concierge_v1/uat_evidence/2025-10-15/journeys_request_ids.txt`.  
   - Notify launch channel that UAT is running REAL concierge for Autopilot validation.

## Revert Playbook
1. Toggle `concierge.realEndpointsEnabled = false` (or target 0% cohort).  
2. Restore stub fallbacks by unsetting REAL `CONCIERGE_*` endpoints (forces `/api/stub/concierge/*`).  
3. Re-enable dev analytics mirror if required for engineering: `analytics.devMirrorEnabled = true`.  
4. Perform smoke check: `/api/support/returns` should return stub message, and analytics collector should resume.

## Notes / Risks
- If any REAL endpoint is unavailable, mark the corresponding evidence as TODO-CONFIRM and capture probe results.  
- Keep DEV-only guardrail routes untouched; they already throw when `NODE_ENV === 'production'`.  
- Ensure no PII beyond sessionId/requestId enters analytics payloads when mirrors are disabled.
