"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.logger = exports.createLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logDir = path_1.default.resolve(process.cwd(), 'logs');
try {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
catch {
    // Directory already exists or non-fatal
}
const createLogger = (filename, level = 'info') => {
    return winston_1.default.createLogger({
        level,
        format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)),
        transports: [
            new winston_1.default.transports.Console({ format: winston_1.default.format.colorize({ all: true }) }),
            new winston_1.default.transports.File({ filename: path_1.default.join(logDir, filename) })
        ]
    });
};
exports.createLogger = createLogger;
exports.logger = (0, exports.createLogger)('framework.log');
exports.errorLogger = (0, exports.createLogger)('errors.log', 'error');
