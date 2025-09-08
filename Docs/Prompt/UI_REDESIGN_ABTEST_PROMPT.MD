You are a senior frontend engineer and visual designer agent. Your job is to **implement a demo visual redesign** that exactly follows the reference at:

`public/Claude4.1_Color_Psychology_Demo.html`

**Important preconditions (must be respected)**:
- Do NOT modify these protected files under any circumstance:
  - `src/styles/design-tokens.css`
  - `src/styles/typography.css`
  - `src/styles/animations.css`
  - `tailwind.config.js`
  - `postcss.config.js`
- Keep every new or modified file <= 300 lines.
- Do not create or modify additional Tailwind configs. Use the **existing tailwind config** only.
- Do not commit or push changes — only produce output (diffs/patches and file contents). A human will inspect and apply.
- Output must be deterministic and reviewable: a unified `git` patch (unified diff) plus individual file contents in code blocks.

---

## Primary objective
Implement the demo visual layer so that when `NEXT_PUBLIC_DESIGN_VERSION=demo` (or `?design=demo`) is active, the UI visually matches `public/Claude4.1_Color_Psychology_Demo.html` (gradients, shimmer overlays, prismatic shadows, CTA pulses, and material-aware shadows). Keep the change minimal and scoped to demo files.

---

## Allowed files you may create / edit (only these):
1. `src/styles/aurora-demo-variables.css` — NEW or update (bridge/aliases)
2. `src/styles/demo-overrides.css` — NEW or update (delta styles only)
3. `src/app/globals.css` — small update **only** to add two import lines (immediately after design-tokens import)
4. Tests: `tests/demo-visual.spec.ts` — NEW (Playwright)
5. Optional: `docs/demo-visual-qa.md` — NEW (brief verification doc)

_Do not modify any other files._

---

## Implementation requirements (strict)

1. **Token-first variable mapping**
   - For each demo variable you use (e.g. `--deep-space`, `--nebula-purple`, `--aurora-pink`, `--aurora-crimson`, `--emerald-flash`, `--amber-glow`), prefer aliasing to an existing design token when available:
     ```css
     --nebula-purple: var(--token-color-brand-primary, #6B46C1);
     ```
   - Also define `--*-rgb` variables for any color used with alpha so gradients can use `rgba(var(--nebula-purple-rgb), 0.06)` when needed. If no token-rgb exists, generate correct `R,G,B` integers derived from hex fallback.

2. **Gradient & alpha safety**
   - All demo gradients and overlays must use `var()` with fallbacks, e.g.:
     ```css
     background: linear-gradient(135deg,
       var(--deep-space, #0A0E27) 0%,
       var(--nebula-purple, #6B46C1) 100%);
     ```
   - For translucent overlays, use `rgba(var(--aurora-pink-rgb, 255,107,157), 0.06)` style, and ensure `--aurora-pink-rgb` is defined.

3. **Delta-only design**
   - `demo-overrides.css` must contain **only** styles that differ from baseline. Do not re-declare baseline utility classes or tokens.

4. **Animation performance**
   - Use GPU-friendly transforms (translate/scale, opacity), keep animations 60fps friendly, and include `@media (prefers-reduced-motion: reduce)` fallbacks.

5. **File size & readability**
   - Keep each file < 300 lines, well-commented and minimal.

6. **Output format**
   - Produce:
     1. A **unified diff patch** (git format) that modifies/creates only the allowed files.
     2. The **full content** of the new/modified files in separate code blocks.
     3. A Playwright test `tests/demo-visual.spec.ts` that:
        - Loads `/ ?design=demo`
        - Verifies demo CSS variables exist on `:root`
        - Verifies a hero element `.bg-aurora-hero` has a computed `backgroundImage` containing `linear-gradient`
        - Takes a screenshot `demo-home.png`
     4. A short **"developer notes"** block describing how each changed CSS rule maps to which part of the demo.html (line numbers or selectors).

7. **Design rationale**
   - Produce a 3–5 sentence rationale explaining how the changes map to the demo’s color psychology goals (e.g., muted opacity to trigger subtle emotional response, prismatic shadows for material warmth).

---

## Acceptance criteria (LLM must check and report; human will verify)
- When demo is loaded locally (`NEXT_PUBLIC_DESIGN_VERSION=demo npm run dev` or visiting `/?design=demo`):
  - `getComputedStyle(document.documentElement).getPropertyValue('--deep-space')` is non-empty.
  - `.bg-aurora-hero` computed style contains `linear-gradient`.
  - No console warnings about undefined CSS variables (search console for "undefined" or "var(--").
  - Playwright test passes and screenshot `demo-home.png` is produced.
- All modified/created files are only those allowed and each file is < 300 lines.

---

## Human review rules (must appear verbatim in PR description)
- The LLM must not commit changes. It must produce a patch and files for a human to review.
- Human reviewers: Frontend lead AND UI designer must visually confirm screenshots before merging.
- If any protected files were edited by LLM, reject immediately and revert.

---

## Deliverables (exact)
1. `patch.diff` (unified git diff modifying only allowed files)
2. File contents:
   - `src/styles/aurora-demo-variables.css`
   - `src/styles/demo-overrides.css`
   - `src/app/globals.css` (show the small import lines added)
   - `tests/demo-visual.spec.ts`
   - `docs/demo-visual-qa.md` (short instructions for the human QA)
3. Short "how to apply" instructions for a reviewer (one-liner: `git apply patch.diff && npm run dev`)

---

Read `public/Claude4.1_Color_Psychology_Demo.html` as the single source of truth for visual rules. If anything in that file conflicts with the acceptance criteria (e.g. interactive JS-only behaviors that cannot be emulated by CSS alone), list those exceptions explicitly in your output.

If you understand the constraints and scope, produce the patch and the files now. DO NOT commit, push, or modify any repository directly.
