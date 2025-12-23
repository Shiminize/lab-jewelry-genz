Integration Orchestrator draft — implementation-ready

  ———

  ## 1. Workstreams & Owners

  | Workstream | Owner | Dependencies | Scope |
  |------------|-------|--------------|-------|
  | WS1: API Contracts & Auth Matrix | Platform/API (Maya T.) |
  None | Finalize docs/api/concierge-openapi.yaml, env matrices,
  bearer scopes. |
  | WS2: Widget ↔ API Alignment | Frontend Lead (Kai L.) | WS1 |
  Freeze docs/contracts/widget-interface-spec.md, confirm payloads
  match OpenAPI. |
  | WS3: Data Mapping & Seeding | Data Eng (Leo M.) | WS1 | Ensure
  docs/data/data-mapping-concierge.md, run npm run seed:mock,
  verify collections/indexes. |
  | WS4: Backend Integrations | Backend Team (Maya T. + backend
  squad) | WS1–WS3 | Implement /api/concierge/*, persistence in
  widgetShortlists, widgetInspiration, capsuleHolds, csatFeedback.
  |
  | WS5: Dashboard & Analytics | Dashboard PM (Sonya R.) +
  Analytics (Leo M.) | WS3, WS4 | Build /dashboard/support,
  enrich /dashboard/orders, ensure aurora_* events land. |
  | WS6: Security & Ops Prep | Security Ops (Priya S.) + DevOps
  (Alex W.) | WS1–WS4 | Complete docs/security/concierge-security-
  checklist.md, runbooks, SLO sheet. |
  | WS7: QA & UAT | QA Lead (Jamie P.) | WS1–WS5 | Execute docs/
  qa/aurora-uat-plan.md, validate staging data. |
  | WS8: Deployment & Rollback Rehearsal | Release Manager (Omar
  V.) + Ops | WS1–WS7 | Follow docs/deployment/aurora-rollout-
  plan.md, complete rollback drill. |

  ———

  ## 2. 10-Day Text Gantt

  Day 1-2: WS1 API Contracts (Maya)
  Day 2-3: WS2 Widget/API Spec (Kai) ↘ depends on WS1
  Day 2-4: WS3 Data Mapping & Seeding (Leo) ↘ starts once WS1
  draft ready
  Day 4-7: WS4 Backend Integrations (Backend squad) ↘ requires
  WS1–3
  Day 4-6: WS5 Dashboard & Analytics (Sonya/Leo) ↘ runs alongside
  WS4 with seeded data
  Day 6-7: WS6 Security & Ops Prep (Priya/Alex) ↘ requires WS4
  near-complete
  Day 7-9: WS7 QA & UAT (Jamie) ↘ needs WS4 & WS5
  Day 9-10: WS8 Deployment & Rollback rehearsal (Omar/Alex) ↘
  needs WS6–7

  ———

  ## 3. Artifact Register

  | Artifact | Purpose | Reviewer | Path |
  |----------|---------|----------|------|
  | OpenAPI Spec | Contract for all CONCIERGE_* endpoints |
  Platform/API + Security | docs/api/concierge-openapi.yaml |
  | Widget ↔ API Interface Spec | Frontend contract for message
  types/intents | Frontend & Backend | docs/contracts/widget-
  interface-spec.md |
  | Data Mapping & Validation | Ensures deterministic field
  transforms | Data Eng + Backend | docs/data/data-mapping-
  concierge.md |
  | Dashboard Data Contract | Defines staging dashboards |
  Dashboard PM | docs/contracts/dashboard-data-contract.md |
  | Analytics Event Catalog | Event schema + funnels | Analytics
  Lead | docs/analytics/aurora-event-catalog.md |
  | Security Checklist | Auth/PII/idempotency governance |
  Security Ops | docs/security/concierge-security-checklist.md |
  | QA & UAT Plan | Journey tests + edge cases | QA Lead | docs/
  qa/aurora-uat-plan.md |
  | Runbooks (Ops & Incident) | Day-2 + Incident response |
  DevOps/Ops | docs/runbooks/aurora-ops-runbook.md, docs/runbooks/
  aurora-incident-runbook.md |
  | SLO & Capacity Sheet | Latency/availability targets | SRE |
  docs/runbooks/aurora-slo-sheet.md |
  | Deployment Plan | Env matrices, rollout steps | Release
  Manager | docs/deployment/aurora-rollout-plan.md |

  ———

  ## 4. Risks & Mitigations

  | Risk | Impact | Mitigation |
  |------|--------|------------|
  | Schema drift (products/orders) vs spec | Widget failures,
  mismatched fields | Lock schemas in OpenAPI & data mapping; add
  automated schema tests (TODO‑CONFIRM). |
  | Seed data gaps (orders/capsule) | Staging dashboards empty |
  Maintain npm run seed:mock fixtures; refresh before QA. |
  | PII handling (emails/phones) | Compliance breach | Hash order
  numbers/contact in analytics; enforce checker via security
  checklist. |
  | Idempotency lapses | Duplicate RMAs/capsule holds | Require x-
  idempotency-key, store hash, regression test in QA plan. |
  | Upload safety | Malicious files | Enforce MIME/size checks, AV
  scan per security checklist. |
  | Analytics sessionId alignment | Broken funnels | QA to cross-
  check event payloads with requestId in logs. |

  ———

  ## 5. Exit Gates (mapped to completion criteria)

  1. OpenAPI spec approved → WS1 complete, signature recorded.
         out_for_delivery status (Ops).
      4. Confirm CRM endpoint & auth scope for stylist tickets
         (Backend/CRM team).
  widgetInspiration, capsuleHolds, csatFeedback,
  widgetOrderSubscriptions) available per plan; stubs only used in
  local dev until env vars supplied.