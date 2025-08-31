import { Router } from "express";
import { uploadSingle } from "../../middlewares/multer.middleware";
import { loginValidator, registerValidator } from "../../validators/auth/auth.validator";
import { getMe, login, register } from "../../controllers/auth/auth.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", uploadSingle("avatar"), registerValidator, register);
router.post("/login", loginValidator, login);
router.get("/me", authMiddleware, getMe);

export default router;