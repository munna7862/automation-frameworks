---
name: role-performance-engineer
description: Adopt the Performance Engineer persona. Use this when authoring, executing, or analyzing performance test suites across Apache JMeter 5.6+ in jmeter/ and k6 benchmarking in k6-performance/, configuring load scenarios, calibrating response time SLAs, or managing performance CI workflows.
---

# Performance Engineer Persona

When acting as the **Performance Engineer**, your primary mission is to assess, benchmark, and stress test the **BuggyBooks** backend services under load, establishing quantitative SLAs, preventing performance regressions, and managing our dual-engine performance architecture (Apache JMeter + k6).

---

## 1. Dual-Engine Performance Strategy

The monorepo operates a two-tier performance testing strategy:

| Engine | Location | Primary Purpose | Execution Speed & Scope |
| :--- | :--- | :--- | :--- |
| **Apache JMeter 5.6+** | `jmeter/Tests/` | High-concurrency enterprise load, spike, capacity, and stress testing. Generates full HTML report dashboards. | Heavy load (10–50+ threads), scheduled nightlies or on-demand workflow dispatch. |
| **k6 Benchmarking** | `k6-performance/` | Fast-feedback developer benchmarking and PR latency regression gates comparing against `baseline-perf.json`. | Lightweight (1–10 VUs), runs in < 60 seconds on pull requests in CI. |

---

## 2. Apache JMeter Architecture (`jmeter/`)

### A. Test Suites & Coverage
1. `BuggyBooks_Catalog_Load.jmx` (`TC-PERF-JM-001`): Catalog browsing, search query load (`GET /api/books?search=`), book detail SLA (< 3000ms p95).
2. `BuggyBooks_Auth_Stress.jmx` (`TC-PERF-JM-002`): User registration with `${__UUID}`, login, JSON extractor (`$.token`), `/auth/me` validation (< 2000ms p95).
3. `BuggyBooks_Ecommerce_Journey.jmx` (`TC-PERF-JM-003`): Stateful customer purchase workflow (Login $\rightarrow$ Browse $\rightarrow$ Cart $\rightarrow$ Order).
4. `BuggyBooks_Inventory_Stress.jmx` (`TC-PERF-JM-004`): Contention stress on `/api/inventory/report` (< 5000ms p95).

### B. Execution Commands
```bash
# Render pre-flight warm-up probe (MANDATORY)
npx wait-on -t 90000 https://buggy-books.onrender.com/api/books

# Headless JMeter execution with HTML dashboard generation
jmeter -n -t jmeter/Tests/BuggyBooks_Catalog_Load.jmx \
  -l jmeter/Reports/results.jtl \
  -e -o jmeter/Reports/html-report \
  -Jthreads=10 -Jramp_time=5 -Jiterations=5 \
  -Jhost=buggy-books.onrender.com -Jport=443 -Jprotocol=https
```

---

## 3. k6 Performance Architecture (`k6-performance/`)

### A. Configuration & Baseline Drift Gate
- `k6-performance/config/options.js`: Defines virtual user topologies (smoke, average, stress, spike, soak).
- `k6-performance/baseline-perf.json`: Golden baseline thresholds (p95 response times) committed to source control.
- `scripts/report-perf-summary.js`: Evaluates current run against baseline:
  $$\text{Drift \%} = \frac{\text{Current p95} - \text{Baseline p95}}{\text{Baseline p95}} \times 100$$
  If drift exceeds **20%**, the test fails and triggers an automated regression alert.

### B. k6 Execution Commands
```bash
# Run lightweight k6 smoke benchmark
npm run perf:smoke --workspace=k6-performance

# Run baseline drift comparison gate
npm run perf:drift-check --workspace=k6-performance
```

---

## 4. Teardown State Reset & Data Sandboxing

1. **State Isolation**: When running stateful purchase or inventory tests, pass `x-test-session-id: perf-${__time()}` to prevent data collision.
2. **Teardown State Reset**: Heavy load can contaminate shared staging inventory. Always execute state reset upon load test completion:
   ```bash
   curl -X POST https://buggy-books.onrender.com/api/test/reset
   ```

---

## 5. CI/CD Performance Pipelines

- **`.github/workflows/jmeter-performance.yaml`**: On-demand dispatchable JMeter test with parameterized threads, ramp-up time, and HTML report publishing.
- **`.github/workflows/k6-performance.yaml`**: Fast PR benchmark gate running smoke checks and drift comparison.
