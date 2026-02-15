"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const chat_controller_1 = require("../../controllers/chat/chat.controller");
const router = (0, express_1.Router)();
router.get("/conversations", auth_middleware_1.default, chat_controller_1.getConversations);
router.get("/messages/:conversationId", auth_middleware_1.default, chat_controller_1.getMessages);
router.post("/messages", auth_middleware_1.default, chat_controller_1.sendMessage);
router.post("/conversations/find-or-create", auth_middleware_1.default, chat_controller_1.findOrCreateConversation);
router.get("/conversations/:conversationId", chat_controller_1.getConversationById);
exports.default = router;
