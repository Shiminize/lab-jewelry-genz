### Claude Rules: GlowGlitch (Lumina Lab) Development Standards

- **General principles**
  - Mobile-first, touch-optimized, sub-3s global page loads
  - Strict design-system usage; no generic Tailwind color/spacing utilities
  - WCAG 2.1 AA accessibility throughout
  - TypeScript everywhere; no any; strong interfaces
  - Error-first coding with clear recovery paths and user-safe messages

- **Design system compliance (HTML Demo Standard)**
  - **TYPOGRAPHY/BACKGROUND COMBINATIONS (REQUIRED)**
    - **ONLY use these 7 combinations from HTML demo:**
      1. `text-foreground bg-background` - Main content on ivory
      2. `text-gray-600 bg-background` - Muted content on ivory  
      3. `text-foreground bg-white` - Content on cards/surfaces
      4. `text-foreground bg-muted` - Content on section backgrounds
      5. `text-background bg-foreground` - Light text on dark sections
      6. `text-accent bg-white` - Accent highlights on white
      7. `text-background bg-cta` - Primary button text
    - **FORBIDDEN: Any other text/background combination**
    - **AI ENFORCEMENT: Agents must only use these 7 combinations**
  - Use Tailwind tokens only:
    - Colors: `bg-background`, `text-foreground`, `bg-cta`, `bg-cta-hover`, `bg-accent`, `text-accent`, `text-gray-600`, `border`, `text-background`, `bg-white`
    - Typography: `font-headline` (Fraunces), `font-body` (Inter)
    - Spacing: `p-1..p-9`; gaps via `gap-*`, `space-y-*`
  - Never use: `text-black`, `border-gray-*`, `bg-blue-500` or hardcoded styles
  - **5-Variant Button System** (HTML Demo Standard - 9 Total Buttons):
    - `primary`: `bg-cta text-high-contrast` (coral gold + white text) - 3 sizes (sm, md, lg)
    - `secondary`: `bg-background text-foreground border-border` (ivory + graphite + border) - 3 sizes (sm, md, lg)
    - `outline`: `border-foreground text-foreground hover:bg-foreground hover:text-background` - 1 size (md)
    - `ghost`: `text-foreground hover:bg-muted` (transparent with muted hover) - 1 size (md)
    - `accent`: `bg-accent text-foreground` (champagne gold + graphite text) - 1 size (md)
  - **Button Distribution**: Primary/Secondary (3 sizes each) + Accent/Outline/Ghost (1 size each) = 9 total buttons
  - **High Contrast Requirements**: Use `text-background` (#FEFCF9) or `text-white` (#FFFFFF) for text on colored backgrounds
  - Prefer system components: `src/components/ui`, `foundation/Typography`, CVA variants for variations
  - Accessibility: ARIA labels, focus management, keyboard nav, 4.5:1 contrast minimum with HTML demo proven ratios

- **Component architecture**
  - Reuse first; add variants over duplicating components
  - CVA for variants; stable prop interfaces; forward refs for inputs
  - Composition over inheritance; avoid mixing business logic into presentation
  - File placement:
    - UI primitives → `src/components/ui`
    - Layout/typography → `src/components/foundation`
    - Page layout → `src/components/layout`
    - Domain-specific → `src/components/[domain]`
    - Forms → `src/components/forms`
  - Performance: memoization, `useCallback`, dynamic imports for heavy components, image optimization

- **API standards (MUST)**
  - Response envelope for success:
```json
{
  "success": true,
  "data": {},
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 },
  "meta": { "timestamp": "ISO-8601", "version": "1.0.0" }
}
```
  - Error envelope:
```json
{
  "success": false,
  "error": { "code": "MACHINE_CODE", "message": "Human-readable", "details": [] },
  "meta": { "timestamp": "ISO-8601", "requestId": "req_xxx" }
}
```
  - Status codes: 200/201 success; 400 validation; 401 unauthenticated; 403 forbidden; 404 not found; 409 conflict; 422 validation; 429 rate limit; 500 server
  - Validation: Zod on all inputs (body, query, params); coerce query strings
  - Auth: NextAuth.js with JWT; role checks (customer, creator, admin) per endpoint
  - Rate limiting: enforce per endpoint type; return standard `X-RateLimit-*` headers and 429 JSON when exceeded
  - Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, strong CSP; CSRF protections for state-changing calls
  - Logging: consistent `requestId`; no sensitive data in logs
  - Pagination defaults: `page=1`, `limit<=50`; `sortBy`, `sortOrder` consistent
  - Do not return raw DB records without shaping and filtering sensitive fields

- **Required API endpoints (PRD/API docs)**
  - Auth & users: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout`, `GET/PUT /api/user/profile`, `POST/PUT/DELETE /api/user/addresses`
  - Products: `GET /api/products` (filters/search/pagination), `GET /api/products/{id}`, `POST/PUT/DELETE /api/products` (admin), `GET /api/products/search`, `GET /api/products/categories`
  - Cart: `GET/POST /api/cart`, `PUT/DELETE /api/cart/{productId}`, `DELETE /api/cart`
  - Wishlist: `GET/POST /api/wishlist`, `DELETE /api/wishlist/{productId}`, `POST /api/wishlist/{productId}/move-to-cart`
  - Orders: `GET /api/orders`, `GET /api/orders/{id}`, `POST /api/orders`, `PUT /api/orders/{id}/status` (admin), `POST /api/orders/{id}/cancel`, `GET /api/orders/{id}/tracking`
  - Inventory: `GET /api/inventory/{productId}`, `POST /api/inventory/{productId}/reserve`, `POST /api/inventory/{productId}/release`, `PUT /api/inventory/{productId}` (admin)
  - Creators: `POST /api/creators/apply`, `GET /api/creators/dashboard`, `GET /api/creators/commissions`, `GET /api/creators/analytics`, `PUT /api/creators/profile`, `GET /api/creators/{code}/validate`
  - Webhooks: `POST /api/webhooks/stripe` (verify signatures)

- **Search, caching, performance**
  - Elasticsearch for catalog search/autocomplete; Redis caching for hot product/filters
  - MongoDB indexes per PRD schemas; avoid N+1; measure <300ms catalog response target
  - Use CDN/WebP images; lazy loading; infinite scroll where appropriate

- **CSS 3D customizer (MVP MUST, reliable approach)**
  - Rendering: Pre-rendered image sequences (36 angles at 10° increments); CSS transforms for smooth rotation
  - UX: drag/touch rotation; keyboard arrow navigation; gesture hints; progress indicators; graceful error fallback
  - Features: live material/variant switching; real-time price calculation; save/share designs by URL; comparison view
  - Performance: <100ms material changes; <2s target met; 90% smaller bundle size than WebGL
  - Accessibility: ARIA labels; keyboard navigation; screen reader support; focus management

- **Payments & checkout**
  - Stripe integration with PCI delegation; multiple payment methods (Stripe, PayPal, Apple/Google Pay)
  - Server-side payment intents; webhook handling for success/failure/disputes
  - Cart persistence: session-based for guests; DB-synced for auth; optimistic UI with rollback
  - Order pipeline: validate inventory on checkout; track statuses; email confirmations

- **Security & privacy**
  - JWT sessions with refresh; robust secret management; encryption in transit; optional encryption at rest for sensitive PII
  - GDPR: export/delete endpoints and processes; consent tracking
  - Input sanitization (XSS), parameterized queries, SSRF-safe fetches
  - Rate limit defaults (example): Auth=5/min/IP, Catalog=100/min/IP, Cart=30/min/user, Orders=3/min/user, Admin=200/min/user

- **Data model (MongoDB, aligned to PRD)**
  - Users: emails unique; addresses; preferences; cart; wishlist; creator profile; timestamps
  - Products: name, description, category/subcategory, pricing, images, specifications, inventory (sku unique), SEO, metadata flags, timestamps
  - Orders: orderNumber unique, user ref, items with product snapshot, totals, shipping/billing, payment (method/status/ids), tracking, creator attribution
  - Indexing: as specified in PRD (text, sku, slug, category+featured, orders user+status, etc.)

- **Testing requirements**
  - conduct end-to-end tests for components and business and users logic; API integration tests (mock DB/services); E2E with Playwright for core flows (catalog, product view, customize, cart, checkout happy-path)
  - Accessibility tests for interactive UI; snapshot or visual tests for critical views
  - Do not ship features without baseline tests

- **Observability & operations**
  - Error tracking (Sentry), performance monitoring (DataDog); correlate with `requestId`
  - Structured logs; no PII leakage; alerting for payment/inventory failures

- **Anti-patterns (NEVER)**
  - Mixing business logic inside UI components
  - Returning raw DB documents to clients
  - Skipping Zod validation; skipping role checks
  - Using non-design-system Tailwind classes or inline styles
  - Hardcoding values that belong in config/tokens/env

- **Implementation checklist (enforce per PR/feature)**
  - Design-system tokens only; no generic `gray/*`, `white/black`, or custom hex
  - API envelope compliance; Zod validation; correct status codes; pagination/meta present
  - Auth/role checks; rate limiting; security headers in place
  - A11y: ARIA, keyboard, focus management, contrast, live regions
  - Tests: unit/integration/E2E present; CI green
  - Performance: code-split heavy modules; images optimized; DB indexes in place

- **Code snippets to standardize responses**
  - Success helper
```ts
export function ok<T>(data: T, pagination?: any) {
  return {
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
    meta: { timestamp: new Date().toISOString(), version: '1.0.0' }
  }
}
```
  - Error helper
```ts
export function fail(code: string, message: string, details?: any) {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
    meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() }
  }
}
```

- **Rate limit headers (example)**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1692710400
```

- **3D acceptance criteria (enforce for MVP)**
  - Metal change reflects visually <2s
  - Price recalculates on stone/size change
  - 3D viewer smooth on iPhone 12+/equivalent Android
  - Fallback to 2D with UX parity if WebGL fails
  - Design save/share with URL and preview image

- **Creator program (Phase P1)**
  - Referral code validation API; accurate attribution; commission reporting; Stripe Connect payouts automation

- **Update IMPLEMENTATION_STATUS.md after each major milestone, mark time and date**

- **Always use Serena**

- **Always Assign UI deisgner Sub agent to design new UI using tailwind as single source of truth**

- **Always Assign Copywriter sub agent to generate new content matching our target audience's emotional appeal: Gen Z and Young millenium**

- **Always ask users if the instructions aren't clear enough or you think there's a better approach**

Keep this as the single source of truth for implementation decisions. When in doubt, choose the path that:
- Adheres to design tokens
- Preserves API envelope and security posture
- Meets mobile-first performance and accessibility standards


