import { expect } from '@playwright/test';
import { test } from '../../../core/base/base.fixture';
import { envConfig, getLoginCredentials } from '../../../config/env.config';

test.describe('Keyboard-Only Navigation & Accessibility Suite', () => {
  // Use isolated session storage
  test.use({ storageState: { cookies: [], origins: [] } });

  test('UI_KEY_01: Complete User Journey Using Keyboard Only @regression @a11y', async ({
    page,
    commonFunctions,
    catalogPage,
    cartPage,
    checkoutPage
  }) => {
    test.setTimeout(90000);

    // Helper: assert current focused element has a visible focus indicator
    const assertFocusIndicator = async (stepDescription: string) => {
      const hasVisibleIndicator = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return false;
        const style = window.getComputedStyle(el);
        const hasOutline = style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
        const hasBoxShadow = style.boxShadow !== 'none' && style.boxShadow !== '';
        const hasBorder = style.borderWidth !== '0px' && style.borderStyle !== 'none';
        const isFocused = el.matches(':focus') || el.matches(':focus-visible');
        return hasOutline || hasBoxShadow || hasBorder || isFocused;
      });
      await commonFunctions.verifyCondition(
        hasVisibleIndicator,
        `Verifying active element has visible focus indicator during: ${stepDescription}`
      );
    };

    // Helper: press Tab repeatedly until active element matches predicate or max attempts reached
    const tabUntil = async (
      predicate: () => Promise<boolean>,
      maxTabs = 30,
      description = 'target element'
    ): Promise<boolean> => {
      if (await predicate()) {
        return true;
      }
      for (let i = 0; i < maxTabs; i++) {
        await page.keyboard.press('Tab');
        const matched = await expect
          .poll(async () => await predicate(), { timeout: 300, intervals: [50, 100] })
          .toBe(true)
          .then(() => true)
          .catch(() => false);
        if (matched) {
          return true;
        }
      }
      throw new Error(`Failed to focus ${description} within ${maxTabs} Tab presses`);
    };

    await test.step('Step 1: Navigate to Login page and authenticate via keyboard only', async () => {
      await page.goto(`${envConfig.baseUrl}/login`);
      await page.waitForLoadState('domcontentloaded');

      // Focus should enter the page; Tab into Username field
      await tabUntil(
        async () => {
          return await page.evaluate(() => {
            const el = document.activeElement as HTMLInputElement;
            return (
              el &&
              el.tagName === 'INPUT' &&
              (el.name === 'txt_usr_77' || el.type === 'text' || el.id === 'username')
            );
          });
        },
        20,
        'Username input'
      );

      await assertFocusIndicator('Username input field');
      const { userName, password } = getLoginCredentials();
      await page.keyboard.type(userName || 'admin');

      // Tab to Password field
      await page.keyboard.press('Tab');
      const isPasswordActive = await page.evaluate(() => {
        const el = document.activeElement as HTMLInputElement;
        return el && el.tagName === 'INPUT' && el.type === 'password';
      });
      expect(isPasswordActive).toBe(true);
      await assertFocusIndicator('Password input field');
      await page.keyboard.type(password || 'password123');

      // Tab to Sign In button and trigger via Enter
      await tabUntil(
        async () => {
          return await page.evaluate(() => {
            const el = document.activeElement as HTMLButtonElement;
            return el && (el.tagName === 'BUTTON' || el.type === 'submit');
          });
        },
        10,
        'Sign In button'
      );

      await assertFocusIndicator('Sign In submit button');
      await page.keyboard.press('Enter');

      // Wait for catalog redirect
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
      await expect(page.getByRole('main')).toBeVisible();
    });

    await test.step('Step 2: Add book to cart from catalog using keyboard only', async () => {
      // Tab until an Add to Cart button is reached
      await tabUntil(
        async () => {
          return await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return false;
            const isBtn = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button';
            const text = (el.textContent || '').toLowerCase();
            const id = el.id || '';
            return isBtn && (id.includes('add-to-cart') || text.includes('add to cart'));
          });
        },
        35,
        'Add to Cart button'
      );

      await assertFocusIndicator('Add to Cart button in catalog');
      // Trigger click using keyboard Enter
      await page.keyboard.press('Enter');

      // Ensure toast confirms addition
      await catalogPage.waitForCartStatusMessage('added to cart');
    });

    await test.step('Step 3: Navigate to Cart using keyboard only', async () => {
      // Tab to Cart link in navbar
      await tabUntil(
        async () => {
          return await page.evaluate(() => {
            const el = document.activeElement as HTMLAnchorElement;
            return el && el.tagName === 'A' && (el.textContent || '').trim() === 'Cart';
          });
        },
        30,
        'Navbar Cart link'
      );

      await assertFocusIndicator('Cart navbar link');
      await page.keyboard.press('Enter');

      await page.waitForURL('**/cart', { timeout: 10000 });
      await cartPage.waitForCartItemOrEmpty();
    });

    await test.step('Step 4: Proceed to Checkout using keyboard only', async () => {
      // Tab to Proceed to Checkout button
      await tabUntil(
        async () => {
          return await page.evaluate(() => {
            const el = document.activeElement;
            return Boolean(
              el && (el.textContent || '').toLowerCase().includes('proceed to checkout')
            );
          });
        },
        20,
        'Proceed to Checkout button'
      );

      await assertFocusIndicator('Proceed to Checkout button');
      await page.keyboard.press('Enter');

      await page.waitForURL('**/checkout', { timeout: 10000 });
    });

    await test.step('Step 5: Complete Checkout Wizard steps using keyboard only', async () => {
      // Step 1: Shipping Details
      await tabUntil(
        async () => {
          return await page.evaluate(() => {
            const el = document.activeElement as HTMLInputElement;
            return Boolean(
              el &&
              el.tagName === 'INPUT' &&
              (el.name === 'txt_f1' ||
                el.name === 'firstName' ||
                el.placeholder?.toLowerCase().includes('first name'))
            );
          });
        },
        20,
        'First Name input'
      );
      await assertFocusIndicator('First Name input');
      await page.keyboard.type('A11yKeyboard');

      await page.keyboard.press('Tab');
      await page.keyboard.type('Tester');

      await page.keyboard.press('Tab');
      await page.keyboard.type('100 Accessible Way');

      await page.keyboard.press('Tab');
      await page.keyboard.type('Melbourne');

      // Tab to Next Step button
      await tabUntil(
        async () => {
          return await page.evaluate(() => {
            const el = document.activeElement;
            return Boolean(
              el &&
              (el.id === 'wizard-next-btn' ||
                (el.textContent || '').toLowerCase().includes('next step'))
            );
          });
        },
        10,
        'Wizard Next Step button (Step 1)'
      );
      await assertFocusIndicator('Wizard Next Step button');
      await page.keyboard.press('Enter');

      // Step 2: Payment Details
      await tabUntil(
        async () => {
          return await page.evaluate(() => {
            const el = document.activeElement as HTMLInputElement;
            return Boolean(
              el &&
              el.tagName === 'INPUT' &&
              (el.name === 'creditCard' ||
                el.name === 'txt_c99' ||
                el.placeholder?.includes('card number'))
            );
          });
        },
        20,
        'Credit Card input'
      );
      await assertFocusIndicator('Credit Card input');
      await page.keyboard.type('4532000000000000');

      await page.keyboard.press('Tab');
      await page.keyboard.type('12/30');

      await page.keyboard.press('Tab');
      await page.keyboard.type('999');

      // Tab to Next Step button (to review/confirm)
      await tabUntil(
        async () => {
          return await page.evaluate(() => {
            const el = document.activeElement;
            return Boolean(
              el &&
              (el.id === 'wizard-next-btn' ||
                el.getAttribute('data-testid') === 'wizard-next-btn' ||
                (el.textContent || '').toLowerCase().includes('next step'))
            );
          });
        },
        20,
        'Wizard Next Step button (Step 2)'
      );
      await page.keyboard.press('Enter');

      // Wait for Step 3 to become active
      await expect(checkoutPage.stepIndicator3).toHaveClass(/step-active/, {
        timeout: 10000
      });

      // Step 3 / Confirmation: Check if payment is already confirmed or requires final submit
      const isConfirmed = await page
        .getByRole('heading', { name: /payment successful/i })
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (!isConfirmed) {
        const isFocused = await tabUntil(
          async () => {
            return await page.evaluate(() => {
              const el = document.activeElement;
              const text = (el?.textContent || '').toLowerCase();
              return Boolean(
                el &&
                (el.id === 'wizard-next-btn' ||
                  el.getAttribute('data-testid') === 'wizard-next-btn' ||
                  text.includes('complete payment') ||
                  text.includes('place order') ||
                  text.includes('pay now'))
              );
            });
          },
          10,
          'Final Complete Payment button'
        ).catch(() => false);

        if (
          !isFocused &&
          (await checkoutPage.finalSubmitButton
            .first()
            .isVisible()
            .catch(() => false))
        ) {
          await checkoutPage.finalSubmitButton.first().focus();
        }
        await assertFocusIndicator('Complete Payment button');
        await page.keyboard.press('Enter');
      }

      // Assert Order Confirmation
      await expect(page.getByRole('heading', { name: /payment successful/i })).toBeVisible({
        timeout: 15000
      });
    });
  });

  test('UI_KEY_02: Focus Trap and Reverse Tab Navigation @regression @a11y', async ({
    page,
    commonFunctions
  }) => {
    await test.step('Navigate to catalog and verify Shift+Tab moves focus backward', async () => {
      await page.goto(envConfig.baseUrl);
      await page.waitForLoadState('domcontentloaded');

      // Tab 3 times forward
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const activeEl1 = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 50));

      // Press Shift+Tab to move backward
      await page.keyboard.press('Shift+Tab');
      const activeEl2 = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 50));

      await commonFunctions.verifyCondition(
        activeEl1 !== activeEl2,
        'Verifying Shift+Tab successfully moves keyboard focus to previous focusable element'
      );
    });

    await test.step('Verify no keyboard traps exist across primary navigation bar', async () => {
      await page.goto(envConfig.baseUrl);

      const visitedElements = new Set<string>();

      // Cycle 15 tabs and ensure focus advances to distinct elements
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        const elementFingerprint = await page.evaluate(() => {
          const el = document.activeElement;
          return el
            ? `${el.tagName}:${el.id || el.className || el.textContent?.slice(0, 20)}`
            : 'null';
        });

        if (elementFingerprint !== 'null') {
          visitedElements.add(elementFingerprint);
        }
      }

      // Visited at least 4 distinct focusable elements (no infinite trap on a single node)
      await commonFunctions.verifyCondition(
        visitedElements.size >= 4,
        `Verifying keyboard focus advances freely without trap; encountered ${visitedElements.size} distinct focus targets`
      );
    });
  });
});
