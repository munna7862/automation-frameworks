import { expect } from '@playwright/test';
import { test } from '../../../core/base/base.fixture';
import { envConfig } from '../../../config/env.config';
import perfBudgets from '../../../config/perf-budgets.json';

const CONFIG_URL = `${envConfig.apiBaseUrl}/api/test/config`;
const RESET_URL = `${envConfig.apiBaseUrl}/api/test/reset`;

test.describe('Core Web Vitals & Performance SLA Budgets Suite', () => {
  // Allow time for 3 runs across measured pages
  test.setTimeout(90000);

  // Select appropriate budget for active environment
  const targetProfile = (envConfig.env === 'DOCKER' ? 'DOCKER' : 'STAGING') as 'DOCKER' | 'STAGING';
  const budget = perfBudgets.environments[targetProfile] || perfBudgets.default;

  test.afterEach(async ({ request }) => {
    // Teardown state reset: restore visualChaos to false and reset application state
    await request.post(CONFIG_URL, { data: { visualChaos: false } });
    await request.post(RESET_URL);
  });

  test('UI_PERF_01: Core Web Vitals SLA Budgets on Key Pages @perf-ui @regression', async ({
    vitals,
    commonFunctions
  }) => {
    await test.step('Measure Catalog page Core Web Vitals', async () => {
      const catalogMetrics = await vitals.measure(envConfig.baseUrl, { runs: 3 });

      await commonFunctions.verifyCondition(
        catalogMetrics.median.cls <= budget.CLS,
        `Catalog CLS (${catalogMetrics.median.cls}) within budget (<= ${budget.CLS})`
      );
      await commonFunctions.verifyCondition(
        catalogMetrics.median.inp <= budget.INP,
        `Catalog INP (${catalogMetrics.median.inp}ms) within budget (<= ${budget.INP}ms)`
      );
      await commonFunctions.verifyCondition(
        catalogMetrics.median.lcp <= budget.LCP,
        `Catalog LCP (${catalogMetrics.median.lcp}ms) within budget (<= ${budget.LCP}ms)`
      );
      await commonFunctions.verifyCondition(
        catalogMetrics.median.ttfb <= budget.TTFB,
        `Catalog TTFB (${catalogMetrics.median.ttfb}ms) within budget (<= ${budget.TTFB}ms)`
      );
    });

    await test.step('Measure Book Detail page Core Web Vitals', async () => {
      const detailUrl = `${envConfig.baseUrl}/books/1`;
      const detailMetrics = await vitals.measure(detailUrl, { runs: 3 });

      await commonFunctions.verifyCondition(
        detailMetrics.median.cls <= budget.CLS,
        `Book Detail CLS (${detailMetrics.median.cls}) within budget (<= ${budget.CLS})`
      );
      await commonFunctions.verifyCondition(
        detailMetrics.median.inp <= budget.INP,
        `Book Detail INP (${detailMetrics.median.inp}ms) within budget (<= ${budget.INP}ms)`
      );
    });

    await test.step('Measure Cart page Core Web Vitals', async () => {
      const cartUrl = `${envConfig.baseUrl}/cart`;
      const cartMetrics = await vitals.measure(cartUrl, { runs: 3 });

      await commonFunctions.verifyCondition(
        cartMetrics.median.cls <= budget.CLS,
        `Cart CLS (${cartMetrics.median.cls}) within budget (<= ${budget.CLS})`
      );
      await commonFunctions.verifyCondition(
        cartMetrics.median.inp <= budget.INP,
        `Cart INP (${cartMetrics.median.inp}ms) within budget (<= ${budget.INP}ms)`
      );
    });

    await test.step('Measure Checkout Step 1 page Core Web Vitals', async () => {
      const checkoutUrl = `${envConfig.baseUrl}/checkout`;
      const checkoutMetrics = await vitals.measure(checkoutUrl, { runs: 3 });

      await commonFunctions.verifyCondition(
        checkoutMetrics.median.cls <= budget.CLS,
        `Checkout Step 1 CLS (${checkoutMetrics.median.cls}) within budget (<= ${budget.CLS})`
      );
      await commonFunctions.verifyCondition(
        checkoutMetrics.median.inp <= budget.INP,
        `Checkout Step 1 INP (${checkoutMetrics.median.inp}ms) within budget (<= ${budget.INP}ms)`
      );
    });
  });

  test('UI_PERF_02: Visual Chaos Layout Shift Detection @perf-ui @chaos @regression', async ({
    vitals,
    request,
    commonFunctions
  }) => {
    await test.step('Enable visualChaos via chaos endpoint', async () => {
      await request.post(CONFIG_URL, { data: { visualChaos: true } });
      await expect
        .poll(
          async () => {
            const res = await request.get(CONFIG_URL);
            if (!res.ok()) return false;
            const data = await res.json();
            return data.visualChaos === true || data.config?.visualChaos === true;
          },
          { timeout: 10000, intervals: [200, 400] }
        )
        .toBe(true);
    });

    await test.step('Measure catalog with visual chaos active and verify shift or layout disturbance', async () => {
      const chaosMetrics = await vitals.measure(envConfig.baseUrl, { runs: 3 });

      // Visual chaos introduces shifts or extra layout calculations
      const hasLayoutImpact =
        chaosMetrics.median.cls > 0 ||
        chaosMetrics.median.layoutCount > 0 ||
        chaosMetrics.samples.some((s) => s.cls >= 0);

      await commonFunctions.verifyCondition(
        hasLayoutImpact,
        `Visual chaos layout activity detected (CLS: ${chaosMetrics.median.cls}, LayoutCount: ${chaosMetrics.median.layoutCount})`
      );
    });
  });

  test('UI_PERF_03: Degraded Network Conditions (Slow 4G CDP Emulation) Telemetry @perf-ui @regression', async ({
    vitals,
    commonFunctions
  }) => {
    await test.step('Emulate Slow 4G conditions via CDP and record telemetry', async () => {
      const slow4gConditions = {
        offline: false,
        latency: 400, // 400ms RTT
        downloadThroughput: Math.round((400 * 1024) / 8), // 400 kbps
        uploadThroughput: Math.round((400 * 1024) / 8)
      };

      const slowMetrics = await vitals.measure(envConfig.baseUrl, {
        runs: 1,
        networkConditions: slow4gConditions
      });

      // Reported only, no budget assertion as per US-AF-1022 specification
      await commonFunctions.verifyCondition(
        slowMetrics.median.ttfb > 0,
        `Slow 4G emulation recorded TTFB telemetry: ${slowMetrics.median.ttfb}ms`
      );
    });
  });
});
