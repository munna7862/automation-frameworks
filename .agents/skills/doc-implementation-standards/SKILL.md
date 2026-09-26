---
name: doc-implementation-standards
description: Enforces documentation synchronization standards across docs/test_cases_catalog.md, playwright-e2e/test_cases_catalog.md, README.md, docs/intentional_bugs.md, and pull request artifacts.
---

# Documentation Implementation Standards

Every completed feature, test addition, or bug fix must keep `AutomationFrameworks` documentation perfectly synchronized before a pull request can be merged.

---

## 1. Mandatory Documentation Artifacts

### A. Dual Test Cases Catalog Synchronization
The single source of truth for all manual and automated testing in BuggyBooks. The monorepo maintains **strict dual-catalog parity** across two identical files:
1. `docs/test_cases_catalog.md`
2. `playwright-e2e/test_cases_catalog.md`

Whenever an automated spec is added, modified, or quarantined, **both catalogs must be updated in 100% character-for-character lockstep** with:
- **Test ID**: Unique sequential ID (e.g. `UI-AUTH-001`, `API-CHAOS-002`, `TC-SEL-001`, `TC-WDIO-001`, `TC-MOB-001`, `TC-PERF-JM-001`).
- **Title & Description**: High-level workflow summary and specific assertions tested.
- **Priority & Type**: Critical/High/Medium/Low, Web/API/Mobile/Performance.
- **Tags**: `@smoke`, `@regression`, `@chaos`, etc.
- **Covered**: Link to plan/spec path, runner command, and assertion thresholds.

Verify parity before committing:
```bash
git diff docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
```

---

### B. Intentional Bugs & Chaos Guide (`docs/intentional_bugs.md`)
BuggyBooks features intentional anti-patterns and chaos knobs for SQE resilience testing:
- Document the endpoint or UI component exhibiting the behavior.
- Document the chaos knobs (`checkoutFailureRate`, `inventoryDelayMs`, `visualChaos`).
- Provide concrete remediation code recipes for Playwright, Selenium, and WebdriverIO.
- Mandate state restoration (`POST /api/test/reset`) in test teardowns.

---

### C. Standardized Environment Templates (`.env.example`)
- Any new environment variable (`BASE_URL`, `API_BASE_URL`, `BROWSER`, `ELEMENT_TIMEOUT`, `JWT_SECRET`) must be added to root and project `.env.example` templates with clear comments explaining its purpose and safe defaults.

---

### D. Pull Request Summaries (`gh pr create`)
Every pull request must include structured sections:
- **📌 Summary of Changes**: Key architectural and functional additions.
- **🧪 Verification**: Exact test execution output (command output, test counts, pass rates).

---

## 2. Planning Roadmap & Sprint Artifact Standards

When authoring or modifying documents in `planning/`:
1. **Directory Structure**:
   - `planning/Master/master_plan.md`: High-level monorepo architectural vision and 10 pillars.
   - `planning/Phases/phase_X_*.md`: 5 execution phases with story points rollups and sprint mappings.
   - `planning/Sprints/sprint_X_Y_*.md`: 15 sprint specifications with DoD checklists and user story tables.
   - `planning/README.md`: Central roadmap index with the Velocity Rollup Matrix (63 SP total).
2. **Navigation Breadcrumbs**:
   - Every phase file must include a header breadcrumb (`🗺️ Planning Hub` | `📖 Master Plan` | Phase breadcrumbs).
   - Every sprint file must include bidirectional navigation (`⬅️ Previous Sprint` | `🗺️ Planning Hub` | `Sprint X.Y` | `➡️ Next Sprint`) at both top and bottom.
3. **Traceability**:
   - Every sprint file must explicitly map to its parent phase file via relative link `../Phases/phase_X_*.md`.

---

## 3. Universal Cross-Platform Link Portability

- **Zero Windows-Specific URIs**: Never commit `file:///c:/...` or OS-specific absolute paths into repository markdown files.
- **Relative Markdown Paths**: Always use relative paths (`../Phases/...`, `../../docs/...`) so links render and navigate seamlessly on GitHub.com, in IDE markdown previews, and within CI artifact explorers.

