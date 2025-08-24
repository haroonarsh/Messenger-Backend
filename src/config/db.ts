import mongoose from "mongoose";
import config from "./index";
import pino from "pino";

const logger = pino({ level: config.LOG_LEVEL });

let isconnected = false;

// Function to connect to MongoDB with retry logic
export async function connectDB(): Promise<void> {
    if (isconnected) {
        logger.info("MongoDB is already connected.");
        return;
    }

    const connect = async () => {
        try {
            logger.info("Attempting to connect to MongoDB...");
            await mongoose.connect(config.MONGO_URL);
            isconnected = true;
            logger.info("Successfully connected to MongoDB.");

            mongoose.connection.on("disconnected", () => {
                isconnected = false;
                logger.warn("MongoDB disconnected. Attempting to reconnect...");
                setTimeout(connect, config.MONGO_CONNECT_RETRY_MS);
            });

            mongoose.connection.on("error", (err) => {
                isconnected = false;
                logger.error({ err }, "MongoDB connection error. Attempting to reconnect...");
                setTimeout(connect, config.MONGO_CONNECT_RETRY_MS);
            });

            mongoose.connection.on("reconnected", () => {
                isconnected = true;
                logger.info("MongoDB reconnected successfully.");
            });
        } catch (error) {
            isconnected = false;
            logger.error({ error }, `Failed to connect to MongoDB. Retrying in ${config.MONGO_CONNECT_RETRY_MS}ms...`);
            setTimeout(connect, config.MONGO_CONNECT_RETRY_MS);
        }
    };
    await connect();
}

// Function to disconnect from MongoDB
export async function disconnectDB(): Promise<void> {
    if (!isconnected) {
        logger.info("MongoDB is already disconnected.");
        return;
    }
    try {
        await mongoose.disconnect();
        isconnected = false;
        logger.info("Successfully disconnected from MongoDB.");
    } catch (error) {
        logger.error({ error }, "Error while disconnecting from MongoDB.");
    }
}