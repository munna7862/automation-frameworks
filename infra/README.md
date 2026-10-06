# 🐳 BuggyBooks Ephemeral Test Infrastructure

This directory provides the containerized, disposable test infrastructure for the **BuggyBooks** application used across local developer testing and CI/CD quality gates.

---

## 🏛️ Architecture & Services

The ephemeral environment runs fresh instances of BuggyBooks directly from GitHub Container Registry (GHCR) images without relying on shared external staging:

| Service         | Container Name         | Image Source                                                                | Port Mapping | Healthcheck                             |
| :-------------- | :--------------------- | :-------------------------------------------------------------------------- | :----------- | :-------------------------------------- |
| **Backend API** | `buggy-books-backend`  | `ghcr.io/munna7862/buggy-books-backend:${BUGGYBOOKS_TAG:-latest}`           | `4000:4000`  | `GET http://localhost:4000/api/health`  |
| **Frontend UI** | `buggy-books-frontend` | `ghcr.io/munna7862/buggy-books-frontend:${BUGGYBOOKS_FE_TAG:-ci-localhost}` | `5173:80`    | `depends_on: backend (service_healthy)` |

### Non-Negotiable Rules

1. **Strictly No Volumes**: `infra/docker-compose.test.yml` does **not** mount persistent volumes. Every run starts with a pristine database (`db.json`) from the container image.
2. **Localhost Resolution in CI**: The frontend image (`:ci-localhost`) is pre-compiled with `VITE_API_URL=http://localhost:4000/api`. Because tests and browsers execute on the runner host (or network host), requests route cleanly to the backend without DNS or CORS complexities.

---

## 🚀 Quickstart (Local Execution)

### 1. Launch the Stack

```bash
# Pull and start services in the background, waiting for healthchecks
docker compose -f infra/docker-compose.test.yml up -d --wait
```

### 2. Verify Health

```bash
# Verify backend API diagnostic health
curl -s http://localhost:4000/api/health

# Verify frontend static root
curl -s -I http://localhost:5173/
```

### 3. Run Automated Suites Against Local Docker

```bash
# Run Playwright Smoke tests against DOCKER profile
cd playwright-e2e
ENV=DOCKER npx playwright test --config=src/config/playwright.config.ts --grep @smoke

# Run Selenium Smoke tests
cd ../selenium-e2e
ENV=DOCKER npm run test:smoke

# Run WebdriverIO Smoke tests
cd ../wdio-e2e
ENV=DOCKER npm run test:smoke
```

### 4. Tear Down the Stack

```bash
# Stop containers and remove networks
docker compose -f infra/docker-compose.test.yml down -v
```

---

## ⚙️ Environment Variables & Overrides

| Variable            | Default          | Purpose                                              |
| :------------------ | :--------------- | :--------------------------------------------------- |
| `BUGGYBOOKS_TAG`    | `latest`         | Tag of the backend image to run (e.g. `sha-xxxxxxx`) |
| `BUGGYBOOKS_FE_TAG` | `ci-localhost`   | Tag of the frontend image to run                     |
| `JWT_SECRET`        | `ci-test-secret` | Ephemeral JWT signing secret for auth services       |
| `NODE_ENV`          | `production`     | Container runtime mode                               |

---

## 🔄 GitHub Actions Integration

The repository encapsulates startup and teardown in composite actions:

- **`.github/actions/buggybooks-up`**: Pulls images, launches compose with `--wait`, waits on HTTP endpoints via `wait-on`, and exports image digests into `$GITHUB_ENV` and `$GITHUB_STEP_SUMMARY`.
- **`.github/actions/buggybooks-down`**: Dumps container stdout/stderr logs into `buggybooks-logs.txt`, uploads them as a workflow artifact, and executes `docker compose down -v`.
