"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesByConversation = exports.createMessage = void 0;
const message_model_1 = __importDefault(require("../models/message.model"));
const createMessage = async (data) => {
    const message = new message_model_1.default(data);
    await message.save();
    return message;
};
exports.createMessage = createMessage;
const getMessagesByConversation = async (conversationId, skip = 0, limit = 30) => {
    return await message_model_1.default.find({ conversationId })
        .populate("sender", "name username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
};
exports.getMessagesByConversation = getMessagesByConversation;
