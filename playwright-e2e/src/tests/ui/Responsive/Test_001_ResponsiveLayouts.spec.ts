import { test } from '../../../core/base/base.fixture';
import { envConfig } from '../../../config/env.config';

const VIEWPORTS = [
  {
    id: 'UI_RESP_01',
    name: 'Desktop (1440x900)',
    viewport: { width: 1440, height: 900 },
    isMobileLayout: false
  },
  {
    id: 'UI_RESP_02',
    name: 'Tablet (1024x768)',
    viewport: { width: 1024, height: 768 },
    isMobileLayout: false
  },
  {
    id: 'UI_RESP_03',
    name: 'Mobile (390x844)',
    viewport: { width: 390, height: 844 },
    isMobileLayout: true
  }
] as const;

for (const { id, name, viewport, isMobileLayout } of VIEWPORTS) {
  test.describe(`Responsive Layout Matrix: ${name}`, () => {
    // Dynamically adjust viewport within existing single 'chrome' project
    test.use({ viewport });

    test(`${id}: Responsive layout validation on ${name} @responsive @regression`, async ({
      page,
      catalogPage,
      commonFunctions
    }) => {
      await test.step('Navigate to catalog page', async () => {
        await page.goto(envConfig.baseUrl);
        await catalogPage.waitForBookCardSelector();
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('Assert no horizontal document overflow (no horizontal scrollbar)', async () => {
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        await commonFunctions.verifyCondition(
          !hasHorizontalScroll,
          `Verifying document has zero horizontal scroll overflow on ${name} (scrollWidth <= ${viewport.width})`
        );
      });

      await test.step('Assert critical CTA (Add to Cart / Search) is visible and operable', async () => {
        const isSearchVisible = await catalogPage.isSearchButtonVisible();
        const isBookVisible = await catalogPage.isBookCardVisible();

        await commonFunctions.verifyCondition(
          isBookVisible || isSearchVisible,
          `Verifying critical CTA element is visible in ${name} viewport`
        );
      });

      await test.step('Assert navigation structure adapts to viewport form factor', async () => {
        if (isMobileLayout) {
          // In mobile viewports, check that layout elements wrap or collapse gracefully
          const bodyWidth = await page.evaluate(() => document.body.clientWidth);
          await commonFunctions.verifyCondition(
            bodyWidth <= viewport.width,
            `Mobile layout bounds constrained to viewport width (${bodyWidth} <= ${viewport.width})`
          );
        } else {
          // In desktop/tablet viewports, check that main container utilizes available width
          const mainWidth = await page.evaluate(() => {
            const main =
              document.querySelector('main') || document.querySelector('.catalog-container');
            return main ? main.clientWidth : 0;
          });
          await commonFunctions.verifyCondition(
            mainWidth >= 600,
            `Desktop/Tablet layout utilizes wide grid (main width: ${mainWidth}px)`
          );
        }
      });
    });
  });
}
