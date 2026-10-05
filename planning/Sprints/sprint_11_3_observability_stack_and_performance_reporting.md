# Sprint 11.3: Observability Stack & Performance Reporting

**Navigation**: [⬅️ Previous: Sprint 11.2](sprint_11_2_jmeter_engineering_and_taurus_gating.md) | [🗺️ Planning Hub](../README.md) | [Phase 11](../Phases/phase_11_performance_engineering_and_observability.md) | [Next: Sprint 12.1 ➡️](sprint_12_1_test_analytics_and_failure_intelligence.md)

**Sprint Identifier**: `SPRINT-11.3-OBSERVABILITY-STACK`
**Phase Mapping**: [Phase 11](../Phases/phase_11_performance_engineering_and_observability.md)
**Estimated Velocity**: 5 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-11.3-observability`
**Depends On**: Sprints 11.1 and 11.2
**Sprint Goal**: Stand up a free, self-hosted observability stack (Prometheus, Grafana, InfluxDB) that puts k6, JMeter and BuggyBooks server metrics on one timeline, with dashboards as code, optional distributed tracing, and an SLO/capacity model.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **DevOps Engineer** | Compose stack, provisioning, CI snapshot job |
| **Performance Engineer** | Dashboards, SLO/capacity doc, metric mapping |
| **SDET Architect** | Review; trace-correlation design (optional story) |

---

## 2. Technical Design

```text
infra/observability/
├── docker-compose.yml          # prometheus, grafana, influxdb (v2), json-exporter (fallback), jaeger (optional profile)
├── prometheus/prometheus.yml   # scrape: buggybooks backend (metrics), json-exporter; remote-write receiver enabled
├── json-exporter/config.yml    # maps GET /api/metrics JSON → Prometheus metrics (fallback path)
├── grafana/provisioning/
│   ├── datasources/datasources.yml   # Prometheus + InfluxDB
│   └── dashboards/dashboards.yml
└── grafana/dashboards/
    ├── k6-load-overview.json         # VUs, RPS, p95 per endpoint, errors, dropped iterations
    ├── jmeter-overview.json          # Backend Listener metrics from InfluxDB
    └── buggybooks-server.json        # heap/RSS/handles/event-loop lag + request latency (server side)
```

- **k6** → `--out experimental-prometheus-rw` (`K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write`, `K6_PROMETHEUS_RW_TREND_STATS=p(95),p(99),avg`). Prometheus started with `--web.enable-remote-write-receiver`.
- **JMeter** → Backend Listener `InfluxdbBackendListenerClient` (InfluxDB v2 URL + token from env), added to the fragments from 11.2 as a **disabled-by-default** element toggled by `-JinfluxEnabled=true`.
- **Backend metrics**:
  - *Preferred (cross-repo)*: add `prom-client` to `buggy-books` with `GET /api/metrics/prometheus` (default Node.js process metrics + an `http_request_duration_seconds` histogram by route). Small PR in our own app repo.
  - *Fallback*: `prometheus-community/json-exporter` scraping the existing JSON `GET /api/metrics`.

---

## 3. Sprint Backlog & User Stories

### US-AF-1131: Compose stack & provisioning (1.5 SP)
- [ ] Author the `infra/observability/` tree above; pin every image by version.
- [ ] Grafana anonymous viewer enabled **locally only** (`GF_AUTH_ANONYMOUS_ENABLED=true`, bound to `127.0.0.1`).
- [ ] Task/npm scripts: `obs:up`, `obs:down`, `perf:smoke:obs` (k6 smoke with remote-write on).
- [ ] Dev container forwards ports 3000 and 9090 (from 7.3).

### US-AF-1132: Backend metrics exposure (1 SP)
- [ ] Open the `prom-client` PR in `buggy-books` (preferred) **or** configure json-exporter (fallback); document which is active in `infra/observability/README.md`.
- [ ] `buggybooks-server.json` dashboard: process CPU, heap, RSS, event-loop lag, request rate and latency by route, error rate.

### US-AF-1133: Dashboards as code (1 SP)
- [ ] Build the 3 dashboards; export JSON with `"id": null` and fixed `uid`s; template variables for `testid` (k6 `--tag testid=<run>`) and `scenario`.
- [ ] A "correlation" row on `k6-load-overview`: k6 p95 for `GET /books` next to server-side p95 for the same route, plus heap — the point of this sprint.

### US-AF-1134: CI snapshot & perf portal (1 SP)
- [ ] Nightly perf job (`k6-performance.yaml` nightly mode): `obs:up` → k6 catalog + mixed workload with remote-write → render **PNG panels** via the Grafana HTTP render API (`grafana-image-renderer` container), or skip images and archive the Prometheus TSDB snapshot (`/api/v1/admin/tsdb/snapshot`) as an artifact for local replay. Pick one and document it; PNGs are preferred for the portal.
- [ ] Portal: a perf trend page (p95 per scenario over time) built from `perf-history.json` with a lightweight chart (Chart.js via CDN, already consistent with the portal stack).

### US-AF-1135: SLOs, capacity model & optional tracing (0.5 SP)
- [ ] `docs/performance/slo_and_capacity_model.md`: SLO per endpoint (p95, error rate), how SLOs map to k6 thresholds, Taurus criteria and Web Vitals budgets; breakpoint results (from `breakpoint-test.js`); capacity headroom; perf-bug triage runbook (client vs server vs network).
- [ ] *Optional (profile `tracing`)*: Jaeger all-in-one + OpenTelemetry Node SDK in `buggy-books` (cross-repo, opt-in), with k6/Playwright sending `traceparent` headers → slow requests found by tests can be opened as traces. Mark as stretch.

---

## 4. Verification Commands

```bash
docker compose -f infra/docker-compose.test.yml up -d --wait
docker compose -f infra/observability/docker-compose.yml up -d
curl -s http://localhost:9090/-/ready && curl -s http://localhost:3000/api/health
cd k6-performance && K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
  BASE_URL=http://localhost:4000 k6 run --out experimental-prometheus-rw --tag testid=local-1 scenarios/catalog-load.js
# open http://localhost:3000 → "k6 Load Overview" shows the run with server metrics alongside
jmeter -n -t jmeter/Tests/BuggyBooks_Catalog_Load.jmx -JinfluxEnabled=true -Jhost=localhost -Jport=4000 -Jprotocol=http
```

---

## 5. Code Review Checklist

- [ ] All images pinned; no `latest`.
- [ ] Grafana/Influx credentials come from env with local-only defaults; nothing secret committed.
- [ ] Dashboards provisioned from files (no manual-only setup); `uid`s stable.
- [ ] The Influx backend listener is disabled by default (no CI breakage when the stack isn't up).
- [ ] The correlation panel actually joins client and server views for the same route.
- [ ] The cross-repo change (prom-client) is linked, or the fallback is documented.

---

## 6. Definition of Done

- [ ] `obs:up` + k6 run shows live data on all 3 dashboards.
- [ ] JMeter run with `influxEnabled=true` visible in the JMeter dashboard.
- [ ] Nightly perf publishes panel PNGs (or a TSDB snapshot) and the trend page to the portal.
- [ ] SLO and capacity document published; `docs/architecture/reporting_architecture.md` updated.

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `infra/observability/**` | Prometheus, Grafana, InfluxDB, json-exporter, optional Jaeger |
| `infra/observability/grafana/dashboards/*.json` | Dashboards as code |
| `buggy-books` PR (prom-client) | Server metrics (preferred path) |
| Portal perf trend page | Historical p95 trends |
| `docs/performance/slo_and_capacity_model.md` | SLOs and capacity |
