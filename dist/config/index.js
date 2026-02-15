"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = process.env.NODE_ENV === 'production' ? '.env' : path_1.default.resolve(process.cwd(), '.env');
dotenv_1.default.config({ path: envPath });
function required(key) {
    const value = process.env[key];
    if (!value)
        throw new Error(`Missing required environment variable: ${key}`);
    return value;
}
exports.default = {
    PORT: process.env.PORT || 4000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    MONGO_URL: process.env.MONGO_URL || required('MONGO_URL'),
    MONGO_CONNECT_RETRY_MS: Number(process.env.MONGO_CONNECT_RETRY_MS) || 3000,
    JWT_SECRET: process.env.JWT_SECRET || required('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    CLIENT_URL: process.env.CLIENT_URL || 'https://messenger-ui-sigma.vercel.app',
};
