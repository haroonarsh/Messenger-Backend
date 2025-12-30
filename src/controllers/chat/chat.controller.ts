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
        const { conversationId, text } = req.body;
        console.log('userID:', req.user?.id);
        
        const message = await ChatService.sendMessage(
            req.user?.id || '',
            conversationId,
            text,
        );
        return res.status(200).json(message);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const findOrCreateConversation = async (req: Request, res: Response) => {
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
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
};