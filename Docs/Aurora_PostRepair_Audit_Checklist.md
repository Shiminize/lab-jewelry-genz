# Aurora Design System – Post-Repair Audit Checklist

## 1. Variable Aliases & Token Integrity
- [ ] Verify **all added aliases** in `design-tokens.css` are mapped correctly:
  - `--aurora-lunar-grey → #F7F7F9`
  - `--aurora-deep-space → #0A0E27`
  - `--aurora-nav-muted → #6B7280`
  - `--aurora-amber-glow → #F59E0B`
  - `--aurora-plum → #723C70`
- [ ] Ensure **no duplicates or conflicting aliases** exist in the file.
- [ ] Confirm all Aurora tokens are **referenced via Tailwind** (not raw hex in components).

## 2. Tailwind Configuration Validation
- [ ] Open `tailwind.config.js` and check:
  - `aurora-bg`, `aurora-text`, `aurora-accent` mapped to direct hex (not `var()` syntax).
  - No other broken `var(--*)` references remain.
- [ ] Run `npx tailwindcss --config tailwind.config.js --watch` to ensure **compilation passes without warnings**.

## 3. Component-Level Audit
- [ ] Verify all 5 audited components render correctly:
  - `ProductCard.tsx`
  - `HeroSection.tsx`
  - `ImageViewer.tsx`
  - `Navigation` components
- [ ] Manually check **hover states** (brightness +15%, scale 1.01) on interactive components.
- [ ] Confirm **Aurora Mega Menu** renders properly on desktop and mobile.

## 4. UI & UX Stability
- [ ] Load homepage and confirm:
  - Status 200
  - Content size ~255 KB
  - All Aurora colors render as intended (neutral, deep, accent).
- [ ] Check for:
  - **Console errors/warnings** → none expected.
  - **Visual regressions** compared to pre-migration screenshots.

## 5. File Size & Performance
- [ ] Ensure all CSS and component files remain **under 350 lines**.
- [ ] Measure initial load performance:
  - Target: **<300ms first paint** (as per CLAUDE_RULES).
  - Record Lighthouse performance score before further changes.

## 6. Token Discipline Enforcement
- [ ] Scan codebase for:
  - Raw `px-` classes where token equivalents exist.
  - Hardcoded `#hex` colors that should be tokens.
  - `!important` declarations (should be **0**).
- [ ] Run `grep -R "#[0-9a-fA-F]{3,6}" src/` to ensure no stray hardcoded colors.

## 7. Future-Proofing (Optional)
- [ ] Document newly added aliases in your **Aurora Design System Spec**.
- [ ] Plan **A/B testing reactivation** only after:
  - Stable color/token migration confirmed.
  - Core components verified with no regressions.
