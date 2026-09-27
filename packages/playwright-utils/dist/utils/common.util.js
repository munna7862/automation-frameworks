"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonFunctions = void 0;
const logger_1 = require("../logger/logger");
const test_1 = require("@playwright/test");
const allure = __importStar(require("allure-js-commons"));
const crypto_1 = require("crypto");
class CommonFunctions {
    /**
     * Verifies scalar values with full Winston structured logging, Allure step tracking,
     * and immediate, descriptive Playwright assertion diffs (Expected vs Received).
     *
     * @param actual The actual value produced by the system under test.
     * @param expected The expected value.
     * @param description Business description of the assertion step.
     * @param soft If true, uses expect.soft to allow subsequent assertions to run.
     */
    async verifyValue(actual, expected, description, soft = false) {
        const isMatch = actual === expected;
        if (isMatch) {
            await this.logMessage('PASS', `${description} - Matched: [${String(actual)}]`);
        }
        else {
            await this.logMessage('FAIL', `${description} - Expected: [${String(expected)}] but Received: [${String(actual)}]`);
        }
        if (soft) {
            test_1.expect.soft(actual, description).toBe(expected);
        }
        else {
            (0, test_1.expect)(actual, description).toBe(expected);
        }
    }
    /**
     * Verifies a boolean condition with full Winston logging and descriptive diff.
     *
     * @param condition The evaluated boolean condition.
     * @param description Business description of what condition represents.
     * @param soft If true, uses expect.soft.
     */
    async verifyCondition(condition, description, soft = false) {
        if (condition) {
            await this.logMessage('PASS', `${description} - Condition met (true)`);
        }
        else {
            await this.logMessage('FAIL', `${description} - Condition failed (false)`);
        }
        if (soft) {
            test_1.expect.soft(condition, description).toBe(true);
        }
        else {
            (0, test_1.expect)(condition, description).toBe(true);
        }
    }
    /**
     * Verifies locator text with automatic Playwright polling, Winston logging,
     * and descriptive assertion failure diffs.
     *
     * @param locator Playwright locator.
     * @param expectedText Expected string or RegExp.
     * @param description Business description of the element text check.
     * @param timeout Optional custom timeout in milliseconds.
     */
    async verifyLocatorText(locator, expectedText, description, timeout) {
        await this.logMessage('INFO', `Checking text: ${description}`);
        try {
            await (0, test_1.expect)(locator, description).toHaveText(expectedText, timeout ? { timeout } : undefined);
            await this.logMessage('PASS', `Verified text for: ${description} -> "${expectedText}"`);
        }
        catch (error) {
            await this.logMessage('FAIL', `Text verification failed for: ${description} - ${error}`);
            throw error;
        }
    }
    /**
     * Verifies locator item count with polling, Winston logging, and descriptive error diff.
     *
     * @param locator Playwright locator.
     * @param expectedCount Expected number of matching elements.
     * @param description Business description of the item count check.
     * @param timeout Optional custom timeout in milliseconds.
     */
    async verifyItemCount(locator, expectedCount, description, timeout) {
        await this.logMessage('INFO', `Checking item count: ${description}`);
        try {
            await (0, test_1.expect)(locator, description).toHaveCount(expectedCount, timeout ? { timeout } : undefined);
            await this.logMessage('PASS', `Verified count [${expectedCount}] for: ${description}`);
        }
        catch (error) {
            await this.logMessage('FAIL', `Count verification failed for: ${description} - Expected: [${expectedCount}] - ${error}`);
            throw error;
        }
    }
    /**
     * Verifies locator visibility with polling and structured logging.
     *
     * @param locator Playwright locator.
     * @param description Business description of the visibility check.
     * @param timeout Optional custom timeout in milliseconds.
     */
    async verifyElementVisible(locator, description, timeout) {
        await this.logMessage('INFO', `Checking element visibility: ${description}`);
        try {
            await (0, test_1.expect)(locator, description).toBeVisible(timeout ? { timeout } : undefined);
            await this.logMessage('PASS', `Verified element is visible: ${description}`);
        }
        catch (error) {
            await this.logMessage('FAIL', `Visibility check failed for: ${description} - ${error}`);
            throw error;
        }
    }
    /**
     * Legacy comparison helper that returns a boolean.
     * @deprecated Use `verifyValue` or `verifyCondition` for direct Playwright assertion diffs and fail-fast behavior.
     */
    async compareTwoValues(sActualValue, sExpectedValue, sLogMessage) {
        let bValidation = false;
        if (sActualValue === sExpectedValue) {
            await this.logMessage('PASS', ` ${sLogMessage} Success !! Actual and Expected Values are:: ${sActualValue}`);
            bValidation = true;
        }
        else {
            await this.logMessage('FAIL', ` ${sLogMessage} Failed!! Expected Value:: ${sExpectedValue} || Actual Value:: ${sActualValue}`);
        }
        test_1.expect.soft(sActualValue, sLogMessage).toBe(sExpectedValue);
        return bValidation;
    }
    async logMessage(sLogLevel, sMessage) {
        const levelMap = {
            'PASS': 'info',
            'FAIL': 'error',
            'INFO': 'info',
            'WARN': 'warn'
        };
        const logLevel = levelMap[sLogLevel] || sLogLevel.toLowerCase();
        const reportLevel = sLogLevel.toUpperCase();
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
        // Use errorLogger for failures to log to separate error file
        if (sLogLevel === 'FAIL') {
            logger_1.errorLogger.log({ level: logLevel, message: sMessage });
        }
        // Always log to main framework log
        logger_1.logger.log({ level: logLevel, message: sMessage });
        const emoji = sLogLevel === 'PASS' ? '✅' : sLogLevel === 'FAIL' ? '❌' : '';
        await allure.step(`${emoji} [${timestamp}] [${reportLevel}] ${sMessage}`, async () => { });
    }
    generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt((0, crypto_1.randomInt)(0, characters.length));
        }
        return result;
    }
}
exports.CommonFunctions = CommonFunctions;
