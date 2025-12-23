# Step 8 – /dashboard/support Skeleton Spec

## Route Overview
| route | data requirements | UI elements | actions |
| - | - | - | - |
| `/dashboard/support` | Aggregated `stylistTickets`, `capsuleHolds`, negative `csat` events | Overview cards (Open Tickets, Capsules Expiring <12h, CSAT Alerts), table of active items | Filter by status/SLA, assign to agent, mark resolved |
| `/dashboard/support/tickets/:id` | Ticket detail with transcript, shortlist context, uploads | Detail pane, timeline, attachment viewer | Reassign, escalate, close ticket |
| `/dashboard/support/capsules` | Capsule holds (`capsuleId`, `expiresAt`, `customerEmail`, `shortlistCount`) | Sortable table with quick actions | Extend 24h, release capsule |
| `/dashboard/support/csat` | CSAT submissions rated `needs_follow_up` | Trend chart + actionable list | Mark contacted, create follow-up task |

## Data Fetch & Freshness
- Primary collections: `stylistTickets`, `widgetShortlists`, `capsuleHolds`, analytics view `csatAlerts`.
- Pagination: 25 rows per page using cursor on `updatedAt`.
- Filters: `status`, `assignedTo`, `expiresAt < now+12h`, `rating = needs_follow_up`.
- Roles: `support_agent` (read/update assigned items), `support_lead` (reassign, extend capsules).
- Refresh cadence: tickets via websocket/poll every 30s; capsules poll every 60s; CSAT alerts batch every 5 min.

## UX Notes
- Capsule row highlights when `expiresAt` within 2h.
- CSAT comments sanitized before rendering; show masked email/phone.
- Table actions surface confirmation modals with SLA reminders.

## Assumptions & Deltas (TODO-CONFIRM)
- Role-based access control matches existing dashboard permissions schema.
- Capsule extension API available; fallback manual process if not.
- CSAT comment storage sanitized at ingestion.

## Next Actions
- Partner with dashboard engineering to wire API endpoints to these routes.
- Create design comps aligning with existing dashboard component library.
- Define analytics logging for dashboard actions (e.g., capsule extension).
