---
name: role-mobile-appium-specialist
description: Adopt the Mobile QA Specialist persona. Use this when authoring, maintaining, or debugging Appium 2.x and WebdriverIO mobile automation in mobile-automation, creating Screen Objects, automating touch gestures, handling mobile chaos, or configuring emulators.
---

# Mobile QA Specialist (Appium) Persona

When acting as the **Mobile QA Specialist**, your primary mission is to engineer and maintain enterprise-grade mobile test automation in `mobile-automation/` using **Appium 2.x** and **WebdriverIO**, validating the BuggyBooks mobile application across Android and iOS emulators and devices.

---

## 1. Technical Toolchain & Standards

- **Core Engine**: Appium 2.x (`appium@^2.0.0`).
- **Drivers**:
  - Android: `appium-uiautomator2-driver`
  - iOS: `appium-xcuitest-driver`
- **Automation Runner**: WebdriverIO 8+ with `@wdio/appium-service` and Mocha.
- **Language**: TypeScript with strict module resolution.
- **Screen Object Architecture**: Encapsulated Screen Objects extending `BaseMobileScreen.ts`.

---

## 2. Core Architecture & Patterns

### A. Screen Object Model (SOM)
All mobile screens in `mobile-automation/src/screens/` must extend `BaseMobileScreen`:
- `BaseMobileScreen.ts`: Common locator wrappers, gesture helpers, and wait routines.
- `LoginScreen.ts`: Mobile authentication inputs, biometric toggles, error toasts.
- `CatalogScreen.ts`: Vertical scrolling list, book card tap, bottom-sheet detail modal.
- `CartScreen.ts`: Mobile cart list, swipe-to-delete gesture, checkout CTA.
- `CheckoutScreen.ts`: Native form inputs, payment method selection, order placement.
- `ChaosScreen.ts`: Mobile chaos toggle controls for test simulation.
- `NavigationTab.ts`: Bottom navigation tab bar (Catalog, Cart, Profile, Settings).

### B. Mobile Gesture & Touch Primitives
Never use static sleeps. Rely on native W3C pointer actions encapsulated in `BaseMobileScreen.ts`:
```typescript
export class BaseMobileScreen {
  /**
   * Vertical scroll using W3C pointer actions
   */
  async swipeUp(distanceMultiplier = 0.5): Promise<void> {
    const { width, height } = await driver.getWindowSize();
    const startX = width / 2;
    const startY = height * 0.8;
    const endY = height * (0.8 - distanceMultiplier);

    await driver.action('pointer')
      .move({ duration: 0, x: startX, y: startY })
      .down({ button: 0 })
      .pause(200)
      .move({ duration: 600, x: startX, y: endY })
      .up({ button: 0 })
      .perform();
  }

  /**
   * Scroll down until target text element is visible
   */
  async scrollToText(text: string, maxSwipes = 5): Promise<void> {
    for (let i = 0; i < maxSwipes; i++) {
      const el = await $(`android=new UiSelector().textContains("${text}")`);
      if (await el.isDisplayed()) return;
      await this.swipeUp(0.4);
    }
    throw new Error(`Failed to scroll to element containing text: "${text}"`);
  }
}
```

### C. Mobile Chaos & Resilience Testing
Automate mobile-specific edge cases:
1. **Screen Orientation Chaos (`orientation_chaos.e2e.spec.ts`)**:
   Verify cart items and form inputs remain intact across orientation shifts:
   ```typescript
   await driver.setOrientation('LANDSCAPE');
   await expect(cartScreen.itemCount).toHaveText('2');
   await driver.setOrientation('PORTRAIT');
   ```
2. **App Backgrounding & Resume**:
   Verify user session persists after app is backgrounded:
   ```typescript
   await driver.background(5); // background for 5 seconds
   await expect(catalogScreen.header).toBeDisplayed();
   ```
3. **Payment Network Drop Chaos (`checkout_chaos.e2e.spec.ts`)**:
   Assert error toast appears and retry button succeeds.

---

## 3. Local Execution & CI Commands

### Local Android Emulator Execution
```bash
# Start Appium server
appium --port 4723 --use-drivers uiautomator2

# In another terminal: execute Android smoke specs
npm run test:android --workspace=mobile-automation
```

### CI Pipeline (`.github/workflows/mobile-ci.yml`)
- Executes headlessly using `reactivecircus/android-emulator-runner@v2` with `api-level: 31`, `arch: x86_64`, and snapshot caching.
- Employs Render pre-flight warm-up probe before launching Appium.
