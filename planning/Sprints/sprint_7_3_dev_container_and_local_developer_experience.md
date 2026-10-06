# Sprint 7.3: Dev Container & Local Developer Experience

**Navigation**: [⬅️ Previous: Sprint 7.2](sprint_7_2_test_data_engineering_and_typed_configuration.md) | [🗺️ Planning Hub](../README.md) | [Phase 7](../Phases/phase_7_hermetic_environments_test_data_and_developer_experience.md) | [Next: Sprint 8.1 ➡️](sprint_8_1_typed_api_client_layer_and_schema_validation.md)

**Sprint Identifier**: `SPRINT-7.3-DEV-CONTAINER-AND-LOCAL-DX`  
**Phase Mapping**: [Phase 7](../Phases/phase_7_hermetic_environments_test_data_and_developer_experience.md)  
**Estimated Velocity**: 4 Story Points  
**Sprint Status**: Done  
**Branch**: `feat/sprint-7.3-devcontainer`  
**Depends On**: Sprint 7.1  
**Sprint Goal**: Zero-to-green in 10 minutes: a dev container with every tool preinstalled, a task runner for common workflows, and an on-demand Testcontainers mode for local runs.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Responsibilities | Status |
| :--- | :--- | :---: |
| **DevOps Engineer** | Dev container image, features, Taskfile, root npm script mirrors | `DONE` |
| **Playwright QA Lead** | Testcontainers global setup and teardown | `DONE` |
| **SDET Architect** | Onboarding guide, code review checklist, review | `DONE` |

---

## 2. Sprint Backlog & User Stories

### US-AF-731: Dev container (1.5 SP)
- [x] `.devcontainer/devcontainer.json` + `.devcontainer/Dockerfile`:
  - Base: `mcr.microsoft.com/devcontainers/typescript-node:24`.
  - Features: `docker-in-docker`, `java:17` (Temurin), `github-cli`.
  - Dockerfile installs **Google Chrome stable** (`google-chrome-stable` repo + `npx playwright install-deps chrome`), JMeter 5.6.3 (to `/opt/jmeter`, on `PATH`), k6 (official apt repo), Allure CLI (`/opt/allure`, on `PATH`), and go-task (`/usr/local/bin/task`).
  - `postCreateCommand`: `npm ci && npx husky`.
  - `forwardPorts`: 4000, 5173, 3000 (Grafana, Phase 11), 9090 (Prometheus).
  - VS Code extensions: Playwright, ESLint, Prettier, YAML, GitHub Actions, Docker, Task.
- [x] Note in the README: free GitHub Codespaces quota (personal accounts get 60 hours/month free allowance) is enough for regular use.

### US-AF-732: Task runner (1 SP)
- [x] `Taskfile.yml` ([go-task](https://taskfile.dev), single binary, also installed in the dev container). Mirror each task as a root npm script for people without `task`.

  | Task | Does | Status |
  | :--- | :--- | :---: |
  | `env:up` / `env:down` / `env:logs` | Compose up (wait) / down -v / tail logs | ✅ Wired & Mirrored |
  | `test:pr` | lint + typecheck + catalog + DOCKER smoke (what the PR gate does) | ✅ Wired & Mirrored |
  | `test:pw` / `test:selenium` / `test:wdio` | Full suite per framework on DOCKER | ✅ Wired & Mirrored |
  | `perf:smoke` / `perf:jmeter` | k6 smoke / JMeter catalog plan headless on DOCKER | ✅ Wired & Mirrored |
  | `report:allure` | Generate and open the Playwright Allure report | ✅ Wired & Mirrored |
  | `security:scan` | gitleaks + osv-scanner locally (`scripts/run-security-scan.js`) | ✅ Wired & Mirrored |

### US-AF-733: Testcontainers mode (1 SP)
- [x] `playwright-e2e/src/config/global-setup.ts`: when `ENV=DOCKER` and `BUGGYBOOKS_AUTOSTART=true`, use `testcontainers` (`DockerComposeEnvironment`) to start `infra/docker-compose.test.yml` and wait for health. `global-teardown.ts` stops it.
- [x] Skip autostart when the ports already respond (reuse an `env:up` stack).
- [x] Windows note: requires Docker Desktop running; documented in `docs/onboarding.md` and runtime log warning.
- [x] Wired in `playwright.config.ts` (`globalSetup` and `globalTeardown`).
- [x] Pinned `testcontainers` as `devDependency` only in `playwright-e2e`, strictly guarded from CI execution.

### US-AF-734: Onboarding guide (0.5 SP)
- [x] `docs/onboarding.md`: three paths (Codespaces / local dev container / bare-metal), a first-run checklist, troubleshooting (ports busy, Docker not running, Chrome channel missing, Render cold start for STAGING).
- [x] Root README "Quick Start" points to it.

---

## 3. Verification Commands

```bash
# In VS Code: "Dev Containers: Rebuild and Reopen in Container", then:
google-chrome --version && java -version && jmeter --version && k6 version && allure --version
task env:up && task test:pr && task env:down
cd playwright-e2e && ENV=DOCKER BUGGYBOOKS_AUTOSTART=true npx playwright test --grep @smoke --config=src/config/playwright.config.ts
```

---

## 4. Code Review Checklist

- [x] The dev container uses **Google Chrome**, not just bundled Chromium (policy).
- [x] Tool versions pinned (JMeter 5.6.3, k6, Allure 2.34.1, Task 3.42.1) and match CI.
- [x] Testcontainers is a devDependency only and is never triggered in CI (CI uses the composite action).
- [x] Taskfile tasks and npm scripts stay in sync (100% parity across `env:*`, `test:*`, `perf:*`, `report:*`, `security:*`).

---

## 5. Definition of Done

- [x] Dev container builds from scratch in < 10 min; `task test:pr` green inside it.
- [x] Testcontainers autostart works on Linux/macOS and Windows + Docker Desktop.
- [x] Onboarding doc reviewed by following it on a clean machine or Codespace.

---

## 6. Deliverables Summary

| Artifact | Description | Status |
| :--- | :--- | :---: |
| `.devcontainer/devcontainer.json`, `.devcontainer/Dockerfile` | One-click environment | Completed |
| `Taskfile.yml` (+ npm script mirrors) | Common workflows | Completed |
| `playwright-e2e/src/config/global-setup.ts`, `global-teardown.ts` | Testcontainers autostart | Completed |
| `docs/onboarding.md` | Zero-to-green guide | Completed |
