# Sprint 3.2: BuggyBooks WebdriverIO Page Objects & Cart/Checkout Flows

**Navigation**: [⬅️ Previous: Sprint 3.1](sprint_3_1_buggybooks_selenium_page_objects_and_auth_catalog_smoke.md) | [🗺️ Planning Hub](../README.md) | **Sprint 3.2** | [➡️ Next: Sprint 3.3](sprint_3_3_cross_framework_parity_assertions_and_traceability_matrix_sync.md)

**Sprint Identifier**: `SPRINT-3.2-WDIO-BUGGYBOOKS-ALIGNMENT`  
**Phase Mapping**: [Phase 3: WebdriverIO & Selenium Alignment to BuggyBooks](../Phases/phase_3_webdriverio_and_selenium_alignment_to_buggybooks.md)  
**Estimated Velocity**: 5 Story Points  
**Sprint Status**: Completed  
**Sprint Goal**: Re-align `wdio-e2e` to BuggyBooks, author Page Objects for Cart and Checkout, implement native Shadow DOM piercing for the `<order-summary-box>` Web Component, and validate full customer purchasing workflows.

---

## 1. Persona Roles & Ownership Matrix

| Persona | Assigned Member | Responsibilities for this Sprint |
| :--- | :--- | :--- |
| **Selenium / WDIO Specialist** | AI Agent / WDIO | Developing WebdriverIO Page Objects, implementing Shadow DOM locators, and authoring specs. |
| **SDET Architect** | AI Agent / SDET | Reviewing Shadow DOM traversal patterns and ensuring cross-framework locator parity. |
| **DevOps Engineer** | AI Agent / DevOps | Integrating WebdriverIO test commands into monorepo root scripts and CI workflows. |

---

## 2. Sprint Backlog & Granular User Stories

### User Story US-AF-321: WebdriverIO Configuration & Shadow DOM Support
- **Story Statement**:  
  *As a* WebdriverIO Automation Engineer,  
  *I want* `wdio.conf.ts` configured for BuggyBooks staging with native Shadow DOM piercing capability,  
  *So that* tests can interact with encapsulated Web Components like `<order-summary-box>` seamlessly.
- **Story Points**: 2 SP (Medium)
- **Technical Subtasks**:
  - [x] Update `wdio-e2e/src/config/wdio.conf.ts`:
    - Base URL: `https://buggy-books-fe.onrender.com`
    - Browser: `chrome` with headless arguments.
  - [x] Implement Shadow DOM traversal helper in `base.page.ts`:
    ```typescript
    public async getShadowElement(hostSelector: string, innerSelector: string) {
      const host = await $(hostSelector);
      return host.shadow$(innerSelector);
    }
    ```
- **Acceptance Criteria**:
  - WebdriverIO launches Chrome headless against BuggyBooks staging.
  - Native `shadow$` locator successfully accesses elements inside `<order-summary-box>`.

### User Story US-AF-322: Cart and Checkout E2E Purchasing Flow
- **Story Statement**:  
  *As an* SDET,  
  *I want* typed WebdriverIO Page Objects for Cart and Checkout,  
  *So that* an entire customer purchase journey (Add to Cart $\rightarrow$ View Cart $\rightarrow$ Enter Shipping $\rightarrow$ Complete Order) can be verified.
- **Story Points**: 3 SP (Medium-Large)
- **Technical Subtasks**:
  - [x] Author `wdio-e2e/src/pages/CartPage.ts`:
    - Locators: item rows, quantity input, remove item button, checkout button.
    - Actions: `getCartItemCount()`, `updateQuantity(id, qty)`, `proceedToCheckout()`.
  - [x] Author `wdio-e2e/src/pages/CheckoutPage.ts`:
    - Locators: shipping address inputs, payment method, order summary shadow box, place order button.
    - Actions: `fillShippingDetails(...)`, `getOrderSummaryTotal()`, `placeOrder()`.
  - [x] Author `wdio-e2e/src/tests/ui/Test_002_WDIO_CartAndCheckout.spec.ts` (`TC-WDIO-002`).
  - [x] Remove legacy `automationexercise` specs.
- **Acceptance Criteria**:
  - Complete purchase flow executes cleanly.
  - Order confirmation screen and order ID are asserted.

---

## 3. Definition of Done & Quality Gates

- [x] `wdio-e2e` operates entirely against BuggyBooks staging.
- [x] `<order-summary-box>` Web Component is inspected and asserted using native `shadow$` locator.
- [x] End-to-end cart and checkout tests pass cleanly on Google Chrome.
- [x] TypeScript compilation exits 0 with zero errors.

---

## 4. Sprint Velocity & Deliverables Summary

| Artifact / File | Type | Target State / Description |
| :--- | :--- | :--- |
| `wdio-e2e/src/config/wdio.conf.ts` | Config | Updated WebdriverIO configuration for BuggyBooks. |
| `wdio-e2e/src/pages/CartPage.ts` | Page Object | Typed WebdriverIO cart page. |
| `wdio-e2e/src/pages/CheckoutPage.ts` | Page Object | Typed BuggyBooks checkout page with Shadow DOM. |
| `wdio-e2e/src/tests/ui/` | Test Specs | BuggyBooks WebdriverIO purchasing workflow specs. |

---

**Next Steps**: Proceed to [Sprint 3.3: Cross-Framework Parity Assertions & Traceability Matrix Sync](sprint_3_3_cross_framework_parity_assertions_and_traceability_matrix_sync.md).
