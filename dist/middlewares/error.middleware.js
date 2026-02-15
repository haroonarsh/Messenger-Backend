"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorMiddleware;
const pino_1 = __importDefault(require("pino"));
const config_1 = __importDefault(require("../config"));
const logger = (0, pino_1.default)({ level: config_1.default.LOG_LEVEL });
function errorMiddleware(err, req, res, next) {
    // Log the error details
    const log = req.log ?? logger;
    log.error({ err, path: req.path, method: req.method }, "An error occurred");
    // Determine the status code
    const status = err?.statusCode || err?.status || 500;
    const body = {
        message: err?.message || "Internal Server Error",
        // only include stack trace in development mode
        ...(config_1.default.NODE_ENV === "development" ? { stack: err?.stack } : {}),
    };
    res.status(status).json(body);
}
