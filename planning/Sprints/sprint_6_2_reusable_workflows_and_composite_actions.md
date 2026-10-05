# Sprint 6.2: Reusable Workflows & Composite Actions

**Navigation**: [⬅️ Previous: Sprint 6.1](sprint_6_1_trustworthy_pipelines_hotfix.md) | [🗺️ Planning Hub](../README.md) | [Phase 6](../Phases/phase_6_cicd_integrity_and_supply_chain_security.md) | [Next: Sprint 6.3 ➡️](sprint_6_3_supply_chain_and_repository_security.md)

**Sprint Identifier**: `SPRINT-6.2-REUSABLE-WORKFLOWS-AND-COMPOSITE-ACTIONS`
**Phase Mapping**: [Phase 6](../Phases/phase_6_cicd_integrity_and_supply_chain_security.md)
**Estimated Velocity**: 4 Story Points
**Sprint Status**: Completed
**Branch**: `feat/sprint-6.2-reusable-workflows`
**Depends On**: Sprint 6.1
**Sprint Goal**: Remove copy-paste across workflows with composite actions and one reusable E2E pipeline, merge the three overlapping Playwright workflows, standardise the toolchain, and add a scheduled nightly regression.

---

## 1. Context & Evidence

- The Render warm-up block (curl + `wait-on`) and the chaos-reset block (config reset, `/test/reset`, stock restore for books 1 and 2) are duplicated across `pr-gate.yml`, `playwright-ci.yml`, `playwright-docker.yml`, `playwright-on-demand.yml`, `selenium-ci.yml`, `wdio-ci.yml`, `mobile-ci.yml` and `quarantine-audit.yml`.
- `playwright-ci.yml` (171 lines), `playwright-docker.yml` (267) and `playwright-on-demand.yml` (659) overlap heavily (install, warm-up, run, blob merge, Allure, Pages deploy).
- Full regression runs **only on manual dispatch**; nothing runs nightly for web.
- Node 22 (pr-gate) vs Node 24 (playwright-ci); actions pinned by SHA in docker/on-demand/quarantine but by tag (`@v4`, `peaceiris@v3`) elsewhere.
- No Playwright browser cache → `npx playwright install --with-deps chrome` on every job.

---

## 2. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **DevOps Engineer** | Composite actions, reusable workflow, migration of callers, cache strategy |
| **SDET Architect** | Input contract design for the reusable workflow; review |
| **Playwright QA Lead** | Validate shard/merge/report parity before and after |

---

## 3. Sprint Backlog & User Stories

### US-AF-621: Composite actions (1 SP)
- [x] `.github/actions/setup-monorepo/action.yml`
  - Inputs: `install-chrome` (bool, default `false`), `working-directory` (default `.`).
  - Steps: `actions/setup-node` with `node-version-file: .nvmrc` + `cache: npm`; `npm ci`; when `install-chrome` is set, cache `~/.cache/ms-playwright` keyed on `hashFiles('playwright-e2e/package-lock.json', 'package-lock.json')` + `runner.os`, then `npx playwright install --with-deps chrome`.
- [x] `.github/actions/staging-warmup/action.yml`
  - Inputs: `api-url` (default `https://buggy-books.onrender.com/api/books`), `fe-url` (default `https://buggy-books-fe.onrender.com/`), `timeout-ms` (default `90000`).
- [x] `.github/actions/chaos-reset/action.yml`
  - Inputs: `api-base` (default `https://buggy-books.onrender.com`), `restock-book-ids` (default `1,2`), `stock` (default `100`).
- [x] Add root `.nvmrc` containing `24`.

### US-AF-622: Reusable E2E workflow (1.5 SP)
- [x] `.github/workflows/_reusable-e2e.yml` with `on: workflow_call`:

  | Input | Type | Default | Purpose |
  | :--- | :--- | :--- | :--- |
  | `framework` | choice-like string | `playwright` | `playwright` \| `selenium` \| `wdio` |
  | `project` | string | `''` | Playwright project (`api`, `chrome`, empty = all) |
  | `grep` | string | `''` | Tag filter, e.g. `@smoke` |
  | `shards` | number | `1` | Playwright shard count (matrix built with `fromJSON`) |
  | `use-docker-image` | boolean | `false` | Run inside `mcr.microsoft.com/playwright:v1.58.0-jammy` |
  | `publish-allure` | boolean | `true` | Deploy to gh-pages namespace |
  | `allure-namespace` | string | `Playwright` | `AutomationReports/<ns>/` |
  | `target-env` | string | `STAGING` | Later `DOCKER` (Sprint 7.1) |

  - Secrets: `E2E_USER_NAME`, `E2E_PASSWORD` via `secrets: inherit`.
  - Jobs: `test` (matrix shards) → `merge-reports` (blob merge, Monocart merge, summary) → `deploy-report` (`concurrency: pages-deploy-allure`).
  - Uses the Sprint 6.1 gate step and `summarize-test-results.js`.
- [x] Callers become thin (≤ 40 lines each):
  - `playwright-ci.yml` → `workflow_dispatch` with inputs, calls the reusable workflow (`shards: 4`).
  - `selenium-ci.yml`, `wdio-ci.yml` → `framework: selenium|wdio`.
  - **Delete** `playwright-docker.yml` and `playwright-on-demand.yml`; move their unique features (docker image, 8 shards, separate api/ui jobs, trace summary) into reusable inputs. Record the removal in `docs/architecture/ci_pipeline_map.md`.

### US-AF-623: Nightly regression + matrix summary (1 SP)
- [x] `.github/workflows/nightly-regression.yml`: `schedule: cron '30 1 * * *'` (01:30 UTC) + `workflow_dispatch`. Calls the reusable workflow for Playwright (all projects, 4 shards), Selenium and WDIO in parallel jobs.
- [x] A final `nightly-summary` job collects each framework's result and writes one combined table to the Step Summary.
- [x] Note in the workflow header that it targets Render staging until Sprint 7.1 switches it to `DOCKER`.

### US-AF-624: Pinning and toolchain consistency (0.5 SP)
- [x] Pin **every** `uses:` to a full commit SHA with a `# vX.Y.Z` comment (use `pinact` or do it by hand).
- [x] Replace `peaceiris/actions-gh-pages@v3` with the same SHA-pinned v4 used in the docker workflow.
- [x] Every `setup-node` uses `node-version-file: .nvmrc` (remove hard-coded 22/24).

---

## 4. Verification Commands

```bash
# Lint workflows locally
actionlint
Get-ChildItem -Path .github/workflows/*.y*ml, .github/actions/*/*.y*ml   # compare lines
Select-String -Path .github/workflows/*.y*ml, .github/actions/*/*.y*ml -Pattern "uses:\s+[^@]+@v[0-9]"   # verify 0 matches
```

---

## 5. Code Review Checklist

- [x] The reusable workflow has explicit `permissions:` per job (read by default; `contents: write` only on deploy).
- [x] No input is interpolated into `run:` without going through `env:` (prevents template injection; zizmor will check in 6.3).
- [x] Shard matrix built from the input (`fromJSON(format('[{0}]', …))` or a small "build matrix" job), not hard-coded.
- [x] Allure history is preserved (`keep_files: true` + history copy) exactly as before.
- [x] Deleted workflows' unique features are all mapped to inputs (keep a checklist in the PR).
- [x] Cache key includes the Playwright version so browser upgrades invalidate it.

---

## 6. Definition of Done

- [x] Workflow LOC reduced ≥ 40% (record before/after numbers in the PR).
- [x] `actionlint` passes with 0 errors.
- [x] Callers modernized: `playwright-ci`, `selenium-ci`, `wdio-ci`, `nightly-regression`, with reports at the same gh-pages paths as before.
- [x] `README.md` CI section and `docs/architecture/ci_pipeline_map.md` updated (relative links only).

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `.github/actions/{setup-monorepo,staging-warmup,chaos-reset}/action.yml` | Composite actions |
| `.github/workflows/_reusable-e2e.yml` | Single E2E pipeline |
| `.github/workflows/nightly-regression.yml` | Scheduled regression |
| `.nvmrc` | Node 24 LTS |
| `docs/architecture/ci_pipeline_map.md` | Diagram of workflows → reusable → actions |
| ~~`playwright-docker.yml`, `playwright-on-demand.yml`~~ | Removed (merged) |
