# Sprint 9.1: DAST Pipeline with OWASP ZAP

**Navigation**: [⬅️ Previous: Sprint 8.3](sprint_8_3_openapi_specification_and_contract_testing.md) | [🗺️ Planning Hub](../README.md) | [Phase 9](../Phases/phase_9_security_testing_dast_and_appsec.md) | [Next: Sprint 9.2 ➡️](sprint_9_2_appsec_security_test_suite.md)

**Sprint Identifier**: `SPRINT-9.1-DAST-PIPELINE-OWASP-ZAP`
**Phase Mapping**: [Phase 9](../Phases/phase_9_security_testing_dast_and_appsec.md)
**Estimated Velocity**: 4 Story Points
**Sprint Status**: Completed
**Branch**: `feat/sprint-9.1-dast-zap`
**Depends On**: Sprint 7.1 (DOCKER env), Sprint 8.3 (OpenAPI spec)
**Sprint Goal**: Run OWASP ZAP passive scans on every PR and active API scans nightly against the disposable BuggyBooks instance, with SARIF results in GitHub code scanning and managed risk acceptance.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **Security Test Engineer** (new) | ZAP configuration, rules triage, persona skill authoring |
| **DevOps Engineer** | Workflows, SARIF upload, portal publishing |
| **SDET Architect** | Review risk acceptances |

---

## 2. Sprint Backlog & User Stories

### US-AF-911: Security persona & guide (0.5 SP)
- [x] `.agents/skills/role-security-engineer/SKILL.md` following the existing persona format: responsibilities, scope guard, tools (ZAP, Playwright `@security`, Phase 6 scanners), review checklist, OWASP mapping rules.
- [x] AGENTS.md §7: add the 8th persona; `planning/README.md` team matrix updated.
- [x] `docs/security/security_testing_guide.md` skeleton (completed in 9.2).

### US-AF-912: ZAP baseline on PR (1.5 SP)
- [x] `.github/workflows/security-dast.yml`, job `zap-baseline` (on `pull_request` to main):
  - `buggybooks-up` composite action (DOCKER).
  - **Target guard** step: fail unless the target matches `^http://localhost(:\d+)?/`.
  - `zaproxy/action-baseline` (SHA-pinned) against `http://localhost:5173` with `-a` (include alpha passive rules), `rules_file_name: security/zap-rules.tsv`, `allow_issue_writing: false`, `fail_action: true`.
  - Convert to SARIF (ZAP's `-J` JSON → SARIF via a small script `scripts/zap-to-sarif.js`, or use ZAP's built-in SARIF report template), then `github/codeql-action/upload-sarif` with `category: zap-baseline`.
  - Upload the HTML report as an artifact.
- [x] `security/zap-rules.tsv`: start empty (all WARN), then after the first run set the true positives to `FAIL` and the accepted ones to `IGNORE`, with a justification comment and review date.

### US-AF-913: ZAP API active scan nightly (1.5 SP)
- [x] Job `zap-api-scan` (schedule nightly + `workflow_dispatch`):
  - `zaproxy/action-api-scan` with `target: docs/api/openapi.yaml`, `format: openapi`, and a context or replacer config to add `Authorization: Bearer <token>` (token obtained by a pre-step that logs in a seeded user) **and no bypass headers**.
  - Exclude `/api/test/*` endpoints (`-c` config with exclusion regex) so the scanner can't reset or alter chaos state mid-scan.
  - SARIF upload (`category: zap-api`), HTML report published to the portal at `AutomationReports/Security/ZAP/<run>/`.
- [x] Optional: a ZAP-as-proxy job that drives the Playwright `@smoke` journeys through ZAP (`use.proxy = { server: 'http://localhost:8090' }`) for an authenticated passive crawl. Behind the `zap_proxy_crawl` dispatch input.

### US-AF-914: Portal & docs integration (0.5 SP)
- [x] `scripts/generate-portal-metadata.js`: add a "Security" card (last ZAP run date, High/Medium/Low counts, link).
- [x] `docs/security/repo_security_controls.md` (from 6.3): add the DAST rows.

---

## 3. Verification Commands

```bash
docker compose -f infra/docker-compose.test.yml up -d --wait
docker run --rm --network host -v "$PWD/security:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t http://localhost:5173 -c zap-rules.tsv -r zap-baseline.html -J zap-baseline.json -a
docker run --rm --network host -v "$PWD:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable \
  zap-api-scan.py -t /zap/wrk/docs/api/openapi.yaml -f openapi -r zap-api.html
gh workflow run security-dast.yml
```

---

## 4. Code Review Checklist

- [x] The target guard is present and runs **before** any ZAP step.
- [x] No bypass headers in the ZAP API scan configuration.
- [x] `/api/test/*` excluded from the active scan.
- [x] Every `IGNORE` rule has a justification and review date.
- [x] SARIF categories distinct (`zap-baseline`, `zap-api`) so they don't overwrite each other or CodeQL.
- [x] Actions SHA-pinned, permissions minimal (`security-events: write` only on upload jobs).

---

## 5. Definition of Done

- [x] Baseline runs on the sprint PR and passes (or fails only on documented true positives filed as issues).
- [x] Nightly API scan completes; report on the portal; SARIF visible in code scanning.
- [x] Security persona skill and guide merged.

---

## 6. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `.github/workflows/security-dast.yml` | ZAP baseline + API scan |
| `security/zap-rules.tsv`, `security/zap-api-context.*` | Rules and scan context |
| `scripts/zap-to-sarif.js` (if needed) | Report conversion |
| `.agents/skills/role-security-engineer/SKILL.md` | New persona |
| `docs/security/security_testing_guide.md` | Guide (skeleton) |
