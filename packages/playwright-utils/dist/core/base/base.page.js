"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const common_util_1 = require("../../utils/common.util");
class BasePage extends common_util_1.CommonFunctions {
    page;
    static get DEFAULT_TIMEOUT() {
        return parseInt(process.env.ELEMENT_TIMEOUT || process.env.TIMEOUT || '15000', 10);
    }
    constructor(page) {
        super();
        this.page = page;
    }
    async ensureNavElementVisible(targetLocator) {
        try {
            const btnMobileMenu = this.page.locator('#mobile-menu-toggle');
            if (await btnMobileMenu.isVisible()) {
                const isExpanded = (await btnMobileMenu.getAttribute('aria-expanded')) === 'true';
                if (!isExpanded) {
                    await btnMobileMenu.click();
                    if (targetLocator) {
                        await targetLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
                    }
                }
            }
        }
        catch {
            // Non-blocking fallback
        }
    }
    async doClick(locator, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        await this.ensureNavElementVisible(locator);
        await locator.click({ timeout: BasePage.DEFAULT_TIMEOUT });
    }
    async doEnterText(locator, sValue, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        await locator.fill(sValue, { timeout: BasePage.DEFAULT_TIMEOUT });
    }
    async doGetText(locator, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        return (await locator.textContent({ timeout: BasePage.DEFAULT_TIMEOUT })) ?? '';
    }
    async doGetAttribute(locator, sAttribute, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        const value = await locator.getAttribute(sAttribute, { timeout: BasePage.DEFAULT_TIMEOUT });
        await this.logMessage('INFO', `Attribute ${sAttribute} has value: ${value}`);
        return value;
    }
    async mouseHover(locator, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        await locator.hover({ timeout: BasePage.DEFAULT_TIMEOUT });
    }
    async clearAndSetInputValue(inputField, inputValue) {
        await inputField.click({ timeout: BasePage.DEFAULT_TIMEOUT });
        await inputField.fill('', { timeout: BasePage.DEFAULT_TIMEOUT });
        await this.logMessage('INFO', 'Cleared input value');
        await inputField.fill(inputValue, { timeout: BasePage.DEFAULT_TIMEOUT });
        await this.logMessage('INFO', `Set input value to ${inputValue}`);
    }
    async addTextFieldValue(value, fieldLocator) {
        await fieldLocator.click({ timeout: BasePage.DEFAULT_TIMEOUT });
        await fieldLocator.pressSequentially(value, { timeout: BasePage.DEFAULT_TIMEOUT });
    }
    async doesElementExist(locator, sLogMessage) {
        try {
            const isVisible = await locator.isVisible();
            await this.logMessage('INFO', `${sLogMessage} - Element ${isVisible ? 'is' : 'is not'} visible`);
            return isVisible;
        }
        catch {
            await this.logMessage('INFO', `${sLogMessage} - Element is not visible`);
            return false;
        }
    }
}
exports.BasePage = BasePage;
