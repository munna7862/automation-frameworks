# Sprint 2.1: Intentional Bugs & Chaos Testing Guide

**Navigation**: [⬅️ Previous: Sprint 1.3](sprint_1_3_monorepo_workspaces_and_utility_unification.md) | [🗺️ Planning Hub](../README.md) | **Sprint 2.1** | [➡️ Next: Sprint 2.2](sprint_2_2_dual_engine_performance_strategy_and_k6_migration.md)

**Sprint Identifier**: `SPRINT-2.1-INTENTIONAL-BUGS-AND-CHAOS-GUIDE`  
**Phase Mapping**: [Phase 2: Documentation Integrity, Anti-Pattern Manual & Quality Gates](../Phases/phase_2_documentation_integrity_anti_pattern_manual_and_quality_gates.md)  
**Estimated Velocity**: 3 Story Points  
**Sprint Status**: Done  
**Sprint Goal**: Author `docs/intentional_bugs.md` in strict compliance with the `doc-implementation-standards` skill, detailing all BuggyBooks intentional failure modes, chaos configuration endpoints, and robust automated testing remediation recipes.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **SDET Architect** | AI Agent / SDET | Authoring `docs/intentional_bugs.md` architecture, anti-pattern catalogs, and code remediation patterns. |
| **Playwright QA Lead** | AI Agent / QA | Validating Playwright remediation recipes against live staging endpoints. |
| **DevOps Engineer** | AI Agent / DevOps | Ensuring chaos state reset protocols are documented and enforced across CI test lifecycles. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-211: Comprehensive Intentional Bugs Manual Authoring
- **Story Statement**:  
  *As an* SDET writing automation tests against BuggyBooks,  
  *I want* an authoritative guide documenting all application anti-patterns and chaos knobs,  
  *So that* I can implement resilient locators, auto-waiting, and error recovery without suffering from false-positive test failures.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [x] Port and customize `docs/intentional_bugs.md` based on `buggy-books`:
    - **Backend Anti-Patterns**:
      1. Intermittent Checkout Failure (`POST /api/test/config` $\rightarrow$ `checkoutFailureRate`).
      2. Delayed Inventory Report (`inventoryDelayMs: 3000`).
      3. Express Rate Limiting (`429 Too Many Requests` on `/api/books`).
      4. Session Sandboxing (`x-test-session-id` header isolation).
    - **UI Anti-Patterns**:
      5. Dynamic Actionability Delay (500–3500ms button latency).
      6. Obfuscated Locators & Missing `data-testid` attributes.
      7. Shadow DOM Encapsulation (`<order-summary-box>`).
      8. Visual Layout Chaos (`visualChaos: true`).
  - [x] Provide explicit, runnable remediation code snippets for Playwright, Selenium, and WebdriverIO.
  - [x] Document strict state restoration commands (`POST /api/test/reset`).
- **Acceptance Criteria**:
  - `docs/intentional_bugs.md` is authored and committed.
  - All 8 anti-patterns have clear descriptions, failure signatures, and remediation code blocks.

### User Story US-AF-212: Teardown Reset Hygiene & Agent Memory Synchronization
- **Story Statement**:  
  *As an* AI coding agent or automation engineer,  
  *I want* clear operational rules in `AGENTS.md` and `.agents/skills/` regarding mandatory test teardown resets,  
  *So that* chaos parameters modified during testing never contaminate subsequent test suites on the shared staging server.
- **Story Points**: 1 SP (Small)
- **Technical Subtasks**:
  - [x] Cross-reference `docs/intentional_bugs.md` in `AGENTS.md` and `.agents/skills/chaos-and-bug-testing/SKILL.md`.
  - [x] Add explicit warnings and code patterns for `test.afterEach` state resets:
    ```typescript
    test.afterEach(async ({ request }) => {
      await request.post('/api/test/config', {
        data: { checkoutFailureRate: 0, inventoryDelayMs: 0, visualChaos: false }
      });
      await request.post('/api/test/reset');
    });
    ```
- **Acceptance Criteria**:
  - `AGENTS.md` links directly to `docs/intentional_bugs.md`.
  - State reset pattern is established as a non-negotiable rule.

---

## 3. Definition of Done & Quality Gates

- [x] `docs/intentional_bugs.md` created with 100% compliance with `doc-implementation-standards`.
- [x] Code examples provided for Playwright, Selenium, and WebdriverIO.
- [x] Safe reset endpoint (`POST /api/test/reset`) explicitly documented.
- [x] `AGENTS.md` updated with cross-references.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `docs/intentional_bugs.md` | Documentation | Authoritative BuggyBooks chaos and anti-pattern testing guide. |
| `AGENTS.md` | Memory | Updated with links to intentional bugs manual and strict teardown policies. |
| `.agents/skills/chaos-and-bug-testing/` | Skill | Aligned with new documentation. |

---

**Next Steps**: Proceed to [Sprint 2.2: Dual-Engine Performance Strategy & k6 Migration](sprint_2_2_dual_engine_performance_strategy_and_k6_migration.md).
