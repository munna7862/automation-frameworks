export declare class CommonFunctions {
    compareTwoValues(sActualValue: any, sExpectedValue: any, sLogMessage: string): Promise<boolean>;
    logMessage(sLogLevel: string, sMessage: string): Promise<void>;
    generateRandomString(length: number): string;
}
