# Sprint 9.2: AppSec Security Test Suite

**Navigation**: [⬅️ Previous: Sprint 9.1](sprint_9_1_dast_pipeline_with_owasp_zap.md) | [🗺️ Planning Hub](../README.md) | [Phase 9](../Phases/phase_9_security_testing_dast_and_appsec.md) | [Next: Sprint 10.1 ➡️](sprint_10_1_ui_determinism_and_lint_enforcement.md)

**Sprint Identifier**: `SPRINT-9.2-APPSEC-SECURITY-TEST-SUITE`
**Phase Mapping**: [Phase 9](../Phases/phase_9_security_testing_dast_and_appsec.md)
**Estimated Velocity**: 6 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-9.2-appsec-suite`
**Depends On**: Sprint 8.1 (clients), Sprint 8.2 (authz matrix base), Sprint 9.1 (persona)
**Sprint Goal**: Build a `@security` test suite of about 35 deterministic tests covering authentication, authorization, injection, file upload, transport and headers, cookies, CORS, CSRF, brute force and information leakage, each mapped to OWASP.

---

## 1. Design

- Location: `playwright-e2e/src/tests/api/Security/` (API project) plus `playwright-e2e/src/tests/ui/Security/` (Chrome project, for XSS rendering).
- New fixture **`securityApi`**: same clients as `api`, but **without** `x-bypass-csrf` / `x-bypass-rate-limit` and with an isolated session id. All attack-path tests use it.
- Tag every test `@security` plus an OWASP tag, e.g. `@owasp-api1` (BOLA), `@owasp-api2` (Broken Authentication), `@owasp-api3` (BOPLA), `@owasp-api4` (Resource Consumption), `@owasp-api8` (Misconfiguration), `@owasp-a03` (Injection).
- New npm script: `test:security` (`--grep @security`).
- Catalog IDs: `SEC-AUTH-*`, `SEC-AUTHZ-*`, `SEC-INJ-*`, `SEC-UPL-*`, `SEC-HDR-*`, `SEC-CSRF-*`, `SEC-RL-*`, `SEC-LEAK-*`.
- Runs on DOCKER only (`test.skip(env !== 'DOCKER', 'attack payloads only on disposable env')`), except the passive header/cookie tests, which may also run on STAGING.

---

## 2. Sprint Backlog & User Stories

### US-AF-921: Authentication & session (1 SP) — `Test_002_JwtAndSessionSecurity.spec.ts`
- [ ] `alg: none` token rejected.
- [ ] Token signed with the wrong secret rejected (overlaps the 8.2 matrix — reference it, don't duplicate; add only the `alg` and `kid` header tampering cases here).
- [ ] Payload tampering (change `sub`/`username`, keep the signature) rejected.
- [ ] Token reuse after `/logout` (expected rejected; if not, `test.fail()` + finding).
- [ ] Refresh-token rotation: an old refresh token can't be reused after a refresh.
- [ ] Password not echoed in any auth response; login error message identical for unknown user and wrong password (no username enumeration).

### US-AF-922: Authorization / BOLA (1 SP) — `Test_003_ObjectLevelAuthorization.spec.ts`
- [ ] User A can't read User B's `/orders`, `/profile`, `/cart` using A's token with B's identifiers (where routes accept ids or the session header).
- [ ] Changing `x-test-session-id` to another user's session doesn't grant access to their data.
- [ ] Mass assignment: `POST /register` with extra fields (`role: 'admin'`, `isAdmin: true`) → those fields are ignored and not reflected in `/profile` (BOPLA, `@owasp-api3`).

### US-AF-923: Injection & XSS (1 SP)
- [ ] API — `Test_004_InjectionPayloads.spec.ts`: SQL, NoSQL (`{"$gt": ""}`), command and path-traversal payloads in `search`, `username`, `fullName`, `bookId` → 4xx or harmless 200; **never 5xx**, no stack traces.
- [ ] UI — `ui/Security/Test_001_StoredXss.spec.ts`: register with `fullName = <img src=x onerror="window.__xss=1">`, open the profile page, then assert `await page.evaluate(() => (window as any).__xss)` is `undefined` and the text renders escaped.
- [ ] UI: reflected-XSS attempt via the search query string → not executed.

### US-AF-924: File upload (1 SP) — `Test_005_AvatarUploadSecurity.spec.ts`
Reuse the existing `test-data/ui/Profile/` assets and add new ones:
- [ ] Executable content with a `.png` extension (MIME spoofing) → rejected.
- [ ] SVG containing `<script>` → rejected or served with `Content-Type` that prevents execution, plus `X-Content-Type-Options: nosniff`.
- [ ] Oversize file → 413 or 4xx (re-use `large_image.png`).
- [ ] Path-traversal filename (`../../evil.png`) → stored name sanitized; the `/uploads/...` URL doesn't escape the uploads dir.

### US-AF-925: Transport, headers, cookies, CORS (0.5 SP) — `Test_006_SecurityHeadersAndCors.spec.ts`
- [ ] Helmet baseline on API and frontend responses: `Content-Security-Policy` (frontend/nginx — likely missing → finding), `Strict-Transport-Security` (STAGING only, HTTPS), `X-Content-Type-Options: nosniff`, `X-Frame-Options` or `frame-ancestors`, `Referrer-Policy`; `X-Powered-By` absent.
- [ ] Auth cookies: `HttpOnly`, `SameSite`, `Secure` (STAGING).
- [ ] CORS: `Origin: https://evil.example` preflight → not reflected in `Access-Control-Allow-Origin`; allowed origin works.

### US-AF-926: CSRF, rate limiting, leakage (1 SP)
- [ ] `Test_007_CsrfEnforcement.spec.ts`:
  - With `x-enforce-csrf: true` and no token → state-changing `POST /cart` rejected (403).
  - With a token from `GET /api/csrf-token` (cookie + `x-csrf-token` header) → accepted.
  - **Finding test**: without enforcement, sending only `x-bypass-rate-limit: true` skips CSRF (per `app.ts`). Assert the current behaviour and mark it `test.fail()` with a "should be rejected in production builds" note. Record it in `docs/intentional_bugs.md` if it's intentional, otherwise file an issue in `buggy-books`.
- [ ] `Test_008_BruteForceRateLimit.spec.ts`: without the bypass header, >600 requests/min to `/api/login` returns 429 with a `Retry-After` / `RateLimit-*` header. Runs on DOCKER only, tagged `@slow`. Excluded from the PR gate; nightly only.
- [ ] `Test_009_InformationLeakage.spec.ts`: 404 and 500-inducing requests return no stack traces, file paths or framework versions; `/api/metrics` exposes no secrets or env values.

### US-AF-927: Docs & catalog (0.5 SP)
- [ ] Complete `docs/security/security_testing_guide.md`: scope guard, fixture usage, OWASP mapping table, how to add a test, and how findings are triaged (issue in buggy-books vs intentional-bug entry).
- [ ] Add all `SEC-*` entries to **both** catalogs with OWASP tags.

---

## 3. Verification Commands

```bash
docker compose -f infra/docker-compose.test.yml up -d --wait
cd playwright-e2e
ENV=DOCKER npm run test:security -- --repeat-each=3
ENV=DOCKER npx playwright test --grep @security --list --config=src/config/playwright.config.ts | tail -1   # ≥ 30
ENV=STAGING npx playwright test src/tests/api/Security/Test_006_SecurityHeadersAndCors.spec.ts --config=src/config/playwright.config.ts
npm run test:verify-catalog
```

---

## 4. Code Review Checklist

- [ ] Attack tests use `securityApi` (no bypass headers); a lint rule or code search confirms it.
- [ ] Payload tests skip unless `ENV=DOCKER`.
- [ ] XSS payloads are inert markers (`window.__xss`), never real exfiltration.
- [ ] Each `test.fail()` links to an intentional-bug section or an issue.
- [ ] No duplication with the 8.2 auth matrix (reference instead).
- [ ] OWASP tags present on every test; catalog entries match exactly in both files.
- [ ] Rate-limit test is excluded from the PR gate (tag `@slow`).

---

## 5. Definition of Done

- [ ] ≥ 30 `@security` tests green 3× on DOCKER (expected failures documented).
- [ ] Findings triaged and filed.
- [ ] Nightly workflow runs `test:security`; results visible in Allure under a "Security" suite/epic.
- [ ] Guide and catalogs complete.

---

## 6. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `src/core/base/security.fixture.ts` | `securityApi` fixture |
| `src/tests/api/Security/Test_002…Test_009*.spec.ts` | API AppSec specs |
| `src/tests/ui/Security/Test_001_StoredXss.spec.ts` | UI XSS spec |
| `src/test-data/security/*` | Payload files (SVG, spoofed PNG, etc.) |
| `docs/security/security_testing_guide.md` | Completed guide |
