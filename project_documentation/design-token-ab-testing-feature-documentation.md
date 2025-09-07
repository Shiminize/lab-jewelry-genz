### Design Token A/B Testing - Technical Documentation

> Version: 1.0  
> Last Updated: 2025-09-06  
> Status: Enabled for pilot (Hero, ProductCard)

---

### Overview

The Design Token A/B Testing system safely rolls out Aurora Design System tokens and classnames alongside legacy Tailwind styles. Users are deterministically assigned to control (legacy) or demo (Aurora) variants, persisted client-side, with analytics hooks for impressions, interactions, and conversions. The system supports component-scoped rollouts and global flags.

---

### Architecture

- Variant decision sources:
  - Feature flags and migration schedule: `src/config/featureFlags.ts` → `getDesignVersion(componentName)`
  - A/B test assignment: `src/hooks/useDesignVersion.ts` (localStorage-based, deterministic hash)
  - Class migration helpers: `src/utils/classNameMigration.ts`
  - Central AB test service (config + results): `src/utils/abTesting.ts`

- Persistence:
  - User ID: `localStorage['genzjewelry_user_id']` or `localStorage['aurora_user_id']`
  - Assignment per user: `localStorage['genzjewelry_ab_assignment_<userId>']`

- Env flags:
  - `NEXT_PUBLIC_DESIGN_VERSION=legacy|demo|hybrid`
  - `NEXT_PUBLIC_AB_TEST_ENABLED=true|false`
  - `NEXT_PUBLIC_AB_TEST_PERCENTAGE=0-100`

---

### Flow

1) Component requests version
- Primary hook: `useDesignVersion({ componentName, enableABTest })` in `src/hooks/useDesignVersion.ts`
  - Checks local dev override via `getDevelopmentTools()`
  - If A/B test enabled and AB flag on, uses `getABTestAssignment()` to assign `aurora` or `legacy`
  - Else uses `getDesignVersion(componentName)` from `src/config/featureFlags.ts`
  - Returns `designVersion`, `isAurora`, `abTestGroup (control|demo)`, `abTestUserId`, utilities

2) Token/class switching
- `getClassName(legacy, aurora)` returns class based on `designVersion`
- `migrateClassName(className, componentName)` maps legacy utility classes to Aurora tokens
- `cn(componentName, ...classes)` combines clsx + migration

3) Tracking (optional)
- `useABTest(componentName)` auto-logs impression/interaction/conversion to localStorage for dev; production hook points to analytics endpoint (stubbed)
- Central service `ABTestingService` in `src/utils/abTesting.ts` tracks assignments and conversions by test name

---

### Key Implementations

1) Feature flags and schedule: `src/config/featureFlags.ts`
- Global flags and per-component flags (`AURORA_HERO`, `AURORA_PRODUCT_CARD`, etc.)
- `DESIGN_VERSION` modes:
  - `legacy`: only components with explicit flag true use Aurora
  - `demo`: force Aurora everywhere
  - `hybrid`: component flags first, then `MIGRATION_SCHEDULE` dates
- A/B config: `AB_TEST_ENABLED`, `AB_TEST_PERCENTAGE`
- Development tools: `toggleAurora(componentName, enabled)` and `getLocalOverride(componentName)`

2) Assignment and hook: `src/hooks/useDesignVersion.ts`
- AB test config:
  - `enabled`: `process.env.NEXT_PUBLIC_AB_TEST_ENABLED === 'true'`
  - `splitRatio`: 0.5 (50/50) by default
  - Keys: `genzjewelry_user_id`, `genzjewelry_ab_assignment`
- User ID creation and persistence → deterministic `assignUserToVariant(userId)` hash → `aurora|legacy`
- `getABTestAssignment()` reads or assigns and persists per-user assignment
- Returns migration source: `flag | schedule | abtest | default`
- Helpers:
  - `useAuroraABTest(...)` to notify assignment and conversions via callbacks
  - `useABTest(componentName, enableTracking)` with auto-impression and interaction/conversion utilities

3) Class/token migration: `src/utils/classNameMigration.ts`
- Maps legacy utilities to Aurora tokens: spacing, border radius, colors, shadows
- `getClassName(legacy, aurora, componentName?)` chooses variant by `getDesignVersion`
- `migrateClassName(className, componentName?)` transforms a string of classes into Aurora equivalents when Aurora is active
- `cn(componentName, ...classes)` combines clsx with migration
- Material and emotion helpers add Aurora material-specific shadows and “emotional trigger” classes when Aurora is active

4) Central AB test service: `src/utils/abTesting.ts`
- `ACTIVE_TESTS`: test definitions with dates, split, components, conversion events
- `ABTestingService`:
  - `assignUserToTest(testName, userId, sessionId?)`: deterministic group by hash and trafficSplit
  - `trackConversion(testName, userId, event, value?, metadata?)`
  - `getTestResults(testName)` and `exportTestData(testName?)`
  - Dev helpers and GA/custom endpoint stubs for production
- Hook wrapper `useABTest(testName, userId?, sessionId?)` returns group and `trackConversion`

---

### Component Integration Pattern

Example usage in components (pattern observed across Hero/ProductCard/etc.):

```tsx
import { useDesignVersion } from '@/hooks/useDesignVersion'
import { getClassName } from '@/utils/classNameMigration'

export function HeroSection() {
  const { designVersion, isAurora } = useDesignVersion({ componentName: 'hero', enableABTest: true })
  const wrapper = getClassName('p-6 rounded-lg shadow-lg', 'aurora-p-token-lg aurora-rounded-token-lg aurora-shadow-aurora-lg', 'hero')

  return (
    <section className={wrapper}>
      {/* render aurora vs legacy visuals by designVersion */}
    </section>
  )
}
```

---

### Data and Persistence

- User ID keys:
  - `genzjewelry_user_id` (hook)
  - `aurora_user_id` (utils service)
- Assignment key: `genzjewelry_ab_assignment_<userId>`
- Session key (service): `aurora_session_id`

Note: Both the hook and central service use deterministic hashing to ensure consistent group assignment across sessions.

---

### Analytics

- Dev: console logs + localStorage event buffer (`genzjewelry_ab_events`, capped to last 200)
- Production: stubs to GA via `gtag('event', 'ab_test', ...)` and `/api/analytics/ab-test` POST (endpoint to be implemented)

Key events:
- `test_assignment` (group, testName, sessionId)
- `impression` (auto on mount via `useABTest`)
- `interaction` (explicit calls)
- `conversion` (scoped to `conversionEvents` of the active test)

---

### Configuration

- Env variables:
  - `NEXT_PUBLIC_DESIGN_VERSION=legacy|demo|hybrid`
  - `NEXT_PUBLIC_AB_TEST_ENABLED=true`
  - `NEXT_PUBLIC_AB_TEST_PERCENTAGE=50`
  - Optional dev toggles: `NEXT_PUBLIC_DEV_AURORA_TOGGLE=true`, `NEXT_PUBLIC_DEV_VISUAL_DEBUG=true`

- Active tests (examples):
  - `aurora-hero-pilot` (50%) → components: `hero`
  - `aurora-product-card-pilot` (50%) → components: `productCard`
  - `aurora-material-selection` (30%, disabled until post-pilot)

---

### Safeguards & Eligibility

- A/B only runs when:
  - `enableABTest` param is true in the component hook
  - `NEXT_PUBLIC_AB_TEST_ENABLED === 'true'`
  - No local dev override is set for the component

- Fallbacks:
  - SSR: returns `legacy` and `ssr-user` safely
  - If flags disable Aurora, legacy is returned

---

### Migration Strategy

- Prefer `getClassName`/`migrateClassName` wrappers to toggle tokens per component
- Use `cn(componentName, ...)` to opportunistically migrate while Aurora is active
- Keep legacy classes alongside Aurora equivalents until data supports full cutover

---

### API Surface Summary

- `useDesignVersion({ componentName, enableABTest })` → `designVersion`, `isAurora`, `abTestGroup`, `abTestUserId`, `getClassName`, `getMigrationStatus`
- `useABTest(componentName)` → auto impression, `trackInteraction`, `trackConversion`
- `ABTestingService` → programmatic control of assignments and conversions per named test
- `getClassName`, `migrateClassName`, `cn`, material/emotion helpers for tokenized class switching

---

### Future Enhancements

- Server-side assignment with cookie persistence to align SSR/CSR
- Central analytics API (`/api/analytics/ab-test`) with batching and retries
- Unified user/session ID sources across hook and service
- Per-page test orchestration and guardrails to avoid overlapping tests
- Token-level experiments for fine-grained visual diffs

---

### File Index

- `src/config/featureFlags.ts` — flags, schedule, dev tools, hashing
- `src/hooks/useDesignVersion.ts` — main hook, AB assignment, helpers
- `src/utils/classNameMigration.ts` — migration maps and helpers
- `src/utils/abTesting.ts` — central service, active tests, analytics hooks

