Interactive/shimmer → token utilities (done)
src/components/ui: Input.tsx, Tabs.tsx, Badge.tsx, Progress.tsx, Card.tsx, Alert.tsx
src/components/products: ProductCard.tsx, ProductCardVariants.tsx, ProductCardImage.tsx, ProductCardActions.tsx, ProductCardPricing.tsx
src/components/catalog: ProductSearch.tsx, ProductSearchFilters.tsx
src/components/aurora: AuroraCard.tsx, AuroraGradient.tsx, AuroraButton.tsx
src/components/homepage: HeroSection.tsx (z-index normalization, shimmer/radial tokens), customizer-preview/QuickSelector.tsx
Replaced examples: aurora-interactive-shadow → shadow-token-*, aurora-shimmer-overlay → bg-aurora-shimmer animate-aurora-shimmer-slow, aurora-pulse → animate-aurora-glow-pulse, aurora-floating → animate-aurora-float.
Safety shims (in place)
src/styles/aurora-utilities.css: temporary aliases (.rounded-34, hover/sweep/floating), to be removed in Phase 5.
Config/stability fixes (done)
Tailwind/PostCSS unified to single tailwind.config.js; demo config delegates correctly.
RSC fix: 'use client' on src/app/not-found.tsx.
Middleware public routes include /aurora-demo, /catalog.
Server safety: auto-create /tmp/3d-generation/job-persistence, warn when REDIS_URL missing.
Homepage fetch timeout to avoid e2e hangs.
E2E status
Smoke suite green across Chromium/Firefox/WebKit/Mobile after each batch.
What remains to review/decide
Residual aurora classes kept intentionally (to decommission later)
aurora-pink-sweep-effect (shimmed), aurora-gradient-shift (variant in Progress.tsx), other decorative aurora-* in style-only assets:
src/styles/demo-overrides.css, src/styles/animations.css, src/styles/typography-semantic.css
src/lib/design/aurora-tokens.ts
Review: keep visual parity now, fully replace with tokenized counterparts in Phase 5.
RSC/hook warning surfaced in logs
useDesignVersion invalid hook call reported from HeroSection.tsx (likely duplicate React or import surface). Not blocking e2e; queued under fix-rsc-onclick/fix-typecheck-errors.
Typecheck scope
Non-UI/API type errors remain (intentionally out of current scope); UI layer compiles. We’ll handle in later phases or adjust tsconfig.app.json if you want stricter gating now.
Next migrations (proposed small batches)
Replace remaining decorative aurora effects in buttons/typography (e.g., aurora-iridescent-text, hover-fill variants) with tokenized utilities.
Gradually remove shims from aurora-utilities.css once mapped to tokens.
Phase 3: finish nav/homepage consolidation to tokens; Phase 4: forms/grids; Phase 5: remove legacy CSS/assets.