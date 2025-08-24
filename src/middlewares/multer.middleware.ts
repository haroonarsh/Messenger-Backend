import multer from "multer";

const storage = multer.memoryStorage();

export const uploadSingle = (fieldName = 'file') => 
    multer({ 
        storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            if (/^image\/.+/.test(file.mimetype)) return cb(null, true);
            cb(new Error('Only image files are allowed'));
        },
    }).single(fieldName);

    // usage in controller: await uploadSingle('attachment')(req, res, next)
    // then access req.file.buffer