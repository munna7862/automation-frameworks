# Developer Onboarding & Zero-to-Green Guide

Welcome to the **BuggyBooks AutomationFrameworks** monorepo! This guide is designed to get any engineer or contributor from repository clone to a passing local test run in **under 10 minutes**.

---

## 🎯 Quick Start: Choose Your Onboarding Path

You can work in this repository through three supported paths:

| Path | Prerequisites | Best For | Zero-to-Green Time |
| :--- | :--- | :--- | :---: |
| **Path A: GitHub Codespaces** | Web browser or VS Code | Zero local install, instant setup | ~2 min |
| **Path B: Local Dev Container** | VS Code + Docker Desktop | Consistent Linux container on your machine | ~5 min |
| **Path C: Bare-Metal Local** | Node 24, Chrome, Java, Docker | Direct host machine development | ~8 min |

---

## 🚀 Path A: GitHub Codespaces (Zero Local Install)

GitHub Codespaces runs our pre-configured dev container in the cloud with every tool, browser, runtime, and port forwarding pre-baked.

> [!NOTE]
> **Free Monthly Allowance**: Personal GitHub accounts receive **60 free core-hours per month**, which is more than enough for regular PR authoring, local test verification, and review workflows.

1. Navigate to the repository on GitHub: `https://github.com/munna7862/automation-frameworks`.
2. Click **Code** ➔ **Codespaces** ➔ **Create codespace on main** (or on your branch).
3. Once the Codespace opens in your browser or VS Code, the `postCreateCommand` automatically runs `npm ci && npx husky`.
4. Open the integrated terminal and run the verification sequence:
   ```bash
   task env:up && task test:pr && task env:down
   ```

---

## 🐳 Path B: Local Dev Container (Recommended for Local Dev)

The local dev container runs inside your Docker daemon using VS Code Remote Containers. It gives you an identical environment to CI without polluting your host machine.

### Prerequisites

1. **Docker Desktop** (or Docker Engine on Linux):
   - On Windows: Ensure **WSL 2 backend** is enabled in Docker Desktop Settings ➔ General.
2. **Visual Studio Code**:
   - Install the **Dev Containers** extension (`ms-vscode-remote.remote-containers`).

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/munna7862/automation-frameworks.git
   cd automation-frameworks
   ```
2. Open the folder in VS Code:
   ```bash
   code .
   ```
3. When prompted in the lower right, click **Reopen in Container** (or press `F1` / `Ctrl+Shift+P` and select **Dev Containers: Reopen in Container**).
4. VS Code builds the image from `.devcontainer/Dockerfile` and provisions:
   - **Node.js 24 LTS**
   - **Google Chrome Stable** (strictly enforced single-browser policy per AGENTS.md §1)
   - **Apache JMeter 5.6.3** (`/opt/jmeter` on `PATH`)
   - **Grafana k6** (official package on `PATH`)
   - **Allure CLI 2.34.1** (`/opt/allure` on `PATH`)
   - **go-task** (`/usr/local/bin/task`)
   - Automatic port forwarding for `4000`, `5173`, `3000`, and `9090`
5. Run the PR verification suite:
   ```bash
   task env:up && task test:pr && task env:down
   ```

---

## 💻 Path C: Bare-Metal Local Machine Setup

If you prefer to run directly on your host operating system (Windows, macOS, or Linux):

### Prerequisites

| Tool | Version Requirement | Purpose | Verification Command |
| :--- | :--- | :--- | :--- |
| **Node.js** | `24.x LTS` (or `.nvmrc`) | Monorepo runtime & scripts | `node -v` |
| **npm** | `10.x+` | Package manager | `npm -v` |
| **Google Chrome** | Stable (Latest) | Single-browser test execution | `google-chrome --version` or `chrome.exe` |
| **Docker** | Docker Desktop / Engine | Ephemeral BuggyBooks containers | `docker compose version` |
| **Java (JRE/JDK)** | `17+` (Eclipse Temurin) | Allure CLI report generation & JMeter | `java -version` |
| **Apache JMeter** | `5.6.3` | Performance stress test plans | `jmeter --version` |
| **Grafana k6** | `v0.50+` | Performance drift gates | `k6 version` |
| **Task (go-task)** | Optional (`v3.x`) | Task runner (or use root npm scripts) | `task --version` |

### Step-by-Step Setup

1. **Install dependencies**:
   ```bash
   npm ci
   ```
2. **Install Chrome browser dependencies for Playwright**:
   ```bash
   npx playwright install-deps chrome
   ```
3. **Verify Google Chrome**:
   Playwright runs exclusively against Google Chrome (`channel: 'chrome'`). Ensure Google Chrome is installed on your operating system.

---

## ⚡ Daily Development Workflows & Task Runner

The repository provides a unified [go-task](https://taskfile.dev) runner (`Taskfile.yml`), with **100% mirrored npm scripts** in root `package.json` for engineers without `task`:

| Workflow Goal | Using `task` | Using `npm` | What it Does |
| :--- | :--- | :--- | :--- |
| **Start BuggyBooks Stack** | `task env:up` | `npm run env:up` | Launches backend (`:4000`) & frontend (`:5173`) via Docker Compose and awaits health checks. |
| **Stop BuggyBooks Stack** | `task env:down` | `npm run env:down` | Tears down containers and purges volumes for a clean state. |
| **Tail Container Logs** | `task env:logs` | `npm run env:logs` | Streams live container logs from backend and frontend. |
| **Run PR Quality Gate** | `task test:pr` | `npm run test:pr` | Runs lint, typecheck, catalog verification, and DOCKER smoke tests. |
| **Playwright Full Suite** | `task test:pw` | `npm run test:pw` | Runs all Chrome UI and API tests against local `ENV=DOCKER`. |
| **Selenium Full Suite** | `task test:selenium` | `npm run test:selenium` | Runs all Selenium WebDriver tests against local `ENV=DOCKER`. |
| **WebdriverIO Full Suite** | `task test:wdio` | `npm run test:wdio` | Runs all WebdriverIO tests against local `ENV=DOCKER`. |
| **k6 Performance Smoke** | `task perf:smoke` | `npm run perf:smoke` | Executes k6 smoke scenario against local backend. |
| **JMeter Catalog Test** | `task perf:jmeter` | `npm run perf:jmeter` | Runs headless JMeter catalog benchmark against localhost:4000. |
| **Allure Report** | `task report:allure` | `npm run report:allure` | Generates and opens local Playwright Allure HTML report. |
| **Local Security Scan** | `task security:scan` | `npm run security:scan` | Executes Gitleaks secret detection and OSV dependency scanner. |

---

## 🧪 Testcontainers Mode (On-Demand Ephemeral Stack)

For automated local spec development where you don't want to manually run `task env:up` and `task env:down`, Playwright provides built-in **Testcontainers Mode**:

```bash
cd playwright-e2e
cross-env ENV=DOCKER BUGGYBOOKS_AUTOSTART=true npx playwright test --grep @smoke
```

### How Testcontainers Mode Works

1. **Automatic Detection**: When `ENV=DOCKER` and `BUGGYBOOKS_AUTOSTART=true` are present in local runs, `playwright-e2e/src/config/global-setup.ts` detects the configuration.
2. **Smart Stack Reuse**: It first probes `http://localhost:4000/api/health` and `http://localhost:5173/`. If an existing stack is already online (e.g. from `task env:up`), autostart is bypassed and the running stack is reused.
3. **Hermetic Spin-up**: If no stack is detected, `DockerComposeEnvironment` starts `infra/docker-compose.test.yml` and waits for health probes.
4. **Automated Teardown**: `playwright-e2e/src/config/global-teardown.ts` halts and purges the containers when tests complete.
5. **CI Safety**: Testcontainers autostart is strictly disabled in CI (`process.env.CI`), ensuring CI continues to use the dedicated GitHub Actions composite action (`buggybooks-up`).

> [!IMPORTANT]
> **Docker Desktop Requirement**: Testcontainers mode requires Docker Desktop (or the Docker daemon) to be running. If Docker is closed, the runner will output an actionable error message.

---

## 🛠️ Troubleshooting & Known Gotchas

### 1. Ports 4000 or 5173 Already in Use

- **Symptoms**: `Error: bind: address already in use` or Docker compose fails during startup.
- **Root Cause**: An orphaned BuggyBooks container or host process is occupying port 4000 or 5173.
- **Resolution**:
  ```bash
  # Purge any existing docker compose test containers
  task env:down  # or npm run env:down

  # On Windows (PowerShell):
  Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force

  # On Linux / macOS:
  lsof -ti:4000 | xargs kill -9
  ```

### 2. Docker Daemon Not Running

- **Symptoms**: `connect ENOENT //./pipe/docker_engine` or `Cannot connect to the Docker daemon`.
- **Root Cause**: Docker Desktop is stopped or WSL2 integration is disabled.
- **Resolution**:
  1. Open Docker Desktop.
  2. Verify daemon status with `docker info`.
  3. On Windows: Open Docker Desktop Settings ➔ Resources ➔ WSL Integration, and ensure your default distro is checked.

### 3. Google Chrome Channel Missing

- **Symptoms**: `browserType.launch: Chromium distribution 'chrome' not found`.
- **Root Cause**: Running with bundled Chromium instead of Google Chrome stable.
- **Resolution**:
  Per monorepo policy (AGENTS.md §1), all browser suites run exclusively on Google Chrome:
  ```bash
  # Install Google Chrome stable on Linux:
  npx playwright install-deps chrome

  # On Windows / macOS:
  # Download and install Google Chrome from https://www.google.com/chrome/
  ```

### 4. Render Staging Cold-Start Latency (`ENV=STAGING`)

- **Symptoms**: First test request times out after 30–60 seconds when testing against Staging.
- **Root Cause**: Free-tier Render instances sleep after 15 minutes of inactivity.
- **Resolution**:
  Always execute the pre-flight warm-up probe before Staging test runs:
  ```bash
  npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
  npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
  ```
  _Tip: Local development and PR validation should always use `ENV=DOCKER` to avoid cold starts completely._

### 5. Intentional Chaos State Leaks

- **Symptoms**: Unexpected 500 errors on `/api/orders` or checkout timeouts in subsequent tests.
- **Root Cause**: A chaos test changed `/api/test/config` without running `/api/test/reset`.
- **Resolution**:
  Reset the BuggyBooks state via curl:
  ```bash
  curl -X POST http://localhost:4000/api/test/reset
  ```

---

## 📚 Related Documentation

- 📋 [**Test Cases Catalog**](test_cases_catalog.md)
- 🐛 [**Intentional Bugs & Anti-Patterns Playbook**](intentional_bugs.md)
- 🐳 [**Ephemeral CI/Local Environment (`infra/README.md`)**](../infra/README.md)
- 📦 [**Reusable Packages Guide**](ReusablePackage.md)
- 🧠 [**Always-On Engineering Guidelines (`AGENTS.md`)**](../AGENTS.md)
