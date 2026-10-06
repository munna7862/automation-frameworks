# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 7.3 — Dev Container & Local Developer Experience

**Sprint Identifier**: `SPRINT-7.3-DEV-CONTAINER-AND-LOCAL-DX`  
**Phase**: Phase 7 (Hermetic Environments, Test Data & Developer Experience)  
**Story Points**: 4 SP  
**Branch**: `feat/sprint-7.3-devcontainer`  
**Goal**: Zero-to-green in 10 minutes: a dev container with every tool preinstalled, a task runner for common workflows, and an on-demand Testcontainers mode for local runs.

---

## 1. Persona Roles & Ownership Matrix

| Persona                | Role Assignment              | Responsibilities for this Sprint                                                                                                                     | Status    |
| :--------------------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**       | `role-scrum-master`          | Sprint kick-off, DoR verification, DoD audit, and velocity tracking.                                                                                 | `ACTIVE`  |
| **SDET Architect**     | `role-sdet-architect`        | Architecture review, dual-catalog check, onboarding guide authorship (`docs/onboarding.md`), code review checklist.                                  | `ACTIVE`  |
| **DevOps Engineer**    | `role-devops-engineer`       | Dev container specification (`.devcontainer/devcontainer.json`, `.devcontainer/Dockerfile`), Taskfile (`Taskfile.yml`), and root npm script mirrors. | `ACTIVE`  |
| **Playwright QA Lead** | `role-playwright-automation` | Testcontainers global setup (`global-setup.ts`) and teardown (`global-teardown.ts`) integration in `playwright-e2e`.                                 | `ACTIVE`  |
| **Product Owner**      | Human Tech Lead (`User`)     | Backlog prioritization, final PR review & merge.                                                                                                     | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-731: Dev Container (1.5 SP)

- [x] **US-AF-731.1** (`DevOps Engineer`): Author `.devcontainer/Dockerfile` based on `mcr.microsoft.com/devcontainers/typescript-node:24` installing Google Chrome stable, Apache JMeter 5.6.3 (`/opt/jmeter`), k6 (official repo), Allure CLI (`/opt/allure`), and `go-task` binary (`/usr/local/bin/task`).
- [x] **US-AF-731.2** (`DevOps Engineer`): Author `.devcontainer/devcontainer.json` configuring `docker-in-docker:2`, `java:17` (Temurin), `github-cli:1` features, `forwardPorts` (4000, 5173, 3000, 9090), `postCreateCommand` (`npm ci && npx husky`), and VS Code extensions.
- [x] **US-AF-731.3** (`DevOps Engineer`): Document GitHub Codespaces monthly free quota note in `README.md`.

### US-AF-732: Task Runner (`Taskfile.yml` & Root NPM Mirrors) (1.0 SP)

- [x] **US-AF-732.1** (`DevOps Engineer`): Author `Taskfile.yml` with tasks: `env:up`, `env:down`, `env:logs`, `test:pr`, `test:pw`, `test:selenium`, `test:wdio`, `perf:smoke`, `perf:jmeter`, `report:allure`, `security:scan`.
- [x] **US-AF-732.2** (`DevOps Engineer`): Mirror all `Taskfile.yml` tasks into root `package.json` scripts (`env:up`, `env:down`, `env:logs`, `test:pr`, `test:pw`, `test:selenium`, `test:wdio`, `perf:jmeter`, `report:allure`, `security:scan`) ensuring parity for developers without `task`.
- [x] **US-AF-732.3** (`DevOps Engineer`): Verify `cross-env` support and task execution parity.

### US-AF-733: Testcontainers Mode (1.0 SP)

- [x] **US-AF-733.1** (`Playwright QA Lead`): Install `testcontainers` as `devDependency` in `playwright-e2e` workspace.
- [x] **US-AF-733.2** (`Playwright QA Lead`): Author `playwright-e2e/src/config/global-setup.ts` to spin up `infra/docker-compose.test.yml` via `DockerComposeEnvironment` only when `ENV=DOCKER` and `BUGGYBOOKS_AUTOSTART=true` (guarded from triggering in CI).
- [x] **US-AF-733.3** (`Playwright QA Lead`): Implement port probe in `global-setup.ts` to skip autostart if ports 4000 and 5173 are already responding (reusing existing `env:up` stack).
- [x] **US-AF-733.4** (`Playwright QA Lead`): Author `playwright-e2e/src/config/global-teardown.ts` to cleanly stop containers when started by testcontainers.
- [x] **US-AF-733.5** (`Playwright QA Lead`): Wire `globalSetup` and `globalTeardown` in `playwright-e2e/src/config/playwright.config.ts`.

### US-AF-734: Onboarding Guide & Zero-to-Green Documentation (0.5 SP)

- [x] **US-AF-734.1** (`SDET Architect`): Author comprehensive zero-to-green onboarding guide in `docs/onboarding.md` covering the three setup paths (Codespaces, Local Dev Container, Bare-metal).
- [x] **US-AF-734.2** (`SDET Architect`): Document first-run checklist and troubleshooting (busy ports, Docker daemon not running, Google Chrome channel missing, Render staging cold starts).
- [x] **US-AF-734.3** (`SDET Architect`): Update root `README.md` Quick Start and prerequisites pointing to `docs/onboarding.md`.

### Verification, DoD & Release Protocol

- [x] **US-AF-730.1** (`Scrum Master`): Verify Pre-Flight Definition of Ready (DoR).
- [x] **US-AF-730.2** (`SDET Architect`): Perform Code Review Checklist and Code Acceptance Review.
- [x] **US-AF-730.3** (`Scrum Master`): Verify 4-Point Definition of Done (DoD).
- [x] **US-AF-730.4** (`DevOps Engineer`): Execute PR release lifecycle with conventional commit and GitHub CLI.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role              | Review Feedback & Comments                                                                                                                                                                                               | Gate Status  |
| :------------------------------- | :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------: |
| **Pre-Flight Architecture Gate** | SDET Architect           | Dev container specification, Taskfile schema, Testcontainers autostart, and onboarding paths verified and approved.                                                                                                      | `[APPROVED]` |
| **Code Acceptance Review Gate**  | SDET Architect           | Single-browser Google Chrome policy enforced; tool versions pinned (JMeter 5.6.3, Allure 2.34.1, Task 3.42.1); Testcontainers is devDependency only and disabled in CI; Taskfile tasks and npm scripts have 100% parity. | `[APPROVED]` |
| **Scrum Master DoD Gate**        | Scrum Master             | All 4 DoD criteria verified: lint 0 errors across 7 workspaces; typecheck 0 errors; dual-catalog parity verified; documentation complete.                                                                                | `[APPROVED]` |
| **DevOps Release Gate**          | DevOps Engineer          | Workspaces clean; git hygiene confirmed; conventional commits formatted; ready for PR submission.                                                                                                                        | `[APPROVED]` |
| **Final Human Sign-Off**         | Human Tech Lead (`User`) | Final PR review and merge to `main`.                                                                                                                                                                                     |  `STANDBY`   |

---

## 4. Definition of Done (DoD) Checklist

- [x] Dev container configuration (`.devcontainer/devcontainer.json` & `.devcontainer/Dockerfile`) created with all pinned tools (Node 24, Chrome stable, JMeter 5.6.3, k6, Allure CLI, Task).
- [x] `Taskfile.yml` and root `package.json` scripts are in 100% sync.
- [x] `playwright-e2e` `global-setup.ts` and `global-teardown.ts` support `BUGGYBOOKS_AUTOSTART=true` on `ENV=DOCKER`, reuse existing running stacks, and are strictly disabled in CI.
- [x] `docs/onboarding.md` created and linked from root `README.md`.
- [x] `npm run lint:all` and `npm run typecheck:all` exit 0 across all workspaces.
- [x] `npm run test:verify-catalog` exits 0 (dual-catalog parity).
- [x] PR created with structured summary, test verification evidence, and all CI checks green: [PR #43](https://github.com/munna7862/automation-frameworks/pull/43) (14/14 CI checks passing).

---

## 5. Verification & Execution Evidence

```bash
# 1. Dual-Catalog Parity: 182/182 test cases verified
npm run test:verify-catalog
# Output: ✅ PARITY VERIFIED: Both catalogs are 100% character-for-character identical.

# 2. Monorepo Static Typechecking: 7/7 workspaces clean
npm run typecheck:all
# Output: @automationframeworks/playwright-utils, @automationframeworks/test-data, playwright-e2e, selenium-e2e, wdio-e2e, mobile-automation all exit 0

# 3. Monorepo Linting: 7/7 workspaces clean
npm run lint:all
# Output: All workspaces exit 0 with 0 errors and 0 warnings

# 4. Playwright Test Discovery with Global Setup & Teardown
cross-env ENV=DOCKER BASE_URL=http://localhost:5173 API_BASE_URL=http://localhost:4000 npx playwright test --list --config=src/config/playwright.config.ts
# Output: Total: 110 tests in 30 files (Google Chrome UI + API only)

# 5. Test Data Package Unit Tests
npx tsx --test packages/test-data/src/test-data.test.ts
# Output: 14/14 tests pass (0 failures)

# 6. Local Security Scanner Runner
node scripts/run-security-scan.js
# Output: Gitleaks and OSV scanner runners executed cleanly

# 7. GitHub Actions CI Checks (PR #43)
gh pr checks 43
# Output: 14/14 checks pass
# - Actionlint Workflow Linter: pass
# - CodeQL: pass
# - CodeQL Analysis (JavaScript / TypeScript): pass
# - Conventional Commits Validation: pass
# - Dependency Review (PR Gate): pass
# - Gitleaks Secret Detection: pass
# - License Compliance, Audit & SBOM: pass
# - OSV Vulnerability Scanner: pass
# - Smoke Tests (Chrome UI + API): pass
# - Static Quality & Linting: pass
# - Zizmor Workflow Security Audit: pass
# - k6 Performance & Drift Gate: pass
# - osv-scanner: pass
# - zizmor: pass
```
