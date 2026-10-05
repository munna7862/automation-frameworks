# 🚀 JMeter Performance Testing Framework

This module contains Apache JMeter performance, load, and stress test suites for the **BuggyBooks** platform and general API benchmarks.

---

## 📂 Directory Structure

```
jmeter/
├── Tests/
│   ├── BuggyBooks_Catalog_Load.jmx       # Catalog search, pagination & detail latency benchmarks
│   ├── BuggyBooks_Auth_Stress.jmx        # User registration, JWT login & authenticated profile stress
│   ├── BuggyBooks_Ecommerce_Journey.jmx  # Realistic multi-step customer purchasing journey
│   └── BuggyBooks_Inventory_Stress.jmx   # Delayed inventory report throughput under contention
├── Legacy/
│   └── CRUDPerformanceTest.jmx          # Legacy sample CRUD benchmark (0 assertions)
├── TestData/
│   ├── catalog_search.csv                # Keywords & book IDs for search load
│   ├── users.csv                         # Credentials for authentication stress
│   └── UserId.csv                        # Sample IDs for CRUD test
└── Results/                              # Generated .jtl log files and artifacts
```

---

## 🛠️ Test Plans Overview

| Test Plan                              | Target Endpoints                                                                                                                        | Key Assertions & SLAs                                   |
| :------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| **`BuggyBooks_Catalog_Load.jmx`**      | `GET /api/books?page=1&limit=8`<br>`GET /api/books?search=${search_term}`<br>`GET /api/books/${book_id}`                                | HTTP 200 OK<br>Response Time $< 3000\text{ ms}$         |
| **`BuggyBooks_Auth_Stress.jmx`**       | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`GET /api/auth/me`                                                               | HTTP 200/201<br>JSON Extractor `$.token` valid          |
| **`BuggyBooks_Ecommerce_Journey.jmx`** | Auth $\rightarrow$ Browse Catalog $\rightarrow$ View Detail $\rightarrow$ Add to Cart $\rightarrow$ View Cart $\rightarrow$ Place Order | State continuity across steps<br>Order creation 200/201 |
| **`BuggyBooks_Inventory_Stress.jmx`**  | `GET /api/inventory/report`                                                                                                             | HTTP 200 OK<br>Response Time $< 5000\text{ ms}$         |

---

## 💻 Running Tests Locally

### Prerequisites:

- Java 17+ installed and on `PATH`.
- Apache JMeter 5.6+ installed and `jmeter` binary on `PATH`.

### Execution Examples:

#### 1. Catalog Load Benchmark:

```bash
cd jmeter
jmeter -n \
  -t Tests/BuggyBooks_Catalog_Load.jmx \
  -l Results/catalog-results.jtl \
  -e -o Reports/catalog-report \
  -Jhost=buggy-books.onrender.com \
  -Jprotocol=https \
  -JTHREAD_COUNT=5 \
  -JRAMP_TIME=5 \
  -JITERATIONS=5 \
  -JCSV_FILE=TestData/catalog_search.csv
```

#### 2. Authentication Stress Test:

```bash
cd jmeter
jmeter -n \
  -t Tests/BuggyBooks_Auth_Stress.jmx \
  -l Results/auth-results.jtl \
  -e -o Reports/auth-report \
  -Jhost=buggy-books.onrender.com \
  -Jprotocol=https \
  -JTHREAD_COUNT=10 \
  -JRAMP_TIME=10 \
  -JITERATIONS=5 \
  -JCSV_FILE=TestData/users.csv
```

#### 3. E-Commerce Purchasing Journey:

```bash
cd jmeter
jmeter -n \
  -t Tests/BuggyBooks_Ecommerce_Journey.jmx \
  -l Results/journey-results.jtl \
  -e -o Reports/journey-report \
  -Jhost=buggy-books.onrender.com \
  -Jprotocol=https \
  -JTHREAD_COUNT=2 \
  -JRAMP_TIME=5 \
  -JITERATIONS=2 \
  -JCSV_FILE=TestData/users.csv
```

---

## 🤖 CI/CD Automation

The GitHub Actions workflow [`.github/workflows/jmeter-performance.yaml`](../.github/workflows/jmeter-performance.yaml) automates running these benchmarks on-demand:

- **Selectable Test Plan**: Dropdown to choose any BuggyBooks test plan or CRUD sample.
- **Configurable Virtual Users**: Parameterize `thread_count`, `ramp_time`, and `iterations`.
- **Pre-Flight Render Wake-Up**: Wakes up sleeping Render free-tier instances prior to load generation.
- **HTML Dashboard Reporting**: Generates interactive charts and publishes Step Summaries.
