import multer from "multer";
import path from "path";

const storage = multer.memoryStorage(); // Kepp in moemory, we'll upload to cloudinary

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Max file size: 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|heic|bmp|tiff|mp4|mov|avi|webm|mkv|3gp|wmv|flv|mav|mp3|m4a|ogg|aac/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error("Invalid file type. Only images and videos allowed"));
    },
});

export default upload;