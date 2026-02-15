"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationById = exports.findOrCreateConversation = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const ChatService = __importStar(require("../../services/chat/chat.service"));
const getConversations = async (req, res) => {
    try {
        const conversations = await ChatService.getConversations(req.user?.id || '');
        return res.status(200).json(conversations);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getConversations = getConversations;
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 30;
        const messages = await ChatService.getMessagesInConversation(conversationId, skip, limit);
        return res.status(200).json(messages.reverse());
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        console.log('userID:', req.user?.id);
        const message = await ChatService.sendMessage(req.user?.id || '', conversationId, text);
        return res.status(200).json(message);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.sendMessage = sendMessage;
const findOrCreateConversation = async (req, res) => {
    try {
        const { participants } = req.body; // [userId1, userId2]
        const currentUserId = req.user?.id;
        if (!participants || !Array.isArray(participants) || participants.length !== 2) {
            return res.status(400).json({ message: "Exactly two participants required" });
        }
        if (!participants.includes(currentUserId)) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const result = await ChatService.findOrCreateConversation(participants);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.findOrCreateConversation = findOrCreateConversation;
const getConversationById = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = await ChatService.getConversationById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        return res.status(200).json(conversation);
    }
    catch (error) {
        console.error("Get conversation error:", error);
        return res.status(500).json({ message: error.message });
    }
};
exports.getConversationById = getConversationById;
