# CSS Codebase Refactor & Single Source of Truth Plan

## Overview
This document serves as a **reference manual for LLM agents (e.g., Claude Code)** to safely refactor, consolidate, and maintain the UI codebase based on the Aurora Design System. It addresses critical issues found during the audit and provides a **step-by-step, low-risk approach** to achieve a **single source of truth** for styles.

---

## Executive Summary
- **Dynamic Import Mismatch:** MaterialControls has both named & default exports; ProductCustomizer expects named default wrapper.
- **CSS Specificity Conflicts:** Multiple hover brightness overrides using `!important` prevent component-level styles.
- **Cache/Build Corruption:** Webpack cache issues cause inconsistent builds and slow hot reload.

**Impact:** Broken interactive components (MinimalHoverCard), inconsistent visuals, slow feedback loop.

---

## Goals
1. **Restore UI Stability:** Fix imports & clean cache.
2. **Eliminate Global Overrides:** Remove `!important` & conflicting hover rules.
3. **Unify Tokens:** Centralize colors, typography, shadows into `/src/styles/aurora/tokens.css`.
4. **Automate Compliance:** Lint for non-token colors and enforce via CI.
5. **Enable Incremental Adoption:** Use phased PRs with visual tests.

---

## Step-by-Step Refactor Plan

### Step 1 — Fix Dynamic Import (Priority 1)
- Convert `MaterialControls` to a single default export:
```tsx
// MaterialControls.tsx
export const MaterialControls = (...) => {...}
export default MaterialControls

// ProductCustomizer.tsx
const MaterialControls = dynamic(() => import('./MaterialControls'))
```

### Step 2 — Clean Webpack Cache (Priority 1.5)
```bash
rm -rf .next
npm ci
npm run build
```

### Step 3 — Remove `!important` and Unify Hover (Priority 2)
- Replace:
```css
.minimal-hover-glow:hover {
  filter: brightness(1.15) !important;
}
```
- With:
```css
:root {
  --a-hover-brightness: 1.15;
}
.minimal-hover-glow:hover {
  filter: brightness(var(--a-hover-brightness));
}
```

### Step 4 — Create Token File (Priority 2.5)
`/src/styles/aurora/tokens.css`
```css
:root {
  --deep-space: #0A0E27;
  --nebula-purple: #6B46C1;
  --aurora-pink: #FF6B9D;
  --aurora-crimson: #C44569;
  --lunar-grey: #F7F7F9;
  --emerald-flash: #10B981;
  --amber-glow: #F59E0B;
  --font-body-m: 1rem;
  --shadow-hover: 0 16px 48px color-mix(in srgb, var(--nebula-purple) 12%, transparent);
}
```

### Step 5 — Sync Tailwind & Utilities (Priority 3)
- Ensure bracket classes (e.g., `hover:brightness-[115%]`) are safelisted if used.
- Add `.shadow-hover` utility class if needed.

### Step 6 — Visual & E2E Testing (Priority 4)
- Use Storybook/Percy for visual regression.
- Playwright smoke tests for:
  - NavBar (desktop/mobile)
  - MaterialControls
  - MinimalHoverCard

---

## CI/Compliance Checks
- **Stylelint Rule:** Disallow `!important` and non-token hex colors.
- **Script:**
```bash
grep -R --line-number "!\s*important" src || true
grep -R --line-number -E "#[0-9a-fA-F]{6}" src | grep -v "tokens.css" || true
```

---

## Pull Request Guidelines
- Each PR ≤ 300 lines of change (soft), ≤ 450 lines (hard).
- Include:
  - Before/after screenshots or Percy diffs.
  - Short changelog entry.
  - Rollback plan.

---

## Deliverables
1. PR1: Fix dynamic imports + build passes.
2. PR2: Create tokens file & migrate variables.
3. PR3: Remove `!important` & unify hover.
4. PR4: Tailwind & utilities sync.
5. PR5: Visual regression & final polish.

---

## Notes
- **No new colors or tokens invented.** Use Aurora tokens only.
- **Do not restructure architecture unless bug-related.**
- **Target per-component compliance, not a big-bang refactor.**

---

## LLM Usage Prompt
When instructing Claude Code or other LLM:
```
You are tasked with refactoring the CSS codebase to follow the Aurora Design System and create a single source of truth. Follow the steps in this document strictly, starting with PR1. Do not over-engineer. Keep each PR isolated, and always run the compliance checks before submitting.
```
