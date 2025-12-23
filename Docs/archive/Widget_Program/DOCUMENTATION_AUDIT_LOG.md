# Documentation Audit Log – 2025-09-13

## Scope
Quick sweep of high-signal documentation to confirm relevance for the Neon Dream rebuild and identify artifacts that can be retired immediately.

## Verified Sources of Truth
- `Docs/AI_DEVELOPMENT_GUIDELINES.md` – still the canonical engineering playbook; references Neon-specific patterns that remain in use.
- `Docs/ARCHITECTURE_NOTES.md` – aligns with current service → hook → component layering.
- `Docs/REBUILD_EXECUTION_PLAN.md` & `Docs/REBUILD_STABILITY_OPERATIONS.md` – actively referenced in README and operational checklists.
- `Docs/TESTING_BACKLOG.md` & `Docs/GLB_HDR_REFRESH_CHECKLIST.md` – continue to describe outstanding work streams.
- `Docs/Design_Demo/` HTML references – kept as design provenance for the marketing/design squads.

## Removed Artifacts
| Path | Reason for removal |
| --- | --- |
| `project_documentation/design-token-ab-testing-feature-documentation.md` | Documents a class migration/flag system (`src/config/featureFlags.ts`, `useDesignVersion`) that no longer exists in the codebase. Keeping it creates confusion during onboarding. |
| `project_documentation/user-onboarding-feature-documentation.md` | Describes registration/onboarding flows and endpoints that are not present in the Neon rebuild. Retiring it prevents drift between docs and reality. |

The entire `project_documentation/` directory consisted of the above legacy write-ups and has been removed.

## Follow-Up Recommendations
- Update `Docs/CLAUDE_RULES.md` token references to point to the active Neon design spec (once captured in source control).
- Refresh `Docs/TESTING_BACKLOG.md` once new automation lands so completed items are checked off.
- Consider adding a single index (README section) that links to the documents above for quicker discovery.

---
_Last updated: 2025-09-13 by Document Refactor Specialist._
