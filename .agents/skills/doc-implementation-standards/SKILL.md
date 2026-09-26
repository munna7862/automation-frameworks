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
