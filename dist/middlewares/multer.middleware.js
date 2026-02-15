"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const uploadSingle = (fieldName = 'file') => (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (/^image\/.+/.test(file.mimetype))
            return cb(null, true);
        cb(new Error('Only image files are allowed'));
    },
}).single(fieldName);
exports.uploadSingle = uploadSingle;
// usage in controller: await uploadSingle('attachment')(req, res, next)
// then access req.file.buffer
