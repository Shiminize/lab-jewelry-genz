# GlowGlitch Concierge Widget UI Redesign

> Synthesised guide merging the legacy prototype (_widget_system_UI_redesign.md_) and the updated code-first architecture. The focus is on a luxury, deterministic experience using our Tailwind CSS token system.

---

## 1. What’s New (At a Glance)
- Composer-first layout: Quick-start journeys sit directly beneath the input so guidance appears where guests already type.
- Masthead clarity: Bold title (“Let’s craft your spark.”) plus subline (“Design support, order tracking, concierge perks.”).
- Welcome banner at top of thread sets expectations (“Replies are instant.”).
- Product capsules render as soft cards with price, shipping promise, badges, and “Add to bag / Compare / See on hand” CTAs.
- Offer card (“Reserve your Aurora Capsule — 48 hours”) drives conversions with concrete deliverables.
- Inline escalation module (“Need a stylist’s touch?”) combines benefits + one-hour SLA and compact contact form.
- CSAT prompt sits in-thread and negative feedback auto-opens escalation form.
- Inline action row (“Attach inspiration”, “Track order”, “Talk to stylist”) includes microcopy tooltips.
- Deterministic intent handling — no AI dependency.

---

## 2. Information Architecture
```
WidgetShell
├─ LauncherButton
├─ Dialog (aria-modal)
│  ├─ Masthead
│  ├─ Thread
│  │  ├─ WelcomeBanner
│  │  ├─ MessageLog (text bubbles + modules)
│  │  └─ Inline Modules (ProductCard, OfferCard, EscalationCard, CsatBar)
│  └─ Footer
│     ├─ Composer
│     ├─ QuickStartTray
│     └─ InlineActions
└─ Event hooks & session storage
```

Core flows:
- **Explore → Convert**: Welcome banner → Quick-start chip “Design ideas” → Product cards → Offer card “Reserve my capsule”.
- **Support → Reassure**: Quick-start “Track order” → Timeline module → CSAT → (needs follow-up) → Escalation.
- **Design intent**: Save ≥2 products or upload inspiration → Offer card appears → Capsule reservation CTA.

---

## 3. Design Tokens → Tailwind Mapping
| Token                                     | Utility                                   |
|-------------------------------------------|--------------------------------------------|
| `--bg` / `--bg-soft`                      | `bg-white` / `bg-[#fafafa]`                |
| `--text` / `--muted`                      | `text-[#111111]` / `text-[#6a6f76]`        |
| `--line`                                  | `border-[#e9ebee]`                         |
| `--accent` (gold)                         | `text-[#c8a96e]` / `bg-[#c8a96e]`          |
| `--shadow-1` / `--shadow-2`               | `shadow-sm` / `shadow-xl`                  |
| `--r-xs`, `--r-sm`, `--r-lg`              | `rounded-lg`, `rounded-xl`, `rounded-2xl`  |
| Font sizes `--fs-11/12/14/16/18`          | `text-[11px]`, `text-xs`, `text-sm`, `text-base`, `text-lg` |
| Masthead gradient                         | `bg-gradient-to-r from-[#ff8aa6] via-[#ffb6a9] to-[#93b6ff]` |
| Motion (`--ease`, `--speed`)              | `transition` with `duration-150` & `ease-out` |

Dark mode updates follow the token overrides (apply via `dark:` variants).

---

## 4. Component Blueprint & Copy
- **Masthead**
  - Title: “Let’s craft your spark.” (font-semibold, drop shadow for readability)
  - Subline: “Design support, order tracking, concierge perks.”
- **Welcome Banner**
  - Text: “Choose a journey… or ask anything.”
  - Hint: “Replies are instant.”
- **Product Card**
  - Title, price, shipping promise, badges (e.g. “Ships this week”), tags.
  - CTAs: `Add to bag`, `Compare`, `See on hand`.
- **Offer Card**
  - Title: “Reserve your Aurora Capsule — 48 hours”
  - Body: “We’ll hold your shortlist and send 3D turnarounds within 24 hours.”
  - CTA: “Reserve my capsule”.
- **Escalation Form**
  - Heading: “Need a stylist’s touch?”
  - Bullets: renders • pricing • sizing; SLA copy “Reply in ~1 hour”.
  - Fields: Name, Email (required), Phone (optional), Notes.
- **CSAT Prompt**
  - Question: “How did Aurora do today?”
  - Buttons: “Great” / “Needs follow-up” (negative opens escalation form).
- **Quick-Start Tray Chips**
  - `Design ideas`, `Gifts under $300`, `Ready to ship`, `Track my order`, `Returns & resizing`.
- **Inline Actions**
  - Buttons with `title` attributes for tooltips.

Accessibility:
- `role="dialog"`, `aria-modal="true"`, `aria-live="polite"` on thread container.
- Focus trap & `Esc` to close.
- Buttons/chips use `aria-label` and visible focus states.

---

## 5. Tailwind Layout Snippet
```tsx
<section className="flex h-full flex-col">
  <header className="bg-gradient-to-r from-[#ff8aa6] via-[#ffb6a9] to-[#93b6ff] px-5 py-5 text-white shadow-xl">
    <p className="text-[11px] uppercase tracking-[0.28em]">GlowGlitch Concierge</p>
    <h2 className="mt-2 text-2xl font-semibold drop-shadow-[0_6px_18px_rgba(15,15,45,0.45)]">Let&apos;s craft your spark.</h2>
    <p className="mt-1 text-sm text-white/85">Design support, order tracking, concierge perks.</p>
  </header>

  <div className="flex-1 space-y-4 overflow-y-auto bg-white px-5 py-4" aria-live="polite">
    <div className="rounded-2xl border border-[#e9ebee] bg-[#fafafa] px-4 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-[0.28em] text-[#6a6f76]">Aurora Concierge</p>
      <p className="mt-1 text-[13px] text-[#1c1f22]">Choose a journey below or ask anything—replies are instant.</p>
    </div>
    {/* map message bubbles + modules here */}
  </div>

  <footer className="space-y-3 border-t border-[#e9ebee] bg-white px-5 py-4">
    <div className="flex gap-3">
      <input
        className="flex-1 rounded-2xl border border-[#e9ebee] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
        placeholder="Ask Aurora anything…"
      />
      <button className="rounded-2xl bg-gradient-to-r from-[#ff8aa6] to-[#93b6ff] px-5 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-out hover:opacity-95">
        Send
      </button>
    </div>

    <div className="rounded-2xl border border-[#e9ebee] bg-[#fafafa] px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.28em] text-[#6a6f76]">Quick start journeys</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {quickLinks.map((chip) => (
          <button
            key={chip.id}
            className="rounded-full border border-[#e9ebee] bg-white px-3 py-1.5 text-xs font-semibold text-[#1c1f22] transition hover:border-[#c8a96e] focus:outline-none focus:ring-2 focus:ring-[#c8a96e] focus:ring-offset-1"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>

    <div className="flex flex-wrap gap-2 text-xs text-[#6a6f76]">
      <button className="inline-flex items-center gap-2 rounded-full border border-[#e9ebee] bg-white px-3 py-1 transition hover:border-[#c8a96e]">Attach inspiration</button>
      <button className="inline-flex items-center gap-2 rounded-full border border-[#e9ebee] bg-white px-3 py-1 transition hover:border-[#c8a96e]">Track order</button>
      <button className="inline-flex items-center gap-2 rounded-full border border-[#e9ebee] bg-white px-3 py-1 transition hover:border-[#c8a96e]">Talk to stylist</button>
    </div>
  </footer>
</section>
```

---

## 6. Implementation Checklist
1. Scaffold layout with the structure above (Tailwind utilities).
2. Implement message rendering and modules (product, offer, escalation, csat) using shared `ModuleRenderer`.
3. Style quick-start tray & inline actions per the table, ensuring mobile wrap.
4. Apply focus outlines and `aria-live` to message log.
5. Hook deterministic intent handlers (`detectIntent`, `executeIntent`) already in codebase.
6. QA on mobile/desktop, run `npm run lint` and accessibility audit (axe/VoiceOver).

---

**Maintainer Note**: Keep this document in sync with `Docs/widget_system_overview.md`. Copy updates must be validated with CX before release.
