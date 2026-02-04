import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/db';
import config from './config';
import { initSocket } from './sockets';
import pino from 'pino';

const logger = pino({ level: config.LOG_LEVEL });

const port = config.PORT || 4000;
const server = http.createServer(app);

// Initialize WebSocket after server created
const io = initSocket(server); 

async function startServer() {
    await connectDB();
    server.listen(port, () => {
        console.log(`🚀 Server listening on ${port}`);
    });
}

startServer().catch((error) => {
logger.fatal({ error }, "Failed to start server");
    process.exit(1);
});

// Graceful shutdown: close socket, server, and DB
async function shutdown(signal: string) {
    logger.info({ signal }, "Shuting down");
    server.close(async (err) => {
        if (err) logger.error({ err }, "Error closing server");
        // Close DB connection
        try {
            await disconnectDB();
        } catch (error) {
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