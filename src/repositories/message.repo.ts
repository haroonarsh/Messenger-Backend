import Message, { MessageDocument } from "../models/message.model";

export const createMessage = async (data: { conversationId: string, sender: object, text: string }): Promise<any> => {
    const message = new Message(data);
    await message.save();
    return message;
};

export const getMessagesByConversation = async (conversationId: string, limit: number = 50): Promise<MessageDocument[]> => {
    return await Message.find({ conversationId })
        .populate("sender", "username avatar")
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
};