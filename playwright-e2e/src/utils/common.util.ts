import { logger } from '@core/logger/logger';

export class CommonFunctions {
  // constructor(private page: Page, private context: BrowserContext) {}
  public async compareTwoValues(sActualValue: any, sExpectedValue: any, sLogMessage: string): Promise<boolean> {
    let bValidation = false;
    if (sActualValue === sExpectedValue) {
      logger.info(`PASS ${sLogMessage} Success !! Actual and Expected Values are:: ${sActualValue}`);
      bValidation = true;
    } else {
      logger.error(`FAIL ${sLogMessage} Failed!! Expected Value:: ${sExpectedValue} || Actual Value:: ${sActualValue}`);
    }
    return bValidation;
  }

}
