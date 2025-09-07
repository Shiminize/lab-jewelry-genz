# Phased Aesthetic Refinement for Jewelry Customization Site

## Objective
Refine the existing jewelry customization website UI (currently at ~90% Aurora Design System compliance) to increase visual engagement, emotional resonance, and conversion rates.

### Scope
All major sections – Hero, Navigation, Materials, Curated Collections, Environmental Impact, Community/Benefits.

### Goal
Apply **Aurora gradients, prismatic shadows, interactive states, and color psychology** progressively, without major architectural disruption.

---

## Phase 1: Bug Fixes & Baseline Audit (1–2 days)
**Tasks:**
1. Fix failed asset fetches (`ProductCustomizer.tsx:164`, `HeroSection.tsx:166`) to restore 3D previews.
2. Correct “undefined” labels in material selection.
3. Run CSS linter: flag any non-token colors or legacy overrides.

**Claude Code Instructions:**
- Locate asset fetch endpoints → patch URLs or fallback gracefully.
- Replace non-token colors with Aurora equivalents (`--deep-space`, `--lunar-grey`, etc.).
- Commit as **Bugfix Sprint** (no visual redesign yet).

---

## Phase 2: Hero & Navigation Gradient Uplift (2–3 days)
**Tasks:**
1. Hero sections:  
   - Apply **primary gradient (135° deep-space → nebula-purple)** to background.  
   - Add slow gradient drift (`animation: aurora-drift 30s infinite linear`).  
2. Navigation:  
   - Implement **mega menu (desktop)** and **Midnight Luxury gradient (mobile)**.  
   - Typography: `Title M` logo, `Body M` links, `Small` sublinks.

**Claude Code Instructions:**
- Update `HeroSection.tsx` background & typography.
- Refactor `NavBar.tsx` (use approved mega menu hierarchy: Necklaces → Earrings → Bracelets → Rings → Customize → About).
- Use icons from `lucide-react` only.

---

## Phase 3: Material & Customization Flow Enhancements (3–4 days)
**Tasks:**
1. Add **prismatic shadows**:  
   - Gold → warm (#FFD700 mix).  
   - Platinum → cool (#B9F2FF).  
2. Apply **hover luminosity (+15%)** and ripple states per Aurora interactive spec.
3. Fix text anomalies in customization cards.

**Claude Code Instructions:**
- Update `MaterialSelection.tsx` & related components.
- Add `.shadow-hover` and product-aware shadow classes.
- Validate against Aurora Design System specification.

---

## Phase 4: Curated Collections & Discovery (2–3 days)
**Tasks:**
1. Add **gradient overlays** behind curated items (`deep-space → aurora-pink`).  
2. Introduce **sparkle animations** for featured rings.  
3. Implement **hover scale (1.02) + shadow-hover** on collection cards.

**Claude Code Instructions:**
- Update `CuratedCollection.tsx` grid.
- Integrate GPU-accelerated sparkle via CSS (`filter: brightness(1.15)` on hover).

---

## Phase 5: Environmental Impact & Community (2–3 days)
**Tasks:**
1. Animate warning & success states:  
   - Pulsing emerald-flash for eco-benefits.  
   - Subtle amber-glow pulses for mining warnings.  
2. Add **gradient text** for community call-to-actions (`aurora-pink → plum`).

**Claude Code Instructions:**
- Update `EnvironmentalImpact.tsx` & `CommunitySection.tsx`.
- Apply `.stat-card` with animated accent states.

---

## Phase 6: Final Polish & Regression Testing (1–2 days)
**Tasks:**
1. Visual regression: Percy.io or similar.
2. A/B test new hero & navigation aesthetics.
3. Ensure migration does not override legacy color tokens.

**Claude Code Instructions:**
- Consolidate all style changes into Aurora tokens.
- Remove temporary debug classes.

---

## Constraints
- **Component-only** (no architecture overhauls unless bug-related).
- **Aurora tokens only** – no new colors or radii invented.
- **Soft line limit: 350 lines; Hard cap: 450 lines** per component.
- No accessibility layer unless requested later.

---

## Deliverables per Phase
- Updated `.tsx` components.
- Annotated changelog (what Aurora tokens applied where).
- Short rationale per section (e.g., “Gradient applied to increase perceived depth and trust by 23% per demo insights”).

---

## Notes
- Gradient theme for mobile navigation is **Midnight Luxury only** (`from-[var(--deep-space)] to-[var(--nebula-purple)]`).  
- No dynamic seasonal switching.  
- Desktop mega menu follows approved hierarchy: Necklaces → Earrings → Bracelets → Rings → Customize → About.
