# Sprint 2.3: Unified Pull Request CI Quality Gate (`pr-gate.yml`)

**Navigation**: [⬅️ Previous: Sprint 2.2](sprint_2_2_dual_engine_performance_strategy_and_k6_migration.md) | [🗺️ Planning Hub](../README.md) | **Sprint 2.3** | [➡️ Next: Sprint 3.1](sprint_3_1_buggybooks_selenium_page_objects_and_auth_catalog_smoke.md)

**Sprint Identifier**: `SPRINT-2.3-UNIFIED-PR-QUALITY-GATE`  
**Phase Mapping**: [Phase 2: Documentation Integrity, Anti-Pattern Manual & Quality Gates](../Phases/phase_2_documentation_integrity_anti_pattern_manual_and_quality_gates.md)  
**Estimated Velocity**: 4 Story Points  
**Sprint Status**: Planned  
**Sprint Goal**: Implement an automated, fast-feedback Pull Request Quality Gate pipeline (`.github/workflows/pr-gate.yml`) that validates static quality, warms up staging, and executes smoke tests on Google Chrome in under 3 minutes, blocking regressions from merging into `main`.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **DevOps Engineer** | AI Agent / DevOps | Authoring `.github/workflows/pr-gate.yml`, configuring matrix jobs, and optimizing caching. |
| **SDET Architect** | AI Agent / SDET | Setting quality thresholds, defining mandatory smoke test suites, and enforcing branch protection rules. |
| **Playwright QA Lead** | AI Agent / QA | Ensuring `@smoke` tagged tests execute deterministically within the 3-minute SLA. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-231: Fast PR CI Pipeline Architecture
- **Story Statement**:  
  *As an* Engineering Lead,  
  *I want* an automated GitHub Actions gate running on every pull request to `main`,  
  *So that* broken code, type errors, or failing smoke tests are caught immediately before merging.
- **Story Points**: 2.5 SP (Medium)
- **Technical Subtasks**:
  - [ ] Create `.github/workflows/pr-gate.yml`:
    ```yaml
    name: PR Quality Gate
    on:
      pull_request:
        branches: [main]

    concurrency:
      group: pr-gate-${{ github.ref }}
      cancel-in-progress: true

    jobs:
      static-quality:
        name: Static Quality & Linting
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: 20
              cache: 'npm'
          - run: npm ci
          - run: npm run lint:all
          - run: npm run typecheck:all

      smoke-e2e:
        name: Smoke Tests (Chrome UI + API)
        needs: static-quality
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: 20
              cache: 'npm'
          - run: npm ci
          - name: Staging Pre-Flight Probe
            run: |
              npx wait-on -t 90000 https://buggy-books.onrender.com/api/books
              npx wait-on -t 90000 https://buggy-books-fe.onrender.com/
          - name: Install Google Chrome
            run: npx playwright install --with-deps chrome
          - name: Run Smoke Tests
            run: npm run test:smoke:all
    ```
- **Acceptance Criteria**:
  - Pipeline executes automatically on pull request events.
  - Fails with non-zero exit code if any step fails.

### User Story US-AF-232: Automated PR Feedback & Step Summary
- **Story Statement**:  
  *As a* Developer submitting a pull request,  
  *I want* a rich Step Summary showing passed/failed tests and duration,  
  *So that* I can diagnose failures immediately without digging through raw console logs.
- **Story Points**: 1.5 SP (Medium)
- **Technical Subtasks**:
  - [ ] Add GitHub Step Summary generation step in `pr-gate.yml`:
    ```yaml
    - name: Generate PR Quality Gate Summary
      if: always()
      run: |
        echo "### 🛡️ PR Quality Gate Results" >> $GITHUB_STEP_SUMMARY
        echo "- **Static Quality**: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY
        echo "- **Target Environment**: BuggyBooks Staging" >> $GITHUB_STEP_SUMMARY
        echo "- **Browser**: Google Chrome (Channel: chrome)" >> $GITHUB_STEP_SUMMARY
    ```
  - [ ] Verify execution time remains $< 180$ seconds.
- **Acceptance Criteria**:
  - Step Summary renders cleanly on GitHub Actions summary page.
  - Total workflow execution duration is under 3 minutes.

---

## 3. Definition of Done & Quality Gates

- [ ] `.github/workflows/pr-gate.yml` committed and active on `pull_request: [main]`.
- [ ] Strict single-browser rule adhered to (`channel: 'chrome'`).
- [ ] Mandatory Render warm-up probe included.
- [ ] Concurrency controls cancel outdated in-progress runs on the same branch.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `.github/workflows/pr-gate.yml` | Workflow | High-speed PR verification gate. |
| `package.json` | Config | Root `test:smoke:all` command aligned with PR gate. |

---

**Next Steps**: Proceed to [Sprint 3.1: BuggyBooks Selenium Page Objects & Auth/Catalog Smoke](sprint_3_1_buggybooks_selenium_page_objects_and_auth_catalog_smoke.md).
