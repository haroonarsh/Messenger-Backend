"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.memoryStorage(); // Kepp in moemory, we'll upload to cloudinary
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Max file size: 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|heic|bmp|tiff|mp4|mov|avi|webm|mkv|3gp|wmv|flv|mav|mp3|m4a|ogg|aac/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error("Invalid file type. Only images and videos allowed"));
    },
});
exports.default = upload;
