# Walkthrough: Reusable `playwright-utils` Package Created

We have successfully created a standalone, reusable npm package named `playwright-utils` containing the `BasePage` and its core dependencies.

## What Was Done

1. **Created Package Files**:
   - [package.json](file:///c:/AutomationFrameworks/playwright-utils/package.json): Defines npm package configuration, dependencies, and build scripts.
   - [tsconfig.json](file:///c:/AutomationFrameworks/playwright-utils/tsconfig.json): Sets up TypeScript options to generate ES modules/CommonJS code and declaration files.
   - [src/index.ts](file:///c:/AutomationFrameworks/playwright-utils/src/index.ts): Serves as the main entry point to export all classes/methods.
2. **Copied and Configured Core Code**:
   - [src/core/base/base.page.ts](file:///c:/AutomationFrameworks/playwright-utils/src/core/base/base.page.ts): Contains the `BasePage` class with updated relative imports.
   - [src/utils/common.util.ts](file:///c:/AutomationFrameworks/playwright-utils/src/utils/common.util.ts): Contains `CommonFunctions` with updated logger imports.
   - [src/logger/logger.ts](file:///c:/AutomationFrameworks/playwright-utils/src/logger/logger.ts): Winston logger adapted to resolve directory location via `process.cwd()` (so log files are generated in the consuming project's folder).
3. **Installed Dependencies & Compiled**:
   - Installed `winston`, `@playwright/test`, and `allure-js-commons`.
   - Ran compilation (`tsc`), creating compiled files and type definitions inside `dist/`.

---

## How to Use this Package in Other Repositories

### Step 1: Install or Link the Package

#### Option A: Local Symlink (for development)
1. Go to the package directory and link it globally:
   ```bash
   cd c:/AutomationFrameworks/playwright-utils
   npm link
   ```
2. Go to your other repository and link it:
   ```bash
   cd /path/to/other-repo
   npm link playwright-utils
   ```

#### Option B: Local Tarball Installation
1. Pack the package into a `.tgz` file:
   ```bash
   cd c:/AutomationFrameworks/playwright-utils
   npm pack
   ```
   *This outputs `playwright-utils-1.0.0.tgz` in the package folder.*
2. Install the tarball in the other repository:
   ```bash
   cd /path/to/other-repo
   npm install /path/to/playwright-utils/playwright-utils-1.0.0.tgz
   ```

#### Option C: Install from Monorepo Git Subdirectory (No Publish Needed)
If the package is stored in a monorepo on Git (such as `automation-frameworks`), you can install it directly from the subfolder using the `#path:` syntax:
```bash
npm install github:munna7862/automation-frameworks#path:playwright-utils
```
> [!NOTE]
> The package's `package.json` contains a `"prepare": "npm run build"` script, which ensures TypeScript compiles to `dist/` automatically upon git installation.

#### Option D: Publish to Public NPM Registry
If you want to publish the package to the registry so that anyone can install it anywhere:

1. **Rename the package** in `playwright-utils/package.json` to a scoped name (to avoid naming collisions):
   ```json
   "name": "@munna7862/playwright-utils"
   ```
2. **Log in to your NPM account** via terminal:
   ```bash
   npm login
   ```
3. **Publish the package**:
   ```bash
   cd playwright-utils
   npm publish --access public
   ```
   Once published, it can be installed anywhere via:
   ```bash
   npm install @munna7862/playwright-utils
   ```

---

### Step 2: Import & Extend in Consuming Repos

In your other repositories, you can import and extend the classes directly.

#### Example Page Object (`login.page.ts`)
```typescript
import { BasePage } from 'playwright-utils';
import { Page } from '@playwright/test';

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator('#username');
  private readonly passwordInput = this.page.locator('#password');
  private readonly loginButton = this.page.locator('#login-btn');

  constructor(page: Page) {
    super(page);
  }

  async login(user: string, pass: string) {
    await this.doEnterText(this.usernameInput, user, `Entering username: ${user}`);
    await this.doEnterText(this.passwordInput, pass, 'Entering password');
    await this.doClick(this.loginButton, 'Clicking login button');
  }
}
```

#### Example Usage in Tests (`login.spec.ts`)
```typescript
import { test } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test('Verify successful login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/login');
  await loginPage.login('user1', 'pass123');
});
```
