# UI Color & Token Reference

This document summarizes the current design tokens, their source files, and component coverage. Use it as a baseline for future refinements of the Burgundy geometric theme.

## Authoritative Token Source

- **File**: `app/styles/tokens.css`
- **Key Values**
  - Backgrounds: `--color-bg`, `--color-surface` → `#FFFFFF`
  - Text inks:
    - `--color-ink` → `#111318`
    - `--color-ink-2` → `#58606A`
    - `--color-muted` → `#8C94A1`
  - Lines:
    - `--color-line-subtle` → `#E9EDF3`
    - `--color-line-strong` → `#D6DEE8`
  - Accent Burgundy: `--color-accent` → `#8A1538`
    - Contrast: `--color-accent-contrast` → `#FFFFFF`
  - Geometry & shadows:
    - `--radius-0` → `0px`
    - `--shadow-soft` → `0 10px 26px rgba(0, 0, 0, 0.06)`
    - `--shadow-lift` → `0 16px 40px rgba(0, 0, 0, 0.1)`
    - `--shadow-focus` → `0 0 0 3px color-mix(in oklab, var(--color-accent) 45%, white)`

All new components should pull from these variables directly or via module CSS.

## Global Layer

- **File**: `src/app/globals.css`
  - Imports `tokens.css` and maps Tailwind-era aliases (`--ja-*`) to the Burgundy values.
  - Forces all Tailwind `rounded-*` utilities to `0px` (`[class*='rounded-'] { border-radius: var(--radius-0) !important; }`).
  - Provides utility classes (`.bg-app`, `.text-body`, `.shadow-soft`, etc.) that refer back to token values.

This layer keeps any remaining Tailwind usage (navigation, dashboards, etc.) in sync with the new palette.

## Primitive Components

- **Paths**: `src/components/primitives/`
  - `Button`, `Chip`, `Card`, `Container`, `Grid`, `Section`
  - All primitives consume the token variables (border = `--color-line-strong`, hover = OKLab mixes, focus = `--shadow-focus`).

Use these whenever building new UI to guarantee consistency.

## Token-Driven Sections

The following modules already use tokenized CSS (`module.css`) with zero radii and Burgundy accents:

- `src/components/homepage/HeroSection.tsx`
- `src/components/homepage/CollectionTypesSection.tsx`
- `src/components/homepage/CustomizerOnboardingSection.tsx`
- `src/components/homepage/CreatorCTASection.tsx`
- `src/components/homepage/SupportSection.tsx`
- `src/app/products/[slug]/ProductPage.module.css`
- `src/components/footer/Footer.tsx`
- `src/components/collections/ProductCard.tsx`

These can serve as references for future sections and pages.

## Legacy / Tailwind Surfaces (Yet to Convert)

The following areas still import `@/components/ui` (Tailwind-based Coral & Sky components). They inherit token colors via globals but retain old structure until migrated to primitives:

- Navigation (`components/ui/Header`, `MegaNav`) – intentionally preserved.
- Cart (`src/app/cart/CartClient.tsx`), checkout, customizer flows.
- Support widget (`src/components/support/Widget/**`).
- Dashboard pages (`src/app/dashboard/**`).
- Not-found page, customizer experience, ancillary admin views.

When rewriting these, replace `@/components/ui/*` with primitives and add matching `module.css` files using the `tokens.css` palette.

## Tailwind Config

- **File**: `tailwind.config.js`
  - Border radius defaults now point to `var(--ja-radius-*)` (zero).
  - Extended colors map to the Burgundy token aliases (`accent.primary`, `text.primary`, etc.).

Once the remaining legacy screens are refactored, Tailwind can be removed entirely.

## Next Steps for Consistency

1. Migrate cart/checkout/customizer/dashboards to primitives to eliminate the remaining `components/ui` usage.
2. Remove unused legacy components (`components/ui/Footer.tsx`, `Card.tsx`, `homepage/ShopCollectionSection.tsx`) once cross-checked.
3. Add linting to block direct Tailwind class usage in new code (`rounded-`, `bg-*`, `text-*`) to enforce token modules.

Maintaining all new work through the primitives + `tokens.css` pattern ensures the Burgundy palette stays consistent across future redesigns.
