# Step 5 – Analytics Event Catalog v1

## Event Definitions
```csv
event_name,required_props,optional_props,pii_policy
aurora_widget_open,sessionId|requestId,entryPoint,No PII
aurora_intent_detected,sessionId|requestId|intent,intentConfidence|filters,No PII
aurora_products_shown,sessionId|requestId|productIds|count,filters|readyToShipCount,Product IDs treated as non-PII
aurora_add_to_bag,sessionId|requestId|productId,badgeShown|tags,No PII
aurora_capsule_reserved,sessionId|requestId|capsuleId|expiresAt,shortlistCount,No PII
aurora_order_tracked,sessionId|requestId|reference,status|carrier,Contains order reference (hash after 30d)
aurora_return_initiated,sessionId|requestId|rmaId|orderId,reasonCode|itemsCount,Contains orderId (hash after 30d)
aurora_stylist_ticket_created,sessionId|requestId|ticketId,slaMinutes|queuePosition,TicketId treated as sensitive support data
aurora_csat_submitted,sessionId|requestId|rating|intent,commentLength,No PII
aurora_inspiration_uploaded,sessionId|requestId|inspirationId,contentType|sizeBytes,No PII
aurora_order_updates_subscribed,sessionId|requestId|subscriptionId|channel,maskedDestination,Masked contact only
```

## Event Sequencing
- **Discovery**: `aurora_widget_open → aurora_intent_detected(find_product) → aurora_products_shown → (optional) aurora_add_to_bag → aurora_capsule_reserved`.
- **Order Support**: `aurora_widget_open → aurora_intent_detected(track_order) → aurora_order_tracked → aurora_order_updates_subscribed`.
- **Care & Returns**: `aurora_intent_detected(return_exchange) → aurora_return_initiated → aurora_csat_submitted`.

## Sampling & Retention
- Capture 100% of widget sessions in production; add `environment` property to identify `prod`, `staging`, or `dev`.
- Retain raw logs for 90 days; after 30 days hash `orderId` and `reference` using salted SHA-256 before longer-term storage.
- QA/staging events excluded from KPI dashboards by filtering on `environment`.

## Attribution & Funnel Definitions
| funnel | steps | success criteria |
| - | - | - |
| Discovery conversion | `aurora_widget_open → aurora_products_shown → aurora_capsule_reserved` | Capsule reserved within same session |
| Support resolution | `aurora_intent_detected(track_order) → aurora_order_tracked → aurora_order_updates_subscribed` | Subscription confirmed |
| Care satisfaction | `aurora_return_initiated → aurora_csat_submitted` | CSAT submitted within 24h |

## KPI Mapping
| KPI | events | aggregation |
| - | - | - |
| Capsule conversion rate | `aurora_capsule_reserved` / `aurora_products_shown` | 7-day rolling average |
| Order support success | Count of `aurora_order_updates_subscribed` vs `aurora_order_tracked` | Daily cohort |
| CSAT health | Average score from `aurora_csat_submitted` | Weekly trend |
| Stylist load | Sum of `aurora_stylist_ticket_created` grouped by SLA band | Real-time dashboard |

## Assumptions & Deltas (TODO-CONFIRM)
- `aurora_add_to_bag` fires only when the widget deeplinks to a PDP with add-to-cart tracking.
- `environment` property standardized to {`prod`, `staging`, `dev`}.
- PII hashing process and salt storage handled by data platform team.

## Next Actions
- Align event schemas with analytics instrumentation library (`src/lib/analytics/*`).
- Build Looker/Mode dashboards mapping to the KPI table above.
- Validate warehouse retention policies with compliance.
