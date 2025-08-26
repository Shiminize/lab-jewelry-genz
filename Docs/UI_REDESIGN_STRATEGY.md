# Strategic Plan: UI Redesign to Geometric Minimalism

This document outlines a strategic plan to safely and thoroughly revise the UI from a rounded to a geometric, minimalist design, while adhering to the existing color palette.

## Phase 1: Global Configuration Update (The "Big Switch")

The most impactful and safest first step is to change the default `borderRadius` for all components at the global level. This will immediately apply the geometric style across the entire application.

**Action:** Modify your `tailwind.config.js` file.

1.  **Read the file:** Open `tailwind.config.js`.
2.  **Modify the theme:** Add a `borderRadius` section to the `theme.extend` object and set all default radius values to `0`. This will effectively disable rounded corners for all standard Tailwind utilities (like `.rounded-lg`).
3.  **Apply the change:** Save the updated configuration file.

This single change will handle a majority of the `rounded-` classes automatically.

## Phase 2: Foundational Component Refactoring (`/src/components/ui`)

Next, audit and refactor the foundational UI components. These components are the building blocks of your application, and ensuring they are aligned with the new design is critical.

**Action:** Systematically check and update the files in `src/components/ui`.

1.  **Identify Core Components:** Focus on `Button.tsx`, `Card.tsx`, `Input.tsx`, `Tabs.tsx`, and other core elements in this directory.
2.  **Remove `rounded-` Classes:** Search for any hardcoded `rounded-` classes within these files and remove them. The global setting from Phase 1 should handle the styling, but some components might have explicit `rounded-` classes that need to be removed.
3.  **Adjust Padding and Borders:** Analyze the styles to ensure that the padding and border widths create a crisp, geometric look. For example, you might consider changing `border` to `border-2` on some elements to create a more defined edge.

## Phase 3: Layout and Spacing Adjustments

The Monica Vinader site uses a strong grid system and generous whitespace. This phase focuses on emulating that structure.

**Recommendation:**

*   **Embrace the Grid:** Utilize Tailwind's grid utilities (`grid`, `grid-cols-*`, `gap-*`) to create more structured layouts on your pages, especially for product listings and content sections.
*   **Consistent Spacing:** Rely on your theme's spacing scale for margins and padding (`p-4`, `m-8`, etc.) to ensure consistent and rhythmic use of whitespace. Avoid arbitrary values.
*   **Full-Bleed Sections:** For hero sections and other promotional content, consider full-width sections that span the entire viewport, which is a common feature in minimalist design.

## Phase 4: Iterative Component Refactoring

With the foundation in place, the next step is to work through the rest of the application's components. Given the large number of components, an iterative approach is best.

**Methodology:**

1.  **Prioritize by Page:** Start with your most important pages (e.g., Homepage, Product Catalog, Product Detail Page).
2.  **Component by Component:** On each page, identify the components used. For each component, repeat the process from Phase 2: remove `rounded-` classes and adjust styles as needed.
3.  **Verify as You Go:** After updating a component or page, thoroughly test it to ensure there are no visual regressions.

## Phase 5: Typography and Iconography Review

While you're keeping your color palette, the new aesthetic might call for subtle changes to typography and icons.

**Recommendation:**

*   **Typography:** Your `tailwind.config.js` defines `Fraunces` as the headline font and `Inter` as the body font. These are excellent choices for a minimalist design. Ensure they are used consistently.
*   **Iconography:** Review your icons. The minimalist aesthetic favors simple, line-based icons with a consistent stroke width.

## Phase 6: Final Review and Cleanup

After working through all the components and pages, a final review is necessary to ensure consistency and catch anything that was missed.

**Action:**

1.  **Final Search:** Run a final search for any remaining `rounded-` classes in the codebase.
2.  **Cross-Browser Testing:** Test the application across different browsers to ensure consistent rendering.
3.  **Mobile and Responsive Testing:** Pay close attention to the design on mobile and tablet devices to ensure the geometric style translates well to smaller screens.
