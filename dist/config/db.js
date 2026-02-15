"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./index"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ level: index_1.default.LOG_LEVEL });
let isconnected = false;
// Function to connect to MongoDB with retry logic
async function connectDB() {
    if (isconnected) {
        logger.info("MongoDB is already connected.");
        return;
    }
    const connect = async () => {
        try {
            logger.info("Attempting to connect to MongoDB...");
            await mongoose_1.default.connect(index_1.default.MONGO_URL);
            isconnected = true;
            logger.info("Successfully connected to MongoDB.");
            mongoose_1.default.connection.on("disconnected", () => {
                isconnected = false;
                logger.warn("MongoDB disconnected. Attempting to reconnect...");
                setTimeout(connect, index_1.default.MONGO_CONNECT_RETRY_MS);
            });
            mongoose_1.default.connection.on("error", (err) => {
                isconnected = false;
                logger.error({ err }, "MongoDB connection error. Attempting to reconnect...");
                setTimeout(connect, index_1.default.MONGO_CONNECT_RETRY_MS);
            });
            mongoose_1.default.connection.on("reconnected", () => {
                isconnected = true;
                logger.info("MongoDB reconnected successfully.");
            });
        }
        catch (error) {
            isconnected = false;
            logger.error({ error }, `Failed to connect to MongoDB. Retrying in ${index_1.default.MONGO_CONNECT_RETRY_MS}ms...`);
            setTimeout(connect, index_1.default.MONGO_CONNECT_RETRY_MS);
        }
    };
    await connect();
}
// Function to disconnect from MongoDB
async function disconnectDB() {
    if (!isconnected) {
        logger.info("MongoDB is already disconnected.");
        return;
    }
    try {
        await mongoose_1.default.disconnect();
        isconnected = false;
        logger.info("Successfully disconnected from MongoDB.");
    }
    catch (error) {
        logger.error({ error }, "Error while disconnecting from MongoDB.");
    }
}
