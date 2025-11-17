import { Types } from "mongoose";
import * as ConversationRepo from "../../repositories/conversation.repo";
import * as MessageRepo from "../../repositories/message.repo";

export const getConversations = async (userId: string) => {
    return ConversationRepo.getUserConversations(userId);
};

export const getMessages = async (conversationId: string) => {
    return MessageRepo.getMessagesByConversation(conversationId);
};

export const sendMessage = async (userId: string, conversationId: string, content: string, type: string, mediaUrl?: string) => {
    const conversation = await ConversationRepo.findConversationById(conversationId);
    if (!conversation || !conversation.participants.some(id => id.toString() === userId)) {
        throw new Error("Access denied");
    }

    const message = await MessageRepo.createMessage({
        conversationId: new Types.ObjectId(conversationId),
        sender: new Types.ObjectId(userId),
        content,
        type: type = "text",
        mediaUrl,
    });

    await ConversationRepo.updateConversationLastMessage(conversationId, message._id.toString());

    return message;
}