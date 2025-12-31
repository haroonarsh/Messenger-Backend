import mongoose from "mongoose";
import Conversation, { ConversationDocument } from "../models/conversation.model";

export const findConversationByParticipants = async (participantIds: string[]): Promise<ConversationDocument | null> => {
  const objectIds = participantIds.map(id => new mongoose.Types.ObjectId(id));
  return await Conversation.findOne({
    participants: { $all: objectIds, $size: objectIds.length },
    isGroup: false, // Only 1-on-1 chats
  }).exec();
};

export const createConversation = async (participantIds: string[]): Promise<ConversationDocument> => {
  const conversation = new Conversation({
    participants: participantIds.map(id => new mongoose.Types.ObjectId(id)),
    isGroup: false,
  });
  return await conversation.save();
};

export const getUserConversations = async (userId: string): Promise<ConversationDocument[]> => {
  return await Conversation.find({ participants: userId })
    .populate("participants", "username avatar")
    .populate("lastMessage")
    .sort({ updatedAt: -1 })
    .exec();
};

export const updateLastMessage = async ( conversationId: string, messageId: string ): Promise<ConversationDocument | null> => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { lastMessage: messageId, updatedAt: new Date() },
    { new: true }
  ).exec();
};

export const findConversationById = async ( conversationId: string ) => {
  return await Conversation.findById(conversationId)
    .populate("participants", "username avatar _id")
    .populate("lastMessage")
    .exec();
};