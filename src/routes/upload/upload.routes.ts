import { Router } from "express";
import upload from "../../config/multer";
import { uploadMedia } from "../../controllers/upload/upload.controller";

const router = Router();

router.post("/media", upload.single("file"), uploadMedia);

export default router;