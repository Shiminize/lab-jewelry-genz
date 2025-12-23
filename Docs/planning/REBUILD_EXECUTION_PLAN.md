# Neon Dream Rebuild Execution Plan

This document is the single source of truth for rebuilding the GlowGlitch experience on a clean Neon Dream foundation. It replaces all prior Aurora-era audit reports and migration logs.

## Objectives
- Deliver a mobile-first, Neon Dream–compliant storefront and 3D customizer.
- Replace the image-sequence viewer with a GLB streaming pipeline (Draco + Meshopt + KTX2).
- Stand up a maintainable service layer with strict TypeScript typing and documented APIs.
- Decommission Aurora tokens, components, tests, and feature flags.

## Status Snapshot (2025-10-03)
- **Phase 1 – App Shell:** ✅ Complete. Neon layout, primitives, and homepage are live.
- **Phase 2 – GLB Viewer:** 🔄 In progress. `<GlbViewer>`, manifest-driven hook/service, Mongo-backed `/api/neon/customizer/config`, and the `/customizer` route are active; HDR/poster assets and performance tests pending.
- **Phase 3 – Commerce Surfaces:** 🔄 In progress. Catalog/product routes, `/cart` page, `/checkout` placeholder + checkout intent stub, and header indicator read from Mongo-backed services with Neon UI; payments still pending.
- **Phase 4 – Services & Integrations:** ⏳ Not started.
- **Cutover Checklist:** README updated; remaining items deferred until phases 3–4.
- **Token Hygiene:** ✅ Tailwind config now reads the Coral & Sky palette from `src/app/globals.css` while retaining the James Allen radius/shadow layout tokens for modern card geometry.
- **GLB Performance Budget:** ✅ `npm run glb:validate` enforces a 5 MB cap (4 MB warning) across local manifest entries; `ring-luxury-001.glb` now ships at ~2.0 MB with the native toolchain.
- **GLB Toolchain:** ✅ `scripts/setup-glb-tools.js` installs native `gltfpack` + `toktx`; `scripts/glb-pack.js` prioritizes the native toolchain with fallback warnings.
- **Customizer Asset Validation:** ✅ `npm run validate:customizer-assets` checks that manifest GLBs, posters, and HDR maps live in `/public`, stay under size budgets, and flags posters/HDRs older than 90 days.
- **Static Asset Health:** ⚠️ Replaced 404 placeholders for `/hdr/studio_small_09_1k.hdr` and `/images/products/astronaut.webp` with Neon-safe fallbacks; swap in production HDR + poster files when the final drop arrives.
- **Poster Automation:** ✅ `npm run glb:capture-posters` renders fresh poster frames for every manifest variant via headless Puppeteer and updates the manifest automatically; tune per-model capture via the manifest `posterCapture` block.
- **Customizer UI Parity:** ✅ `/customizer` now mirrors the Neon demo layout with manifest-driven variant metadata (taglines, highlights, default materials) and a fully wired GLB viewer without requiring 3D on product pages.
- **Catalog Data Fallbacks:** ✅ Memory DB now seeds detailed materials/gemstones/gallery data for six headline capsules so product pages stay rich even without Mongo connectivity.
- **Catalog Media Fallbacks:** ⚠️ Seed data, homepage spotlight tiles, and hero preview now reference Neon 3D sequence stills so cards render unique imagery until the production asset pipeline lands.
- **Rebuild Health Automation:** ✅ `npm run rebuild:health` bundles lint, safety, QA, and GLB validation with CI enforcement.
- **Coverage Threshold:** ⚠️ Temporarily reduced to 10% until Neon route/unit suites are restored; raise back to 70% prior to cutover.
- **Catalog Visual Parity:** ✅ Shared Neon `ProductCard` powers homepage spotlight and catalog grid with unique media/tones using Mongo data fallbacks.
- **Admin Dashboard:** ✅ Lightweight Shopify-style admin now lives under `/dashboard` with catalog editing, homepage copy controls, creator pipeline review, orders analytics, and activity log with undo support; token-gated access and SMTP-powered notifications are configured.
- **Homepage Option 4:** ✅ Coral & Sky hero, CTA tone mapping, stats strip, and Shop Collection tiles now pull copy/assets from `src/content/homepage.ts`, relying on the shared `Section` primitive alongside `getPrimaryImage` + `formatPrice` helpers.
- **Typography Scale:** ✅ DM Serif Display + Manrope load via `next/font`; `.type-*` utilities in `globals.css` define the Editorial Glow hierarchy and the `Typography` primitive now maps its variants directly to those tokens.
- **Layout Container Variant:** ✅ `Section.Container` exposes a documented `fullBleed` option (mobile padding preserved; desktop unlocks `px-8/12/16`) so edge-to-edge sections (e.g. the homepage hero) can match the Coral & Sky demo while other blocks stay centered.
- **UI Primitives:** ✅ `src/components/ui/*` now owns the Coral & Sky implementations (with James Allen spacing/radius refinements) for Button, Container, Card, Typography, ProductCard, Header, Footer, and Logo. The legacy `src/components/neon/*` path has been removed—application code imports exclusively from the UI namespace.
- **Token Hygiene:** ✅ `src/app/globals.css` groups the Coral & Sky variables at the top (and tags remaining neon/void tokens for deprecation); cart/gallery surfaces now consume the light theme utilities.
- **Customizer Theme:** ✅ Customizer hero + controls restyled with the Coral & Sky utilities (`text-body`, `bg-surface-panel`, `shadow-soft`); neon glows persist only in explicitly marked legacy utilities.
- **GLB/HDR Refresh Process:** ✅ `Docs/GLB_HDR_REFRESH_CHECKLIST.md` documents asset drop, manifest updates, and validation steps; customizer smoke (`tests/smoke/customizer-viewer-smoke.spec.ts`) re-enabled.
- **Dev Server Stability:** ✅ `server.js` now force-disconnects Socket.IO clients during shutdown so Playwright and `npm run rebuild:health` sweeps exit cleanly instead of hanging on long-lived connections.
- **Poster Parity:** ✅ Homepage hero, catalog seeds, and the memory Mongo stub now use posters captured via `npm run glb:capture-posters` so UI thumbnails stay in lockstep with the customizer manifest.
- **Catalog Marketing Media:** ✅ Static hero photos for collection cards live under `/images/products/static/<slug>/hero.webp` and feed both catalog defaults and the in-memory Mongo seed, so marketing shots can diverge from GLB posters without touching the manifest.
- **Manifest Marketing Image:** ✅ Each customizer variant now exposes a `marketingImage` entry alongside `poster`, and `validate:customizer-assets` enforces its presence so commerce surfaces stay in sync with the GLB manifest.
- **Catalog Filters:** ✅ `/catalog` now supports URL-driven category and tone filters with shareable links, using the Neon `ProductCard` grid for filtered results and a branded empty state.
- **Marketing Photo TODO:** ⚠️ Replace the current placeholder stills in `/images/products/static/<slug>/hero.webp` with final photography when the asset drop lands; update catalog galleries and Mongo seeds in the same pass.
- **Customize CTA Guardrails:** ✅ Catalog and product detail pages only surface the "Customize" CTA when a product is tied to a GLB variant, keeping static photo capsules from pointing at the customizer.
- **Checkout Concierge Flow:** ✅ `/checkout` now explains the manual concierge process with direct email/call CTAs while payments remain a Phase 4 integration.
- **Product Detail Gallery:** ✅ Static photo capsules feature a thumbnail gallery with full-size viewer so marketing imagery feels polished while GLB assets stay optional.
- **Cart Concierge Prep:** ✅ Cart UI now highlights tone badges, concierge contact CTAs, and shipping notes so the static catalog aligns with the manual checkout flow.
- **Gallery Coverage:** ✅ Added Jest coverage for `ProductGallery` interactions (thumbnail swap + lightbox) to raise Phase 3 confidence while we grow the static catalog.
- **Story Metadata:** ✅ Product detail pages now read optional `inspiration` + `highlights` metadata so marketing can drop narrative copy without touching layout code.
- **Product Detail Layout:** ✅ Product pages now mirror the Neon Dream demo styling with a split hero, concierge-ready pricing card, and gallery lightbox for static photography.

## Phase 0 – Project Bootstrap
1. **Create new repository or branch** dedicated to the rebuild.
2. Initialize Next.js 14 with TypeScript (`strict: true`), Tailwind, ESLint, Prettier.
3. Configure Tailwind with Neon Dream tokens only (`src/app/globals.css`).
4. Establish CI scripts: `lint`, `typecheck`, `test`, `test:e2e`.

## Phase 1 – App Shell
1. Implement `layout.tsx` with the Neon Dream header, footer, typography, and meta tags.
2. Build shared UI primitives: `Button`, `Typography`, `Card`, `Glass`, `CategoryTone` helper.
3. Port modules from current repo only if they meet Neon standards; otherwise rebuild.
4. Author smoke tests for layout and design tokens.

### Phase 1.1 – Coral & Sky Layout Stabilization
_Goal: lock the Option 4 (Coral & Sky) hero + featured strip as reusable building blocks before additional sections land._

1. **Layout primitives** – Introduce `Section`, `Section.Header`, and `Section.Container` wrappers that encode responsive spacing (`py-12 md:py-20 lg:py-24`) and padding (`px-4 sm:px-6 md:px-12`). Existing homepage blocks migrate to these primitives so future sections compose, rather than redefining grids. Add a `fullBleed` toggle on `Section.Container` for edge-to-edge layouts while documenting the default `max-w-7xl` center behavior.
2. **Typography tokens** – ✅ Editorial Glow (DM Serif Display + Manrope) mapped to `.type-*` utilities in `globals.css`; `Typography` variants now use the shared scale and homepage hero/stats/tiles, catalog/cart, customizer, and checkout surfaces ride the same tokens.
3. **Radius tokens** – ✅ Coral & Sky `--radius-*` variables are defined at `0px`, so every `rounded-token-*` utility renders geometric corners. Buttons, chips, and surfaces now rely on these tokens instead of hard-coded values.
4. **Hero refactor** – ✅ `HeroSection` now rides `Section` + `StatsStrip`, supporting stacked mobile layouts, two-column ≥lg, and CTA responsiveness out of the box.
5. **Stats tray** – ✅ `StatsStrip` primitive renders tokenized `<dl>` markup with breakpoint-aware grid controls so other sections can reuse the stat trio pattern without copy/paste.
6. **Featured strip card deck** – ✅ `CardDeck` helper provides the responsive grid/gap scaffold used by `ShopCollectionSection` and future three-up Coral & Sky sections.
6. **Testing** – Extend the Coral & Sky Playwright suite to assert (a) responsive hero breakpoints, (b) the stat tray renders three `<dd>` values, and (c) featured tiles adopt the card deck spacing. Capture golden screenshots once spacing settles; existing smokes cover catalog/customizer typography and will pick up checkout once the cookie handler fix lands. Keep running `npm run lint`, `npm run typecheck`, `npm run test`, plus `npx playwright test tests/smoke/*.spec.ts --project=chromium` after styling passes. The Playwright config builds the app and runs `next start` on `127.0.0.1:3100` automatically so tests avoid dev-server watcher limits.
7. **Documentation** – Update `Docs/ARCHITECTURE_NOTES.md` and `README.md` with the new primitives/tokens so teams understand how to extend the layout, including the `fullBleed` switch and the migration away from Neon-specific component names via `src/components/ui`.

## Phase 2 – GLB Viewer Platform
1. Stand up a `/features/customizer` slice with:
   - `<GlbViewer>` (Three.js or `<model-viewer>` runtime).
   - `useCustomizerState` hook for variant + price orchestration.
   - `customizerService` for API interactions.
2. Implement asset pipeline scripts (`scripts/pack-glb`, `scripts/extract-ktx2`).
3. Deliver functional `/customizer` route with streaming GLB preview and fallback images.
4. Validate performance targets (hero frame <1.5s on 4G) and write Playwright smoke test. Use `npm run glb:validate` to keep asset sizes within budget before CI runs.
5. Auto-capture poster frames with `npm run glb:capture-posters` after each GLB repack so manifest entries stay in sync.
6. Add `scripts/setup-glb-tools.js` to download native `gltfpack` + `toktx` binaries per platform.
7. Update `scripts/glb-pack.js` to invoke the native toolchain with Draco + Meshopt + KTX2 compression, falling back to the Node build with a warning.

## Phase 3 – Commerce Surfaces
1. Rebuild homepage using Neon components and the GLB preview card.
2. Port catalog/product pages with new filters, CTA tones, and price presentation.
3. Wire up `productService`, `searchService`, and `cartService` with strict response schemas.
4. Create Storybook or doc examples for key components (optional but recommended).

## Phase 4 – Services & Integrations
1. Re-implement authentication, checkout, and creator dashboards in the new architecture.
2. Ensure API routes return PRD-compliant envelopes (`{ success, data, meta }`).
3. Add observability: Sentry, DataDog (or equivalent) in clean wrappers.
4. Run security and accessibility audits before launch.

## Cutover Checklist
- [ ] All production routes point to Neon shell.
- [ ] GLB pipeline validated on mobile and desktop.
- [ ] Tests: unit, E2E, visual baselines updated.
- [ ] Old Aurora assets archived; repo history retains them if needed.
- [ ] README updated with new instructions.
- [ ] Production HDR/poster assets captured for all GLB variants.
- [ ] Checkout payments (Stripe + Apple Pay) enabled via `/api/neon/checkout`.

## Artifact Retention
Keep only the following reference files from the legacy repo:
- `Docs/PRD_COMPLETE_2025.md`
- `Docs/AI_DEVELOPMENT_GUIDELINES.md`
- `Docs/CLAUDE_RULES.md`
- `Docs/Design_Demo/glowglitch-genz-design-system.html`
- `Docs/Design_Demo/glowglitch-products-page.html`

All other reports, audits, and checklists are intentionally removed to avoid confusion.
