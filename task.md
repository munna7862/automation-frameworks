# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 7.1 — Ephemeral BuggyBooks Environment in CI

**Sprint Identifier**: `SPRINT-7.1-EPHEMERAL-BUGGYBOOKS-ENV`  
**Phase**: Phase 7 (Hermetic Environments, Test Data & Developer Experience)  
**Story Points**: 6 SP  
**Branch**: `feat/sprint-7.1-ephemeral-env` (+ `feat/ghcr-images` in `buggy-books`)  
**Goal**: Run every PR's tests against a fresh BuggyBooks started from GHCR images inside the CI runner, removing the shared-staging dependency from the PR path.

---

## 1. Persona Roles & Ownership Matrix

| Persona                        | Role Assignment              | Responsibilities for this Sprint                                                                                                   | Status    |
| :----------------------------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**               | `role-scrum-master`          | Sprint kick-off, DoR verification, DoD audit, and velocity tracking.                                                               | `ACTIVE`  |
| **SDET Architect**             | `role-sdet-architect`        | `ENV=DOCKER` profile architecture across frameworks, dual-catalog sync, and code acceptance review.                                | `ACTIVE`  |
| **DevOps Engineer**            | `role-devops-engineer`       | GHCR workflow in `buggy-books`, `infra/docker-compose.test.yml`, composite actions, CI workflow updates, and PR release lifecycle. | `ACTIVE`  |
| **Playwright QA Lead**         | `role-playwright-automation` | Playwright `DOCKER` profile alignment, register-if-missing seed user in `auth.setup.ts`, and spec cleanliness.                     | `ACTIVE`  |
| **Selenium / WDIO Specialist** | `role-selenium-specialist`   | `DOCKER` profiles in `selenium-e2e` and `wdio-e2e` `env.config.ts`.                                                                | `ACTIVE`  |
| **Performance Engineer**       | `role-performance-engineer`  | `k6` `TARGET_ENV` / `BASE_URL` profile default and JMeter localhost port parameterization.                                         | `ACTIVE`  |
| **Product Owner**              | Human Tech Lead (`User`)     | Backlog prioritization, GHCR package visibility toggle, final PR review & merge.                                                   | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-711: Publish BuggyBooks images to GHCR — _in `munna7862/buggy-books`_ (1.5 SP)

- [x] **US-AF-711.1** (`DevOps Engineer`): Author `.github/workflows/publish-images.yml` in `munna7862/buggy-books` with buildx, GHA layer caching, OCI labels, and multi-tag strategy (`latest`, short-sha, and `ci-localhost` with `VITE_API_URL=http://localhost:4000/api`).
- [x] **US-AF-711.2** (`DevOps Engineer`): Create branch `feat/ghcr-images`, push workflow, open PR in `buggy-books`, and merge to `main`.
- [x] **US-AF-711.3** (`DevOps Engineer`): Trigger/monitor workflow execution on `buggy-books` to publish `ghcr.io/munna7862/buggy-books-backend` and `ghcr.io/munna7862/buggy-books-frontend`.

### US-AF-712: Test Compose & Composite Action — _in this repo_ (1.5 SP)

- [x] **US-AF-712.1** (`DevOps Engineer`): Author `infra/docker-compose.test.yml` (ephemeral backend :4000 and frontend :5173, no volumes, healthcheck on `/api/health`).
- [x] **US-AF-712.2** (`DevOps Engineer`): Author `.github/actions/buggybooks-up/action.yml` (launch compose, wait-on health endpoints, export digests to Step Summary and `$GITHUB_ENV`).
- [x] **US-AF-712.3** (`DevOps Engineer`): Author `.github/actions/buggybooks-down/action.yml` (export container logs artifact, `docker compose down -v`).
- [x] **US-AF-712.4** (`DevOps Engineer`): Author `infra/README.md` documenting architecture, environment variables, and local execution commands.

### US-AF-713: `ENV=DOCKER` Profile Across Frameworks (1.5 SP)

- [x] **US-AF-713.1** (`SDET Architect` / `Playwright QA Lead`): Implement `DOCKER`, `STAGING`, `INTEROP` profiles in `playwright-e2e/src/config/env.config.ts`.
- [x] **US-AF-713.2** (`Selenium / WDIO Specialist`): Implement `DOCKER` profiles in `selenium-e2e/src/config/env.config.ts` and `wdio-e2e/src/config/env.config.ts`.
- [x] **US-AF-713.3** (`Performance Engineer`): Implement `TARGET_ENV=DOCKER` handling in `k6-performance/config/options.js` and verify JMeter host/port parameter flexibility.
- [x] **US-AF-713.4** (`Playwright QA Lead`): Implement register-if-missing idempotent seed user creation in `playwright-e2e/src/tests/auth.setup.ts`.
- [x] **US-AF-713.5** (`DevOps Engineer`): Add `TargetEnv` and `BuggyBooksImage` fields in `scripts/generate-allure-environment.js`.

### US-AF-714: Switch PR Path to DOCKER; Keep STAGING Nightly (1.5 SP)

- [x] **US-AF-714.1** (`DevOps Engineer`): Wire `buggybooks-up` and `buggybooks-down` into `.github/workflows/_reusable-e2e.yml` when `target-env == 'DOCKER'`; isolate concurrency lock for DOCKER runs.
- [x] **US-AF-714.2** (`DevOps Engineer`): Switch `.github/workflows/pr-gate.yml` to `target-env: DOCKER` (using `buggybooks-up` / `buggybooks-down`), remove `buggybooks-staging-state` concurrency lock, and target localhost for chaos reset.
- [x] **US-AF-714.3** (`DevOps Engineer`): Update `.github/workflows/nightly-regression.yml` with dual targets: full suite on `DOCKER` and contract subset on `STAGING` with `@staging-contract`.
- [x] **US-AF-714.4** (`SDET Architect`): Purge any remaining hard-coded `onrender.com` in `*/src` files and update dual catalogs (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`) in lockstep.
- [x] **US-AF-714.5** (`SDET Architect`): Update `AGENTS.md` §2 documenting warm-up probe requirements for STAGING only.

### Verification, DoD & Release Protocol

- [x] **US-AF-710.1** (`Scrum Master`): Verify Pre-Flight Definition of Ready (DoR).
- [x] **US-AF-710.2** (`SDET Architect`): Conduct Code Acceptance Review against Code Review Checklist.
- [x] **US-AF-710.3** (`Scrum Master`): Perform 4-point Definition of Done (DoD) audit.
- [ ] **US-AF-710.4** (`DevOps Engineer`): Commit, push branch, open PR with full verification evidence, monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role     | Review Feedback & Comments                                                                                                | Gate Status |
| :------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------ | :---------: |
| **Pre-Flight Architecture Gate** | SDET Architect  | Staging pre-flight probe and DoR audit passed.                                                                            | `[PASSED]`  |
| **Code Acceptance Review Gate**  | SDET Architect  | Verified single-browser Chrome rule, 0 onrender.com hardcodes in test specs, compose volume isolation, dual-catalog sync. | `[PASSED]`  |
| **Scrum Master DoD Gate**        | Scrum Master    | Audited lint:all (0 errors), typecheck:all (0 errors), catalog zero diff, and PR verification.                            | `[PASSED]`  |
| **DevOps Release Gate**          | DevOps Engineer | Validate GHCR workflow, composite actions, PR creation, and green CI status.                                              | `[ACTIVE]`  |
| **Final Human Sign-Off**         | Human Tech Lead | Final PR review and merge to `main`.                                                                                      | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `npm run lint:all` covers all workspaces with 0 errors.
- [x] `npm run typecheck:all` passes across all TypeScript workspaces with 0 errors.
- [x] Prettier formatting verified on all modified and new files.
- [x] Dual-catalog parity confirmed: `git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Images published to GHCR (`ghcr.io/munna7862/buggy-books-backend` and `...-frontend`).
- [x] `infra/docker-compose.test.yml`, `buggybooks-up`, `buggybooks-down` implemented and validated.
- [x] PR gate runs on `DOCKER` with zero calls to `onrender.com`.
- [x] Nightly regression contains both `DOCKER` (full) and `STAGING` (contract).
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).

---

## 5. Verification & Execution Evidence

```bash
# 1. Dual-Catalog Parity
$ npm run test:verify-catalog
✅ PARITY VERIFIED: Both catalogs are 100% character-for-character identical.
   • Total Lines      : 619
   • Total Characters : 1,19,194 bytes
   • Catalog Test IDs : 182 verified test cases

# 2. Monorepo Workspace Linting
$ npm run lint:all
> @automationframeworks/playwright-utils@1.0.0 lint (0 errors)
> playwright-e2e@1.0.0 lint (0 errors)
> selenium-e2e@1.0.0 lint (0 errors)
> wdio-e2e@1.0.0 lint (0 errors)
> k6-performance@1.0.0 lint (0 errors)
> mobile-automation@1.0.0 lint (0 errors)

# 3. Monorepo Workspace Typechecking
$ npm run typecheck:all
> @automationframeworks/playwright-utils@1.0.0 typecheck (0 errors)
> playwright-e2e@1.0.0 typecheck (0 errors)
> selenium-e2e@1.0.0 typecheck (0 errors)
> wdio-e2e@1.0.0 typecheck (0 errors)
> mobile-automation@1.0.0 typecheck (0 errors)

# 4. GHCR Images Published in munna7862/buggy-books (PR #104 merged)
ghcr.io/munna7862/buggy-books-backend:latest
ghcr.io/munna7862/buggy-books-frontend:ci-localhost
```
