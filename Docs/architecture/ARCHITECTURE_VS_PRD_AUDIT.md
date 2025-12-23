# GlowGlitch Architecture vs. PRD Audit (October 2025)

## Scope & Approach
- Compared the shipping Next.js codebase (`/src`, `/app`, `/services`) against the requirements in `Docs/PRD_COMPLETE_2025.md`.
- Reviewed implementation evidence in routes, services, support libraries, and configuration as of 2025‑10‑03.
- Focused on MVP P0/P1 features, platform architecture, security, design system alignment, and Phase 2 roadmap items.

`Status` legend used below: **Complete** (meets PRD intent), **Partial** (implemented subset / needs expansion), **Missing** (no working implementation).

## Summary Status
| Area | PRD expectations (abridged) | Current implementation snapshot | Status |
| --- | --- | --- | --- |
| Platform stack & infra | Next.js 14 + modular APIs, Redis, MongoDB Atlas, microservices, real-time, monitoring | Monolithic Next.js app with custom Node server + Socket.IO, optional in-memory Mongo fallback, light in-process caching, metrics stubs; no deployed Redis/Elasticsearch/DataDog/Sentry wiring (`package.json:1-120`, `server.js:62-118`, `src/lib/mongodb.ts:5-78`, `src/lib/metrics/logger.ts:26-67`) | **Partial** |
| 3D customizer (P0) | CSS 3D/image-sequence renderer, save/share, creator-ready dashboard, performance targets | `/customizer` page renders `<model-viewer>` GLB variants with pricing + material toggles; manifest limited to 3 assets; no save/share URLs, dashboards, or AR mode (`src/app/customizer/page.tsx:49-100`, `src/features/customizer/components/CustomizerExperience.tsx:147-337`, `src/features/customizer/components/GlbViewer.tsx:55-120`, `public/models/neon/manifest.json:4-56`) | **Partial** |
| Product catalog & discovery (P0) | Hierarchical catalog, Elasticsearch search, advanced filters, recommendations, wishlist syncing | Catalog grid with robust client-side filters/sorting and in-memory recommendations; new keyword search piping through `/collections?q=` and `/api/search/products`, still no autocomplete, wishlist persistence, or true recommendation engine (`src/app/catalog/page.tsx:10-198`, `src/app/catalog/CatalogClient.tsx:123-382`, `src/services/neon/catalogRepository.ts:119-212`, `src/app/api/search/products/route.ts:1-52`) | **Partial** |
| Cart & checkout (P0) | Persistent cart, PCI-compliant multi-pay checkout, real-time inventory, promo codes, order confirmation/tracking | Cart stored via cookie + Mongo stub; checkout page directs to concierge email/cal booking; Stripe integration is stubbed, no payment capture, tax/shipping calc, or order creation (`src/app/cart/CartClient.tsx:86-200`, `src/app/api/neon/cart/[cartId]/route.ts:8-61`, `src/services/neon/cartService.ts:62-254`, `src/app/checkout/page.tsx:21-90`, `src/services/neon/checkoutService.ts:8-27`) | **Partial → Missing payment** |
| User accounts & auth (P0) | NextAuth, registration, social login, profiles, order history, saved designs, GDPR tooling | Customer auth now live with NextAuth credentials + Google/Apple/Facebook providers, registration UI, password reset emails, reusable session helpers, and admin-only middleware/role guards (`src/lib/auth/config.ts:1-83`, `src/app/login/page.tsx:1-85`, `src/app/api/auth/*`, `middleware.ts:1-220`, `src/lib/auth/roleGuards.ts:1-37`). Missing pieces: profile/order history UI, saved designs, GDPR tooling, and Playwright coverage. | **Partial** |
| Creator program (P1) | Creator onboarding workflow, referral tracking, analytics dashboard, Stripe Connect payouts | Public application form + admin review dashboard, media-kit email hook; no referral tracking in storefront, payout automation, or analytics visualizations beyond basic counts (`src/app/creators/page.tsx:63-305`, `src/app/api/creators/apply/route.ts:11-126`, `src/services/admin/creatorApplications.ts:27-173`, `src/app/dashboard/creators/page.tsx:20-226`, `src/services/neon/checkoutService.ts:8-27`) | **Partial** |
| Support & concierge | Concierge widget, automated responses, order/care flows | Rich support content page and concierge API facade, but no live chat/automation hooks surfaced on storefront (`src/app/support/help/page.tsx:1-198`, `src/components/support/SupportHelpPanel.tsx:47-180`, `src/app/api/concierge/products/route.ts:1-133`) | **Partial** |
| Analytics & monitoring | DataDog, Sentry, business dashboards, uptime SLAs | Only dev analytics logger & optional Redis-backed metrics store; no DataDog/Sentry instrumentation or dashboards in code (`src/app/api/dev-analytics/collect/route.ts:34-89`, `src/lib/metrics/logger.ts:26-99`, `src/lib/metrics/redisAdapter.ts:20-147`) | **Missing** |
| Security & compliance | Role-based access, JWT/NextAuth, payments compliance, GDPR tooling | Middleware enforces JWT but without auth service; admin uses env token; no PCI scope or GDPR flows implemented (`middleware.ts:12-199`, `src/app/dashboard/login/page.tsx:19-78`) | **Missing** |
| Design system & UX | Coral & Sky design tokens, typography system, accessibility | Tailwind tokens still use legacy palette (#8A1538) and Inter; components styled with new tone API but palette not migrated; Coral & Sky gradients safelisted (`app/styles/tokens.css:1-29`, `src/app/globals.css:1-86`, `tailwind.config.js:5-107`, `src/components/ui/Button.tsx:23-142`) | **Partial** |
| Phase 2+ innovations | AR try-on, AI personalization, subscriptions, B2B licensing readiness | No AR/AI modules, subscriptions, or licensing hooks present (`repo search`) | **Missing** |

## Detailed Findings

### 1. Platform Architecture & Infrastructure
#### Frontend composition
- Next.js App Router with server components powers storefront, catalog, cart, customizer, and dashboard routes (`src/app/page.tsx:14-43`, `src/app/catalog/page.tsx:10-198`, `src/app/customizer/page.tsx:49-102`).
- Content hydration mixes static data (`src/config/catalogDefaults.ts:51-206`) with Mongo-backed overrides via service wrappers (`src/services/homepageContent.ts:63-153`, `src/services/neon/homepageService.ts:35-51`).

#### Backend/API layer
- APIs provided via Next.js routes for catalog, cart, checkout, concierge support, creators, and admin utilities (`src/app/api/neon/catalog/route.ts:1-9`, `src/app/api/neon/cart/[cartId]/route.ts:8-61`, `src/app/api/concierge/products/route.ts:1-133`, `src/app/api/creators/apply/route.ts:11-126`).
- No separation into microservices; everything runs inside the Next.js runtime with optional custom Node server for Socket.IO (`server.js:62-118`).

#### Data layer
- MongoDB adapter falls back to an on-disk in-memory store when `MONGODB_URI` is absent, seeding products from JSON (`src/lib/mongodb.ts:5-78`).
- No Redis cache for core data; only an in-process `AppCache` used for concierge API responses (`src/lib/cache/appCache.ts:1-72`).
- Elasticsearch and search indices are not present in dependencies or runtime (`package.json:103-176`).

#### Real-time & eventing
- Custom server enables Socket.IO rooms (job progress, creator analytics, conversion tracking) but the client never subscribes; there is no event producer (`server.js:62-118`, `repo search 'join-job'`).
- No WebSocket usage within React components (`rg` shows zero client call sites).

#### Observability
- Metrics logger writes JSON to stdout and optionally Redis, but wrappers (`withMetrics`) are unused (`src/lib/metrics/logger.ts:26-99`, `rg -- 'withMetrics' src`).
- Dev analytics endpoint stores 200 events in memory and optional Mongo mirror; there is no production telemetry pipeline (`src/app/api/dev-analytics/collect/route.ts:34-89`).
- DataDog/Sentry integrations called out in PRD are absent from codebase and deps.

### 2. Core Commerce Experience
#### 3D Customizer (P0)
- `/customizer` renders hero copy + interactive experience using GLB manifests, material selectors, fit buttons, and pricing summary (`src/app/customizer/page.tsx:49-102`, `src/features/customizer/components/CustomizerExperience.tsx:147-307`).
- Viewer relies on `<model-viewer>` (WebGL) instead of CSS 3D/image sequences required by PRD, and lacks AR toggles (`src/features/customizer/components/GlbViewer.tsx:55-120`).
- Manifest only ships three variants, mostly rings, without bracelets/earrings coverage (`public/models/neon/manifest.json:4-56`).
- Missing: save/share URLs, design persistence, creator drop integration, 3D dashboard at `/3d-dashboard`, concurrent-load/performance instrumentation.

#### Product catalog & discovery (P0)
- Catalog page provides categories, price filters, availability chips, view toggles, and sticky filter tags (`src/app/catalog/page.tsx:24-159`, `src/app/catalog/CatalogClient.tsx:125-382`).
- Data resolution pulls from Mongo when available, otherwise static defaults; homepage display slots rely on `metadata.displaySlots.*` fields (`src/services/neon/catalogRepository.ts:119-212`).
- Wishlist UI exists but is inert because there are no wishlist endpoints or persistence hooks (`src/components/ui/ProductCard.tsx:30-162`).
- Keyword search now flows through `/collections?q=` and `/api/search/products`, but there is still no autocomplete, typo tolerance, wishlist persistence, or recommendation engine powering rankings.

#### Shopping cart & checkout (P0)
- Cart uses cookie-stored `cartId` to read/write Mongo `carts` collection, merging sample products from default catalog (`src/lib/cartSession.ts:3-21`, `src/app/cart/page.tsx:6-23`, `src/services/neon/cartService.ts:62-200`).
- API supports add/update/remove/clear with optimistic UI feedback, but there is no inventory check or promo code handling (`src/app/api/neon/cart/[cartId]/route.ts:8-61`).
- Checkout page is informational; customers must email or schedule a call for payment. Stripe integration is an explicit stub returning `status: 'pending'` (`src/app/checkout/page.tsx:21-90`, `src/services/neon/checkoutService.ts:8-27`).
- Order creation endpoints, payment intents, tax/shipping calculators, and transactional emails are absent.

#### User account management (P0)
- Middleware enforces JWT auth on most routes but there is no `/api/auth` implementation nor customer login/register screens (`middleware.ts:12-173`).
- Admin dashboard access uses an environment token stored as an HTTP-only cookie, bypassing NextAuth entirely (`src/app/dashboard/login/page.tsx:19-78`).
- Profiles, address books, order history, saved designs, social login, and GDPR tooling are missing.

#### Creator program (P1)
- Public page markets tiers and hosts a server-validated application form posting to `/api/creators/apply`, which persists submissions and optionally emails a media kit (`src/app/creators/page.tsx:63-305`, `src/app/api/creators/apply/route.ts:11-126`, `src/lib/email.ts:74-132`).
- Admin dashboard lists applications, supports status updates, notes, and manual media-kit status tracking, with basic widget-assisted stats from orders (`src/app/dashboard/creators/page.tsx:20-226`, `src/services/admin/creatorApplications.ts:27-173`, `src/services/admin/creatorStats.ts:6-85`).
- Missing: automated referral link issuance, commission tracking integrated into checkout, Stripe Connect payouts, performance analytics dashboards, and creator portfolio pages.

### 3. Supporting Experiences
#### Support & concierge
- Content-rich support guide with navigation, sizing, care FAQs, and CTA for concierge outreach (`src/app/support/help/page.tsx:1-198`).
- Concierge product API proxies providers with short-lived cache and CDN-aware metrics logging (`src/app/api/concierge/products/route.ts:1-133`, `src/lib/cache/appCache.ts:1-72`).
- Absent: in-site support widget activation, ticketing integration, SLA tracking, or automated order-status responses mandated in PRD.

#### Admin & operations tooling
- Dashboard sections for catalog, orders, homepage content, and creators rely on Mongo helpers but require manual seeding (`src/app/dashboard/...`, `src/services/admin/...`).
- Activity log hooks exist (`src/services/admin/activityLog.ts`), though PRD’s audit requirements (undo, role-based approvals) remain incomplete pending auth.

#### Analytics & metrics
- Dev analytics endpoint sanitizes PII via hash and mirrors to log file/optional Mongo, but is disabled in production by default (`src/app/api/dev-analytics/collect/route.ts:34-89`, `src/lib/security.ts:1-17`).
- No instrumentation sends data to DataDog/Sentry/GTM. CLI scripts mention observability but there is no runtime code.

### 4. Security & Compliance
- Middleware adds rate-limit headers, JWT validation, CSRF tokens for mutating requests, and secure cookie management (`middleware.ts:41-173`, `src/lib/jwt-utils.ts:1-51`).
- With no auth service issuing JWTs, the protections effectively block users from accessing gated routes; admins rely on shared tokens (`src/app/dashboard/login/page.tsx:19-78`).
- PCI/GDPR controls (encryption at rest, data export/delete flows, payment tokenization) are absent; checkout currently bypasses PCI scope via manual invoicing rather than the Stripe integration promised in PRD.

### 5. Design System & UX
- Tailwind theme maps to `--ja-*` tokens, and UI primitives (Button, Typography, Card) expose new tone props used across pages (`tailwind.config.js:5-107`, `src/components/ui/Button.tsx:23-142`, `src/components/ui/Typography.tsx`).
- Global tokens still rely on the legacy accent color (#8A1538) and Inter/Playfair typography; Coral & Sky palette variables from Option 4 aren’t defined (`app/styles/tokens.css:1-29`, `src/app/globals.css:1-86`).
- Accessibility improvements (aria labels, keyboard states) appear in individual components, but there is no automated a11y audit integrated into build.

### 6. Phase 2+ / Advanced Requirements Gaps
- No AR try-on, virtual hand modeling, animation previews, or multi-format asset generation despite PRD’s Phase 2 roadmap.
- AI personalization features (style quiz, dynamic pricing, inventory forecasting) are missing.
- Subscription services, B2B licensing hooks, blockchain transparency, and sustainability metrics are absent.
- Creator analytics dashboard, social sharing embeds, and mobile AR support are not present.

## Recommendations & Next Steps
1. **Establish customer authentication and account system**: Implement NextAuth (email + social) with profile, order history, and wishlist persistence to unlock personalization features promised in PRD.
2. **Complete commerce pipeline**: Integrate Stripe (including Stripe Connect for creators), tax/shipping services, promo codes, and automated post-purchase messaging to replace the concierge-only checkout.
3. **Migrate 3D customizer to PRD spec**: Expand manifest coverage, add non-ring assets, implement CSS/image-sequence renderer with share/save URLs, and ship the `/3d-dashboard` asset manager with concurrency/performance guarantees.
4. **Deliver search & discovery stack**: Stand up Elasticsearch (or equivalent) for search/autocomplete, tie catalog filters to indexed data, and introduce recommendation services leveraging browsing analytics.
5. **Harden observability & security**: Wire DataDog/Sentry, enforce structured logging, and replace the middleware JWT stubs with real session issuance, rate limiting, and role-based access tied to authenticated users.
6. **Update design system tokens**: Apply the Coral & Sky palette and typography tokens globally, validate contrast/a11y, and document usage in a shared style guide.
7. **Prioritize creator program back-office**: Implement referral link tracking, commission calculations, Stripe Connect payouts, and richer analytics dashboards to meet the monetization goals.
8. **Plan Phase 2 roadmap execution**: Scope AR try-on, AI personalization, subscription flows, and sustainability reporting to align with the 2026 expansion objectives.

Addressing the above will align the current codebase with the MVP commitments and lay the groundwork for Phase 2 innovations outlined in the PRD.
