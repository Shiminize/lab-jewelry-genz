# Aurora Concierge Widget: Audit & Optimization Plan

**Date:** 2025-12-18
**Auditors:** @UI-UX-designer-glowglitch, @Copywriter-glowglitch

## Executive Summary
The Aurora Concierge widget functions well functionally but deviates significantly from the **GlowGlitch** "Calm Luxury" aesthetic and voice. The most critical visual dissonance is the widespread use of rounded corners (`rounded-2xl`, `rounded-full`), which directly contradicts the brand's "zero-radius / sharp geometric" architectural principle. Copy varies between helpful and slightly too casual ("Ask Aurora anything!"), needing a shift to a more confident, editorial tone.

---

## 1. UI/UX Audit (Visual & Interaction)
**Auditor:** @UI-UX-designer-glowglitch

### 🚨 Critical Design System Violations
- **Border Radius**: The current implementation uses `rounded-full`, `rounded-3xl`, and `rounded-2xl` extensively.
    - **Rule**: "Architectural, geometric... All corners are zero-radius (0px)."
    - **Impact**: The widget feels "bubbly" and generic SaaS-like, rather than a premium luxury editorial element.
    - **Fix**: Remove all `rounded-*` classes. Use sharp corners (0px) for the widget shell, buttons, input fields, and message bubbles.

### Visual Refinements
- **Typography**:
    - Current: Uses very small sizes (`10px`, `11px`).
    - **Recommendation**: Bump minimum legible sizes to 12px for accessibility and cleaner reading, using `tracking` to maintain the "fine" look if needed, but `tracking-widest` on 10px can be hard to read.
    - **Font**: Ensure `Petrona` is used for the "Aurora Concierge" header to anchor it in the brand voice.
- **Spacing & Layout**:
    - The `WidgetShell` is floating with a large shadow (`shadow-soft` is correct, but floating + rounded is wrong).
    - **Recommendation**: Keep the floating position but use a sharp rectangular container. Consider a heavy border (`border border-text-primary`) for a "card" look or a very subtle `border-border-subtle` for a "floating sheet" look.
- **Message Bubbles**:
    - Current: `rounded-3xl`.
    - **Recommendation**: Zero radius. Differentiate "Guest" vs "Aurora" via background color and subtle borders, not organic shapes.
    - **Guest**: `bg-neutral-50 border border-border-subtle text-text-primary` (Sharp).
    - **Aurora**: `bg-surface-base text-text-primary pl-4 border-l-2 border-accent-primary` (Editorial style, no bubble).

### Interaction Patterns
- **Floating Action Button (Launcher)**:
    - Current: Pill shape (`rounded-full`).
    - **Recommendation**: Square or Rectangle button. `h-14 w-14` or `px-6 py-3` sharp rectangle.

---

## 2. Copywriting Audit (Voice & Tone)
**Auditor:** @Copywriter-glowglitch

### Voice Consistency
- **Tone**: Currently "helpful SaaS" ("Ask Aurora anything!"). Needs to be "Calm Luxury".
- **POV**: "We" is used ("How can we help?"). Aurora should feel like a singular, intelligent entity or the brand's voice.

### Specific Copy Recommendations

| Component | Current Copy | Recommended (GlowGlitch Voice) | Rationale |
| :--- | :--- | :--- | :--- |
| **Header** | "How can we help?" | "Concierge" or "Assistance" | More minimal. "How can we help?" is standard service desk. |
| **Intro** | "Choose a journey or ask anything—replies are instant." | "Select a topic or type your request below." | Remove "replies are instant" (over-explaining). |
| **Empty State** | "No messages yet. Ask Aurora anything!" | "Begin a conversation." | Remove exclamation mark. Keep it calm. |
| **Input Placeholder** | "Ask Aurora anything..." | "Type a message..." or "Inquire..." | "Ask anything" is repetitive. |
| **Quick Links** | "Track", "Stylist" | "Order Status", "Stylist Request" | "Track" is a bit abrupt. "Order Status" is formal/clear. |
| **Shortlist** | "Shortlist (N)" | "Saved Items (N)" | "Shortlist" is fine, but "Saved Items" is clearer luxury standard. |

---

## 3. Workflow & Technical Recommendations
**Auditor:** Engineering / Product

1.  **Stub Mode Visibility**: The dev-only badge is good. Ensure `conciergeDataMode` is explicitly logged in production initialization (already doing this).
2.  **Shortlist Drawer**: The `ShortlistDrawer` is a good heavy-weight interaction. Ensure it doesn't cover the composer if the user needs to ask questions *about* the playlist.
    - *Note*: Currently it uses `createPortal` and covers most of the widget.
    - **Recommendation**: Ensure the "Invite Stylist" flow passes the Shortlist context clearly.
3.  **Keyboard Navigation**: "Esc" to close is implemented. Ensure focus trap works within the widget when open.

## 4. Proposed Implementation Plan

### Phase 1: The "Zero-Radius" Reskin
1.  **Global Replace**: `rounded-*` &rarr; `rounded-none` (or remove class).
2.  **Widget Shell**: Convert to sharp rectangle. Adjust shadows to `shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]` or similar architectural shadow if "shadow-soft" is too diffuse.
3.  **Message Styling**: Refactor `WidgetConversation.tsx` to use editorial message styles (lines/borders) instead of chat bubbles.

### Phase 2: Copy Tune-up
1.  Update `const` strings in `WidgetShell`, `WidgetConversation`, `WidgetComposer`.
2.  Update placeholders and button labels.

### Phase 3: Shortlist Polish
1.  Reskin `ShortlistDrawer.tsx` to match the new sharp aesthetic.
2.  Review "Share" copy.

---

**Next Steps**: Approval to proceed with Phase 1 & 2 (UI Reskin & Copy Updates).
