import { expect } from '@playwright/test';
import { test } from '../../../core/base/base.test';
import { envConfig } from '../../../config/env.config';
import { getCleanDom, getAccessibilityTree } from '../../../utils/dom-cleaner';

test.describe('DOM Cleaner & Accessibility Tree Verification', () => {

  test('Verify simplified HTML DOM size reduction and readability', async ({ page }) => {
    // Navigate to target web app
    await page.goto(envConfig.baseUrl);
    await page.waitForLoadState('networkidle');

    // 1. Get raw HTML size
    const rawHtml = await page.content();
    const rawLength = rawHtml.length;

    // 2. Get cleaned HTML DOM
    const cleanHtml = await getCleanDom(page);
    const cleanLength = cleanHtml.length;

    // 3. Get accessibility snapshot
    const accessibilitySnapshot = await getAccessibilityTree(page);

    console.log('--- DOM SIZE REDUCTION RESULTS ---');
    console.log(`Original HTML DOM size: ${rawLength} characters`);
    console.log(`Simplified HTML DOM size: ${cleanLength} characters`);
    const reductionPercent = ((rawLength - cleanLength) / rawLength * 100).toFixed(2);
    console.log(`Token reduction: ${reductionPercent}%`);

    console.log('\n--- SIMPLIFIED HTML DOM EXTRACT ---');
    console.log(cleanHtml.substring(0, 1500) + (cleanHtml.length > 1500 ? '\n...[TRUNCATED]' : ''));

    console.log(accessibilitySnapshot.substring(0, 1000) + (accessibilitySnapshot.length > 1000 ? '\n...[TRUNCATED]' : ''));

    // Verification assertions
    expect(cleanLength).toBeLessThan(rawLength);
    expect(cleanHtml).toContain('body');
  });

});
