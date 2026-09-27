import { Locator } from '@playwright/test';
export declare class CommonFunctions {
    /**
     * Verifies scalar values with full Winston structured logging, Allure step tracking,
     * and immediate, descriptive Playwright assertion diffs (Expected vs Received).
     *
     * @param actual The actual value produced by the system under test.
     * @param expected The expected value.
     * @param description Business description of the assertion step.
     * @param soft If true, uses expect.soft to allow subsequent assertions to run.
     */
    verifyValue<T>(actual: T, expected: T, description: string, soft?: boolean): Promise<void>;
    /**
     * Verifies a boolean condition with full Winston logging and descriptive diff.
     *
     * @param condition The evaluated boolean condition.
     * @param description Business description of what condition represents.
     * @param soft If true, uses expect.soft.
     */
    verifyCondition(condition: boolean, description: string, soft?: boolean): Promise<void>;
    /**
     * Verifies locator text with automatic Playwright polling, Winston logging,
     * and descriptive assertion failure diffs.
     *
     * @param locator Playwright locator.
     * @param expectedText Expected string or RegExp.
     * @param description Business description of the element text check.
     * @param timeout Optional custom timeout in milliseconds.
     */
    verifyLocatorText(locator: Locator, expectedText: string | RegExp, description: string, timeout?: number): Promise<void>;
    /**
     * Verifies locator item count with polling, Winston logging, and descriptive error diff.
     *
     * @param locator Playwright locator.
     * @param expectedCount Expected number of matching elements.
     * @param description Business description of the item count check.
     * @param timeout Optional custom timeout in milliseconds.
     */
    verifyItemCount(locator: Locator, expectedCount: number, description: string, timeout?: number): Promise<void>;
    /**
     * Verifies locator visibility with polling and structured logging.
     *
     * @param locator Playwright locator.
     * @param description Business description of the visibility check.
     * @param timeout Optional custom timeout in milliseconds.
     */
    verifyElementVisible(locator: Locator, description: string, timeout?: number): Promise<void>;
    /**
     * Legacy comparison helper that returns a boolean.
     * @deprecated Use `verifyValue` or `verifyCondition` for direct Playwright assertion diffs and fail-fast behavior.
     */
    compareTwoValues(sActualValue: any, sExpectedValue: any, sLogMessage: string): Promise<boolean>;
    logMessage(sLogLevel: string, sMessage: string): Promise<void>;
    generateRandomString(length: number): string;
}
