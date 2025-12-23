# James Allen Inspired Design Tokens

This document captures the James Allen-inspired layout system (card widths, spacing, radii, shadows) we continue to use for product presentation. Coral & Sky remains the authoritative color palette; refer to `src/app/globals.css` for the live brand tokens.

## 1. Token Principles

- **Photo-first surfaces**: Favor light neutrals and low-contrast chrome so product imagery dominates.
- **Understated luxury**: Lean on soft blush accents, charcoal typography, and generous white space.
- **Responsive simplicity**: Scales, radii, and elevation tokens remain minimal and semantic to keep the system straightforward across breakpoints.

## 2. Layout Token Specification

Declare these layout tokens in `:root` (e.g. `src/app/globals.css`) alongside the Coral & Sky color palette. Tailwind theme extensions should reference them for radius, spacing, and elevation instead of hard-coded values.

```css
:root {
  /* Brand & Accent */
  --ja-accent-primary: #ff5a5f;   /* Coral primary CTA */
  --ja-accent-secondary: #2ec5ff; /* Sky secondary tint */
  --ja-accent-muted: #ffe3e6;     /* badges, subtle backgrounds */

  /* Neutrals */
  --ja-neutral-950: #0f172a;
  --ja-neutral-900: #111b2f;
  --ja-neutral-800: #1e293b;
  --ja-neutral-700: #334155;
  --ja-neutral-600: #475569;
  --ja-neutral-500: #64748b;
  --ja-neutral-400: #94a3b8;
  --ja-neutral-300: #cbd5e1;
  --ja-neutral-200: #e2e8f0;
  --ja-neutral-150: #edf2f7;      /* divider lines */
  --ja-neutral-100: #f5f7fb;      /* soft panels */
  --ja-neutral-050: #fffdf7;      /* section backdrops */
  --ja-surface-base: #ffffff;

  /* Feedback & Utility */
  --ja-success: #2d936c;
  --ja-warning: #e5a03c;
  --ja-error: #c94747;

  /* Typography */
  --ja-font-sans: 'Manrope', 'Helvetica Neue', Arial, sans-serif;
  --ja-font-serif: 'DM Serif Display', 'Times New Roman', serif;
  --ja-font-weight-regular: 400;
  --ja-font-weight-medium: 500;
  --ja-font-weight-semibold: 600;
  --ja-font-weight-bold: 700;

  /* Type ramps */
  --ja-type-display: 74/78;   /* font-size/line-height in px */
  --ja-type-headline: 38/46;
  --ja-type-title: 26/34;
  --ja-type-body-lg: 18/30;
  --ja-type-body: 17/28;
  --ja-type-body-sm: 14/24;
  --ja-type-caption: 13.5/20;

  /* Spacing scale (4px base) */
  --ja-space-0: 0px;
  --ja-space-1: 4px;
  --ja-space-2: 8px;
  --ja-space-3: 12px;
  --ja-space-4: 16px;
  --ja-space-5: 20px;
  --ja-space-6: 24px;
  --ja-space-8: 32px;
  --ja-space-10: 40px;
  --ja-space-12: 48px;
  --ja-space-16: 64px;

  /* Radii (card corners stay soft but refined) */
  --ja-radius-xs: 2px;
  --ja-radius-sm: 4px;
  --ja-radius-md: 8px;
  --ja-radius-lg: 12px;
  --ja-radius-xl: 16px;
  --ja-radius-pill: 999px;

  /* Shadow/Elevation */
  --ja-shadow-soft: 0 8px 24px rgba(18, 20, 24, 0.08);
  --ja-shadow-medium: 0 16px 32px rgba(18, 20, 24, 0.12);
  --ja-shadow-focus: 0 0 0 2px rgba(247, 115, 147, 0.24);

  /* Layout targets */
  --ja-card-width-min: 300px;
  --ja-card-width-max: 360px;
  --ja-grid-gutter: 24px;
  --ja-layout-content: 68rem;
  --ja-layout-wide: 80rem;
  --ja-layout-max: 90rem;
}
```

### Semantic aliases

Map semantic tokens to the raw palette for easier re-theming:

| Semantic usage      | Token                    | Hex     |
|---------------------|--------------------------|---------|
| Primary text        | `--ja-text-primary`      | `#0f172a` |
| Secondary text      | `--ja-text-secondary`    | `#475569` |
| Muted text          | `--ja-text-muted`        | `#64748b` |
| Card background     | `--ja-surface-card`      | `#ffffff` |
| Page background     | `--ja-surface-page`      | `#fffdf7` |
| Divider             | `--ja-border-subtle`     | `#edf2f7` |
| Primary button fill | `--ja-button-primary`    | `#ff5a5f` |
| Primary hover       | `--ja-button-primary-hover` | `#e14d52` |
| Secondary button    | `--ja-button-secondary`  | `#ffffff` |
| Secondary border    | `--ja-border-strong`     | `#cbd5e1` |

## 3. Tailwind Alignment Checklist

1. **Colors** – Replace `theme.extend.colors.brand` with semantic keys (e.g. `primary`, `surface`, `neutral`), pulling from the variables above using `rgb(var(--token) / <alpha-value>)` where alpha utilities are needed.
2. **Font family** – Assign `fontFamily.sans` to `var(--ja-font-sans)` and add a serif display family when required for headers.
3. **Border radius** – Point `borderRadius.{sm,md,lg,xl}` to `var(--ja-radius-*)`. Remove the redundant `rounded-token-*` utilities.
4. **Shadow utilities** – `shadow-soft-elev` has been retired; use `shadow-soft` (`var(--ja-shadow-soft)`) and add `shadow-focus` for focus rings.
5. **Spacing scale** – Extend Tailwind `spacing` with the `--ja-space-*` values when tokens are consumed in utilities or component classes.
6. **Typography utilities** – Update component layer helpers (`.type-heading`, etc.) to use the `--ja-type-*` pairs and adjust tracking to match the refined brand (less uppercasing, more natural case).
7. **Layout clamp** – `Section.Container` maps `size="content" | "wide" | "max" | "full"` to the layout width tokens above (default is `full`); rely on this helper instead of hard-coded `max-w-*` classes for consistent gutters.

## 4. Application Notes

- **Catalog cards**: target 3-up desktop layout (`minmax(var(--ja-card-width-min), var(--ja-card-width-max))`) with 24px gutters, flush image edge, and text stack limited to name + price by default.
- **Buttons**: primary buttons use `--ja-button-primary` background, `--ja-radius-pill`, and switch to the secondary accent on hover.
- **Badges & chips**: rely on `--ja-accent-muted` background with `--ja-accent-primary` text and `--ja-radius-pill`.
- **Navigation/header**: sticky header background `--ja-surface-base`, border-bottom `--ja-border-subtle`, text `--ja-text-secondary` default.

## 5. Deprecation Plan

| Legacy token              | Status             | Replacement                        |
|--------------------------|--------------------|------------------------------------|
| `--radius-*` (Aurora)    | Deprecated now     | `--ja-radius-*`                     |
| `rounded-token-*` utils  | Phase out          | Tailwind border radius linked to layout tokens |
| `shadow-soft-elev`       | Removed            | `shadow-soft` (maps to `--ja-shadow-soft`) |

## 6. Next Steps

1. Ensure `src/app/globals.css` keeps the layout tokens above in sync with the Coral & Sky palette section.
2. Confirm `tailwind.config.js` maps border radius/shadow utilities to the shared layout tokens (colors remain Coral & Sky).
3. Revisit key components (`ProductCard`, `Button`, `Section`, `CardDeck`) whenever spacing or card proportions change so layout tokens remain the single source of truth.

All future design or implementation decisions should reference this document. Changes to the token system must be proposed and reviewed here before implementation.
```
