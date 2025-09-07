# Design Token Reference – Aurora Jewelry Customization

This document provides a **single source of truth for design tokens** used across the Aurora-based jewelry customization platform.  
It ensures **color consistency, typography hierarchy, spacing rhythm, motion standards, and accessibility alignment**.

---

## 1. Color Tokens

### Brand & Core Palette
- `--color-brand-primary`: #6B46C1 (Nebula Purple)
- `--color-brand-secondary`: #D946EF (Aurora Pink)
- `--color-brand-highlight`: #E11D48 (Aurora Crimson)
- `--color-surface`: #F7F7F9 (Lunar Grey)
- `--color-text-primary`: #1A1A1A (Deep Space)

### Feedback Colors
- `--color-success`: #10B981 (Emerald Flash)
- `--color-warning`: #F59E0B (Amber Glow)
- `--color-error`: #DC2626 (Crimson Alert)

### Gradient Tokens
- `--gradient-primary`: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))
- `--gradient-luxury-midnight`: linear-gradient(145deg, #0B0C10, #1B1C22)

---

## 2. Typography Tokens

### Font Families
- `--font-primary`: 'Inter', sans-serif
- `--font-heading`: 'Playfair Display', serif

### Font Sizes
- Title XL: clamp(2rem, 4vw, 3rem)
- Title L: clamp(1.5rem, 3vw, 2.25rem)
- Body M: 1rem
- Body L: 1.125rem
- Small: 0.875rem
- Micro: 0.75rem

### Line Heights
- `--line-height-tight`: 1.2
- `--line-height-normal`: 1.5
- `--line-height-relaxed`: 1.75

---

## 3. Spacing Tokens

- `--space-xxs`: 2px
- `--space-xs`: 4px
- `--space-s`: 8px
- `--space-m`: 16px
- `--space-l`: 24px
- `--space-xl`: 32px
- `--space-xxl`: 48px

---

## 4. Radius Tokens

- `--radius-small`: 5px
- `--radius-medium`: 13px
- `--radius-large`: 21px

---

## 5. Shadow Tokens

- `--shadow-near`: 0 2px 8px rgba(0, 0, 0, 0.08)
- `--shadow-float`: 0 8px 24px rgba(0, 0, 0, 0.12)
- `--shadow-hover`: 0 16px 32px rgba(107, 70, 193, 0.12)

---

## 6. Motion Tokens

- Transition default: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Hover brightness: +15%
- Slide-in keyframes: 380ms ease-in-out

---

## 7. Usage Guidelines

- Always import tokens via `@import "design-tokens.css";`
- Never hardcode hex values – use tokens only.
- When adding new tokens, ensure they map to **Aurora Design System standards**.

---

## 8. Migration Strategy

1. Replace legacy `aurora-variables.css` gradually.
2. Use token aliases: e.g., `--aurora-pink: var(--color-brand-secondary);`
3. Enforce with Stylelint: `"color-no-hex": true`.

---

## 9. Component Integration

- **Navigation & Dropdowns**: Use `--gradient-luxury-midnight` for background.
- **MinimalHoverCard**: Apply `hover:brightness-[115%]` via tokens.
- **Buttons**: `--gradient-primary` for CTA, radius-medium, shadow-hover.

---

_Last Updated: 2025-09-05_
