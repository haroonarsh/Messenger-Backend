import { Request, Response } from "express";
import cloudinary from "../../config/cloudinary";

export const uploadMedia = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        console.log("Uploading file:", req.file.mimetype, req.file.originalname);

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: req.file?.mimetype.startsWith("video") ? "video" : "image",
                    folder: "messenger/media",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(req.file?.buffer);
        });

        // @ts-ignore – result is from Cloudinary
        const secureUrl = result.secure_url;

        return res.status(200).json({ mediaUrl: secureUrl });
    } catch (error) {
        console.error("Media upload error:", error);
        return res.status(500).json({ message: "Media upload failed", error });
    }
};