import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { findOrCreateConversation, getConversations, getMessages, sendMessage } from "../../controllers/chat/chat.controller";

const router = Router();

router.get("/conversations", authMiddleware, getConversations);
router.get("/messages/:conversationId", authMiddleware, getMessages);
router.post("/messages", authMiddleware, sendMessage);
router.post("/conversations/find-or-create", authMiddleware, findOrCreateConversation);

export default router;