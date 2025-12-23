# Evidence Index — Local Prod Serve

Date: 2025-10-15

## Mode
- MODE: Local DEV (prod build via `next start` on http://localhost:3002, stub concierge + guardrail shims, analytics mirror enabled)

## Request IDs (snapshot)
- find_product_001
- order_status_001
- order_updates_001
- returns_ok_001
- returns_dup_001
- returns_missing_001
- capsule_ok_001
- capsule_missing_001
- stylist_001
- csat_001
- insp_ok_001 / insp_ok_002 / insp_err_001
- Analytics session: `705ac251-6e2f-4264-9a4a-cd8d8400228b`
- Full mapping recorded in `journeys_request_ids.txt`

## Files
- local_config.txt
- A1_products_stub_headers.txt
- A1_products_stub_response.json
- A2_returns_success_headers.txt
- A2_returns_success.json
- A3_returns_duplicate_headers.txt
- A3_returns_duplicate.json
- A4_returns_missing_idem_headers.txt
- A4_returns_missing_idem.json
- A5_capsule_success_headers.txt
- A5_capsule_success.json
- A6_capsule_missing_idem_headers.txt
- A6_capsule_missing_idem.json
- B1_product_grid.png
- B4_order_timeline_headers.txt
- B4_order_timeline.json
- B5_subscription_success_headers.txt
- B5_subscription_success.json
- B8_stylist_success_headers.txt
- B8_stylist_success.json
- B9_csat_success_headers.txt
- B9_csat_success.json
- B10_inspiration_success1_headers.txt
- B10_inspiration_success1.json
- B11_inspiration_success2_headers.txt
- B11_inspiration_success2.json
- B12_inspiration_error_headers.txt
- B12_inspiration_error.json
- C1_analytics_session.json
- C2_return_event.json
- C3_inspiration_event.json
- D1_keyboard_attach.png
- D2_perf_console.txt
- evidence_index.md
- journeys_request_ids.txt

## PASS / FAIL

| Check | Status | Notes |
| --- | --- | --- |
| Env fallback (MODE=DEV) | PASS | All endpoints resolved to stub / guardrail routes |
| Returns idempotency | PASS | Happy path + duplicate + 400 friendly copy captured |
| Capsule guardrail | PASS | Happy path + 400 missing idempotency |
| Journeys A–F | PASS | Products, order timeline, updates, stylist, CSAT, inspiration flows |
| Analytics continuity | PASS | C1–C3 show aurora_* events w/ sessionId + requestId; payloads free of PII |
| A11y / Perf | PASS | Widget renders (B1), keyboard focus (D1), console clean (D2) |

## Local Go Recommendation
**Go.** Local prod-serve with DEV shims validates guardrails, concierge journeys, analytics continuity, and UI/A11y sanity. Safe to proceed to UAT once REAL credentials are available.
