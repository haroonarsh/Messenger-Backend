"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findConversationById = exports.updateLastMessage = exports.getUserConversations = exports.createConversation = exports.findConversationByParticipants = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const findConversationByParticipants = async (participantIds) => {
    const objectIds = participantIds.map(id => new mongoose_1.default.Types.ObjectId(id));
    return await conversation_model_1.default.findOne({
        participants: { $all: objectIds, $size: objectIds.length },
        isGroup: false, // Only 1-on-1 chats
    }).exec();
};
exports.findConversationByParticipants = findConversationByParticipants;
const createConversation = async (participantIds) => {
    const conversation = new conversation_model_1.default({
        participants: participantIds.map(id => new mongoose_1.default.Types.ObjectId(id)),
        isGroup: false,
    });
    return await conversation.save();
};
exports.createConversation = createConversation;
const getUserConversations = async (userId) => {
    return await conversation_model_1.default.find({ participants: userId })
        .populate("participants", "username avatar")
        .populate("lastMessage")
        .sort({ updatedAt: -1 })
        .exec();
};
exports.getUserConversations = getUserConversations;
const updateLastMessage = async (conversationId, messageId) => {
    return await conversation_model_1.default.findByIdAndUpdate(conversationId, { lastMessage: messageId, updatedAt: new Date() }, { new: true }).exec();
};
exports.updateLastMessage = updateLastMessage;
const findConversationById = async (conversationId) => {
    return await conversation_model_1.default.findById(conversationId)
        .populate("participants", "name username avatar status _id")
        .populate("lastMessage")
        .exec();
};
exports.findConversationById = findConversationById;
