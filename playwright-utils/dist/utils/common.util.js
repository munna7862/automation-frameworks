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
class CommonFunctions {
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
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}
exports.CommonFunctions = CommonFunctions;
