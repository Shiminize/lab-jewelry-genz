# CSS A/B Testing Lean Refactor Plan – Execution Prompt

## Objective
Fix missing demo visual differences by introducing essential CSS variable definitions and demo overrides **without over-engineering**. Preserve current Tailwind and design token architecture.

## Tasks for Claude
1. **Create Demo CSS Variables**
   - File: `src/styles/aurora-demo-variables.css`
   - Variables to include:
     ```
     --deep-space: #0A0E27;
     --nebula-purple: #6B46C1;
     --aurora-pink: #FF6B9D;
     --aurora-crimson: #C44569;
     --emerald-flash: #10B981;
     --amber-glow: #F59E0B;
     --plum-shadow: #723C70;
     --cosmic-black: #0B0B0C;
     ```

2. **Create Demo Overrides**
   - File: `src/styles/demo-overrides.css`
   - Include:
     - Hero section gradient
     - Shimmer overlay
     - Prismatic shadow effects
   - Example:
     ```css
     .bg-aurora-hero {
       background: linear-gradient(135deg,
         var(--deep-space, #0A0E27) 0%,
         var(--nebula-purple, #6B46C1) 100%);
     }
     ```

3. **Import Demo Layers**
   - File: `src/app/globals.css`
   - Add:
     ```css
     @import './aurora-demo-variables.css';
     @import './demo-overrides.css';
     ```

4. **Clean Up Blocking Overrides**
   - Remove `!important` rules in `globals.css` lines 23–45 if they override demo variables.

5. **Verify A/B Testing Activation**
   - Ensure `NEXT_PUBLIC_DESIGN_VERSION=demo` applies demo styles.
   - Test with `getDesignVersion()` returning `demo`.

## Non-Goals
- Do not restructure typography yet.
- Do not refactor Tailwind configs beyond imports.
- Do not introduce CSS Modules or dynamic imports in this phase.

## Deliverables
- Two new CSS files (`aurora-demo-variables.css`, `demo-overrides.css`)
- Updated `globals.css`
- Demo mode visually distinct with gradients and shimmer active.
- No console errors or broken classes.

## Validation
- Demo gradients appear in Hero section.
- Shimmer effects functional.
- Legacy mode unaffected.
- A/B testing toggles correctly.
