# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 6.4 — Repository Governance & Contributor Experience

**Sprint Identifier**: `SPRINT-6.4-REPO-GOVERNANCE-AND-CONTRIBUTOR-EXPERIENCE`  
**Phase**: Phase 6 (CI/CD Integrity & Supply-Chain Security)  
**Story Points**: 3 SP  
**Branch**: `chore/sprint-6.4-repo-governance`  
**Goal**: Enforce conventions mechanically (commits, formatting, lint coverage, ownership, release versioning) and clean up the hygiene debt found in the review.

---

## 1. Persona Roles & Ownership Matrix

| Persona             | Role Assignment          | Responsibilities for this Sprint                                                                                                 | Status      |
| :------------------ | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| **Scrum Master**    | `role-scrum-master`      | Sprint kick-off, DoR verification, DoD audit, and tracking.                                                                      | `COMPLETED` |
| **SDET Architect**  | `role-sdet-architect`    | Lint architectures for selenium/wdio, dual-catalog check, hygiene verification, and Code Acceptance Review.                      | `COMPLETED` |
| **DevOps Engineer** | `role-devops-engineer`   | GitHub governance (.github/CODEOWNERS, templates), commitlint/prettier hooks, release-please workflow, and PR release lifecycle. | `ACTIVE`    |
| **Product Owner**   | Human Tech Lead (`User`) | Backlog prioritization, final PR review & merge.                                                                                 | `STANDBY`   |

---

## 2. Granular Task Breakdown

### US-AF-641: Ownership & Templates (0.5 SP)

- [x] **US-AF-641.1** (`DevOps Engineer`): Author `.github/CODEOWNERS` mapping `* @munna7862` plus per-folder owners (`/k6-performance/`, `/jmeter/`, `/mobile-automation/`, `/.github/`, `/packages/`).
- [x] **US-AF-641.2** (`DevOps Engineer`): Author `.github/pull_request_template.md` with structured sections: 📌 Summary of Changes, 🔗 Sprint / Story IDs, 🧪 Verification (commands + counts), 📋 Catalog Updated (y/n), ⚠️ Risks.
- [x] **US-AF-641.3** (`DevOps Engineer`): Author GitHub Issue Form templates `.github/ISSUE_TEMPLATE/bug_report.yml`, `flaky_test.yml` (spec path, failure signature, first seen, quarantine date linking `docs/quarantine_lifecycle_guide.md`), and `new_test_case.yml`.

### US-AF-642: Commit, Format & Lint Enforcement (1.5 SP)

- [x] **US-AF-642.1** (`DevOps Engineer`): Install root dev dependencies: `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, `prettier`.
- [x] **US-AF-642.2** (`DevOps Engineer`): Configure Husky hooks `.husky/pre-commit` (`npx lint-staged`) and `.husky/commit-msg` (`npx --no -- commitlint --edit "$1"`), add `lint-staged` config in root `package.json`.
- [x] **US-AF-642.3** (`DevOps Engineer`): Configure `commitlint.config.cjs` with conventional commits and allowed scopes: `playwright, selenium, wdio, mobile, k6, jmeter, ci, docs, planning, security, utils, test-data, infra, portal, deps, governance`.
- [x] **US-AF-642.4** (`DevOps Engineer`): Author `.prettierrc` and `.prettierignore` (ignoring build outputs, reports, `*.jmx`, package-lock, test artifacts, docs, planning).
- [x] **US-AF-642.5** (`DevOps Engineer`): Author `.editorconfig` specifying charset, indent styles, trimming trailing whitespace, and final newlines.
- [x] **US-AF-642.6** (`SDET Architect`): Implement `eslint.config.mjs` and `lint` script in `selenium-e2e` and `wdio-e2e` (leveraging typescript-eslint and mocha/wdio plugins without regressions) and update root `npm run lint:all` covering all 6 monorepo workspaces.
- [x] **US-AF-642.7** (`DevOps Engineer`): Integrate commitlint (`wagoid/commitlint-github-action`, SHA-pinned) into `pr-gate.yml`, and add `prettier --check` step in static-quality job.

### US-AF-643: Release Versioning (0.5 SP)

- [x] **US-AF-643.1** (`DevOps Engineer`): Configure `release-please` manifest mode with `release-please-config.json` and `.release-please-manifest.json` for root (`.`) and `packages/playwright-utils`.
- [x] **US-AF-643.2** (`DevOps Engineer`): Author `.github/workflows/release.yml` with `googleapis/release-please-action` (pinned SHA, `permissions: {}` least-privilege) and hook SBOM generation (`anchore/sbom-action`) on release publication.

### US-AF-644: Hygiene Cleanup (0.5 SP)

- [x] **US-AF-644.1** (`SDET Architect`): Untrack `packages/playwright-utils/dist/` from git; update `.gitignore` with `packages/*/dist/`; verify build on `prepare`.
- [x] **US-AF-644.2** (`SDET Architect`): Audit and remove duplicate test data `playwright-e2e/src/test-data/api/Test_001_BooksApi.json` and `Test_002_RegisterAndLoginUser.json` ensuring no active importers.
- [x] **US-AF-644.3** (`SDET Architect`): Consolidate mobile `Logger.ts` into `mobile-automation/src/core/Logger.ts`, remove duplicate `mobile-automation/src/utils/Logger.ts`, and update all import paths.
- [x] **US-AF-644.4** (`SDET Architect`): Remove duplicate k6 root shims (`run-k6.js`, `report-perf-summary.js`, `recalibrate-baselines.js`) and duplicate root `baseline-perf.json`, updating any scripts referencing them.
- [x] **US-AF-644.5** (`DevOps Engineer`): Relocate `run-gemma4-e4b.bat` to `tools/ai/run-gemma4-e4b.bat`.
- [x] **US-AF-644.6** (`SDET Architect`): Relocate `jmeter/Tests/CRUDPerformanceTest.jmx` to `jmeter/Legacy/CRUDPerformanceTest.jmx` and remove it from `jmeter-performance.yaml` workflow input options.
- [x] **US-AF-644.7** (`DevOps Engineer` / `SDET Architect`): Update root `README.md` (remove obsolete multi-browser references, align Node requirement with `.nvmrc` v24) and ensure planning matrix reflects current sprint progress.

### Verification, DoD & Release Protocol

- [x] **US-AF-640.1** (`Scrum Master`): Verify Pre-Flight Definition of Ready (DoR) with Render warm-up probe.
- [x] **US-AF-640.2** (`SDET Architect`): Code Acceptance Review against Code Review Checklist and hygiene standards.
- [x] **US-AF-640.3** (`Scrum Master`): Perform 4-point Definition of Done (DoD) audit.
- [ ] **US-AF-640.4** (`DevOps Engineer`): Commit, push branch, open PR with full verification evidence, monitor CI checks.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer                  | Target Role     | Review Feedback & Comments                                                                                                                                                                                | Gate Status |
| :------------------------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
| **Pre-Flight Architecture Gate** | SDET Architect  | Staging pre-flight probe and DoR audit. Verified online (HTTP 200).                                                                                                                                       | `[PASSED]`  |
| **Code Acceptance Review Gate**  | SDET Architect  | Verified: lint-staged fast (< 10s), zero sweep disables, 0 unused importers, no broken relative links. All 6 workspaces lint cleanly.                                                                     | `[PASSED]`  |
| **Scrum Master DoD Gate**        | Scrum Master    | Audited: lint:all across 6 workspaces (0 errors), prettier --check (0 errors), commitlint passes/fails appropriately, 100% deterministic green passes on smoke tests (42 passed), dual-catalog zero diff. | `[PASSED]`  |
| **DevOps Release Gate**          | DevOps Engineer | Validate CI workflows, PR creation, and green CI status.                                                                                                                                                  | `[ACTIVE]`  |
| **Final Human Sign-Off**         | Human Tech Lead | Final PR review and merge to `main`.                                                                                                                                                                      | `[PENDING]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `npm run lint:all` covers all workspaces (`playwright-e2e`, `selenium-e2e`, `wdio-e2e`, `mobile-automation`, `packages/playwright-utils`, `k6-performance`) with 0 errors.
- [x] `npx prettier --check .` passes cleanly.
- [x] Commitlint is active locally and in CI gate (`pr-gate.yml`).
- [x] Dual-catalog parity confirmed: `git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] All hygiene items removed/moved, no dead imports or dangling references.
- [x] Clean-clone / fresh build verified (`npm run build` / `npm ci`).
- [x] Planning docs and README updated with accurate matrices and links.
- [ ] Pull request opened with structured summary and verification evidence (`gh pr create`).
- [ ] All CI workflow checks green, approved, and merged to `main`.

---

## 5. Verification & Execution Evidence

```bash
# 1. Dual-catalog parity verification:
npm run test:verify-catalog
# Result: ✅ PARITY VERIFIED: Both catalogs are 100% character-for-character identical (615 lines, 182 test cases).

# 2. Static analysis & format checking:
npm run lint:all
# Result: 6/6 workspaces linted with 0 errors.
npm run typecheck:all
# Result: 5/5 TS workspaces typechecked with 0 errors.
npx prettier --check .
# Result: All matched files use Prettier code style!

# 3. Commitlint verification:
echo "bad message" | npx commitlint       # Exit code 1 (subject-empty, type-empty)
echo "fix(ci): gate test outcome" | npx commitlint   # Exit code 0 (success)

# 4. Smoke suite execution:
npm run test:playwright:smoke
# Result: 42 passed (100.0%), 0 failed, 0 flaky, 0 skipped.
```
