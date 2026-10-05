# Sprint 6.3: Supply-Chain & Repository Security

**Navigation**: [⬅️ Previous: Sprint 6.2](sprint_6_2_reusable_workflows_and_composite_actions.md) | [🗺️ Planning Hub](../README.md) | [Phase 6](../Phases/phase_6_cicd_integrity_and_supply_chain_security.md) | [Next: Sprint 6.4 ➡️](sprint_6_4_repository_governance_and_contributor_experience.md)

**Sprint Identifier**: `SPRINT-6.3-SUPPLY-CHAIN-AND-REPOSITORY-SECURITY`
**Phase Mapping**: [Phase 6](../Phases/phase_6_cicd_integrity_and_supply_chain_security.md)
**Estimated Velocity**: 5 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-6.3-supply-chain-security`
**Depends On**: Sprint 6.2 (SHA pinning, reusable layout)
**Sprint Goal**: Add free, GitHub-native security controls — SAST, secret scanning, dependency scanning, automated updates, workflow security linting, SBOM and license compliance — all with least-privilege permissions.

> All tools in this sprint are free for public repositories (CodeQL, Dependabot, secret scanning and push protection are free on public repos; gitleaks, osv-scanner, actionlint, zizmor and syft are OSS).

---

## 1. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **DevOps Engineer** | Workflows, Dependabot config, branch protection documentation |
| **SDET Architect** | Triage of first-run findings; risk-acceptance decisions |
| **All specialists** | Fix findings in their workspace |

---

## 2. Sprint Backlog & User Stories

### US-AF-631: Static analysis & secret scanning (1.5 SP)
- [ ] `.github/workflows/security-codeql.yml` — `github/codeql-action` (init/analyze), language `javascript-typescript`, query suite `security-extended`. Triggers: `pull_request` to main, `push` to main, weekly cron.
- [ ] `.github/workflows/security-secrets.yml` — `gitleaks/gitleaks-action` on PR and push (full history on the first run: `fetch-depth: 0`).
- [ ] `.gitleaks.toml` with an allow-list for **known test fixtures only** (e.g. `.env.example` placeholder `Password123!`, JMeter CSV test users), each with a comment.
- [ ] Enable **secret scanning + push protection** in repo settings (manual PO step — document it in `docs/security/repo_security_controls.md`).

### US-AF-632: Dependency scanning & automated updates (1.5 SP)
- [ ] `.github/dependabot.yml`:
  - `package-ecosystem: npm`, `directory: /` (workspaces), weekly, **grouped** (`playwright`, `wdio`, `eslint`, `types`, `allure`, `minor-and-patch`).
  - `package-ecosystem: github-actions`, `directory: /`, weekly, grouped.
  - `open-pull-requests-limit: 5`, labels `dependencies`.
- [ ] `.github/workflows/security-deps.yml`:
  - `google/osv-scanner-action` against `package-lock.json` (fails on HIGH/CRITICAL).
  - `npm audit --audit-level=high --workspaces` as a second opinion (non-blocking on first rollout, blocking after triage).
  - Upload SARIF to code scanning.
- [ ] `actions/dependency-review-action` on PRs (blocks new HIGH vulnerabilities and disallowed licenses).

### US-AF-633: Workflow security linting & least privilege (1 SP)
- [ ] `.github/workflows/lint-workflows.yml` running `rhysd/actionlint` and `zizmor` (`--min-severity medium`), SARIF upload for zizmor.
- [ ] Every workflow: top-level `permissions: {}`, with each job granting only what it needs.
- [ ] Fix zizmor findings: template injection (`${{ github.event.inputs.* }}` inside `run:` → move to `env:`), `persist-credentials: false` on checkouts that don't push, no `pull_request_target`.

### US-AF-634: SBOM & license compliance (1 SP)
- [ ] `anchore/sbom-action` generating CycloneDX JSON for the monorepo; attached to GitHub Releases (wired to release-please in 6.4) and uploaded as an artifact on main.
- [ ] `license-checker-rseidelsohn` (or `npx license-checker --onlyAllow`) with an allow-list: MIT, ISC, Apache-2.0, BSD-2-Clause, BSD-3-Clause, 0BSD, CC0-1.0, Python-2.0, BlueOak-1.0.0. Run in `security-deps.yml`.
- [ ] `docs/security/repo_security_controls.md`: a matrix of each control, tool, trigger, blocking yes/no, and owner, plus the **branch protection required-checks list**.

---

## 3. Verification Commands

```bash
docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest
pipx run zizmor .github/workflows/   # or: docker run --rm -v "$PWD:/repo" ghcr.io/zizmorcore/zizmor /repo/.github/workflows
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest detect --source=/repo --config=/repo/.gitleaks.toml
npx osv-scanner --lockfile=package-lock.json   # or docker ghcr.io/google/osv-scanner
npm audit --audit-level=high --workspaces
```

---

## 4. Code Review Checklist

- [ ] Every third-party action is SHA-pinned (carried over from 6.2).
- [ ] No job has `contents: write` unless it pushes (Pages deploy, release).
- [ ] Gitleaks allow-list entries are narrow (path + regex), never global.
- [ ] Each accepted risk (osv, zizmor, CodeQL) is listed in `repo_security_controls.md` with a reason and review date.
- [ ] Dependabot groups won't produce more than about 5 PRs/week.

---

## 5. Definition of Done

- [ ] CodeQL, gitleaks, osv-scanner, dependency-review and actionlint/zizmor all green on the sprint PR.
- [ ] First-run findings triaged: fixed or documented as accepted.
- [ ] Code scanning tab shows CodeQL + osv + zizmor results.
- [ ] Required checks list documented; PO enables branch protection.

---

## 6. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `.github/workflows/security-codeql.yml` | SAST |
| `.github/workflows/security-secrets.yml` + `.gitleaks.toml` | Secret scanning |
| `.github/workflows/security-deps.yml` | osv-scanner, npm audit, license check, SBOM |
| `.github/workflows/lint-workflows.yml` | actionlint + zizmor |
| `.github/dependabot.yml` | Grouped npm + actions updates |
| `docs/security/repo_security_controls.md` | Control matrix + branch protection |
