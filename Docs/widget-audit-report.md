# Aurora Concierge Widget Audit (2025-XX-XX)

This document summarizes the current widget implementation, open gaps, and a risk-aware roadmap to complete and harden the Aurora Concierge widget. Paths are workspace-relative for quick lookup in Codex.

## Snapshot
- UI orchestration: `src/components/support/SupportWidget.tsx` (state + feature flag guard), `WidgetShell.tsx`, `WidgetConversation.tsx`, `WidgetComposer.tsx`.
- Intent engine: `src/lib/concierge/intentRules.ts` → `src/lib/concierge/scripts.ts` (`executeIntent`) → `/api/support/*` routes.
- Data/backends: `src/lib/concierge/services.ts` (`conciergeDataMode`: stub | localDb | remoteApi). Default is **stub** unless env overrides.
- Analytics: `trackEvent` in `useWidgetActions.ts` / `WidgetShell.tsx`; only mirrored in dev via `/api/dev-analytics/collect` unless localDb mode is on.

## Current Flow Status
- **Find product**: Implemented and now validated via Chrome MCP. Filters normalize via `intent/normalizer.ts`; fetches `/api/support/products` → provider; returns carousel + sort + shortlist; shortlist save now replies with saved-count copy. Empty-state suggestions present.
- **Track order**: Implemented. Order lookup form posts to `/api/support/order-status`; timeline returned with optional “Text updates”. Last order context is now stored in session for reuse.
- **Returns / exchanges**: Implemented; payload now carries `orderId`/`orderNumber` from the last tracked order so `/api/support/returns` succeeds.
- **Stylist contact**: Implemented. Escalation form posts to `/api/support/stylist`; CSAT prompt follows.
- **CSAT**: Implemented with numeric payload coercion; posts include session, intent, and order number.
- **Order updates subscription**: Implemented; now includes session + last order reference when calling `/api/support/order-updates`.
- **Additional intents** (`sizing_repairs`, `care_warranty`, `financing`): All now surface escalation forms that route to stylist contact (still minimal content).
- **Shortlist**: Saves to `/api/support/shortlist`, persists in session, and now confirms with “You now have N items saved”; shows a lightweight shortlist panel in the thread (remove, remove-all, share, stylist CTA). No dedicated drawer yet.
- **Prefetch**: `WidgetPrefetch` is wired into `app/layout.tsx`; common queries prefetch ready-to-ship and under-$300 sets.

## Architecture Notes (for future refactors)
- State: `useWidgetState.ts` persists messages/session to `sessionStorage` under `aurora-concierge-session-v1`. `showIntro` is transient (resets on remount).
- Actions: `useWidgetActions.ts` handles intent execution, module actions, tracking. Generates `requestId` per action. Order metadata is attached for returns, updates, CSAT, analytics.
- Modules: `src/components/support/modules/*` render UI for filters, carousels, order forms, timelines, returns, escalation, CSAT, quick filters.
- Providers: `conciergeDataMode` (env-driven). `localDb` expects Mongo collections (`products`, `widgetShortlists`, `widgetOrderSubscriptions`, `csatFeedback`, `analyticsEvents`, `stylistTickets`); `remoteApi` uses `CONCIERGE_*_ENDPOINT` envs; `stub` is default.
- Analytics: Client helper at `src/lib/concierge/analytics.ts` dispatches DOM events, pushes to `dataLayer`, and mirrors to `/api/dev-analytics/collect` (enabled by default). Order/session/intent/requestId metadata now travels with events.
- Environment guardrails: `src/lib/concierge/config.ts` warns when running stub in prod or missing required endpoints/DB URLs.
- Tests/automation: `scripts/verify-widget.mjs` now targets the current flows (products, shortlist, returns, stylist, csat) and captures request IDs; Playwright smoke covers the ready-to-ship → shortlist → track → returns → stylist → csat journey.

## Gaps & Risks
- **UX/Data parity**: Shortlist drawer and share are present; still need richer PDP/collection deep links and a fuller share/cart-like surface.
- **Data/Attribution**: Stub/local modes now carry order/session into analytics and service calls, but there is still no production-grade sink or customer linkage beyond session/orderNumber.
- **Environment**: Default stub mode hides backend regressions; guardrails log warnings but do not block deploy.
- **Observability**: No production analytics pipeline; errors only mirrored in dev/logs. `WidgetErrorBoundary` emits `aurora-widget-error` but nothing consumes it.
- **UX Debt**: Additional intents are minimalist escalation forms; intro dismissal now persists.

## New UX Findings (MCP 2025-12-09)
- ✅ Widget auto-opens on composer focus and quick-start actions; closed-state no-ops removed.
- ✅ Disambiguation → “Shop products” now auto-runs a ready-to-ship query after confirmation for faster results.
- ✅ Stub badge carries a tooltip and config docs link for clarity.

## Fix Roadmap (risk-mitigated, refactor-friendly)
1) **Stabilize & attribute (P0/P1)**
   - Keep last-order context fresh across tab reloads and use it everywhere we post (returns, order-updates, csat, analytics). ✅ implemented with smoke coverage.
   - Ship analytics sink choice: stub mirror stays on, but add an env-driven toggle for a real sink (or Mongo) and document rollout checklist. ✅ env-driven sink toggle present; rollout checklist still to document.
2) **Shortlist UX (P1)**
   - ✅ Dedicated shortlist drawer with share (native/clipboard/mailto fallback), remove-all confirmation, checkout CTA, and shortlist-aware stylist escalation; telemetry wired.
   - Next: add richer PDP/collection deep links and fuller share/cart surface.
3) **Feature completeness (P2)**
   - ✅ Intents `sizing_repairs`, `care_warranty`, `financing` route to escalation forms; intro dismissal persists.
4) **Testing & automation (P1/P2)**
   - ✅ `scripts/verify-widget.mjs` updated to current APIs/flows; Playwright smoke added (`tests/playwright/concierge-smoke.spec.ts`).
   - ✅ Contract tests for `/api/support/*` schemas added (`tests/unit/api-support-contract.test.ts`) covering orderId/orderNumber, numeric CSAT, and shortlist add/remove/clear paths.
5) **Performance & guardrails (P2)**
   - ✅ Data mode/stub telemetry emitted on mount and surfaced in UI badge; stub-prod enforcement/guardrails present.
   - Next: add explicit health check/logging when running stub in prod and keep `WidgetPrefetch` on widget pages.

## Refactoring Steps (ordered to reduce risk)
1. **Context plumbing**: Extend `WidgetState.session` with `lastOrder` (id/number/email/zip) and `lastFilters`; already done—keep consistent when new intents are added.
2. **Payload alignment**: Keep CSAT numeric, returns/order-updates carrying order references, and analytics enriched with session/order/intent/requestId. Add schema guards in handlers.
3. **Shortlist surfacing**: Reuse stored shortlist to render a mini-list + CTA; reuse for stylist escalation payloads.
4. **Analytics consolidation**: Centralize any new events through `lib/concierge/analytics.ts`; add batching/error hooks if a real sink is wired up.
5. **Environment guardrails**: Keep warnings in `config.ts`; surface data mode in a small badge in the widget footer (dev-only) to avoid silent stub usage.

## Quick References
- UI entrypoint: `src/components/support/SupportWidget.tsx`
- Intent engine: `src/lib/concierge/scripts.ts`
- Intent detection: `src/lib/concierge/intentRules.ts`, `src/lib/concierge/engine.ts`
- Data providers: `src/lib/concierge/services.ts`, `catalogProvider.ts`, `providers/*`
- API routes: `/api/support/*` under `app/api/support/`
- Feature flags: `src/lib/feature-flags.ts`
- Testing checkpoints (Chrome MCP): After each P0/P1 change, run the widget flow (ready-to-ship → shortlist save → track order → returns → order updates → CSAT → stylist) and inspect Network panel for payloads (orderId/orderNumber, numeric CSAT, shortlistCount) plus `aurora-*` events posting to `/api/dev-analytics/collect`.
