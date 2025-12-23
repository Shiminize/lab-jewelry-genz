# UI Refactor Plan

## Repository Baseline (Phase A)

### Key Paths
- `src/app/*` – Next.js App Router pages and layouts (multiple feature folders such as `catalog`, `creators`, `support`).
- `src/components/*` – Shared UI widgets (many Tailwind-based components).
- `app/styles/*` – Tailwind config helpers (`globals.css` currently defines extensive `--ja-*` tokens and uses `@tailwind`).
- `tailwind.config.js` – Custom Tailwind theme powering current design system.
- `playwright.config.ts` & `tests/*` – Existing E2E setup (mixed coverage, needs replacement per new spec).

### Tooling & Config
- Path aliases: `@/* → src/*` (defined in `tsconfig.json`).
- Styling: Tailwind CSS with `@tailwind base/components/utilities`; numerous utility classes remain in components.
- Fonts: custom fonts loaded via CSS variables in `globals.css`.
- Middleware present (`middleware.ts`) enforcing auth/rate-limits – avoid modifying.

### Risks & Considerations
- **Hydration warnings**: Current Tailwind styles rely on `@apply`; replacing with new token-driven CSS must ensure no mismatch between server/client markup. Avoid mixing Tailwind utility remnants with new token classes.
- **CSS ordering**: Removing Tailwind layers can break existing components during transition. Need staged rollout (tokens/base first, then component refactors) while keeping legacy styles until replaced.
- **Routing debt**: Many navigation links point to non-existent routes (e.g. `/faq`, `/support`). For parity we must implement or gracefully stub to prevent 404 spam.
- **Playwright config**: Existing tests expect prior UI; they will fail once layout changes. Plan to replace with new suite after primitives & pages ready.
- **Asset loading**: Build currently generates hashed chunks; ensure new CSS modules integrate with Next’s CSS pipeline without conflicting with Tailwind purge.

### Phase Checklist
1. **Phase A (current)** – Document baseline (this file), outline risks, prepare plan. ✅
2. **Phase B** – Introduce tokenized design foundation (`app/styles/tokens.css`, `base.css`, `typography.css`); wire into layout.
3. **Phase C** – Build geometric primitives (Button, Chip, Card, Section, Container, Grid) + `/app/style-guide` demo.
4. **Phase D** – Replace header/footer with new IA (luxury navigation, brand left, legal footer).
5. **Phase E** – Collections (PLP) pages with query-synced filters/sort + grid derived from new primitives.
6. **Phase F** – Product detail page longform layout.
7. **Phase G** – Editorial & static informational pages.
8. **Phase H** – Accessibility polish, design documentation (`docs/ui_design_notes.md`), ensure AA contrast & focus rings.
9. **Testing/CI** – After each phase (C onward) run `npm run build` and new Playwright suite (`npm run test:e2e`) until green; update `.github/workflows/e2e.yml` near completion.

### Immediate Next Steps
- Keep legacy Tailwind globals in place until new token system ready; migrate gradually to avoid style flash.
- Audit existing data providers & pages to ensure no business logic changes during UI updates.
- Start Phase B by scaffolding tokens & base style sheets, ensuring they coexist with current styles before removing Tailwind usage.

