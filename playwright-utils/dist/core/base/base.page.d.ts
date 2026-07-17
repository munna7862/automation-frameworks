import { Page, Locator } from '@playwright/test';
import { CommonFunctions } from '../../utils/common.util';
export declare class BasePage extends CommonFunctions {
    protected page: Page;
    private static readonly DEFAULT_TIMEOUT;
    constructor(page: Page);
    doClick(locator: Locator, sLogMessage: string): Promise<void>;
    doEnterText(locator: Locator, sValue: string, sLogMessage: string): Promise<void>;
    doGetText(locator: Locator, sLogMessage: string): Promise<string>;
    doGetAttribute(locator: Locator, sAttribute: string, sLogMessage: string): Promise<string | null>;
    mouseHover(locator: Locator, sLogMessage: string): Promise<void>;
    clearAndSetInputValue(inputField: Locator, inputValue: string): Promise<void>;
    addTextFieldValue(value: string, fieldLocator: Locator): Promise<void>;
    doesElementExist(locator: Locator, sLogMessage: string): Promise<boolean>;
}
