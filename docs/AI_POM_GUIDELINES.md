# Guidelines for Generating Page Object Models (POM) with AI

If you are using an AI assistant (like VSCode Copilot, ChatGPT, or Antigravity) to create Page Objects for this project, copy and paste the prompt instructions below along with the cleaned HTML output from the DOM Cleaner tool.

---

## The AI Prompt Template

**Copy and paste the text below into your AI chat window:**

```markdown
You are an expert test automation engineer specializing in Playwright, TypeScript, and the Page Object Model (POM).

I want you to write a TypeScript Page Object class for a web page. I will provide you with the simplified HTML/DOM representation of that page.

### Architectural Rules for this Codebase:

1. **Inheritance & Imports:**
   - The Page Object class must extend the `BasePage` class.
   - Import `BasePage` relatively: `import { BasePage } from '../core/base/base.page';` (adjust relative depth as needed, e.g. `../../core/base/base.page`).
   - Import `expect` and `Locator` from `@playwright/test`: `import { expect, Locator } from '@playwright/test';`.

2. **Locator Definition:**
   - Element locators must be defined as **private getters** returning a `Locator`.
   - Always prefer robust, role-based, or placeholder-based selectors first:
     - `this.page.getByRole('button', { name: 'Login' })`
     - `this.page.getByPlaceholder('Enter your username')`
     - `this.page.getByLabel('Password')`
     - `this.page.getByTestId('submit-btn')`
   - If semantic selectors are not possible or clean, use element IDs: `this.page.locator('#element-id')`.
   - If absolutely necessary for complex/dynamic DOMs, use precise CSS or relative XPath locators.

3. **Interaction Wrapper Methods:**
   - NEVER call native Playwright interactions (like `locator.click()` or `locator.fill()`) directly in your page methods.
   - Instead, use the custom base wrappers inherited from `BasePage`, which handle waits and logging automatically:
     - Click: `await this.doClick(this.btnSubmit, "Clicking the submit button");`
     - Type/Fill: `await this.doEnterText(this.txtUsername, username, \`Entering username: \${username}\`);`
     - Get Text: `const text = await this.doGetText(this.lblMessage, "Reading status message");`
     - Get Attribute: `const value = await this.doGetAttribute(this.element, "class", "Checking element style class");`
     - Hover: `await this.mouseHover(this.menuItem, "Hovering over menu item");`
     - Clear and Set Input: `await this.clearAndSetInputValue(this.txtSearch, query);`
     - Verify Existence: `const exists = await this.doesElementExist(this.element, "Checking if element is visible");`

4. **Class Structure Example:**

```typescript
import { BasePage } from '../core/base/base.page';
import { expect, Locator } from '@playwright/test';

export class LoginPage extends BasePage {

  // Define locators as private getters
  private get inputUsername(): Locator {
    return this.page.getByPlaceholder('Username');
  }

  private get inputPassword(): Locator {
    return this.page.getByLabel('Password');
  }

  private get buttonSubmit(): Locator {
    return this.page.getByRole('button', { name: 'Log In' });
  }

  private get labelErrorMessage(): Locator {
    return this.page.locator('.error-message-banner');
  }

  // Define action methods using BasePage wrappers
  public async login(username: string, password: string): Promise<void> {
    await this.doEnterText(this.inputUsername, username, \`Entering username: \${username}\`);
    await this.doEnterText(this.inputPassword, password, 'Entering password');
    await this.doClick(this.buttonSubmit, 'Clicking Login button');
  }

  public async getErrorMessage(): Promise<string> {
    return await this.doGetText(this.labelErrorMessage, 'Retrieving login error message');
  }
}
```

Now, write the Page Object class for the following cleaned DOM structure:

[INSERT CLEANED DOM HERE]
```
