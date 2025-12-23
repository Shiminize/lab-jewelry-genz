# Step 6 – 15-Minute Smoke Demo Script

## Overview
Objective: validate core widget journeys using stub endpoints within 15 minutes.

## Timeline
1. **Prep (2 min)**
   - Ensure `.env.local` points to stub URLs.
   - Run `npm run dev` if required and open the concierge widget preview.
2. **Journey A – Find Product & Capsule (5 min)**
   - Prompt: "Help me find a ring." Verify a `product_card` with ≥3 items and visible `readyToShip` badges.
   - Trigger "Reserve capsule" CTA and confirm success copy: "Capsule reserved until <timestamp>."
   - Check browser console for `aurora_capsule_reserved` payload (stub logged).
3. **Journey B – Track Order & Subscribe (4 min)**
   - Input order `AUR-100045`; confirm `order_status` timeline entries (Created → Shipped).
   - Select SMS updates; ensure masked destination displays (`+1 (***) ***-7890`).
4. **Journey C – Returns & CSAT (4 min)**
   - Initiate return for one item; verify RMA ID and label download link.
   - Submit CSAT rating `needs_follow_up`; confirm follow-up acknowledgement message.
5. **Wrap (0.5 min)**
   - Capture screenshots of each journey.
   - Log any anomalies in QA tracker.

## Pass/Fail Gates
- All three journeys complete without console errors.
- Stub responses display required fields (`id`, `title`, `status`, etc.).
- Analytics events log sessionId + requestId per journey.

## Assumptions & Deltas (TODO-CONFIRM)
- Console logging for analytics enabled in dev build.
- Capsule CTA appears when shortlist length ≥2.
- CSAT prompt fires immediately after return confirmation.

## Next Actions
- Automate smoke script through Cypress/Playwright once backend is live.
- Archive screenshots alongside QA notes after each run.
- Incorporate additional edge cases (order exception, capsule limit) in extended test plan.
