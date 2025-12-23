# GlowGlitch AI Concierge Widget Redesign

> Collaborative brief by Agent/Content-Marketer.md & Agent/UI-UX-Designer.md for the AI-driven support + sales assistant, powered by DeepSeek.

---

## 1. Objectives, Constraints, Success Metrics
- **Goals**: deflect routine support questions, surface personalized offers, capture consult bookings, and maintain the GlowGlitch luxury voice.
- **Primary device**: mobile (≤414 px); desktop receives responsive enhancements, but mobile parity required.
- **Design system**: continue Aurora/Neon token usage; keep gradients subtle, avoid introducing new palette without design approval.
- **AI platform**: DeepSeek API (Chat Completion). Latency target <2 s; streaming desirable. No PII storage in frontend.
- **KPIs**: (1) % support deflections; (2) conversion assist rate (email capture, consult booking, checkout assistance); (3) CSAT post-chat pulse (thumbs up/down).
- **Accessibility**: WCAG 2.1 AA; keyboard trap-free; screen reader-friendly announcements for new messages.

---

## 2. Audience & Tone Guidance (Content-Marketer)
- **Personas**: stylists shopping for bespoke pieces, returning clients verifying status, first-time shoppers exploring custom options.
- **Voice**: Concierge-level warmth + gemstone storytelling; confident, never pushy. Sample signature: “— GlowGlitch Concierge”.
- **AI Personality**: “Aurora Concierge” — can recall recent interactions, confirms understanding, offers proactive next steps (bookings, samples, financing).
- **Compliance**: avoid medical/financial claims; when uncertain, offer to escalate to a human stylist.

---

## 3. Conversation Architecture
1. **Welcome Prompt** (first render)
   - Greeting line based on time of day.
   - Three quick reply chips (Order Status, Design My Capsule, Care & Resizing).
   - CTA block: “Book a 1:1 styling consult” linking to `/experiences/consult`.
2. **Intent Handling**
   - **Support**: fetch FAQ snippets from `/api/support/faqs`.
   - **Customization**: gather ring size, metal preference, target timeline; offer to email lookbook.
   - **Sales Nudges**: highlight limited “Aurora Capsule” slots, financing info.
3. **Escalation**
   - Trigger on sentiment negative, or if request matches `HUMAN_REQUIRED` list (e.g., order change within 24 h).
   - Present callback scheduler (Calendly embed) or email capture inline.
4. **Conversion Hooks**
   - Dynamic offer cards (images + CTA) inserted when user expresses purchase intent.
   - Limited-time trust badge (eco-certified lab grown).
5. **Wrap-up**
   - Summaries of conversation + CTA to continue shopping or start checkout.
   - CSAT thumbs component.

---

## 4. Copy System (Key Snippets)
- **Launcher CTA**: “Ask Aurora Concierge”
- **Hero title**: “Let’s craft your spark.”
- **Intro paragraph**: “Share your vision—our AI stylist sketches options, tracks orders, and unlocks concierge perks in minutes.”
- **Quick Reply Labels**: `Track my order`, `Design ideas`, `Clean & care tips`, `Financing options`.
- **Sales Offer Card**:
  - Title: “Reserve your Aurora Capsule”
  - Body: “Select your gemstone palette and we’ll deliver 3D turnarounds in 48 hours.”
  - CTA: “Start my capsule”
- **Escalation copy**: “I’ll loop in a GlowGlitch stylist. What’s the best email or time to reach you?”
- **CSAT Ask**: “How did Aurora do today?”

---

## 5. UI/UX Layout Blueprint
### A. States
1. **Collapsed Launcher (default)**
   - Pill button anchored bottom-right, `max-w-[min(320px,calc(100vw-2.5rem))]`.
   - Displays badge with “New: AI Concierge”.
2. **Peek State (first open)**
   - Slides up to 70% viewport height; gradient header with avatar and CTA.
   - Full-bleed hero card with promise & consult CTA.
3. **Active Chat**
   - Split sections:
     - Sticky intent chips carousel (h-scrollable).
     - Chat log with alternating message treatments; assistant bubbles include small icon, use `bg-surface-elevated`.
     - Inline offer modules (card with image, CTA button).
   - Composer with text field, quick action icons (attach inspiration, view order status).
4. **Escalation Modal**
   - Overlays within widget; stepper for selecting callback/email.
5. **Post-chat Summary**
   - Timeline recap list; button row “Continue shopping” + “Book consult”.

### B. Visual Guidelines
- **Spacing**: 20 px gutters mobile; 24 px desktop.
- **Typography**: `Typography` component variants — header uses `variant="title"`; chat body `variant="body"` with `text-xs` mobile.
- **Color**: maintain coral/sky gradient; highlight actions with accent-secondary.
- **Motion**: 200 ms cubic-bezier(0.4, 0, 0.2, 1) slide/scale; fade-in for new messages.
- **Accessibility**: provide reduce-motion check; ensure focus order from header to composer; voiceover announces “New message from Aurora Concierge…”.

---

## 6. DeepSeek API Integration Outline
- **System Prompt Template**
  ```
  You are Aurora Concierge, the luxury jewelry AI stylist for GlowGlitch.
  Goals: clarify intent, provide accurate info, recommend products, and drive qualified bookings.
  Always confirm key details (budget, timeline). Escalate when uncertain.
  ```
- **Context Block**
  - Latest order summary (if user authenticated).
  - Current campaign offers.
  - Relevant FAQ snippets (top 3 by intent).
- **Memory Strategy**
  - Session memory cached client-side (e.g., IndexedDB) + optional server session store (12 h TTL).
  - Store sanitized conversation for analytics via `/api/ai/metrics`.
- **API Calls**
  - `POST /api/ai/deepseek/chat` → server proxy adds API key, handles streaming.
  - Include `metadata` (intent, customer stage) for downstream analytics.
- **Fallback Handling**
  - Timeout at 6 s → show retry prompt + escalate option.
  - On error -> show friendly apology, log event.
- **Security**
  - Strip payment details; mask emails except for explicit escalation.

---

## 7. Implementation Roadmap
1. **Discovery & Validation**
   - Confirm DeepSeek credentials + rate limits.
   - Align with CX on escalation protocol.
   - Provision `DEEPSEEK_API_KEY` in environment variables (server only) and update `.env.local` template.
2. **Content & Prompting**
   - Finalize prompt library, quick replies, offer copy.
   - Build knowledge base mapping (orders, care, design).
3. **UI Build**
   - Create new `AiSupportWidget` component using existing design system tokens.
   - Implement launcher, peek, chat, offer modules, escalation flow.
4. **Backend Services**
   - Proxy endpoint for DeepSeek; add intent classification service if needed.
   - Analytics events (open_widget, intent_selected, consult_cta_click).
5. **QA & Accessibility**
   - Mobile responsive tests (Chrome/Firefox/iOS Safari).
   - Screen reader walkthrough (VoiceOver).
   - Performance budget check (bundle impact <25 kb gz).
6. **Launch Prep**
   - Experiment plan (A/B vs existing support widget).
   - Success dashboard in Looker/GA.
   - Team training on AI escalation and transcript review.

---

## 8. Open Questions
- Preferred method for booking consult (existing Calendly vs bespoke).
- Need for multilingual support at launch?
- Should AI surface order modifications or restrict to read-only status?

---

**Next Actions**
1. Review this brief with product + CX stakeholders.
2. Approve tone samples & CTA copy.
3. Greenlight UI wireframes for high-fidelity mock-ups.
