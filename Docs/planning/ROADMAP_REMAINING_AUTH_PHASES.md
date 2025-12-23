# 🧭 ROADMAP: Remaining Auth & Dashboard Phases  
**Project:** GlowGlitch / Luxury Jewelry Platform  
**Date:** November 2025  
**Maintainer:** Auth & Infrastructure Team  

---

## 1️⃣ Strategic Objective

Bring the authentication and admin dashboard systems from **secure partial MVP** to **feature-complete, scalable, and auditable**, while keeping all tests green and minimizing production risk.

This roadmap prioritizes stability, type safety, and CI/CD reliability over speed.

---

## 2️⃣ Feature Overview & Risk Mitigation

| Area | Deliverables | Key Risks | Mitigation Strategy |
|------|---------------|-----------|---------------------|
| **1. Facebook / Meta OAuth** | Add provider config, env detection, and UI labels similar to Google/Apple. | API policy shifts, token-scope misconfig, SDK version drift. | Implement least-scope permissions via Meta dashboard; reuse Google/Apple component pattern; add Jest + Playwright coverage for conditional rendering. |
| **2. Password Reset Email UX** | Replace plain SMTP text with branded HTML (MJML). | Spam filtering, template rendering errors, missing DKIM/SPF. | Build templates with MJML; test via Nodemailer + dev inbox; maintain plaintext fallback. |
| **3. Admin Dashboard Enhancements** | Show signed-in admin identity, sign-out modal, enforce `role==='admin'` across all dashboard routes. | Token leak or role drift; stale session bypass. | Add `roleGuards.ts` utilities; test admin-only middleware via Playwright. |
| **4. Automated Testing Expansion** | Cover social button rendering, password reset happy/error paths, and admin routing. | Flaky async tests, inconsistent env setup. | Add `.env.test` with dummy OAuth vars; serialize Playwright runs; ensure deterministic seeding. |
| **5. Documentation & Runbook** | Update architecture audit + secret rotation guide. | Docs drift vs. live code. | Integrate CI check for Docs/ consistency; auto-embed commit hash footer. |
| **6. Email Verification & MFA (Future)** | Add verification tokens and optional MFA/passkey. | Auth complexity explosion; user friction. | Phase rollout: start with verification tokens → add MFA flag once stable. |
| **7. Profile Management** | Endpoint + UI for name/password/marketing opt-in updates. | Validation bugs, stale session cache. | Centralize zod validation in `userRepository.ts`; trigger revalidation post-update. |
| **8. Stripe / Payments (Future)** | Implement checkout pipeline + tokenization. | PCI exposure, dependency maintenance. | Use Stripe Checkout with backend-only secret handling. |
| **9. Analytics & Monitoring** | Integrate Sentry + DataDog instrumentation. | PII leaks, bundle bloat. | Create unified `withTelemetry` util; redact sensitive fields; load only in production. |

---

## 3️⃣ Execution Order (Dependency-Optimized)

1. **Stabilize Admin Boundary**
   - Lock down `/dashboard` and `/admin` with strict role guards.  
   - _Files:_ `src/app/dashboard/layout.tsx`, `middleware.ts`, `src/lib/auth/roleGuards.ts`.

2. **Enhance Email UX (Password Reset)**
   - Replace plaintext with HTML MJML + branding.
   - _Files:_ `src/lib/email.ts`, `src/emails/templates/ResetPassword.mjml`, `tests/unit/email.test.ts`.

3. **Add Facebook OAuth**
   - Mirror Google/Apple setup; envs:
     ```bash
     AUTH_FACEBOOK_ID=
     AUTH_FACEBOOK_SECRET=
     ```
   - _Files:_ `src/lib/auth/config.ts`, `src/app/(auth)/login/page.tsx`, `tests/unit/authProviders.test.ts`.

4. **Dashboard UI Improvements**
   - Display admin avatar/email + sign-out modal.  
   - _Files:_ `src/app/dashboard/components/AdminHeader.tsx`, `src/components/ui/Modal.tsx`.

5. **Expand Test Coverage**
   - Add:
     - Playwright: social button visibility.
     - Jest: reset-password valid/invalid paths.
     - Integration: dashboard redirects unauthenticated users to `/login`.
   - _Files:_ `tests/e2e/auth.spec.ts`, `tests/integration/dashboard.spec.ts`.

6. **Documentation Refresh**
   - Update:
     - `Docs/ARCHITECTURE_VS_PRD_AUDIT.md` → mark Auth as **Complete / Baseline**.
     - Add `Docs/RUNBOOK_SECRET_ROTATION.md`.

7. **Future Enhancements Prep**
   - Stub endpoints for email verification + MFA (feature-flagged `false` by default).  
   - _Files:_ `src/lib/feature-flags.ts`, `src/app/api/auth/verify-email/route.ts`, `src/app/api/auth/mfa/setup/route.ts`.

---

## 4️⃣ Risk Mitigation Framework

- **Type Safety Guardrail**
  - `pnpm typecheck` must pass with `strict: true` before merge.

- **Test-Gate CI**
  - All merges require `pnpm test` and `pnpm exec playwright test --reporter=line` to pass.

- **Feature Flag Rollback**
  - Use toggles (`ENABLE_FACEBOOK_OAUTH`, `ENABLE_HTML_EMAILS`, etc.) for safe rollback.

- **Security Audit Step**
  - Run `npx @nestjs/swagger-cli audit` and OWASP ZAP baseline scan post-phase.

- **Error Budget**
  - Regression threshold: <1% failed tests triggers automatic rollback.

---

## 5️⃣ Key Artifacts for Future Operators

| Category | Files / Folders |
|-----------|----------------|
| **Auth Core** | `src/lib/auth/config.ts`, `src/lib/auth/userRepository.ts`, `src/lib/auth/roleGuards.ts`, `src/lib/auth/passwordResetTokens.ts`, `.env.example` |
| **Email System** | `src/lib/email.ts`, `src/emails/templates/`, `tests/unit/email.test.ts` |
| **Dashboard** | `src/app/dashboard/layout.tsx`, `src/app/dashboard/components/`, `middleware.ts` |
| **Social Providers** | `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx` |
| **Testing Infra** | `tests/unit/`, `tests/e2e/`, `jest.config.ts`, `playwright.config.ts` |
| **Docs & Guides** | `Docs/ARCHITECTURE_VS_PRD_AUDIT.md`, `Docs/RUNBOOK_SECRET_ROTATION.md`, `README.md` |
| **Feature Flags** | `src/lib/feature-flags.ts` |
| **CI/CD** | `.github/workflows/test.yml` or equivalent pipeline |

---

## 6️⃣ Timeline (Projected)

| Period | Focus | Deliverables |
|--------|--------|--------------|
| **Nov–Dec 2025** | Security & UX | Admin boundary lockdown, branded password reset, Facebook OAuth. |
| **Jan 2026** | Test Expansion | Full Playwright/Jest coverage, doc sync automation. |
| **Feb 2026** | Security Enhancements | Email verification flow, MFA scaffolding. |
| **Mar 2026** | Commerce Integration | Stripe Checkout & payout system (auth-stable). |
| **Q2 2026** | Observability | DataDog/Sentry telemetry, analytics review. |

---

## ✅ Summary

The system now has:
- A stable credential + OAuth foundation via NextAuth v5.
- Secure dashboard entry enforcement.
- Clean rollback paths via feature flags.
- Documented roadmap for future operators and AI agents.

Next critical milestone:  
**Phase 1 – Admin hardening + email UX enhancement.**

---

_Auth & Platform Systems Team_  
📁 `Docs/ROADMAP_REMAINING_AUTH_PHASES.md`
