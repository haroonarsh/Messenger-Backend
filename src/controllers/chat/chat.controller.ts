import * as ChatService from "../../services/chat/chat.service";
import { Request, Response } from "express";

export const getConversations = async (req: Request, res: Response) => {
    try {
        const conversations = await ChatService.getConversations(req.user?.id || '');
        return res.status(200).json(conversations);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });    
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const messages = await ChatService.getMessages(conversationId);
        return res.status(200).json(messages);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { conversationId, content, type, mediaUrl } = req.body;
        const message = await ChatService.sendMessage(req.user?.id || '', conversationId, content, type, mediaUrl);
        return res.status(200).json(message);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};