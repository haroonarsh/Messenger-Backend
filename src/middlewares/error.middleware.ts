import e, { NextFunction, Request, Response } from "express";
import pino from "pino";
import config from "../config";

const logger = pino({ level: config.LOG_LEVEL });

export default function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    // Log the error details
    const log = (req as any).log ?? logger;
    log.error({ err, path: req.path, method: req.method }, "An error occurred");

    // Determine the status code
    const status = err?.statusCode || err?.status || 500;
    const body = {
        message: err?.message || "Internal Server Error",
        // only include stack trace in development mode
        ...(config.NODE_ENV === "development" ? { stack: err?.stack } : {}),
    };

    res.status(status).json(body);
}