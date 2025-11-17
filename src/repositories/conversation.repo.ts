import Conversation, { ConversationDocument } from "../models/conversation.model";

export const findConversationByParticipants = async (participants: string[]): Promise<ConversationDocument | null> => {
    return Conversation.findOne({ participants: { $all: participants } }).exec();
};

export const createConversation = async (participants: string[]): Promise<ConversationDocument> => {
    const conversation = new Conversation({ participants });
    return conversation.save();
};

export const getUserConversations = async (userId: string): Promise<ConversationDocument[]> => {
    return Conversation.find({ participants: userId })
        .populate("participants", "username avatar")
        .populate("lastMessage")
        .sort({ updatedAt: -1 })
        .exec();
};

export const updateConversationLastMessage = async (conversationId: string, messageId: string): Promise<ConversationDocument | null> => {
    return Conversation.findByIdAndUpdate(conversationId, { lastMessage: messageId, updatedAt: new Date() }, { new: true }).exec();
};

export const findConversationById = async (conversationId: string): Promise<ConversationDocument | null> => {
    return Conversation.findById(conversationId).exec();
};