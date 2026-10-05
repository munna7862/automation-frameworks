# Sprint 11.1: k6 Performance Maturity

**Navigation**: [⬅️ Previous: Sprint 10.3](sprint_10_3_selenium_and_wdio_parity_expansion.md) | [🗺️ Planning Hub](../README.md) | [Phase 11](../Phases/phase_11_performance_engineering_and_observability.md) | [Next: Sprint 11.2 ➡️](sprint_11_2_jmeter_engineering_and_taurus_gating.md)

**Sprint Identifier**: `SPRINT-11.1-K6-PERFORMANCE-MATURITY`
**Phase Mapping**: [Phase 11](../Phases/phase_11_performance_engineering_and_observability.md)
**Estimated Velocity**: 5 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-11.1-k6-maturity`
**Depends On**: Sprint 7.1 (DOCKER), Sprint 7.2 (perf datasets)
**Sprint Goal**: Move k6 load to the disposable env with stable baselines, add open-model and real endurance scenarios, per-endpoint thresholds, and a Google Chrome browser + protocol hybrid scenario.

---

## 1. Context & Evidence

- `k6-performance/config/options.js` → `soak: 5s → 30s @15 VUs → 5s`; every topology uses `stages` (closed model).
- `.github/workflows/k6-performance.yaml` runs on PRs (path-filtered) against `https://buggy-books.onrender.com` and compares with `baselines/*.json` at ±20%.
- Scenarios: smoke, catalog, auth, checkout, inventory, journey, soak, breakpoint.

---

## 2. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **Performance Engineer** | Scenarios, thresholds, baselines, hybrid browser test |
| **DevOps Engineer** | Workflow changes (DOCKER, weekly soak) |
| **SDET Architect** | Review of SLAs and the noise policy |

---

## 3. Sprint Backlog & User Stories

### US-AF-1111: DOCKER-based drift gate & recalibration (1.5 SP)
- [ ] `k6-performance.yaml`: start `buggybooks-up`, set `BASE_URL=http://localhost:4000`, run the smoke + catalog drift gate. Render runs become a separate `workflow_dispatch`-only informational job (≤ 5 VUs).
- [ ] Recalibrate `baselines/*.json` on DOCKER: `npm run perf:recalibrate` across **3 runs** on `ubuntu-latest`, storing the median and the runner metadata (`runner.os`, CPU count) in the baseline file.
- [ ] Noise study: run the gate 5× on unchanged `main`; record the max observed drift in `docs/performance/drift_noise_study.md`. Adjust the threshold only with evidence.

### US-AF-1112: Open-model scenarios & per-endpoint thresholds (1.5 SP)
- [ ] New topologies in `config/options.js`:
  ```js
  throughput: { scenarios: { browse: { executor: 'constant-arrival-rate', rate: 50, timeUnit: '1s',
                 duration: '2m', preAllocatedVUs: 50, maxVUs: 200, exec: 'browse' } } },
  rampingRps: { scenarios: { ramp: { executor: 'ramping-arrival-rate', startRate: 10, timeUnit: '1s',
                 stages: [{ target: 50, duration: '1m' }, { target: 100, duration: '2m' }, { target: 0, duration: '30s' }],
                 preAllocatedVUs: 50, maxVUs: 300 } } },
  ```
- [ ] Tag requests (`tags: { name: 'GET /books' }`) and use per-endpoint thresholds:
  `'http_req_duration{name:GET /books}': ['p(95)<300']`, `'http_req_duration{name:POST /checkout/process}': ['p(95)<800']`, `checks: ['rate>0.99']`, `dropped_iterations: ['count<10']` (open model saturation signal).
- [ ] `abortOnFail` + `delayAbortEval` on the stress and breakpoint thresholds.
- [ ] Mixed-workload scenario `scenarios/mixed-workload.js` (70% browse, 20% cart, 10% checkout) with multiple `exec` functions.

### US-AF-1113: Real endurance soak (1 SP)
- [ ] Rename the current 40s `soak` topology to `soakSmoke`; new `soak` = 10 min ramp → **60 min** steady @ 20 VUs (configurable `SOAK_DURATION`) → 5 min down.
- [ ] Every 60s a `setInterval`-style scenario (`constant-vus: 1`, `exec: 'sampleMetrics'`) reads `GET /api/metrics` and emits custom `Trend` metrics (heap used, RSS, active handles — whatever the diagnostics payload exposes); the soak verdict includes "heap growth < X% from the first to the last 10 min".
- [ ] `.github/workflows/k6-soak-weekly.yml` — `schedule: '0 4 * * 0'` (Sunday 04:00 UTC), DOCKER, `timeout-minutes: 100`.

### US-AF-1114: Browser + protocol hybrid with Google Chrome (0.5 SP)
- [ ] `scenarios/hybrid-browser-load.js`: scenario A = protocol `ramping-vus` to 30 VUs on the API; scenario B = `k6/browser` with 2 VUs navigating catalog → detail → add to cart, measuring `browser_web_vital_lcp`/`cls` thresholds under load.
- [ ] `options.scenarios.ui.options.browser.type = 'chromium'` **plus** env `K6_BROWSER_EXECUTABLE_PATH=/usr/bin/google-chrome` (CI installs Chrome via the `setup-monorepo` action; the dev container has it).
- [ ] Add a `perf:hybrid` npm script; run it in the nightly perf job (not the PR).

### US-AF-1115: Housekeeping (0.5 SP)
- [ ] Enable the k6 web dashboard export (`K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=reports/k6-dashboard-<scenario>.html`) in `scripts/run-k6.js`; publish to the portal under `AutomationReports/k6/`.
- [ ] Unit tests (`node --test`) for `utils/summary-handler.js` and `utils/html-reporter.js` key functions (alongside the existing `history-tracker.test.js`).

---

## 4. Verification Commands

```bash
docker compose -f infra/docker-compose.test.yml up -d --wait
cd k6-performance
BASE_URL=http://localhost:4000 npm run perf:smoke
BASE_URL=http://localhost:4000 TOPOLOGY=throughput node scripts/run-k6.js scenarios/catalog-load.js
BASE_URL=http://localhost:4000 SOAK_DURATION=5m npm run perf:soak      # short local rehearsal
K6_BROWSER_EXECUTABLE_PATH="$(which google-chrome)" BASE_URL=http://localhost:4000 npm run perf:hybrid
npm test
npm run perf:drift-check
```

---

## 5. Code Review Checklist

- [ ] No load scenario defaults to the Render URL (`grep -rn onrender k6-performance/scenarios` is empty; Render only via an explicit env var).
- [ ] Thresholds are tagged per endpoint; `checks` threshold present.
- [ ] Open-model scenarios set `preAllocatedVUs`/`maxVUs` sensibly and assert `dropped_iterations`.
- [ ] Soak metric sampling doesn't add meaningful load (1 VU, 60s cadence).
- [ ] The browser scenario uses the Google Chrome executable path.
- [ ] Baselines record runner metadata; the recalibration method is documented.

---

## 6. Definition of Done

- [ ] PR drift gate on DOCKER, 5 consecutive green runs on unchanged `main`.
- [ ] Weekly soak workflow merged and one 60-min run completed with a report.
- [ ] Hybrid scenario runs in nightly perf.
- [ ] Catalog entries `TC-PERF-K6-*` updated in both catalogs.

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `k6-performance/config/options.js` | Open-model topologies, real soak |
| `k6-performance/scenarios/{mixed-workload,hybrid-browser-load}.js` | New scenarios |
| `k6-performance/baselines/*.json` | DOCKER-recalibrated baselines |
| `.github/workflows/k6-performance.yaml`, `k6-soak-weekly.yml` | DOCKER gate, weekly soak |
| `docs/performance/drift_noise_study.md` | Evidence for thresholds |
