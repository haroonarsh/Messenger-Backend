import mongoose from "mongoose";
import * as ConversationRepo from "../../repositories/conversation.repo";
import * as MessageRepo from "../../repositories/message.repo";

export const getConversations = async (userId: string) => {
    return ConversationRepo.getUserConversations(userId);
};

export const getMessages = async (conversationId: string) => {
    return MessageRepo.getMessagesByConversation(conversationId);
};

export const sendMessage = async (userId: string, conversationId: string, text: string) => {

    console.log('SendMessage - userId:', userId);
    console.log('SendMessage - conversationId:', conversationId);
    
    // Validate access
    const conversation = await ConversationRepo.findConversationById(conversationId);
    if (!conversation) {
        throw new Error("Conversation not found");
    }

    console.log('Conversation participants:', conversation.participants.map(p => p.toString()));
    

    // Convert all participants to string and compare
    const isParticipant = conversation.participants.some((p: any) => p._id.toString() === userId);

    console.log('Is partisipant?', isParticipant);
    
    if (!isParticipant) {
        throw new Error("Access denied: You are not in this conversation");
    }
 
    // Create message
    const message = await MessageRepo.createMessage({
        conversationId,
        sender: new mongoose.Types.ObjectId(userId),
        text,
    });

    // Populate sender info
    await message.populate("sender", "username avatar");

    // Update conversation's last message
    await ConversationRepo.updateLastMessage(conversationId, message._id.toString());

    return message;
};

export const getMessagesInConversation = async (conversationId: string) => {
    return await MessageRepo.getMessagesByConversation(conversationId);
};

export const findOrCreateConversation = async (participantIds: string[]) => {
    let conversation = await ConversationRepo.findConversationByParticipants(participantIds);

    if (!conversation) {
        conversation = await ConversationRepo.createConversation(participantIds);
    }

    await conversation.populate("participants", "username avatar");

    return conversation;
};

export const getConversationById = async (conversationId: string) => {
  const conversation = await ConversationRepo.findConversationById(conversationId);

  if (!conversation) return null;

  // Already populated in repo (see below)
  return conversation;
};