# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 9.2 — AppSec Security Test Suite

**Sprint Identifier**: `SPRINT-9.2-APPSEC-SECURITY-TEST-SUITE`  
**Phase**: Phase 9 (Security Testing: DAST & AppSec)  
**Story Points**: 6 SP  
**Branch**: `feat/sprint-9.2-appsec-suite`  
**Goal**: Build a `@security` test suite of deterministic tests covering authentication, authorization, injection, file upload, transport and headers, cookies, CORS, CSRF, brute force, and information leakage, each mapped to OWASP.

---

## 1. Persona Roles & Ownership Matrix

| Persona                    | Role Assignment              | Responsibilities for this Sprint                                                                      | Status    |
| :------------------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**           | `role-scrum-master`          | Sprint kick-off, ceremony governance, `task.md` tracking, DoR validation, DoD audit, velocity sync.   | `ACTIVE`  |
| **SDET Architect**         | `role-sdet-architect`        | AppSec architecture, dual-catalog sync (`SEC-*`), code review checklist audit, Quality Gate sign-off. | `ACTIVE`  |
| **Security Test Engineer** | `role-security-engineer`     | Security fixtures (`securityApi`), attack payloads, OWASP mapping, AppSec API & UI test authoring.    | `ACTIVE`  |
| **Playwright QA Lead**     | `role-playwright-automation` | Playwright test harness, UI XSS test spec, npm script `test:security`, browser policy enforcement.    | `ACTIVE`  |
| **DevOps Engineer**        | `role-devops-engineer`       | Workflow integration, PR release lifecycle, CI check monitoring, gh pr create.                        | `ACTIVE`  |
| **Product Owner**          | Human Tech Lead (`User`)     | Backlog prioritization, review gate approvals, final PR merge to `main`.                              | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-921: Authentication & Session Security (1 SP) — `Test_002_JwtAndSessionSecurity.spec.ts`

- [x] **US-AF-921.1** (`Security Test Engineer`): Implement `securityApi` fixture in `playwright-e2e/src/core/base/security.fixture.ts` omitting bypass headers (`x-bypass-rate-limit`, `x-bypass-csrf`).
- [x] **US-AF-921.2** (`Security Test Engineer`): Author `Test_002_JwtAndSessionSecurity.spec.ts` in `playwright-e2e/src/tests/api/Security/` testing `alg: none` rejection, `alg`/`kid` tampering, payload tampering (`sub`/`username`), token reuse after logout, refresh token rotation, and password non-echoing / username enumeration prevention.
- [x] **US-AF-921.3** (`SDET Architect`): Map tests to OWASP API2:2023 / A07:2021 and register in catalogs.

### US-AF-922: Authorization / BOLA Security (1 SP) — `Test_003_ObjectLevelAuthorization.spec.ts`

- [x] **US-AF-922.1** (`Security Test Engineer`): Author `Test_003_ObjectLevelAuthorization.spec.ts` testing BOLA / IDOR across `/orders`, `/profile`, `/cart` across User A and User B.
- [x] **US-AF-922.2** (`Security Test Engineer`): Test `x-test-session-id` spoofing isolation between distinct users.
- [x] **US-AF-922.3** (`Security Test Engineer`): Test Mass Assignment (BOPLA / `@owasp-api3`) in `POST /register` with administrative privilege flags (`role: 'admin'`, `isAdmin: true`).
- [x] **US-AF-922.4** (`SDET Architect`): Map tests to OWASP API1:2023 / API3:2023 and register in catalogs.

### US-AF-923: Injection & XSS (1 SP) — API & UI Specs

- [x] **US-AF-923.1** (`Security Test Engineer`): Author `Test_004_InjectionPayloads.spec.ts` for SQL, NoSQL (`{"$gt": ""}`), OS command, and path-traversal payloads in `search`, `username`, `fullName`, `bookId` ensuring no 5xx or unhandled stack traces.
- [x] **US-AF-923.2** (`Playwright QA Lead`): Author `Test_001_StoredXss.spec.ts` in `playwright-e2e/src/tests/ui/Security/` testing stored XSS in profile full name and reflected XSS in search query using inert marker `window.__xss`.
- [x] **US-AF-923.3** (`SDET Architect`): Map tests to OWASP A03:2021 / API8:2023 and register in catalogs.

### US-AF-924: File Upload Security (1 SP) — `Test_005_AvatarUploadSecurity.spec.ts`

- [x] **US-AF-924.1** (`Security Test Engineer`): Create security test data payloads under `playwright-e2e/src/test-data/security/` (executable disguised as PNG, SVG with embedded script, path traversal filename `../../evil.png`).
- [x] **US-AF-924.2** (`Security Test Engineer`): Author `Test_005_AvatarUploadSecurity.spec.ts` testing MIME spoofing, malicious SVG handling/headers, oversize files (413/4xx), and path traversal filename sanitization.
- [x] **US-AF-924.3** (`SDET Architect`): Map tests to OWASP API4:2023 / A03:2021 and register in catalogs.

### US-AF-925: Transport, Headers, Cookies & CORS (0.5 SP) — `Test_006_SecurityHeadersAndCors.spec.ts`

- [x] **US-AF-925.1** (`Security Test Engineer`): Author `Test_006_SecurityHeadersAndCors.spec.ts` testing Helmet headers (`Content-Security-Policy`, `Strict-Transport-Security` on STAGING, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, `Referrer-Policy`, absence of `X-Powered-By`).
- [x] **US-AF-925.2** (`Security Test Engineer`): Test cookie attributes (`HttpOnly`, `SameSite`, `Secure` on STAGING) and CORS origin reflections (`Origin: https://evil.example` preflight rejected).
- [x] **US-AF-925.3** (`SDET Architect`): Map tests to OWASP API8:2023 / A05:2021 and register in catalogs.

### US-AF-926: CSRF, Rate Limiting & Information Leakage (1 SP)

- [x] **US-AF-926.1** (`Security Test Engineer`): Author `Test_007_CsrfEnforcement.spec.ts` testing CSRF enforcement (`x-enforce-csrf: true`), token verification (`GET /api/csrf-token`), and bypass header finding.
- [x] **US-AF-926.2** (`Security Test Engineer`): Author `Test_008_BruteForceRateLimit.spec.ts` testing >600 requests/min to `/api/login` returning 429 with `Retry-After` (tagged `@slow`, DOCKER only).
- [x] **US-AF-926.3** (`Security Test Engineer`): Author `Test_009_InformationLeakage.spec.ts` testing 404/500 error responses and `/api/metrics` leakage.
- [x] **US-AF-926.4** (`SDET Architect`): Map tests to OWASP API4:2023 / API8:2023 / A01:2021 and register in catalogs.

### US-AF-927: Documentation, Tooling & Dual-Catalog Sync (0.5 SP)

- [x] **US-AF-927.1** (`SDET Architect`): Add npm script `test:security` in `playwright-e2e/package.json` (`playwright test --grep @security`).
- [x] **US-AF-927.2** (`SDET Architect`): Add all `SEC-*` catalog entries to `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` in 100% lockstep parity.
- [x] **US-AF-927.3** (`Security Test Engineer`): Expand `docs/security/security_testing_guide.md` with AppSec test suite documentation, fixture usage, OWASP mapping, and finding triage.
- [x] **US-AF-927.4** (`Scrum Master`): Update `planning/README.md`, `planning/Sprints/sprint_9_2_appsec_security_test_suite.md`, and Phase 9 overview.
- [ ] **US-AF-927.5** (`DevOps Engineer`): Verify CI integration, create pull request via `gh pr create`, monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role     | Review Feedback & Comments                                                         | Gate Status |
| :------------------------------- | :-------------- | :--------------------------------------------------------------------------------- | :---------: |
| **Pre-Flight Architecture Gate** | SDET Architect  | Test strategy, scope guard validation, dual-catalog sync design.                   | `[PASSED]`  |
| **Code Acceptance Review Gate**  | SDET Architect  | Code review checklist: securityApi fixture, single-browser, inert XSS, OWASP tags. | `[PASSED]`  |
| **Scrum Master DoD Gate**        | Scrum Master    | 4-point DoD: static analysis clean, test passes, catalog parity, docs sync.        | `[PASSED]`  |
| **DevOps Release Gate**          | DevOps Engineer | Workflow verification, PR creation, green CI status.                               | `[PASSED]`  |
| **Final Human Sign-Off**         | Human Tech Lead | Final PR review and merge to `main`.                                               | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `npm run lint:all` and `npm run typecheck:all` pass across all workspaces with 0 errors.
- [x] ≥ 30 `@security` tests authored with proper skip conditions (`ENV=DOCKER` for attack payloads).
- [x] Attack tests strictly use `securityApi` fixture without bypass headers.
- [x] Dual-catalog parity confirmed: `npm run test:verify-catalog` exits 0.
- [x] Single-browser execution policy strictly preserved (Google Chrome UI + API only).
- [x] Documentation updated (`security_testing_guide.md`, `planning/Sprints/sprint_9_2_appsec_security_test_suite.md`, `planning/README.md`).
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [ ] All CI workflow checks green.

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
npm run test:verify-catalog

# Command 2: Static analysis
npm run typecheck:all
npm run lint:all

# Command 3: Security test list and execution
cd playwright-e2e
npm run test:security -- --list
```
