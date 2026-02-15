"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const conversationSchema = new mongoose_1.Schema({
    participants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    lastMessage: { type: mongoose_1.Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true });
// Add index for faster queries
conversationSchema.index({ participants: 1 });
exports.default = (0, mongoose_1.model)("Conversation", conversationSchema);
