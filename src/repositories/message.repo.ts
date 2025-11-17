import Message, { MessageDocument } from "../models/message.model";

export const createMessage = async (payload: Partial<MessageDocument>): Promise<MessageDocument> => {
    const message = new Message(payload);
    return message.save();
};

export const getMessagesByConversation = async (conversationId: string, limit: number = 50): Promise<MessageDocument[]> => {
    return Message.find({ conversationId })
        .populate("sender", "username avatar")
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
};