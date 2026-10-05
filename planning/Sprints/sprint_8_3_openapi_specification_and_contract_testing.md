# Sprint 8.3: OpenAPI Specification & Contract Testing

**Navigation**: [⬅️ Previous: Sprint 8.2](sprint_8_2_api_coverage_gaps_and_negative_matrix.md) | [🗺️ Planning Hub](../README.md) | [Phase 8](../Phases/phase_8_api_depth_typed_clients_schemas_and_contracts.md) | [Next: Sprint 9.1 ➡️](sprint_9_1_dast_pipeline_with_owasp_zap.md)

**Sprint Identifier**: `SPRINT-8.3-OPENAPI-AND-CONTRACT-TESTING`
**Phase Mapping**: [Phase 8](../Phases/phase_8_api_depth_typed_clients_schemas_and_contracts.md)
**Estimated Velocity**: 4 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-8.3-contract-testing`
**Depends On**: Sprint 8.1 (zod schemas)
**Sprint Goal**: Produce an OpenAPI 3.1 spec from the zod schemas, fuzz the API with Schemathesis, and add consumer-driven contract tests with Pact (file-based, no paid broker).

---

## 1. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **SDET Architect** | Contract strategy (which consumer interactions), OpenAPI ownership |
| **Playwright QA Lead** | Pact consumer tests, provider state handlers |
| **DevOps Engineer** | Schemathesis + Pact verification workflows |

---

## 2. Sprint Backlog & User Stories

### US-AF-831: OpenAPI 3.1 from zod (1.5 SP)
- [ ] Add `@asteasolutions/zod-to-openapi`; register every schema from `src/api/schemas` and every route (method, path, params, request body, responses incl. error envelope, security scheme `bearerAuth` + cookie).
- [ ] `scripts/generate-openapi.ts` → `docs/api/openapi.yaml` (checked in) + a published Redoc/Swagger UI page on the portal (`AutomationReports/API-Docs/`).
- [ ] **Drift gate** in PR (static-quality job): regenerate and `git diff --exit-code docs/api/openapi.yaml`.
- [ ] Optionally propose upstreaming the spec to `buggy-books` (separate issue there).

### US-AF-832: Schemathesis property-based fuzzing (1 SP)
- [ ] `.github/workflows/api-fuzz.yml` — nightly + dispatch, `target-env: DOCKER` (uses `buggybooks-up`).
- [ ] Run `schemathesis/schemathesis` Docker image:
  ```bash
  docker run --network host -v "$PWD/docs/api:/api" schemathesis/schemathesis:stable \
    run /api/openapi.yaml --url http://localhost:4000/api \
    --checks all --max-examples 50 \
    -H "x-bypass-rate-limit: true" -H "x-bypass-csrf: true" \
    --report junit --report-junit-path /api/schemathesis-junit.xml
  ```
  (Confirm the exact CLI flags against the pinned Schemathesis version — the CLI changed between v3 and v4.)
- [ ] Auth: a hook or `--auth` that logs in a seeded user first so protected endpoints are exercised.
- [ ] Exclude `/test/*` chaos endpoints from fuzzing (`--exclude-path-regex '^/test/'`).
- [ ] Publish JUnit → Step Summary; non-blocking for 2 weeks, then blocking on new 5xx.

### US-AF-833: Pact consumer-driven contracts (1.5 SP)
- [ ] New folder `contract-tests/` inside `playwright-e2e` (or a separate workspace `contract-tests` if cleaner), using `@pact-foundation/pact` (V4).
- [ ] **Consumer = "buggybooks-web"** — interactions modelled on what `buggy-books/frontend/src/api.ts` actually calls: list books, get book, login, get cart, add to cart, checkout, get orders. Use matchers (`like`, `eachLike`, `regex`) — never exact values.
- [ ] Pact file written to `contract-tests/pacts/buggybooks-web-buggybooks-api.json` and uploaded as a CI artifact.
- [ ] **Provider verification** against the DOCKER backend in the same workflow: `Verifier({ providerBaseUrl: 'http://localhost:4000', pactUrls: [...] , stateHandlers })`, where state handlers use the test-control client (`/api/test/reset`, `/api/test/books/:id/stock`, seed user).
- [ ] Workflow `contract-tests.yml` on PR (paths: `playwright-e2e/src/api/**`, `contract-tests/**`) and nightly.
- [ ] Docs: `docs/contract_testing.md` explaining consumer vs provider, why there's no broker (file-based), and how to add an interaction. Mention the optional self-hosted broker (`pactfoundation/pact-broker` docker image) as a future upgrade.

---

## 3. Verification Commands

```bash
npx tsx scripts/generate-openapi.ts && git diff --exit-code docs/api/openapi.yaml
npx @redocly/cli lint docs/api/openapi.yaml
docker compose -f infra/docker-compose.test.yml up -d --wait
npm run test:contract --workspace=playwright-e2e        # consumer + provider verify
gh workflow run api-fuzz.yml
```

---

## 4. Code Review Checklist

- [ ] The OpenAPI spec lints clean with Redocly (`recommended` ruleset).
- [ ] Pact interactions use type matchers, not literal values (no brittle contracts).
- [ ] Provider states are idempotent and use only test-control endpoints.
- [ ] Schemathesis excludes chaos endpoints and runs **only** against DOCKER (never Render).
- [ ] Contract IDs (`CT-*`) added to both catalogs.

---

## 5. Definition of Done

- [ ] `docs/api/openapi.yaml` generated, linted, drift-gated, rendered on the portal.
- [ ] Pact consumer + provider verification green in CI.
- [ ] First Schemathesis report triaged (issues filed or intentional bugs documented).

---

## 6. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `scripts/generate-openapi.ts`, `docs/api/openapi.yaml` | Spec + generator |
| `.github/workflows/api-fuzz.yml` | Schemathesis nightly |
| `contract-tests/**`, `.github/workflows/contract-tests.yml` | Pact consumer and provider |
| `docs/contract_testing.md` | Guide |
