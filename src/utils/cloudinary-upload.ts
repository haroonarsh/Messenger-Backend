import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";
import { error } from "console";

export function uploadBufferToCloudinary(buffer: Buffer, folder: 'messenger'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) return reject(error);
            resolve(result as UploadApiResponse);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
}