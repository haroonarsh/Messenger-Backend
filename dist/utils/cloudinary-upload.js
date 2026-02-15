"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
function uploadBufferToCloudinary(buffer, folder = 'messenger') {
    return new Promise((resolve, reject) => {
        const upload_stream = cloudinary_1.default.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
            if (error)
                return reject(error);
            return resolve(result);
        });
        streamifier_1.default.createReadStream(buffer).pipe(upload_stream);
    });
}
