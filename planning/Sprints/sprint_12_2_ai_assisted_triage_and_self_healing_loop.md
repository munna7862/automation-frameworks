# Sprint 12.2: AI-Assisted Triage & Self-Healing Loop

**Navigation**: [⬅️ Previous: Sprint 12.1](sprint_12_1_test_analytics_and_failure_intelligence.md) | [🗺️ Planning Hub](../README.md) | [Phase 12](../Phases/phase_12_intelligent_qualityops_and_free_cloud_native_platform.md) | [Next: Sprint 12.3 ➡️](sprint_12_3_free_cloud_native_execution_platform.md)

**Sprint Identifier**: `SPRINT-12.2-AI-TRIAGE-AND-HEALER-LOOP`
**Phase Mapping**: [Phase 12](../Phases/phase_12_intelligent_qualityops_and_free_cloud_native_platform.md)
**Estimated Velocity**: 4 Story Points
**Sprint Status**: Not Started
**Branch**: `feat/sprint-12.2-ai-triage`
**Depends On**: Sprint 6.1 (redaction), Sprint 12.1 (classification + signatures)
**Sprint Goal**: Use free LLM inference to turn failed runs into actionable root-cause hypotheses, and run a human-in-the-loop healer workflow that proposes fixes as draft PRs — measured, redacted, never auto-merged.

---

## 1. Context

- The repo already has `.github/agents/playwright-healer.agent.md`, `playwright-autopilot*.agent.md`, prompts under `.github/prompts/`, and a Playwright MCP config in `.vscode/mcp.json`. These are used interactively today.
- Free inference options:
  | Provider | Where | Cost | How |
  | :--- | :--- | :--- | :--- |
  | **GitHub Models** | CI | Free, rate-limited | `permissions: models: read` + `GITHUB_TOKEN`, OpenAI-compatible endpoint, or the `actions/ai-inference` action |
  | **Ollama** (`gemma4:e4b`) | Local dev | Free | `tools/ai/run-gemma4-e4b.bat` (moved in Sprint 6.4), REST at `http://localhost:11434` |
  | `none` | Anywhere | — | Deterministic heuristic summary only (signature + category) |

---

## 2. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **SDET Architect** | Prompt design, guardrails, evaluation method |
| **Playwright QA Lead** | Failure-context collector, healer workflow on Playwright specs |
| **DevOps Engineer** | Workflows, permissions, provider configuration |

---

## 3. Sprint Backlog & User Stories

### US-AF-1221: Failure context collector (1 SP)
- [ ] `scripts/ai/collect-failure-context.ts` — for each failed test (max 5 per run):
  - Error message + stack (first 30 lines), test source excerpt (±20 lines around the failing line), the step list from the Playwright JSON, `errorSignature` + `category` from 12.1.
  - DOM excerpt: the aria snapshot (`page.accessibility`/Playwright `ariaSnapshot` captured by the failure hook) — **not** full HTML.
  - Network: the last 10 API calls from `network-log.json` (already redacted by 6.1), bodies truncated to 1 KB.
  - **Second redaction pass** with `redact()` over the whole bundle; hard cap of ~12k characters per test.
- [ ] Output `ai-context/<test-id>.json`; never includes storage state, cookies, `.env` or screenshots.

### US-AF-1222: Pluggable triage summariser (1 SP)
- [ ] `scripts/ai/triage.ts` with a `Provider` interface: `GitHubModelsProvider` (OpenAI-compatible chat completions with a small model available in GitHub Models), `OllamaProvider`, `NoneProvider`. Selected by `AI_PROVIDER` env.
- [ ] Prompt in `.github/prompts/failure-triage.prompt.md` (versioned): role, repo conventions (Chrome only, POM rules, no hard waits, chaos reset), output JSON schema:
  ```json
  { "category": "environment|test-defect|product-defect|intentional-bug",
    "confidence": 0.0, "rootCauseHypothesis": "…", "evidence": ["…"],
    "suggestedFix": { "file": "…", "kind": "locator|wait|data|assertion|none", "description": "…" } }
  ```
- [ ] Validate the model output with zod; on invalid output fall back to `NoneProvider`.
- [ ] Workflow step in `_reusable-e2e.yml` (`if: failure()`, `continue-on-error: true` — informational only), `permissions: models: read`. Writes a "🤖 AI Triage" section to the Step Summary and attaches `triage.json` to the run.

### US-AF-1223: Human-in-the-loop healer workflow (1.5 SP)
- [ ] `.github/workflows/healer.yml` — `workflow_dispatch` inputs: `spec_path`, `run_id` (to fetch context), `provider`.
- [ ] Steps: checkout → `buggybooks-up` (DOCKER) → run the spec to reproduce → collect context → ask the provider for a **unified diff** limited to `src/pages/**` or the given spec (enforced: reject diffs touching other paths) → apply → `npm run lint && npm run typecheck` → run the spec `--repeat-each=5 --retries=0` → if green, open a **draft PR** (`gh pr create --draft`) titled `fix(playwright): healer proposal for <spec>` with the triage JSON and before/after evidence. If not green, upload the attempt as an artifact and stop.
- [ ] `permissions`: `contents: write`, `pull-requests: write`, `models: read` only in this workflow; never `pull_request_target`.
- [ ] Update `.github/agents/playwright-healer.agent.md` to reference the same prompt and guardrails, so interactive and CI healing behave the same.

### US-AF-1224: Evaluation & documentation (0.5 SP)
- [ ] Seed 6 known failures on a throwaway branch (2 locator breaks, 1 removed wait condition, 1 data issue, 1 env outage simulated with a wrong port, 1 intentional bug) → record category accuracy and healer success rate in `docs/ai/triage_evaluation.md`.
- [ ] `docs/AI_TESTING_USER_GUIDE.md`: add a CI triage + healer section (providers, privacy rules, how to run locally with Ollama).

---

## 4. Verification Commands

```bash
# Local with Ollama
tools/ai/run-gemma4-e4b.bat   # or: ollama serve && ollama pull gemma4:e4b
AI_PROVIDER=ollama npx tsx scripts/ai/collect-failure-context.ts --results playwright-e2e/test-results/results.json
AI_PROVIDER=ollama npx tsx scripts/ai/triage.ts --context ai-context/
AI_PROVIDER=none npx tsx scripts/ai/triage.ts --context ai-context/
gh workflow run healer.yml -f spec_path=src/tests/ui/BookCatalog/Test_001_InitialCatalog.spec.ts -f provider=github-models
```

---

## 5. Code Review Checklist

- [ ] No unredacted data can reach a provider (redaction applied twice; unit test with a planted JWT and password).
- [ ] Triage is informational: it can never change a job's conclusion.
- [ ] The healer path allow-list is enforced in code, not only in the prompt.
- [ ] Healer output is always a **draft** PR; no auto-merge, no push to main.
- [ ] The model and prompt versions are recorded in `triage.json` for reproducibility.
- [ ] Workflow permissions minimal; secrets not exposed to model prompts.

---

## 6. Definition of Done

- [ ] A failed nightly run shows an AI Triage section (GitHub Models) and `triage.json`.
- [ ] Healer produced at least 1 valid draft PR on the evaluation branch.
- [ ] Evaluation doc published with accuracy numbers.

---

## 7. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `scripts/ai/collect-failure-context.ts`, `scripts/ai/triage.ts` (+ tests) | Context + summariser |
| `.github/prompts/failure-triage.prompt.md` | Versioned prompt |
| `.github/workflows/healer.yml` | Human-in-the-loop healing |
| `docs/ai/triage_evaluation.md`, `docs/AI_TESTING_USER_GUIDE.md` | Evaluation + guide |
