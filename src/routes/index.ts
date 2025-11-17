import { Router } from "express";
import authRoutes from "./auth/auth.route";
import chatRoutes from "./chat/chat.routes";
import userRoutes from "./user/user.routes";

const router = Router();

router.use("/user", authRoutes);
router.use("/chat", chatRoutes);
router.use("/user", userRoutes);

export default router;