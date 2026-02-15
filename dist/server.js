"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const config_1 = __importDefault(require("./config"));
const sockets_1 = require("./sockets");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ level: config_1.default.LOG_LEVEL });
const port = config_1.default.PORT || 4000;
const server = http_1.default.createServer(app_1.default);
// Initialize WebSocket after server created
const io = (0, sockets_1.initSocket)(server);
async function startServer() {
    await (0, db_1.connectDB)();
    server.listen(port, () => {
        console.log(`🚀 Server listening on ${port}`);
    });
}
startServer().catch((error) => {
    logger.fatal({ error }, "Failed to start server");
    process.exit(1);
});
// Graceful shutdown: close socket, server, and DB
async function shutdown(signal) {
    logger.info({ signal }, "Shuting down");
    server.close(async (err) => {
        if (err)
            logger.error({ err }, "Error closing server");
        // Close DB connection
        try {
            await (0, db_1.disconnectDB)();
        }
        catch (error) {
            logger.warn({ error }, "Error disconnecting DB");
        }
        process.exit(err ? 1 : 0);
    });
    // Close socket.io connections
    io.close(() => {
        logger.info("Socket.io connections closed");
    });
    // force exit fallback
    setTimeout(() => {
        logger.warn("Forcing shutdown");
        process.exit(1);
    }, 10_000).unref(); // 10 seconds
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
