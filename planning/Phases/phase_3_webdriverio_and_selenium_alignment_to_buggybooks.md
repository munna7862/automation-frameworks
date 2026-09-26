# Phase 3: WebdriverIO & Selenium Alignment to BuggyBooks

**Navigation**: [🗺️ Planning Hub](../README.md) | [📖 Master Plan](../Master/master_plan.md) | [Phase 1](phase_1_monorepo_foundations_pipeline_hygiene_and_utility_unification.md) | [Phase 2](phase_2_documentation_integrity_anti_pattern_manual_and_quality_gates.md) | **[Phase 3]** | [Phase 4](phase_4_mobile_automation_appium_and_webdriverio.md) | [Phase 5](phase_5_executive_observability_and_unified_allure_dashboard.md)

**Phase Identifier**: `PHASE-3-SELENIUM-WDIO-ALIGNMENT`  
**Phase Status**: Planned  
**Total Phase Velocity**: **14 Story Points** (Sprint 3.1: 5 SP, Sprint 3.2: 5 SP, Sprint 3.3: 4 SP)  
**Phase Leads**: SDET Architect & Selenium Specialist  
**Primary Personas**: SDET Architect, Selenium Specialist, Playwright QA Lead, DevOps Engineer  

---

## 1. Executive Summary & Phase Theme

**Phase 3** directly addresses the primary mission of the `AutomationFrameworks` monorepo: **Comparative multi-framework test automation on the same application**.

Currently, while `playwright-e2e` tests the BuggyBooks e-commerce platform (`https://buggy-books-fe.onrender.com`), both `selenium-e2e` and `wdio-e2e` are testing external dummy targets (`automationexercise.com`, `reqres.in`, `jsonplaceholder.typicode.com`, and GitHub mock pages). This disconnect breaks the comparative value of the repository. An engineer cannot evaluate the strengths, locator ergonomics, execution speed, or resilience of Selenium vs. WebdriverIO vs. Playwright when each framework is executing against completely different applications.

**Phase 3** performs a comprehensive migration of `selenium-e2e` and `wdio-e2e` to BuggyBooks:
1. Rebuilding Page Object Models in both frameworks to model BuggyBooks screens: `LoginPage`, `CatalogPage`, `CartPage`, `CheckoutPage`, and navigation headers.
2. Handling BuggyBooks-specific frontend realities: asynchronous API data fetching, Shadow DOM components (`<order-summary-box>`), obfuscated CSS locators, and dynamic actionability.
3. Implementing core E2E user journeys: Authentication, Catalog Search & Filtering, Cart State Management, and Checkout.
4. Purging legacy mock tests and synchronizing the dual Test Cases Catalog with dedicated coverage matrices for Selenium (`TC-SEL-...`) and WebdriverIO (`TC-WDIO-...`).

---

## 2. Architectural Scope & Target Outcomes

| Subsystem / Workstream | Current State / Defect | Phase Target Outcome |
| :--- | :--- | :--- |
| **Selenium Page Objects** | `selenium-e2e/src/pages/` contains dummy `github.page.ts` and `home.page.ts`. | Fully typed BuggyBooks POMs (`LoginPage`, `CatalogPage`, `CartPage`, `CheckoutPage`) using WebDriver `By.css`, explicit `WebDriverWait`, and robust locator strategies. |
| **WebdriverIO Page Objects** | `wdio-e2e/src/pages/` mirrors generic legacy dummy pages. | Modern WebdriverIO POMs using native `$` / `$$` element chaining, auto-waiting, and custom command helpers for BuggyBooks. |
| **Shadow DOM & Obfuscated Locators** | No handling of custom Web Components or dynamic CSS in Selenium/WDIO. | Explicit shadow root piercing (`driver.findElement(By.css('order-summary-box')).getShadowRoot()`) and resilient accessible selectors. |
| **Test Suites & Endpoints** | Legacy tests run against `reqres.in` and `automationexercise.com`. | Comprehensive BuggyBooks E2E specs: `auth.spec.ts`, `catalog.spec.ts`, `cart.spec.ts`, and `checkout.spec.ts` running against staging. |
| **Dual Catalog Traceability** | Neither catalog file documents Selenium or WDIO test case IDs. | Both `docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md` contain dedicated sections for `TC-SEL-001..010` and `TC-WDIO-001..010`. |

---

## 3. Sprints in this Phase

```mermaid
graph LR
    S31[Sprint 3.1: BuggyBooks Selenium Page Objects & Auth Smoke (5 SP)] --> S32[Sprint 3.2: BuggyBooks WDIO Page Objects & Cart/Checkout (5 SP)]
    S32 --> S33[Sprint 3.3: Cross-Framework Parity & Catalog Sync (4 SP)]
```

### Sprint Breakdown

1. **[Sprint 3.1: BuggyBooks Selenium Page Objects & Auth/Catalog Smoke](../Sprints/sprint_3_1_buggybooks_selenium_page_objects_and_auth_catalog_smoke.md)**
   - *Estimated Effort*: 5 Story Points
   - *Target Pillars*: Pillar 1 (Multi-Framework BuggyBooks Parity)
   - *Key Deliverables*:
     - Refactoring `selenium-e2e/src/config/env.config.ts` to target BuggyBooks frontend and backend staging URLs.
     - Authoring BuggyBooks Page Objects: `LoginPage.ts` and `CatalogPage.ts` with explicit `WebDriverWait` for dynamic data hydration.
     - Developing Selenium test specs:
       - `Test_001_Selenium_Auth.spec.ts`: Login validation, invalid credentials, logout state.
       - `Test_002_Selenium_Catalog.spec.ts`: Search, genre filtering, and book detail modal inspection.
     - Deprecating legacy `github.page.ts` and external API mocks in `selenium-e2e`.
   - *Verification*: `npm test` inside `selenium-e2e` executes in headless Chrome against BuggyBooks staging with 100% green pass rate.

2. **[Sprint 3.2: BuggyBooks WebdriverIO Page Objects & Cart/Checkout Flows](../Sprints/sprint_3_2_buggybooks_wdio_page_objects_and_cart_checkout_flows.md)**
   - *Estimated Effort*: 5 Story Points
   - *Target Pillars*: Pillar 1 (Multi-Framework BuggyBooks Parity)
   - *Key Deliverables*:
     - Updating `wdio-e2e/wdio.conf.ts` with BuggyBooks baseUrl and Google Chrome browser capabilities (`goog:chromeOptions: { args: ['--headless', '--disable-gpu'] }`).
     - Authoring BuggyBooks Page Objects: `CartPage.ts` and `CheckoutPage.ts`.
     - Implementing Shadow DOM traversal in WebdriverIO for `<order-summary-box>` using native `shadow$` selectors.
     - Developing WebdriverIO test specs:
       - `Test_001_WDIO_AuthAndCatalog.spec.ts`: User session verification and catalog interaction.
       - `Test_002_WDIO_CartAndCheckout.spec.ts`: End-to-end purchasing workflow from cart addition to order confirmation.
     - Purging legacy `automationexercise` specs.
   - *Verification*: `npm test` inside `wdio-e2e` executes cleanly on headless Chrome; order confirmation is validated.

3. **[Sprint 3.3: Cross-Framework Parity Assertions & Traceability Matrix Sync](../Sprints/sprint_3_3_cross_framework_parity_assertions_and_traceability_matrix_sync.md)**
   - *Estimated Effort*: 4 Story Points
   - *Target Pillars*: Pillar 1 (Multi-Framework BuggyBooks Parity) & Pillar 5 (Catalog Parity)
   - *Key Deliverables*:
     - Implementing comparative benchmark assertions across Playwright, Selenium, and WebdriverIO (comparing execution duration, flakiness rate, and memory footprint).
     - Standardizing test case identifiers:
       - Selenium: `TC-SEL-001` (Auth), `TC-SEL-002` (Catalog Search), `TC-SEL-003` (Cart Ops), `TC-SEL-004` (Checkout).
       - WebdriverIO: `TC-WDIO-001` (Auth), `TC-WDIO-002` (Catalog Search), `TC-WDIO-003` (Cart Ops), `TC-WDIO-004` (Checkout), `TC-WDIO-005` (Shadow DOM).
     - Updating both catalog files (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`) in 100% strict lockstep.
     - Integrating Selenium and WDIO smoke commands into root `package.json` (`npm run test:selenium:smoke`, `npm run test:wdio:smoke`).
   - *Verification*: Monorepo root commands trigger both frameworks; dual-catalog validation script confirms zero discrepancies.

---

## 4. Definition of Done & Quality Acceptance Gates

- [ ] Zero references to `automationexercise.com`, `reqres.in`, or `jsonplaceholder.typicode.com` remain in the repository.
- [ ] `selenium-e2e` executes all tests against BuggyBooks frontend staging with explicit auto-waiting and zero flaky sleeps.
- [ ] `wdio-e2e` executes all tests against BuggyBooks frontend staging, including Shadow DOM piercing for `<order-summary-box>`.
- [ ] Both frameworks run strictly on Google Chrome (`channel: 'chrome'` / Chrome headless).
- [ ] Test cases catalog files (`docs/test_cases_catalog.md` and `playwright-e2e/test_cases_catalog.md`) are updated with identical entries for Selenium and WebdriverIO suites.
- [ ] Root scripts `npm run test:selenium:smoke` and `npm run test:wdio:smoke` execute successfully.

---

## 5. Risks, Gotchas & Mitigation Strategies

| Threat / Gotcha | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Selenium StaleElementReferenceException** | React 19 re-rendering causes DOM nodes to detach between lookup and action. | Encapsulate interactions within `base.page.ts` with explicit retry loops and `ExpectedConditions.stalenessOf` / `elementToBeClickable`. |
| **Shadow DOM Encapsulation in Selenium** | Standard Selenium `By.css` cannot inspect elements inside `#shadow-root`. | Utilize W3C standard `getShadowRoot()` API available in modern Selenium WebDriver 4.x. |
| **Render Staging Cold Start in Selenium/WDIO** | Tests fail immediately with connection timeouts on inactive Render instances. | Prepend all test runs with the mandatory Render pre-flight probe (`wait-on -t 90000 https://buggy-books-fe.onrender.com/`). |
