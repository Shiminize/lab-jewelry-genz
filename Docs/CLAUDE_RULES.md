
# Claude Code Development Rules – Simplicity-First, Maintainability & Architecture Enforcement

## 1. Core Principles
- **Do not over-engineer solutions.** Strive for simplicity and maintainability while being efficient.
- Favor modularity, but **avoid over-modularization**.
- Break functionality into **clear, independent modules/functions**.  
- Avoid hardcoded values – use configuration options.
- Use modern, efficient libraries when appropriate, but **justify their use** and avoid unnecessary complexity.
- **Max file size: 300 lines.** Refactor beyond this point.

---

## 2. Feature Complexity Classification
- **Simple Features (navigation, tabs, basic modals):** Direct component layer only; minimal local state (`useState`).
- **Moderate Features (forms, search, validation):** Hook + component.
- **Complex Features (3D viewers, dynamic filtering, advanced state):** Full service → hook → component.

---

## 3. Component Layer (`/src/components/`) – Presentation Only
- No direct API calls (`fetch`, `axios`, etc.).
- No business logic (only UI handling).
- Allowed: simple state for UI interactions.

---

## 4. Hook Layer (`/src/hooks/`) – Business Logic Orchestration
- Orchestrates state and logic for its feature.
- Only layer allowed to call `/src/services/`.
- Must return only what is needed by the component.

---

## 5. Service Layer (`/src/services/`) – API Communication
- One service per API domain.
- No React hooks inside services.
- Basic data shaping only.

---

## 6. Navigation & Simple Interaction Rules
- For static or direct navigation: implement directly in component (`next/link`, `router.push()`).
- Do not create navigation managers unless multi-step/dynamic.

---

## 7. Aurora Design System Compliance
- Use tokens only from `AURORA_DESIGN_SYSTEM_SPECIFICATION.md`.
- No new colors, font sizes, radii, or shadows.
- For simple components: avoid unnecessary variant factories.

---

## 8. Anti-Bloat & Maintainability Rules
- **No excessive wrappers or abstraction layers.**
- **Refactor any file >300 lines** into smaller modules.
- **Limit functions per component/hook:**
  - Simple: 1–2
  - Moderate: 3–4
  - Complex: requires explicit justification
- Remove dead code after each implementation phase.

---

## 9. Implementation Flow
1. Classify feature (simple / moderate / complex).
2. Start with **minimum required structure**.
3. Ask for confirmation before adding layers.
4. Ensure modularity but **avoid splitting unnecessarily**.

---

## 10. Simplicity & Maintainability Checkpoints
- Before coding:
  - Does this need global state? If no → skip context.
  - Does this need remote data? If no → skip service.
  - Is the code likely to exceed 300 lines? Plan modularity.
- After coding:
  - Are there unused abstractions? Remove them.
  - Is each function/module clear in purpose? Refactor if not.

---

## 11. LLM-Specific Directives
- Always propose **simplest viable implementation first**.
- Never escalate architecture “for future-proofing” unless asked.
- Navigation, tabs, modals = **component-only by default**.

---

## 12. Testing
- Simple features: smoke tests only.
- Moderate/complex: full phase-based testing (service → hook → component).

---

## 13. Quick Decision Matrix
| Task Type           | Layer                  | Example                        |
|---------------------|------------------------|--------------------------------|
| Static navigation   | Component only         | `<NavBar /> with next/link`    |
| Form validation     | Hook + component       | `useFormValidation()`          |
| API fetching        | Service + hook         | `productService.fetchAll()`    |
| Complex flows       | Service + hook + comp. | 3D viewer, configurator        |

---

## 14. Forbidden Practices
- ❌ Over-engineering or creating excessive abstraction.
- ❌ Hardcoding values instead of configs/tokens.
- ❌ Files exceeding 450 lines without refactor.
- ❌ Adding unapproved libraries that increase complexity.
- ❌ `fetch()` calls in components.

---

## 15. File Length & Maintainability (Updated for Complex UI)

- **Simple UI components (buttons, inputs, static nav bars):**  
  - **Target:** ≤ 300 lines  
  - **Hard limit:** 350 lines

- **Moderate components (forms with validation, tab systems, modals):**  
  - **Target:** ≤ 350 lines  
  - **Hard limit:** 400 lines

- **Complex UI components (mega navigation, configurators, multi-state panels):**  
  - **Soft threshold:** ~350 lines  
  - **Hard cap:** 450 lines  
  - Exceeding 350 lines **requires justification** (e.g., additional states, featured sections, responsive layouts).  
  - Refactor only when splitting **improves clarity and maintainability** — avoid artificial fragmentation.

- **Absolute rule:**  
  - **Never exceed 450 lines without documented approval** (design or technical lead sign-off).  
  - When approaching the limit:  
    1. Review for dead code or unused features.  
    2. Extract only **non-UI logic** into hooks/services (not the layout itself).  


---

**Principle:**  
*"Keep it simple, modular, and maintainable. Scale only when proven necessary."*
