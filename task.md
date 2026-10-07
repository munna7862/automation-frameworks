# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 9.1 — DAST Pipeline with OWASP ZAP

**Sprint Identifier**: `SPRINT-9.1-DAST-PIPELINE-OWASP-ZAP`  
**Phase**: Phase 9 (Security Testing: DAST & AppSec)  
**Story Points**: 4 SP  
**Branch**: `feat/sprint-9.1-dast-zap`  
**Goal**: Run OWASP ZAP passive scans on every PR and active API scans nightly against the disposable BuggyBooks instance, with SARIF results in GitHub code scanning and managed risk acceptance.

---

## 1. Persona Roles & Ownership Matrix

| Persona                    | Role Assignment          | Responsibilities for this Sprint                                                                | Status    |
| :------------------------- | :----------------------- | :---------------------------------------------------------------------------------------------- | :-------- |
| **Scrum Master**           | `role-scrum-master`      | Sprint planning, `task.md` governance, DoR verification, DoD auditing, velocity accounting.     | `ACTIVE`  |
| **Security Test Engineer** | `role-security-engineer` | ZAP configuration, rules file triage, persona skill authoring, security testing guide skeleton. | `ACTIVE`  |
| **SDET Architect**         | `role-sdet-architect`    | Risk acceptance review, dual-catalog sync (`DAST-ZAP-*`), architecture alignment.               | `ACTIVE`  |
| **DevOps Engineer**        | `role-devops-engineer`   | GitHub Actions DAST workflow (`security-dast.yml`), SARIF upload, portal metadata integration.  | `ACTIVE`  |
| **Product Owner**          | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge.                            | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-911: Security Persona & Testing Guide (0.5 SP)

- [x] **US-AF-911.1** (`Security Test Engineer`): Author `.agents/skills/role-security-engineer/SKILL.md` following standard persona structure: responsibilities, scope guard, tools (ZAP, Playwright `@security`, Phase 6 scanners), code review checklist, OWASP mapping rules.
- [x] **US-AF-911.2** (`SDET Architect`): Update `AGENTS.md` §7 to register the 8th persona (`role-security-engineer`); update `planning/README.md` team matrix and architecture diagram.
- [x] **US-AF-911.3** (`Security Test Engineer`): Author `docs/security/security_testing_guide.md` skeleton covering scope guard, DAST architecture, manual verification commands, and triage procedures.

### US-AF-912: ZAP Baseline Passive Scan on PR (1.5 SP)

- [x] **US-AF-912.1** (`Security Test Engineer`): Create `security/zap-rules.tsv` with baseline passive scan rule configurations, justifications, and review dates.
- [x] **US-AF-912.2** (`DevOps Engineer`): Author `scripts/zap-to-sarif.js` for converting ZAP JSON vulnerability output to standardized SARIF v2.1.0 format with rule descriptions, severity mapping, and artifact links.
- [x] **US-AF-912.3** (`DevOps Engineer`): Implement `zap-baseline` job in `.github/workflows/security-dast.yml` triggered on pull requests to `main`:
  - Ephemeral environment launch via `.github/actions/buggybooks-up`.
  - Target guard step enforcing `^http://localhost(:\d+)?/`.
  - SHA-pinned `zaproxy/action-baseline` execution against `http://localhost:5173` with `-a`, `rules_file_name: security/zap-rules.tsv`, `fail_action: true`.
  - SARIF conversion & upload via `github/codeql-action/upload-sarif` (`category: zap-baseline`).
  - Report upload as GitHub Actions artifact.
  - Ephemeral teardown via `.github/actions/buggybooks-down`.

### US-AF-913: ZAP API Active Scan Nightly (1.5 SP)

- [x] **US-AF-913.1** (`Security Test Engineer`): Author scan configuration and rule overrides in `security/zap-api-rules.tsv` and `security/zap-api-context.context` to exclude chaos `/api/test/*` routes and inject seeded JWT `Authorization: Bearer <token>` without any bypass headers (`x-bypass-rate-limit`, `x-bypass-csrf`).
- [x] **US-AF-913.2** (`DevOps Engineer`): Implement `zap-api-scan` job in `.github/workflows/security-dast.yml` triggered nightly at 04:00 UTC and on `workflow_dispatch`:
  - Target guard step enforcing `^http://localhost(:\d+)?/`.
  - Ephemeral environment setup & state reset.
  - Seeded authentication token acquisition (`admin` / `password123`) without bypass headers.
  - SHA-pinned `zaproxy/action-api-scan` targeting `docs/api/openapi.yaml` with `-f openapi`, excluded regex `^/api/test/`, custom rules, and bearer token replacer.
  - SARIF upload via `github/codeql-action/upload-sarif` (`category: zap-api`).
  - Report artifact upload & stage for portal at `AutomationReports/Security/ZAP/latest/`.
  - Teardown & state reset.
- [x] **US-AF-913.3** (`DevOps Engineer`): Add optional `zap-proxy-crawl` job triggered via `zap_proxy_crawl` dispatch input.

### US-AF-914: Portal & Documentation Integration (0.5 SP)

- [x] **US-AF-914.1** (`DevOps Engineer`): Update `scripts/generate-portal-metadata.js` to aggregate security metrics (last ZAP run date, severity breakdown, links) and display the Security Quality card on the executive portal; update `docs/portal/index.html` and `scripts/test-portal.js` for 7 interactive framework cards.
- [x] **US-AF-914.2** (`Security Test Engineer`): Update `docs/security/repo_security_controls.md` with DAST governance rows (ZAP baseline, ZAP API scan, rules review, scope guard).
- [x] **US-AF-914.3** (`SDET Architect`): Add `DAST-ZAP-001` and `DAST-ZAP-002` to both catalogs (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`) in 100% lockstep parity and verify via `npm run test:verify-catalog`.
- [x] **US-AF-914.4** (`Scrum Master`): Update sprint status in `planning/README.md`, `planning/Sprints/sprint_9_1_dast_pipeline_with_owasp_zap.md`, and Phase 9 overview.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role     | Review Feedback & Comments                                                                                   | Gate Status |
| :------------------------------- | :-------------- | :----------------------------------------------------------------------------------------------------------- | :---------: |
| **Pre-Flight Architecture Gate** | SDET Architect  | Verified DoR: DOCKER env ready, openapi.yaml generated, branch feat/sprint-9.1-dast-zap.                     | `[PASSED]`  |
| **Code Acceptance Review Gate**  | SDET Architect  | Enforce scope guard (localhost only), no bypass headers in API scan, chaos route exclusion.                  | `[PASSED]`  |
| **Scrum Master DoD Gate**        | Scrum Master    | 4-point DoD: static analysis clean, catalog parity clean, SARIF schema valid, docs sync.                     | `[PASSED]`  |
| **DevOps Release Gate**          | DevOps Engineer | Workflow syntax valid, action pinning verified, gh pr created with verification proofs, all CI checks green. | `[PASSED]`  |
| **Final Human Sign-Off**         | Human Tech Lead | Final PR review and merge to main.                                                                           | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `npm run lint:all` and `npm run typecheck:all` pass across all workspaces with 0 errors.
- [x] Target guard step verified: fails immediately if target is not `^http://localhost(:\d+)?/`.
- [x] ZAP baseline workflow configured with SHA-pinned actions, `-a`, `zap-rules.tsv`, and SARIF upload.
- [x] ZAP API scan excludes `/api/test/*` and injects seed auth token without bypass headers.
- [x] Distinct SARIF categories (`zap-baseline`, `zap-api`) prevent collision with CodeQL or OSV.
- [x] `security/zap-rules.tsv` and `security/zap-api-rules.tsv` document rule levels with review dates.
- [x] Dual-catalog parity confirmed: `npm run test:verify-catalog` exits 0.
- [x] Portal metadata script produces security card metrics and `npm run test:portal` passes across desktop and mobile.
- [x] Documentation updated (`repo_security_controls.md`, `security_testing_guide.md`, `AGENTS.md`, `planning/README.md`, `phase_9_security_testing_dast_and_appsec.md`).
- [x] Pull request opened with structured summary and verification evidence: PR [#48](https://github.com/munna7862/automation-frameworks/pull/48).

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
npm run test:verify-catalog

# Command 2: Static analysis
npm run lint:all; npm run typecheck:all

# Command 3: Portal metadata & portal integration test
node scripts/generate-portal-metadata.js
npm run test:portal

# Command 4: GitHub PR CI checks
gh pr checks 48
# All 14 checks passed green including ZAP Baseline Passive Scan, CodeQL, Smoke Tests, Linting
```
