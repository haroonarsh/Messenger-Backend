import { Document, Schema, model, Types } from "mongoose";

export interface IMessage {
    conversationId: Types.ObjectId;
    sender: Types.ObjectId;
    content: string;
    type: "text" | "image" | "video" | "file" | "audio";
    mediaUrl?: string; // For cloudinary links
    readBy: Types.ObjectId[]; // Array of user IDs who have read the message
    createdAt: Date;
    updatedAt: Date;
}

export type MessageDocument = Document<Types.ObjectId> & IMessage;

const messageSchema = new Schema<MessageDocument>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: {  type: String, required: true },
        type: { type: String, enum: ["text", "image", "video", "file", "audio"], default: "text" },
        mediaUrl: { type: String },
        readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

// Add index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default model<MessageDocument>("Message", messageSchema);