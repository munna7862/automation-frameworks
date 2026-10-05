# Sprint 6.4: Repository Governance & Contributor Experience

**Navigation**: [⬅️ Previous: Sprint 6.3](sprint_6_3_supply_chain_and_repository_security.md) | [🗺️ Planning Hub](../README.md) | [Phase 6](../Phases/phase_6_cicd_integrity_and_supply_chain_security.md) | [Next: Sprint 7.1 ➡️](sprint_7_1_ephemeral_buggybooks_environment_in_ci.md)

**Sprint Identifier**: `SPRINT-6.4-REPO-GOVERNANCE-AND-CONTRIBUTOR-EXPERIENCE`
**Phase Mapping**: [Phase 6](../Phases/phase_6_cicd_integrity_and_supply_chain_security.md)
**Estimated Velocity**: 3 Story Points
**Sprint Status**: Not Started
**Branch**: `chore/sprint-6.4-repo-governance`
**Depends On**: Sprint 6.2
**Sprint Goal**: Enforce conventions mechanically (commits, formatting, lint coverage, ownership, release versioning) and clean up the hygiene debt found in the review.

---

## 1. Context & Evidence

- `selenium-e2e` and `wdio-e2e` have **no `lint` script**, so `npm run lint:all` silently skips them.
- No `CODEOWNERS`, no PR template (AGENTS.md §6 requires 📌 Summary / 🧪 Verification sections), no issue templates.
- Conventional commits are required by AGENTS.md but not enforced.
- Hygiene debt:
  - `packages/playwright-utils/dist/` is committed (build output).
  - `playwright-e2e/src/test-data/api/Test_001_BooksApi.json` **and** `…/api/BookCatalog/Test_001_BooksApi.json` both exist and differ; the same applies to `Test_002_RegisterAndLoginUser.json` vs `UserManagement/Test_001_RegisterAndLoginUser.json`.
  - `mobile-automation/src/core/Logger.ts` **and** `mobile-automation/src/utils/Logger.ts`.
  - `k6-performance/{run-k6,report-perf-summary,recalibrate-baselines}.js` are 2-line shims duplicating `scripts/`; `k6-performance/baseline-perf.json` duplicates `baselines/baseline-perf.json`.
  - `run-gemma4-e4b.bat` at the repo root.
  - `jmeter/Tests/CRUDPerformanceTest.jmx` (legacy, 0 assertions) is still offered in the JMeter workflow.
  - README env table lists `firefox`/`edge`; prerequisites say Node 18.
  - `planning/README.md` execution matrix is missing the Sprint 5.2 row.

---

## 2. Sprint Backlog & User Stories

### US-AF-641: Ownership & templates (0.5 SP)
- [ ] `.github/CODEOWNERS` — `* @munna7862`, plus per-folder lines (`/k6-performance/`, `/jmeter/`, `/mobile-automation/`, `/.github/`) so ownership is ready if collaborators join.
- [ ] `.github/pull_request_template.md` with: 📌 Summary of Changes, 🔗 Sprint / Story IDs, 🧪 Verification (commands + counts), 📋 Catalog Updated (y/n), ⚠️ Risks.
- [ ] `.github/ISSUE_TEMPLATE/{bug_report,flaky_test,new_test_case}.yml` (issue forms). `flaky_test` has fields for spec path, failure signature, first seen and quarantine date (links to `docs/quarantine_lifecycle_guide.md`).

### US-AF-642: Commit, format & lint enforcement (1.5 SP)
- [ ] Root dev deps: `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, `prettier`.
- [ ] `.husky/pre-commit` → `npx lint-staged`; `.husky/commit-msg` → `npx commitlint --edit "$1"`.
- [ ] `commitlint.config.cjs` with allowed scopes: `playwright, selenium, wdio, mobile, k6, jmeter, ci, docs, planning, security, utils, test-data, infra, portal, deps`.
- [ ] `.prettierrc` + `.prettierignore` (ignore reports, `*.jmx`, lockfiles, planning docs if formatting churn is too noisy).
- [ ] `.editorconfig`.
- [ ] Add `eslint.config.mjs` and a `lint` script to `selenium-e2e` and `wdio-e2e` (same base as `playwright-e2e`, minus the Playwright plugin; add `eslint-plugin-wdio` for WDIO, `eslint-plugin-mocha` for both).
- [ ] CI: `commitlint` on PR commits (`wagoid/commitlint-github-action`, SHA-pinned) in `pr-gate.yml`; `prettier --check` in static-quality.

### US-AF-643: Release versioning (0.5 SP)
- [ ] `release-please` (`googleapis/release-please-action`) in manifest mode: root `CHANGELOG.md` + independent version for `packages/playwright-utils`.
- [ ] Hook the SBOM generation from 6.3 to the release event.

### US-AF-644: Hygiene cleanup (0.5 SP)
- [ ] Remove `packages/playwright-utils/dist/` from git; add `packages/*/dist/` to `.gitignore`; confirm `npm ci` in a clean clone builds it through `prepare`.
- [ ] Remove the root-level duplicates `test-data/api/Test_001_BooksApi.json` and `test-data/api/Test_002_RegisterAndLoginUser.json` (at main@1de55ad, specs import only the `BookCatalog/` and `UserManagement/` versions — re-check with `grep` before deleting).
- [ ] Consolidate the mobile `Logger.ts` into one (`core/`) and update imports.
- [ ] Remove the k6 root shims and the duplicate root `baseline-perf.json` (update any references found by `grep -rn "baseline-perf.json\|run-k6.js"`).
- [ ] Move `run-gemma4-e4b.bat` to `tools/ai/run-gemma4-e4b.bat` (reused by Sprint 12.2 for local LLM triage).
- [ ] Move `CRUDPerformanceTest.jmx` to `jmeter/Legacy/` and remove it from the workflow choice list (it's retired properly in 11.2).
- [ ] Fix README (Chrome-only env table, Node version from `.nvmrc`) and add the missing Sprint 5.2 row in `planning/README.md`.

---

## 3. Verification Commands

```bash
npm ci   # in a fresh clone → packages/playwright-utils/dist is generated
npm run lint:all   # now includes selenium-e2e and wdio-e2e
npx prettier --check .
echo "bad message" | npx commitlint   # must fail
echo "fix(ci): gate test outcome" | npx commitlint   # must pass
git ls-files | grep -E "playwright-utils/dist|run-gemma|Test_002_RegisterAndLoginUser.json$" || echo "clean"
```

---

## 4. Code Review Checklist

- [ ] The lint-staged config only touches staged files and runs fast (< 10s).
- [ ] New ESLint configs don't need sweeping `eslint-disable`; if the first run produces many errors, fix or set rules to `warn` with a tracked issue.
- [ ] Removed duplicates had no importers left (`grep` evidence in the PR).
- [ ] No relative-link breakage in docs (AGENTS.md §8).

---

## 5. Definition of Done

- [ ] `lint:all` covers 6 workspaces with 0 errors; `prettier --check` passes.
- [ ] Commitlint enforced locally and in CI.
- [ ] Hygiene items removed or moved; the clean-clone `npm ci` works.
- [ ] Planning README matrix complete through Sprint 6.4.

---

## 6. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `.github/CODEOWNERS`, PR template, issue forms | Governance |
| `.husky/`, `commitlint.config.cjs`, `.prettierrc`, `.editorconfig` | Local enforcement |
| `selenium-e2e/eslint.config.mjs`, `wdio-e2e/eslint.config.mjs` | Lint coverage |
| `release-please-config.json`, `.release-please-manifest.json` | Versioning |
| Cleanup commits | Hygiene debt removed |
