# Aurora Concierge SLO & Capacity Sheet
Version: 1.0.0 (2025-10-10)

## SLOs (Red/Amber/Green)
| Endpoint | SLO | Green | Amber | Red | Alert Threshold |
|----------|-----|-------|-------|------|----------------|
| `/api/concierge/products` | Latency (p95) | ≤300ms | 300-450ms | >450ms | Amber sustained 15m, Red immediate |
| `/api/concierge/orders/status` | Latency (p95) | ≤400ms | 400-600ms | >600ms | Amber 10m, Red immediate |
| `/api/concierge/orders/status` | Availability | ≥99.5% | 99.0-99.5% | <99.0% | Alert below 99.2% daily |
| `/api/concierge/orders/returns` | Latency (p95) | ≤400ms | 400-650ms | >650ms | Amber 10m |
| `/api/concierge/capsule` | Availability | ≥99.5% | 99.0-99.5% | <99.0% | Red immediate |
| `/api/concierge/stylist` | Latency (p95) | ≤500ms | 500-700ms | >700ms | Amber 10m |
| `/api/analytics/csat` | Availability | ≥99.9% | 99.5-99.9% | <99.5% | Alert at amber |

## Capacity Planning
- Peak widget sessions: 500 concurrent (projected holiday peak 750).
- Product payload: ~8KB per response (4 cards × 2KB). Estimate bandwidth 4 Mbps at peak.
- Order lookups: 2,000/hour baseline, 4,000/hour peak sale events.
- Returns/capsule requests: 200/hour baseline, 500/hour peak.
- Stylist tickets: 50/hour normal; ensure CRM API limit 100/min.

## Alerting Bands
- Green: No action; continue monitoring.
- Amber: Notify on-call, investigate; consider partial degrade.
- Red: Trigger incident runbook; communicate via status page.
