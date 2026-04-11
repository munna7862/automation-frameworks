import allureReporter from '@wdio/allure-reporter';
import { expect } from '@wdio/globals';
import { errorLogger, logger } from '@core/logger/logger';

export class CommonFunctions {
  public async compareTwoValues(sActualValue: unknown, sExpectedValue: unknown, sLogMessage: string): Promise<boolean> {
    const bValidation = sActualValue === sExpectedValue;

    if (bValidation) {
      await this.logMessage('PASS', `${sLogMessage} Success. Actual and Expected Values are: ${sActualValue}`);
    } else {
      await this.logMessage('FAIL', `${sLogMessage} Failed. Expected Value: ${sExpectedValue} | Actual Value: ${sActualValue}`);
    }

    await expect(sActualValue).toEqual(sExpectedValue);
    return bValidation;
  }

  public async logMessage(sLogLevel: string, sMessage: string): Promise<void> {
    const levelMap: Record<string, string> = {
      PASS: 'info',
      FAIL: 'error',
      INFO: 'info',
      WARN: 'warn'
    };

    const logLevel = levelMap[sLogLevel] || sLogLevel.toLowerCase();
    const reportLevel = sLogLevel.toUpperCase();
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

    if (sLogLevel === 'FAIL') {
      errorLogger.log({ level: logLevel, message: sMessage });
    }

    logger.log({ level: logLevel, message: sMessage });
    allureReporter.addStep(`[${timestamp}] [${reportLevel}] ${sMessage}`);
  }
}
