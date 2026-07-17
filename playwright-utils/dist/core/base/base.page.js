"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const common_util_1 = require("../../utils/common.util");
class BasePage extends common_util_1.CommonFunctions {
    page;
    static DEFAULT_TIMEOUT = 60000;
    constructor(page) {
        super();
        this.page = page;
    }
    async doClick(locator, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        await locator.waitFor({ state: 'visible', timeout: BasePage.DEFAULT_TIMEOUT });
        await locator.click();
    }
    async doEnterText(locator, sValue, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        await locator.waitFor({ state: 'visible', timeout: BasePage.DEFAULT_TIMEOUT });
        await locator.fill(sValue);
    }
    async doGetText(locator, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        await locator.waitFor({ state: 'visible', timeout: BasePage.DEFAULT_TIMEOUT });
        return await locator.textContent() ?? '';
    }
    async doGetAttribute(locator, sAttribute, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        await locator.waitFor({ state: 'visible', timeout: BasePage.DEFAULT_TIMEOUT });
        const value = await locator.getAttribute(sAttribute);
        await this.logMessage('INFO', `Attribute ${sAttribute} has value: ${value}`);
        return value;
    }
    async mouseHover(locator, sLogMessage) {
        await this.logMessage('INFO', sLogMessage);
        await locator.waitFor({ state: 'visible', timeout: BasePage.DEFAULT_TIMEOUT });
        await locator.hover();
    }
    async clearAndSetInputValue(inputField, inputValue) {
        await inputField.waitFor({ state: 'visible', timeout: BasePage.DEFAULT_TIMEOUT });
        await inputField.click();
        await inputField.fill('');
        await this.logMessage('INFO', 'Cleared input value');
        await inputField.fill(inputValue);
        await this.logMessage('INFO', `Set input value to ${inputValue}`);
    }
    async addTextFieldValue(value, fieldLocator) {
        await fieldLocator.waitFor({ state: 'visible', timeout: BasePage.DEFAULT_TIMEOUT });
        await fieldLocator.click();
        await fieldLocator.pressSequentially(value);
    }
    async doesElementExist(locator, sLogMessage) {
        const isVisible = await locator.isVisible();
        await this.logMessage('INFO', `${sLogMessage} - Element ${isVisible ? 'is' : 'is not'} visible`);
        return isVisible;
    }
}
exports.BasePage = BasePage;
