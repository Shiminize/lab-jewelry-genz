# Neon Dream Rebuild – Architecture Notes

_Last updated: 2025-10-02 21:09 CST_

## 1. Current Snapshot
- Neon layout, header, footer, and home route are rebuilt with dedicated `components/neon/*` primitives.
- Tailwind config now sources the Coral & Sky token layer (with the refined James Allen radii/shadow layout tokens) defined in `src/app/globals.css`; the brand palette (`--ja-accent-primary`, `--ja-accent-secondary`, `--ja-accent-muted`, `--ja-surface-page`, `--ja-text-primary`) powers accent/text utilities while the shared radius/shadow values keep the updated card geometry.
- Option 4 “Editorial Glow” typography is the canonical scale: `next/font` loads DM Serif Display + Manrope in `src/app/layout.tsx`, `.type-*` utilities encode the display/heading/body/eyebrow sizes in `globals.css`, and the `Typography` primitive maps variants onto those tokens.
- GLB manifest validated with `npm run glb:validate`; local assets respect the 5 MB cap (4 MB warning budget) and surface size warnings in CI logs.
- Customizer route now renders the manifest-driven `<GlbViewer>` placeholder with Neon ring variants drawn from the local manifest and shared HDR lighting.
- Manifest entries include descriptive metadata (`tagline`, `highlights`, `tone`, defaults) consumed by the `/customizer` UI to mirror the Neon Dream product-detail demo while keeping the underlying viewer manifest-driven.
- Legacy API/services/tests removed; only `src/lib/utils.ts` retained. TypeScript now runs in `strict` mode.
- Mongo access gracefully falls back to the seeded in-memory store when `MONGODB_URI` is missing or the cluster is unreachable, keeping cart/catalog flows functional in CI and local smoke tests.
- Playwright QA runs no longer hang because the custom server’s graceful shutdown now disconnects lingering Socket.IO clients before awaiting HTTP teardown.
- Catalog/homepage thumbnails now read the captured `poster` paths from the GLB manifest so marketing cards and hero previews stay aligned with the customizer output. When a hero image is missing, `getPrimaryImage` in `src/lib/imageResolver.ts` gracefully falls back to gallery media or the gradient placeholder.
- Collection and catalog cards now source static marketing photos from `/images/products/static`, while the customizer continues to rely on manifest posters for GLB parity.
- Static marketing slots currently reuse GLB posters as placeholders; swap them for real photography when creative delivers the final pack. The shared `formatPrice` helper in `src/lib/format.ts` keeps pricing consistent across cards + detail views.
- Customizer experience now uses the Coral & Sky tokens (`bg-app`, `text-body`, `shadow-soft`) across hero cards, variant selectors, and pricing panels; neon/void tones remain only on tagged legacy utilities.
- Catalog route exposes shareable category + tone filters via search params so marketing can snapshot curated capsule groupings without relying on a CMS. `ShopCollectionSection` now consumes layout primitives and the image/price helpers so additional commerce strips can be composed with minimal glue.
- Homepage hero (Option 4) now uses the shared `Section` primitive, `bg-app` surface, gradient headline utilities, CTA tone mapping, and optional media/stats props; content flows from `src/content/homepage.ts` so future experiments remain data-driven.
- **Decision (2025-10-05):** extend `Section.Container` with a documented `fullBleed` variant instead of adding a hero-only override. This keeps layout semantics centralized, lets other sections opt into edge-to-edge presentation without bespoke wrappers, and preserves mobile padding defaults while relaxing desktop max-width constraints.
- `src/components/ui/*` now hosts the Coral & Sky implementations for Button, Container, Card, Typography, ProductCard, Header, Footer, and Logo; the legacy `src/components/neon/*` namespace has been removed so all imports route through the UI layer.
- CSS tokens in `src/app/globals.css` are grouped by theme: Coral & Sky variables lead, while legacy neon/void entries are flagged for removal once dark surfaces (e.g. customizer) migrate.
- Cart and gallery surfaces now rely on the Coral & Sky utilities (`text-body`, `bg-app`, `shadow-soft`) instead of legacy `text-void-*` and neon gradients.
- Manifest variants define both `poster` and `marketingImage`; validation enforces local availability so commerce surfaces inherit the same source of truth as the customizer.
- Customize CTAs now check for a manifest-backed variant so static photo-only capsules never send shoppers into the GLB experience.
- Checkout route communicates the interim concierge-led payment flow with clear CTAs while the automated Phase 4 integration is pending.
- Product detail view uses a client-side gallery with lightbox so static photography scales without requiring GLB assets per SKU.
- Cart surface now includes concierge contact CTAs and tone-aware badges to mirror the static-only checkout experience.
- Product metadata supports `inspiration` and `highlights` fields so the story block renders richer copy once the merch CMS is connected.
- Product detail layout now mirrors the Neon demo: split hero grid, concierge pricing card, and static gallery lightbox.

### GLB Tooling Gap
- `scripts/setup-glb-tools.js` now downloads native `gltfpack` binaries (macOS arm64/x64 + Linux x64). Invoke `npm run setup:3d-tools` before packing; macOS developers must still install `toktx` manually (e.g., `brew install ktx-tools`) until a redistributable archive exists.
- `scripts/glb-pack.js` prefers the native toolchain and falls back to `npx gltfpack` with a warning when binaries are missing; posters/HDRs still require manual management.
- Continue monitoring `ring-luxury-001.glb` in `npm run glb:validate`; the warning threshold remains at 4 MB until texture assets are re-exported.

## 2. Phase 1 Progress & Next Actions
- ✅ Neon-only app shell (`layout`, `globals.css`, header/footer, button/container primitives).
- ✅ Home page rewritten with Neon hero, experience, spotlight, and CTA sections.
- ✅ Legacy routes/components deleted; `src/components` now only exposes Neon primitives.
- ✅ TypeScript strict mode enabled (`tsconfig.json`) with legacy services/tests stripped out.
- ✅ Tailwind safelist trimmed to core Neon gradients/shadows.
- ✅ Added Neon token utilities (`rounded-token-*`, ring offsets, void scale) to Tailwind + CSS for consistent design surfaces.
- ✅ Added `npm run glb:validate` to enforce GLB size budgets; `ring-luxury-001.glb` compressed to ~2.0 MB with the native toolchain while the 11 MB raw source remains in `assets/neon-source/`.
- ✅ Added Neon `Typography` + `Card` primitives and placeholder routes for `/catalog`, `/products/[slug]`, `/customizer`.
- ✅ Added native `gltfpack` + `toktx` bootstrap (`scripts/setup-glb-tools.js`) and updated `scripts/glb-pack.js` to favor native compression with texture support.
- ✅ `/customizer` route now mounts `CustomizerExperience` with `useCustomizerState`, manifest-driven `<GlbViewer>` wiring, and Neon UI copy.
- ✅ Seeded `public/models/neon/manifest.json` with the first two Neon ring models, shared HDR environment, and scaffolded `src/services/neon/customizerService.ts`.
- ✅ Added material/pricing stubs in the customizer service, UI hooks in `CustomizerExperience`, and Jest coverage for the pricing helpers.
- ✅ `/api/neon/customizer/config` now reads from MongoDB with automatic fallback + seeding of default material/price data.
- ✅ Catalog + product pages now hydrate from MongoDB via `getCatalogProducts`/`getCatalogProductBySlug` with API endpoints exposed under `/api/neon/catalog`.
- ✅ Cart service + `/api/neon/cart` endpoints provide Mongo-backed add/remove/list operations with Jest coverage.
- ✅ `/cart` route renders Neon cart UI with server actions and a client hook `useCartClient`; header cart indicator now reflects Mongo-backed counts.
- ✅ Added `calculateCartTotals` helper, `/checkout` placeholder page, and `/api/neon/checkout` intent stub ahead of Phase 4 payments.
- ✅ Added `scripts/validate-customizer-assets.js` + `npm run validate:customizer-assets` to ensure every manifest entry references local GLB/poster/HDR assets before CI, including a 90-day freshness warning for posters/HDRs.
- 🔄 Create Neon utility components (`StackedGradientHeading`, badges, etc.) as catalog/product pages mature.
- 🔄 Replace shared HDR and poster placeholders with production exports per asset pipeline.
- 🔄 Enable the customizer Playwright smoke (`tests/smoke/customizer-viewer-smoke.spec.ts`) once the GLB pipeline is verified in CI.
- 🔄 Expand `src/services/neon` to cover pricing, sharing, and analytics endpoints as APIs evolve.

## 3. GLB Pipeline Strategy (Phase 2)
- Use `<model-viewer>` for MVP with option to swap to Three.js if we need lower-level control.
- Asset workflow:
  1. Designers export `.glb`.
  2. Run `gltfpack` (Draco, Meshopt) + `ktx2` texture conversion.
  3. Store processed assets under `public/models/neon/` with manifest JSON.
- Build `scripts/glb-pack.ts` CLI to batch process assets and emit manifest.
- Viewer architecture:
  - `features/customizer/components/GlbViewer.tsx`
  - `features/customizer/hooks/useGlbVariant.ts`
  - `services/customizerService.ts` for API integration.

## 4. Commerce Surface Plan (Phase 3)
- **Home**: Hero, Shop Collection, Design Studio, Social Proof – align with demo HTML.
- **Catalog**: Filters, tone-driven CTAs using `getCategoryTone`.
- **Product Detail**: Gallery (GLB preview + 2D fallback), specs, price, add-to-cart.
- **Customizer**: Full-screen GLB viewer + material selector + price summary.
- **Checkout**: Wizard stub with payment placeholder (Stripe integration Phase 4).

## 5. Data & Services (Phase 4)
- Rebuild services under `src/services/neon/` with shared HTTP client, typed responses.
- Introduce `zod` schemas per API route.
- Provide seed script (`scripts/seed-neon.ts`) for demo data.

## 6. Risks & Open Questions
- Need decision on hosting GLB assets (CDN vs. local). For now assume local + CDN-friendly paths.
- Payment integration scope for MVP? PRD references Stripe + PayPal; plan to scaffold Stripe first.
- Ensure design tokens verified against demo HTML; might require direct CSS variable extraction.

## 7. Next Actions
1. Expand the Coral & Sky layout system (full-width hero/media, reusable stats, additional section patterns) while documenting how `Section` primitives should be composed for future homepage blocks.
2. Capture HDR environments and posters for the seeded GLB variants and replace the shared placeholders.
3. Populate Mongo-backed customizer, catalog, and cart collections with production data and extend the service with live pricing/material endpoints once contracts land.
4. Unskip and stabilize the Playwright smoke + add visual coverage once the manifest/assets are production-ready; each milestone must pass `npm run lint`, `npm run typecheck`, `npm run test`, and the `tests/smoke/homepage-coral-sky.spec.ts` Playwright sweep (`--project=chromium`).
