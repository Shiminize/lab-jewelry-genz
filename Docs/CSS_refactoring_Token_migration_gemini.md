# PROMPT: CSS Refactoring & Token Migration to Tailwind Config

## 1. Context

You are an expert front-end developer specializing in Tailwind CSS and code refactoring.

Our project's CSS was recently refactored. The good news is that a monolithic `globals.css` was broken down into smaller modules, and all `!important` declarations were removed.

A new token system was created in `src/styles/design-tokens.css` using CSS Custom Properties (e.g., `--token-color-brand-primary`).

However, this refactoring introduced two issues we need to fix:
1.  **Suboptimal Token Location:** The design tokens live in a CSS file instead of the `tailwind.config.js` file. This prevents us from using standard Tailwind utility classes (e.g., `bg-brand-primary`).
2.  **Specificity Hacks:** To avoid `!important`, the previous process used CSS specificity hacks like `.class.class.class` in some places. This is not a maintainable practice.

## 2. Overall Goal

Our goal is to **finalize the refactoring** by creating a true **single source of truth** within the Tailwind configuration and eliminating the CSS specificity hacks. We will do this in two phases.

---

## 3. Phase 1: Migrate CSS Tokens to `tailwind.config.js`

Your first task is to move all the design values from `design-tokens.css` into our `tailwind.config.js`.

### Instructions:

1.  **Analyze** the provided `src/styles/design-tokens.css` file.
2.  **Categorize** the CSS variables into the appropriate theme objects for Tailwind (e.g., `colors`, `spacing`, `borderRadius`, `fontSize`, etc.).
3.  **Generate** the `theme.extend` object that contains all these new tokens. The token names in the config should be semantic (e.g., `--token-color-brand-primary` becomes `'brand-primary'`).
4.  **Provide the complete, updated code for `tailwind.config.js`**.

### Files for Analysis:

**`src/styles/design-tokens.css` (Example Snippet):**
```css
:root {
  /* Colors */
  --token-color-brand-primary: #4A5568; /* slate-700 */
  --token-color-brand-secondary: #E53E3E; /* red-600 */
  --token-color-text-default: #F7FAFC; /* gray-100 */

  /* Spacing */
  --token-spacing-xs: 0.5rem; /* 8px */
  --token-spacing-sm: 0.75rem; /* 12px */

  /* Borders */
  --token-radius-md: 0.375rem;
}