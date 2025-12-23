# GlowGlitch Neon Dream Rebuild

This repository is being rebuilt from the ground up to deliver the Neon Dream experience described in `Docs/PRD_COMPLETE_2025.md`. The legacy Aurora-era assets, reports, and feature flags have been removed so the team can focus on a clean implementation.

## Status
- ✅ Documentation pared down to the PRD, core guidelines, and rebuild plan.
- ✅ Neon Dream app shell + homepage live with dedicated `src/components/neon/*` primitives.
- ✅ Legacy Aurora code, APIs, and tests removed; repository is ready for greenfield feature work.
- ✅ `/customizer`, `/catalog`, `/products/[slug]`, `/cart`, and `/checkout` now hydrate from Mongo-backed Neon services.
- ✅ Tailwind Neon tokens aligned across CSS variables and utility classes (`rounded-token-*`, void palette, ring offsets).
- ✅ GLB manifest + asset sizes validated via `npm run glb:validate` (5 MB cap, 4 MB warning budget).
- ✅ Coral & Sky (Option 4) homepage hero, stats, and featured tiles now source copy/assets from `src/content/homepage.ts`, using `Section` layout primitives plus `getPrimaryImage`/`formatPrice` helpers and the new `Section.Container` `fullBleed` toggle.
- ✅ Coral & Sky (Option 4) typography is canonical: DM Serif Display + Manrope load via `next/font`, `.type-*` utilities in `globals.css` encode the scale, and the `Typography` primitive maps variants across the app.
- ✅ `src/components/ui/*` now hosts the Coral & Sky implementations for Button, Container, Card, Typography, ProductCard, Header, Footer, and Logo; the neon namespace has been removed.
- ✅ Global tokens are organized by theme (Coral & Sky first, legacy neon flagged for removal) and the customizer now shares the light palette.
- ✅ Geometry: All Coral & Sky components now rely on square radius tokens (`--radius-* = 0px`); buttons, pills, and containers consume the shared `rounded-token-*` utilities so corners stay consistent.
- 🚧 Next up: capture production HDR/posters for GLB variants and ship checkout/payment integration.

## Getting Started
```bash
npm install
# optional: seed synthetic orders for dashboard/widget testing
npm run seed:mock
npm run dev
```

> During Phase 0 you may see legacy routes/components. Replace them instead of patching.

> Neon services automatically fall back to an in-memory Mongo stub when `MONGODB_URI` is unset or unreachable, so local dev and CI stay green without external dependencies.

### Authentication setup
1. Point the app at your Mongo instance by adding the following to `.env.local` (Atlas cluster recommended):
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/glowglitch
   MONGODB_DB=glowglitch
   AUTH_SECRET=change-me
   NEXTAUTH_URL=http://localhost:3000
   AUTH_TRUST_HOST=1
   # Optional: enable Google social login
   AUTH_GOOGLE_ID=<client-id>
   AUTH_GOOGLE_SECRET=<client-secret>
   AUTH_APPLE_ID=<client-id>
   AUTH_APPLE_SECRET=<client-secret>
   AUTH_FACEBOOK_ID=<app-id>
   AUTH_FACEBOOK_SECRET=<app-secret>
   # Optional: enable password reset emails
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=465
   SMTP_USER=apikey
   SMTP_PASS=<smtp-password>
   SMTP_FROM="GlowGlitch <no-reply@glowglitch.com>"
   ```
2. Seed baseline accounts (one admin + one customer) with:
   ```bash
   npm run seed:auth
   ```
   Override defaults with env vars such as `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_CUSTOMER_EMAIL`, or skip groups via `SKIP_SEED_ADMIN=1` / `SKIP_SEED_CUSTOMER=1`.
3. Start the dev server (`npm run dev:next` or `npm run dev`) and sign in with the seeded credentials. Accounts are persisted in the same Mongo database that already backs catalog/cart services, so middleware and NextAuth now rely on the exact same data store in every environment.
4. Password reset requests now hit `/api/auth/forgot-password` and `/api/auth/reset-password`. In development the reset link is logged to the console; wire up your email provider by piping that URL into your transactional service when you’re ready for production.

### Catalog search & discovery
- `/collections` now accepts a `q` parameter (for example `/collections?q=zircon`) and automatically surfaces matching products while keeping the existing tone/category filters in sync.
- `/api/search/products` (GET with `?q=` or POST with `{ "query": "..." }`) serves the same results to other clients, so the concierge widget or future mobile app can reuse the logic without copying UI code.
- Manual smoke: type a query in the toolbar search field, confirm the hero headline switches to “Results for…”, verify the active filter chip appears, then clear search via the × button to return to the full catalog.
- Empty states explain when a term has zero matches and offer one-tap suggestions (clear search, clear price, etc.)—keep this messaging in mind when adding new filters so the guidance stays accurate.

### Aurora Concierge (AI Support Widget)
- Set `DEEPSEEK_API_KEY` in your environment (`.env.local`) so the server-side proxy can reach DeepSeek securely.
- The front-end widget posts to `/api/ai/deepseek/chat`; keep the key server-side only (never expose it to the browser bundle).
- Backend proxy uses the official OpenAI SDK pointed at DeepSeek; run `npm install` after pulling to ensure the `openai` dependency is available.
- Configure concierge service endpoints for production data:
  - `CONCIERGE_PRODUCTS_ENDPOINT`
  - `CONCIERGE_ORDER_STATUS_ENDPOINT`
  - `CONCIERGE_RETURNS_ENDPOINT`
  - `CONCIERGE_CAPSULE_ENDPOINT`
  - `CONCIERGE_STYLIST_ENDPOINT`
  - `CONCIERGE_CSAT_ENDPOINT`
  - `CONCIERGE_SHORTLIST_ENDPOINT`
  - `CONCIERGE_INSPIRATION_ENDPOINT`
  - `CONCIERGE_ORDER_UPDATES_ENDPOINT`
  - Optional: `CONCIERGE_API_KEY` for authenticated requests

### Verification Checklist
After layout/styling changes, run the full quality sweep locally:

```bash
npm run lint
npm run typecheck
npm run test
npx playwright test tests/smoke/homepage-coral-sky.spec.ts --project=chromium
```

> Playwright now builds the app and serves it via `next start` on `127.0.0.1:3100` automatically; override with `PLAYWRIGHT_HOST` / `PLAYWRIGHT_PORT` if needed.

> **Browser hygiene:** When running manual Playwright captures, disable extension toolbars (Grammarly, Honey, coupon helpers) or launch a clean profile. Most inject `contentScript.bundle.js` and trigger noisy console messages that the test harness now filters, but it’s best to avoid them entirely for crisp evidence.

The Playwright smoke ensures the Coral & Sky hero (Option 4) renders the gradient headline, CTA pair, and featured tiles with the expected hero→gallery→placeholder fallback logic.

## Primary References
- `Docs/PRD_COMPLETE_2025.md` – product requirements and technical targets.
- `Docs/AI_DEVELOPMENT_GUIDELINES.md` – coding, testing, and accessibility expectations.
- `Docs/CLAUDE_RULES.md` – architectural guardrails for hooks, services, and presentation layers.
- `Docs/REBUILD_EXECUTION_PLAN.md` – step-by-step rebuild roadmap.
- `Docs/Design_Demo/` – visual reference HTML for Neon Dream.
- `Docs/widget_link_integration_checklist.md` – concierge widget integration runbook.
- `Docs/widget_backend_integration_plan.md` – backend contract map and rollout steps for concierge services.

## Next Steps
1. Finish the squared-geometry sweep: remove any lingering hard-coded `rounded-[...]` classes and replace with the token utilities.
2. Capture responsive/golden baselines for the Coral & Sky hero + stats strip and wire them into the homepage smoke suite. ✅ (Chrome, `tests/visual/homepage-hero.spec.ts`)
3. Expand Playwright coverage to WebKit/Firefox (CI) now that checkout typography is green. ✅ Manual verification complete; ensure CI runs `npx playwright test --project=chromium,firefox,webkit`.
4. Capture HDR environments and hero posters for each Neon GLB variant (replace placeholders). ➜ run `scripts/capture-glb-posters.js`, align with `Docs/GLB_HDR_REFRESH_CHECKLIST.md`.
5. Populate Mongo with production-ready catalog/customizer/cart data and keep Neon services aligned. ➜ update seed script + `customizerDefaults`.
6. Implement checkout payments (Stripe + Apple Pay) using the `/api/neon/checkout` intent pathway (Phase 4).
7. **Admin Dashboard – Pending Integrations**
   - [ ] Supply Slack webhook + final notification email to finalize creator alert automation (currently blocked).
   - [ ] Hook Slack/email alerts into `resendCreatorMediaKit` once credentials are available.
   - [ ] Surface commission accruals and payout status for creators inside `/dashboard/creators`.
   - [ ] Add fulfillment controls to `/dashboard/orders` (status transitions, tracking entry, exports).
   - [ ] Build creator-facing analytics dashboard pulling from the same admin data views.

## Rebuild Health
- Run `npm run rebuild:health` before merges to execute linting, safety, QA, and GLB budget checks in one pass (see `Docs/REBUILD_STABILITY_OPERATIONS.md`).
- Use `node scripts/run-rebuild-health.js --list` to inspect task keys and enable targeted reruns (`--skip=glb`, `--only=safety`).
- `npm run validate:customizer-assets` verifies every manifest entry has local GLB, poster, and HDR assets in `/public` and is now part of the rebuild health sweep.

## GLB Pipeline Quickstart
- Place processed assets in `public/models/neon/` and register them in `public/models/neon/manifest.json`.
- Run `npm run setup:3d-tools` once per environment to install native `gltfpack`/`toktx` binaries (falls back to `npx gltfpack` with a warning if skipped; macOS still requires `brew install ktx-tools` for texture compression).
- Run `node scripts/glb-pack.js --input <sourceDir> --output public/models/neon --manifest public/models/neon/manifest.json` to compress and merge entries; posters auto-refresh unless you pass `--no-posters`.
- Run `npm run glb:capture-posters` when you need to regenerate posters without repacking (supports `--variant <id>` or custom `--output-dir`).
- Per-variant poster settings live under `posterCapture` in `manifest.json` (e.g. `cameraOrbit`, `background`, `format`, `outputDir`).
- Optional manifest metadata (`tagline`, `description`, `highlights`, `tone`, `defaultMaterialId`, `defaultSize`) powers the `/customizer` UI; update those fields alongside new GLBs.
- Use `/app/customizer` to validate that new variants stream correctly (loading, error, and empty states are already covered).
- After adding posters or HDR maps, run `npm run validate:customizer-assets` to confirm paths resolve locally, stay within the 5 MB GLB budget, and pass the 90‑day freshness check for media assets.

Please keep new documentation small, relevant, and tied to the rebuild. If a file becomes obsolete, delete it rather than archiving in-place.
