# Step 12 – QA / UAT Plan

## Test Matrix
| journey | objectives | key assertions |
| - | - | - |
| Find Product | Surface relevant product cards and capsule CTA | Product cards render with required fields; filters honored; CTA visible when shortlist ≥ 2 |
| Track Order | Display normalized timeline and allow subscription | Timeline entries correct; exception copy; subscription success with masked contact |
| Returns & Resizes | Issue RMA and handle idempotent retries | RMA generated; label URL accessible; repeated call echoes idempotency key |
| Capsule Reserve | Verify reservation + conflict handling | Capsule confirmation returned; second attempt warns about active hold |
| Stylist Escalation | Collect details and confirm ticket | Form validation; ticket ack with SLA; uploads (if provided) referenced |
| CSAT Flow | Capture rating and log analytics | CSAT prompt displays; analytics event recorded |
| Inspiration Upload | Validate file rules | Accepts valid image; rejects >10 MB or unsupported MIME |

## Negative Tests
- Invalid order number or mismatched email/zip.
- Return request outside policy window.
- Capsule hold already active.
- Upload exceeding size or unsupported format.
- Products endpoint timeout (simulate network error).

## UAT Script (10 Tasks)
1. Request ring recommendations and bookmark favorite items.
2. Reserve capsule and note expiration timestamp.
3. Track order `AUR-100045`; subscribe to email updates.
4. Initiate return for resizing-limited ring; observe escalation guidance.
5. Submit CSAT rating `needs_follow_up` and confirm follow-up copy.
6. Upload inspiration image (PNG < 5 MB); confirm moderation status.
7. Attempt capsule reserve twice to verify idempotent messaging.
8. Submit stylist request with transcript summary and shortlist reference.
9. Trigger financing intent to confirm informational response.
10. Open `/dashboard/support` staging view to verify new ticket entry.

## Evidence Collection
- Screenshot each journey’s key screen.
- Record request/response IDs for audit.
- Log analytics event payloads for at least three journeys.

## Assumptions & Deltas (TODO-CONFIRM)
- QA access to staging seeding scripts and mock data credentials.
- UAT participants comfortable with stub copy variations.
- Automation coverage planned post-integration (Cypress/Playwright).
- Accessibility testing handled in separate audit phase.

## Next Actions
- Schedule QA/UAT window preceding production rollout.
- Distribute UAT script to stakeholders with sign-off checklist.
- Integrate test tracking into shared QA dashboard.
