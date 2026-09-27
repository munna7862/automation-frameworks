# Task Backlog: AutomationFrameworks Sprint Execution

## Current Focus: Sprint 2.1 — Intentional Bugs & Chaos Testing Guide

**Sprint Identifier**: `SPRINT-2.1-INTENTIONAL-BUGS-AND-CHAOS-GUIDE`  
**Phase**: Phase 2 (Documentation Integrity, Anti-Pattern Manual & Quality Gates)  
**Story Points**: 3 SP  
**Branch**: `feat/sprint-2.1-intentional-bugs-and-chaos-guide`  
**Goal**: Author `docs/intentional_bugs.md` in strict compliance with the `doc-implementation-standards` skill, detailing all BuggyBooks intentional failure modes, chaos configuration endpoints, and robust automated testing remediation recipes across Playwright, Selenium, and WebdriverIO.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Role Assignment | Responsibilities for this Sprint | Status |
| :--- | :--- | :--- | :--- |
| **Scrum Master** | `role-scrum-master` | Sprint planning, `task.md` tracking, DoR verification, and DoD audit. | `COMPLETED` |
| **SDET Architect** | `role-sdet-architect` | Authoring `docs/intentional_bugs.md`, cross-framework remediation recipes, and code review gate. | `COMPLETED` |
| **Playwright QA Lead** | `role-playwright-automation` | Validating Playwright remediation patterns and live staging API responses. | `COMPLETED` |
| **DevOps Engineer** | `role-devops-engineer` | Ensuring chaos state reset protocols in CI and managing PR release lifecycle. | `COMPLETED` |
| **Product Owner** | Human Tech Lead (`User`) | Backlog prioritization, sprint kickoff, and final PR review & merge. | `STANDBY` |

---

## 2. Granular Task Breakdown

### US-AF-211: Comprehensive Intentional Bugs Manual Authoring (2 SP)
- [x] **US-AF-211.1** (`SDET Architect`): Author `docs/intentional_bugs.md` documenting 4 Backend Anti-Patterns (Intermittent Checkout Failure, Delayed Inventory Report, Express Rate Limiting, Session Sandboxing).
- [x] **US-AF-211.2** (`SDET Architect`): Document 4 UI Anti-Patterns in `docs/intentional_bugs.md` (Dynamic Actionability Delay, Obfuscated Locators, Shadow DOM Encapsulation, Visual Layout Chaos).
- [x] **US-AF-211.3** (`SDET Architect` / `Playwright QA Lead`): Provide complete, runnable remediation code recipes for Playwright, Selenium, and WebdriverIO for each pattern.
- [x] **US-AF-211.4** (`SDET Architect`): Document safe teardown state restoration commands (`POST /api/test/reset` and payload cleanup).

### US-AF-212: Teardown Reset Hygiene & Agent Memory Synchronization (1 SP)
- [x] **US-AF-212.1** (`SDET Architect`): Cross-reference `docs/intentional_bugs.md` and strengthen teardown reset hygiene rules in `AGENTS.md`.
- [x] **US-AF-212.2** (`SDET Architect`): Update `.agents/skills/chaos-and-bug-testing/SKILL.md` to reference `docs/intentional_bugs.md` and synchronize anti-pattern remediation.
- [x] **US-AF-212.3** (`Scrum Master`): Update sprint statuses across `planning/README.md`, `planning/Phases/phase_2_*.md`, and `planning/Sprints/sprint_2_1_*.md`.
- [x] **US-AF-212.4** (`Scrum Master` / `DevOps Engineer`): Run full DoD audit (static analysis, dual-catalog parity, lint/typecheck).
- [x] **US-AF-212.5** (`DevOps Engineer`): Stage, commit with conventional message, and push branch to remote repository.

---

## 3. Sprint Review Comments & Refinement Loop

| Gate / Reviewer | Target Role | Review Feedback & Comments | Gate Status |
| :--- | :--- | :--- | :---: |
| **Pre-Flight Architecture Gate** | SDET Architect | Staging warm-up passed, branch checked out, dual-catalog parity verified at baseline. | `[APPROVED]` |
| **Code Acceptance Review Gate** | SDET Architect | Verified comprehensive coverage of all 8 anti-patterns (4 Backend + 4 UI), runnable code recipes for Playwright/Selenium/WDIO, mandatory reset hooks, and zero absolute Windows paths. | `[APPROVED]` |
| **Scrum Master DoD Gate** | Scrum Master | Audited static typechecks across workspaces (exit 0), dual-catalog parity (zero diff), and documentation integrity. | `[APPROVED]` |
| **DevOps Release Gate** | DevOps Engineer | Validated Git working tree, conventional commit formatting, and clean branch state. | `[APPROVED]` |
| **Final Human Sign-Off** | Human Tech Lead | Final PR review and merge to `main`. | `[READY_FOR_MERGE]` |

---

## 4. Definition of Done (DoD) Checklist

- [x] `docs/intentional_bugs.md` authored with 100% compliance with `doc-implementation-standards` skill.
- [x] All 8 anti-patterns (4 Backend + 4 UI) comprehensively detailed with failure signatures, HTTP/DOM specifications, and remediation recipes.
- [x] Cross-framework remediation snippets provided for Playwright, Selenium, and WebdriverIO.
- [x] State restoration commands (`POST /api/test/reset`) strictly enforced and documented.
- [x] `AGENTS.md` and `.agents/skills/chaos-and-bug-testing/SKILL.md` synchronized with relative links.
- [x] Dual-catalog parity confirmed: `git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md` exits 0.
- [x] Static typecheck passes cleanly across workspaces: `npm run typecheck --prefix playwright-e2e`, `npm run typecheck --prefix packages/playwright-utils`.
- [x] Zero absolute Windows paths (`file:///c:/...`) introduced in any markdown or configuration files.

---

## 5. Verification & Execution Evidence

```bash
# Command 1: Dual-catalog parity check
git diff --exit-code docs/test_cases_catalog.md playwright-e2e/test_cases_catalog.md
# Status: 0 diff, exit code 0

# Command 2: Static analysis
npm run typecheck --prefix playwright-e2e
npm run typecheck --prefix packages/playwright-utils
# Status: Both workspaces pass with 0 errors

# Command 3: Git status & branch check
git status
# Status: On branch feat/sprint-2.1-intentional-bugs-and-chaos-guide
```
