import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

export function uploadBufferToCloudinary(buffer: Buffer, folder = 'messenger') {
    return new Promise<UploadApiResponse>((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                return resolve(result as UploadApiResponse);
            }
        );
        streamifier.createReadStream(buffer).pipe(upload_stream);
    });
}