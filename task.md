# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 8.3 — OpenAPI Specification & Contract Testing

**Sprint Identifier**: `SPRINT-8.3-OPENAPI-AND-CONTRACT-TESTING`  
**Phase**: Phase 8 (API Depth: Typed Clients, Schemas & Contracts)  
**Story Points**: 4 SP  
**Branch**: `feat/sprint-8.3-contract-testing`  
**Goal**: Produce an OpenAPI 3.1 specification from zod schemas, fuzz the API with Schemathesis, and implement consumer-driven contract testing with Pact (file-based, no paid broker).

---

## 1. Persona Roles & Ownership Matrix

| Persona                | Role Assignment              | Responsibilities for this Sprint                                                                                              | Status    |
| :--------------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**       | `role-scrum-master`          | Sprint planning, `task.md` governance, DoR verification, DoD auditing, velocity accounting.                                   | `ACTIVE`  |
| **SDET Architect**     | `role-sdet-architect`        | OpenAPI route registry design, contract testing strategy, dual-catalog sync (`CT-*` IDs), and architecture review.            | `ACTIVE`  |
| **Playwright QA Lead** | `role-playwright-automation` | OpenAPI generator implementation, Pact consumer test suite, Pact provider verification with state handlers.                   | `ACTIVE`  |
| **DevOps Engineer**    | `role-devops-engineer`       | Schemathesis fuzzing workflow (`api-fuzz.yml`), contract testing workflow (`contract-tests.yml`), CI drift gates, PR release. | `ACTIVE`  |
| **Product Owner**      | Human Tech Lead (`User`)     | Backlog prioritization, sprint kickoff, and final PR review & merge.                                                          | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-831: OpenAPI 3.1 from zod (1.5 SP)

- [x] **US-AF-831.1** (`SDET Architect`): Design OpenAPI 3.1 registry structure covering all 23 routed endpoints from `docs/api/routes.json`, security schemes (`bearerAuth`, cookie auth), parameters, and error envelopes.
- [x] **US-AF-831.2** (`Playwright QA Lead`): Implement `scripts/generate-openapi.ts` using `@asteasolutions/zod-to-openapi` generating `docs/api/openapi.yaml` and standalone Redoc portal documentation.
- [x] **US-AF-831.3** (`DevOps Engineer`): Wire `npm run openapi:generate`, `npm run openapi:lint`, `npm run openapi:docs` into root `package.json` and add OpenAPI drift gate to `.github/workflows/pr-gate.yml`.

### US-AF-832: Schemathesis Property-Based Fuzzing (1 SP)

- [x] **US-AF-832.1** (`SDET Architect`): Define Schemathesis fuzzing strategy (exclude chaos `/test/*` routes, bypass rate limit/CSRF headers, seed auth token).
- [x] **US-AF-832.2** (`DevOps Engineer`): Implement `.github/workflows/api-fuzz.yml` (nightly + workflow_dispatch) running Schemathesis container against ephemeral BuggyBooks (`ENV=DOCKER`) and publishing JUnit reports.
- [x] **US-AF-832.3** (`SDET Architect`): Document Schemathesis triage baseline and register fuzzing contract test case in dual catalogs.

### US-AF-833: Pact Consumer-Driven Contracts (1.5 SP)

- [x] **US-AF-833.1** (`SDET Architect`): Design consumer interactions (`buggybooks-web` consumer vs `buggybooks-api` provider) using Pact V3/V4 type matchers (`like`, `eachLike`, `regex`) for books, cart, auth, checkout, orders.
- [x] **US-AF-833.2** (`Playwright QA Lead`): Implement Pact consumer contract test suite in `playwright-e2e/contract-tests/consumer/` generating `playwright-e2e/contract-tests/pacts/buggybooks-web-buggybooks-api.json`.
- [x] **US-AF-833.3** (`Playwright QA Lead`): Implement Pact provider verification in `playwright-e2e/contract-tests/provider/` with state handlers using test-control endpoints (`/api/test/reset`, `/api/test/books/:id/stock`, seed user).
- [x] **US-AF-833.4** (`DevOps Engineer`): Add `.github/workflows/contract-tests.yml` (triggered on PR and nightly), wire scripts `test:contract`, `test:contract:consumer`, `test:contract:provider` into `playwright-e2e/package.json` and root `package.json`.
- [x] **US-AF-833.5** (`SDET Architect`): Author comprehensive contract testing guide `docs/contract_testing.md` and sync `CT-PACT-*` & `CT-FUZZ-*` test cases in dual catalogs.

### Traceability, DoD & Release Protocol

- [x] **US-AF-830.1** (`Scrum Master`): Verify Pre-Flight Definition of Ready (DoR) — staging probe passed, clean branch `feat/sprint-8.3-contract-testing`.
- [x] **US-AF-830.2** (`SDET Architect`): Maintain 100% lockstep parity across dual test case catalogs (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`).
- [x] **US-AF-830.3** (`SDET Architect`): Conduct Code Acceptance Review on all authored spec files, scripts, schemas, and contract tests.
- [x] **US-AF-830.4** (`Scrum Master`): Verify 4-Point Definition of Done (DoD) (lint: 0, typecheck: 0, 100% green pass, dual-catalog sync).
- [x] **US-AF-830.5** (`DevOps Engineer`): Execute PR release lifecycle with conventional commit and GitHub CLI.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role              | Review Feedback & Comments                                                         | Gate Status  |
| :------------------------------- | :----------------------- | :--------------------------------------------------------------------------------- | :----------: |
| **Pre-Flight Architecture Gate** | SDET Architect           | Verify OpenAPI schema mappings, Pact matcher designs, and DoR conditions.          | `[APPROVED]` |
| **Code Acceptance Review Gate**  | SDET Architect           | Verify Redocly clean lint, type matchers only, idempotent provider state handlers. | `[APPROVED]` |
| **Scrum Master DoD Gate**        | Scrum Master             | Audit lint, typecheck, contract pass rate, and catalog diff.                       | `[APPROVED]` |
| **DevOps Release Gate**          | DevOps Engineer          | Validate CI workflows (`api-fuzz.yml`, `contract-tests.yml`), PR creation.         | `[APPROVED]` |
| **Final Human Sign-Off**         | Human Tech Lead (`User`) | Final PR review and merge to `main`.                                               |  `STANDBY`   |

---

## 4. Definition of Done (DoD) Checklist

- [x] `docs/api/openapi.yaml` generated from Zod schemas, passes `npx @redocly/cli lint` with 0 errors.
- [x] OpenAPI drift gate enforced in PR Quality Gate.
- [x] Standalone Redoc HTML documentation generated in `AutomationReports/API-Docs/index.html`.
- [x] Schemathesis workflow `.github/workflows/api-fuzz.yml` configured against ephemeral DOCKER BuggyBooks backend.
- [x] Pact consumer tests generate valid contract JSON using flexible type matchers (`like`, `eachLike`, `regex`).
- [x] Pact provider verification runs cleanly with idempotent state handlers.
- [x] Workflow `.github/workflows/contract-tests.yml` created and verified.
- [x] Contract testing documentation authored in `docs/contract_testing.md`.
- [x] Dual-catalog parity confirmed: `npm run test:verify-catalog` exits 0.
- [x] `npm run lint:all` and `npm run typecheck:all` exit 0 across all workspaces.
- [x] PR opened with structured summary and verification evidence (`gh pr create`).

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Generate OpenAPI spec and verify drift
npx tsx scripts/generate-openapi.ts && git diff --exit-code docs/api/openapi.yaml

# Command 2: Lint OpenAPI spec
npx @redocly/cli lint docs/api/openapi.yaml

# Command 3: Run Pact consumer and provider tests
npm run test:contract --workspace=playwright-e2e

# Command 4: Dual-catalog parity check
npm run test:verify-catalog

# Command 5: Static analysis
npm run lint:all
npm run typecheck:all
```
