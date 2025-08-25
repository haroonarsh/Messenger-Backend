import { Router } from "express";
import { uploadSingle } from "../../middlewares/multer.middleware";
import { loginValidator, registerValidator } from "../../validators/auth/auth.validator";
import { login, register } from "../../controllers/auth/auth.controller";

const router = Router();

router.post("/register", uploadSingle("avatar"), registerValidator, register);
router.post("/login", loginValidator, login);

export default router;