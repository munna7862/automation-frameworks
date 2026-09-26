# Sprint 3.1: BuggyBooks Selenium Page Objects & Auth/Catalog Smoke

**Sprint Identifier**: `SPRINT-3.1-SELENIUM-BUGGYBOOKS-ALIGNMENT`  
**Phase Mapping**: [Phase 3: WebdriverIO & Selenium Alignment to BuggyBooks](file:///c:/Workspace/AutomationFrameworks/planning/Phases/phase_3_webdriverio_and_selenium_alignment_to_buggybooks.md)  
**Estimated Velocity**: 5 Story Points  
**Sprint Goal**: Re-align the `selenium-e2e` framework from legacy mock sites to the BuggyBooks e-commerce platform, creating typed Page Objects (`LoginPage`, `CatalogPage`) and implementing deterministic smoke test specs running on Google Chrome.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **Selenium Specialist** | AI Agent / Selenium | Architecting Selenium Page Objects, managing ChromeDriver capabilities, and authoring BuggyBooks specs. |
| **SDET Architect** | AI Agent / SDET | Ensuring Page Object contracts match Playwright equivalents and enforcing auto-waiting standards. |
| **Playwright QA Lead** | AI Agent / QA | Providing reference selectors, API endpoints, and expected DOM behaviors from `playwright-e2e`. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-311: Selenium Environment & Driver Factory Reconfiguration
- **Story Statement**:  
  *As a* Selenium Automation Engineer,  
  *I want* `selenium-e2e` configured to target BuggyBooks frontend and backend staging URLs in headless Chrome,  
  *So that* Selenium tests execute against the realistic staging environment.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [ ] Update `selenium-e2e/src/config/env.config.ts`:
    - Base URL: `https://buggy-books-fe.onrender.com`
    - API URL: `https://buggy-books.onrender.com/api`
  - [ ] Configure `driver.factory.ts` for headless Google Chrome:
    ```typescript
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--window-size=1920,1080');
    ```
  - [ ] Add explicit auto-waiting helper methods in `base.page.ts` (`waitForElementVisible`, `waitForElementClickable`).
- **Acceptance Criteria**:
  - Selenium boots headless Chrome and navigates to BuggyBooks staging.
  - No obsolete mock URLs remain in `env.config.ts`.

### User Story US-AF-312: BuggyBooks Page Objects & Smoke Test Implementation
- **Story Statement**:  
  *As an* SDET,  
  *I want* typed Selenium Page Objects for Login and Catalog,  
  *So that* user authentication and catalog browsing can be validated in Selenium E2E tests.
- **Story Points**: 3 SP (Medium-Large)
- **Technical Subtasks**:
  - [ ] Author `selenium-e2e/src/pages/LoginPage.ts`:
    - Locators: email input, password input, submit button, error banner.
    - Actions: `login(email, password)`, `getErrorMessage()`, `isLoggedIn()`.
  - [ ] Author `selenium-e2e/src/pages/CatalogPage.ts`:
    - Locators: search bar, book cards, genre dropdown, price filters.
    - Actions: `searchBook(query)`, `selectGenre(genre)`, `clickBookCard(id)`.
  - [ ] Author `selenium-e2e/src/tests/ui/Test_001_Selenium_Auth.spec.ts` (`TC-SEL-001`).
  - [ ] Author `selenium-e2e/src/tests/ui/Test_002_Selenium_Catalog.spec.ts` (`TC-SEL-002`).
  - [ ] Delete legacy `github.page.ts` and external API mock tests.
- **Acceptance Criteria**:
  - Tests execute deterministically without `Thread.sleep` or arbitrary pauses.
  - `npm test` inside `selenium-e2e` passes 100% green against BuggyBooks staging.

---

## 3. Definition of Done & Quality Gates

- [ ] `selenium-e2e` targets BuggyBooks staging exclusively.
- [ ] Obsolete mock tests and Page Objects removed.
- [ ] `Test_001_Selenium_Auth.spec.ts` and `Test_002_Selenium_Catalog.spec.ts` pass cleanly on Chrome.
- [ ] TypeScript compilation passes with zero errors.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `selenium-e2e/src/config/env.config.ts` | Config | Updated with BuggyBooks URLs. |
| `selenium-e2e/src/pages/LoginPage.ts` | Page Object | Typed BuggyBooks login page. |
| `selenium-e2e/src/pages/CatalogPage.ts` | Page Object | Typed BuggyBooks catalog page. |
| `selenium-e2e/src/tests/ui/` | Test Specs | BuggyBooks Selenium auth and catalog smoke specs. |
