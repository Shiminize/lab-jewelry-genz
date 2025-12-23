# Rebuild Stability Operations

This playbook keeps the Neon Dream rebuild stable while features ship in parallel. Use it as the day-to-day checklist when reviewing PRs or preparing a release candidate.

## 1. Source of Truth Alignment
- **Roadmap parity:** Before approving a change, confirm it maps to the active milestones in `Docs/REBUILD_EXECUTION_PLAN.md`. Flag work that reintroduces Aurora assets or undocumented scopes.
- **Architecture guardrails:** Cross-check structural decisions with `Docs/ARCHITECTURE_NOTES.md` and `Docs/CLAUDE_RULES.md`. Components stay presentational, hooks own orchestration, services handle I/O with `zod` validation.

## 2. Health Command Bundle
Run the consolidated health suite before merges or handoffs:

```bash
npm run rebuild:health
```

This executes:
- `npm run lint` – Next.js lint coverage for new routes/components.
- `npm run safety:all` – Claude rule compliance, token validation, Neon lint, and type checks.
- `npm run qa:full` – Custom QA harness that surfaces behavior drift.
- `npm run glb:validate` – Enforces the 5 MB hard cap (4 MB warning) for `public/models/neon/manifest.json` assets.
- Coverage thresholds are temporarily dialed back to 10% (`jest.config.js`, `qa-config.json`) while Neon-specific tests are authored; restore the 70% target before cutover.

Use `node scripts/run-rebuild-health.js --list` to see task names and selectively skip (`--skip=glb`) or focus (`--only=glb`) runs when iterating.

## 3. GLB Pipeline Watchpoints
- Ensure `npm run setup:3d-tools` succeeds on fresh machines; without native `gltfpack` and `toktx`, GLB assets will silently degrade.
- Reject manifest updates that omit posters or HDR references; fallbacks remain temporary until replaced with production exports.
- Monitor CI logs for `ring-luxury-001.glb` warnings. Add texture re-export tasks to the board if the budget creeps past 4 MB.

## 4. Data & Service Hygiene
- All `src/services/neon/*` updates must extend the relevant `zod` schema and add/refresh Jest specs beside the helpers.
- Mongo seed scripts should remain idempotent; run `npm run db:seed` after structural changes to verify backwards compatibility.

## 5. Observability Hooks
- Capture failures from `npm run rebuild:health` in PR discussions so regressions are visible to the whole crew.
- Track open GLB/HDR TODOs and checkout/payment blockers in the cutover checklist inside `Docs/REBUILD_EXECUTION_PLAN.md` to avoid last-minute surprises.

Following this checklist keeps the rebuild synchronized, token-compliant, and within the GLB performance budget while feature work continues.
