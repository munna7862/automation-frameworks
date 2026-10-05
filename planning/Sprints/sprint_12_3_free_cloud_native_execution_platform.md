# Sprint 12.3: Free Cloud-Native Execution Platform (kind + Helm + k6-operator)

**Navigation**: [⬅️ Previous: Sprint 12.2](sprint_12_2_ai_assisted_triage_and_self_healing_loop.md) | [🗺️ Planning Hub](../README.md) | [Phase 12](../Phases/phase_12_intelligent_qualityops_and_free_cloud_native_platform.md) | **Sprint 12.3 (Final Milestone of Roadmap v2)**

**Sprint Identifier**: `SPRINT-12.3-FREE-CLOUD-NATIVE-PLATFORM`
**Phase Mapping**: [Phase 12](../Phases/phase_12_intelligent_qualityops_and_free_cloud_native_platform.md)
**Estimated Velocity**: 4 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-12.3-kind-k8s-platform`
**Depends On**: Sprint 7.1 (GHCR images), Sprint 11.1 (k6 scenarios)
**Sprint Goal**: Demonstrate cloud-native test execution at zero cost: a Kubernetes cluster (kind) inside GitHub Actions, BuggyBooks deployed by Helm from GHCR, Playwright shards running as a Kubernetes Indexed Job, and distributed k6 load through k6-operator.

> **Why this instead of Azure**: there's no Azure subscription. kind + Helm + k6-operator show the same patterns (declarative environments, horizontally scaled test execution, distributed load) and transfer directly to AKS/EKS/GKE later.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **DevOps Engineer** | kind workflow, Helm chart, test-runner image |
| **Playwright QA Lead** | Shard Job spec, results collection and merge |
| **Performance Engineer** | k6-operator TestRun |
| **SDET Architect** | Architecture doc, review |

---

## 2. Technical Design

```text
infra/k8s/
├── kind-config.yaml                       # 1 control-plane, extraPortMappings 30080/30400 (optional)
├── charts/buggybooks/                     # Helm chart
│   ├── Chart.yaml  values.yaml
│   └── templates/{backend,frontend}-{deployment,service}.yaml, configmap.yaml, secret.yaml
├── jobs/playwright-shards.yaml            # Indexed Job, completions=4, parallelism=4
├── k6/testrun-catalog.yaml                # k6-operator TestRun (parallelism: 3)
└── README.md
infra/images/test-runner/Dockerfile        # FROM mcr.microsoft.com/playwright:v1.58.0-jammy + Google Chrome + repo + npm ci
```

**Frontend API URL inside the cluster**: the frontend image bakes `VITE_API_URL` at build time. Publish a third tag `ghcr.io/munna7862/buggy-books-frontend:k8s` built with `VITE_API_URL=http://buggybooks-backend:4000/api` (small addition to the Sprint 7.1 publish workflow in `buggy-books`). The test pods run in-cluster, so both service DNS names resolve.

---

## 3. Sprint Backlog & User Stories

### US-AF-1231: Helm chart for BuggyBooks (1 SP)
- [ ] Chart with values: image repos/tags (default GHCR `latest` / `k8s`), replicas, resources (small requests: 100m CPU / 128Mi), `JWT_SECRET` from a Kubernetes Secret (value injected from a GitHub secret at install time, local default for kind), readiness/liveness probes on `/api/health` and `/`.
- [ ] `helm lint` + `helm template | kubeconform -strict` in the PR gate static job (only when `infra/k8s/**` changes).

### US-AF-1232: Test-runner image & Playwright Indexed Job (1.5 SP)
- [ ] `infra/images/test-runner/Dockerfile` — based on the pinned Playwright image, installs **Google Chrome** (`npx playwright install chrome`), copies the repo, runs `npm ci`. Built in the workflow and loaded into kind with `kind load docker-image` (no registry push needed); optionally published to GHCR.
- [ ] `jobs/playwright-shards.yaml` — `completionMode: Indexed`, `completions: 4`, `parallelism: 4`; the container runs
  `npx playwright test --config=src/config/playwright.config.ts --shard=$((JOB_COMPLETION_INDEX+1))/4 --reporter=blob`
  with `ENV=DOCKER`-equivalent `BASE_URL=http://buggybooks-frontend`, `API_BASE_URL=http://buggybooks-backend:4000`.
- [ ] Results: each pod writes its blob report to an `emptyDir` and a final `kubectl cp` (or a sidecar uploading to a shared PVC from kind's local-path provisioner) collects them. Then `npx playwright merge-reports` runs on the runner and the merged report is uploaded as an artifact + Step Summary.

### US-AF-1233: Distributed load with k6-operator (1 SP)
- [ ] Install k6-operator (pinned release manifest or Helm chart `grafana/k6-operator`).
- [ ] `ConfigMap` from `k6-performance/scenarios/catalog-load.js` (+ the `config/` and `utils/` it imports — bundle with `esbuild` into one file first if the imports complicate the ConfigMap).
- [ ] `TestRun` with `parallelism: 3`, `arguments: --tag testid=k8s-<run>`, env `BASE_URL=http://buggybooks-backend:4000`; wait for the `finished` stage, collect runner pod logs and the k6 summary into the Step Summary.
- [ ] Optional: point remote-write at a Prometheus deployed in the same cluster (reuse the Sprint 11.3 config) — stretch.

### US-AF-1234: Workflow & documentation (0.5 SP)
- [ ] `.github/workflows/k8s-e2e.yml` — `workflow_dispatch` + weekly schedule (not per-PR; resource heavy):
  `helm/kind-action` (SHA-pinned) → `helm upgrade --install buggybooks infra/k8s/charts/buggybooks --wait` → build + load test-runner image → apply the Indexed Job → `kubectl wait --for=condition=complete job/playwright-shards --timeout=20m` → collect + merge reports → k6-operator TestRun → summary → always dump `kubectl get events` and pod logs on failure.
- [ ] `docs/architecture/cloud_native_execution.md` — diagram (runner → kind → namespaces → pods), mapping to managed Kubernetes (AKS/EKS/GKE) for the future, resource limits, and the free-tier rationale.

---

## 4. Verification Commands

```bash
kind create cluster --name buggybooks --config infra/k8s/kind-config.yaml
helm upgrade --install buggybooks infra/k8s/charts/buggybooks --wait
kubectl get pods
docker build -t af-test-runner:local -f infra/images/test-runner/Dockerfile .
kind load docker-image af-test-runner:local --name buggybooks
kubectl apply -f infra/k8s/jobs/playwright-shards.yaml
kubectl wait --for=condition=complete job/playwright-shards --timeout=20m
kubectl apply -f infra/k8s/k6/testrun-catalog.yaml
kind delete cluster --name buggybooks
```

---

## 5. Code Review Checklist

- [ ] Helm chart passes `helm lint` and `kubeconform -strict`; resources and probes set.
- [ ] Test-runner image uses **Google Chrome** and the pinned Playwright version (1.58.0) matching `package.json`.
- [ ] Shard math correct (`JOB_COMPLETION_INDEX` is 0-based → `+1`).
- [ ] No secrets baked into images; the Secret is created at install time.
- [ ] The workflow always collects diagnostics (events, logs) on failure and deletes the cluster at the end.
- [ ] Total Playwright test count across shards equals the non-k8s run (110, or the documented exclusions).

---

## 6. Definition of Done

- [ ] `k8s-e2e.yml` green: Helm deploy, 4-shard Playwright Job, merged report, k6-operator run summary.
- [ ] Architecture doc published; planning README updated with Roadmap v2 completion status.
- [ ] Catalog header notes the K8s execution mode.

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `infra/k8s/charts/buggybooks/**` | Helm chart |
| `infra/k8s/kind-config.yaml`, `jobs/playwright-shards.yaml`, `k6/testrun-catalog.yaml` | K8s manifests |
| `infra/images/test-runner/Dockerfile` | Test-runner image (Chrome) |
| `.github/workflows/k8s-e2e.yml` | Cloud-native pipeline |
| `docs/architecture/cloud_native_execution.md` | Architecture |
| `buggy-books` publish workflow addition | `frontend:k8s` tag |

---

**Milestone Completion**: This concludes Roadmap v2 (Phases 6–12, 21 sprints, 95 SP). Return to the [Planning Hub](../README.md) or [Roadmap v2](../Master/enhancement_roadmap_v2.md).
