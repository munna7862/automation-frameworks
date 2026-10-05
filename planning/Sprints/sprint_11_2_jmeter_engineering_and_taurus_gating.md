# Sprint 11.2: JMeter Engineering & Taurus Gating

**Navigation**: [⬅️ Previous: Sprint 11.1](sprint_11_1_k6_performance_maturity.md) | [🗺️ Planning Hub](../README.md) | [Phase 11](../Phases/phase_11_performance_engineering_and_observability.md) | [Next: Sprint 11.3 ➡️](sprint_11_3_observability_stack_and_performance_reporting.md)

**Sprint Identifier**: `SPRINT-11.2-JMETER-ENGINEERING-TAURUS`
**Phase Mapping**: [Phase 11](../Phases/phase_11_performance_engineering_and_observability.md)
**Estimated Velocity**: 5 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-11.2-jmeter-taurus`
**Depends On**: Sprint 7.1 (DOCKER), Sprint 7.2 (perf datasets)
**Sprint Goal**: Modularise the JMeter plans, drive them entirely by properties, gate CI on SLAs with Taurus, demonstrate distributed load, and add JMX validation to the PR gate.

---

## 1. Context & Evidence

- `jmeter/Tests/`: `BuggyBooks_Catalog_Load.jmx` (9 assertions), `BuggyBooks_Auth_Stress.jmx` (6), `BuggyBooks_Ecommerce_Journey.jmx` (12), `BuggyBooks_Inventory_Stress.jmx` (5), legacy `CRUDPerformanceTest.jmx` (0).
- Login + JWT extraction + auth header logic is duplicated across the Journey, Auth and Inventory plans.
- `.github/workflows/jmeter-performance.yaml` generates HTML dashboards and Step Summaries but has **no pass/fail criteria**.
- Workflow inputs already parameterise threads, ramp, iterations, host and protocol.

---

## 2. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **Performance Engineer** | JMX refactor, Taurus configs, distributed setup |
| **DevOps Engineer** | Workflow, caching, PR validation |
| **SDET Architect** | SLA review |

---

## 3. Sprint Backlog & User Stories

### US-AF-1121: Modular JMX with fragments (1.5 SP)
- [ ] `jmeter/Fragments/`:
  - `Fragment_Login.jmx` — POST `/api/login`, JSON Extractor `$.token` → `${authToken}`, assertion.
  - `Fragment_BrowseCatalog.jmx` — GET `/api/books` (+ optional `?search=${term}`), extract a random book id.
  - `Fragment_AddToCart.jmx`, `Fragment_PlaceOrder.jmx`.
  - `Fragment_AuthHeader.jmx` — Header Manager `Authorization: Bearer ${authToken}`.
- [ ] Refactor the 4 BuggyBooks plans to use **Include Controllers** (cross-file) / Module Controllers (in-file) instead of duplicated samplers.
- [ ] Every knob comes from properties with defaults: `${__P(host,localhost)}`, `${__P(port,4000)}`, `${__P(protocol,http)}`, `${__P(threads,10)}`, `${__P(rampup,10)}`, `${__P(duration,120)}`, `${__P(thinkMs,500)}`, `${__P(usersCsv,../TestData/users.csv)}`.
- [ ] Think time: Gaussian Random Timer (`${thinkMs}` ± 30%). Thread groups use a **duration-based** schedule (scheduler) instead of loop counts for load profiles.
- [ ] Move `CRUDPerformanceTest.jmx` (moved to `jmeter/Legacy/` in 6.4) out of the workflow entirely; keep it for history or delete it (PO choice, recorded in the PR).

### US-AF-1122: Taurus pass/fail gating (1.5 SP)
- [ ] `jmeter/taurus/` YAML per plan, e.g. `catalog-load.yml`:
  ```yaml
  execution:
    - executor: jmeter
      scenario: catalog
      concurrency: ${THREADS:-10}
      ramp-up: 30s
      hold-for: 2m
  scenarios:
    catalog:
      script: ../Tests/BuggyBooks_Catalog_Load.jmx
      properties: { host: localhost, port: 4000, protocol: http }
  modules:
    jmeter: { version: 5.6.3 }
  reporting:
    - module: passfail
      criteria:
        - avg-rt of GET /api/books>800ms for 30s, stop as failed
        - p95 of GET /api/books>3000ms, continue as failed
        - fail>2% for 30s, stop as failed
    - module: junit-xml
      filename: reports/taurus-catalog-junit.xml
    - module: final-stats
      summary: true
      dump-csv: reports/taurus-catalog-stats.csv
  ```
  SLAs mirror AGENTS.md §4 (catalog < 3000 ms, inventory < 5000 ms) plus error-rate budgets.
- [ ] `jmeter-performance.yaml`: add a `runner: taurus|jmeter` input (default `taurus`); install with `pip install bzt` (cache `~/.bzt`), run `bzt jmeter/taurus/<plan>.yml -o settings.artifacts-dir=reports/taurus`; JUnit → Step Summary; **non-zero exit fails the job**.
- [ ] Keep the native JMeter HTML dashboard generation (`-e -o`) for the portal.
- [ ] Default target becomes DOCKER (`buggybooks-up`); Render only by explicit input with threads capped at 5.

### US-AF-1123: Distributed JMeter (1 SP)
- [ ] `infra/jmeter-distributed/docker-compose.yml`: `jmeter-controller` + 2× `jmeter-worker` (an image built from `eclipse-temurin:17-jre` + JMeter 5.6.3, or the `justb4/jmeter` image pinned by digest), shared network with BuggyBooks, `server.rmi.ssl.disable=true` (local network only, documented).
- [ ] `npm run perf:jmeter:distributed` → `jmeter -n -t … -R jmeter-worker-1,jmeter-worker-2`.
- [ ] Documented as a demonstration of scale-out (not run on every CI build; dispatch input `distributed: true`).

### US-AF-1124: JMX validation in PR gate (1 SP)
- [ ] `scripts/validate-jmx.ts`:
  - Every `.jmx` parses as XML.
  - Every `HTTPSamplerProxy` has a sibling or child `ResponseAssertion` or `JSONPathAssertion`.
  - No hard-coded hosts (`onrender.com`, IPs) inside sampler `domain` fields — they must use `${__P(host)}`.
  - No `View Results Tree` / `Aggregate Report` listeners **enabled** (they hurt non-GUI performance) — must be `enabled="false"`.
- [ ] Add it to the `static-quality` job in `pr-gate.yml`.

---

## 4. Verification Commands

```bash
docker compose -f infra/docker-compose.test.yml up -d --wait
npx tsx scripts/validate-jmx.ts
jmeter -n -t jmeter/Tests/BuggyBooks_Ecommerce_Journey.jmx -Jhost=localhost -Jport=4000 -Jprotocol=http -Jthreads=5 -Jduration=60 -l jmeter/Results/journey.jtl -e -o jmeter/Results/journey-html
pip install bzt && bzt jmeter/taurus/catalog-load.yml
docker compose -f infra/jmeter-distributed/docker-compose.yml up --abort-on-container-exit
```

---

## 5. Code Review Checklist

- [ ] No duplicated login/cart samplers remain across plans.
- [ ] All hosts, ports and protocols are property-driven.
- [ ] Heavy listeners are disabled in committed JMX files.
- [ ] Taurus criteria reference real sampler labels (label typos silently disable criteria — verify with a forced failure run).
- [ ] RMI SSL disabled only in the isolated compose network, with a comment.
- [ ] Catalog entries `TC-PERF-JM-00x` updated with Taurus SLAs in both catalogs.

---

## 6. Definition of Done

- [ ] 4 plans refactored; each runs green under Taurus on DOCKER.
- [ ] A forced SLA breach (e.g. `inventoryDelayMs: 6000` chaos) makes the Taurus job fail — evidence in the PR. Chaos reset afterwards.
- [ ] JMX validation in the PR gate.
- [ ] `jmeter/README.md` rewritten (fragments, properties, Taurus, distributed mode).

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `jmeter/Fragments/*.jmx` | Reusable fragments |
| `jmeter/Tests/*.jmx` (refactored) | Property-driven plans |
| `jmeter/taurus/*.yml` | Pass/fail gating |
| `infra/jmeter-distributed/docker-compose.yml` | Scale-out demo |
| `scripts/validate-jmx.ts` | PR validation |
| `.github/workflows/jmeter-performance.yaml` | Taurus runner, DOCKER default |
