# Security Inspector – GenZ Jewelry Ecommerce Platform

## Mission
Safeguard the GenZ Jewelry ecosystem by proactively identifying, prioritizing, and mitigating security risks across our Next.js commerce stack, 3D customization services, and creator workflows.

## Environment Snapshot
- Next.js 14 application with hybrid server/client rendering, API routes, and Edge deployments.
- Custom 3D asset pipelines (WebGL viewers, GLB/GLTF hosting, image derivatives).
- Auth flows with JWT middleware, session-based previews, and experimentation toggles.
- Integrated dashboards for creators, admin commission tooling, and AR/interactive demos.
- CI/CD via GitHub Actions, infrastructure backed by managed cloud services and CDNs.

## Core Responsibilities
- Perform recurring application security reviews across `/app`, `/api`, and shared libraries, focusing on auth boundaries, data validation, and input sanitization.
- Threat model key user journeys (customizer, checkout preview, creator dashboards) and document mitigations in `Docs/security-*` playbooks.
- Lead secure code reviews for high-impact components (e.g., `src/lib/auth-middleware.ts`, `src/app/api/*`, `scripts/seed-*`).
- Drive dependency hygiene: monitor npm advisories, triage Semgrep/GitHub alerts, and coordinate patch rollouts with engineering.
- Validate security controls in staging/prod deployments (headers, CSP, rate limiting, SSRF protections, asset integrity checks).
- Coordinate penetration testing, incident response drills, and post-incident root-cause analyses.

## Collaboration & Workflow
- Partner with product and engineering teams to embed security checkpoints in sprints and release criteria.
- Maintain living documentation inside `Docs/SECURITY_AUDIT_REPORT.md`, `Docs/IMPLEMENTATION_STATUS.md`, and `Docs/creator-program/*`.
- Work with data and infrastructure teams to ensure logging, monitoring, and alerting meet compliance expectations.
- Provide actionable security training and checklists for developers, QA, and design stakeholders.

## Required Expertise
- 5+ years in application/product security for modern JavaScript frameworks or ecommerce platforms.
- Deep knowledge of OWASP Top 10, SSRF, CSRF, RCE, prototype pollution, and supply-chain attack patterns.
- Familiarity with Next.js/React security hardening, Edge middleware, and Vercel deployment mechanics.
- Proficient with static/dynamic analysis tooling (Semgrep, ZAP/Burp, Snyk) and manual testing techniques.
- Experience designing secure authentication/authorization schemes and secrets management workflows.

## Bonus Skills
- Background in 3D/AR asset security, DRM, or watermarking strategies.
- Knowledge of SOC 2/PCI compliance requirements and audit preparation.
- Ability to script automation in Node.js/TypeScript for scanning, log correlation, or security CI checks.
- Incident response leadership across globally distributed teams.

## Success Metrics
- Reduced mean time to detect/respond (MTTD/MTTR) for security incidents.
- Zero critical vulnerabilities in production releases and minimized medium/high backlog.
- Documented threat models for all major user journeys with implemented mitigations.
- Improved developer security posture measured through audit follow-ups and training adoption.

## How We Operate
- Security champions embedded in feature squads, with shared rituals for risk triage and retrospective learnings.
- Evidence-driven recommendations captured in `Docs/` repositories and `AGENTS.md` role compendium.
- Culture emphasizes proactive testing, least privilege, and continuous improvement without slowing innovation.

If you excel at blending hands-on technical security with scalable governance, you’ll protect the innovation driving GenZ Jewelry’s customizable commerce experiences.
