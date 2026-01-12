import Message, { MessageDocument } from "../models/message.model";

export const createMessage = async (data: { conversationId: string, sender: object, text: string; type?: "text" | "image" | "video"; mediaUrl?: string }): Promise<any> => {
    const message = new Message(data);
    await message.save();
    return message;
};

export const getMessagesByConversation = async (conversationId: string, skip: number = 0, limit: number = 30): Promise<MessageDocument[]> => {
    return await Message.find({ conversationId })
        .populate("sender", "name username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
};