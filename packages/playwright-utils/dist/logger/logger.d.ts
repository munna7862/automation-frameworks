import winston from 'winston';
export declare const createLogger: (filename: string, level?: string) => winston.Logger;
export declare const logger: winston.Logger;
export declare const errorLogger: winston.Logger;
