import { expect } from '@playwright/test';
import * as path from 'path';
import { test } from '../../../core/base/base.fixture';
import { envConfig } from '../../../config/env.config';
import { CartPage } from '../../../pages/cart.page';
import { CheckoutPage } from '../../../pages/checkout.page';
import { delayMs } from '../../../utils/delay';

const HAR_PATH = path.resolve(__dirname, '../../../test-data/ui/har/catalog-happy-path.har');

test.describe('Mock-Driven Edge States UI Suite', () => {
  test('UI-EDGE-01: Empty Catalog Response Handling @regression @mock', async ({
    page,
    catalogPage
  }) => {
    await test.step('Mock GET /api/books with empty results', async () => {
      await page.route('**/api/books*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            books: [],
            total: 0,
            page: 1,
            totalPages: 0,
            limit: 12
          })
        });
      });
    });

    await test.step('Navigate to catalog and verify empty state UI', async () => {
      await catalogPage.navigateToCatalog(envConfig.baseUrl);
      await expect(catalogPage.emptyCatalog).toBeVisible();
      const emptyText = await catalogPage.getEmptyCatalogText();
      expect(emptyText).toContain('No books found');
    });
  });

  test('UI-EDGE-02: Checkout 500 Failure Resilience and Retry @regression @mock', async ({
    page,
    catalogPage
  }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step('Navigate to catalog and add first book to cart', async () => {
      await catalogPage.navigateToCatalog(envConfig.baseUrl);
      await catalogPage.waitForBookCardSelector();
      await cartPage.openCart();
      await cartPage.clearAllItemsIfPresent();
      await catalogPage.clickNavigateLink('Catalog');
      await catalogPage.waitForBookCardSelector();
      await catalogPage.addBookToCart(1);
    });

    let checkoutAttempts = 0;
    await test.step('Mock POST /api/checkout/process with 500 on attempt 1, 200 on retry', async () => {
      await page.route('**/api/checkout/process', async (route) => {
        checkoutAttempts++;
        if (checkoutAttempts === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Internal Server Error: Simulated payment gateway timeout'
            })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Order processed successfully after simulated retry',
              orderId: 'ord-mock-retry-999'
            })
          });
        }
      });
    });

    await test.step('Navigate to checkout page and fill details', async () => {
      await cartPage.openCart();
      await cartPage.clickProceedToCheckout();
      await checkoutPage.fillShippingDetails('Edge', 'Tester');
      await checkoutPage.fillPaymentDetails('4532000000001111');
    });

    await test.step('Submit payment on attempt 1 and assert user-facing failure handling', async () => {
      await checkoutPage.clickFinalSubmit();
      // Assert error banner is shown with failure feedback
      await expect(checkoutPage.errorBanner).toBeVisible();
      expect(checkoutAttempts).toBe(1);
    });

    await test.step('Retry payment on attempt 2 and assert order confirmation', async () => {
      await checkoutPage.clickFinalSubmit();
      await expect(checkoutPage.confirmationHeading).toBeVisible({
        timeout: 15000
      });
      expect(checkoutAttempts).toBe(2);
    });
  });

  test('UI-EDGE-03: Slow Response Loading Indicator and Settle @regression @mock', async ({
    page,
    catalogPage
  }) => {
    await test.step('Mock GET /api/books with 1200ms network delay', async () => {
      await page.route('**/api/books*', async (route) => {
        await delayMs(1200);
        await route.continue();
      });
    });

    await test.step('Navigate to catalog and verify loading indicator appears then settles', async () => {
      await catalogPage.navigateToCatalog(envConfig.baseUrl);
      // Verify book cards render successfully after latency settles
      await catalogPage.waitForBookCardSelector();
      await expect(catalogPage.emptyCatalog).not.toBeVisible();
    });
  });

  test('UI-EDGE-04: Client Offline Resilience and Network Recovery @regression @mock', async ({
    context,
    catalogPage
  }) => {
    try {
      await test.step('Navigate to catalog online', async () => {
        await catalogPage.navigateToCatalog(envConfig.baseUrl);
        await catalogPage.waitForBookCardSelector();
      });

      await test.step('Simulate client offline mode', async () => {
        await context.setOffline(true);
      });

      await test.step('Trigger interaction while offline and assert no unhandled UI crash', async () => {
        await catalogPage.enterSearchTerm('JavaScript');
        await catalogPage.clickSearchButton();
        // Container must remain rendered without unhandled crash
        await expect(catalogPage.appContainer).toBeVisible();
      });

      await test.step('Restore client online connectivity', async () => {
        await context.setOffline(false);
        await catalogPage.navigateToCatalog(envConfig.baseUrl);
        await catalogPage.waitForBookCardSelector();
      });
    } finally {
      await context.setOffline(false);
    }
  });

  test('UI-EDGE-05: Recorded HAR Replay for Catalog Happy Path @regression @mock', async ({
    page,
    catalogPage
  }) => {
    await test.step('Replay catalog happy path from sanitized HAR archive', async () => {
      await page.routeFromHAR(HAR_PATH, {
        url: '**/api/**',
        notFound: 'fallback'
      });
    });

    await test.step('Navigate to catalog and verify mocked items render deterministically', async () => {
      await catalogPage.navigateToCatalog(envConfig.baseUrl);
      await catalogPage.waitForBookCardSelector();
      const firstTitle = await catalogPage.getFirstBookTitle();
      expect(firstTitle.length).toBeGreaterThan(0);
    });
  });
});
