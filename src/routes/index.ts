import { Router } from "express";
import authRoutes from "./auth/auth.route";
import chatRoutes from "./chat/chat.routes";
import userRoutes from "./user/user.routes";
import uploadRoutes from "./upload/upload.routes";

const router = Router();

router.use("/user", authRoutes);
router.use("/chat", chatRoutes);
router.use("/user", userRoutes);
router.use("/upload", uploadRoutes);

export default router;