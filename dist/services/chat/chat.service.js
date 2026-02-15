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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationById = exports.findOrCreateConversation = exports.getMessagesInConversation = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ConversationRepo = __importStar(require("../../repositories/conversation.repo"));
const MessageRepo = __importStar(require("../../repositories/message.repo"));
const getConversations = async (userId) => {
    return ConversationRepo.getUserConversations(userId);
};
exports.getConversations = getConversations;
const getMessages = async (conversationId) => {
    return MessageRepo.getMessagesByConversation(conversationId);
};
exports.getMessages = getMessages;
const sendMessage = async (userId, conversationId, text = "", type = "text", mediaUrl) => {
    console.log('SendMessage - userId:', userId);
    console.log('SendMessage - conversationId:', conversationId);
    // Validate access
    const conversation = await ConversationRepo.findConversationById(conversationId);
    if (!conversation) {
        throw new Error("Conversation not found");
    }
    console.log('Conversation participants:', conversation.participants.map(p => p.toString()));
    // Convert all participants to string and compare
    const isParticipant = conversation.participants.some((p) => p._id.toString() === userId);
    console.log('Is partisipant?', isParticipant);
    if (!isParticipant) {
        throw new Error("Access denied: You are not in this conversation");
    }
    // Create message
    const message = await MessageRepo.createMessage({
        conversationId,
        sender: new mongoose_1.default.Types.ObjectId(userId),
        text,
        type,
        mediaUrl,
    });
    // Populate sender info
    await message.populate("sender", "username avatar");
    // Update conversation's last message
    await ConversationRepo.updateLastMessage(conversationId, message._id.toString());
    return message;
};
exports.sendMessage = sendMessage;
const getMessagesInConversation = async (conversationId, skip = 0, limit = 30) => {
    return await MessageRepo.getMessagesByConversation(conversationId, skip, limit);
};
exports.getMessagesInConversation = getMessagesInConversation;
const findOrCreateConversation = async (participantIds) => {
    let conversation = await ConversationRepo.findConversationByParticipants(participantIds);
    if (!conversation) {
        conversation = await ConversationRepo.createConversation(participantIds);
    }
    await conversation.populate("participants", "username avatar");
    return conversation;
};
exports.findOrCreateConversation = findOrCreateConversation;
const getConversationById = async (conversationId) => {
    const conversation = await ConversationRepo.findConversationById(conversationId);
    if (!conversation)
        return null;
    // Already populated in repo (see below)
    return conversation;
};
exports.getConversationById = getConversationById;
