# Sprint 10.2: Accessibility, Web Vitals & Visual Hardening

**Navigation**: [⬅️ Previous: Sprint 10.1](sprint_10_1_ui_determinism_and_lint_enforcement.md) | [🗺️ Planning Hub](../README.md) | [Phase 10](../Phases/phase_10_ui_quality_web_vitals_and_framework_parity.md) | [Next: Sprint 10.3 ➡️](sprint_10_3_selenium_and_wdio_parity_expansion.md)

**Sprint Identifier**: `SPRINT-10.2-A11Y-WEB-VITALS-VISUAL`
**Phase Mapping**: [Phase 10](../Phases/phase_10_ui_quality_web_vitals_and_framework_parity.md)
**Estimated Velocity**: 5 Story Points
**Sprint Status**: Completed
**Branch**: `feat/sprint-10.2-a11y-webvitals`
**Depends On**: Sprint 10.1
**Sprint Goal**: Expand accessibility coverage to every page and key state, add Core Web Vitals budgets and Lighthouse CI in Google Chrome, offer an optional Chrome viewport matrix, and make visual baselines environment-independent.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Responsibilities |
| :--- | :--- |
| **Playwright QA Lead** | a11y specs, Web Vitals fixture, visual hardening |
| **Performance Engineer** | Budget values, Lighthouse configuration |
| **DevOps Engineer** | Lighthouse CI job, portal trend data |
| **SDET Architect** | WCAG mapping, review |

---

## 2. Sprint Backlog & User Stories

### US-AF-1021: Accessibility expansion (1.5 SP)
- [x] `src/core/a11y/a11y.fixture.ts` — `a11y.scan(name, { include?, exclude?, disableRules? })` wraps `@axe-core/playwright` with tags `['wcag2a','wcag2aa','wcag21aa','wcag22aa']`, attaches the JSON results to Allure, and fails on `critical`/`serious` impacts.
- [x] Pages and states to scan: login, register, catalog, search results, book detail, cart (empty + filled), each checkout step + validation-error state, order confirmation, profile, order history, chaos dashboard, notification centre open, and modals open.
- [x] `Test_012_KeyboardNavigation.spec.ts`: complete login → add to cart → checkout using **keyboard only** (`Tab`, `Shift+Tab`, `Enter`, `Space`); assert a visible focus indicator, logical tab order and focus trapped in modals, and no keyboard traps elsewhere.
- [x] Write `a11y-summary.json` (violations per page and rule) for the portal trend (Sprint 12.1 consumes it).

### US-AF-1022: Core Web Vitals fixture (1.5 SP)
- [x] `src/core/perf/web-vitals.fixture.ts`:
  - Inject the `web-vitals` library (attribution build) via `page.addInitScript`, collect `onLCP`, `onCLS`, `onINP`, `onFCP`, `onTTFB` into `window.__vitals`.
  - Also capture CDP `Performance.getMetrics` (JS heap, layout count) through `page.context().newCDPSession(page)` — Chrome only, which matches our policy.
  - `vitals.measure(url, { runs: 3 })` → median values; attaches a table to Allure.
- [x] `src/tests/ui/Performance/Test_001_CoreWebVitalsBudgets.spec.ts` (`@perf-ui`): catalog, book detail, cart, checkout step 1. Budgets in `src/config/perf-budgets.json`:
  | Metric | CI budget (DOCKER) | Good threshold (reference) |
  | :--- | :--- | :--- |
  | LCP | ≤ 2500 ms | 2500 ms |
  | CLS | ≤ 0.1 | 0.1 |
  | INP (scripted click) | ≤ 200 ms | 200 ms |
  | TTFB | ≤ 800 ms | 800 ms |
- [x] With `visualChaos: true` (chaos endpoint), assert CLS **exceeds** the budget — this proves the metric catches layout chaos. Reset chaos in `afterEach`.
- [x] Degraded network profile: a CDP `Network.emulateNetworkConditions` (Slow 4G) variant, reported only (no budget).

### US-AF-1023: Lighthouse CI on Google Chrome (1 SP)
- [x] `lighthouserc.json` at the repo root: `collect.url` = DOCKER catalog, book detail, cart (authenticated via a `puppeteerScript` or `--extra-headers` cookie), `collect.settings.chromePath` = Google Chrome stable on the runner, `numberOfRuns: 3`.
- [x] Assertions: `categories:performance ≥ 0.8`, `categories:accessibility ≥ 0.95`, `categories:best-practices ≥ 0.9`, `categories:seo ≥ 0.8` (warn).
- [x] Workflow job `lighthouse` (nightly + PR when `playwright-e2e/src/pages/**` changes); upload reports to `temporary-public-storage` **or** the gh-pages portal (`AutomationReports/Lighthouse/<run>/`) — prefer gh-pages.

### US-AF-1024: Optional Chrome viewport matrix (0.5 SP)
- [x] `src/tests/ui/Responsive/Test_001_ResponsiveLayouts.spec.ts` (`@responsive`): `for (const vp of [{w:1440,h:900},{w:1024,h:768},{w:390,h:844}])` → `test.use({ viewport: … })` inside `describe` blocks; assert nav collapses, no horizontal scroll, and the critical CTA is visible.
- [x] Runs in the existing `chrome` project (still 3 projects). Update AGENTS.md §1 with one line: "Viewport variation inside the chrome project is allowed; new device/browser projects are not."

### US-AF-1025: Visual hardening (0.5 SP)
- [x] Generate baselines only inside `mcr.microsoft.com/playwright:v1.58.0-jammy` (with Chrome installed) via `npm run visual:update` (docker run wrapper); delete `catalog-baseline-chrome-win32.png`; set `snapshotPathTemplate` without the platform suffix, or skip visual tests outside Linux with a clear message.
- [x] `mask` dynamic regions (prices if randomized, timestamps, avatars); add 3 component-level snapshots (book card, cart summary, Shadow DOM `<order-summary-box>`).

---

## 3. Verification Commands

```bash
cd playwright-e2e
ENV=DOCKER npx playwright test src/tests/ui/A11y src/tests/ui/Performance src/tests/ui/Responsive --config=src/config/playwright.config.ts --repeat-each=3
npx @lhci/cli autorun --config=../lighthouserc.json
npm run visual:update   # docker-based baseline regeneration
npx playwright test --config=src/config/playwright.config.ts --list | grep -c "\[chrome\]"   # project count unchanged (3 projects)
```

---

## 4. Code Review Checklist

- [x] axe results attached for every scan; failures show rule id, impact, selector and help URL.
- [x] Web Vitals measured as the median of N runs; INP triggered by a real interaction.
- [x] Lighthouse uses **Google Chrome** (`chromePath`), not bundled Chromium.
- [x] No new Playwright projects added (still `setup`, `api`, `chrome`).
- [x] Visual baselines regenerated in the pinned image (tag stated in the PR); win32 baseline removed.
- [x] Chaos knobs reset in `afterEach`.

---

## 5. Definition of Done

- [x] All new specs green 3× on DOCKER; budgets met or deviations documented.
- [x] Lighthouse job green; reports on the portal.
- [x] Both catalogs: `UI-A11Y-*`, `UI-PERF-*`, `UI-RESP-*`, `UI-VIS-*` entries.
- [x] `docs/architecture/reporting_architecture.md` mentions the a11y and vitals artifacts.

---

## 6. Deliverables Summary

| Artifact | Description |
| :--- | :--- |
| `src/core/a11y/a11y.fixture.ts`, expanded A11y specs, `Test_012_KeyboardNavigation.spec.ts` | Accessibility |
| `src/core/perf/web-vitals.fixture.ts`, `src/config/perf-budgets.json`, `Test_001_CoreWebVitalsBudgets.spec.ts` | Web Vitals |
| `lighthouserc.json`, Lighthouse workflow job | Lighthouse CI (Chrome) |
| `src/tests/ui/Responsive/*` | Chrome viewport matrix |
| Visual baseline regeneration script + masks | Visual hardening |
