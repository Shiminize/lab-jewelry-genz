# UAT Evidence Index — REAL Concierge Swap

Date: 2025-10-15  
Mode: Intended REAL concierge (`CONCIERGE_*` envs → https://api.glowglitch.com). Calls failed with 502 due to missing UAT credentials — guardrails/analytics marked TODO-CONFIRM.

## Artifact Map

| Check | Artifact(s) | RequestId | Result |
| --- | --- | --- | --- |
| Endpoint probes | `endpoint_probe.txt` | various | **FAIL** – all upstream calls returned 502 (requires valid UAT key) |
| A1 Products | `A1_products_headers.txt`, `A1_products_response.json` | `uat_find_product_001` | **FAIL** – 502 (PRODUCTS_FETCH_FAILED) |
| Returns success | `A2_returns_success.*`, `A3_returns_duplicate.*` | `uat_returns_success_001`, `uat_returns_duplicate_001` | **FAIL** – 502 (RETURN_SUBMISSION_FAILED) |
| Returns missing idem | `A4_returns_missing_idem.*` | `uat_returns_missing_001` | **FAIL** – 502 (expected 400 friendly copy) |
| Capsule success / missing | `A5_capsule_success.*`, `A6_capsule_missing_idem.*` | `uat_capsule_success_001`, `uat_capsule_missing_001` | **FAIL** – 502 (no guardrail observed) |
| Order status / updates | `B4_order_status.*`, `B5_order_updates.*` | `uat_order_status_001`, `uat_order_updates_001` | **FAIL** – 502 (ORDER_STATUS_FETCH_FAILED / ORDER_UPDATES_FAILED) |
| Stylist | `B8_stylist.*` | `uat_stylist_001` | **FAIL** – 502 |
| CSAT | `B9_csat.*` | `uat_csat_001` | **FAIL** – 502 |
| Inspiration flows | `B10_inspiration_success.*`, `B11_inspiration_repeat.*`, `B12_inspiration_error.*` | `uat_inspiration_success_001`, `uat_inspiration_repeat_001`, `uat_inspiration_error_001` | **FAIL** – 502 |
| Analytics events | `C1_analytics_session.json`, `C2_return_event.json`, `C3_inspiration_event.json` | session `07411ce2-d10d-4f16-a6c9-80a3c2c6ba08` | Partial – `aurora_return_initiated` + `inspiration_upload` captured; `products_shown` missing (request failed upstream) |
| UI / A11y | `B1_product_grid.png`, `D1_keyboard_attach.png`, `D2_perf_console.txt` | N/A | Partial – visual proof captured; console shows 502 error from REAL endpoint call |
| Request index | `journeys_request_ids.txt` | — | Mapping of all UAT requestIds |
| Toggle plan | `uat_toggle_plan.md` | — | Steps / revert for enabling REAL endpoints |

## PASS / FAIL Summary

| Capability | Status | Notes |
| --- | --- | --- |
| Env wiring to REAL endpoints | FAIL | 502 responses from https://api.glowglitch.com without valid Bearer token |
| Returns guardrail (missing idempotency) | FAIL | Received 502; friendly copy not observable (requires UAT creds) |
| Capsule guardrail | FAIL | 502; unable to confirm idempotency enforcement |
| Journeys A–F | FAIL | All journey APIs returned 502; no REAL confirmations |
| Analytics continuity | PARTIAL | Return + inspiration events emitted; products_shown absent due to upstream failure |
| UI / A11y proof | PARTIAL | Widget renders, but console logs 502 error |

## Go / No-Go Recommendation (UAT)
**No-Go.** REAL concierge endpoints cannot be validated in UAT without valid credentials: every `/api/support/*` call returns 502, preventing guardrail confirmation, happy-path journeys, and full analytics chains. Secure the proper UAT bearer token (or relaxed allowlist) and re-run PHASES U1–U5; once 200/400 responses are observed, re-evaluate for canary.

## TODO-CONFIRM
- Obtain UAT `CONCIERGE_API_KEY` and re-test REAL endpoints.
- Re-run analytics capture to confirm `aurora_products_shown` and guardrail-induced `aurora_return_initiated` once upstream responds.
