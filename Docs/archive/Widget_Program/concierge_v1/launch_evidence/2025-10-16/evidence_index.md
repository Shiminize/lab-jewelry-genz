# Evidence Index — Local Smoothness

Date: 2025-10-16
Mode: Local prod build (`next start` on http://localhost:3002) with stub concierge endpoints, guardrail shims, and dev analytics mirror.

## Artifacts
- local_config.txt
- journeys_request_ids.txt
- Guardrails: A2_returns_success.*, A3_returns_duplicate.*, A4_returns_missing_idem.*, A5_capsule_success.*, A6_capsule_missing_idem.*
- Journeys: A1_products_stub_*.json/txt, B4_order_timeline_*.json/txt, B5_subscription_success_*.json/txt, B8_stylist_success_*.json/txt, B9_csat_success_*.json/txt, B10/B11/B12 inspiration files
- Analytics: C1_analytics_session.json, C2_return_event.json, C3_inspiration_event.json
- UI/A11y: B1_product_grid.png, D1_keyboard_attach.png, D2_perf_console.txt

## PASS / FAIL

| Check | Status | Notes |
| --- | --- | --- |
| Env fallback (DEV) | PASS | All concierge calls resolved to `/api/stub/concierge/*`; guardrail proxies active |
| Returns idempotency | PASS | 200 success + duplicate replay + 400 friendly copy (`returns_ok_local_01`, `returns_dup_local_01`, `returns_missing_local_01`) |
| Capsule guardrail | PASS | 200 success + 400 friendly copy (`capsule_ok_local_01`, `capsule_missing_local_01`) |
| Journeys A–F | PASS | Products, order status, subscription, stylist, CSAT, inspiration success + oversize error |
| Analytics continuity | PASS | `C1` shows widget_open → intent → products_shown and return/inspiration events with sessionId/requestId; no raw email/phone/order number present |
| UI / A11y / Perf | PASS | Widget renders (B1), attach button focusable (D1), console clean aside from suppressed prefetch noise noted in D2 |

## Notes
- Dev analytics collector only mirrors when `NEXT_PUBLIC_ANALYTICS_DEV_MIRROR_ENABLED=true`; disable for non-local runs.
- Inspiration success uploads used `/tmp/small.png` (67 B) and oversize used `/tmp/large.bin` (12 MB).
- Guardrail evidence demonstrates friendly copy: “I need a quick refresh—please tap that again so I don’t duplicate your request.”
