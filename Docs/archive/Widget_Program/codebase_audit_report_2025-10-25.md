# Codebase & PRD Audit Report – 2025-10-25

## Scope
- Reviewed `Docs/PRD_COMPLETE_2025.md` against current repository state
- Inspected concierge widget, admin dashboards, and supporting services
- Catalogued missing features, duplicated configuration, and dead assets to inform next-planning steps

## Findings

### 1. PRD Misalignment
- **Capsule workflows removed**: Widget is “recommendation-only” (`src/app/api/support/*` has no capsule endpoints), yet PRD still lists capsule reservations, analytics, and guardrails. QA evidence under `Docs/concierge_v1/**` still enumerates capsule scripts. **Recommendation**: either mark capsule scope as deferred in PRD and archive the guardrail docs or restore the feature with a new implementation plan.
- **Sustainability/ESG surfaces absent**: PRD promises supply-chain transparency, carbon-neutral messaging, and ESG metrics. Front-end has no components in `src/components` or data models in `src/services` to support these stories. **Recommendation**: log stories/cards for sustainability banners and telemetry, or amend PRD expectations.
- **Creator commission tooling missing**: PRD outlines 30% commissions and creator dashboards. Current `src/app/dashboard/creators` only displays aggregates from `services/admin/creatorStats.ts` without ledger/payout logic. **Recommendation**: scope backend + UI work for commission tracking (or adjust PRD).
- **Global launch readiness lacking**: PRD targets US/CA/UK/AU, but storefront only prices in USD; no currency/locale switching or regional shipping logic exists. **Recommendation**: add multi-currency and shipping workstreams or note as future phase.

### 2. Duplicated / Divergent Configuration
- **Quick-start filters defined twice**: `src/config/quickstart.json` and `src/lib/concierge/types.ts:186` both declare quick links; the TypeScript version still hardcodes filters and diverges from JSON. **Recommendation**: make JSON the source of truth and generate button payloads from it.
- **Normalization logic split**: `src/lib/concierge/intent/normalizer.ts` and `src/lib/concierge/catalogProvider.ts` maintain separate filter normalization. Recent updates (featured flag, limit clamps) exist only in the new helper. **Recommendation**: refactor catalog provider to use the shared normalizer to avoid inconsistent GET vs. POST behaviour.

### 3. Dead / Legacy Assets
- `src/lib/concierge/intentToFilter.ts` and `scripts/test-intent.mjs` are unused legacy logic (only referenced in archived docs). **Action**: remove or rewire; leaving them risks future regressions.
- `src/components/support/WidgetPrefetch.tsx` / `WidgetPrefetchMetadata()` are not imported anywhere. **Action**: delete or integrate into the widget entrypoint if prefetching is still desired.
- Capsule guard scripts/evidence in `Docs/concierge_v1/**` refer to removed endpoints (`/api/support/capsule`, `aurora_capsule_reserved`). **Action**: archive or update to reflect current scope.

### 4. Functional Gaps & Bugs
- **Empty-state CTA overlap**: prior to sanitisation, empty-state clicks carried impossible filters. Recent fix now merges curated presets. **Recommendation**: add regression tests (Playwright already added) and document the new analytics events.
- **Dev hook exposure**: test harness relies on `widget:setFilters` event added in `SupportWidget` for Playwright. This must remain dev-only and documented. **Action**: guard event handler with `process.env.NODE_ENV !== 'production'` and note in README/test guide.
- **Analytics schema lagging**: new events `aurora_concierge_quickstart_clicked` and `aurora_concierge_empty_state_cta_clicked` are emitted but absent from `Docs/analytics/aurora-event-catalog.md`. **Action**: update documentation and ingestion pipelines.

### 5. Missing Tests / Evidence
- Only `tests/widget.design-ideas.spec.ts` covers quick-start wiring. There are no automated assertions for capsule absence, sustainability messaging, or creator dashboards. **Recommendation**: expand E2E coverage once features exist, and remove obsolete UAT evidence referencing deleted flows.

## Recommendations Summary
1. **Reconcile PRD and roadmap**: Document scope changes (capsules, sustainability, creator payouts, multi-currency) in PRD or ticket backlog.
2. **Unify quick-start config**: Consume `src/config/quickstart.json` when rendering buttons instead of duplicating definitions.
3. **Delete legacy code**: Remove unused intent/memory scripts, WidgetPrefetch, and capsule guard docs to reduce confusion.
4. **Document & guard dev hooks**: Keep `widget:setFilters` dev-only and describe its testing purpose.
5. **Update analytics doc**: Add new quick-start and empty-state events to the event catalog and ensure backend capture.
6. **Plan missing features**: Create work items for sustainability messaging, creator commissions, global currency support, or adjust PRD expectations.

## Next Steps for Planning (ChatGPT follow-up)
- Confirm ownership for PRD edits vs. engineering backlog items.
- Prioritise deletion of unused modules and doc clean-up to avoid QA confusion.
- Define requirements for sustainability/commission features if they remain in scope.
- Schedule analytics/documentation updates alongside recent event instrumentation.

