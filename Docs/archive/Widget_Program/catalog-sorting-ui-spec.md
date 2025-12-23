# Catalog Sorting & Filter Control Spec

## Goals
- Clarify product discovery by unifying sort and filter controls into a single, predictable surface.
- Preserve the familiarity of James Allen’s catalog controls while expressing GlowGlitch’s rounded Neon styling.
- Support current data (price, name, variant availability) with headroom for upcoming merchandising flags.

## Control Bar Layout (Desktop ≥1024px)
- **Row 1 (sticky after hero):**
  - Left cluster: `All Capsules (##)` button, view toggle (Grid/List), `Filters` button.
  - Right cluster: Sort combobox (`Sort • Featured Picks`).
- **Row 2 (existing horizontal rail):** Category pills (Rings, Earrings, Necklaces, etc.), tone chips, `More filters` chip.
- **Active filter tags:** Inline row below rail with `Reset All` on the right.
- Sticky behavior: bar pins to top of viewport once user scrolls past hero; elevation shadow: `shadow-soft-lg`.

### Key Tokens & Spacing
- Control bar height: 60px (Row 1), 68px (rail).
- Gaps: 16px between controls, 12px between chips.
- Sort field width: 200px fixed, min width 160px on smaller breakpoints.
- Border-radius: 9999px for pills, 16px for combobox dropdown.

## Control Bar Layout (Tablet 768–1023px)
- Single sticky row combining clusters:
  - Left: `All Capsules (##)` text.
  - Right aligned group: `Filters` button, sort combobox, view toggle icon.
- Category/tone rail becomes horizontally scrollable with gradient fades.

## Mobile Layout (≤767px)
- Sticky compact control row with three evenly spaced buttons: `Filters`, `Sort`, `View`.
- Tapping `Filters` opens full-screen modal; `Sort` opens bottom sheet; `View` toggles Grid/List instantly.
- Category/tone rail sits below hero as horizontal scroll list; `More filters` chip triggers same modal.
- Active filters collapse into a single pill `## filters active` above product grid; tapping opens modal.

## Sorting Combobox
- Default label: `Featured Picks`.
- Interaction: clicking/tapping opens floating surface anchored to combobox; on mobile, bottom sheet.
- Options (each with helper line, optional icon on left):
  1. **Featured Picks** – “Curated order from our merchandising team.” Sort by `metadata.sortWeight` if present, else initial fetch order.
  2. **Price: Low → High** – “Great for gift budgets.” Sort ascending on `price`.
  3. **Price: High → Low** – “Spotlight statement pieces first.” Sort descending on `price`.
  4. **Name: A → Z** – “Browse alphabetically.” Sort ascending on `name` (case-insensitive).
  5. **Customizer Ready First** – “Show pieces you can customize right away.” Partition by `variantId` (truthy first), secondary sort `name`.
  6. **Limited Drop Spotlight** – “Prioritize limited availability capsules.” Partition by `metadata.limitedDrop === true`, secondary sort `metadata.sortWeight`.
- Future slots reserved for “Newest” and “Trending” once data is available.
- Selection updates URL query `?sort=price-asc` to keep filters shareable.

## Filter Modal / Drawer
- **Desktop:** right-side sheet, 420px width, overlay backdrop.
- **Mobile:** full-screen modal with sticky footer (`Apply`, `Reset` buttons).
- Sections:
  1. Price range slider (0 – $10k) with inputs.
  2. Availability toggles: `Ready to Ship`, `Made to Order`. Helper text clarifies lead times.
  3. Metal multi-select chips (Gold, White Gold, Platinum, Silver; future state can come from taxonomy).
  4. Tone checkboxes mirroring existing colors for redundancy.
  5. Optional Sustainability toggle (placeholder for future).
- “Apply” closes drawer and re-renders list; “Reset” clears all filter params and closes drawer.

## View Toggle
- Two-icon segmented control (grid/list) using `lucide` icons.
- Persist choice in local storage; default to grid.
- Update URL param `view=list` for share links.

## States & Feedback
- Loading: show top progress bar + content shimmer when sorting/filtering.
- Empty results: reuse existing empty state, triggered when filters reduce results to zero, with `Reset All` CTA.
- Active filter counter badges on `Filters` button (desktop and mobile).

## Accessibility
- Use semantic `button`/`select` roles; ensure arrow-key navigation inside combobox.
- Provide `aria-live="polite"` region announcing “Sorted by Price: Low to High” after selection.
- Drawer focus trap with escape closes.
- Minimum touch target 44px.

## Analytics & Instrumentation
- Track events:
  - `catalog_sort_changed` with `sort_key`.
  - `catalog_filter_applied` with `filters` object and `products_shown`.
  - `catalog_view_toggled` with `view`.
- Track sticky control bar impressions once per session.

## Implementation Notes
- Extend `CatalogPage` to read/write `sort`, `view`, and filter params via `searchParams`.
- Update `getCatalogProducts` to accept `sortKey`, `limit`, and optional filter conditions; fallback to client-side sort if Mongo data unavailable.
- Add optional `metadata.sortWeight`, `metadata.limitedDrop`, `metadata.readyToShip` to product model (`scripts/memory-db.js`, Mongo schema).
- Ensure pill rail and control bar share Tailwind tokens defined in `tailwind.config.js` for consistent spacing.

## Deliverables
- Figma frames: desktop sticky control bar, tablet compact row, mobile modal/bottom sheet.
- Interaction prototype demonstrating scroll-triggered sticky state + sort change feedback.
- Handoff checklist for engineering with component inventory (`ControlBar`, `SortSelect`, `FilterDrawer`, `ViewToggle`).
