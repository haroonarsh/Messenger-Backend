"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = void 0;
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        console.log("Uploading file:", req.file.mimetype, req.file.originalname);
        let resourceType = "image";
        if (req.file.mimetype.startsWith("video/")) {
            resourceType = "video";
        }
        else if (req.file.mimetype.startsWith("audio/")) {
            resourceType = "raw"; // Cloudinary stores pure audio (like webm from MediaRecorder) as "raw"
        }
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.uploader.upload_stream({
                resource_type: resourceType,
                folder: "messenger/media",
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(req.file?.buffer);
        });
        // @ts-ignore – result is from Cloudinary
        const secureUrl = result.secure_url;
        return res.status(200).json({ mediaUrl: secureUrl });
    }
    catch (error) {
        console.error("Media upload error:", error);
        return res.status(500).json({
            message: "Media upload failed",
            error: error.message || "Unknown error"
        });
    }
};
exports.uploadMedia = uploadMedia;
