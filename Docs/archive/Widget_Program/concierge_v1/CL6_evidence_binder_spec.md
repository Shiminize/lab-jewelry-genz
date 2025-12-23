# CL6 – Evidence Binder Specification

## Storage Structure
```
docs/concierge_v1/evidence/
  canary_day0/
    01_prelaunch/
      env_config.png
      feature_flag_initial.png
      mongo_counts.txt
      monitoring_dashboards.png
    02_phase10/
      product_search_screenshot.png
      order_status_response.json
      returns_request.json
      analytics_events_export.csv
    03_phase25/
      capsule_confirmation.png
      stylist_ticket_response.json
      metrics_snapshot.txt
    04_phase50/
      csat_submission.png
      dashboard_support_view.png
      mongodb_collection_counts.txt
    05_phase100/
      final_verification_screenshots.zip
      analytics_summary.csv
  post_launch/
    day1_checks.txt
    day3_security_notes.txt
    day7_retrospective.md
```

## Capture Requirements
- **Screenshots**: Use descriptive names (`<phase>_<flow>_<timestamp>.png`). Include viewport showing relevant UI states.
- **API Responses**: Save Postman exports as JSON with request headers and response time metadata.
- **Mongo Results**: Export query results as `.txt` or `.json`, redacting PII (mask emails/phones).
- **Analytics Evidence**: CSV export of event IDs, timestamp, intent, sessionId.
- **Monitoring Metrics**: Save panel screenshots plus summary `.txt` with latency/error statistics.
- **Logs**: For key events, capture sanitized log snippets with requestId.
- **Communications**: Archive internal updates/announcements in `communications/` subfolder.

## Naming Convention
`<phase>_<artifact>_<YYYYMMDD-HHMM>.ext`
- `phase`: `prelaunch`, `10pct`, `25pct`, `50pct`, `100pct`, `postlaunch-dayX`.
- `artifact`: e.g., `product`, `order`, `returns`, `capsule`, `stylist`, `analytics`, `monitoring`, `comms`.

## Metadata Log Template
```
Artifact: 10pct_product_20240812-1015.png
Source: Browser (Chrome)
Request ID: req_abc123
Stored At: docs/concierge_v1/evidence/canary_day0/02_phase10/
Notes: latency 320 ms, response 200, analytics event aurora_products_shown recorded.
```

## Retention & Access
- Store evidence in repo (if size acceptable) or secure cloud folder with read access restricted to Solo Owner & future team.
- Retain for minimum 90 days post-launch; archive thereafter per compliance guidelines.
- Ensure backups of evidence folder (e.g., zipped and stored in release assets).

## Assumptions & Deltas (TODO-CONFIRM)
- Repository can accommodate evidence size; if not, use external storage (encrypted) and document location.
- Tools available for capturing required exports (analytics dashboard supports CSV downloads).
- PII masking process well-defined (emails → `name***@domain`, phones → `***-****`).

## Next Actions
- Create evidence folder before launch and populate as phases complete.
- Update metadata log after each artifact captured.
- Attach final evidence index to launch retrospective (Day 7).
