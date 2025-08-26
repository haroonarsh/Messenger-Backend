import { Router } from "express";
import authRoutes from "./auth/auth.route";

const router = Router();

router.use("/user", authRoutes);

export default router;