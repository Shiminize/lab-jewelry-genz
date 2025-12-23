# Step 7 – Security & Privacy Preflight

## Checklist
| control | question | status | owner |
| - | - | - | - |
| Auth headers | Are all concierge calls using the bearer `CONCIERGE_API_KEY`? | YES | Solo Owner |
| Request tracing | Is a unique `x-request-id` generated per call and logged? | YES | Solo Owner |
| Idempotency | Are returns & capsule requests including `x-idempotency-key` on retries? | TODO-CONFIRM | Solo Owner |
| PII minimization | Are email/phone values masked in responses? | YES | Solo Owner |
| Data retention | Are order references hashed after 30 days? | TODO-CONFIRM | Solo Owner |
| Logging hygiene | Are secrets excluded from client/server logs? | YES | Solo Owner |
| Upload safety | Are inspiration uploads limited to <10MB with AV scanning? | TODO-CONFIRM | Solo Owner |
| Rate limiting | Does the client enforce 1 request/sec throttle per intent? | TODO-CONFIRM | Solo Owner |
| Session storage | Is `sessionId` kept in memory (not localStorage)? | YES | Solo Owner |
| CSAT escalation | Are low-score notifications restricted to authorized roles? | TODO-CONFIRM | Solo Owner |

## Security Exception Template
- **Description**: What control is failing and impact.
- **Affected Area**: Widget component, API, analytics, etc.
- **Temporary Controls**: Mitigations in place until resolved.
- **Resolution ETA**: Target date to close the gap.
- **Approver**: Security sign-off (Priya S.) with timestamp.

## Assumptions & Deltas (TODO-CONFIRM)
- Server-side rate limiting complements client throttle to prevent abuse.
- Backend provides AV scanning pipeline for inspiration uploads before public storage.
- Hashing salt for order references managed via central secret manager.

## Next Actions
- Confirm idempotency enforcement policy with backend team.
- Document masking rules in developer handbook for consistent implementation.
- Schedule security review once OpenAPI spec approval is secured.
