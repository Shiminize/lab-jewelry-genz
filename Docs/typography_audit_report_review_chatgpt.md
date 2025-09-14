Review of the Typography System Audit & Modernization Plan
Nice work — this is a thoughtful, pragmatic plan that follows the simplicity-first and no over-engineering principles. I agree with the core ideas: centralize styles via Tailwind @apply component classes, keep a tiny optional <Text> component for special cases, and migrate incrementally. Below I give concrete, actionable refinements, safe execution steps, enforcement ideas, and small code examples you can copy/paste.
Quick verdict
✅ Plan is sound. Centralizing semantic classes is the right move.
✅ Optional <Text> component is justified only for CMS/dynamic or logic-heavy contexts.
⚠️ Watch for enforcement pitfalls (developers re-applying utilities instead of the new classes). Add CI/lint gates to prevent reversion.
✅ Follow the phased roadmap you proposed but add concrete verification steps and small automation to enforce adoption.
Implementation — concrete/spec details
1) Design tokens and Tailwind setup (single source of truth)
Add semantic tokens to tailwind.config.js theme.extend (examples):
// tailwind.config.js (excerpt)
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['clamp(2rem, 6vw, 4rem)', { lineHeight: '1.05' }],
        'h2': ['clamp(1.5rem, 4.5vw, 3rem)', { lineHeight: '1.1' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.4' }]
      },
      colors: {
        // use existing design tokens, e.g. brand/foreground
      }
    }
  }
}
Reason: keep fonts & sizes tokenized so @apply classes will rely on tokens rather than hardcoded values.
2) Global typography component classes (Tailwind @layer components)
Put these in a central file (e.g. src/styles/typography-core.css or inside globals.css via @layer components { ... }):
/* src/styles/typography-core.css */
@layer components {
  .typography-h1 { @apply font-fraunces text-h1 font-bold text-foreground; }
  .typography-h2 { @apply font-fraunces text-h2 font-semibold text-foreground; }
  .typography-h3 { @apply font-fraunces text-2xl font-semibold text-foreground; }
  .typography-body { @apply font-inter text-body font-normal text-foreground; }
  .typography-link { @apply font-inter text-base underline-offset-2 text-aurora-accent hover:underline; }
  .typography-caption { @apply font-inter text-caption font-light text-aurora-nav-muted; }
}
Rules
Keep each class small and token-based (@apply only), no custom CSS properties except if necessary.
File should be ≤ 300 lines; split into typography-core.css and typography-components.css if it grows.
3) Optional <Text> component (minimal, TypeScript + forwardRef)
Only use where classes cannot be reliably applied (CMS content, dynamic tag mapping, truncation logic):
// src/components/ui/Text.tsx
import React from 'react';
import cn from 'clsx';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'link';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  variant?: Variant;
  className?: string;
}

const variantMap: Record<Variant, string> = {
  h1: 'typography-h1',
  h2: 'typography-h2',
  h3: 'typography-h3',
  body: 'typography-body',
  caption: 'typography-caption',
  link: 'typography-link',
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Component = 'p', variant = 'body', className, children, ...rest }, ref) => {
    return (
      // eslint-disable-next-line jsx-a11y/heading-has-content
      <Component ref={ref as any} className={cn(variantMap[variant], className)} {...rest}>
        {children}
      </Component>
    );
  }
);
Text.displayName = 'Text';
Notes
Keep this component tiny (no styling logic, only class mapping).
Add unit tests for mapping and basic rendering.
4) Migration strategy — incremental, low-risk
Phase 1: Define & ship classes (1–2 days)
Finalize list with design (H1–H6, Body, Small, Caption, Link, Button text).
Add typography-core.css with @apply classes and include in globals.css.
Phase 2: Use in new work (2–4 days)
For existing pages, apply classes only in files you touch. Do not rewrite the whole app at once.
Use PRs to replace local multi-utility patterns with typography-* classes incrementally.
Phase 3: Gradual sweep (2–4 sprints)
Run a codemod / linter report and fix in batches. See enforcement below.
Search commands (examples) to find targets:
# Find headings that use multiple utilities
rg "class(Name)?=.{0,200}(text-|font-).{0,200}(text-|font-)" src -n

# Find common manual patterns
rg "font-fraunces|text-4xl|text-3xl|font-bold" -n src
Do not auto-apply codemods without QA. Generate diffs and review visually.
5) Enforcement & CI checks (prevent regressions)
Add lightweight automation so developers use the new classes.
A. Lint rule (recommended)
Use eslint-plugin-regexp or a custom ESLint rule to warn when a JSX className contains more than one typography-related utility (font-* or text-*) where typography-* should be used.
Simpler: add a CI grep job that fails PRs when patterns appear (blocker until reviewed). Example script:
#!/usr/bin/env bash
# ci/check-typography.sh
BAD=$(rg --hidden --glob '!node_modules' -n "class(Name)?=.*(font-(fraunces|inter)|text-(4xl|3xl|2xl|xl|lg|base|sm))" src || true)
if [ -n "$BAD" ]; then
  echo "Found raw typography utilities. Please use .typography-* classes for semantic typography."
  echo "$BAD"
  exit 1
fi
B. PR checklist
PR must include typography decision (if changing text).
UI designer must sign off on any headline-size change.
6) Visual QA & automated tests
Playwright visual tests: capture a canonical component screenshot for H1/H2/Body/Caption and compare in PRs (Percy, Playwright snapshot).
Unit tests: for <Text> component (if implemented), assert mapping and rendered tag.
Manual checks: Inspect computed styles in DevTools (getComputedStyle) and ensure font-family and font-size match tokens.
Sample Playwright assertion snippet:
// tests/typography.spec.ts
import { test, expect } from '@playwright/test';
test('h1 uses Fraunces and expected size', async ({ page }) => {
  await page.goto('/test-typography'); // a small test page you add
  const font = await page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily);
  expect(font).toContain('Fraunces');
});
7) Documentation & developer DX
Create docs/typography.md with:
Mapping table: semantic token → class → token value (font-size & line-height).
Examples for headings, links, captions, buttons.
Guidance when to use <Text> (and when not to).
Add code snippets into your design system Storybook (if present) showing each typography class.
8) Pitfalls & how to avoid them
Pitfall: Developers keep composing multiple utilities out of habit.
Mitigation: CI grep + lint rule + reviewer training; add PR template requiring designer sign-off for deviations.
Pitfall: Typography file grows too large.
Mitigation: Split into typography-core.css (tokens), typography-components.css (component-specific overrides), keep files < 300 lines.
Pitfall: Fonts loading performance issues.
Mitigation: Use font-display: swap, preload critical fonts, and don't load heavy variable fonts on every page.
9) Example PR checklist for typography changes
 New typography-* class added to typography-core.css (if adding new token).
 All new usages replace multi-utility patterns with a single .typography-* class.
 Playwright visual test added/updated if visual change.
 UI designer reviewed screenshots.
 ci/check-typography.sh passes locally.
Suggested next actions (practical)
Create src/styles/typography-core.css with the @layer components classes above. (I can generate a full starter file if you want.)
Add typography-core.css into globals.css import order (early).
Add ci/check-typography.sh to your CI and run locally once.
Choose a small area (e.g., homepage hero and 1 product page) and refactor to the new classes as a pilot PR. Validate with visual tests and designer sign-off.
Consider creating Text.tsx only if you need to normalize CMS content tags.