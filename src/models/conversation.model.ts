import { Document, model, Schema, Types } from "mongoose";

export interface IConversation {
    participants: Types.ObjectId[]; // Array of user IDs
    isGroup: boolean;
    groupName?: string; // For group conversations
    lastMessage?: Types.ObjectId; // Reference to latest message
    createdAt: Date;
    updatedAt: Date;
}

export type ConversationDocument = Document<Types.ObjectId> & IConversation;

const conversationSchema = new Schema<ConversationDocument>(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
        isGroup: { type: Boolean, default: false },
        groupName: { type: String },
        lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    },
    { timestamps: true }
);

// Add index for faster queries
conversationSchema.index({ participants: 1 });

export default model<ConversationDocument>("Conversation", conversationSchema);