# Sprint 7.1: Ephemeral BuggyBooks Environment in CI

**Navigation**: [⬅️ Previous: Sprint 6.4](sprint_6_4_repository_governance_and_contributor_experience.md) | [🗺️ Planning Hub](../README.md) | [Phase 7](../Phases/phase_7_hermetic_environments_test_data_and_developer_experience.md) | [Next: Sprint 7.2 ➡️](sprint_7_2_test_data_engineering_and_typed_configuration.md)

**Sprint Identifier**: `SPRINT-7.1-EPHEMERAL-BUGGYBOOKS-ENV`
**Phase Mapping**: [Phase 7](../Phases/phase_7_hermetic_environments_test_data_and_developer_experience.md)
**Estimated Velocity**: 6 Story Points
**Sprint Status**: Done
**Branch**: `feat/sprint-7.1-ephemeral-env` (+ `feat/ghcr-images` in `buggy-books`)
**Depends On**: Sprint 6.2 (reusable workflow with `target-env` input)
**Sprint Goal**: Run every PR's tests against a fresh BuggyBooks started from GHCR images inside the CI runner, removing the shared-staging dependency from the PR path.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **DevOps Engineer** | GHCR publishing (buggy-books repo), compose file, composite action, workflow wiring |
| **SDET Architect** | `ENV=DOCKER` profile design across frameworks, test-exclusion policy |
| **Playwright QA Lead** | Run the full suite on DOCKER, fix environment-specific assumptions, recapture visual baselines |
| **Selenium / WDIO Specialist** | `DOCKER` profile in their `env.config.ts` |
| **Performance Engineer** | k6 `BASE_URL` default for DOCKER smoke |

---

## 2. Sprint Backlog & User Stories

### US-AF-711: Publish BuggyBooks images to GHCR — *in `munna7862/buggy-books`* (1.5 SP)
- [x] New workflow `buggy-books/.github/workflows/publish-images.yml`:
  - Triggers: push to `main`, tags `v*`, `workflow_dispatch`.
  - `permissions: { contents: read, packages: write }`.
  - `docker/login-action` (registry `ghcr.io`, `GITHUB_TOKEN`), `docker/setup-buildx-action`, `docker/build-push-action` with GHA layer cache.
  - Images and tags:
    | Image | Tags | Build args |
    | :--- | :--- | :--- |
    | `ghcr.io/munna7862/buggy-books-backend` | `sha-<short>`, `latest`, semver on tags | `target: production` |
    | `ghcr.io/munna7862/buggy-books-frontend` | `sha-<short>-ci-localhost`, `ci-localhost` | `VITE_API_URL=http://localhost:4000/api` |
  - OCI labels (`org.opencontainers.image.source`, `revision`) so packages link to the repo.
- [x] Make both packages **public** in GHCR settings (manual PO step; documented).
- [x] Optional: `cosign` keyless signing (free with GitHub OIDC) of both images.

### US-AF-712: Test compose & composite action — *in this repo* (1.5 SP)
- [x] `infra/docker-compose.test.yml`:
  - `backend`: image `ghcr.io/munna7862/buggy-books-backend:${BUGGYBOOKS_TAG:-latest}`, ports `4000:4000`, env `NODE_ENV=production`, `JWT_SECRET=ci-test-secret`, **no volumes**, healthcheck on `/api/health`.
  - `frontend`: image `ghcr.io/munna7862/buggy-books-frontend:${BUGGYBOOKS_FE_TAG:-ci-localhost}`, ports `5173:80`, `depends_on: backend: condition: service_healthy`.
- [x] `.github/actions/buggybooks-up/action.yml`:
  - Inputs: `backend-tag`, `frontend-tag`.
  - Steps: `docker compose -f infra/docker-compose.test.yml up -d --wait`; `npx wait-on -t 60000 http://localhost:4000/api/books http://localhost:5173/`; write the image digests to `$GITHUB_STEP_SUMMARY` and to `env` (`BUGGYBOOKS_BACKEND_DIGEST`) for the Allure environment.
  - Post-step (or a separate `buggybooks-down` action with `if: always()`): `docker compose logs --no-color > buggybooks-logs.txt`, upload as artifact, then `down -v`.
- [x] `infra/README.md` — how to run locally (`docker compose -f infra/docker-compose.test.yml up -d`).

### US-AF-713: `ENV=DOCKER` profile across frameworks (1.5 SP)
- [x] `playwright-e2e/src/config/env.config.ts`: profile map
  ```ts
  const PROFILES = {
    DOCKER:  { baseUrl: 'http://localhost:5173', apiBaseUrl: 'http://localhost:4000' },
    STAGING: { baseUrl: 'https://buggy-books-fe.onrender.com', apiBaseUrl: 'https://buggy-books.onrender.com' },
    INTEROP: { /* alias of STAGING for backward compatibility */ },
  } as const;
  ```
  Explicit `BASE_URL` / `API_BASE_URL` env vars still override.
- [x] Same profile in `selenium-e2e`, `wdio-e2e`, `k6-performance/config/options.js` (`__ENV.TARGET_ENV`), and the JMeter workflow (`-Jprotocol=http -Jhost=localhost -Jport=4000`).
- [x] Seed user: the backend's seeded `db.json` must include the E2E seed user, or `auth.setup.ts` registers it idempotently when `ENV=DOCKER` (prefer **register-if-missing** so no secret is needed locally). Document which.
- [x] `scripts/generate-allure-environment.js`: add `TargetEnv` and `BuggyBooksImage` (digest) fields.

### US-AF-714: Switch the PR path to DOCKER; keep STAGING nightly (1.5 SP)
- [x] `_reusable-e2e.yml`: when `target-env == 'DOCKER'`, call `buggybooks-up` instead of `staging-warmup`; chaos-reset calls target `http://localhost:4000`.
- [x] `pr-gate.yml` smoke → `target-env: DOCKER`. Remove the staging concurrency group from this job (no longer shared).
- [x] `nightly-regression.yml` → two jobs: `DOCKER` (full) and `STAGING` (smoke + API contract subset, tagged `@staging-contract`).
- [x] Run the full Playwright suite against DOCKER; for each failure classify it as env assumption (fix) / data difference (fix seed) / intentional (document). Recapture the visual baseline `catalog-baseline-chrome-linux.png` inside the Playwright Docker image against DOCKER.
- [x] Update AGENTS.md §2: "warm-up probe is required for **STAGING** runs only; PR runs use `ENV=DOCKER`".

---

## 3. Verification Commands

```bash
docker compose -f infra/docker-compose.test.yml up -d --wait
curl -s http://localhost:4000/api/health
cd playwright-e2e && ENV=DOCKER npx playwright test --config=src/config/playwright.config.ts --repeat-each=1
ENV=DOCKER npx playwright test --config=src/config/playwright.config.ts --grep @smoke --repeat-each=3
cd ../selenium-e2e && ENV=DOCKER npm run test:smoke
cd ../wdio-e2e && ENV=DOCKER npm run test:smoke
docker compose -f ../infra/docker-compose.test.yml down -v
```

---

## 4. Code Review Checklist

- [x] No hard-coded `onrender.com` left in specs (only in the env profile and nightly STAGING job): `grep -rn "onrender.com" */src`.
- [x] Compose has no persistent volumes; the healthcheck uses an endpoint that exists (`/api/health`).
- [x] `buggybooks-down` / log upload runs on `if: always()`.
- [x] GHCR workflow uses least-privilege `packages: write` only on the publish job; actions SHA-pinned.
- [x] Image tag/digest is recorded in the report environment for reproducibility.
- [x] The visual baseline was recaptured in the pinned Playwright image (state the image tag in the PR).

---

## 5. Definition of Done

- [x] Images visible and public at `ghcr.io/munna7862/buggy-books-*`.
- [x] PR gate green on DOCKER with **0** requests to `onrender.com` (check the network log / grep in CI logs).
- [x] PR gate wall time reduced (record before/after).
- [x] Nightly STAGING job green.
- [x] Catalogs: add a `Target Env` note to the catalog header; mark `@staging-contract` tests.

---

## 6. Deliverables Summary

| Artifact | Repo | Description |
| :--- | :--- | :--- |
| `.github/workflows/publish-images.yml` | buggy-books | GHCR build & push |
| `infra/docker-compose.test.yml`, `infra/README.md` | this | Disposable env |
| `.github/actions/buggybooks-up`, `buggybooks-down` | this | Env lifecycle |
| `*/src/config/env.config.ts`, `k6-performance/config/options.js` | this | `DOCKER` profile |
| `pr-gate.yml`, `nightly-regression.yml`, `_reusable-e2e.yml` | this | Wiring |
