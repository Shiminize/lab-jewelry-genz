# Neon Dream Testing Backlog

This checklist tracks the work required to restore the 70% global coverage target and expand automation around the Neon rebuild.

## Unit & Integration Coverage
- [ ] Add component-level tests for `src/features/customizer/components/CustomizerExperience.tsx` (loading/error/accounting states).
- [ ] Cover `src/features/customizer/hooks/useCustomizerState.ts` with mocked manifest/config data to exercise caching and retry paths.
- [ ] Add repository/service tests for `catalogRepository`, `productService`, and `/api/neon/catalog` handlers.
- [ ] Write unit tests for `src/lib/cartSession.ts` to validate server/client interop.

## Playwright Smoke / E2E
- [ ] Re-enable the customizer smoke in CI once HDR/poster assets finalize.
- [ ] Author catalog + cart happy path smoke to keep GLB + commerce in sync.

## Follow-up
- [ ] Raise `coverageThreshold` in `jest.config.js` back to 70% once the above test suites land.
- [ ] Remove temporary coverage override in `qa-config.json` during the same PR.
