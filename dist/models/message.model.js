"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    conversationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    type: { type: String, enum: ["text", "image", "video", "file", "audio", "voice"], default: "text" },
    mediaUrl: { type: String },
    readBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
// Add index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
exports.default = (0, mongoose_1.model)("Message", messageSchema);
